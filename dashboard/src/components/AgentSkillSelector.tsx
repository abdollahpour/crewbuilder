import SchoolIcon from '@mui/icons-material/School'
import { useMemo } from 'react'
import { useSkills } from '../context/SkillContext'
import { truncateText } from '../types/agent'
import ResourceMultiSelect from './ResourceMultiSelect'

type AgentSkillSelectorProps = {
  selectedSkills: string[]
  onChange: (skills: string[]) => void
  disabled?: boolean
}

export default function AgentSkillSelector({
  selectedSkills,
  onChange,
  disabled = false,
}: AgentSkillSelectorProps) {
  const { skills, isLoading, loadError } = useSkills()

  const options = useMemo(
    () =>
      skills.map((skill) => ({
        value: skill.name,
        label: skill.name,
        description: truncateText(skill.description, 120),
      })),
    [skills],
  )

  return (
    <ResourceMultiSelect
      label="Skills"
      placeholder="Select skills"
      options={options}
      selectedValues={selectedSkills}
      onChange={onChange}
      disabled={disabled}
      loading={isLoading}
      error={loadError}
      emptyIcon={<SchoolIcon sx={{ fontSize: 36, color: 'text.secondary' }} />}
      emptyMessage="No skills configured yet."
    />
  )
}
