# DefaultApi

All URIs are relative to *http://localhost:8006*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createCrew**](DefaultApi.md#createcrew) | **POST** /api/v1/crews/{name} | Create a crew |
| [**deleteCrew**](DefaultApi.md#deletecrew) | **DELETE** /api/v1/crews/{name} | Delete a crew |
| [**getCrew**](DefaultApi.md#getcrew) | **GET** /api/v1/crews/{name} | Get a crew by name |
| [**listAgentUsage**](DefaultApi.md#listagentusage) | **GET** /api/v1/crews/usage/agent/{agent_name} | List crews that reference an agent |
| [**listCrews**](DefaultApi.md#listcrews) | **GET** /api/v1/crews | List all crews |
| [**probe**](DefaultApi.md#probe) | **GET** /probe | Check service and database health |
| [**updateCrew**](DefaultApi.md#updatecrew) | **PUT** /api/v1/crews/{name} | Replace a crew |



## createCrew

> CrewNameResponse createCrew(name, crewInput)

Create a crew

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { CreateCrewRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // CrewInput
    crewInput: ...,
  } satisfies CreateCrewRequest;

  try {
    const data = await api.createCrew(body);
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
| **crewInput** | [CrewInput](CrewInput.md) |  | |

### Return type

[**CrewNameResponse**](CrewNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Crew created |  -  |
| **409** | Crew already exists |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteCrew

> deleteCrew(name)

Delete a crew

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { DeleteCrewRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies DeleteCrewRequest;

  try {
    const data = await api.deleteCrew(body);
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
| **204** | Crew deleted |  -  |
| **404** | Crew not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getCrew

> CrewResponse getCrew(name)

Get a crew by name

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { GetCrewRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
  } satisfies GetCrewRequest;

  try {
    const data = await api.getCrew(body);
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

[**CrewResponse**](CrewResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Crew found |  -  |
| **404** | Crew not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listAgentUsage

> ReferenceListResponse listAgentUsage(agentName)

List crews that reference an agent

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListAgentUsageRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string
    agentName: agentName_example,
  } satisfies ListAgentUsageRequest;

  try {
    const data = await api.listAgentUsage(body);
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
| **agentName** | `string` |  | [Defaults to `undefined`] |

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
| **200** | Crew names that include the agent |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listCrews

> CrewListResponse listCrews()

List all crews

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { ListCrewsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  try {
    const data = await api.listCrews();
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

[**CrewListResponse**](CrewListResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Crews ordered by name |  -  |

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


## updateCrew

> CrewNameResponse updateCrew(name, crewInput)

Replace a crew

### Example

```ts
import {
  Configuration,
  DefaultApi,
} from '';
import type { UpdateCrewRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DefaultApi();

  const body = {
    // string | 2–50 letters, numbers, underscores, or hyphens
    name: name_example,
    // CrewInput
    crewInput: ...,
  } satisfies UpdateCrewRequest;

  try {
    const data = await api.updateCrew(body);
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
| **crewInput** | [CrewInput](CrewInput.md) |  | |

### Return type

[**CrewNameResponse**](CrewNameResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Crew updated |  -  |
| **404** | Crew not found |  -  |
| **422** | Path or request body failed schema validation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

