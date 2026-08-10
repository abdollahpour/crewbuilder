import BuildIcon from '@mui/icons-material/Build'
import HubIcon from '@mui/icons-material/Hub'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { Box } from '@mui/material'
import { alpha, type Theme } from '@mui/material/styles'
import LabeledChipRow from './list/LabeledChipRow'

type SkillAttachmentsProps = {
  toolsRequired: string[]
  mcps: string[]
  knowledge: string[]
}

export default function SkillAttachments({
  toolsRequired,
  mcps,
  knowledge,
}: SkillAttachmentsProps) {
  if (toolsRequired.length === 0 && mcps.length === 0 && knowledge.length === 0) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <LabeledChipRow
        label="Tools"
        icon={<BuildIcon sx={{ fontSize: 16 }} />}
        items={toolsRequired}
        chipIcon={<BuildIcon sx={{ fontSize: '14px !important' }} />}
        chipSx={{
          bgcolor: (theme: Theme) => alpha(theme.palette.warning.main, 0.08),
          borderColor: (theme: Theme) => alpha(theme.palette.warning.main, 0.24),
          '& .MuiChip-icon': { color: 'warning.main' },
        }}
      />
      <LabeledChipRow
        label="MCPs"
        icon={<HubIcon sx={{ fontSize: 16 }} />}
        items={mcps}
        chipIcon={<HubIcon sx={{ fontSize: '14px !important' }} />}
        chipSx={{
          bgcolor: 'grey.50',
          borderColor: 'grey.300',
          '& .MuiChip-icon': { color: 'text.secondary' },
        }}
      />
      <LabeledChipRow
        label="Knowledge"
        icon={<MenuBookIcon sx={{ fontSize: 16 }} />}
        items={knowledge}
        chipIcon={<MenuBookIcon sx={{ fontSize: '14px !important' }} />}
        chipSx={{
          bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.08),
          borderColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.24),
          '& .MuiChip-icon': { color: 'primary.main' },
        }}
      />
    </Box>
  )
}
