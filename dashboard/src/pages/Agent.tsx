import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SmartToyIcon from '@mui/icons-material/SmartToy'
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
import { fetchAgentUsage } from '../api/agent'
import AgentAttachments from '../components/AgentAttachments'
import PageHeader from '../components/list/PageHeader'
import { ResourceList, ResourceListItem } from '../components/list/ResourceList'
import ResourceListEmpty from '../components/list/ResourceListEmpty'
import ResourceListSkeleton from '../components/list/ResourceListSkeleton'
import { useAgents } from '../context/AgentContext'
import { truncateText, type Agent, type AgentUsage } from '../types/agent'

export default function Agent() {
  const navigate = useNavigate()
  const { agents, isLoading, loadError, deletingId, deleteAgent } = useAgents()
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [usage, setUsage] = useState<AgentUsage | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState<string | null>(null)

  const hasUsage = usage !== null && usage.crews.length > 0

  useEffect(() => {
    if (!agentToDelete) {
      setUsage(null)
      setUsageError(null)
      return
    }

    let cancelled = false
    setUsageLoading(true)
    setUsageError(null)

    void fetchAgentUsage(agentToDelete.name)
      .then((data) => {
        if (!cancelled) {
          setUsage(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsageError('Failed to check agent usage')
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
  }, [agentToDelete])

  async function handleConfirmDelete() {
    if (!agentToDelete || hasUsage) return

    setDeleteError(null)

    try {
      await deleteAgent(agentToDelete.id)
      handleCloseDeleteDialog()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete agent')
    }
  }

  function handleCloseDeleteDialog() {
    setAgentToDelete(null)
    setDeleteError(null)
    setUsage(null)
    setUsageError(null)
  }

  return (
    <>
      <PageHeader title="Agents">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/agents/new')}
          disabled={isLoading}
        >
          Add Agent
        </Button>
      </PageHeader>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {isLoading ? (
        <ResourceListSkeleton />
      ) : agents.length === 0 ? (
        <ResourceListEmpty
          icon={<SmartToyIcon sx={{ fontSize: 48 }} />}
          title="No agents"
          description="You have not configured any agents yet. Add one with a description and rules to guide its behavior."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/agents/new')}>
              Add Agent
            </Button>
          }
        />
      ) : (
        <ResourceList>
          {agents.map((agent, index) => (
            <ResourceListItem
              key={agent.id}
              title={agent.name}
              meta={agent.model}
              description={truncateText(agent.description)}
              showDivider={index < agents.length - 1}
              actions={
                <>
                  <IconButton
                    aria-label={`Edit ${agent.name}`}
                    onClick={() => navigate(`/agents/${agent.id}/edit`)}
                    disabled={deletingId === agent.id}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${agent.name}`}
                    onClick={() => setAgentToDelete(agent)}
                    disabled={deletingId === agent.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <AgentAttachments
                skills={agent.skills}
                tools={agent.tools}
                knowledge={agent.knowledge}
                mcps={agent.mcps}
              />
            </ResourceListItem>
          ))}
        </ResourceList>
      )}

      <Dialog open={agentToDelete !== null} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{hasUsage ? 'Cannot delete agent' : 'Delete agent?'}</DialogTitle>
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
                <strong>{agentToDelete?.name}</strong> is still referenced and cannot be deleted.
                Remove it from the resources below first.
              </Alert>
              {usage!.crews.length > 0 ? (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Crews
                  </Typography>
                  <List dense disablePadding>
                    {usage!.crews.map((name) => (
                      <ListItem key={name} disablePadding>
                        <ListItemText
                          primary={
                            <Link component={RouterLink} to={`/crews/${name}/edit`}>
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
              Are you sure you want to delete <strong>{agentToDelete?.name}</strong>? This action
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
