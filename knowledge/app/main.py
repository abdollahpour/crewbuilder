from contextlib import contextmanager
from datetime import datetime

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select, text

from app.database import SessionLocal, engine
from app.models import Base, Knowledge
from app.usage_client import fetch_knowledge_usage, format_knowledge_usage_error

with engine.connect() as connection:
    connection.execute(
        text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = 'knowledgebases'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = 'knowledge'
                ) THEN
                    ALTER TABLE knowledgebases RENAME TO knowledge;
                END IF;
            END $$;
            """
        )
    )
    connection.commit()

Base.metadata.create_all(engine)

app = FastAPI(title="Knowledge")
router = APIRouter(prefix="/api/v1/knowledge")

MAX_KNOWLEDGE_CONTENT_BYTES = 1024 * 1024


class KnowledgeInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content: str = Field(min_length=1)


class KnowledgeResponse(BaseModel):
    name: str
    content: str
    updated_at: datetime


def validate_content(content: str) -> str:
    if len(content.encode("utf-8")) > MAX_KNOWLEDGE_CONTENT_BYTES:
        raise HTTPException(400, "Content must be at most 1 MB")
    return content


def knowledge_to_response(knowledge: Knowledge) -> KnowledgeResponse:
    return KnowledgeResponse(
        name=knowledge.name,
        content=knowledge.content,
        updated_at=knowledge.updated_at,
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
def list_knowledge():
    with get_db() as db:
        rows = db.scalars(select(Knowledge).order_by(Knowledge.name)).all()
        return {
            "knowledge": [
                knowledge_to_response(row).model_dump(mode="json") for row in rows
            ]
        }


@router.get("/{name}/usage")
def get_knowledge_usage(name: str):
    with get_db() as db:
        if not db.get(Knowledge, name):
            raise HTTPException(404, "Knowledge not found")

    return fetch_knowledge_usage(name)


@router.get("/{name}")
def get_knowledge(name: str):
    with get_db() as db:
        knowledge = db.get(Knowledge, name)
        if not knowledge:
            raise HTTPException(404, "Knowledge not found")
        return knowledge_to_response(knowledge).model_dump(mode="json")


@router.post("/{name}", status_code=201)
def create_knowledge(name: str, body: KnowledgeInput):
    content = validate_content(body.content)

    with get_db() as db:
        if db.get(Knowledge, name):
            raise HTTPException(409, "Knowledge already exists")

        db.add(Knowledge(name=name, content=content))

    return {"name": name}


@router.put("/{name}")
def update_knowledge(name: str, body: KnowledgeInput):
    content = validate_content(body.content)

    with get_db() as db:
        knowledge = db.get(Knowledge, name)
        if not knowledge:
            raise HTTPException(404, "Knowledge not found")

        knowledge.content = content

    return {"name": name}


@router.delete("/{name}", status_code=204)
def delete_knowledge(name: str):
    usage = fetch_knowledge_usage(name)
    if usage["agents"] or usage["skills"]:
        raise HTTPException(409, format_knowledge_usage_error(usage))

    with get_db() as db:
        knowledge = db.get(Knowledge, name)
        if not knowledge:
            raise HTTPException(404, "Knowledge not found")

        db.delete(knowledge)


app.include_router(router)
