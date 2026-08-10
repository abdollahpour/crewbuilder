export { default as ResourceListSkeleton } from './list/ResourceListSkeleton'
export { default } from './list/ResourceListSkeleton'

import { Skeleton, Stack } from '@mui/material'

export function KnowledgeFormSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={320} />
      <Stack direction="row" spacing={2}>
        <Skeleton variant="rounded" width={110} height={36} />
        <Skeleton variant="rounded" width={90} height={36} />
      </Stack>
    </Stack>
  )
}
