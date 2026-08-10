import {
  crewFromResponse,
  type NewCrewInput,
  type UpdateCrewInput,
  type Crew,
} from '../types/crew'

const CREW_API_BASE = '/api/v1/crews'

type CrewsResponse = {
  crews: Array<{
    name: string
    model: string
    rules: string
    agents?: string[]
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

function crewPath(name: string) {
  return `${CREW_API_BASE}/${encodeURIComponent(name)}`
}

function crewBody(input: Pick<NewCrewInput, 'model' | 'rules' | 'agents'>) {
  return {
    model: input.model.trim(),
    rules: input.rules.trim(),
    agents: input.agents,
  }
}

export async function fetchCrews(): Promise<Crew[]> {
  const data = await apiRequest<CrewsResponse>(CREW_API_BASE)
  return data.crews.map(crewFromResponse)
}

export async function createCrew(input: NewCrewInput): Promise<Crew> {
  const name = input.name.trim()

  await apiRequest<{ name: string }>(crewPath(name), {
    method: 'POST',
    body: JSON.stringify(crewBody(input)),
  })

  return crewFromResponse({
    name,
    model: input.model.trim(),
    rules: input.rules.trim(),
    agents: input.agents,
  })
}

export async function updateCrew(id: string, input: UpdateCrewInput): Promise<Crew> {
  const body = crewBody(input)

  await apiRequest<{ name: string }>(crewPath(id), {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  return crewFromResponse({
    name: id,
    model: body.model,
    rules: body.rules,
    agents: body.agents,
  })
}

export async function deleteCrew(id: string): Promise<void> {
  await apiRequest<void>(crewPath(id), { method: 'DELETE' })
}
