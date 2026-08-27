FROM python:3.11-slim-bookworm AS builder
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    FASTEMBED_CACHE_PATH=/app/.cache/fastembed
RUN pip install --no-cache-dir uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY app ./app
COPY template ./template
RUN uv sync --frozen --no-dev
RUN uv run python -c "from fastembed import TextEmbedding; from app.knowledge_builder import EMBED_MODEL; TextEmbedding(model_name=EMBED_MODEL)"


FROM python:3.11-slim-bookworm AS runtime
WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FASTEMBED_CACHE_PATH=/app/.cache/fastembed
RUN groupadd --system --gid 999 app && useradd --system --uid 999 --gid app --no-log-init app
COPY --from=builder --chown=app:app /app /app
USER 999
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
