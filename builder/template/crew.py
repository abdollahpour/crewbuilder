from pathlib import Path

import crewai.agent.core as agent_core
import crewai.skills.loader as skills_loader
from crewai.project import load_crew
from crewai.skills.loader import discover_skills as _discover_skills
from crewai.skills.parser import SKILL_FILENAME, load_skill_metadata

ROOT = Path(__file__).resolve().parent


def _discover_project_skills(search_path, source=None):
    """Resolve skill paths from the project root, including a skill directory itself."""
    path = Path(search_path)
    if not path.is_absolute():
        path = (ROOT / path).resolve()
    if path.is_dir() and (path / SKILL_FILENAME).is_file():
        return [load_skill_metadata(path)]
    return _discover_skills(path, source=source)


skills_loader.discover_skills = _discover_project_skills
agent_core.discover_skills = _discover_project_skills


def kickoff_crew(inputs: dict):
    crew, default_inputs = load_crew(ROOT / "crew.jsonc", agents_dir=ROOT / "agents")
    return crew.kickoff(inputs={**default_inputs, **inputs})
