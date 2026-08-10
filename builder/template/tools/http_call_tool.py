from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional, Type, Union
import json
import requests


# CrewAI/OpenAI strict tool schemas force additionalProperties=false, so a free-form
# Dict[str, Any] arrives to the model as {}. Encode open maps as key/value lists instead.
class HttpMapEntry(BaseModel):
    key: str = Field(..., description="Map key")
    value: Union[str, int, float, bool] = Field(..., description="Map value")


HttpMapInput = Optional[Union[List[HttpMapEntry], List[Dict[str, Any]], Dict[str, Any]]]


class HttpCallToolSchema(BaseModel):
    method: str = Field(..., description="HTTP method: GET, POST, PUT, PATCH, or DELETE")
    url: str = Field(..., description="Endpoint URL without query params")
    params: Optional[List[HttpMapEntry]] = Field(
        default=None,
        description='Query params as [{"key":"name","value":"Berlin"},{"key":"count","value":1}]',
    )
    data: Optional[List[HttpMapEntry]] = Field(
        default=None,
        description="JSON body fields as a key/value list (flat objects)",
    )
    headers: Optional[List[HttpMapEntry]] = Field(
        default=None,
        description='Headers as [{"key":"Authorization","value":"Bearer ..."}]',
    )


def _to_map(value: HttpMapInput) -> Optional[Dict[str, Any]]:
    if value is None:
        return None
    if isinstance(value, dict):
        return value
    if isinstance(value, list):
        out: Dict[str, Any] = {}
        for item in value:
            if isinstance(item, HttpMapEntry):
                out[item.key] = item.value
            elif isinstance(item, dict) and "key" in item:
                out[item["key"]] = item["value"]
            else:
                raise ValueError(
                    "Map entries must look like {\"key\": \"...\", \"value\": ...}"
                )
        return out or None
    raise ValueError("Expected a dict or a list of {key, value} entries")


class HttpCallTool(BaseTool):
    name: str = "HttpCallTool"
    description: str = (
        "Makes an HTTP request to any URL. "
        "method: GET, POST, PUT, PATCH, or DELETE. "
        "url: the full endpoint URL without query params. "
        "params/data/headers: optional key/value lists "
        '(e.g. params=[{"key":"name","value":"Berlin"},{"key":"count","value":1}]).'
    )
    args_schema: Type[BaseModel] = HttpCallToolSchema

    def _run(
        self,
        method: str,
        url: str,
        params: HttpMapInput = None,
        data: HttpMapInput = None,
        headers: HttpMapInput = None,
    ) -> str:
        method = method.upper()
        try:
            query = _to_map(params)
            body = _to_map(data)
            hdrs = _to_map(headers)
        except ValueError as exc:
            return str(exc)

        try:
            response = requests.request(
                method=method,
                url=url,
                params=query,
                json=body,
                headers=hdrs,
                timeout=15,
            )
            response.raise_for_status()
            try:
                return json.dumps(response.json())
            except ValueError:
                return response.text
        except requests.exceptions.RequestException as e:
            return f"HTTP request failed: {str(e)}"
