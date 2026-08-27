import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen

from fastapi import HTTPException

from .settings import settings


def fetch_skill_usage(skill_name: str) -> dict[str, list[str]]:
    encoded = quote(skill_name, safe="")
    url = f"{settings.agent_service_url}/api/v1/agents/usage/skill/{encoded}"
    try:
        with urlopen(url, timeout=10) as response:
            agent_data = json.loads(response.read().decode())
    except HTTPError as exc:
        raise HTTPException(502, f"Registry request failed: {url} ({exc.code})") from exc
    except URLError as exc:
        raise HTTPException(502, f"Registry unavailable: {url}") from exc
    return {
        "agents": agent_data.get("references") or [],
    }


def format_skill_usage_error(usage: dict[str, list[str]]) -> str:
    parts: list[str] = []
    if usage["agents"]:
        parts.append(f"agents: {', '.join(usage['agents'])}")
    return f"Cannot delete skill in use by {'; '.join(parts)}"