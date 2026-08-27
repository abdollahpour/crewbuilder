from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException

from .generated.api.models import (
    KnowledgeInput,
    KnowledgeListResponse,
    KnowledgeNameResponse,
    KnowledgeResponse,
    KnowledgeUsageResponse,
)
from .generated.db.models import Knowledge

MAX_KNOWLEDGE_CONTENT_BYTES = 1024 * 1024


def ensure_aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def knowledge_content_to_db(body: KnowledgeInput) -> str:
    content = body.content
    if len(content.encode("utf-8")) > MAX_KNOWLEDGE_CONTENT_BYTES:
        raise HTTPException(400, "Content must be at most 1 MB")
    return content


def knowledge_to_response(knowledge: Knowledge) -> KnowledgeResponse:
    return KnowledgeResponse(
        name=knowledge.name,
        content=knowledge.content,
        updated_at=ensure_aware(knowledge.updated_at),
    )


def knowledge_to_list_response(rows: list[Knowledge]) -> KnowledgeListResponse:
    return KnowledgeListResponse(
        knowledge=[knowledge_to_response(row) for row in rows]
    )


def knowledge_name_to_response(name: str) -> KnowledgeNameResponse:
    return KnowledgeNameResponse(name=name)


def usage_to_response(agents: list[str], skills: list[str]) -> KnowledgeUsageResponse:
    return KnowledgeUsageResponse(agents=agents, skills=skills)
