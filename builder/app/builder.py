import fnmatch
import io
import json
import os
import zipfile
from pathlib import Path

from app.agent_deps import resolve_agent_effective_deps
from app.knowledge_builder import collect_knowledge_files
from app.registry import fetch_agent, fetch_mcp
from app.schemas import Crew
from app.skills_builder import collect_skill_files

CREW_DIR = Path(__file__).resolve().parent.parent
TEMPLATE_DIR = CREW_DIR / "template"
CREW_TEMPLATE_PATH = TEMPLATE_DIR / "crew.jsonc"
AGENT_TEMPLATE_PATH = TEMPLATE_DIR / "agents" / "agent.jsonc"
COORDINATOR_TEMPLATE_PATH = TEMPLATE_DIR / "agents" / "coordinator.jsonc"
RENDERED_TEMPLATE_FILES = frozenset(
    {"crew.jsonc", "agents/agent.jsonc", "agents/coordinator.jsonc"}
)


def _json_string(value: str) -> str:
    return json.dumps(value)[1:-1]


def _jsonc_optional_list(key: str, values: list | None, *, example: str) -> str:
    if values:
        return f'"{key}": {json.dumps(values)},'
    return f'// "{key}": {example},'


def _render_jsonc_template(path: Path, replacements: dict[str, str]) -> str:
    if not path.is_file():
        raise FileNotFoundError(f"Template not found: {path}")

    rendered = path.read_text(encoding="utf-8")
    for token, value in replacements.items():
        if token not in rendered:
            raise ValueError(f"{path.name} template missing placeholder {token}")
        rendered = rendered.replace(token, value)

    return rendered if rendered.endswith("\n") else rendered + "\n"


def _render_crew_jsonc(crew: Crew, agent_names: list[str]) -> str:
    return _render_jsonc_template(
        CREW_TEMPLATE_PATH,
        {
            "{{CREW_NAME}}": _json_string(f"{crew.name} Crew"),
            "{{AGENTS}}": json.dumps(agent_names),
        },
    )


def _render_agent_jsonc(
    *,
    role: str,
    goal: str,
    backstory: str,
    llm: str,
    tools: list[str],
    mcps: list[str | dict] | None = None,
    skills: list[str] | None = None,
) -> str:
    return _render_jsonc_template(
        AGENT_TEMPLATE_PATH,
        {
            "{{ROLE}}": _json_string(role),
            "{{GOAL}}": _json_string(goal),
            "{{BACKSTORY}}": _json_string(backstory),
            "{{LLM}}": _json_string(llm),
            "{{TOOLS}}": json.dumps(tools),
            "{{MCPS}}": _jsonc_optional_list("mcps", mcps, example="[]"),
            "{{SKILLS}}": _jsonc_optional_list(
                "skills", skills, example='["./skills/my-skill"]'
            ),
        },
    )


def _render_coordinator_jsonc(
    *,
    role: str,
    goal: str,
    backstory: str,
    llm: str,
) -> str:
    return _render_jsonc_template(
        COORDINATOR_TEMPLATE_PATH,
        {
            "{{ROLE}}": _json_string(role),
            "{{GOAL}}": _json_string(goal),
            "{{BACKSTORY}}": _json_string(backstory),
            "{{LLM}}": _json_string(llm),
        },
    )


def _inline_mcp_config(config: dict) -> str | dict:
    if "command" in config:
        entry: dict = {"command": config["command"]}
        if args := config.get("args"):
            entry["args"] = args
        if env := config.get("env"):
            entry["env"] = env
        if env_file := config.get("envFile"):
            entry["envFile"] = env_file
        return entry

    url = config.get("url", "")
    headers = config.get("headers")
    if url and not headers:
        return url
    if url:
        entry: dict = {"url": url}
        if headers:
            entry["headers"] = headers
        return entry

    return config


def _resolve_tool_reference(tool_name: str) -> str:
    if tool_name == "HttpCallTool":
        return "tools.http_call_tool:HttpCallTool"
    return f"crewai_tools:{tool_name}"


def _resolve_agent_tools(tool_names: list[str]) -> list[str]:
    return [_resolve_tool_reference(name) for name in tool_names]


def _resolve_agent_mcps(mcp_names: list[str]) -> list[str | dict]:
    return [_inline_mcp_config(fetch_mcp(name).config) for name in mcp_names]


def build_crewai_config(crew: Crew) -> dict[str, str]:
    if not crew.agents:
        raise ValueError("Crew must have at least one agent to build a crew")

    agent_names: list[str] = []
    agent_roster: list[str] = []
    files: dict[str, str] = {}

    for agent_name in crew.agents:
        agent = fetch_agent(agent_name)
        agent_names.append(agent_name)
        agent_roster.append(
            f"- **{agent_name}** ({agent.role.strip()}): {agent.goal.strip()}"
        )

        tool_names, mcp_names, knowledge = resolve_agent_effective_deps(agent)
        tools: list[str] = _resolve_agent_tools(tool_names)
        if knowledge:
            tools.append("tools.knowledge_search:KnowledgeSearchTool")

        files[f"agents/{agent_name}.jsonc"] = _render_agent_jsonc(
            role=agent.role.strip(),
            goal=agent.goal.strip(),
            backstory=agent.backstory.strip(),
            llm=agent.model or crew.model,
            tools=tools,
            mcps=_resolve_agent_mcps(mcp_names) if mcp_names else None,
            skills=[f"./skills/{name}" for name in agent.skills]
            if agent.skills
            else None,
        )

    files["crew.jsonc"] = _render_crew_jsonc(crew, agent_names)

    files["agents/coordinator.jsonc"] = _render_coordinator_jsonc(
        role=crew.role.strip(),
        goal=crew.goal.strip(),
        backstory="\n".join(
            [
                crew.backstory.strip(),
                "",
                "## Team roster",
                *agent_roster,
            ]
        ).strip(),
        llm=crew.model,
    )

    return files


def _gitignore_patterns() -> tuple[str, ...]:
    gitignore = TEMPLATE_DIR / ".gitignore"
    if not gitignore.is_file():
        return ()

    patterns: list[str] = []
    for raw_line in gitignore.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        patterns.append(line)
    return tuple(patterns)


def _is_gitignored(relative: Path, patterns: tuple[str, ...]) -> bool:
    if not patterns:
        return False

    posix = relative.as_posix()
    if posix in {".", ""}:
        return False

    names = {posix, relative.name, *relative.parts}
    names.discard(".")
    return any(
        fnmatch.fnmatch(name, pattern)
        for pattern in patterns
        for name in names
    )


def _collect_template_files() -> dict[str, bytes]:
    if not TEMPLATE_DIR.is_dir():
        return {}

    ignore_patterns = _gitignore_patterns()
    files: dict[str, bytes] = {}

    for dirpath, dirnames, filenames in os.walk(TEMPLATE_DIR, followlinks=False):
        current = Path(dirpath)
        relative_dir = current.relative_to(TEMPLATE_DIR)
        dirnames[:] = sorted(
            directory
            for directory in dirnames
            if not (current / directory).is_symlink()
            and not _is_gitignored(relative_dir / directory, ignore_patterns)
        )

        for filename in sorted(filenames):
            path = current / filename
            if path.is_symlink() or not path.is_file():
                continue

            arcname_path = path.relative_to(TEMPLATE_DIR)
            if _is_gitignored(arcname_path, ignore_patterns):
                continue

            arcname = arcname_path.as_posix()
            if arcname in RENDERED_TEMPLATE_FILES:
                continue
            files[arcname] = path.read_bytes()

    return files


def build_crewai_zip(crew: Crew) -> tuple[str, bytes]:
    generated_files = build_crewai_config(crew)
    template_files = _collect_template_files()
    knowledge_files = collect_knowledge_files(crew)
    skill_files = collect_skill_files(crew)

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for arcname in sorted(template_files):
            archive.writestr(arcname, template_files[arcname])

        for arcname in sorted(generated_files):
            archive.writestr(arcname, generated_files[arcname].encode("utf-8"))

        for arcname in sorted(knowledge_files):
            archive.writestr(arcname, knowledge_files[arcname])

        for arcname in sorted(skill_files):
            archive.writestr(arcname, skill_files[arcname])

    filename = f"{crew.name}.zip"
    return filename, buffer.getvalue()
