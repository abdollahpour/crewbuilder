import SmartToyIcon from '@mui/icons-material/SmartToy'
import { alpha, type Theme } from '@mui/material/styles'
import LabeledChipRow from './list/LabeledChipRow'

type CrewAgentsListProps = {
  agents: string[]
}

export default function CrewAgentsList({ agents }: CrewAgentsListProps) {
  return (
    <LabeledChipRow
      label="Agents"
      icon={<SmartToyIcon sx={{ fontSize: 16 }} />}
      items={agents}
      chipIcon={<SmartToyIcon sx={{ fontSize: '14px !important' }} />}
      chipSx={{
        bgcolor: (theme: Theme) => alpha(theme.palette.info.main, 0.08),
        borderColor: (theme: Theme) => alpha(theme.palette.info.main, 0.24),
        '& .MuiChip-icon': { color: 'info.main' },
      }}
    />
  )
}
