import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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

function App() {
  return (
    <GraphifysProvider>
      <McpProvider>
        <AgentProvider>
          <SkillProvider>
            <KnowledgeProvider>
              <CrewProvider>
                <BrowserRouter>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/crews" replace />} />
                      <Route path="/crews" element={<Crew />} />
                      <Route path="/crews/new" element={<NewCrew />} />
                      <Route path="/crews/:id/edit" element={<EditCrew />} />
                      <Route path="/graphifys" element={<Graphifys />} />
                      <Route path="/graphifys/new" element={<NewGraphify />} />
                      <Route path="/knowledge" element={<Knowledge />} />
                      <Route path="/knowledge/new" element={<NewKnowledge />} />
                      <Route path="/knowledge/:id/edit" element={<EditKnowledge />} />
                      <Route path="/skills" element={<Skill />} />
                      <Route path="/skills/new" element={<NewSkill />} />
                      <Route path="/skills/:id/edit" element={<EditSkill />} />
                      <Route path="/agents" element={<Agent />} />
                      <Route path="/agents/new" element={<NewAgent />} />
                      <Route path="/agents/:id/edit" element={<EditAgent />} />
                      <Route path="/mcps" element={<Mcp />} />
                      <Route path="/mcps/new" element={<NewMcp />} />
                      <Route path="/mcps/:id/edit" element={<EditMcp />} />
                      <Route path="/mcps/:id/test" element={<McpTest />} />
                      <Route path="/mcps/:id" element={<McpDetail />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </BrowserRouter>
              </CrewProvider>
            </KnowledgeProvider>
          </SkillProvider>
        </AgentProvider>
      </McpProvider>
    </GraphifysProvider>
  )
}

export default App
