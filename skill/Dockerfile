FROM python:3.11-slim-bookworm AS builder
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy
RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY src ./src
RUN uv sync --frozen --no-dev


FROM python:3.11-slim-bookworm AS runtime
WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app/src" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1
RUN groupadd --system --gid 999 app && useradd --system --uid 999 --gid app --no-log-init app
COPY --from=builder --chown=app:app /app /app
USER 999
EXPOSE 8080
CMD ["uvicorn", "skill.main:app", "--host", "0.0.0.0", "--port", "8080"]
