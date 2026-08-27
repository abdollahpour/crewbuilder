sync:
	uv sync

generate: generate-api generate-db

generate-api:
	PYTHONWARNINGS=ignore::FutureWarning:datamodel_code_generator.format \
	uvx --from fastapi-code-generator fastapi-codegen \
		--input openapi.yaml \
		--output src/agent/generated/api \
		--output-model-type pydantic_v2.BaseModel

generate-db:
	$(or $(wildcard .tools/sqlc),sqlc) generate

dev: sync
	PYTHONPATH=src uv run uvicorn agent.main:app --reload --port 8003
