import {
  skillFromResponse,
  type NewSkillInput,
  type Skill,
  type SkillUsage,
  type UpdateSkillInput,
} from '../types/skill'

const SKILL_API_BASE = '/api/v1/skills'

type SkillsResponse = {
  skills: Array<{
    name: string
    description: string
    skill_md: string
    tools_required?: string[]
    mcps?: string[]
    knowledge?: string[]
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

function skillPath(name: string) {
  return `${SKILL_API_BASE}/${encodeURIComponent(name)}`
}

function skillBody(
  input: Pick<
    NewSkillInput,
    'description' | 'skillMd' | 'toolsRequired' | 'mcps' | 'knowledge'
  >,
) {
  return {
    description: input.description.trim(),
    skill_md: input.skillMd.trim(),
    tools_required: input.toolsRequired,
    mcps: input.mcps,
    knowledge: input.knowledge,
  }
}

export async function fetchSkills(): Promise<Skill[]> {
  const data = await apiRequest<SkillsResponse>(SKILL_API_BASE)
  return data.skills.map(skillFromResponse)
}

type SkillToolsResponse = {
  tools: string[]
}

export async function fetchSkillTools(): Promise<string[]> {
  const data = await apiRequest<SkillToolsResponse>(`${SKILL_API_BASE}/tools`)
  return data.tools
}

export async function createSkill(input: NewSkillInput): Promise<Skill> {
  const name = input.name.trim()

  await apiRequest<{ name: string }>(skillPath(name), {
    method: 'POST',
    body: JSON.stringify(skillBody(input)),
  })

  return skillFromResponse({
    name,
    description: input.description.trim(),
    skill_md: input.skillMd.trim(),
    tools_required: input.toolsRequired,
    mcps: input.mcps,
    knowledge: input.knowledge,
  })
}

export async function updateSkill(id: string, input: UpdateSkillInput): Promise<Skill> {
  const body = skillBody(input)

  await apiRequest<{ name: string }>(skillPath(id), {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  return skillFromResponse({
    name: id,
    description: body.description,
    skill_md: body.skill_md,
    tools_required: body.tools_required,
    mcps: body.mcps,
    knowledge: body.knowledge,
  })
}

export async function fetchSkillUsage(name: string): Promise<SkillUsage> {
  return apiRequest<SkillUsage>(`${skillPath(name)}/usage`)
}

export async function deleteSkill(id: string): Promise<void> {
  await apiRequest<void>(skillPath(id), { method: 'DELETE' })
}
