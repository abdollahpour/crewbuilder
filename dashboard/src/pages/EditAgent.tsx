import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AgentExtraSelectors from '../components/AgentExtraSelectors'
import AgentSkillSelector from '../components/AgentSkillSelector'
import { AgentFormSkeleton } from '../components/AgentSkeletons'
import { useAgents } from '../context/AgentContext'
import {
  validateAgentDescription,
  validateAgentModel,
  validateAgentRules,
} from '../types/agent'

export default function EditAgent() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { agents, isLoading, updateAgent, updatingId } = useAgents()
  const agent = agents.find((item) => item.id === id)

  const [model, setModel] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedMcps, setSelectedMcps] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([])
  const [modelError, setModelError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [rulesError, setRulesError] = useState('')

  useEffect(() => {
    if (!agent) return

    setModel(agent.model)
    setDescription(agent.description)
    setRules(agent.rules)
    setSelectedTools(agent.tools)
    setSelectedMcps(agent.mcps)
    setSelectedSkills(agent.skills)
    setSelectedKnowledge(agent.knowledge)
  }, [agent])

  useEffect(() => {
    if (!isLoading && id && !agent) {
      navigate('/agents', { replace: true })
    }
  }, [id, isLoading, agent, navigate])

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
    if (!id) return

    const nextModelError = validateAgentModel(model) ?? ''
    const nextDescriptionError = validateAgentDescription(description) ?? ''
    const nextRulesError = validateAgentRules(rules) ?? ''

    setModelError(nextModelError)
    setDescriptionError(nextDescriptionError)
    setRulesError(nextRulesError)

    if (nextModelError || nextDescriptionError || nextRulesError) return

    await updateAgent(id, {
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

  const isSubmitting = updatingId === id
  const isSubmitDisabled =
    isSubmitting ||
    Boolean(validateAgentModel(model)) ||
    Boolean(validateAgentDescription(description)) ||
    Boolean(validateAgentRules(rules))

  if (isLoading || !agent) {
    return <AgentFormSkeleton />
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/agents')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Edit Agent
        </Typography>
      </Box>

      {isSubmitting ? (
        <AgentFormSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={agent.name}
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
            disabled={isSubmitting}
          />
          <AgentExtraSelectors
            selectedTools={selectedTools}
            onToolsChange={setSelectedTools}
            selectedMcps={selectedMcps}
            onMcpsChange={setSelectedMcps}
            selectedKnowledge={selectedKnowledge}
            onKnowledgeChange={setSelectedKnowledge}
            disabled={isSubmitting}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
              Save Agent
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
