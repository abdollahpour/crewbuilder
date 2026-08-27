import MenuBookIcon from '@mui/icons-material/MenuBook'
import { useMemo } from 'react'
import { useKnowledge } from '../context/KnowledgeContext'
import { truncateText } from '../types/agent'
import ResourceMultiSelect from './ResourceMultiSelect'

type AgentKnowledgeSelectorProps = {
  selectedKnowledge: string[]
  onChange: (knowledge: string[]) => void
  disabled?: boolean
}

export default function AgentKnowledgeSelector({
  selectedKnowledge,
  onChange,
  disabled = false,
}: AgentKnowledgeSelectorProps) {
  const { knowledge, isLoading, loadError } = useKnowledge()

  const options = useMemo(
    () =>
      knowledge.map((item) => ({
        value: item.name,
        label: item.name,
        description: truncateText(item.content, 120),
      })),
    [knowledge],
  )

  return (
    <ResourceMultiSelect
      label="Knowledge"
      placeholder="Select knowledge"
      options={options}
      selectedValues={selectedKnowledge}
      onChange={onChange}
      disabled={disabled}
      loading={isLoading}
      error={loadError}
      emptyIcon={<MenuBookIcon sx={{ fontSize: 36, color: 'text.secondary' }} />}
      emptyMessage="No knowledge configured yet."
    />
  )
}
