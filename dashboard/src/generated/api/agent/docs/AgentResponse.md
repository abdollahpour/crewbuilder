
# AgentResponse


## Properties

Name | Type
------------ | -------------
`name` | string
`model` | string
`role` | string
`goal` | string
`backstory` | string
`tools` | Array&lt;string&gt;
`mcps` | Array&lt;string&gt;
`skills` | Array&lt;string&gt;
`knowledge` | Array&lt;string&gt;
`updatedAt` | Date

## Example

```typescript
import type { AgentResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "name": weather-lookup,
  "model": null,
  "role": null,
  "goal": null,
  "backstory": null,
  "tools": null,
  "mcps": null,
  "skills": null,
  "knowledge": null,
  "updatedAt": null,
} satisfies AgentResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AgentResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


