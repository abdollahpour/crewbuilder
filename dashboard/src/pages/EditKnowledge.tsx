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
import { KnowledgeFormSkeleton } from '../components/KnowledgeSkeletons'
import { useKnowledge } from '../context/KnowledgeContext'
import { formValuesEqual, useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'
import {
  formatContentSize,
  validateKnowledgeContent,
} from '../types/knowledge'

export default function EditKnowledge() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { knowledge: entries, isLoading, updateKnowledge, updatingId } = useKnowledge()
  const knowledge = entries.find((item) => item.id === id)

  const [content, setContent] = useState('')
  const [contentError, setContentError] = useState('')

  useEffect(() => {
    if (!knowledge) return

    setContent(knowledge.content)
  }, [knowledge])

  useEffect(() => {
    if (!isLoading && id && !knowledge) {
      navigate('/knowledge', { replace: true })
    }
  }, [id, isLoading, knowledge, navigate])

  function handleContentChange(value: string) {
    setContent(value)
    setContentError(validateKnowledgeContent(value) ?? '')
  }

  const isSubmitting = updatingId === id
  const isDirty = knowledge ? !formValuesEqual(content, knowledge.content) : false
  const { allowLeave, dialog } = useUnsavedChangesGuard(isDirty)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return

    const nextContentError = validateKnowledgeContent(content) ?? ''

    setContentError(nextContentError)

    if (nextContentError) return

    await updateKnowledge(id, {
      content,
    })
    allowLeave()
    navigate('/knowledge')
  }

  function handleCancel() {
    allowLeave()
    navigate('/knowledge')
  }

  const isSubmitDisabled =
    isSubmitting ||
    Boolean(validateKnowledgeContent(content))

  if (isLoading || !knowledge) {
    return (
      <>
        <KnowledgeFormSkeleton />
        {dialog}
      </>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/knowledge')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Edit Knowledge
        </Typography>
      </Box>

      {isSubmitting ? (
        <KnowledgeFormSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={knowledge.name}
            fullWidth
            disabled
            helperText="Name cannot be changed after creation"
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
              Save Knowledge
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
