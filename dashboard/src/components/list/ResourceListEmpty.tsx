import { Box, Paper, Typography } from '@mui/material'
import type { ReactElement, ReactNode } from 'react'

type ResourceListEmptyProps = {
  icon: ReactElement
  title: string
  description: string
  action?: ReactNode
}

export default function ResourceListEmpty({
  icon,
  title,
  description,
  action,
}: ResourceListEmptyProps) {
  return (
    <Paper
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>
        {icon}
      </Box>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
        {description}
      </Typography>
      {action}
    </Paper>
  )
}
