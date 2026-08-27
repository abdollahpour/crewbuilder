import HubIcon from '@mui/icons-material/Hub'
import { useMemo } from 'react'
import { useMcps } from '../context/McpContext'
import ResourceMultiSelect from './ResourceMultiSelect'

type AgentMcpSelectorProps = {
  selectedMcps: string[]
  onChange: (mcps: string[]) => void
  disabled?: boolean
}

export default function AgentMcpSelector({
  selectedMcps,
  onChange,
  disabled = false,
}: AgentMcpSelectorProps) {
  const { mcps, isLoading, loadError } = useMcps()

  const options = useMemo(
    () =>
      mcps.map((mcp) => ({
        value: mcp.name,
        label: mcp.name,
        description: mcp.url,
      })),
    [mcps],
  )

  return (
    <ResourceMultiSelect
      label="MCPs"
      placeholder="Select MCP servers"
      options={options}
      selectedValues={selectedMcps}
      onChange={onChange}
      disabled={disabled}
      loading={isLoading}
      error={loadError}
      emptyIcon={<HubIcon sx={{ fontSize: 36, color: 'text.secondary' }} />}
      emptyMessage="No MCP servers configured yet."
    />
  )
}
