"""
HttpCallTool - a generic HTTP client exposed to a CrewAI agent.

WHY THIS FILE LOOKS THE WAY IT DOES
------------------------------------
CrewAI (via OpenAI/Anthropic "strict" function-calling schemas) does not allow
truly open-ended objects. A field typed as `Dict[str, Any]` gets compiled to a
JSON Schema with `additionalProperties: false` and no declared properties, so
the model always sees it as "an object that must be empty" -> `{}`. That means
agents silently can never send query params, headers, or a JSON body.

The fix is to never expose a raw dict to the schema. Instead we expose a
LIST of {"key": ..., "value": ...} objects (a fully-specified schema), and
convert that list back into a dict ourselves before making the request.
This is the single most important thing to understand about this tool.
"""

from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional, Type, Union
import json
import requests


class HttpMapEntry(BaseModel):
    """One key/value pair. Agents build params/data/headers as lists of these."""
    key: str = Field(..., description="Map key, e.g. 'name' or 'Authorization'")
    value: Union[str, int, float, bool] = Field(
        ..., description="Map value, e.g. 'Berlin', 42, or true"
    )


# Accepted at runtime (not exposed directly in the schema): a real dict can
# still be passed if this tool is called from Python rather than by an LLM.
HttpMapInput = Optional[Union[List[HttpMapEntry], List[Dict[str, Any]], Dict[str, Any]]]


class HttpCallToolSchema(BaseModel):
    """
    Arguments schema shown to the agent. Every field description below is
    written for the MODEL to read, not just for humans -- be concrete and
    give real examples, since that's what drives correct tool calls.
    """

    method: str = Field(
        ...,
        description=(
            "HTTP method. Must be one of: GET, POST, PUT, PATCH, DELETE. "
            "Use GET to read/search data, POST to create, PUT/PATCH to update, "
            "DELETE to remove."
        ),
    )
    url: str = Field(
        ...,
        description=(
            "Full endpoint URL, including scheme and host, e.g. "
            "'https://api.example.com/v1/users/42'. "
            "Do NOT append '?key=value' query params here -- put them in "
            "the 'params' field instead."
        ),
    )
    params: Optional[List[HttpMapEntry]] = Field(
        default=None,
        description=(
            "Query string parameters, as a list of key/value pairs. "
            "Example: [{\"key\": \"city\", \"value\": \"Berlin\"}, "
            "{\"key\": \"limit\", \"value\": 10}]. "
            "Use this for GET filters/search terms, pagination, etc. "
            "Omit entirely (or leave null) if the request needs no query params."
        ),
    )
    data: Optional[List[HttpMapEntry]] = Field(
        default=None,
        description=(
            "JSON request body fields, as a flat list of key/value pairs "
            "(sent as application/json). Example: "
            "[{\"key\": \"title\", \"value\": \"New task\"}, "
            "{\"key\": \"done\", \"value\": false}]. "
            "Only relevant for POST/PUT/PATCH. Nested objects/arrays are not "
            "supported by this flat form -- if the API truly requires nested "
            "JSON, describe the structure in your reasoning and this tool "
            "will still send whatever flat fields it can."
        ),
    )
    headers: Optional[List[HttpMapEntry]] = Field(
        default=None,
        description=(
            "HTTP headers, as a list of key/value pairs, e.g. "
            "[{\"key\": \"Authorization\", \"value\": \"Bearer <token>\"}, "
            "{\"key\": \"Accept\", \"value\": \"application/json\"}]. "
            "Only include headers you actually need (e.g. auth tokens); "
            "Content-Type is set automatically when a JSON body is sent."
        ),
    )


def _to_map(value: HttpMapInput) -> Optional[Dict[str, Any]]:
    """Normalize params/data/headers (list-of-entries or dict) into a plain dict."""
    if value is None:
        return None
    if isinstance(value, dict):
        return value
    if isinstance(value, list):
        out: Dict[str, Any] = {}
        for item in value:
            if isinstance(item, HttpMapEntry):
                out[item.key] = item.value
            elif isinstance(item, dict) and "key" in item and "value" in item:
                out[item["key"]] = item["value"]
            else:
                raise ValueError(
                    "Each entry must look like {\"key\": \"...\", \"value\": ...}. "
                    f"Got: {item!r}"
                )
        return out or None
    raise ValueError("Expected a dict or a list of {key, value} entries.")


class HttpCallTool(BaseTool):
    # --- Discovery-critical fields -----------------------------------------
    # `name` and `description` are what the agent's planner reads when
    # deciding WHETHER to call this tool at all (before it even sees the
    # args schema). Keep them action-oriented and mention concrete
    # situations, not just a dry capability statement.
    name: str = "HttpCallTool"
    description: str = (
        "Call any HTTP/REST API over the network (GET/POST/PUT/PATCH/DELETE). "
        "Use this tool whenever a task requires fetching live data from a web "
        "API, submitting/creating a resource via an API, or updating/deleting "
        "a resource via an API -- e.g. 'look up the weather for Berlin', "
        "'create a ticket in our tracker', 'fetch this user's profile'. "
        "Do not use this tool for URLs that are just web pages to read "
        "(use a browsing/scraping tool for that); this tool is for "
        "structured API calls that expect/return JSON. "
        "Inputs: method, url, and optional params/data/headers, each given "
        "as a list of {\"key\": ..., \"value\": ...} pairs "
        "(e.g. params=[{\"key\": \"name\", \"value\": \"Berlin\"}]) -- never "
        "pass a raw JSON object for these, always the key/value list form."
    )
    args_schema: Type[BaseModel] = HttpCallToolSchema

    # How long to wait for a response before giving up. Kept as a class
    # constant (instead of buried in the method body) so it's easy to tune
    # per-deployment without hunting through the request logic.
    timeout_seconds: float = 15

    # Cap how much of a response body gets echoed back into the agent's
    # context, so one huge/binary response can't blow the token budget.
    max_response_chars: int = 8000

    def _run(
        self,
        method: str,
        url: str,
        params: HttpMapInput = None,
        data: HttpMapInput = None,
        headers: HttpMapInput = None,
    ) -> str:
        method = method.upper()
        allowed_methods = {"GET", "POST", "PUT", "PATCH", "DELETE"}
        if method not in allowed_methods:
            # Fail with a message the AGENT can act on and retry from,
            # rather than a bare exception.
            return (
                f"Invalid method '{method}'. Must be one of: "
                f"{', '.join(sorted(allowed_methods))}."
            )

        try:
            query = _to_map(params)
            body = _to_map(data)
            hdrs = _to_map(headers)
        except ValueError as exc:
            # Same idea: surface a plain-English, fixable error string
            # instead of letting a stack trace reach the agent.
            return f"Invalid arguments: {exc}"

        try:
            response = requests.request(
                method=method,
                url=url,
                params=query,
                json=body,
                headers=hdrs,
                timeout=self.timeout_seconds,
            )
        except requests.exceptions.Timeout:
            return f"HTTP request timed out after {self.timeout_seconds}s: {method} {url}"
        except requests.exceptions.ConnectionError as exc:
            return f"Could not connect to '{url}': {exc}"
        except requests.exceptions.RequestException as exc:
            return f"HTTP request failed: {exc}"

        # Prefer raising via status code check so we can still return the
        # response body (many APIs put useful error detail in a 4xx JSON body,
        # which the agent needs in order to correct its next call).
        body_text = self._format_body(response)
        if not response.ok:
            return (
                f"HTTP {response.status_code} {response.reason} for "
                f"{method} {url}. Response body: {body_text}"
            )
        return body_text

    def _format_body(self, response: requests.Response) -> str:
        """Return response body as compact JSON if possible, else raw text (truncated)."""
        try:
            text = json.dumps(response.json())
        except ValueError:
            text = response.text
        if len(text) > self.max_response_chars:
            text = text[: self.max_response_chars] + "... [truncated]"
        return text