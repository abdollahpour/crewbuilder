from contextlib import contextmanager
from datetime import datetime

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select

from app.database import SessionLocal, engine
from app.models import Base, Knowledge, MCPServer
from app.tools_client import call_mcp_tool, fetch_mcp_tools, format_mcp_error
from app.usage_client import fetch_mcp_usage, format_mcp_usage_error

Base.metadata.create_all(engine)

app = FastAPI(title="MCP")
mcp_router = APIRouter(prefix="/api/v1/mcps")

MAX_KNOWLEDGE_CONTENT_BYTES = 1024 * 1024


class KnowledgeInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content: str = Field(min_length=1)


class KnowledgeResponse(BaseModel):
    name: str
    content: str
    updated_at: datetime


def validate_knowledge_content(content: str) -> str:
    encoded = content.encode("utf-8")
    if len(encoded) > MAX_KNOWLEDGE_CONTENT_BYTES:
        raise HTTPException(400, "Content must be at most 1 MB")

    return content


def knowledge_to_response(knowledge: Knowledge) -> KnowledgeResponse:
    return KnowledgeResponse(
        name=knowledge.name,
        content=knowledge.content,
        updated_at=knowledge.updated_at,
    )


@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    finally:
        db.close()


@mcp_router.get("")
def list_servers():
    with get_db() as db:
        rows = db.scalars(select(MCPServer)).all()

        return {
            "mcpServers": {
                row.name: row.config
                for row in rows
            }
        }


class McpServerConfigInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    url: str
    headers: dict[str, str] | None = None


class CallToolInput(BaseModel):
    arguments: dict = Field(default_factory=dict)


@mcp_router.post("/{name}/tools/{tool_name}/call")
async def call_server_tool(name: str, tool_name: str, body: CallToolInput):
    with get_db() as db:
        server = db.get(MCPServer, name)
        if not server:
            raise HTTPException(404, "Server not found")

        config = server.config

    url = config.get("url")
    if not url:
        raise HTTPException(400, "Server config missing url")

    headers = config.get("headers")

    try:
        return await call_mcp_tool(url, tool_name, body.arguments, headers)
    except Exception as exc:
        raise HTTPException(502, f"Failed to call MCP tool: {format_mcp_error(exc)}") from exc


@mcp_router.get("/{name}/usage")
def get_server_usage(name: str):
    with get_db() as db:
        if not db.get(MCPServer, name):
            raise HTTPException(404, "Server not found")

    return fetch_mcp_usage(name)


@mcp_router.get("/{name}/tools")
async def list_server_tools(name: str):
    with get_db() as db:
        server = db.get(MCPServer, name)
        if not server:
            raise HTTPException(404, "Server not found")

        config = server.config

    url = config.get("url")
    if not url:
        raise HTTPException(400, "Server config missing url")

    headers = config.get("headers")

    try:
        tools = await fetch_mcp_tools(url, headers)
    except Exception as exc:
        raise HTTPException(502, f"Failed to connect to MCP server: {format_mcp_error(exc)}") from exc

    return {"tools": tools}


@mcp_router.get("/{name}")
def get_server(name: str):
    with get_db() as db:
        server = db.get(MCPServer, name)
        if not server:
            raise HTTPException(404, "Server not found")

        return server.config


@mcp_router.post("/{name}", status_code=201)
def create_server(name: str, body: McpServerConfigInput):
    config = body.model_dump(exclude_none=True)

    with get_db() as db:
        if db.get(MCPServer, name):
            raise HTTPException(409, "Server already exists")

        db.add(MCPServer(name=name, config=config))

    return {"name": name}


@mcp_router.put("/{name}")
def update_server(name: str, body: McpServerConfigInput):
    config = body.model_dump(exclude_none=True)

    with get_db() as db:
        server = db.get(MCPServer, name)
        if not server:
            raise HTTPException(404, "Server not found")

        server.config = config

    return {"name": name}


@mcp_router.delete("/{name}", status_code=204)
def delete_server(name: str):
    usage = fetch_mcp_usage(name)
    if usage["agents"] or usage["skills"]:
        raise HTTPException(409, format_mcp_usage_error(usage))

    with get_db() as db:
        server = db.get(MCPServer, name)
        if not server:
            raise HTTPException(404, "Server not found")

        db.delete(server)


app.include_router(mcp_router)


@app.get("/api/v1/knowledge")
def list_knowledge():
    with get_db() as db:
        rows = db.scalars(select(Knowledge).order_by(Knowledge.name)).all()
        return {
            "knowledge": [
                knowledge_to_response(row).model_dump(mode="json")
                for row in rows
            ]
        }


@app.get("/api/v1/knowledge/{name}")
def get_knowledge(name: str):
    with get_db() as db:
        knowledge = db.get(Knowledge, name)
        if not knowledge:
            raise HTTPException(404, "Knowledge not found")

        return knowledge_to_response(knowledge).model_dump(mode="json")


@app.post("/api/v1/knowledge/{name}", status_code=201)
def create_knowledge(name: str, body: KnowledgeInput):
    content = validate_knowledge_content(body.content)

    with get_db() as db:
        if db.get(Knowledge, name):
            raise HTTPException(409, "Knowledge already exists")

        db.add(Knowledge(name=name, content=content))

    return {"name": name}


@app.put("/api/v1/knowledge/{name}")
def update_knowledge(name: str, body: KnowledgeInput):
    content = validate_knowledge_content(body.content)

    with get_db() as db:
        knowledge = db.get(Knowledge, name)
        if not knowledge:
            raise HTTPException(404, "Knowledge not found")

        knowledge.content = content

    return {"name": name}


@app.delete("/api/v1/knowledge/{name}", status_code=204)
def delete_knowledge(name: str):
    with get_db() as db:
        knowledge = db.get(Knowledge, name)
        if not knowledge:
            raise HTTPException(404, "Knowledge not found")

        db.delete(knowledge)
