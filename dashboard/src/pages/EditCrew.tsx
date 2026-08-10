import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CrewAgentSelector from '../components/CrewAgentSelector'
import { CrewFormSkeleton } from '../components/CrewSkeletons'
import { useCrews } from '../context/CrewContext'
import { validateCrewModel, validateCrewRules } from '../types/crew'

export default function EditCrew() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { crews, isLoading, updateCrew, updatingId } = useCrews()
  const crew = crews.find((item) => item.id === id)

  const [model, setModel] = useState('')
  const [rules, setRules] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [modelError, setModelError] = useState('')
  const [rulesError, setRulesError] = useState('')

  useEffect(() => {
    if (!crew) return

    setModel(crew.model)
    setRules(crew.rules)
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

  function handleRulesChange(value: string) {
    setRules(value)
    setRulesError(validateCrewRules(value) ?? '')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return

    const nextModelError = validateCrewModel(model) ?? ''
    const nextRulesError = validateCrewRules(rules) ?? ''

    setModelError(nextModelError)
    setRulesError(nextRulesError)

    if (nextModelError || nextRulesError) return

    await updateCrew(id, {
      model: model.trim(),
      rules: rules.trim(),
      agents: selectedAgents,
    })
    navigate('/crews')
  }

  const isSubmitting = updatingId === id
  const isSubmitDisabled =
    isSubmitting ||
    Boolean(validateCrewModel(model)) ||
    Boolean(validateCrewRules(rules))

  if (isLoading || !crew) {
    return <CrewFormSkeleton />
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
            label="Rules"
            value={rules}
            onChange={(event) => handleRulesChange(event.target.value)}
            error={Boolean(rulesError)}
            helperText={
              rulesError ||
              `${rules.length.toLocaleString()} characters · Instructions and constraints for this crew`
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
            <Button variant="outlined" onClick={() => navigate('/crews')}>
              Cancel
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
