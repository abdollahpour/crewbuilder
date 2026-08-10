import MenuBookIcon from '@mui/icons-material/MenuBook'
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
import { useKnowledge } from '../context/KnowledgeContext'
import { truncateText } from '../types/agent'

type AgentKnowledgeSelectorProps = {
  selectedKnowledge: string[]
  onChange: (knowledge: string[]) => void
  disabled?: boolean
}

export default function AgentKnowledgeSelector({
  selectedKnowledge,
  onChange,
  disabled = false,
}: AgentKnowledgeSelectorProps) {
  const { knowledge, isLoading, loadError } = useKnowledge()

  function toggleKnowledge(name: string) {
    if (disabled) return

    if (selectedKnowledge.includes(name)) {
      onChange(selectedKnowledge.filter((knowledge) => knowledge !== name))
      return
    }

    onChange([...selectedKnowledge, name])
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <Typography variant="subtitle1">Knowledge</Typography>
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
      ) : knowledge.length === 0 ? (
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
          <MenuBookIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary">
            No knowledge configured yet.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {knowledge.map((item, index) => (
              <ListItem
                key={item.id}
                divider={index < knowledge.length - 1}
                disablePadding
              >
                <FormControlLabel
                  sx={{ width: '100%', mx: 0, px: 2, py: 1, alignItems: 'flex-start' }}
                  control={
                    <Checkbox
                      checked={selectedKnowledge.includes(item.name)}
                      onChange={() => toggleKnowledge(item.name)}
                      disabled={disabled}
                      sx={{ mt: -0.5 }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {truncateText(item.content, 120)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {selectedKnowledge.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {selectedKnowledge.length} knowledge
          {selectedKnowledge.length === 1 ? '' : 's'} selected
        </Typography>
      )}
    </Box>
  )
}
