import SmartToyIcon from '@mui/icons-material/SmartToy'
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
import { useAgents } from '../context/AgentContext'
import { truncateText } from '../types/agent'

type CrewAgentSelectorProps = {
  selectedAgents: string[]
  onChange: (agents: string[]) => void
  disabled?: boolean
}

export default function CrewAgentSelector({
  selectedAgents,
  onChange,
  disabled = false,
}: CrewAgentSelectorProps) {
  const { agents, isLoading, loadError } = useAgents()

  function toggleAgent(name: string) {
    if (disabled) return

    if (selectedAgents.includes(name)) {
      onChange(selectedAgents.filter((agent) => agent !== name))
      return
    }

    onChange([...selectedAgents, name])
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <Typography variant="subtitle1">Agents</Typography>
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
      ) : agents.length === 0 ? (
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
          <SmartToyIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary">
            No agents configured yet.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {agents.map((agent, index) => (
              <ListItem key={agent.id} divider={index < agents.length - 1} disablePadding>
                <FormControlLabel
                  sx={{ width: '100%', mx: 0, px: 2, py: 1, alignItems: 'flex-start' }}
                  control={
                    <Checkbox
                      checked={selectedAgents.includes(agent.name)}
                      onChange={() => toggleAgent(agent.name)}
                      disabled={disabled}
                      sx={{ mt: -0.5 }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{agent.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {agent.model} · {truncateText(agent.description, 120)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {selectedAgents.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {selectedAgents.length} agent{selectedAgents.length === 1 ? '' : 's'} selected
        </Typography>
      )}
    </Box>
  )
}
