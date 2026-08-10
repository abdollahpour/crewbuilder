export type Knowledge = {
  id: string
  name: string
  content: string
  updated_at?: string
}

export type KnowledgeUsage = {
  agents: string[]
  skills: string[]
}

export type NewKnowledgeInput = {
  name: string
  content: string
}

export type UpdateKnowledgeInput = Omit<NewKnowledgeInput, 'name'>

export const MAX_KNOWLEDGE_CONTENT_BYTES = 1024 * 1024

const KNOWLEDGE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function getContentByteSize(content: string): number {
  return new TextEncoder().encode(content).length
}

export function formatContentSize(content: string): string {
  const bytes = getContentByteSize(content)
  const max = MAX_KNOWLEDGE_CONTENT_BYTES

  if (bytes < 1024) {
    return `${bytes} / ${max.toLocaleString()} bytes`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB / 1 MB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB / 1 MB`
}

export function validateKnowledgeName(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return 'Name is required'
  }

  if (!KNOWLEDGE_NAME_PATTERN.test(trimmed)) {
    return 'Name must use lowercase letters, numbers, and hyphens (e.g. product-docs)'
  }

  return null
}

export function validateKnowledgeContent(content: string): string | null {
  if (!content.trim()) {
    return 'Content is required'
  }

  if (getContentByteSize(content) > MAX_KNOWLEDGE_CONTENT_BYTES) {
    return 'Content must be at most 1 MB'
  }

  return null
}

export function validateKnowledgeNameUnique(
  name: string,
  knowledge: Knowledge[],
  excludeId?: string,
): string | null {
  const nameError = validateKnowledgeName(name)
  if (nameError) {
    return nameError
  }

  const trimmed = name.trim()
  const isDuplicate = knowledge.some(
    (item) => item.name === trimmed && item.id !== excludeId,
  )
  if (isDuplicate) {
    return 'A knowledge with this name already exists'
  }

  return null
}

export function truncateText(text: string, maxLength = 160): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}…`
}

export function knowledgeFromResponse(data: {
  name: string
  content: string
  updated_at?: string
}): Knowledge {
  return {
    id: data.name,
    name: data.name,
    content: data.content,
    updated_at: data.updated_at,
  }
}
