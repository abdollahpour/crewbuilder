import ast
import importlib.util
from functools import lru_cache
from pathlib import Path

EXTRA_TOOLS = ("HttpCallTool",)


def _crewai_tools_init_path() -> Path:
    spec = importlib.util.find_spec("crewai_tools")
    if spec is None or not spec.origin:
        raise RuntimeError("crewai_tools is not installed")
    return Path(spec.origin)


def _parse_exported_tool_names(init_path: Path) -> set[str]:
    tree = ast.parse(init_path.read_text(encoding="utf-8"))

    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id == "__all__":
                if not isinstance(node.value, ast.List):
                    continue
                return {
                    elt.value
                    for elt in node.value.elts
                    if isinstance(elt, ast.Constant)
                    and isinstance(elt.value, str)
                    and elt.value.endswith("Tool")
                }

    return set()


@lru_cache(maxsize=1)
def list_available_tools() -> list[str]:
    tools = _parse_exported_tool_names(_crewai_tools_init_path())
    tools.update(EXTRA_TOOLS)
    return sorted(tools)


def allowed_tool_names() -> frozenset[str]:
    return frozenset(list_available_tools())
