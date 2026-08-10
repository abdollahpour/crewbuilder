from pathlib import Path

from crewai.project import load_crew


def kickoff_crew(inputs: dict):
    root = Path(__file__).resolve().parent
    crew, default_inputs = load_crew(root / "crew.jsonc", agents_dir=root)
    return crew.kickoff(inputs={**default_inputs, **inputs})
