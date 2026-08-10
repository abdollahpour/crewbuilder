import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NewMcpSkeleton } from '../components/McpSkeletons'
import { useMcps } from '../context/McpContext'
import {
  type McpHeaderInput,
  validateMcpHeaderKey,
  validateMcpHeaderValue,
  validateMcpHeaders,
  validateMcpNameUnique,
  validateMcpUrl,
} from '../types/mcp'

const EMPTY_HEADER: McpHeaderInput = { key: '', value: '' }

export default function NewMcp() {
  const navigate = useNavigate()
  const { addMcp, isAdding, mcps } = useMcps()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<McpHeaderInput[]>([{ ...EMPTY_HEADER }])
  const [nameError, setNameError] = useState('')
  const [urlError, setUrlError] = useState('')
  const [headerErrors, setHeaderErrors] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ])

  function handleNameChange(value: string) {
    setName(value)
    setNameError(validateMcpNameUnique(value, mcps) ?? '')
  }

  function handleUrlChange(value: string) {
    setUrl(value)
    setUrlError(validateMcpUrl(value) ?? '')
  }

  function handleHeaderChange(index: number, field: keyof McpHeaderInput, value: string) {
    setHeaders((current) =>
      current.map((header, headerIndex) =>
        headerIndex === index ? { ...header, [field]: value } : header,
      ),
    )

    setHeaderErrors((current) =>
      current.map((error, errorIndex) => {
        if (errorIndex !== index) return error

        if (field === 'key') {
          return { ...error, key: validateMcpHeaderKey(value) ?? '' }
        }

        return { ...error, value: validateMcpHeaderValue(value) ?? '' }
      }),
    )
  }

  function addHeaderRow() {
    setHeaders((current) => [...current, { ...EMPTY_HEADER }])
    setHeaderErrors((current) => [...current, { key: '', value: '' }])
  }

  function removeHeaderRow(index: number) {
    setHeaders((current) => current.filter((_, headerIndex) => headerIndex !== index))
    setHeaderErrors((current) => current.filter((_, errorIndex) => errorIndex !== index))
  }

  function validateHeaderFields(headersToValidate: McpHeaderInput[]) {
    return validateMcpHeaders(headersToValidate)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextNameError = validateMcpNameUnique(name, mcps) ?? ''
    const nextUrlError = validateMcpUrl(url) ?? ''
    const nextHeaderErrors = validateHeaderFields(headers)

    setNameError(nextNameError)
    setUrlError(nextUrlError)
    setHeaderErrors(nextHeaderErrors)

    const hasHeaderErrors = nextHeaderErrors.some((error) => error.key || error.value)
    if (nextNameError || nextUrlError || hasHeaderErrors) return

    await addMcp({
      name: name.trim(),
      url: url.trim(),
      headers,
    })
    navigate('/mcps')
  }

  const isSubmitDisabled =
    isAdding ||
    Boolean(validateMcpNameUnique(name, mcps)) ||
    Boolean(validateMcpUrl(url)) ||
    validateHeaderFields(headers).some((error) => error.key || error.value)

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/mcps')}
          disabled={isAdding}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          New MCP
        </Typography>
      </Box>

      {isAdding ? (
        <NewMcpSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            error={Boolean(nameError)}
            helperText={nameError || 'Lowercase letters, numbers, and hyphens (e.g. weather-agent)'}
            fullWidth
            required
          />
          <TextField
            label="URL"
            value={url}
            onChange={(event) => handleUrlChange(event.target.value)}
            error={Boolean(urlError)}
            helperText={urlError}
            fullWidth
            required
          />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <Typography variant="subtitle1">Headers</Typography>
              <Typography variant="body2" color="text.secondary">
                (optional)
              </Typography>
            </Box>
            <Stack spacing={2}>
              {headers.map((header, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    label="Header name"
                    value={header.key}
                    onChange={(event) => handleHeaderChange(index, 'key', event.target.value)}
                    error={Boolean(headerErrors[index]?.key)}
                    helperText={headerErrors[index]?.key}
                    fullWidth
                  />
                  <TextField
                    label="Header value"
                    value={header.value}
                    onChange={(event) => handleHeaderChange(index, 'value', event.target.value)}
                    error={Boolean(headerErrors[index]?.value)}
                    helperText={headerErrors[index]?.value}
                    fullWidth
                  />
                  <IconButton
                    aria-label="Remove header"
                    onClick={() => removeHeaderRow(index)}
                    disabled={headers.length === 1}
                    sx={{ mt: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Box>
                <Button startIcon={<AddIcon />} onClick={addHeaderRow}>
                  Add header
                </Button>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={isSubmitDisabled}>
              Add MCP
            </Button>
            <Button variant="outlined" onClick={() => navigate('/mcps')}>
              Cancel
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
