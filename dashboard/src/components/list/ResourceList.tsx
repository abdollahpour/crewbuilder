import { Box, Divider, Paper, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type ResourceListProps = {
  children: ReactNode
}

export function ResourceList({ children }: ResourceListProps) {
  return <Paper>{children}</Paper>
}

type ResourceListItemProps = {
  title: string
  meta?: string
  description?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  showDivider?: boolean
}

export function ResourceListItem({
  title,
  meta,
  description,
  children,
  actions,
  showDivider = false,
}: ResourceListItemProps) {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          px: 2,
          py: 2,
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {meta ? (
              <Typography variant="body2" color="text.secondary">
                {meta}
              </Typography>
            ) : null}
          </Box>
          {description ? (
            typeof description === 'string' ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            ) : (
              <Box sx={{ mt: 0.5 }}>{description}</Box>
            )
          ) : null}
          {children}
        </Box>
        {actions ? (
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>{actions}</Box>
        ) : null}
      </Box>
      {showDivider ? <Divider /> : null}
    </Box>
  )
}

type ResourceListSectionProps = {
  label: string
  children: ReactNode
  monospace?: boolean
}

export function ResourceListSection({
  label,
  children,
  monospace = false,
}: ResourceListSectionProps) {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          color: 'text.secondary',
          ...(monospace
            ? {
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
              }
            : {
                typography: 'body2',
              }),
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
