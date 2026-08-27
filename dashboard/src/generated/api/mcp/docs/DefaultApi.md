# DefaultApi

All URIs are relative to *http://localhost:8004*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**callMcpTool**](DefaultApi.md#callmcptool) | **POST** /api/v1/mcps/{name}/tools/{tool_name}/call | Call a tool on an MCP server |
| [**createMcp**](DefaultApi.md#createmcp) | **POST** /api/v1/mcps/{name} | Create an MCP server |
| [**deleteMcp**](DefaultApi.md#deletemcp) | **DELETE** /api/v1/mcps/{name} | Delete an MCP server |
| [**getMcp**](DefaultApi.md#getmcp) | **GET** /api/v1/mcps/{name} | Get an MCP server by name |
| [**getMcpUsage**](DefaultApi.md#getmcpusage) | **GET** /api/v1/mcps/{name}/usage | List agents and skills that use an MCP server |
| [**listMcpTools**](DefaultApi.md#listmcptools) | **GET** /api/v1/mcps/{name}/tools | List tools exposed by an MCP server |
| [**listMcps**](DefaultApi.md#listmcps) | **GET** /api/v1/mcps | List all MCP servers |
| [**probe**](DefaultApi.md#probe) | **GET** /probe | Check service and database health |
| [**updateMcp**](DefaultApi.md#updatemcp) | **PUT** /api/v1/mcps/{name} | Replace an MCP server |



## callMcpTool

> CallToolResult callMcpTool(name, toolName, callToolInput)

Call a tool on an MCP server

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CallMcpToolRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // string
    toolName: toolName_example,
    // CallToolInput
    callToolInput: ...,
  } satisfies CallMcpToolRequest;

  try {
    const data = await api.callMcpTool(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **name** | `string` | 2–50 letters, numbers, underscores, or hyphens | [Defaults to `undefined`] |
| **toolName** | `string` |  | [Defaults to `undefined`] |
| **callToolInput** | [CallToolInput](CallToolInput.md) |  | |

### Return type

[**CallToolResult**](CallToolResult.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tool call result |  -  |
| **400** | Server config is missing a URL |  -  |
| **404** | MCP server not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **502** | Remote MCP server request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createMcp

> McpNameResponse createMcp(name, mcpInput)

Create an MCP server

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CreateMcpRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // McpInput
    mcpInput: ...,
  } satisfies CreateMcpRequest;

  try {
    const data = await api.createMcp(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **name** | `string` | 2–50 letters, numbers, underscores, or hyphens | [Defaults to `undefined`] |
| **mcpInput** | [McpInput](McpInput.md) |  | |

### Return type

[**McpNameResponse**](McpNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | MCP server created |  -  |
| **409** | MCP server already exists |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteMcp

> deleteMcp(name)

Delete an MCP server

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DeleteMcpRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies DeleteMcpRequest;

  try {
    const data = await api.deleteMcp(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **name** | `string` | 2–50 letters, numbers, underscores, or hyphens | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | MCP server deleted |  -  |
| **404** | MCP server not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **409** | MCP server is still referenced by agents or skills |  -  |
| **502** | Agent or skill registry request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMcp

> McpServerConfig getMcp(name)

Get an MCP server by name

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetMcpRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies GetMcpRequest;

  try {
    const data = await api.getMcp(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **name** | `string` | 2–50 letters, numbers, underscores, or hyphens | [Defaults to `undefined`] |

### Return type

[**McpServerConfig**](McpServerConfig.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | MCP server config found |  -  |
| **404** | MCP server not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getMcpUsage

> McpUsageResponse getMcpUsage(name)

List agents and skills that use an MCP server

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetMcpUsageRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies GetMcpUsageRequest;

  try {
    const data = await api.getMcpUsage(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **name** | `string` | 2–50 letters, numbers, underscores, or hyphens | [Defaults to `undefined`] |

### Return type

[**McpUsageResponse**](McpUsageResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Agent and skill names that reference the MCP server |  -  |
| **404** | MCP server not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **502** | Agent or skill registry request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listMcpTools

> McpToolListResponse listMcpTools(name)

List tools exposed by an MCP server

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListMcpToolsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies ListMcpToolsRequest;

  try {
    const data = await api.listMcpTools(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **name** | `string` | 2–50 letters, numbers, underscores, or hyphens | [Defaults to `undefined`] |

### Return type

[**McpToolListResponse**](McpToolListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Tools advertised by the MCP server |  -  |
| **400** | Server config is missing a URL |  -  |
| **404** | MCP server not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **502** | Remote MCP server request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listMcps

> McpListResponse listMcps()

List all MCP servers

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListMcpsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.listMcps();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**McpListResponse**](McpListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | MCP servers keyed by name |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## probe

> ProbeOk probe()

Check service and database health

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ProbeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.probe();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ProbeOk**](ProbeOk.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Service and database are reachable |  -  |
| **503** | Database is unreachable |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateMcp

> McpNameResponse updateMcp(name, mcpInput)

Replace an MCP server

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { UpdateMcpRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // McpInput
    mcpInput: ...,
  } satisfies UpdateMcpRequest;

  try {
    const data = await api.updateMcp(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **name** | `string` | 2–50 letters, numbers, underscores, or hyphens | [Defaults to `undefined`] |
| **mcpInput** | [McpInput](McpInput.md) |  | |

### Return type

[**McpNameResponse**](McpNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | MCP server updated |  -  |
| **404** | MCP server not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

