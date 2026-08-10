import BuildIcon from '@mui/icons-material/Build'
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { fetchMcpTools } from '../api/mcp'
import type { McpTool } from '../types/mcp'

type McpToolsPanelProps = {
  mcpName: string
}

export default function McpToolsPanel({ mcpName }: McpToolsPanelProps) {
  const [tools, setTools] = useState<McpTool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTools() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const data = await fetchMcpTools(mcpName)
        if (!cancelled) {
          setTools(data)
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load tools')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadTools()

    return () => {
      cancelled = true
    }
  }, [mcpName])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          Loading tools…
        </Typography>
      </Box>
    )
  }

  if (loadError) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        {loadError}
      </Alert>
    )
  }

  if (tools.length === 0) {
    return (
      <Box
        sx={{
          mt: 1,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'text.secondary',
        }}
      >
        <BuildIcon sx={{ fontSize: 20 }} />
        <Typography variant="body2">No tools exposed by this MCP server.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {tools.map((tool) => (
        <Paper key={tool.name} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {tool.name}
          </Typography>
          {tool.description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {tool.description}
            </Typography>
          ) : null}
          {Object.keys(tool.inputSchema).length > 0 ? (
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
                Input schema
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(tool.inputSchema, null, 2)}
              </Box>
            </Box>
          ) : null}
        </Paper>
      ))}
    </Box>
  )
}
