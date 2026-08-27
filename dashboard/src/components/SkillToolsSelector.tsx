import BuildIcon from '@mui/icons-material/Build'
import { useEffect, useMemo, useState } from 'react'
import { fetchSkillTools } from '../api/skill'
import { normalizeSkillTools } from '../types/skill'
import ResourceMultiSelect from './ResourceMultiSelect'

type SkillToolsSelectorProps = {
  selectedTools: string[]
  onChange: (tools: string[]) => void
  disabled?: boolean
}

export default function SkillToolsSelector({
  selectedTools,
  onChange,
  disabled = false,
}: SkillToolsSelectorProps) {
  const [availableTools, setAvailableTools] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTools() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const tools = await fetchSkillTools()
        if (!cancelled) {
          setAvailableTools(tools)
        }
      } catch {
        if (!cancelled) {
          setLoadError('Failed to load available tools')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadTools()

    return () => {
      cancelled = true
    }
  }, [])

  const normalizedSelectedTools = normalizeSkillTools(selectedTools)

  const options = useMemo(
    () =>
      availableTools.map((tool) => ({
        value: tool,
        label: tool,
      })),
    [availableTools],
  )

  return (
    <ResourceMultiSelect
      label="Tools"
      placeholder="Select tools"
      options={options}
      selectedValues={normalizedSelectedTools}
      onChange={onChange}
      disabled={disabled}
      loading={isLoading}
      error={loadError}
      emptyIcon={<BuildIcon sx={{ fontSize: 36, color: 'text.secondary' }} />}
      emptyMessage="No tools available."
    />
  )
}
