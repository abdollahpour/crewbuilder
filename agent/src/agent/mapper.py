from __future__ import annotations

import json
from datetime import datetime, timezone

from .generated.api.models import (
    AgentInput,
    AgentListResponse,
    AgentNameResponse,
    AgentResponse,
    AgentUsageResponse,
    ReferenceListResponse,
)
from .generated.db.models import Agent


def ensure_aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def normalize_names(names: list[str] | None) -> list[str]:
    seen: set[str] = set()
    normalized: list[str] = []

    for name in names or []:
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
        role=agent.role,
        goal=agent.goal,
        backstory=agent.backstory,
        tools=agent.tools or [],
        mcps=agent.mcps or [],
        skills=agent.skills or [],
        knowledge=agent.knowledge or [],
        updated_at=ensure_aware(agent.updated_at),
    )


def agents_to_list_response(agents: list[Agent]) -> AgentListResponse:
    return AgentListResponse(agents=[agent_to_response(agent) for agent in agents])


def agent_input_to_db(body: AgentInput) -> dict[str, str]:
    return {
        "tools": json.dumps(normalize_names(body.tools)),
        "mcps": json.dumps(normalize_names(body.mcps)),
        "skills": json.dumps(normalize_names(body.skills)),
        "knowledge": json.dumps(normalize_names(body.knowledge)),
    }


def agent_name_to_response(name: str) -> AgentNameResponse:
    return AgentNameResponse(name=name)


def names_to_reference_list(names: list[str]) -> ReferenceListResponse:
    return ReferenceListResponse(references=names)


def usage_to_response(crews: list[str]) -> AgentUsageResponse:
    return AgentUsageResponse(crews=crews)
