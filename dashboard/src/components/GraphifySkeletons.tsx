export { default as ResourceListSkeleton } from './list/ResourceListSkeleton'
export { default } from './list/ResourceListSkeleton'

import { Box, Skeleton, Stack } from '@mui/material'

export function NewGraphifySkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={180} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Skeleton variant="rounded" width={130} height={36} />
        <Skeleton variant="rounded" width={90} height={36} />
      </Box>
    </Stack>
  )
}
