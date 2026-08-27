from __future__ import annotations

from fastapi import HTTPException

from .generated.api.models import (
    ProbeOk,
    ReferenceListResponse,
    SkillInput,
    SkillListResponse,
    SkillNameResponse,
    SkillResponse,
    SkillUsageResponse,
    ToolListResponse,
)
from .database import engine
from .generated.db import Querier
from .mapper import (
    names_to_reference_list,
    skill_input_to_db,
    skill_name_to_response,
    skill_to_response,
    skills_to_list_response,
    tools_to_list_response,
    usage_to_response,
)
from .tools_catalog import list_available_tools
from .usage_client import fetch_skill_usage, format_skill_usage_error


def list_skills() -> SkillListResponse:
    with engine.connect() as connection:
        rows = list(Querier(connection).list_skills())
    return skills_to_list_response(rows)


def list_tools() -> ToolListResponse:
    return tools_to_list_response(list_available_tools())


def list_knowledge_usage(knowledge_name: str) -> ReferenceListResponse:
    with engine.connect() as connection:
        names = list(
            Querier(connection).list_skill_names_for_knowledge(
                knowledge_name=knowledge_name
            )
        )
    return names_to_reference_list(names)


def list_mcp_usage(mcp_name: str) -> ReferenceListResponse:
    with engine.connect() as connection:
        names = list(Querier(connection).list_skill_names_for_mcp(mcp_name=mcp_name))
    return names_to_reference_list(names)


def get_skill(name: str) -> SkillResponse:
    with engine.connect() as connection:
        skill = Querier(connection).get_skill(name=name)
    if not skill:
        raise HTTPException(404, "Skill not found")
    return skill_to_response(skill)


def create_skill(name: str, body: SkillInput) -> SkillNameResponse:
    with engine.begin() as connection:
        created = Querier(connection).create_skill(
            name=name,
            description=body.description,
            skill_md=body.skill_md,
            **skill_input_to_db(body),
        )
    if created is None:
        raise HTTPException(409, "Skill already exists")
    return skill_name_to_response(name)


def update_skill(name: str, body: SkillInput) -> SkillNameResponse:
    with engine.begin() as connection:
        updated = Querier(connection).update_skill(
            name=name,
            description=body.description,
            skill_md=body.skill_md,
            **skill_input_to_db(body),
        )
    if updated is None:
        raise HTTPException(404, "Skill not found")
    return skill_name_to_response(name)


def delete_skill(name: str) -> None:
    usage = fetch_skill_usage(name)
    if usage["agents"]:
        raise HTTPException(409, format_skill_usage_error(usage))
    with engine.begin() as connection:
        deleted = Querier(connection).delete_skill(name=name)
    if deleted is None:
        raise HTTPException(404, "Skill not found")


def get_skill_usage(name: str) -> SkillUsageResponse:
    with engine.connect() as connection:
        skill = Querier(connection).get_skill(name=name)
    if not skill:
        raise HTTPException(404, "Skill not found")
    usage = fetch_skill_usage(name)
    return usage_to_response(usage["agents"])


def probe() -> ProbeOk:
    with engine.connect() as connection:
        Querier(connection).check_database()
    return ProbeOk(service="ok", database="ok")
