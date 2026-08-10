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
import { NewGraphifySkeleton } from '../components/GraphifySkeletons'
import { useGraphifys } from '../context/GraphifysContext'
import {
  formatCharacterCount,
  MAX_GRAPHIFY_DESCRIPTION_LENGTH,
  validateGraphifyDescription,
  validateGraphifyUri,
} from '../types/graphify'

function getHelperText(length: number, max: number, error: string) {
  const count = formatCharacterCount(length, max)
  return error ? `${count} · ${error}` : count
}

export default function NewGraphify() {
  const navigate = useNavigate()
  const { addGraphify, isAdding } = useGraphifys()
  const [uri, setUri] = useState('')
  const [description, setDescription] = useState('')
  const [uriError, setUriError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')

  function handleUriChange(value: string) {
    setUri(value)
    setUriError(validateGraphifyUri(value) ?? '')
  }

  function handleDescriptionChange(value: string) {
    setDescription(value)
    setDescriptionError(validateGraphifyDescription(value) ?? '')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextUriError = validateGraphifyUri(uri) ?? ''
    const nextDescriptionError = validateGraphifyDescription(description) ?? ''

    setUriError(nextUriError)
    setDescriptionError(nextDescriptionError)

    if (nextUriError || nextDescriptionError) return

    await addGraphify({
      uri: uri.trim(),
      description: description.trim(),
    })
    navigate('/graphifys')
  }

  const isSubmitDisabled =
    isAdding ||
    Boolean(validateGraphifyUri(uri)) ||
    Boolean(validateGraphifyDescription(description))

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/graphifys')}
          disabled={isAdding}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          New Graphify
        </Typography>
      </Box>

      {isAdding ? (
        <NewGraphifySkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="URI"
            value={uri}
            onChange={(event) => handleUriChange(event.target.value)}
            error={Boolean(uriError)}
            helperText={uriError}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => handleDescriptionChange(event.target.value)}
            error={Boolean(descriptionError)}
            helperText={getHelperText(
              description.length,
              MAX_GRAPHIFY_DESCRIPTION_LENGTH,
              descriptionError,
            )}
            fullWidth
            required
            multiline
            minRows={6}
            slotProps={{
              htmlInput: { maxLength: MAX_GRAPHIFY_DESCRIPTION_LENGTH },
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
              Add Graphify
            </Button>
            <Button variant="outlined" onClick={() => navigate('/graphifys')}>
              Cancel
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
