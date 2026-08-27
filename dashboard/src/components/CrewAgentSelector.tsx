import SmartToyIcon from '@mui/icons-material/SmartToy'
import { useMemo } from 'react'
import { useAgents } from '../context/AgentContext'
import { truncateText } from '../types/agent'
import ResourceMultiSelect from './ResourceMultiSelect'

type CrewAgentSelectorProps = {
  selectedAgents: string[]
  onChange: (agents: string[]) => void
  disabled?: boolean
}

export default function CrewAgentSelector({
  selectedAgents,
  onChange,
  disabled = false,
}: CrewAgentSelectorProps) {
  const { agents, isLoading, loadError } = useAgents()

  const options = useMemo(
    () =>
      agents.map((agent) => ({
        value: agent.name,
        label: agent.name,
        description: `${agent.role} · ${truncateText(agent.goal, 120)}`,
      })),
    [agents],
  )

  return (
    <ResourceMultiSelect
      label="Agents"
      placeholder="Select agents"
      options={options}
      selectedValues={selectedAgents}
      onChange={onChange}
      disabled={disabled}
      loading={isLoading}
      error={loadError}
      emptyIcon={<SmartToyIcon sx={{ fontSize: 36, color: 'text.secondary' }} />}
      emptyMessage="No agents configured yet."
    />
  )
}
