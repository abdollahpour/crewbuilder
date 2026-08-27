from app.registry import fetch_agent, fetch_skill
from app.schemas import Skill, Crew


def _yaml_scalar(value: str) -> str:
    if not value:
        return '""'

    if "\n" in value or any(char in value for char in ':"\'\\'):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"')
        return f'"{escaped}"'

    return value


def _strip_frontmatter(content: str) -> str:
    normalized = content.lstrip("\ufeff")
    if not normalized.startswith("---"):
        return normalized

    closing = normalized.find("\n---", 3)
    if closing == -1:
        return normalized

    return normalized[closing + 4 :].lstrip("\n")


def build_skill_md(skill: Skill) -> str:
    body = _strip_frontmatter(skill.skill_md).lstrip("\n")

    lines = [
        "---",
        f"name: {skill.name}",
        f"description: {_yaml_scalar(skill.description)}",
    ]

    if skill.tools_required:
        lines.append("tools_required:")
        lines.extend(f"  - {tool}" for tool in skill.tools_required)

    if skill.mcps:
        lines.append("mcps:")
        lines.extend(f"  - {mcp}" for mcp in skill.mcps)

    if skill.knowledge:
        lines.append("knowledge:")
        lines.extend(f"  - {kb}" for kb in skill.knowledge)

    lines.append("---")
    lines.append("")

    if body:
        lines.append(body)

    return "\n".join(lines)


def skill_dir(name: str) -> str:
    """Skill directory containing SKILL.md: skills/<name>/<name>/."""
    return f"skills/{name}/{name}"


def collect_skill_files(crew: Crew) -> dict[str, bytes]:
    """Package each unique skill once under skills/<name>/<name>/SKILL.md."""
    names: list[str] = []
    seen: set[str] = set()

    for agent_name in crew.agents:
        agent = fetch_agent(agent_name)
        for skill_name in agent.skills or []:
            if skill_name in seen:
                continue
            seen.add(skill_name)
            names.append(skill_name)

    files: dict[str, bytes] = {}
    for skill_name in names:
        skill = fetch_skill(skill_name)
        arcname = f"{skill_dir(skill.name)}/SKILL.md"
        files[arcname] = build_skill_md(skill).encode("utf-8")

    return files
