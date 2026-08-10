import re
from contextlib import contextmanager
from datetime import datetime

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select, text

from app.database import SessionLocal, engine
from app.models import Base, Skill
from app.tools_catalog import allowed_tool_names, list_available_tools
from app.usage_client import fetch_skill_usage, format_skill_usage_error

Base.metadata.create_all(engine)

with engine.connect() as connection:
    connection.execute(
        text(
            "ALTER TABLE skills ADD COLUMN IF NOT EXISTS "
            "tools_required JSONB NOT NULL DEFAULT '[]'"
        )
    )
    connection.execute(
        text(
            "ALTER TABLE skills ADD COLUMN IF NOT EXISTS "
            "mcps JSONB NOT NULL DEFAULT '[]'"
        )
    )
    connection.execute(
        text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'skills' AND column_name = 'knowledgebases'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'skills' AND column_name = 'knowledge'
                ) THEN
                    ALTER TABLE skills RENAME COLUMN knowledgebases TO knowledge;
                END IF;
            END $$;
            """
        )
    )
    connection.execute(
        text(
            "ALTER TABLE skills ADD COLUMN IF NOT EXISTS "
            "knowledge JSONB NOT NULL DEFAULT '[]'"
        )
    )
    for old_name, new_name in (
        ("skill_md_name", "name"),
        ("skill_md_description", "description"),
        ("skill_md_content", "skill_md"),
    ):
        connection.execute(
            text(
                f"""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'skills' AND column_name = '{old_name}'
                    ) THEN
                        ALTER TABLE skills RENAME COLUMN {old_name} TO {new_name};
                    END IF;
                END $$;
                """
            )
        )
    connection.commit()

allowed_tools = allowed_tool_names()

with engine.connect() as connection:
    rows = connection.execute(
        text("SELECT name, tools_required, mcps FROM skills")
    ).mappings().all()

    for row in rows:
        tools = list(row["tools_required"] or [])
        mcps = list(row["mcps"] or [])
        mcp_set = set(mcps)
        kept_tools: list[str] = []
        changed = False

        for tool in tools:
            if tool in allowed_tools:
                kept_tools.append(tool)
            elif tool not in mcp_set:
                mcps.append(tool)
                mcp_set.add(tool)
                changed = True
            else:
                changed = True

        if changed:
            connection.execute(
                text(
                    "UPDATE skills SET tools_required = :tools, mcps = :mcps "
                    "WHERE name = :name"
                ),
                {"name": row["name"], "tools": kept_tools, "mcps": mcps},
            )

    connection.commit()

app = FastAPI(title="Skill")
router = APIRouter(prefix="/api/v1/skills")

SKILL_NAME_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{2,50}$")
MAX_SKILL_MD_LENGTH = 1_000_000


def validate_skill_name(name: str) -> str:
    if not SKILL_NAME_PATTERN.match(name):
        raise HTTPException(
            400,
            "name must be 2–50 characters and contain only letters, numbers, underscores, and hyphens",
        )
    return name


@app.get("/probe")
def probe():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})

    return JSONResponse(content={"service": "ok", "database": "ok"})


class SkillInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    description: str = Field(min_length=100, max_length=500)
    skill_md: str = Field(min_length=1, max_length=MAX_SKILL_MD_LENGTH)
    tools_required: list[str] = Field(default_factory=list)
    mcps: list[str] = Field(default_factory=list)
    knowledge: list[str] = Field(default_factory=list)


class SkillResponse(BaseModel):
    name: str
    description: str
    skill_md: str
    tools_required: list[str]
    mcps: list[str]
    knowledge: list[str]
    updated_at: datetime


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


def normalize_tools_required(tools: list[str]) -> list[str]:
    allowed = allowed_tool_names()
    seen: set[str] = set()
    normalized: list[str] = []

    for tool in tools:
        trimmed = tool.strip()
        if not trimmed or trimmed in seen:
            continue
        if trimmed not in allowed:
            raise HTTPException(400, f"Unknown tool: {trimmed}")
        seen.add(trimmed)
        normalized.append(trimmed)

    return normalized


def skill_to_response(skill: Skill) -> SkillResponse:
    return SkillResponse(
        name=skill.name,
        description=skill.description,
        skill_md=skill.skill_md,
        tools_required=skill.tools_required or [],
        mcps=skill.mcps or [],
        knowledge=skill.knowledge or [],
        updated_at=skill.updated_at,
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
def list_skills():
    with get_db() as db:
        rows = db.scalars(select(Skill).order_by(Skill.name)).all()
        return {"skills": [skill_to_response(row).model_dump(mode="json") for row in rows]}


@router.get("/tools")
def list_tools():
    return {"tools": list_available_tools()}


@router.get("/usage/mcp/{mcp_name}")
def list_mcp_usage(mcp_name: str):
    with get_db() as db:
        rows = db.scalars(
            select(Skill.name)
            .where(Skill.mcps.contains([mcp_name]))
            .order_by(Skill.name)
        ).all()
        return {"references": list(rows)}


@router.get("/usage/knowledge/{knowledge_name}")
def list_knowledge_usage(knowledge_name: str):
    with get_db() as db:
        rows = db.scalars(
            select(Skill.name)
            .where(Skill.knowledge.contains([knowledge_name]))
            .order_by(Skill.name)
        ).all()
        return {"references": list(rows)}


@router.get("/{name}/usage")
def get_skill_usage(name: str):
    skill_name = validate_skill_name(name)

    with get_db() as db:
        if not db.get(Skill, skill_name):
            raise HTTPException(404, "Skill not found")

    return fetch_skill_usage(skill_name)


@router.get("/{name}")
def get_skill(name: str):
    skill_name = validate_skill_name(name)

    with get_db() as db:
        skill = db.get(Skill, skill_name)
        if not skill:
            raise HTTPException(404, "Skill not found")

        return skill_to_response(skill).model_dump(mode="json")


@router.post("/{name}", status_code=201)
def create_skill(name: str, body: SkillInput):
    skill_name = validate_skill_name(name)

    with get_db() as db:
        if db.get(Skill, skill_name):
            raise HTTPException(409, "Skill already exists")

        db.add(
            Skill(
                name=skill_name,
                description=body.description,
                skill_md=body.skill_md,
                tools_required=normalize_tools_required(body.tools_required),
                mcps=normalize_names(body.mcps),
                knowledge=normalize_names(body.knowledge),
            )
        )

    return {"name": skill_name}


@router.put("/{name}")
def update_skill(name: str, body: SkillInput):
    skill_name = validate_skill_name(name)

    with get_db() as db:
        skill = db.get(Skill, skill_name)
        if not skill:
            raise HTTPException(404, "Skill not found")

        skill.description = body.description
        skill.skill_md = body.skill_md
        skill.tools_required = normalize_tools_required(body.tools_required)
        skill.mcps = normalize_names(body.mcps)
        skill.knowledge = normalize_names(body.knowledge)

    return {"name": skill_name}


@router.delete("/{name}", status_code=204)
def delete_skill(name: str):
    skill_name = validate_skill_name(name)
    usage = fetch_skill_usage(skill_name)
    if usage["agents"]:
        raise HTTPException(409, format_skill_usage_error(usage))

    with get_db() as db:
        skill = db.get(Skill, skill_name)
        if not skill:
            raise HTTPException(404, "Skill not found")

        db.delete(skill)


app.include_router(router)
