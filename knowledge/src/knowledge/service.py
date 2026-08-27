from __future__ import annotations

from fastapi import HTTPException

from .database import engine
from .generated.api.models import (
    KnowledgeInput,
    KnowledgeListResponse,
    KnowledgeNameResponse,
    KnowledgeResponse,
    KnowledgeUsageResponse,
    ProbeOk,
)
from .generated.db import Querier
from .mapper import (
    knowledge_content_to_db,
    knowledge_name_to_response,
    knowledge_to_list_response,
    knowledge_to_response,
    usage_to_response,
)
from .usage_client import fetch_knowledge_usage, format_knowledge_usage_error


def list_knowledge() -> KnowledgeListResponse:
    with engine.connect() as connection:
        rows = list(Querier(connection).list_knowledge())
    return knowledge_to_list_response(rows)


def get_knowledge(name: str) -> KnowledgeResponse:
    with engine.connect() as connection:
        knowledge = Querier(connection).get_knowledge(name=name)
    if not knowledge:
        raise HTTPException(404, "Knowledge not found")
    return knowledge_to_response(knowledge)


def create_knowledge(name: str, body: KnowledgeInput) -> KnowledgeNameResponse:
    content = knowledge_content_to_db(body)
    with engine.begin() as connection:
        created = Querier(connection).create_knowledge(name=name, content=content)
    if created is None:
        raise HTTPException(409, "Knowledge already exists")
    return knowledge_name_to_response(name)


def update_knowledge(name: str, body: KnowledgeInput) -> KnowledgeNameResponse:
    content = knowledge_content_to_db(body)
    with engine.begin() as connection:
        updated = Querier(connection).update_knowledge(name=name, content=content)
    if updated is None:
        raise HTTPException(404, "Knowledge not found")
    return knowledge_name_to_response(name)


def delete_knowledge(name: str) -> None:
    usage = fetch_knowledge_usage(name)
    if usage["agents"] or usage["skills"]:
        raise HTTPException(409, format_knowledge_usage_error(usage))
    with engine.begin() as connection:
        deleted = Querier(connection).delete_knowledge(name=name)
    if deleted is None:
        raise HTTPException(404, "Knowledge not found")


def get_knowledge_usage(name: str) -> KnowledgeUsageResponse:
    with engine.connect() as connection:
        knowledge = Querier(connection).get_knowledge(name=name)
    if not knowledge:
        raise HTTPException(404, "Knowledge not found")
    usage = fetch_knowledge_usage(name)
    return usage_to_response(usage["agents"], usage["skills"])


def probe() -> ProbeOk:
    with engine.connect() as connection:
        Querier(connection).check_database()
    return ProbeOk(service="ok", database="ok")
