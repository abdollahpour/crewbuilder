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
import { formValuesEqual, useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'
import {
  validateAgentBackstory,
  validateAgentGoal,
  validateAgentModel,
  validateAgentRole,
} from '../types/agent'

export default function EditAgent() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { agents, isLoading, updateAgent, updatingId } = useAgents()
  const agent = agents.find((item) => item.id === id)

  const [model, setModel] = useState('')
  const [role, setRole] = useState('')
  const [goal, setGoal] = useState('')
  const [backstory, setBackstory] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [selectedMcps, setSelectedMcps] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedKnowledge, setSelectedKnowledge] = useState<string[]>([])
  const [modelError, setModelError] = useState('')
  const [roleError, setRoleError] = useState('')
  const [goalError, setGoalError] = useState('')
  const [backstoryError, setBackstoryError] = useState('')

  useEffect(() => {
    if (!agent) return

    setModel(agent.model)
    setRole(agent.role)
    setGoal(agent.goal)
    setBackstory(agent.backstory)
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

  const isSubmitting = updatingId === id
  const isDirty = agent
    ? !formValuesEqual(
        {
          model,
          role,
          goal,
          backstory,
          tools: selectedTools,
          mcps: selectedMcps,
          skills: selectedSkills,
          knowledge: selectedKnowledge,
        },
        {
          model: agent.model,
          role: agent.role,
          goal: agent.goal,
          backstory: agent.backstory,
          tools: agent.tools,
          mcps: agent.mcps,
          skills: agent.skills,
          knowledge: agent.knowledge,
        },
      )
    : false
  const { allowLeave, dialog } = useUnsavedChangesGuard(isDirty)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return

    const nextModelError = validateAgentModel(model) ?? ''
    const nextRoleError = validateAgentRole(role) ?? ''
    const nextGoalError = validateAgentGoal(goal) ?? ''
    const nextBackstoryError = validateAgentBackstory(backstory) ?? ''

    setModelError(nextModelError)
    setRoleError(nextRoleError)
    setGoalError(nextGoalError)
    setBackstoryError(nextBackstoryError)

    if (nextModelError || nextRoleError || nextGoalError || nextBackstoryError) return

    await updateAgent(id, {
      model: model.trim(),
      role: role.trim(),
      goal: goal.trim(),
      backstory: backstory.trim(),
      tools: selectedTools,
      mcps: selectedMcps,
      skills: selectedSkills,
      knowledge: selectedKnowledge,
    })
    allowLeave()
    navigate('/agents')
  }

  function handleCancel() {
    allowLeave()
    navigate('/agents')
  }

  const isSubmitDisabled =
    isSubmitting ||
    Boolean(validateAgentModel(model)) ||
    Boolean(validateAgentRole(role)) ||
    Boolean(validateAgentGoal(goal)) ||
    Boolean(validateAgentBackstory(backstory))

  if (isLoading || !agent) {
    return (
      <>
        <AgentFormSkeleton />
        {dialog}
      </>
    )
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
