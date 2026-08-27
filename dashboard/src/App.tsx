import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AgentProvider } from './context/AgentContext'
import { GraphifysProvider } from './context/GraphifysContext'
import { KnowledgeProvider } from './context/KnowledgeContext'
import { McpProvider } from './context/McpContext'
import { SkillProvider } from './context/SkillContext'
import { CrewProvider } from './context/CrewContext'
import Layout from './components/Layout'
import Graphifys from './pages/Graphifys'
import NewGraphify from './pages/NewGraphify'
import Knowledge from './pages/Knowledge'
import NewKnowledge from './pages/NewKnowledge'
import EditKnowledge from './pages/EditKnowledge'
import Skill from './pages/Skill'
import NewSkill from './pages/NewSkill'
import EditSkill from './pages/EditSkill'
import Agent from './pages/Agent'
import NewAgent from './pages/NewAgent'
import EditAgent from './pages/EditAgent'
import Mcp from './pages/Mcp'
import McpDetail from './pages/McpDetail'
import McpTest from './pages/McpTest'
import NewMcp from './pages/NewMcp'
import EditMcp from './pages/EditMcp'
import Crew from './pages/Crew'
import NewCrew from './pages/NewCrew'
import EditCrew from './pages/EditCrew'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/crews" replace /> },
      { path: '/crews', element: <Crew /> },
      { path: '/crews/new', element: <NewCrew /> },
      { path: '/crews/:id/edit', element: <EditCrew /> },
      { path: '/graphifys', element: <Graphifys /> },
      { path: '/graphifys/new', element: <NewGraphify /> },
      { path: '/knowledge', element: <Knowledge /> },
      { path: '/knowledge/new', element: <NewKnowledge /> },
      { path: '/knowledge/:id/edit', element: <EditKnowledge /> },
      { path: '/skills', element: <Skill /> },
      { path: '/skills/new', element: <NewSkill /> },
      { path: '/skills/:id/edit', element: <EditSkill /> },
      { path: '/agents', element: <Agent /> },
      { path: '/agents/new', element: <NewAgent /> },
      { path: '/agents/:id/edit', element: <EditAgent /> },
      { path: '/mcps', element: <Mcp /> },
      { path: '/mcps/new', element: <NewMcp /> },
      { path: '/mcps/:id/edit', element: <EditMcp /> },
      { path: '/mcps/:id/test', element: <McpTest /> },
      { path: '/mcps/:id', element: <McpDetail /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

function App() {
  return (
    <GraphifysProvider>
      <McpProvider>
        <AgentProvider>
          <SkillProvider>
            <KnowledgeProvider>
              <CrewProvider>
                <RouterProvider router={router} />
              </CrewProvider>
            </KnowledgeProvider>
          </SkillProvider>
        </AgentProvider>
      </McpProvider>
    </GraphifysProvider>
  )
}

export default App
