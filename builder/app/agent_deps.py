from app.registry import fetch_skill
from app.schemas import Agent


def _unique_names(names: list[str]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []

    for name in names:
        trimmed = name.strip()
        if not trimmed or trimmed in seen:
            continue
        seen.add(trimmed)
        unique.append(trimmed)

    return unique


def resolve_agent_effective_deps(
    agent: Agent,
) -> tuple[list[str], list[str], list[str]]:
    """Union agent deps with deps declared by attached skills."""
    tools = list(agent.tools or [])
    mcps = list(agent.mcps or [])
    knowledge = list(agent.knowledge or [])

    for skill_name in agent.skills or []:
        skill = fetch_skill(skill_name)
        tools.extend(skill.tools_required or [])
        mcps.extend(skill.mcps or [])
        knowledge.extend(skill.knowledge or [])

    return _unique_names(tools), _unique_names(mcps), _unique_names(knowledge)
