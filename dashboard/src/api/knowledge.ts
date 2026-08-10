import {
  knowledgeFromResponse,
  type Knowledge,
  type KnowledgeUsage,
  type NewKnowledgeInput,
  type UpdateKnowledgeInput,
} from '../types/knowledge'

const KNOWLEDGE_API_BASE = '/api/v1/knowledge'

type KnowledgeResponse = {
  knowledge: Array<{
    name: string
    content: string
    updated_at?: string
  }>
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`

    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) {
        message = body.detail
      }
    } catch {
      // ignore non-JSON error bodies
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function knowledgePath(name: string) {
  return `${KNOWLEDGE_API_BASE}/${encodeURIComponent(name)}`
}

function knowledgeBody(input: Pick<NewKnowledgeInput, 'content'>) {
  return {
    content: input.content,
  }
}

export async function fetchKnowledge(): Promise<Knowledge[]> {
  const data = await apiRequest<KnowledgeResponse>(KNOWLEDGE_API_BASE)
  return data.knowledge.map(knowledgeFromResponse)
}

export async function createKnowledge(
  input: NewKnowledgeInput,
): Promise<Knowledge> {
  const name = input.name.trim()

  await apiRequest<{ name: string }>(knowledgePath(name), {
    method: 'POST',
    body: JSON.stringify(knowledgeBody(input)),
  })

  return knowledgeFromResponse({
    name,
    content: input.content,
  })
}

export async function updateKnowledge(
  id: string,
  input: UpdateKnowledgeInput,
): Promise<Knowledge> {
  const body = knowledgeBody(input)

  await apiRequest<{ name: string }>(knowledgePath(id), {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  return knowledgeFromResponse({
    name: id,
    content: body.content,
  })
}

export async function fetchKnowledgeUsage(name: string): Promise<KnowledgeUsage> {
  return apiRequest<KnowledgeUsage>(
    `${KNOWLEDGE_API_BASE}/${encodeURIComponent(name)}/usage`,
  )
}

export async function deleteKnowledge(id: string): Promise<void> {
  await apiRequest<void>(knowledgePath(id), { method: 'DELETE' })
}
