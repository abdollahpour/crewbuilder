from contextlib import contextmanager
from datetime import datetime

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select, text

from app.database import SessionLocal, engine
from app.models import Agent, Base
from app.usage_client import fetch_agent_usage, format_agent_usage_error

Base.metadata.create_all(engine)

with engine.connect() as connection:
    connection.execute(
        text("ALTER TABLE agents ADD COLUMN IF NOT EXISTS tools JSONB NOT NULL DEFAULT '[]'")
    )
    connection.execute(
        text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'agents' AND column_name = 'knowledgebases'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'agents' AND column_name = 'knowledge'
                ) THEN
                    ALTER TABLE agents RENAME COLUMN knowledgebases TO knowledge;
                END IF;
            END $$;
            """
        )
    )
    connection.execute(
        text(
            "ALTER TABLE agents ADD COLUMN IF NOT EXISTS "
            "knowledge JSONB NOT NULL DEFAULT '[]'"
        )
    )
    connection.commit()

app = FastAPI(title="Agent")
router = APIRouter(prefix="/api/v1/agents")


class AgentInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    model: str = Field(min_length=1)
    description: str = Field(min_length=1)
    rules: str = Field(min_length=1)
    tools: list[str] = Field(default_factory=list)
    mcps: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    knowledge: list[str] = Field(default_factory=list)


class AgentResponse(BaseModel):
    name: str
    model: str
    description: str
    rules: str
    tools: list[str]
    mcps: list[str]
    skills: list[str]
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


def agent_to_response(agent: Agent) -> AgentResponse:
    return AgentResponse(
        name=agent.name,
        model=agent.model,
        description=agent.description,
        rules=agent.rules,
        tools=agent.tools or [],
        mcps=agent.mcps or [],
        skills=agent.skills or [],
        knowledge=agent.knowledge or [],
        updated_at=agent.updated_at,
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
def list_agents():
    with get_db() as db:
        rows = db.scalars(select(Agent).order_by(Agent.name)).all()
        return {"agents": [agent_to_response(row).model_dump(mode="json") for row in rows]}


@router.get("/usage/mcp/{mcp_name}")
def list_mcp_usage(mcp_name: str):
    with get_db() as db:
        rows = db.scalars(
            select(Agent.name).where(Agent.mcps.contains([mcp_name])).order_by(Agent.name)
        ).all()
        return {"references": list(rows)}


@router.get("/usage/skill/{skill_name}")
def list_skill_usage(skill_name: str):
    with get_db() as db:
        rows = db.scalars(
            select(Agent.name).where(Agent.skills.contains([skill_name])).order_by(Agent.name)
        ).all()
        return {"references": list(rows)}


@router.get("/usage/knowledge/{knowledge_name}")
def list_knowledge_usage(knowledge_name: str):
    with get_db() as db:
        rows = db.scalars(
            select(Agent.name)
            .where(Agent.knowledge.contains([knowledge_name]))
            .order_by(Agent.name)
        ).all()
        return {"references": list(rows)}


@router.get("/{name}/usage")
def get_agent_usage(name: str):
    with get_db() as db:
        if not db.get(Agent, name):
            raise HTTPException(404, "Agent not found")

    return fetch_agent_usage(name)


@router.get("/{name}")
def get_agent(name: str):
    with get_db() as db:
        agent = db.get(Agent, name)
        if not agent:
            raise HTTPException(404, "Agent not found")

        return agent_to_response(agent).model_dump(mode="json")


@router.post("/{name}", status_code=201)
def create_agent(name: str, body: AgentInput):
    with get_db() as db:
        if db.get(Agent, name):
            raise HTTPException(409, "Agent already exists")

        db.add(
            Agent(
                name=name,
                model=body.model,
                description=body.description,
                rules=body.rules,
                tools=normalize_names(body.tools),
                mcps=normalize_names(body.mcps),
                skills=normalize_names(body.skills),
                knowledge=normalize_names(body.knowledge),
            )
        )

    return {"name": name}


@router.put("/{name}")
def update_agent(name: str, body: AgentInput):
    with get_db() as db:
        agent = db.get(Agent, name)
        if not agent:
            raise HTTPException(404, "Agent not found")

        agent.model = body.model
        agent.description = body.description
        agent.rules = body.rules
        agent.tools = normalize_names(body.tools)
        agent.mcps = normalize_names(body.mcps)
        agent.skills = normalize_names(body.skills)
        agent.knowledge = normalize_names(body.knowledge)

    return {"name": name}


@router.delete("/{name}", status_code=204)
def delete_agent(name: str):
    usage = fetch_agent_usage(name)
    if usage["crews"]:
        raise HTTPException(409, format_agent_usage_error(usage))

    with get_db() as db:
        agent = db.get(Agent, name)
        if not agent:
            raise HTTPException(404, "Agent not found")

        db.delete(agent)


app.include_router(router)
