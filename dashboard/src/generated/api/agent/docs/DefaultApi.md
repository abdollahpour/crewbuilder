# DefaultApi

All URIs are relative to *http://localhost:8003*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createAgent**](DefaultApi.md#createagent) | **POST** /api/v1/agents/{name} | Create an agent |
| [**deleteAgent**](DefaultApi.md#deleteagent) | **DELETE** /api/v1/agents/{name} | Delete an agent |
| [**getAgent**](DefaultApi.md#getagent) | **GET** /api/v1/agents/{name} | Get an agent by name |
| [**getAgentUsage**](DefaultApi.md#getagentusage) | **GET** /api/v1/agents/{name}/usage | List crews that use an agent |
| [**listAgents**](DefaultApi.md#listagents) | **GET** /api/v1/agents | List all agents |
| [**listKnowledgeUsage**](DefaultApi.md#listknowledgeusage) | **GET** /api/v1/agents/usage/knowledge/{knowledge_name} | List agents that reference a knowledge source |
| [**listMcpUsage**](DefaultApi.md#listmcpusage) | **GET** /api/v1/agents/usage/mcp/{mcp_name} | List agents that reference an MCP server |
| [**listSkillUsage**](DefaultApi.md#listskillusage) | **GET** /api/v1/agents/usage/skill/{skill_name} | List agents that reference a skill |
| [**probe**](DefaultApi.md#probe) | **GET** /probe | Check service and database health |
| [**updateAgent**](DefaultApi.md#updateagent) | **PUT** /api/v1/agents/{name} | Replace an agent |



## createAgent

> AgentNameResponse createAgent(name, agentInput)

Create an agent

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CreateAgentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // AgentInput
    agentInput: ...,
  } satisfies CreateAgentRequest;

  try {
    const data = await api.createAgent(body);
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
| **agentInput** | [AgentInput](AgentInput.md) |  | |

### Return type

[**AgentNameResponse**](AgentNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Agent created |  -  |
| **409** | Agent already exists |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteAgent

> deleteAgent(name)

Delete an agent

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DeleteAgentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies DeleteAgentRequest;

  try {
    const data = await api.deleteAgent(body);
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
| **204** | Agent deleted |  -  |
| **404** | Agent not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **409** | Agent is still referenced by crews |  -  |
| **502** | Crew registry request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAgent

> AgentResponse getAgent(name)

Get an agent by name

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetAgentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies GetAgentRequest;

  try {
    const data = await api.getAgent(body);
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

[**AgentResponse**](AgentResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Agent found |  -  |
| **404** | Agent not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAgentUsage

> AgentUsageResponse getAgentUsage(name)

List crews that use an agent

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetAgentUsageRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies GetAgentUsageRequest;

  try {
    const data = await api.getAgentUsage(body);
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

[**AgentUsageResponse**](AgentUsageResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Crew names that reference the agent |  -  |
| **404** | Agent not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **502** | Crew registry request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listAgents

> AgentListResponse listAgents()

List all agents

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListAgentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.listAgents();
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

[**AgentListResponse**](AgentListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Agents ordered by name |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listKnowledgeUsage

> ReferenceListResponse listKnowledgeUsage(knowledgeName)

List agents that reference a knowledge source

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListKnowledgeUsageRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    knowledgeName: knowledgeName_example,
  } satisfies ListKnowledgeUsageRequest;

  try {
    const data = await api.listKnowledgeUsage(body);
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
| **knowledgeName** | `string` |  | [Defaults to `undefined`] |

### Return type

[**ReferenceListResponse**](ReferenceListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Agent names that include the knowledge source |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listMcpUsage

> ReferenceListResponse listMcpUsage(mcpName)

List agents that reference an MCP server

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListMcpUsageRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    mcpName: mcpName_example,
  } satisfies ListMcpUsageRequest;

  try {
    const data = await api.listMcpUsage(body);
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
| **mcpName** | `string` |  | [Defaults to `undefined`] |

### Return type

[**ReferenceListResponse**](ReferenceListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Agent names that include the MCP server |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listSkillUsage

> ReferenceListResponse listSkillUsage(skillName)

List agents that reference a skill

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListSkillUsageRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    skillName: skillName_example,
  } satisfies ListSkillUsageRequest;

  try {
    const data = await api.listSkillUsage(body);
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
| **skillName** | `string` |  | [Defaults to `undefined`] |

### Return type

[**ReferenceListResponse**](ReferenceListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Agent names that include the skill |  -  |

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


## updateAgent

> AgentNameResponse updateAgent(name, agentInput)

Replace an agent

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { UpdateAgentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // AgentInput
    agentInput: ...,
  } satisfies UpdateAgentRequest;

  try {
    const data = await api.updateAgent(body);
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
| **agentInput** | [AgentInput](AgentInput.md) |  | |

### Return type

[**AgentNameResponse**](AgentNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Agent updated |  -  |
| **404** | Agent not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

