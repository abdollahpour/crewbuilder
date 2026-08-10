import { Box, Divider, Paper, Skeleton, Stack } from '@mui/material'

const DEFAULT_ROWS = 4
const DEFAULT_LINES = 3

type ResourceListSkeletonProps = {
  rows?: number
  lines?: number
}

export default function ResourceListSkeleton({
  rows = DEFAULT_ROWS,
  lines = DEFAULT_LINES,
}: ResourceListSkeletonProps) {
  return (
    <Paper>
      {Array.from({ length: rows }, (_, index) => (
        <Box key={index}>
          <Stack spacing={1} sx={{ px: 2, py: 2 }}>
            <Skeleton variant="text" width="25%" height={28} />
            {Array.from({ length: lines }, (__, lineIndex) => (
              <Skeleton
                key={lineIndex}
                variant="text"
                width={`${Math.max(40, 85 - lineIndex * 12)}%`}
              />
            ))}
          </Stack>
          {index < rows - 1 ? <Divider /> : null}
        </Box>
      ))}
    </Paper>
  )
}
