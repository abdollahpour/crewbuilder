import HubIcon from '@mui/icons-material/Hub'
import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material'
import { useMcps } from '../context/McpContext'

type AgentMcpSelectorProps = {
  selectedMcps: string[]
  onChange: (mcps: string[]) => void
  disabled?: boolean
}

export default function AgentMcpSelector({
  selectedMcps,
  onChange,
  disabled = false,
}: AgentMcpSelectorProps) {
  const { mcps, isLoading, loadError } = useMcps()

  function toggleMcp(name: string) {
    if (disabled) return

    if (selectedMcps.includes(name)) {
      onChange(selectedMcps.filter((mcp) => mcp !== name))
      return
    }

    onChange([...selectedMcps, name])
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <Typography variant="subtitle1">MCPs</Typography>
        <Typography variant="body2" color="text.secondary">
          (optional)
        </Typography>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {isLoading ? (
        <Paper variant="outlined">
          <List disablePadding>
            {Array.from({ length: 3 }, (_, index) => (
              <ListItem key={index} divider={index < 2}>
                <Skeleton variant="text" width="40%" />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : mcps.length === 0 ? (
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
          <HubIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary">
            No MCP servers configured yet.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {mcps.map((mcp, index) => (
              <ListItem key={mcp.id} divider={index < mcps.length - 1} disablePadding>
                <FormControlLabel
                  sx={{ width: '100%', mx: 0, px: 2, py: 1, alignItems: 'flex-start' }}
                  control={
                    <Checkbox
                      checked={selectedMcps.includes(mcp.name)}
                      onChange={() => toggleMcp(mcp.name)}
                      disabled={disabled}
                      sx={{ mt: -0.5 }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{mcp.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mcp.url}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {selectedMcps.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {selectedMcps.length} MCP{selectedMcps.length === 1 ? '' : 's'} selected
        </Typography>
      )}
    </Box>
  )
}
