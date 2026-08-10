import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen

from fastapi import HTTPException

from app.settings import settings


def _get_json(url: str) -> dict:
    try:
        with urlopen(url, timeout=10) as response:
            return json.loads(response.read().decode())
    except HTTPError as exc:
        raise HTTPException(502, f"Registry request failed: {url} ({exc.code})") from exc
    except URLError as exc:
        raise HTTPException(502, f"Registry unavailable: {url}") from exc


def fetch_agent_usage(agent_name: str) -> dict[str, list[str]]:
    encoded = quote(agent_name, safe="")
    crew_data = _get_json(f"{settings.crew_service_url}/api/v1/crews/usage/agent/{encoded}")
    return {
        "crews": crew_data.get("references") or [],
    }


def format_agent_usage_error(usage: dict[str, list[str]]) -> str:
    parts: list[str] = []
    if usage["crews"]:
        parts.append(f"crews: {', '.join(usage['crews'])}")
    return f"Cannot delete agent in use by {'; '.join(parts)}"
