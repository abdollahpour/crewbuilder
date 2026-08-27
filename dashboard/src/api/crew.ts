import {
  Configuration,
  DefaultApi,
  ResponseError,
  type CrewInput,
  type CrewResponse,
} from '../generated/api/crew'
import {
  crewFromResponse,
  type Crew,
  type NewCrewInput,
  type UpdateCrewInput,
} from '../types/crew'

const crewApi = new DefaultApi(new Configuration({ basePath: '' }))

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

function toCrewInput(
  input: Pick<NewCrewInput, 'model' | 'role' | 'goal' | 'backstory' | 'agents'>,
): CrewInput {
  return {
    model: input.model.trim(),
    role: input.role.trim(),
    goal: input.goal.trim(),
    backstory: input.backstory.trim(),
    agents: input.agents,
  }
}

function toCrew(data: CrewResponse): Crew {
  return crewFromResponse({
    name: data.name,
    model: data.model,
    role: data.role,
    goal: data.goal,
    backstory: data.backstory,
    agents: data.agents,
    updated_at: data.updatedAt?.toISOString(),
  })
}

export async function fetchCrews(): Promise<Crew[]> {
  const data = await apiCall(() => crewApi.listCrews())
  return data.crews.map(toCrew)
}

export async function createCrew(input: NewCrewInput): Promise<Crew> {
  const name = input.name.trim()
  const crewInput = toCrewInput(input)

  await apiCall(() => crewApi.createCrew({ name, crewInput }))

  return crewFromResponse({
    name,
    model: crewInput.model,
    role: crewInput.role,
    goal: crewInput.goal,
    backstory: crewInput.backstory,
    agents: crewInput.agents,
  })
}

export async function updateCrew(id: string, input: UpdateCrewInput): Promise<Crew> {
  const crewInput = toCrewInput(input)

  await apiCall(() =>
    crewApi.updateCrew({
      name: id,
      crewInput,
    }),
  )

  return crewFromResponse({
    name: id,
    model: crewInput.model,
    role: crewInput.role,
    goal: crewInput.goal,
    backstory: crewInput.backstory,
    agents: crewInput.agents,
  })
}

export async function deleteCrew(id: string): Promise<void> {
  await apiCall(() => crewApi.deleteCrew({ name: id }))
}
