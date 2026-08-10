export { default as ResourceListSkeleton } from './list/ResourceListSkeleton'
export { default } from './list/ResourceListSkeleton'

import { Skeleton, Stack } from '@mui/material'

export function CrewFormSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={56} />
      <Skeleton variant="rounded" height={360} />
      <Skeleton variant="rounded" height={200} />
      <Stack direction="row" spacing={2}>
        <Skeleton variant="rounded" width={120} height={36} />
        <Skeleton variant="rounded" width={90} height={36} />
      </Stack>
    </Stack>
  )
}
