import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import HubIcon from '@mui/icons-material/Hub'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { fetchMcpUsage } from '../api/mcp'
import PageHeader from '../components/list/PageHeader'
import { ResourceList, ResourceListItem, ResourceListSection } from '../components/list/ResourceList'
import ResourceListEmpty from '../components/list/ResourceListEmpty'
import ResourceListSkeleton from '../components/list/ResourceListSkeleton'
import { useMcps } from '../context/McpContext'
import { downloadMcpConfig, type Mcp, type McpUsage } from '../types/mcp'

export default function Mcp() {
  const navigate = useNavigate()
  const { mcps, isLoading, loadError, deletingId, deleteMcp } = useMcps()
  const [mcpToDelete, setMcpToDelete] = useState<Mcp | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [usage, setUsage] = useState<McpUsage | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState<string | null>(null)

  const hasUsage = usage !== null && (usage.agents.length > 0 || usage.skills.length > 0)

  useEffect(() => {
    if (!mcpToDelete) {
      setUsage(null)
      setUsageError(null)
      return
    }

    let cancelled = false
    setUsageLoading(true)
    setUsageError(null)

    void fetchMcpUsage(mcpToDelete.name)
      .then((data) => {
        if (!cancelled) {
          setUsage(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsageError('Failed to check MCP usage')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setUsageLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [mcpToDelete])

  async function handleConfirmDelete() {
    if (!mcpToDelete || hasUsage) return

    setDeleteError(null)

    try {
      await deleteMcp(mcpToDelete.id)
      handleCloseDeleteDialog()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete MCP server')
    }
  }

  function handleCloseDeleteDialog() {
    setMcpToDelete(null)
    setDeleteError(null)
    setUsage(null)
    setUsageError(null)
  }

  return (
    <>
      <PageHeader title="MCPs">
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={() => downloadMcpConfig(mcps)}
          disabled={isLoading || mcps.length === 0}
        >
          Export JSON
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/mcps/new')}
          disabled={isLoading}
        >
          Add MCP
        </Button>
      </PageHeader>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {isLoading ? (
        <ResourceListSkeleton />
      ) : mcps.length === 0 ? (
        <ResourceListEmpty
          icon={<HubIcon sx={{ fontSize: 48 }} />}
          title="No MCP servers"
          description="You have not configured any MCP servers yet. Add one to connect external tools and services."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/mcps/new')}>
              Add MCP
            </Button>
          }
        />
      ) : (
        <ResourceList>
          {mcps.map((mcp, index) => (
            <ResourceListItem
              key={mcp.id}
              title={mcp.name}
              showDivider={index < mcps.length - 1}
              actions={
                <>
                  <IconButton
                    aria-label={`Test ${mcp.name}`}
                    onClick={() => navigate(`/mcps/${mcp.id}/test`)}
                    disabled={deletingId === mcp.id}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Edit ${mcp.name}`}
                    onClick={() => navigate(`/mcps/${mcp.id}/edit`)}
                    disabled={deletingId === mcp.id}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${mcp.name}`}
                    onClick={() => setMcpToDelete(mcp)}
                    disabled={deletingId === mcp.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ResourceListSection label="URL">
                <Link component={RouterLink} to={`/mcps/${mcp.id}`}>
                  {mcp.url}
                </Link>
              </ResourceListSection>
              {mcp.headers && Object.keys(mcp.headers).length > 0 ? (
                <ResourceListSection label="Headers" monospace>
                  {Object.entries(mcp.headers).map(([key, value]) => (
                    <Box key={key} component="div">
                      {key}: {value}
                    </Box>
                  ))}
                </ResourceListSection>
              ) : null}
            </ResourceListItem>
          ))}
        </ResourceList>
      )}

      <Dialog open={mcpToDelete !== null} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{hasUsage ? 'Cannot delete MCP server' : 'Delete MCP server?'}</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}

          {usageLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : usageError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {usageError}
            </Alert>
          ) : hasUsage ? (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>{mcpToDelete?.name}</strong> is still referenced and cannot be deleted.
                Remove it from the resources below first.
              </Alert>
              {usage!.agents.length > 0 ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Agents
                  </Typography>
                  <List dense disablePadding>
                    {usage!.agents.map((name) => (
                      <ListItem key={name} disablePadding>
                        <ListItemText
                          primary={
                            <Link component={RouterLink} to={`/agents/${name}/edit`}>
                              {name}
                            </Link>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : null}
              {usage!.skills.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Skills
                  </Typography>
                  <List dense disablePadding>
                    {usage!.skills.map((name) => (
                      <ListItem key={name} disablePadding>
                        <ListItemText
                          primary={
                            <Link component={RouterLink} to={`/skills/${name}/edit`}>
                              {name}
                            </Link>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : null}
            </>
          ) : (
            <DialogContentText>
              Are you sure you want to delete <strong>{mcpToDelete?.name}</strong>? This action
              cannot be undone.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deletingId !== null}>
            {hasUsage ? 'Close' : 'Cancel'}
          </Button>
          {!hasUsage ? (
            <Button
              onClick={() => void handleConfirmDelete()}
              color="error"
              variant="contained"
              disabled={deletingId !== null || usageLoading || usageError !== null}
            >
              Delete
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  )
}
