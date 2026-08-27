import {
  Configuration,
  DefaultApi,
  ResponseError,
  type McpInput,
} from '../generated/api/mcp'
import {
  configFromInput,
  mcpFromEntry,
  mcpsFromConfig,
  type Mcp,
  type McpTool,
  type McpToolCallResult,
  type McpUsage,
  type NewMcpInput,
  type UpdateMcpInput,
} from '../types/mcp'

const mcpApi = new DefaultApi(new Configuration({ basePath: '' }))

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

function toMcpInput(input: Pick<NewMcpInput, 'url' | 'headers'>): McpInput {
  return configFromInput(input)
}

export async function fetchMcps(): Promise<Mcp[]> {
  const data = await apiCall(() => mcpApi.listMcps())
  return mcpsFromConfig({ mcpServers: data.mcpServers })
}

export async function createMcp(input: NewMcpInput): Promise<Mcp> {
  const name = input.name.trim()
  const mcpInput = toMcpInput(input)

  await apiCall(() => mcpApi.createMcp({ name, mcpInput }))

  return mcpFromEntry(name, mcpInput)
}

export async function updateMcp(id: string, input: UpdateMcpInput): Promise<Mcp> {
  const mcpInput = toMcpInput(input)

  await apiCall(() =>
    mcpApi.updateMcp({
      name: id,
      mcpInput,
    }),
  )

  return mcpFromEntry(id, mcpInput)
}

export async function fetchMcpUsage(name: string): Promise<McpUsage> {
  return apiCall(() => mcpApi.getMcpUsage({ name }))
}

export async function deleteMcp(id: string): Promise<void> {
  await apiCall(() => mcpApi.deleteMcp({ name: id }))
}

export async function fetchMcpTools(name: string): Promise<McpTool[]> {
  const data = await apiCall(() => mcpApi.listMcpTools({ name }))

  return data.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema ?? {},
  }))
}

export async function callMcpTool(
  mcpName: string,
  toolName: string,
  args: Record<string, unknown>,
): Promise<McpToolCallResult> {
  const data = await apiCall(() =>
    mcpApi.callMcpTool({
      name: mcpName,
      toolName,
      callToolInput: { arguments: args },
    }),
  )

  return {
    isError: data.isError,
    content: data.content,
    structuredContent: data.structuredContent ?? null,
  }
}
