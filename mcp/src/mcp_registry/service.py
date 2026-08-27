from __future__ import annotations

from fastapi import HTTPException

from .database import engine
from .generated.api.models import (
    CallToolInput,
    CallToolResult,
    McpInput,
    McpListResponse,
    McpNameResponse,
    McpServerConfig,
    McpToolListResponse,
    McpUsageResponse,
    ProbeOk,
)
from .generated.db import Querier
from .mapper import (
    call_result_to_response,
    mcp_connection,
    mcp_input_to_db,
    mcp_name_to_response,
    mcp_to_config,
    mcps_to_list_response,
    tools_to_list_response,
    usage_to_response,
)
from .tools_client import call_mcp_tool as invoke_mcp_tool
from .tools_client import fetch_mcp_tools, format_mcp_error
from .usage_client import fetch_mcp_usage, format_mcp_usage_error


def list_mcps() -> McpListResponse:
    with engine.connect() as connection:
        rows = list(Querier(connection).list_mcps())
    return mcps_to_list_response(rows)


def get_mcp(name: str) -> McpServerConfig:
    with engine.connect() as connection:
        mcp = Querier(connection).get_mcp(name=name)
    if not mcp:
        raise HTTPException(404, "Server not found")
    return mcp_to_config(mcp)


def create_mcp(name: str, body: McpInput) -> McpNameResponse:
    with engine.begin() as connection:
        created = Querier(connection).create_mcp(
            name=name,
            config=mcp_input_to_db(body),
        )
    if created is None:
        raise HTTPException(409, "Server already exists")
    return mcp_name_to_response(name)


def update_mcp(name: str, body: McpInput) -> McpNameResponse:
    with engine.begin() as connection:
        updated = Querier(connection).update_mcp(
            name=name,
            config=mcp_input_to_db(body),
        )
    if updated is None:
        raise HTTPException(404, "Server not found")
    return mcp_name_to_response(name)


def delete_mcp(name: str) -> None:
    usage = fetch_mcp_usage(name)
    if usage["agents"] or usage["skills"]:
        raise HTTPException(409, format_mcp_usage_error(usage))
    with engine.begin() as connection:
        deleted = Querier(connection).delete_mcp(name=name)
    if deleted is None:
        raise HTTPException(404, "Server not found")


def get_mcp_usage(name: str) -> McpUsageResponse:
    with engine.connect() as connection:
        mcp = Querier(connection).get_mcp(name=name)
    if not mcp:
        raise HTTPException(404, "Server not found")
    usage = fetch_mcp_usage(name)
    return usage_to_response(usage["agents"], usage["skills"])


async def list_mcp_tools(name: str) -> McpToolListResponse:
    with engine.connect() as connection:
        mcp = Querier(connection).get_mcp(name=name)
    if not mcp:
        raise HTTPException(404, "Server not found")
    url, headers = mcp_connection(mcp)
    try:
        tools = await fetch_mcp_tools(url, headers)
    except Exception as exc:
        raise HTTPException(
            502, f"Failed to connect to MCP server: {format_mcp_error(exc)}"
        ) from exc
    return tools_to_list_response(tools)


async def call_mcp_tool(name: str, tool_name: str, body: CallToolInput) -> CallToolResult:
    with engine.connect() as connection:
        mcp = Querier(connection).get_mcp(name=name)
    if not mcp:
        raise HTTPException(404, "Server not found")
    url, headers = mcp_connection(mcp)
    try:
        result = await invoke_mcp_tool(url, tool_name, body.arguments, headers)
    except Exception as exc:
        raise HTTPException(
            502, f"Failed to call MCP tool: {format_mcp_error(exc)}"
        ) from exc
    return call_result_to_response(result)


def probe() -> ProbeOk:
    with engine.connect() as connection:
        Querier(connection).check_database()
    return ProbeOk(service="ok", database="ok")
