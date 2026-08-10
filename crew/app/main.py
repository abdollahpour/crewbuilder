from contextlib import contextmanager

from fastapi import APIRouter, FastAPI, HTTPException
from sqlalchemy import inspect, select, text

from app.database import SessionLocal, engine
from app.models import Base, Crew as CrewRow
from app.schemas import CrewInput, CrewResponse

Base.metadata.create_all(engine)

inspector = inspect(engine)
if "crews" in inspector.get_table_names():
    columns = {column["name"] for column in inspector.get_columns("crews")}
    if "rules" not in columns:
        with engine.begin() as conn:
            conn.execute(
                text("ALTER TABLE crews ADD COLUMN rules TEXT NOT NULL DEFAULT ''")
            )

app = FastAPI(title="Crew")
router = APIRouter(prefix="/api/v1/crews")


def normalize_names(names: list[str]) -> list[str]:
    seen: set[str] = set()
    normalized: list[str] = []

    for name in names:
        trimmed = name.strip()
        if not trimmed or trimmed in seen:
            continue
        seen.add(trimmed)
        normalized.append(trimmed)

    return normalized


def crew_to_response(crew: CrewRow) -> CrewResponse:
    return CrewResponse(
        name=crew.name,
        model=crew.model,
        rules=crew.rules,
        agents=crew.agents or [],
        updated_at=crew.updated_at,
    )


@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    finally:
        db.close()


@router.get("")
def list_crews():
    with get_db() as db:
        rows = db.scalars(select(CrewRow).order_by(CrewRow.name)).all()
        return {"crews": [crew_to_response(row).model_dump(mode="json") for row in rows]}


@router.get("/usage/agent/{agent_name}")
def list_agent_usage(agent_name: str):
    with get_db() as db:
        rows = db.scalars(
            select(CrewRow.name)
            .where(CrewRow.agents.contains([agent_name]))
            .order_by(CrewRow.name)
        ).all()
        return {"references": list(rows)}


@router.get("/{name}")
def get_crew(name: str):
    with get_db() as db:
        crew = db.get(CrewRow, name)
        if not crew:
            raise HTTPException(404, "Crew not found")

        return crew_to_response(crew).model_dump(mode="json")


@router.post("/{name}", status_code=201)
def create_crew(name: str, body: CrewInput):
    with get_db() as db:
        if db.get(CrewRow, name):
            raise HTTPException(409, "Crew already exists")

        db.add(
            CrewRow(
                name=name,
                model=body.model,
                rules=body.rules,
                agents=normalize_names(body.agents),
            )
        )

    return {"name": name}


@router.put("/{name}")
def update_crew(name: str, body: CrewInput):
    with get_db() as db:
        crew = db.get(CrewRow, name)
        if not crew:
            raise HTTPException(404, "Crew not found")

        crew.model = body.model
        crew.rules = body.rules
        crew.agents = normalize_names(body.agents)

    return {"name": name}


@router.delete("/{name}", status_code=204)
def delete_crew(name: str):
    with get_db() as db:
        crew = db.get(CrewRow, name)
        if not crew:
            raise HTTPException(404, "Crew not found")

        db.delete(crew)


app.include_router(router)
