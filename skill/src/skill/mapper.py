from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import HTTPException

from .generated.api.models import (
    ReferenceListResponse,
    SkillInput,
    SkillListResponse,
    SkillNameResponse,
    SkillResponse,
    SkillUsageResponse,
    ToolListResponse,
)
from .generated.db.models import Skill
from .tools_catalog import allowed_tool_names


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


def normalize_tools_required(tools: list[str] | None) -> list[str]:
    allowed = allowed_tool_names()
    seen: set[str] = set()
    normalized: list[str] = []

    for tool in tools or []:
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
        knowledge=skill.knowledge or [],
        updated_at=ensure_aware(skill.updated_at),
    )


def skills_to_list_response(skills: list[Skill]) -> SkillListResponse:
    return SkillListResponse(skills=[skill_to_response(skill) for skill in skills])


def skill_input_to_db(body: SkillInput) -> dict[str, str]:
    return {
        "tools_required": json.dumps(normalize_tools_required(body.tools_required)),
        "knowledge": json.dumps(normalize_names(body.knowledge)),
    }


def skill_name_to_response(name: str) -> SkillNameResponse:
    return SkillNameResponse(name=name)


def tools_to_list_response(tools: list[str]) -> ToolListResponse:
    return ToolListResponse(tools=tools)


def names_to_reference_list(names: list[str]) -> ReferenceListResponse:
    return ReferenceListResponse(references=names)


def usage_to_response(agents: list[str]) -> SkillUsageResponse:
    return SkillUsageResponse(agents=agents)
