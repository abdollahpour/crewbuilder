import { Box, Chip, Typography } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'

type LabeledChipRowProps = {
  label: string
  icon: ReactNode
  items: string[]
  chipIcon: ReactElement
  labelMinWidth?: number
  chipSx?: object
}

export default function LabeledChipRow({
  label,
  icon,
  items,
  chipIcon,
  labelMinWidth = 72,
  chipSx,
}: LabeledChipRowProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${labelMinWidth}px 1fr`,
        columnGap: 1,
        alignItems: 'start',
        mt: 1,
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          color: 'text.secondary',
        }}
      >
        {icon}
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {items.map((item) => (
          <Chip
            key={item}
            icon={chipIcon}
            label={item}
            size="small"
            variant="outlined"
            sx={chipSx}
          />
        ))}
      </Box>
    </Box>
  )
}
