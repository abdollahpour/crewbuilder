export type SkillUsage = {
  agents: string[]
}

export type Skill = {
  id: string
  name: string
  description: string
  skillMd: string
  toolsRequired: string[]
  mcps: string[]
  knowledge: string[]
  updated_at?: string
}

export type NewSkillInput = {
  name: string
  description: string
  skillMd: string
  toolsRequired: string[]
  mcps: string[]
  knowledge: string[]
}

export type UpdateSkillInput = Omit<NewSkillInput, 'name'>

export function normalizeSkillNames(names: string[]): string[] {
  const seen = new Set<string>()
  const normalized: string[] = []

  for (const name of names) {
    const trimmed = name.trim()
    if (!trimmed || seen.has(trimmed)) continue

    seen.add(trimmed)
    normalized.push(trimmed)
  }

  return normalized
}

export function normalizeSkillTools(tools: string[]): string[] {
  return normalizeSkillNames(tools)
}

const SKILL_NAME_PATTERN = /^[a-zA-Z0-9_-]{2,50}$/

export const MIN_SKILL_DESCRIPTION_LENGTH = 1
export const MAX_SKILL_DESCRIPTION_LENGTH = 500
export const MAX_SKILL_MD_LENGTH = 1_000_000

export function formatSkillDescriptionSize(length: number): string {
  const max = MAX_SKILL_DESCRIPTION_LENGTH.toLocaleString()

  return `${length.toLocaleString()} / ${max} characters max`
}

export function formatSkillMdSize(length: number): string {
  const max = `${(MAX_SKILL_MD_LENGTH / 1_000_000).toFixed(0)}M`

  if (length >= 1_000_000) {
    return `${(length / 1_000_000).toFixed(2)}M / ${max} characters`
  }

  return `${length.toLocaleString()} / ${max} characters max`
}

export function validateSkillName(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return 'Name is required'
  }

  if (trimmed.length < 2 || trimmed.length > 50) {
    return 'Name must be between 2 and 50 characters'
  }

  if (!SKILL_NAME_PATTERN.test(trimmed)) {
    return 'Name must contain only letters, numbers, underscores, and hyphens (e.g. example-skill)'
  }

  return null
}

export function validateSkillDescription(description: string): string | null {
  const length = description.trim().length

  if (length < MIN_SKILL_DESCRIPTION_LENGTH) {
    return 'Description is required'
  }

  if (length > MAX_SKILL_DESCRIPTION_LENGTH) {
    return `Description must be at most ${MAX_SKILL_DESCRIPTION_LENGTH.toLocaleString()} characters`
  }

  return null
}

export function validateSkillMd(content: string): string | null {
  const trimmed = content.trim()

  if (!trimmed) {
    return 'Content is required'
  }

  if (trimmed.length > MAX_SKILL_MD_LENGTH) {
    return `Content must be at most ${MAX_SKILL_MD_LENGTH.toLocaleString()} characters`
  }

  return null
}

export function validateSkillNameUnique(
  name: string,
  skills: Skill[],
  excludeId?: string,
): string | null {
  const nameError = validateSkillName(name)
  if (nameError) {
    return nameError
  }

  const trimmed = name.trim()
  const isDuplicate = skills.some(
    (skill) => skill.name === trimmed && skill.id !== excludeId,
  )
  if (isDuplicate) {
    return 'A skill with this name already exists'
  }

  return null
}

export function truncateText(text: string, maxLength = 160): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}…`
}

export function skillFromResponse(data: {
  name: string
  description: string
  skill_md: string
  tools_required?: string[]
  mcps?: string[]
  knowledge?: string[]
  updated_at?: string
}): Skill {
  return {
    id: data.name,
    name: data.name,
    description: data.description,
    skillMd: data.skill_md,
    toolsRequired: normalizeSkillTools(data.tools_required ?? []),
    mcps: normalizeSkillNames(data.mcps ?? []),
    knowledge: normalizeSkillNames(data.knowledge ?? []),
    updated_at: data.updated_at,
  }
}
