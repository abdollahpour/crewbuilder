# DefaultApi

All URIs are relative to *http://localhost:8005*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createKnowledge**](DefaultApi.md#createknowledge) | **POST** /api/v1/knowledge/{name} | Create knowledge |
| [**deleteKnowledge**](DefaultApi.md#deleteknowledge) | **DELETE** /api/v1/knowledge/{name} | Delete knowledge |
| [**getKnowledge**](DefaultApi.md#getknowledge) | **GET** /api/v1/knowledge/{name} | Get knowledge by name |
| [**getKnowledgeUsage**](DefaultApi.md#getknowledgeusage) | **GET** /api/v1/knowledge/{name}/usage | List agents and skills that use knowledge |
| [**listKnowledge**](DefaultApi.md#listknowledge) | **GET** /api/v1/knowledge | List all knowledge |
| [**probe**](DefaultApi.md#probe) | **GET** /probe | Check service and database health |
| [**updateKnowledge**](DefaultApi.md#updateknowledge) | **PUT** /api/v1/knowledge/{name} | Replace knowledge |



## createKnowledge

> KnowledgeNameResponse createKnowledge(name, knowledgeInput)

Create knowledge

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CreateKnowledgeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // KnowledgeInput
    knowledgeInput: ...,
  } satisfies CreateKnowledgeRequest;

  try {
    const data = await api.createKnowledge(body);
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
| **knowledgeInput** | [KnowledgeInput](KnowledgeInput.md) |  | |

### Return type

[**KnowledgeNameResponse**](KnowledgeNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Knowledge created |  -  |
| **400** | Content is too large |  -  |
| **409** | Knowledge already exists |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteKnowledge

> deleteKnowledge(name)

Delete knowledge

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DeleteKnowledgeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies DeleteKnowledgeRequest;

  try {
    const data = await api.deleteKnowledge(body);
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
| **204** | Knowledge deleted |  -  |
| **404** | Knowledge not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **409** | Knowledge is still referenced by agents or skills |  -  |
| **502** | Agent or skill registry request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getKnowledge

> KnowledgeResponse getKnowledge(name)

Get knowledge by name

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetKnowledgeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies GetKnowledgeRequest;

  try {
    const data = await api.getKnowledge(body);
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

[**KnowledgeResponse**](KnowledgeResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Knowledge found |  -  |
| **404** | Knowledge not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getKnowledgeUsage

> KnowledgeUsageResponse getKnowledgeUsage(name)

List agents and skills that use knowledge

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetKnowledgeUsageRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies GetKnowledgeUsageRequest;

  try {
    const data = await api.getKnowledgeUsage(body);
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

[**KnowledgeUsageResponse**](KnowledgeUsageResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Agent and skill names that reference the knowledge |  -  |
| **404** | Knowledge not found |  -  |
| **422** | Path or request body failed schema validation |  -  |
| **502** | Agent or skill registry request failed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listKnowledge

> KnowledgeListResponse listKnowledge()

List all knowledge

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListKnowledgeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.listKnowledge();
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

[**KnowledgeListResponse**](KnowledgeListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Knowledge ordered by name |  -  |

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


## updateKnowledge

> KnowledgeNameResponse updateKnowledge(name, knowledgeInput)

Replace knowledge

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { UpdateKnowledgeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // KnowledgeInput
    knowledgeInput: ...,
  } satisfies UpdateKnowledgeRequest;

  try {
    const data = await api.updateKnowledge(body);
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
| **knowledgeInput** | [KnowledgeInput](KnowledgeInput.md) |  | |

### Return type

[**KnowledgeNameResponse**](KnowledgeNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Knowledge updated |  -  |
| **400** | Content is too large |  -  |
| **404** | Knowledge not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

