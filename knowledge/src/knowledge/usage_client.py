import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen

from fastapi import HTTPException

from .settings import settings


def _get_json(url: str) -> dict:
    try:
        with urlopen(url, timeout=10) as response:
            return json.loads(response.read().decode())
    except HTTPError as exc:
        raise HTTPException(502, f"Registry request failed: {url} ({exc.code})") from exc
    except URLError as exc:
        raise HTTPException(502, f"Registry unavailable: {url}") from exc


def fetch_knowledge_usage(knowledge_name: str) -> dict[str, list[str]]:
    encoded = quote(knowledge_name, safe="")
    agent_data = _get_json(
        f"{settings.agent_service_url}/api/v1/agents/usage/knowledge/{encoded}"
    )
    skill_data = _get_json(
        f"{settings.skill_service_url}/api/v1/skills/usage/knowledge/{encoded}"
    )
    return {
        "agents": agent_data.get("references") or [],
        "skills": skill_data.get("references") or [],
    }


def format_knowledge_usage_error(usage: dict[str, list[str]]) -> str:
    parts: list[str] = []
    if usage["agents"]:
        parts.append(f"agents: {', '.join(usage['agents'])}")
    if usage["skills"]:
        parts.append(f"skills: {', '.join(usage['skills'])}")
    return f"Cannot delete knowledge in use by {'; '.join(parts)}"
