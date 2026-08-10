import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createAgent,
  deleteAgent as deleteAgentApi,
  fetchAgents,
  updateAgent as updateAgentApi,
} from '../api/agent'
import type { Agent, NewAgentInput, UpdateAgentInput } from '../types/agent'

type AgentContextValue = {
  agents: Agent[]
  isLoading: boolean
  isAdding: boolean
  updatingId: string | null
  deletingId: string | null
  loadError: string | null
  addAgent: (input: NewAgentInput) => Promise<void>
  updateAgent: (id: string, input: UpdateAgentInput) => Promise<void>
  deleteAgent: (id: string) => Promise<void>
}

const AgentContext = createContext<AgentContextValue | null>(null)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadAgents = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await fetchAgents()
      setAgents(data)
    } catch {
      setLoadError('Failed to load agents')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAgents()
  }, [loadAgents])

  const addAgent = useCallback(async (input: NewAgentInput) => {
    setIsAdding(true)

    try {
      const agent = await createAgent(input)
      setAgents((current) => [agent, ...current])
    } finally {
      setIsAdding(false)
    }
  }, [])

  const updateAgent = useCallback(async (id: string, input: UpdateAgentInput) => {
    setUpdatingId(id)

    try {
      const agent = await updateAgentApi(id, input)
      setAgents((current) => {
        const filtered = current.filter((item) => item.id !== id && item.id !== agent.id)
        return [agent, ...filtered]
      })
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const deleteAgent = useCallback(async (id: string) => {
    setDeletingId(id)

    try {
      await deleteAgentApi(id)
      setAgents((current) => current.filter((agent) => agent.id !== id))
    } finally {
      setDeletingId(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      agents,
      isLoading,
      isAdding,
      updatingId,
      deletingId,
      loadError,
      addAgent,
      updateAgent,
      deleteAgent,
    }),
    [agents, isLoading, isAdding, updatingId, deletingId, loadError, addAgent, updateAgent, deleteAgent],
  )

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgents() {
  const context = useContext(AgentContext)
  if (!context) {
    throw new Error('useAgents must be used within AgentProvider')
  }
  return context
}
