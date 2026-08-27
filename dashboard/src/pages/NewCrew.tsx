import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CrewAgentSelector from '../components/CrewAgentSelector'
import { CrewFormSkeleton } from '../components/CrewSkeletons'
import { useCrews } from '../context/CrewContext'
import {
  validateCrewBackstory,
  validateCrewGoal,
  validateCrewModel,
  validateCrewNameUnique,
  validateCrewRole,
} from '../types/crew'

export default function NewCrew() {
  const navigate = useNavigate()
  const { addCrew, isAdding, crews } = useCrews()
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [role, setRole] = useState('')
  const [goal, setGoal] = useState('')
  const [backstory, setBackstory] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [nameError, setNameError] = useState('')
  const [modelError, setModelError] = useState('')
  const [roleError, setRoleError] = useState('')
  const [goalError, setGoalError] = useState('')
  const [backstoryError, setBackstoryError] = useState('')

  function handleNameChange(value: string) {
    setName(value)
    setNameError(validateCrewNameUnique(value, crews) ?? '')
  }

  function handleModelChange(value: string) {
    setModel(value)
    setModelError(validateCrewModel(value) ?? '')
  }

  function handleRoleChange(value: string) {
    setRole(value)
    setRoleError(validateCrewRole(value) ?? '')
  }

  function handleGoalChange(value: string) {
    setGoal(value)
    setGoalError(validateCrewGoal(value) ?? '')
  }

  function handleBackstoryChange(value: string) {
    setBackstory(value)
    setBackstoryError(validateCrewBackstory(value) ?? '')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextNameError = validateCrewNameUnique(name, crews) ?? ''
    const nextModelError = validateCrewModel(model) ?? ''
    const nextRoleError = validateCrewRole(role) ?? ''
    const nextGoalError = validateCrewGoal(goal) ?? ''
    const nextBackstoryError = validateCrewBackstory(backstory) ?? ''

    setNameError(nextNameError)
    setModelError(nextModelError)
    setRoleError(nextRoleError)
    setGoalError(nextGoalError)
    setBackstoryError(nextBackstoryError)

    if (nextNameError || nextModelError || nextRoleError || nextGoalError || nextBackstoryError) {
      return
    }

    await addCrew({
      name: name.trim(),
      model: model.trim(),
      role: role.trim(),
      goal: goal.trim(),
      backstory: backstory.trim(),
      agents: selectedAgents,
    })
    navigate('/crews')
  }

  const isSubmitDisabled =
    isAdding ||
    Boolean(validateCrewNameUnique(name, crews)) ||
    Boolean(validateCrewModel(model)) ||
    Boolean(validateCrewRole(role)) ||
    Boolean(validateCrewGoal(goal)) ||
    Boolean(validateCrewBackstory(backstory))

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/crews')}
          disabled={isAdding}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          New Crew
        </Typography>
      </Box>

      {isAdding ? (
        <CrewFormSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            error={Boolean(nameError)}
            helperText={nameError || 'Lowercase letters, numbers, and hyphens (e.g. my-crew)'}
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
              `${role.length.toLocaleString()} characters · Crew role title that appears in prompts and logs`
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
              `${goal.length.toLocaleString()} characters · The crew's primary objective`
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
              `${backstory.length.toLocaleString()} characters · Background that shapes this crew's personality and approach`
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
          <CrewAgentSelector
            selectedAgents={selectedAgents}
            onChange={setSelectedAgents}
            disabled={isAdding}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
              Add Crew
            </Button>
            <Button variant="outlined" onClick={() => navigate('/crews')}>
              Cancel
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
