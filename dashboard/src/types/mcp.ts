export type McpUsage = {
  agents: string[]
  skills: string[]
}

export type McpServerConfig = {
  url: string
  headers?: Record<string, string>
}

export type McpConfig = {
  mcpServers: Record<string, McpServerConfig>
}

export type Mcp = {
  id: string
  name: string
  url: string
  headers?: Record<string, string>
  updated_at?: string
}

export type McpTool = {
  name: string
  description?: string | null
  inputSchema: Record<string, unknown>
}

export type McpToolCallResult = {
  isError: boolean
  content: unknown[]
  structuredContent: unknown | null
}

export type McpHeaderInput = {
  key: string
  value: string
}

export type NewMcpInput = {
  name: string
  url: string
  headers: McpHeaderInput[]
}

export type UpdateMcpInput = Pick<NewMcpInput, 'url' | 'headers'>

const MCP_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateMcpName(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return 'Name is required'
  }

  if (!MCP_NAME_PATTERN.test(trimmed)) {
    return 'Name must use lowercase letters, numbers, and hyphens (e.g. weather-agent)'
  }

  return null
}

export function validateMcpUrl(url: string): string | null {
  const trimmed = url.trim()

  if (!trimmed) {
    return 'URL is required'
  }

  try {
    new URL(trimmed)
  } catch {
    return 'URL must be a valid URL'
  }

  return null
}

export function validateMcpNameUnique(
  name: string,
  mcps: Mcp[],
  excludeId?: string,
): string | null {
  const nameError = validateMcpName(name)
  if (nameError) {
    return nameError
  }

  const trimmed = name.trim()
  const isDuplicate = mcps.some((mcp) => mcp.name === trimmed && mcp.id !== excludeId)
  if (isDuplicate) {
    return 'An MCP with this name already exists'
  }

  return null
}

export function validateMcpHeaderKey(key: string): string | null {
  const trimmed = key.trim()

  if (!trimmed) {
    return 'Header name is required'
  }

  return null
}

export function validateMcpHeaderValue(value: string): string | null {
  if (!value.trim()) {
    return 'Header value is required'
  }

  return null
}

export function validateMcpHeaders(headers: McpHeaderInput[]) {
  return headers.map((header) => {
    const hasKey = header.key.trim().length > 0
    const hasValue = header.value.trim().length > 0

    if (!hasKey && !hasValue) {
      return { key: '', value: '' }
    }

    return {
      key: validateMcpHeaderKey(header.key) ?? '',
      value: validateMcpHeaderValue(header.value) ?? '',
    }
  })
}

export function headersToInputs(headers?: Record<string, string>): McpHeaderInput[] {
  if (!headers || Object.keys(headers).length === 0) {
    return [{ key: '', value: '' }]
  }

  return Object.entries(headers).map(([key, value]) => ({ key, value }))
}

export function headersFromInputs(headers: McpHeaderInput[]): Record<string, string> | undefined {
  const entries = headers
    .map(({ key, value }) => [key.trim(), value.trim()] as const)
    .filter(([key, value]) => key && value)

  if (entries.length === 0) {
    return undefined
  }

  return Object.fromEntries(entries)
}

export function mcpsToConfig(mcps: Mcp[]): McpConfig {
  const mcpServers: Record<string, McpServerConfig> = {}

  for (const mcp of mcps) {
    const config: McpServerConfig = { url: mcp.url }

    if (mcp.headers && Object.keys(mcp.headers).length > 0) {
      config.headers = { ...mcp.headers }
    }

    mcpServers[mcp.name] = config
  }

  return { mcpServers }
}

export function formatMcpConfig(mcps: Mcp[]): string {
  return JSON.stringify(mcpsToConfig(mcps), null, 2)
}

export function downloadMcpConfig(mcps: Mcp[], filename = 'mcp-servers.json') {
  const content = formatMcpConfig(mcps)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function configFromInput(input: Pick<NewMcpInput, 'url' | 'headers'>): McpServerConfig {
  const config: McpServerConfig = { url: input.url.trim() }
  const headers = headersFromInputs(input.headers)

  if (headers) {
    config.headers = headers
  }

  return config
}

export function mcpFromEntry(name: string, config: McpServerConfig): Mcp {
  return {
    id: name,
    name,
    url: config.url,
    headers: config.headers ? { ...config.headers } : undefined,
  }
}

export function mcpsFromConfig(data: McpConfig): Mcp[] {
  return Object.entries(data.mcpServers).map(([name, config]) => mcpFromEntry(name, config))
}

type JsonSchemaProperty = {
  type?: string
}

export function defaultToolArguments(inputSchema: Record<string, unknown>): string {
  const properties = inputSchema.properties as Record<string, JsonSchemaProperty> | undefined
  if (!properties) {
    return '{}'
  }

  const required = (inputSchema.required as string[] | undefined) ?? []
  const args: Record<string, unknown> = {}

  for (const [key, property] of Object.entries(properties)) {
    if (!required.includes(key)) {
      continue
    }

    switch (property.type) {
      case 'number':
      case 'integer':
        args[key] = 0
        break
      case 'boolean':
        args[key] = false
        break
      case 'array':
        args[key] = []
        break
      case 'object':
        args[key] = {}
        break
      default:
        args[key] = ''
    }
  }

  return JSON.stringify(args, null, 2)
}
