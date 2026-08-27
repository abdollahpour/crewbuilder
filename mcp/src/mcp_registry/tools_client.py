from collections.abc import Awaitable, Callable
from typing import Any

from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client
from mcp.shared._httpx_utils import create_mcp_http_client


def format_mcp_error(exc: BaseException) -> str:
    if isinstance(exc, ExceptionGroup):
        messages = [format_mcp_error(nested) for nested in exc.exceptions]
        return "; ".join(message for message in messages if message)

    message = str(exc).strip()
    return message or type(exc).__name__


async def _with_mcp_session(
    url: str,
    headers: dict[str, str] | None,
    callback: Callable[[ClientSession], Awaitable[Any]],
) -> Any:
    async with create_mcp_http_client(headers) as http_client:
        async with streamable_http_client(url, http_client=http_client) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                return await callback(session)


def serialize_call_tool_result(result: Any) -> dict[str, Any]:
    content = [
        block.model_dump(mode="json") if hasattr(block, "model_dump") else block
        for block in result.content
    ]

    return {
        "is_error": result.is_error,
        "content": content,
        "structured_content": result.structured_content,
    }


async def fetch_mcp_tools(
    url: str,
    headers: dict[str, str] | None = None,
) -> list[dict[str, Any]]:
    async def list_tools(session: ClientSession) -> list[dict[str, Any]]:
        result = await session.list_tools()
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "input_schema": tool.input_schema,
            }
            for tool in result.tools
        ]

    return await _with_mcp_session(url, headers, list_tools)


async def call_mcp_tool(
    url: str,
    tool_name: str,
    arguments: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
) -> dict[str, Any]:
    async def invoke(session: ClientSession) -> dict[str, Any]:
        result = await session.call_tool(tool_name, arguments or {})
        return serialize_call_tool_result(result)

    return await _with_mcp_session(url, headers, invoke)
