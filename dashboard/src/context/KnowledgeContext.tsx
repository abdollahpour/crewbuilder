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
  createKnowledge,
  deleteKnowledge as deleteKnowledgeApi,
  fetchKnowledge,
  updateKnowledge as updateKnowledgeApi,
} from '../api/knowledge'
import type {
  Knowledge,
  NewKnowledgeInput,
  UpdateKnowledgeInput,
} from '../types/knowledge'

type KnowledgeContextValue = {
  knowledge: Knowledge[]
  isLoading: boolean
  isAdding: boolean
  updatingId: string | null
  deletingId: string | null
  loadError: string | null
  addKnowledge: (input: NewKnowledgeInput) => Promise<void>
  updateKnowledge: (id: string, input: UpdateKnowledgeInput) => Promise<void>
  deleteKnowledge: (id: string) => Promise<void>
}

const KnowledgeContext = createContext<KnowledgeContextValue | null>(null)

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [knowledge, setKnowledge] = useState<Knowledge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadKnowledge = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await fetchKnowledge()
      setKnowledge(data)
    } catch {
      setLoadError('Failed to load knowledge')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadKnowledge()
  }, [loadKnowledge])

  const addKnowledge = useCallback(async (input: NewKnowledgeInput) => {
    setIsAdding(true)

    try {
      const knowledge = await createKnowledge(input)
      setKnowledge((current) => [knowledge, ...current])
    } finally {
      setIsAdding(false)
    }
  }, [])

  const updateKnowledge = useCallback(async (id: string, input: UpdateKnowledgeInput) => {
    setUpdatingId(id)

    try {
      const knowledge = await updateKnowledgeApi(id, input)
      setKnowledge((current) => {
        const filtered = current.filter((item) => item.id !== id && item.id !== knowledge.id)
        return [knowledge, ...filtered]
      })
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const deleteKnowledge = useCallback(async (id: string) => {
    setDeletingId(id)

    try {
      await deleteKnowledgeApi(id)
      setKnowledge((current) => current.filter((knowledge) => knowledge.id !== id))
    } finally {
      setDeletingId(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      knowledge,
      isLoading,
      isAdding,
      updatingId,
      deletingId,
      loadError,
      addKnowledge,
      updateKnowledge,
      deleteKnowledge,
    }),
    [
      knowledge,
      isLoading,
      isAdding,
      updatingId,
      deletingId,
      loadError,
      addKnowledge,
      updateKnowledge,
      deleteKnowledge,
    ],
  )

  return (
    <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>
  )
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext)
  if (!context) {
    throw new Error('useKnowledge must be used within KnowledgeProvider')
  }
  return context
}
