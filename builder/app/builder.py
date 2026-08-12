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


def _jsonc(value: object) -> str:
    return json.dumps(value, indent=2) + "\n"


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

    crew_rules = crew.rules.strip()
    agent_names: list[str] = []
    agent_roster: list[str] = []
    files: dict[str, str] = {}

    for agent_name in crew.agents:
        agent = fetch_agent(agent_name)
        agent_names.append(agent_name)
        agent_roster.append(f"- **{agent_name}**: {agent.description.strip()}")

        tool_names, mcp_names, knowledge = resolve_agent_effective_deps(agent)
        tools: list[str] = _resolve_agent_tools(tool_names)
        if knowledge:
            tools.append("tools.knowledge_search:KnowledgeSearchTool")

        agent_config = {
            "role": agent_name,
            "goal": agent.description.strip(),
            "backstory": agent.rules.strip(),
            "llm": agent.model or crew.model,
            "tools": tools,
            "settings": {
                "verbose": True,
                "max_execution_time": 300,
            },
        }

        if mcp_names:
            agent_config["mcps"] = _resolve_agent_mcps(mcp_names)

        if agent.skills:
            agent_config["skills"] = ["skills"]

        files[f"{agent_name}.jsonc"] = _jsonc(agent_config)

    coordinator_config = {
        "role": f"{crew.name} Coordinator",
        "goal": (
            "Understand the user request, delegate work to the best-suited team "
            "members, and deliver a complete result."
        ),
        "backstory": "\n".join(
            [
                (
                    f"You coordinate the {crew.name} team. Break requests into "
                    "subtasks and assign each part to the agent whose role and skills "
                    "fit best."
                ),
                "",
                "## Crew rules",
                crew_rules,
                "",
                "## Team roster",
                *agent_roster,
            ]
        ).strip(),
        "tools": [],
        "llm": crew.model,
        "settings": {
            "verbose": True,
            "max_execution_time": 6000,
        },
    }
    files["coordinator.jsonc"] = _jsonc(coordinator_config)

    task_description = "\n".join(
        [
            "Fulfill the following user request: {topic}",
            "",
            "## Crew rules",
            crew_rules,
            "",
            "Follow the crew rules above for every decision and delegated subtask. "
            "Delegate subtasks to team members based on their roles and skills. "
            "Review their outputs and ensure the final deliverable addresses "
            "the full request.",
        ]
    ).strip()

    crew_config = {
        "name": f"{crew.name} Crew",
        "agents": agent_names,
        "tasks": [
            {
                "name": "fulfill_request",
                "description": task_description,
                "expected_output": (
                    "A complete markdown deliverable that addresses the user request. "
                    "No fenced code blocks around the whole document."
                ),
                "output_file": "output/report.md",
                "markdown": True,
            }
        ],
        "process": "hierarchical",
        "manager_agent": "coordinator",
        "verbose": True,
    }

    files["crew.jsonc"] = _jsonc(crew_config)

    return files


def _collect_template_files() -> dict[str, bytes]:
    if not TEMPLATE_DIR.is_dir():
        return {}

    files: dict[str, bytes] = {}

    for dirpath, dirnames, filenames in os.walk(TEMPLATE_DIR, followlinks=False):
        current = Path(dirpath)
        dirnames[:] = sorted(
            directory
            for directory in dirnames
            if not (current / directory).is_symlink()
        )

        for filename in sorted(filenames):
            path = current / filename
            if path.is_symlink() or not path.is_file():
                continue

            arcname = path.relative_to(TEMPLATE_DIR).as_posix()
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
