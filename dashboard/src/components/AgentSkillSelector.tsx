import SchoolIcon from '@mui/icons-material/School'
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
import { useSkills } from '../context/SkillContext'
import { truncateText } from '../types/agent'

type AgentSkillSelectorProps = {
  selectedSkills: string[]
  onChange: (skills: string[]) => void
  disabled?: boolean
}

export default function AgentSkillSelector({
  selectedSkills,
  onChange,
  disabled = false,
}: AgentSkillSelectorProps) {
  const { skills, isLoading, loadError } = useSkills()

  function toggleSkill(name: string) {
    if (disabled) return

    if (selectedSkills.includes(name)) {
      onChange(selectedSkills.filter((skill) => skill !== name))
      return
    }

    onChange([...selectedSkills, name])
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
        <Typography variant="subtitle1">Skills</Typography>
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
      ) : skills.length === 0 ? (
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
          <SchoolIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary">
            No skills configured yet.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {skills.map((skill, index) => (
              <ListItem key={skill.id} divider={index < skills.length - 1} disablePadding>
                <FormControlLabel
                  sx={{ width: '100%', mx: 0, px: 2, py: 1, alignItems: 'flex-start' }}
                  control={
                    <Checkbox
                      checked={selectedSkills.includes(skill.name)}
                      onChange={() => toggleSkill(skill.name)}
                      disabled={disabled}
                      sx={{ mt: -0.5 }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">{skill.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {truncateText(skill.description, 120)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {selectedSkills.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {selectedSkills.length} skill{selectedSkills.length === 1 ? '' : 's'} selected
        </Typography>
      )}
    </Box>
  )
}
