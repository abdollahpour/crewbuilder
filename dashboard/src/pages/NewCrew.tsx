import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CrewAgentSelector from '../components/CrewAgentSelector'
import { CrewFormSkeleton } from '../components/CrewSkeletons'
import { useCrews } from '../context/CrewContext'
import { validateCrewModel, validateCrewNameUnique, validateCrewRules } from '../types/crew'

export default function NewCrew() {
  const navigate = useNavigate()
  const { addCrew, isAdding, crews } = useCrews()
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [rules, setRules] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [nameError, setNameError] = useState('')
  const [modelError, setModelError] = useState('')
  const [rulesError, setRulesError] = useState('')

  function handleNameChange(value: string) {
    setName(value)
    setNameError(validateCrewNameUnique(value, crews) ?? '')
  }

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

    const nextNameError = validateCrewNameUnique(name, crews) ?? ''
    const nextModelError = validateCrewModel(model) ?? ''
    const nextRulesError = validateCrewRules(rules) ?? ''

    setNameError(nextNameError)
    setModelError(nextModelError)
    setRulesError(nextRulesError)

    if (nextNameError || nextModelError || nextRulesError) return

    await addCrew({
      name: name.trim(),
      model: model.trim(),
      rules: rules.trim(),
      agents: selectedAgents,
    })
    navigate('/crews')
  }

  const isSubmitDisabled =
    isAdding ||
    Boolean(validateCrewNameUnique(name, crews)) ||
    Boolean(validateCrewModel(model)) ||
    Boolean(validateCrewRules(rules))

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
