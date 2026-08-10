import BuildIcon from '@mui/icons-material/Build'
import HubIcon from '@mui/icons-material/Hub'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SchoolIcon from '@mui/icons-material/School'
import { Box } from '@mui/material'
import { alpha, type Theme } from '@mui/material/styles'
import LabeledChipRow from './list/LabeledChipRow'

const ATTACHMENT_LABEL_WIDTH = 104

type AgentAttachmentsProps = {
  skills: string[]
  tools: string[]
  knowledge: string[]
  mcps: string[]
}

export default function AgentAttachments({
  skills,
  tools,
  knowledge,
  mcps,
}: AgentAttachmentsProps) {
  if (
    skills.length === 0 &&
    tools.length === 0 &&
    knowledge.length === 0 &&
    mcps.length === 0
  ) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <LabeledChipRow
        label="Skills"
        icon={<SchoolIcon sx={{ fontSize: 16 }} />}
        items={skills}
        chipIcon={<SchoolIcon sx={{ fontSize: '14px !important' }} />}
        labelMinWidth={ATTACHMENT_LABEL_WIDTH}
        chipSx={{
          bgcolor: (theme: Theme) => alpha(theme.palette.secondary.main, 0.08),
          borderColor: (theme: Theme) => alpha(theme.palette.secondary.main, 0.24),
          '& .MuiChip-icon': { color: 'secondary.main' },
        }}
      />
      <LabeledChipRow
        label="Tools"
        icon={<BuildIcon sx={{ fontSize: 16 }} />}
        items={tools}
        chipIcon={<BuildIcon sx={{ fontSize: '14px !important' }} />}
        labelMinWidth={ATTACHMENT_LABEL_WIDTH}
        chipSx={{
          bgcolor: (theme: Theme) => alpha(theme.palette.warning.main, 0.08),
          borderColor: (theme: Theme) => alpha(theme.palette.warning.main, 0.24),
          '& .MuiChip-icon': { color: 'warning.main' },
        }}
      />
      <LabeledChipRow
        label="Knowledge"
        icon={<MenuBookIcon sx={{ fontSize: 16 }} />}
        items={knowledge}
        chipIcon={<MenuBookIcon sx={{ fontSize: '14px !important' }} />}
        labelMinWidth={ATTACHMENT_LABEL_WIDTH}
        chipSx={{
          bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08),
          borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.24),
          '& .MuiChip-icon': { color: 'primary.main' },
        }}
      />
      <LabeledChipRow
        label="MCPs"
        icon={<HubIcon sx={{ fontSize: 16 }} />}
        items={mcps}
        chipIcon={<HubIcon sx={{ fontSize: '14px !important' }} />}
        labelMinWidth={ATTACHMENT_LABEL_WIDTH}
        chipSx={{
          bgcolor: 'grey.50',
          borderColor: 'grey.300',
          '& .MuiChip-icon': { color: 'text.secondary' },
        }}
      />
    </Box>
  )
}
