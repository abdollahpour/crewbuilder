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
  createCrew,
  deleteCrew as deleteCrewApi,
  fetchCrews,
  updateCrew as updateCrewApi,
} from '../api/crew'
import type { NewCrewInput, UpdateCrewInput, Crew } from '../types/crew'

type CrewContextValue = {
  crews: Crew[]
  isLoading: boolean
  isAdding: boolean
  updatingId: string | null
  deletingId: string | null
  loadError: string | null
  addCrew: (input: NewCrewInput) => Promise<void>
  updateCrew: (id: string, input: UpdateCrewInput) => Promise<void>
  deleteCrew: (id: string) => Promise<void>
}

const CrewContext = createContext<CrewContextValue | null>(null)

export function CrewProvider({ children }: { children: ReactNode }) {
  const [crews, setCrews] = useState<Crew[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadCrews = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await fetchCrews()
      setCrews(data)
    } catch {
      setLoadError('Failed to load crews')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCrews()
  }, [loadCrews])

  const addCrew = useCallback(async (input: NewCrewInput) => {
    setIsAdding(true)

    try {
      const crew = await createCrew(input)
      setCrews((current) => [crew, ...current])
    } finally {
      setIsAdding(false)
    }
  }, [])

  const updateCrew = useCallback(async (id: string, input: UpdateCrewInput) => {
    setUpdatingId(id)

    try {
      const crew = await updateCrewApi(id, input)
      setCrews((current) => {
        const filtered = current.filter((item) => item.id !== id && item.id !== crew.id)
        return [crew, ...filtered]
      })
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const deleteCrew = useCallback(async (id: string) => {
    setDeletingId(id)

    try {
      await deleteCrewApi(id)
      setCrews((current) => current.filter((crew) => crew.id !== id))
    } finally {
      setDeletingId(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      crews,
      isLoading,
      isAdding,
      updatingId,
      deletingId,
      loadError,
      addCrew,
      updateCrew,
      deleteCrew,
    }),
    [
      crews,
      isLoading,
      isAdding,
      updatingId,
      deletingId,
      loadError,
      addCrew,
      updateCrew,
      deleteCrew,
    ],
  )

  return <CrewContext.Provider value={value}>{children}</CrewContext.Provider>
}

export function useCrews() {
  const context = useContext(CrewContext)
  if (!context) {
    throw new Error('useCrews must be used within CrewProvider')
  }
  return context
}
