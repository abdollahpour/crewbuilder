
# CallToolResult


## Properties

Name | Type
------------ | -------------
`isError` | boolean
`content` | Array&lt;{ [key: string]: any; }&gt;
`structuredContent` | any

## Example

```typescript
import type { CallToolResult } from ''

// TODO: Update the object below with actual values
const example = {
  "isError": null,
  "content": null,
  "structuredContent": null,
} satisfies CallToolResult

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CallToolResult
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


