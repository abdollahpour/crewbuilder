import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen

from fastapi import HTTPException

from .settings import settings


def fetch_agent_usage(agent_name: str) -> dict[str, list[str]]:
    encoded = quote(agent_name, safe="")
    url = f"{settings.crew_service_url}/api/v1/crews/usage/agent/{encoded}"
    try:
        with urlopen(url, timeout=10) as response:
            crew_data = json.loads(response.read().decode())
    except HTTPError as exc:
        raise HTTPException(502, f"Registry request failed: {url} ({exc.code})") from exc
    except URLError as exc:
        raise HTTPException(502, f"Registry unavailable: {url}") from exc
    return {
        "crews": crew_data.get("references") or [],
    }


def format_agent_usage_error(usage: dict[str, list[str]]) -> str:
    parts: list[str] = []
    if usage["crews"]:
        parts.append(f"crews: {', '.join(usage['crews'])}")
    return f"Cannot delete agent in use by {'; '.join(parts)}"
