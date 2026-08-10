import {
  initialGraphifys,
  type Graphify,
  type NewGraphifyInput,
} from '../types/graphify'

const LOAD_DELAY_MS = 1200
const CREATE_DELAY_MS = 1000

let graphifysStore: Graphify[] = [...initialGraphifys]

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function fetchGraphifys(): Promise<Graphify[]> {
  await delay(LOAD_DELAY_MS)
  return graphifysStore.map((graphify) => ({ ...graphify }))
}

export async function createGraphify(input: NewGraphifyInput): Promise<Graphify> {
  await delay(CREATE_DELAY_MS)

  const graphify: Graphify = {
    id: crypto.randomUUID(),
    type: 'custom',
    uri: input.uri,
    description: input.description,
    updated_at: new Date().toISOString(),
  }

  graphifysStore = [graphify, ...graphifysStore]
  return graphify
}
