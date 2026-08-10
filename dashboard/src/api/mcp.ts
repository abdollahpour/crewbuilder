import {
  configFromInput,
  mcpFromEntry,
  mcpsFromConfig,
  type Mcp,
  type McpConfig,
  type McpTool,
  type McpToolCallResult,
  type McpUsage,
  type NewMcpInput,
  type UpdateMcpInput,
} from '../types/mcp'

const MCP_API_BASE = '/api/v1/mcps'

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

function mcpPath(name: string) {
  return `${MCP_API_BASE}/${encodeURIComponent(name)}`
}

export async function fetchMcps(): Promise<Mcp[]> {
  const data = await apiRequest<McpConfig>(MCP_API_BASE)
  return mcpsFromConfig(data)
}

export async function createMcp(input: NewMcpInput): Promise<Mcp> {
  const name = input.name.trim()
  const config = configFromInput(input)

  await apiRequest<{ name: string }>(mcpPath(name), {
    method: 'POST',
    body: JSON.stringify(config),
  })

  return mcpFromEntry(name, config)
}

export async function updateMcp(id: string, input: UpdateMcpInput): Promise<Mcp> {
  const config = configFromInput(input)

  await apiRequest<{ name: string }>(mcpPath(id), {
    method: 'PUT',
    body: JSON.stringify(config),
  })

  return mcpFromEntry(id, config)
}

export async function fetchMcpUsage(name: string): Promise<McpUsage> {
  return apiRequest<McpUsage>(`${mcpPath(name)}/usage`)
}

export async function deleteMcp(id: string): Promise<void> {
  await apiRequest<void>(mcpPath(id), { method: 'DELETE' })
}

type McpToolsResponse = {
  tools: Array<{
    name: string
    description?: string | null
    input_schema?: Record<string, unknown>
  }>
}

export async function fetchMcpTools(name: string): Promise<McpTool[]> {
  const data = await apiRequest<McpToolsResponse>(`${mcpPath(name)}/tools`)

  return data.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.input_schema ?? {},
  }))
}

type McpToolCallResponse = {
  is_error: boolean
  content: unknown[]
  structured_content: unknown | null
}

export async function callMcpTool(
  mcpName: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<McpToolCallResult> {
  const data = await apiRequest<McpToolCallResponse>(
    `${mcpPath(mcpName)}/tools/${encodeURIComponent(toolName)}/call`,
    {
      method: 'POST',
      body: JSON.stringify({ arguments: args }),
    },
  )

  return {
    isError: data.is_error,
    content: data.content,
    structuredContent: data.structured_content,
  }
}
