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
  validateAgentDescription,
  validateAgentModel,
  validateAgentNameUnique,
  validateAgentRules,
} from '../types/agent'

export default function NewAgent() {
  const navigate = useNavigate()
  const { addAgent, isAdding, agents } = useAgents()
  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedMcps, setSelectedMcps] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([])
  const [nameError, setNameError] = useState('')
  const [modelError, setModelError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [rulesError, setRulesError] = useState('')

  function handleNameChange(value: string) {
    setName(value)
    setNameError(validateAgentNameUnique(value, agents) ?? '')
  }

  function handleModelChange(value: string) {
    setModel(value)
    setModelError(validateAgentModel(value) ?? '')
  }

  function handleDescriptionChange(value: string) {
    setDescription(value)
    setDescriptionError(validateAgentDescription(value) ?? '')
  }

  function handleRulesChange(value: string) {
    setRules(value)
    setRulesError(validateAgentRules(value) ?? '')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextNameError = validateAgentNameUnique(name, agents) ?? ''
    const nextModelError = validateAgentModel(model) ?? ''
    const nextDescriptionError = validateAgentDescription(description) ?? ''
    const nextRulesError = validateAgentRules(rules) ?? ''

    setNameError(nextNameError)
    setModelError(nextModelError)
    setDescriptionError(nextDescriptionError)
    setRulesError(nextRulesError)

    if (nextNameError || nextModelError || nextDescriptionError || nextRulesError) return

    await addAgent({
      name: name.trim(),
      model: model.trim(),
      description: description.trim(),
      rules: rules.trim(),
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
    Boolean(validateAgentDescription(description)) ||
    Boolean(validateAgentRules(rules))

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
            label="Description"
            value={description}
            onChange={(event) => handleDescriptionChange(event.target.value)}
            error={Boolean(descriptionError)}
            helperText={
              descriptionError ||
              `${description.length.toLocaleString()} characters · Short summary of what this agent does`
            }
            fullWidth
            required
            multiline
            minRows={4}
          />
          <TextField
            label="Rules"
            value={rules}
            onChange={(event) => handleRulesChange(event.target.value)}
            error={Boolean(rulesError)}
            helperText={
              rulesError ||
              `${rules.length.toLocaleString()} characters · Instructions and constraints for this agent`
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
