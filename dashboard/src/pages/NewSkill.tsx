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
import { SkillFormSkeleton } from '../components/SkillSkeletons'
import SkillToolsSelector from '../components/SkillToolsSelector'
import AgentMcpSelector from '../components/AgentMcpSelector'
import AgentKnowledgeSelector from '../components/AgentKnowledgeSelector'
import { useSkills } from '../context/SkillContext'
import {
  formatSkillDescriptionSize,
  formatSkillMdSize,
  validateSkillDescription,
  validateSkillMd,
  validateSkillNameUnique,
} from '../types/skill'

export default function NewSkill() {
  const navigate = useNavigate()
  const { addSkill, isAdding, skills } = useSkills()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [skillMd, setSkillMd] = useState('')
  const [toolsRequired, setToolsRequired] = useState<string[]>([])
  const [mcps, setMcps] = useState<string[]>([])
  const [knowledge, setKnowledge] = useState<string[]>([])
  const [nameError, setNameError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [skillMdError, setSkillMdError] = useState('')

  function handleNameChange(value: string) {
    setName(value)
    setNameError(validateSkillNameUnique(value, skills) ?? '')
  }

  function handleDescriptionChange(value: string) {
    setDescription(value)
    setDescriptionError(validateSkillDescription(value) ?? '')
  }

  function handleSkillMdChange(value: string) {
    setSkillMd(value)
    setSkillMdError(validateSkillMd(value) ?? '')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextNameError = validateSkillNameUnique(name, skills) ?? ''
    const nextDescriptionError = validateSkillDescription(description) ?? ''
    const nextSkillMdError = validateSkillMd(skillMd) ?? ''

    setNameError(nextNameError)
    setDescriptionError(nextDescriptionError)
    setSkillMdError(nextSkillMdError)

    if (nextNameError || nextDescriptionError || nextSkillMdError) return

    await addSkill({
      name: name.trim(),
      description: description.trim(),
      skillMd: skillMd.trim(),
      toolsRequired,
      mcps,
      knowledge,
    })
    navigate('/skills')
  }

  const isSubmitDisabled =
    isAdding ||
    Boolean(validateSkillNameUnique(name, skills)) ||
    Boolean(validateSkillDescription(description)) ||
    Boolean(validateSkillMd(skillMd))

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/skills')}
          disabled={isAdding}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          New Skill
        </Typography>
      </Box>

      {isAdding ? (
        <SkillFormSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            error={Boolean(nameError)}
            helperText={
              nameError ||
              '2–50 characters · Letters, numbers, underscores, and hyphens (e.g. example-skill)'
            }
            fullWidth
            required
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
            disabled={isAdding}
          />
          <AgentMcpSelector
            selectedMcps={mcps}
            onChange={setMcps}
            disabled={isAdding}
          />
          <AgentKnowledgeSelector
            selectedKnowledge={knowledge}
            onChange={setKnowledge}
            disabled={isAdding}
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
              Add Skill
            </Button>
            <Button variant="outlined" onClick={() => navigate('/skills')}>
              Cancel
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
