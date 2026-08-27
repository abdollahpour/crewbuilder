from __future__ import annotations

from fastapi import HTTPException

from .database import engine
from .generated.api.models import (
    AgentInput,
    AgentListResponse,
    AgentNameResponse,
    AgentResponse,
    AgentUsageResponse,
    ProbeOk,
    ReferenceListResponse,
)
from .generated.db import Querier
from .mapper import (
    agent_input_to_db,
    agent_name_to_response,
    agent_to_response,
    agents_to_list_response,
    names_to_reference_list,
    usage_to_response,
)
from .usage_client import fetch_agent_usage, format_agent_usage_error


def list_agents() -> AgentListResponse:
    with engine.connect() as connection:
        rows = list(Querier(connection).list_agents())
    return agents_to_list_response(rows)


def list_mcp_usage(mcp_name: str) -> ReferenceListResponse:
    with engine.connect() as connection:
        names = list(Querier(connection).list_agent_names_for_mcp(mcp_name=mcp_name))
    return names_to_reference_list(names)


def list_skill_usage(skill_name: str) -> ReferenceListResponse:
    with engine.connect() as connection:
        names = list(
            Querier(connection).list_agent_names_for_skill(skill_name=skill_name)
        )
    return names_to_reference_list(names)


def list_knowledge_usage(knowledge_name: str) -> ReferenceListResponse:
    with engine.connect() as connection:
        names = list(
            Querier(connection).list_agent_names_for_knowledge(
                knowledge_name=knowledge_name
            )
        )
    return names_to_reference_list(names)


def get_agent(name: str) -> AgentResponse:
    with engine.connect() as connection:
        agent = Querier(connection).get_agent(name=name)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent_to_response(agent)


def create_agent(name: str, body: AgentInput) -> AgentNameResponse:
    with engine.begin() as connection:
        created = Querier(connection).create_agent(
            name=name,
            model=body.model,
            role=body.role,
            goal=body.goal,
            backstory=body.backstory,
            **agent_input_to_db(body),
        )
    if created is None:
        raise HTTPException(409, "Agent already exists")
    return agent_name_to_response(name)


def update_agent(name: str, body: AgentInput) -> AgentNameResponse:
    with engine.begin() as connection:
        updated = Querier(connection).update_agent(
            name=name,
            model=body.model,
            role=body.role,
            goal=body.goal,
            backstory=body.backstory,
            **agent_input_to_db(body),
        )
    if updated is None:
        raise HTTPException(404, "Agent not found")
    return agent_name_to_response(name)


def delete_agent(name: str) -> None:
    usage = fetch_agent_usage(name)
    if usage["crews"]:
        raise HTTPException(409, format_agent_usage_error(usage))
    with engine.begin() as connection:
        deleted = Querier(connection).delete_agent(name=name)
    if deleted is None:
        raise HTTPException(404, "Agent not found")


def get_agent_usage(name: str) -> AgentUsageResponse:
    with engine.connect() as connection:
        agent = Querier(connection).get_agent(name=name)
    if not agent:
        raise HTTPException(404, "Agent not found")
    usage = fetch_agent_usage(name)
    return usage_to_response(usage["crews"])


def probe() -> ProbeOk:
    with engine.connect() as connection:
        Querier(connection).check_database()
    return ProbeOk(service="ok", database="ok")
