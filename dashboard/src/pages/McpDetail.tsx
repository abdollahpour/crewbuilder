import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import McpToolsPanel from '../components/McpToolsPanel'
import { ResourceListSection } from '../components/list/ResourceList'
import { NewMcpSkeleton } from '../components/McpSkeletons'
import { useMcps } from '../context/McpContext'

export default function McpDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { mcps, isLoading } = useMcps()
  const mcp = mcps.find((item) => item.id === id)

  useEffect(() => {
    if (!isLoading && id && !mcp) {
      navigate('/mcps', { replace: true })
    }
  }, [id, isLoading, mcp, navigate])

  if (isLoading || !mcp) {
    return <NewMcpSkeleton />
  }

  const hasHeaders = mcp.headers && Object.keys(mcp.headers).length > 0

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton aria-label="Back to MCPs" onClick={() => navigate('/mcps')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {mcp.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<PlayArrowIcon />}
          onClick={() => navigate(`/mcps/${mcp.id}/test`)}
        >
          Test
        </Button>
      </Box>

      <Stack spacing={3}>
        {hasHeaders ? (
          <Paper sx={{ p: 2 }}>
            <ResourceListSection label="Headers" monospace>
              {Object.entries(mcp.headers!).map(([key, value]) => (
                <Box key={key} component="div">
                  {key}: {value}
                </Box>
              ))}
            </ResourceListSection>
          </Paper>
        ) : null}

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            Tools
          </Typography>
          <McpToolsPanel mcpName={mcp.name} />
        </Box>
      </Stack>
    </>
  )
}
