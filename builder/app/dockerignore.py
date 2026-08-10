import fnmatch
from pathlib import Path, PurePosixPath

DEFAULT_DOCKERIGNORE_PATTERNS = [
    ".venv",
    "__pycache__",
    "*.py[cod]",
    ".git",
    ".env",
    "*.egg-info",
    "dist",
    "build",
]


def load_dockerignore_patterns(dockerignore_path: Path) -> list[str]:
    if not dockerignore_path.is_file():
        return DEFAULT_DOCKERIGNORE_PATTERNS.copy()

    patterns: list[str] = []
    for line in dockerignore_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            patterns.append(line)
    return patterns or DEFAULT_DOCKERIGNORE_PATTERNS.copy()


def is_dockerignored(context_relative_path: str, patterns: list[str]) -> bool:
    if not patterns:
        return False

    normalized = PurePosixPath(context_relative_path).as_posix()
    filename = PurePosixPath(normalized).name
    parts = PurePosixPath(normalized).parts

    for pattern in patterns:
        if pattern.startswith("/"):
            anchored = pattern.lstrip("/")
            if fnmatch.fnmatch(normalized, anchored) or fnmatch.fnmatch(
                normalized, f"{anchored}/*"
            ):
                return True
            continue

        if fnmatch.fnmatch(normalized, pattern) or fnmatch.fnmatch(
            normalized, f"**/{pattern}"
        ):
            return True

        if fnmatch.fnmatch(filename, pattern):
            return True

        if any(fnmatch.fnmatch(part, pattern) for part in parts):
            return True

    return False
