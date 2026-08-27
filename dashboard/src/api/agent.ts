import {
  Configuration,
  DefaultApi,
  ResponseError,
  type AgentInput,
  type AgentResponse,
} from '../generated/api/agent'
import {
  agentFromResponse,
  type Agent,
  type AgentUsage,
  type NewAgentInput,
  type UpdateAgentInput,
} from '../types/agent'

const agentApi = new DefaultApi(new Configuration({ basePath: '' }))

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

function toAgentInput(
  input: Pick<
    NewAgentInput,
    'model' | 'role' | 'goal' | 'backstory' | 'tools' | 'mcps' | 'skills' | 'knowledge'
  >,
): AgentInput {
  return {
    model: input.model.trim(),
    role: input.role.trim(),
    goal: input.goal.trim(),
    backstory: input.backstory.trim(),
    tools: input.tools,
    mcps: input.mcps,
    skills: input.skills,
    knowledge: input.knowledge,
  }
}

function toAgent(data: AgentResponse): Agent {
  return agentFromResponse({
    name: data.name,
    model: data.model,
    role: data.role,
    goal: data.goal,
    backstory: data.backstory,
    tools: data.tools,
    mcps: data.mcps,
    skills: data.skills,
    knowledge: data.knowledge,
    updated_at: data.updatedAt?.toISOString(),
  })
}

export async function fetchAgents(): Promise<Agent[]> {
  const data = await apiCall(() => agentApi.listAgents())
  return data.agents.map(toAgent)
}

export async function createAgent(input: NewAgentInput): Promise<Agent> {
  const name = input.name.trim()
  const agentInput = toAgentInput(input)

  await apiCall(() => agentApi.createAgent({ name, agentInput }))

  return agentFromResponse({
    name,
    model: agentInput.model,
    role: agentInput.role,
    goal: agentInput.goal,
    backstory: agentInput.backstory,
    tools: agentInput.tools,
    mcps: agentInput.mcps,
    skills: agentInput.skills,
    knowledge: agentInput.knowledge,
  })
}

export async function updateAgent(id: string, input: UpdateAgentInput): Promise<Agent> {
  const agentInput = toAgentInput(input)

  await apiCall(() =>
    agentApi.updateAgent({
      name: id,
      agentInput,
    }),
  )

  return agentFromResponse({
    name: id,
    model: agentInput.model,
    role: agentInput.role,
    goal: agentInput.goal,
    backstory: agentInput.backstory,
    tools: agentInput.tools,
    mcps: agentInput.mcps,
    skills: agentInput.skills,
    knowledge: agentInput.knowledge,
  })
}

export async function fetchAgentUsage(name: string): Promise<AgentUsage> {
  return apiCall(() => agentApi.getAgentUsage({ name }))
}

export async function deleteAgent(id: string): Promise<void> {
  await apiCall(() => agentApi.deleteAgent({ name: id }))
}
