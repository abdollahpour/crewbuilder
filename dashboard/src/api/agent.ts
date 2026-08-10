import {
  agentFromResponse,
  type Agent,
  type AgentUsage,
  type NewAgentInput,
  type UpdateAgentInput,
} from '../types/agent'

const AGENT_API_BASE = '/api/v1/agents'

type AgentsResponse = {
  agents: Array<{
    name: string
    model: string
    description: string
    rules: string
    tools?: string[]
    mcps?: string[]
    skills?: string[]
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

function agentPath(name: string) {
  return `${AGENT_API_BASE}/${encodeURIComponent(name)}`
}

function agentBody(
  input: Pick<
    NewAgentInput,
    'model' | 'description' | 'rules' | 'tools' | 'mcps' | 'skills' | 'knowledge'
  >,
) {
  return {
    model: input.model.trim(),
    description: input.description.trim(),
    rules: input.rules.trim(),
    tools: input.tools,
    mcps: input.mcps,
    skills: input.skills,
    knowledge: input.knowledge,
  }
}

export async function fetchAgents(): Promise<Agent[]> {
  const data = await apiRequest<AgentsResponse>(AGENT_API_BASE)
  return data.agents.map(agentFromResponse)
}

export async function createAgent(input: NewAgentInput): Promise<Agent> {
  const name = input.name.trim()

  await apiRequest<{ name: string }>(agentPath(name), {
    method: 'POST',
    body: JSON.stringify(agentBody(input)),
  })

  return agentFromResponse({
    name,
    model: input.model.trim(),
    description: input.description.trim(),
    rules: input.rules.trim(),
    tools: input.tools,
    mcps: input.mcps,
    skills: input.skills,
    knowledge: input.knowledge,
  })
}

export async function updateAgent(id: string, input: UpdateAgentInput): Promise<Agent> {
  const body = agentBody(input)

  await apiRequest<{ name: string }>(agentPath(id), {
    method: 'PUT',
    body: JSON.stringify(body),
  })

  return agentFromResponse({
    name: id,
    model: body.model,
    description: body.description,
    rules: body.rules,
    tools: body.tools,
    mcps: body.mcps,
    skills: body.skills,
    knowledge: body.knowledge,
  })
}

export async function fetchAgentUsage(name: string): Promise<AgentUsage> {
  return apiRequest<AgentUsage>(`${agentPath(name)}/usage`)
}

export async function deleteAgent(id: string): Promise<void> {
  await apiRequest<void>(agentPath(id), { method: 'DELETE' })
}
