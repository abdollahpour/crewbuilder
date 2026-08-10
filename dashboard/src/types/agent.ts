export type AgentUsage = {
  crews: string[]
}

export type Agent = {
  id: string
  name: string
  model: string
  description: string
  rules: string
  tools: string[]
  mcps: string[]
  skills: string[]
  knowledge: string[]
  updated_at?: string
}

export type NewAgentInput = {
  name: string
  model: string
  description: string
  rules: string
  tools: string[]
  mcps: string[]
  skills: string[]
  knowledge: string[]
}

export type UpdateAgentInput = Omit<NewAgentInput, 'name'>

const AGENT_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateAgentName(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return 'Name is required'
  }

  if (!AGENT_NAME_PATTERN.test(trimmed)) {
    return 'Name must use lowercase letters, numbers, and hyphens (e.g. code-reviewer)'
  }

  return null
}

export function validateAgentModel(model: string): string | null {
  if (!model.trim()) {
    return 'Model is required'
  }

  return null
}

export function validateAgentDescription(description: string): string | null {
  if (!description.trim()) {
    return 'Description is required'
  }

  return null
}

export function validateAgentRules(rules: string): string | null {
  if (!rules.trim()) {
    return 'Rules are required'
  }

  return null
}

export function validateAgentNameUnique(
  name: string,
  agents: Agent[],
  excludeId?: string,
): string | null {
  const nameError = validateAgentName(name)
  if (nameError) {
    return nameError
  }

  const trimmed = name.trim()
  const isDuplicate = agents.some((agent) => agent.name === trimmed && agent.id !== excludeId)
  if (isDuplicate) {
    return 'An agent with this name already exists'
  }

  return null
}

export function truncateText(text: string, maxLength = 160): string {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}…`
}

export function agentFromResponse(data: {
  name: string
  model: string
  description: string
  rules: string
  tools?: string[]
  mcps?: string[]
  skills?: string[]
  knowledge?: string[]
  updated_at?: string
}): Agent {
  return {
    id: data.name,
    name: data.name,
    model: data.model,
    description: data.description,
    rules: data.rules,
    tools: data.tools ?? [],
    mcps: data.mcps ?? [],
    skills: data.skills ?? [],
    knowledge: data.knowledge ?? [],
    updated_at: data.updated_at,
  }
}
