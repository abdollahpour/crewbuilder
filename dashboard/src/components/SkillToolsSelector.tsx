import BuildIcon from '@mui/icons-material/Build'
import SearchIcon from '@mui/icons-material/Search'
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  List,
  ListItem,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { fetchSkillTools } from '../api/skill'
import { normalizeSkillTools } from '../types/skill'

type SkillToolsSelectorProps = {
  selectedTools: string[]
  onChange: (tools: string[]) => void
  disabled?: boolean
}

export default function SkillToolsSelector({
  selectedTools,
  onChange,
  disabled = false,
}: SkillToolsSelectorProps) {
  const [availableTools, setAvailableTools] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadTools() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const tools = await fetchSkillTools()
        if (!cancelled) {
          setAvailableTools(tools)
        }
      } catch {
        if (!cancelled) {
          setLoadError('Failed to load available tools')
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
  }, [])

  const normalizedSelectedTools = normalizeSkillTools(selectedTools)

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return availableTools

    return availableTools.filter((tool) => tool.toLowerCase().includes(query))
  }, [availableTools, searchQuery])

  function toggleTool(name: string) {
    if (disabled) return

    if (normalizedSelectedTools.includes(name)) {
      onChange(normalizedSelectedTools.filter((tool) => tool !== name))
      return
    }

    onChange([...normalizedSelectedTools, name])
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <Typography variant="subtitle1">Tools</Typography>
        <Typography variant="body2" color="text.secondary">
          (optional)
        </Typography>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {!isLoading && availableTools.length > 0 && (
        <TextField
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search tools"
          fullWidth
          size="small"
          disabled={disabled}
          sx={{ mb: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {isLoading ? (
        <Paper variant="outlined">
          <List disablePadding>
            {Array.from({ length: 4 }, (_, index) => (
              <ListItem key={index} divider={index < 3}>
                <Skeleton variant="text" width="40%" />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : availableTools.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1,
          }}
        >
          <BuildIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary">
            No tools available.
          </Typography>
        </Paper>
      ) : filteredTools.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No tools match your search.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ maxHeight: 320, overflow: 'auto' }}>
          <List disablePadding>
            {filteredTools.map((tool, index) => (
              <ListItem
                key={tool}
                divider={index < filteredTools.length - 1}
                disablePadding
              >
                <FormControlLabel
                  sx={{ width: '100%', mx: 0, px: 2, py: 1 }}
                  control={
                    <Checkbox
                      checked={normalizedSelectedTools.includes(tool)}
                      onChange={() => toggleTool(tool)}
                      disabled={disabled}
                    />
                  }
                  label={tool}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {normalizedSelectedTools.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <BuildIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            No tools selected
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {normalizedSelectedTools.length} tool
          {normalizedSelectedTools.length === 1 ? '' : 's'} selected
        </Typography>
      )}
    </Box>
  )
}
