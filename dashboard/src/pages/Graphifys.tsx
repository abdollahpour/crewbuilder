import AddIcon from '@mui/icons-material/Add'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { Alert, Button, Link } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/list/PageHeader'
import { ResourceList, ResourceListItem, ResourceListSection } from '../components/list/ResourceList'
import ResourceListEmpty from '../components/list/ResourceListEmpty'
import ResourceListSkeleton from '../components/list/ResourceListSkeleton'
import { useGraphifys } from '../context/GraphifysContext'
import { truncateText } from '../types/agent'

export default function Graphifys() {
  const navigate = useNavigate()
  const { graphifys, isLoading, loadError } = useGraphifys()

  return (
    <>
      <PageHeader title="Graphifys">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/graphifys/new')}
          disabled={isLoading}
        >
          Add Graphify
        </Button>
      </PageHeader>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {isLoading ? (
        <ResourceListSkeleton rows={5} lines={4} />
      ) : graphifys.length === 0 ? (
        <ResourceListEmpty
          icon={<AccountTreeIcon sx={{ fontSize: 48 }} />}
          title="No graphifys"
          description="You have not configured any graphifys yet. Add one to connect external graph services."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/graphifys/new')}>
              Add Graphify
            </Button>
          }
        />
      ) : (
        <ResourceList>
          {graphifys.map((item, index) => (
            <ResourceListItem
              key={item.id}
              title={item.type}
              meta={item.id}
              description={truncateText(item.description)}
              showDivider={index < graphifys.length - 1}
            >
              <ResourceListSection label="URI">
                <Link href={item.uri} target="_blank" rel="noopener">
                  {item.uri}
                </Link>
              </ResourceListSection>
            </ResourceListItem>
          ))}
        </ResourceList>
      )}
    </>
  )
}
