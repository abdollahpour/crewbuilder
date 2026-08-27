import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CrewAgentSelector from '../components/CrewAgentSelector'
import { CrewFormSkeleton } from '../components/CrewSkeletons'
import { useCrews } from '../context/CrewContext'
import { formValuesEqual, useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'
import {
  validateCrewBackstory,
  validateCrewGoal,
  validateCrewModel,
  validateCrewRole,
} from '../types/crew'

export default function EditCrew() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { crews, isLoading, updateCrew, updatingId } = useCrews()
  const crew = crews.find((item) => item.id === id)

  const [model, setModel] = useState('')
  const [role, setRole] = useState('')
  const [goal, setGoal] = useState('')
  const [backstory, setBackstory] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [modelError, setModelError] = useState('')
  const [roleError, setRoleError] = useState('')
  const [goalError, setGoalError] = useState('')
  const [backstoryError, setBackstoryError] = useState('')

  useEffect(() => {
    if (!crew) return

    setModel(crew.model)
    setRole(crew.role)
    setGoal(crew.goal)
    setBackstory(crew.backstory)
    setSelectedAgents(crew.agents)
  }, [crew])

  useEffect(() => {
    if (!isLoading && id && !crew) {
      navigate('/crews', { replace: true })
    }
  }, [id, isLoading, crew, navigate])

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

  const isSubmitting = updatingId === id
  const isDirty = crew
    ? !formValuesEqual(
        { model, role, goal, backstory, agents: selectedAgents },
        {
          model: crew.model,
          role: crew.role,
          goal: crew.goal,
          backstory: crew.backstory,
          agents: crew.agents,
        },
      )
    : false
  const { allowLeave, dialog } = useUnsavedChangesGuard(isDirty)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return

    const nextModelError = validateCrewModel(model) ?? ''
    const nextRoleError = validateCrewRole(role) ?? ''
    const nextGoalError = validateCrewGoal(goal) ?? ''
    const nextBackstoryError = validateCrewBackstory(backstory) ?? ''

    setModelError(nextModelError)
    setRoleError(nextRoleError)
    setGoalError(nextGoalError)
    setBackstoryError(nextBackstoryError)

    if (nextModelError || nextRoleError || nextGoalError || nextBackstoryError) return

    await updateCrew(id, {
      model: model.trim(),
      role: role.trim(),
      goal: goal.trim(),
      backstory: backstory.trim(),
      agents: selectedAgents,
    })
    allowLeave()
    navigate('/crews')
  }

  function handleCancel() {
    allowLeave()
    navigate('/crews')
  }

  const isSubmitDisabled =
    isSubmitting ||
    Boolean(validateCrewModel(model)) ||
    Boolean(validateCrewRole(role)) ||
    Boolean(validateCrewGoal(goal)) ||
    Boolean(validateCrewBackstory(backstory))

  if (isLoading || !crew) {
    return (
      <>
        <CrewFormSkeleton />
        {dialog}
      </>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/crews')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Edit Crew
        </Typography>
      </Box>

      {isSubmitting ? (
        <CrewFormSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={crew.name}
            fullWidth
            disabled
            helperText="Name cannot be changed after creation"
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
            disabled={isSubmitting}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
              Save Crew
            </Button>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Stack>
      )}
      {dialog}
    </Box>
  )
}
