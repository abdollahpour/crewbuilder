import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { callMcpTool, fetchMcpTools } from '../api/mcp'
import { defaultToolArguments, type McpTool, type McpToolCallResult } from '../types/mcp'

type McpToolTesterProps = {
  mcpName: string
}

function formatResult(result: McpToolCallResult): string {
  if (result.structuredContent !== null && result.structuredContent !== undefined) {
    return JSON.stringify(result.structuredContent, null, 2)
  }

  return JSON.stringify(result.content, null, 2)
}

export default function McpToolTester({ mcpName }: McpToolTesterProps) {
  const [tools, setTools] = useState<McpTool[]>([])
  const [selectedTool, setSelectedTool] = useState('')
  const [argumentsJson, setArgumentsJson] = useState('{}')
  const [argumentsError, setArgumentsError] = useState<string | null>(null)
  const [isLoadingTools, setIsLoadingTools] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const [result, setResult] = useState<McpToolCallResult | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTools() {
      setIsLoadingTools(true)
      setLoadError(null)

      try {
        const data = await fetchMcpTools(mcpName)
        if (cancelled) return

        setTools(data)
        if (data.length > 0) {
          setSelectedTool(data[0].name)
          setArgumentsJson(defaultToolArguments(data[0].inputSchema))
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load tools')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTools(false)
        }
      }
    }

    void loadTools()

    return () => {
      cancelled = true
    }
  }, [mcpName])

  const activeTool = useMemo(
    () => tools.find((tool) => tool.name === selectedTool) ?? null,
    [tools, selectedTool],
  )

  function handleToolChange(toolName: string) {
    setSelectedTool(toolName)
    setRunError(null)
    setResult(null)
    setArgumentsError(null)

    const tool = tools.find((item) => item.name === toolName)
    if (tool) {
      setArgumentsJson(defaultToolArguments(tool.inputSchema))
    }
  }

  async function handleRun() {
    if (!selectedTool) return

    let parsedArguments: Record<string, unknown>

    try {
      parsedArguments = JSON.parse(argumentsJson) as Record<string, unknown>
      if (parsedArguments === null || Array.isArray(parsedArguments) || typeof parsedArguments !== 'object') {
        setArgumentsError('Arguments must be a JSON object')
        return
      }
      setArgumentsError(null)
    } catch {
      setArgumentsError('Arguments must be valid JSON')
      return
    }

    setIsRunning(true)
    setRunError(null)
    setResult(null)

    try {
      const response = await callMcpTool(mcpName, selectedTool, parsedArguments)
      setResult(response)
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Tool call failed')
    } finally {
      setIsRunning(false)
    }
  }

  if (isLoadingTools) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Loading tools…
        </Typography>
      </Box>
    )
  }

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>
  }

  if (tools.length === 0) {
    return (
      <Alert severity="info">This MCP server does not expose any tools to test.</Alert>
    )
  }

  return (
    <Stack spacing={2}>
      <FormControl fullWidth size="small">
        <InputLabel id="mcp-tool-select-label">Tool</InputLabel>
        <Select
          labelId="mcp-tool-select-label"
          label="Tool"
          value={selectedTool}
          onChange={(event) => handleToolChange(event.target.value)}
        >
          {tools.map((tool) => (
            <MenuItem key={tool.name} value={tool.name}>
              {tool.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {activeTool?.description ? (
        <Typography variant="body2" color="text.secondary">
          {activeTool.description}
        </Typography>
      ) : null}

      <TextField
        label="Arguments (JSON)"
        value={argumentsJson}
        onChange={(event) => {
          setArgumentsJson(event.target.value)
          setArgumentsError(null)
        }}
        multiline
        minRows={4}
        fullWidth
        error={Boolean(argumentsError)}
        helperText={
          argumentsError ??
          'Provide tool arguments as a JSON object. Edit freely for any input shape.'
        }
        slotProps={{
          input: {
            sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
          },
        }}
      />

      {Object.keys(activeTool?.inputSchema ?? {}).length > 0 ? (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
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
              overflow: 'auto',
            }}
          >
            {JSON.stringify(activeTool?.inputSchema ?? {}, null, 2)}
          </Box>
        </Box>
      ) : null}

      <Box>
        <Button
          variant="contained"
          startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
          onClick={() => void handleRun()}
          disabled={isRunning || !selectedTool}
        >
          Run tool
        </Button>
      </Box>

      {runError ? <Alert severity="error">{runError}</Alert> : null}

      {result ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Result
          </Typography>
          {result.isError ? (
            <Alert severity="error" sx={{ mb: 1 }}>
              The tool returned an error.
            </Alert>
          ) : null}
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 1.5,
              bgcolor: 'action.hover',
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.8125rem',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {formatResult(result)}
          </Box>
        </Paper>
      ) : null}
    </Stack>
  )
}
