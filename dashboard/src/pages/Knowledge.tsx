import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import MenuBookIcon from '@mui/icons-material/MenuBook'
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
import { fetchKnowledgeUsage } from '../api/knowledge'
import PageHeader from '../components/list/PageHeader'
import { ResourceList, ResourceListItem } from '../components/list/ResourceList'
import ResourceListEmpty from '../components/list/ResourceListEmpty'
import ResourceListSkeleton from '../components/list/ResourceListSkeleton'
import { useKnowledge } from '../context/KnowledgeContext'
import { truncateText, type Knowledge, type KnowledgeUsage } from '../types/knowledge'

export default function Knowledge() {
  const navigate = useNavigate()
  const { knowledge, isLoading, loadError, deletingId, deleteKnowledge } =
    useKnowledge()
  const [knowledgeToDelete, setKnowledgeToDelete] = useState<Knowledge | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [usage, setUsage] = useState<KnowledgeUsage | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState<string | null>(null)

  const hasUsage = usage !== null && (usage.agents.length > 0 || usage.skills.length > 0)

  useEffect(() => {
    if (!knowledgeToDelete) {
      setUsage(null)
      setUsageError(null)
      return
    }

    let cancelled = false
    setUsageLoading(true)
    setUsageError(null)

    void fetchKnowledgeUsage(knowledgeToDelete.name)
      .then((data) => {
        if (!cancelled) {
          setUsage(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsageError('Failed to check knowledge usage')
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
  }, [knowledgeToDelete])

  async function handleConfirmDelete() {
    if (!knowledgeToDelete || hasUsage) return

    setDeleteError(null)

    try {
      await deleteKnowledge(knowledgeToDelete.id)
      handleCloseDeleteDialog()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete knowledge')
    }
  }

  function handleCloseDeleteDialog() {
    setKnowledgeToDelete(null)
    setDeleteError(null)
    setUsage(null)
    setUsageError(null)
  }

  return (
    <>
      <PageHeader title="Knowledge">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/knowledge/new')}
          disabled={isLoading}
        >
          Add Knowledge
        </Button>
      </PageHeader>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {isLoading ? (
        <ResourceListSkeleton />
      ) : knowledge.length === 0 ? (
        <ResourceListEmpty
          icon={<MenuBookIcon sx={{ fontSize: 48 }} />}
          title="No knowledge"
          description="You have not added any knowledge yet. Create one with a name and content."
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/knowledge/new')}
            >
              Add Knowledge
            </Button>
          }
        />
      ) : (
        <ResourceList>
          {knowledge.map((item, index) => (
            <ResourceListItem
              key={item.id}
              title={item.name}
              description={truncateText(item.content, 160)}
              showDivider={index < knowledge.length - 1}
              actions={
                <>
                  <IconButton
                    aria-label={`Edit ${item.name}`}
                    onClick={() => navigate(`/knowledge/${item.id}/edit`)}
                    disabled={deletingId === item.id}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${item.name}`}
                    onClick={() => setKnowledgeToDelete(item)}
                    disabled={deletingId === item.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            />
          ))}
        </ResourceList>
      )}

      <Dialog
        open={knowledgeToDelete !== null}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {hasUsage ? 'Cannot delete knowledge' : 'Delete knowledge?'}
        </DialogTitle>
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
                <strong>{knowledgeToDelete?.name}</strong> is still referenced and cannot be
                deleted. Remove it from the resources below first.
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
              Are you sure you want to delete <strong>{knowledgeToDelete?.name}</strong>? This
              action cannot be undone.
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
