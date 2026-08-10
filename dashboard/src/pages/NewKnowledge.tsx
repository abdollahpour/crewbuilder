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
import { KnowledgeFormSkeleton } from '../components/KnowledgeSkeletons'
import { useKnowledge } from '../context/KnowledgeContext'
import {
  formatContentSize,
  validateKnowledgeContent,
  validateKnowledgeNameUnique,
} from '../types/knowledge'

export default function NewKnowledge() {
  const navigate = useNavigate()
  const { addKnowledge, isAdding, knowledge } = useKnowledge()
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [nameError, setNameError] = useState('')
  const [contentError, setContentError] = useState('')

  function handleNameChange(value: string) {
    setName(value)
    setNameError(validateKnowledgeNameUnique(value, knowledge) ?? '')
  }

  function handleContentChange(value: string) {
    setContent(value)
    setContentError(validateKnowledgeContent(value) ?? '')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextNameError = validateKnowledgeNameUnique(name, knowledge) ?? ''
    const nextContentError = validateKnowledgeContent(content) ?? ''

    setNameError(nextNameError)
    setContentError(nextContentError)

    if (nextNameError || nextContentError) return

    await addKnowledge({
      name: name.trim(),
      content,
    })
    navigate('/knowledge')
  }

  const isSubmitDisabled =
    isAdding ||
    Boolean(validateKnowledgeNameUnique(name, knowledge)) ||
    Boolean(validateKnowledgeContent(content))

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/knowledge')}
          disabled={isAdding}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          New Knowledge
        </Typography>
      </Box>

      {isAdding ? (
        <KnowledgeFormSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            error={Boolean(nameError)}
            helperText={nameError || 'Lowercase letters, numbers, and hyphens (e.g. product-docs)'}
            fullWidth
            required
          />
          <TextField
            label="Content"
            value={content}
            onChange={(event) => handleContentChange(event.target.value)}
            error={Boolean(contentError)}
            helperText={
              contentError ||
              `${formatContentSize(content)} · Markdown or plain text, up to 1 MB`
            }
            fullWidth
            required
            multiline
            minRows={20}
            slotProps={{
              input: {
                sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
              Add Knowledge
            </Button>
            <Button variant="outlined" onClick={() => navigate('/knowledge')}>
              Cancel
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
