import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import urlopen

from fastapi import HTTPException

from app.schemas import Agent, Crew, Knowledge, McpServer, Skill
from app.settings import settings


def _get_json(url: str) -> dict:
    try:
        with urlopen(url, timeout=10) as response:
            return json.loads(response.read().decode())
    except HTTPError as exc:
        if exc.code == 404:
            raise HTTPException(404, f"Resource not found: {url}") from exc
        raise HTTPException(502, f"Registry request failed: {url} ({exc.code})") from exc
    except URLError as exc:
        raise HTTPException(502, f"Registry unavailable: {url}") from exc


def fetch_crew(name: str) -> Crew:
    encoded = quote(name, safe="")
    return Crew.model_validate(_get_json(f"{settings.crew_service_url}/api/v1/crews/{encoded}"))


def fetch_agent(name: str) -> Agent:
    encoded = quote(name, safe="")
    return Agent.model_validate(_get_json(f"{settings.agent_service_url}/api/v1/agents/{encoded}"))


def fetch_skill(name: str) -> Skill:
    encoded = quote(name, safe="")
    return Skill.model_validate(_get_json(f"{settings.skill_service_url}/api/v1/skills/{encoded}"))


def fetch_knowledge(name: str) -> Knowledge:
    encoded = quote(name, safe="")
    return Knowledge.model_validate(
        _get_json(f"{settings.knowledge_service_url}/api/v1/knowledge/{encoded}")
    )


def fetch_mcp(name: str) -> McpServer:
    encoded = quote(name, safe="")
    config = _get_json(f"{settings.mcp_service_url}/api/v1/mcps/{encoded}")
    return McpServer(name=name, config=config)
