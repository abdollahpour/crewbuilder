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
import { SkillFormSkeleton } from '../components/SkillSkeletons'
import SkillToolsSelector from '../components/SkillToolsSelector'
import AgentMcpSelector from '../components/AgentMcpSelector'
import AgentKnowledgeSelector from '../components/AgentKnowledgeSelector'
import { useSkills } from '../context/SkillContext'
import { formValuesEqual, useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'
import {
  formatSkillDescriptionSize,
  formatSkillMdSize,
  validateSkillDescription,
  validateSkillMd,
} from '../types/skill'

export default function EditSkill() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { skills, isLoading, updateSkill, updatingId } = useSkills()
  const skill = skills.find((item) => item.id === id)

  const [description, setDescription] = useState('')
  const [skillMd, setSkillMd] = useState('')
  const [toolsRequired, setToolsRequired] = useState<string[]>([])
  const [mcps, setMcps] = useState<string[]>([])
  const [knowledge, setKnowledge] = useState<string[]>([])
  const [descriptionError, setDescriptionError] = useState('')
  const [skillMdError, setSkillMdError] = useState('')

  useEffect(() => {
    if (!skill) return

    setDescription(skill.description)
    setSkillMd(skill.skillMd)
    setToolsRequired(skill.toolsRequired)
    setMcps(skill.mcps)
    setKnowledge(skill.knowledge)
  }, [skill])

  useEffect(() => {
    if (!isLoading && id && !skill) {
      navigate('/skills', { replace: true })
    }
  }, [id, isLoading, skill, navigate])

  function handleDescriptionChange(value: string) {
    setDescription(value)
    setDescriptionError(validateSkillDescription(value) ?? '')
  }

  function handleSkillMdChange(value: string) {
    setSkillMd(value)
    setSkillMdError(validateSkillMd(value) ?? '')
  }

  const isSubmitting = updatingId === id
  const isDirty = skill
    ? !formValuesEqual(
        { description, skillMd, toolsRequired, mcps, knowledge },
        {
          description: skill.description,
          skillMd: skill.skillMd,
          toolsRequired: skill.toolsRequired,
          mcps: skill.mcps,
          knowledge: skill.knowledge,
        },
      )
    : false
  const { allowLeave, dialog } = useUnsavedChangesGuard(isDirty)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return

    const nextDescriptionError = validateSkillDescription(description) ?? ''
    const nextSkillMdError = validateSkillMd(skillMd) ?? ''

    setDescriptionError(nextDescriptionError)
    setSkillMdError(nextSkillMdError)

    if (nextDescriptionError || nextSkillMdError) return

    await updateSkill(id, {
      description: description.trim(),
      skillMd: skillMd.trim(),
      toolsRequired,
      mcps,
      knowledge,
    })
    allowLeave()
    navigate('/skills')
  }

  function handleCancel() {
    allowLeave()
    navigate('/skills')
  }

  const isSubmitDisabled =
    isSubmitting ||
    Boolean(validateSkillDescription(description)) ||
    Boolean(validateSkillMd(skillMd))

  if (isLoading || !skill) {
    return (
      <>
        <SkillFormSkeleton />
        {dialog}
      </>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/skills')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Edit Skill
        </Typography>
      </Box>

      {isSubmitting ? (
        <SkillFormSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="name"
            value={skill.name}
            fullWidth
            disabled
            helperText="Name cannot be changed after creation"
          />
          <TextField
            label="description"
            value={description}
            onChange={(event) => handleDescriptionChange(event.target.value)}
            error={Boolean(descriptionError)}
            helperText={
              descriptionError ||
              `${formatSkillDescriptionSize(description.length)} · Brief description of what this skill does and when to use it`
            }
            fullWidth
            required
            multiline
            minRows={4}
          />
          <SkillToolsSelector
            selectedTools={toolsRequired}
            onChange={setToolsRequired}
            disabled={isSubmitting}
          />
          <AgentMcpSelector
            selectedMcps={mcps}
            onChange={setMcps}
            disabled={isSubmitting}
          />
          <AgentKnowledgeSelector
            selectedKnowledge={knowledge}
            onChange={setKnowledge}
            disabled={isSubmitting}
          />
          <TextField
            label="skill_md"
            value={skillMd}
            onChange={(event) => handleSkillMdChange(event.target.value)}
            error={Boolean(skillMdError)}
            helperText={
              skillMdError ||
              `${formatSkillMdSize(skillMd.length)} · Markdown body following the SKILL.md format`
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
              Save Skill
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
