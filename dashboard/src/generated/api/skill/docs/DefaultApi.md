# DefaultApi

All URIs are relative to *http://localhost:8002*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createSkill**](DefaultApi.md#createskill) | **POST** /api/v1/skills/{name} | Create a skill |
| [**deleteSkill**](DefaultApi.md#deleteskill) | **DELETE** /api/v1/skills/{name} | Delete a skill |
| [**getSkill**](DefaultApi.md#getskill) | **GET** /api/v1/skills/{name} | Get a skill by name |
| [**getSkillUsage**](DefaultApi.md#getskillusage) | **GET** /api/v1/skills/{name}/usage | List agents that use a skill |
| [**listKnowledgeUsage**](DefaultApi.md#listknowledgeusage) | **GET** /api/v1/skills/usage/knowledge/{knowledge_name} | List skills that reference a knowledge source |
| [**listSkills**](DefaultApi.md#listskills) | **GET** /api/v1/skills | List all skills |
| [**listTools**](DefaultApi.md#listtools) | **GET** /api/v1/skills/tools | List tools that skills may require |
| [**probe**](DefaultApi.md#probe) | **GET** /probe | Check service and database health |
| [**updateSkill**](DefaultApi.md#updateskill) | **PUT** /api/v1/skills/{name} | Replace a skill |



## createSkill

> SkillNameResponse createSkill(name, skillInput)

Create a skill

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CreateSkillRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // SkillInput
    skillInput: ...,
  } satisfies CreateSkillRequest;

  try {
    const data = await api.createSkill(body);
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
| **skillInput** | [SkillInput](SkillInput.md) |  | |

### Return type

[**SkillNameResponse**](SkillNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Skill created |  -  |
| **400** | Unknown tool |  -  |
| **409** | Skill already exists |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteSkill

> deleteSkill(name)

Delete a skill

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DeleteSkillRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies DeleteSkillRequest;

  try {
    const data = await api.deleteSkill(body);
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
| **204** | Skill deleted |  -  |
| **404** | Skill not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **409** | Skill is still referenced by agents |  -  |
| **502** | Agent registry request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSkill

> SkillResponse getSkill(name)

Get a skill by name

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetSkillRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies GetSkillRequest;

  try {
    const data = await api.getSkill(body);
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

[**SkillResponse**](SkillResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Skill found |  -  |
| **404** | Skill not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSkillUsage

> SkillUsageResponse getSkillUsage(name)

List agents that use a skill

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetSkillUsageRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies GetSkillUsageRequest;

  try {
    const data = await api.getSkillUsage(body);
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

[**SkillUsageResponse**](SkillUsageResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Agent names that reference the skill |  -  |
| **404** | Skill not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **502** | Agent registry request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listKnowledgeUsage

> ReferenceListResponse listKnowledgeUsage(knowledgeName)

List skills that reference a knowledge source

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
| **200** | Skill names that include the knowledge source |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listSkills

> SkillListResponse listSkills()

List all skills

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListSkillsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.listSkills();
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

[**SkillListResponse**](SkillListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Skills ordered by name |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTools

> ToolListResponse listTools()

List tools that skills may require

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListToolsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.listTools();
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

[**ToolListResponse**](ToolListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Allowed CrewAI and extra tool names |  -  |

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


## updateSkill

> SkillNameResponse updateSkill(name, skillInput)

Replace a skill

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { UpdateSkillRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // SkillInput
    skillInput: ...,
  } satisfies UpdateSkillRequest;

  try {
    const data = await api.updateSkill(body);
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
| **skillInput** | [SkillInput](SkillInput.md) |  | |

### Return type

[**SkillNameResponse**](SkillNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Skill updated |  -  |
| **400** | Unknown tool |  -  |
| **404** | Skill not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

