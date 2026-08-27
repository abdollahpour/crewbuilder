import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AgentExtraSelectors from '../components/AgentExtraSelectors'
import AgentSkillSelector from '../components/AgentSkillSelector'
import { AgentFormSkeleton } from '../components/AgentSkeletons'
import { useAgents } from '../context/AgentContext'
import {
  validateAgentBackstory,
  validateAgentGoal,
  validateAgentModel,
  validateAgentNameUnique,
  validateAgentRole,
} from '../types/agent'

export default function NewAgent() {
  const navigate = useNavigate()
  const { addAgent, isAdding, agents } = useAgents()
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [role, setRole] = useState('')
  const [goal, setGoal] = useState('')
  const [backstory, setBackstory] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedMcps, setSelectedMcps] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([])
  const [nameError, setNameError] = useState('')
  const [modelError, setModelError] = useState('')
  const [roleError, setRoleError] = useState('')
  const [goalError, setGoalError] = useState('')
  const [backstoryError, setBackstoryError] = useState('')

  function handleNameChange(value: string) {
    setName(value)
    setNameError(validateAgentNameUnique(value, agents) ?? '')
  }

  function handleModelChange(value: string) {
    setModel(value)
    setModelError(validateAgentModel(value) ?? '')
  }

  function handleRoleChange(value: string) {
    setRole(value)
    setRoleError(validateAgentRole(value) ?? '')
  }

  function handleGoalChange(value: string) {
    setGoal(value)
    setGoalError(validateAgentGoal(value) ?? '')
  }

  function handleBackstoryChange(value: string) {
    setBackstory(value)
    setBackstoryError(validateAgentBackstory(value) ?? '')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextNameError = validateAgentNameUnique(name, agents) ?? ''
    const nextModelError = validateAgentModel(model) ?? ''
    const nextRoleError = validateAgentRole(role) ?? ''
    const nextGoalError = validateAgentGoal(goal) ?? ''
    const nextBackstoryError = validateAgentBackstory(backstory) ?? ''

    setNameError(nextNameError)
    setModelError(nextModelError)
    setRoleError(nextRoleError)
    setGoalError(nextGoalError)
    setBackstoryError(nextBackstoryError)

    if (nextNameError || nextModelError || nextRoleError || nextGoalError || nextBackstoryError) {
      return
    }

    await addAgent({
      name: name.trim(),
      model: model.trim(),
      role: role.trim(),
      goal: goal.trim(),
      backstory: backstory.trim(),
      tools: selectedTools,
      mcps: selectedMcps,
      skills: selectedSkills,
      knowledge: selectedKnowledge,
    })
    navigate('/agents')
  }

  const isSubmitDisabled =
    isAdding ||
    Boolean(validateAgentNameUnique(name, agents)) ||
    Boolean(validateAgentModel(model)) ||
    Boolean(validateAgentRole(role)) ||
    Boolean(validateAgentGoal(goal)) ||
    Boolean(validateAgentBackstory(backstory))

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/agents')}
          disabled={isAdding}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          New Agent
        </Typography>
      </Box>

      {isAdding ? (
        <AgentFormSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            error={Boolean(nameError)}
            helperText={nameError || 'Lowercase letters, numbers, and hyphens (e.g. code-reviewer)'}
            fullWidth
            required
          />
          <TextField
            label="Model"
            value={model}
            onChange={(event) => handleModelChange(event.target.value)}
            error={Boolean(modelError)}
            helperText={modelError || 'LLM model identifier (e.g. gpt-4o)'}
            fullWidth
            required
          />
          <TextField
            label="Role"
            value={role}
            onChange={(event) => handleRoleChange(event.target.value)}
            error={Boolean(roleError)}
            helperText={
              roleError ||
              `${role.length.toLocaleString()} characters · Agent role title that appears in prompts and logs`
            }
            fullWidth
            required
          />
          <TextField
            label="Goal"
            value={goal}
            onChange={(event) => handleGoalChange(event.target.value)}
            error={Boolean(goalError)}
            helperText={
              goalError ||
              `${goal.length.toLocaleString()} characters · The agent's primary objective`
            }
            fullWidth
            required
            multiline
            minRows={4}
          />
          <TextField
            label="Backstory"
            value={backstory}
            onChange={(event) => handleBackstoryChange(event.target.value)}
            error={Boolean(backstoryError)}
            helperText={
              backstoryError ||
              `${backstory.length.toLocaleString()} characters · Background that shapes this agent's personality and approach`
            }
            fullWidth
            required
            multiline
            minRows={16}
            slotProps={{
              input: {
                sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
              },
            }}
          />
          <AgentSkillSelector
            selectedSkills={selectedSkills}
            onChange={setSelectedSkills}
            disabled={isAdding}
          />
          <AgentExtraSelectors
            selectedTools={selectedTools}
            onToolsChange={setSelectedTools}
            selectedMcps={selectedMcps}
            onMcpsChange={setSelectedMcps}
            selectedKnowledge={selectedKnowledge}
            onKnowledgeChange={setSelectedKnowledge}
            disabled={isAdding}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
              Add Agent
            </Button>
            <Button variant="outlined" onClick={() => navigate('/agents')}>
              Cancel
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
