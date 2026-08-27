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
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NewMcpSkeleton } from '../components/McpSkeletons'
import { useMcps } from '../context/McpContext'
import { formValuesEqual, useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'
import {
  headersToInputs,
  type McpHeaderInput,
  validateMcpHeaderKey,
  validateMcpHeaderValue,
  validateMcpHeaders,
  validateMcpUrl,
} from '../types/mcp'

const EMPTY_HEADER: McpHeaderInput = { key: '', value: '' }

export default function EditMcp() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { mcps, isLoading, updateMcp, updatingId } = useMcps()
  const mcp = mcps.find((item) => item.id === id)

  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState<McpHeaderInput[]>([{ ...EMPTY_HEADER }])
  const [urlError, setUrlError] = useState('')
  const [headerErrors, setHeaderErrors] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ])

  useEffect(() => {
    if (!mcp) return

    setUrl(mcp.url)
    const nextHeaders = headersToInputs(mcp.headers)
    setHeaders(nextHeaders)
    setHeaderErrors(nextHeaders.map(() => ({ key: '', value: '' })))
  }, [mcp])

  useEffect(() => {
    if (!isLoading && id && !mcp) {
      navigate('/mcps', { replace: true })
    }
  }, [id, isLoading, mcp, navigate])

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

  const isSubmitting = updatingId === id
  const isDirty = mcp
    ? !formValuesEqual(
        { url, headers },
        { url: mcp.url, headers: headersToInputs(mcp.headers) },
      )
    : false
  const { allowLeave, dialog } = useUnsavedChangesGuard(isDirty)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return

    const nextUrlError = validateMcpUrl(url) ?? ''
    const nextHeaderErrors = validateMcpHeaders(headers)

    setUrlError(nextUrlError)
    setHeaderErrors(nextHeaderErrors)

    const hasHeaderErrors = nextHeaderErrors.some((error) => error.key || error.value)
    if (nextUrlError || hasHeaderErrors) return

    await updateMcp(id, {
      url: url.trim(),
      headers,
    })
    allowLeave()
    navigate('/mcps')
  }

  function handleCancel() {
    allowLeave()
    navigate('/mcps')
  }

  const isSubmitDisabled =
    isSubmitting ||
    Boolean(validateMcpUrl(url)) ||
    validateMcpHeaders(headers).some((error) => error.key || error.value)

  if (isLoading || !mcp) {
    return (
      <>
        <NewMcpSkeleton />
        {dialog}
      </>
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/mcps')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Edit MCP
        </Typography>
      </Box>

      {isSubmitting ? (
        <NewMcpSkeleton />
      ) : (
        <Stack spacing={3}>
          <TextField
            label="Name"
            value={mcp.name}
            fullWidth
            disabled
            helperText="Name cannot be changed after creation"
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
              Save MCP
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
