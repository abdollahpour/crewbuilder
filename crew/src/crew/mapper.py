from __future__ import annotations

import json
from datetime import datetime, timezone

from .generated.api.models import (
    CrewInput,
    CrewListResponse,
    CrewNameResponse,
    CrewResponse,
    ReferenceListResponse,
)
from .generated.db.models import Crew


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


def crew_to_response(crew: Crew) -> CrewResponse:
    return CrewResponse(
        name=crew.name,
        model=crew.model,
        role=crew.role,
        goal=crew.goal,
        backstory=crew.backstory,
        agents=crew.agents or [],
        updated_at=ensure_aware(crew.updated_at),
    )


def crews_to_list_response(crews: list[Crew]) -> CrewListResponse:
    return CrewListResponse(crews=[crew_to_response(crew) for crew in crews])


def crew_input_to_db(body: CrewInput) -> dict[str, str]:
    return {
        "agents": json.dumps(normalize_names(body.agents)),
    }


def crew_name_to_response(name: str) -> CrewNameResponse:
    return CrewNameResponse(name=name)


def names_to_reference_list(names: list[str]) -> ReferenceListResponse:
    return ReferenceListResponse(references=names)
