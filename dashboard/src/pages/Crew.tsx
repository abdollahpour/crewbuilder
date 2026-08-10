import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import GroupsIcon from '@mui/icons-material/Groups'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildCrew } from '../api/builder'
import PageHeader from '../components/list/PageHeader'
import { ResourceList, ResourceListItem } from '../components/list/ResourceList'
import ResourceListEmpty from '../components/list/ResourceListEmpty'
import ResourceListSkeleton from '../components/list/ResourceListSkeleton'
import CrewAgentsList from '../components/CrewAgentsList'
import { useCrews } from '../context/CrewContext'
import type { Crew } from '../types/crew'
import { truncateText } from '../types/crew'

export default function Crew() {
  const navigate = useNavigate()
  const { crews, isLoading, loadError, deletingId, deleteCrew } = useCrews()
  const [crewToDelete, setCrewToDelete] = useState<Crew | null>(null)
  const [buildingId, setBuildingId] = useState<string | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)

  async function handleBuild(crew: Crew) {
    setBuildingId(crew.id)
    setBuildError(null)

    try {
      await buildCrew(crew.id)
    } catch (error) {
      setBuildError(error instanceof Error ? error.message : 'Build failed')
    } finally {
      setBuildingId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!crewToDelete) return

    await deleteCrew(crewToDelete.id)
    setCrewToDelete(null)
  }

  return (
    <>
      <PageHeader title="Crews">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/crews/new')}
          disabled={isLoading}
        >
          Add Crew
        </Button>
      </PageHeader>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {buildError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setBuildError(null)}>
          {buildError}
        </Alert>
      )}

      {isLoading ? (
        <ResourceListSkeleton />
      ) : crews.length === 0 ? (
        <ResourceListEmpty
          icon={<GroupsIcon sx={{ fontSize: 48 }} />}
          title="No crews"
          description="You have not configured any crews yet. Add one with a model, rules, and a team of agents."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/crews/new')}>
              Add Crew
            </Button>
          }
        />
      ) : (
        <ResourceList>
          {crews.map((crew, index) => (
            <ResourceListItem
              key={crew.id}
              title={crew.name}
              meta={crew.model}
              description={truncateText(crew.rules, 120)}
              showDivider={index < crews.length - 1}
              actions={
                <>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={
                      buildingId === crew.id ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <RocketLaunchIcon />
                      )
                    }
                    aria-label={`Build ${crew.name}`}
                    onClick={() => void handleBuild(crew)}
                    disabled={
                      deletingId === crew.id ||
                      buildingId === crew.id ||
                      crew.agents.length === 0
                    }
                    sx={{ mr: 0.5, alignSelf: 'center' }}
                  >
                    {buildingId === crew.id ? 'Building…' : 'Build'}
                  </Button>
                  <IconButton
                    aria-label={`Edit ${crew.name}`}
                    onClick={() => navigate(`/crews/${crew.id}/edit`)}
                    disabled={deletingId === crew.id || buildingId === crew.id}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${crew.name}`}
                    onClick={() => setCrewToDelete(crew)}
                    disabled={deletingId === crew.id || buildingId === crew.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <CrewAgentsList agents={crew.agents} />
              {crew.agents.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No agents assigned
                </Typography>
              ) : null}
            </ResourceListItem>
          ))}
        </ResourceList>
      )}

      <Dialog open={crewToDelete !== null} onClose={() => setCrewToDelete(null)}>
        <DialogTitle>Delete crew?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{crewToDelete?.name}</strong>? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCrewToDelete(null)} disabled={deletingId !== null}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleConfirmDelete()}
            color="error"
            variant="contained"
            disabled={deletingId !== null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
