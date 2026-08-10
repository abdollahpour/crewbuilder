import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SchoolIcon from '@mui/icons-material/School'
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
import { fetchSkillUsage } from '../api/skill'
import SkillAttachments from '../components/SkillAttachments'
import PageHeader from '../components/list/PageHeader'
import { ResourceList, ResourceListItem } from '../components/list/ResourceList'
import ResourceListEmpty from '../components/list/ResourceListEmpty'
import ResourceListSkeleton from '../components/list/ResourceListSkeleton'
import { useSkills } from '../context/SkillContext'
import { truncateText, type Skill, type SkillUsage } from '../types/skill'

export default function Skill() {
  const navigate = useNavigate()
  const { skills, isLoading, loadError, deletingId, deleteSkill } = useSkills()
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [usage, setUsage] = useState<SkillUsage | null>(null)
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState<string | null>(null)

  const hasUsage = usage !== null && usage.agents.length > 0

  useEffect(() => {
    if (!skillToDelete) {
      setUsage(null)
      setUsageError(null)
      return
    }

    let cancelled = false
    setUsageLoading(true)
    setUsageError(null)

    void fetchSkillUsage(skillToDelete.name)
      .then((data) => {
        if (!cancelled) {
          setUsage(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsageError('Failed to check skill usage')
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
  }, [skillToDelete])

  async function handleConfirmDelete() {
    if (!skillToDelete || hasUsage) return

    setDeleteError(null)

    try {
      await deleteSkill(skillToDelete.id)
      handleCloseDeleteDialog()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete skill')
    }
  }

  function handleCloseDeleteDialog() {
    setSkillToDelete(null)
    setDeleteError(null)
    setUsage(null)
    setUsageError(null)
  }

  return (
    <>
      <PageHeader title="Skills">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/skills/new')}
          disabled={isLoading}
        >
          Add Skill
        </Button>
      </PageHeader>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {isLoading ? (
        <ResourceListSkeleton />
      ) : skills.length === 0 ? (
        <ResourceListEmpty
          icon={<SchoolIcon sx={{ fontSize: 48 }} />}
          title="No skills"
          description="You have not configured any skills yet. Add one with a name, description, and SKILL.md content."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/skills/new')}>
              Add Skill
            </Button>
          }
        />
      ) : (
        <ResourceList>
          {skills.map((skill, index) => (
            <ResourceListItem
              key={skill.id}
              title={skill.name}
              description={truncateText(skill.description)}
              showDivider={index < skills.length - 1}
              actions={
                <>
                  <IconButton
                    aria-label={`Edit ${skill.name}`}
                    onClick={() => navigate(`/skills/${skill.id}/edit`)}
                    disabled={deletingId === skill.id}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${skill.name}`}
                    onClick={() => setSkillToDelete(skill)}
                    disabled={deletingId === skill.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <SkillAttachments
                toolsRequired={skill.toolsRequired}
                mcps={skill.mcps}
                knowledge={skill.knowledge}
              />
            </ResourceListItem>
          ))}
        </ResourceList>
      )}

      <Dialog open={skillToDelete !== null} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{hasUsage ? 'Cannot delete skill' : 'Delete skill?'}</DialogTitle>
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
                <strong>{skillToDelete?.name}</strong> is still referenced and cannot be deleted.
                Remove it from the resources below first.
              </Alert>
              {usage!.agents.length > 0 ? (
                <Box>
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
            </>
          ) : (
            <DialogContentText>
              Are you sure you want to delete <strong>{skillToDelete?.name}</strong>? This action
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
