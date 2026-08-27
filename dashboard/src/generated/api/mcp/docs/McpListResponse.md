
# McpListResponse


## Properties

Name | Type
------------ | -------------
`mcpServers` | [{ [key: string]: McpServerConfig; }](McpServerConfig.md)

## Example

```typescript
import type { McpListResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "mcpServers": {book-flight={url=https://book-flight-mcp.demo.abdollahpour.com/mcp}},
} satisfies McpListResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as McpListResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


