import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Box,
  IconButton,
  Paper,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import McpToolTester from '../components/McpToolTester'
import { NewMcpSkeleton } from '../components/McpSkeletons'
import { useMcps } from '../context/McpContext'

export default function McpTest() {
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

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton aria-label="Back to MCP" onClick={() => navigate(`/mcps/${mcp.id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Test {mcp.name}
        </Typography>
      </Box>

      <Paper sx={{ p: 2, maxWidth: 720 }}>
        <McpToolTester mcpName={mcp.name} />
      </Paper>
    </>
  )
}
