export type Crew = {
  id: string
  name: string
  model: string
  rules: string
  agents: string[]
  updated_at?: string
}

export type NewCrewInput = {
  name: string
  model: string
  rules: string
  agents: string[]
}

export type UpdateCrewInput = Omit<NewCrewInput, 'name'>

const CREW_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateCrewName(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return 'Name is required'
  }

  if (!CREW_NAME_PATTERN.test(trimmed)) {
    return 'Name must use lowercase letters, numbers, and hyphens (e.g. my-crew)'
  }

  return null
}

export function validateCrewModel(model: string): string | null {
  if (!model.trim()) {
    return 'Model is required'
  }

  return null
}

export function validateCrewRules(rules: string): string | null {
  if (!rules.trim()) {
    return 'Rules are required'
  }

  return null
}

export function validateCrewNameUnique(
  name: string,
  crews: Crew[],
  excludeId?: string,
): string | null {
  const nameError = validateCrewName(name)
  if (nameError) {
    return nameError
  }

  const trimmed = name.trim()
  const isDuplicate = crews.some(
    (crew) => crew.name === trimmed && crew.id !== excludeId,
  )
  if (isDuplicate) {
    return 'A crew with this name already exists'
  }

  return null
}

export function crewFromResponse(data: {
  name: string
  model: string
  rules: string
  agents?: string[]
  updated_at?: string
}): Crew {
  return {
    id: data.name,
    name: data.name,
    model: data.model,
    rules: data.rules,
    agents: data.agents ?? [],
    updated_at: data.updated_at,
  }
}

export function truncateText(text: string, maxLength = 160): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}…`
}

