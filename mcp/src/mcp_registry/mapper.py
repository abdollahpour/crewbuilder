from __future__ import annotations

import json
from typing import Any

from fastapi import HTTPException

from .generated.api.models import (
    CallToolResult,
    McpInput,
    McpListResponse,
    McpNameResponse,
    McpServerConfig,
    McpTool,
    McpToolListResponse,
    McpUsageResponse,
)
from .generated.db.models import Mcp


def mcp_input_to_db(body: McpInput) -> str:
    return json.dumps(body.model_dump(exclude_none=True))


def mcp_to_config(mcp: Mcp) -> McpServerConfig:
    return McpServerConfig.model_validate(mcp.config or {})


def mcps_to_list_response(rows: list[Mcp]) -> McpListResponse:
    return McpListResponse(mcpServers={row.name: mcp_to_config(row) for row in rows})


def mcp_name_to_response(name: str) -> McpNameResponse:
    return McpNameResponse(name=name)


def mcp_connection(mcp: Mcp) -> tuple[str, dict[str, str] | None]:
    config = mcp.config or {}
    url = config.get("url")
    if not url:
        raise HTTPException(400, "Server config missing url")
    headers = config.get("headers")
    return url, headers


def tools_to_list_response(tools: list[dict[str, Any]]) -> McpToolListResponse:
    return McpToolListResponse(
        tools=[
            McpTool(
                name=tool["name"],
                description=tool.get("description"),
                input_schema=tool.get("input_schema") or {},
            )
            for tool in tools
        ]
    )


def call_result_to_response(result: dict[str, Any]) -> CallToolResult:
    return CallToolResult.model_validate(result)


def usage_to_response(agents: list[str], skills: list[str]) -> McpUsageResponse:
    return McpUsageResponse(agents=agents, skills=skills)
