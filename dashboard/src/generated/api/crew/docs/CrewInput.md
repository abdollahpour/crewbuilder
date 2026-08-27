
# CrewInput


## Properties

Name | Type
------------ | -------------
`model` | string
`role` | string
`goal` | string
`backstory` | string
`agents` | Array&lt;string&gt;

## Example

```typescript
import type { CrewInput } from ''

// TODO: Update the object below with actual values
const example = {
  "model": null,
  "role": null,
  "goal": null,
  "backstory": null,
  "agents": null,
} satisfies CrewInput

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CrewInput
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


