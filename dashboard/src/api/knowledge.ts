import {
  Configuration,
  DefaultApi,
  ResponseError,
  type KnowledgeInput,
  type KnowledgeResponse,
} from '../generated/api/knowledge'
import {
  knowledgeFromResponse,
  type Knowledge,
  type KnowledgeUsage,
  type NewKnowledgeInput,
  type UpdateKnowledgeInput,
} from '../types/knowledge'

const knowledgeApi = new DefaultApi(new Configuration({ basePath: '' }))

async function readErrorMessage(response: Response): Promise<string> {
  let message = `Request failed (${response.status})`

  try {
    const body = (await response.json()) as { detail?: unknown }
    if (typeof body.detail === 'string' && body.detail) {
      message = body.detail
    }
  } catch {
    // ignore non-JSON error bodies
  }

  return message
}

async function apiCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof ResponseError) {
      throw new Error(await readErrorMessage(error.response))
    }

    throw error
  }
}

function toKnowledgeInput(input: Pick<NewKnowledgeInput, 'content'>): KnowledgeInput {
  return {
    content: input.content,
  }
}

function toKnowledge(data: KnowledgeResponse): Knowledge {
  return knowledgeFromResponse({
    name: data.name,
    content: data.content,
    updated_at: data.updatedAt?.toISOString(),
  })
}

export async function fetchKnowledge(): Promise<Knowledge[]> {
  const data = await apiCall(() => knowledgeApi.listKnowledge())
  return data.knowledge.map(toKnowledge)
}

export async function createKnowledge(input: NewKnowledgeInput): Promise<Knowledge> {
  const name = input.name.trim()
  const knowledgeInput = toKnowledgeInput(input)

  await apiCall(() => knowledgeApi.createKnowledge({ name, knowledgeInput }))

  return knowledgeFromResponse({
    name,
    content: knowledgeInput.content,
  })
}

export async function updateKnowledge(
  id: string,
  input: UpdateKnowledgeInput,
): Promise<Knowledge> {
  const knowledgeInput = toKnowledgeInput(input)

  await apiCall(() =>
    knowledgeApi.updateKnowledge({
      name: id,
      knowledgeInput,
    }),
  )

  return knowledgeFromResponse({
    name: id,
    content: knowledgeInput.content,
  })
}

export async function fetchKnowledgeUsage(name: string): Promise<KnowledgeUsage> {
  return apiCall(() => knowledgeApi.getKnowledgeUsage({ name }))
}

export async function deleteKnowledge(id: string): Promise<void> {
  await apiCall(() => knowledgeApi.deleteKnowledge({ name: id }))
}
