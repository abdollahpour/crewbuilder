import {
  Configuration,
  DefaultApi,
  ResponseError,
  type SkillInput,
  type SkillResponse,
} from '../generated/api/skill'
import {
  skillFromResponse,
  type NewSkillInput,
  type Skill,
  type SkillUsage,
  type UpdateSkillInput,
} from '../types/skill'

const skillApi = new DefaultApi(new Configuration({ basePath: '' }))

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

function toSkillInput(
  input: Pick<NewSkillInput, 'description' | 'skillMd' | 'toolsRequired' | 'knowledge'>,
): SkillInput {
  return {
    description: input.description.trim(),
    skillMd: input.skillMd.trim(),
    toolsRequired: input.toolsRequired,
    knowledge: input.knowledge,
  }
}

function toSkill(data: SkillResponse): Skill {
  return skillFromResponse({
    name: data.name,
    description: data.description,
    skill_md: data.skillMd,
    tools_required: data.toolsRequired,
    knowledge: data.knowledge,
    updated_at: data.updatedAt?.toISOString(),
  })
}

export async function fetchSkills(): Promise<Skill[]> {
  const data = await apiCall(() => skillApi.listSkills())
  return data.skills.map(toSkill)
}

export async function fetchSkillTools(): Promise<string[]> {
  const data = await apiCall(() => skillApi.listTools())
  return data.tools
}

export async function createSkill(input: NewSkillInput): Promise<Skill> {
  const name = input.name.trim()
  const skillInput = toSkillInput(input)

  await apiCall(() => skillApi.createSkill({ name, skillInput }))

  return skillFromResponse({
    name,
    description: skillInput.description,
    skill_md: skillInput.skillMd,
    tools_required: skillInput.toolsRequired,
    mcps: input.mcps,
    knowledge: skillInput.knowledge,
  })
}

export async function updateSkill(id: string, input: UpdateSkillInput): Promise<Skill> {
  const skillInput = toSkillInput(input)

  await apiCall(() =>
    skillApi.updateSkill({
      name: id,
      skillInput,
    }),
  )

  return skillFromResponse({
    name: id,
    description: skillInput.description,
    skill_md: skillInput.skillMd,
    tools_required: skillInput.toolsRequired,
    mcps: input.mcps,
    knowledge: skillInput.knowledge,
  })
}

export async function fetchSkillUsage(name: string): Promise<SkillUsage> {
  return apiCall(() => skillApi.getSkillUsage({ name }))
}

export async function deleteSkill(id: string): Promise<void> {
  await apiCall(() => skillApi.deleteSkill({ name: id }))
}
