import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createGraphify, fetchGraphifys } from '../api/graphifys'
import type { Graphify, NewGraphifyInput } from '../types/graphify'

type GraphifysContextValue = {
  graphifys: Graphify[]
  isLoading: boolean
  isAdding: boolean
  loadError: string | null
  addGraphify: (input: NewGraphifyInput) => Promise<void>
}

const GraphifysContext = createContext<GraphifysContextValue | null>(null)

export function GraphifysProvider({ children }: { children: ReactNode }) {
  const [graphifys, setGraphifys] = useState<Graphify[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadGraphifys = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await fetchGraphifys()
      setGraphifys(data)
    } catch {
      setLoadError('Failed to load graphifys')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadGraphifys()
  }, [loadGraphifys])

  const addGraphify = useCallback(async (input: NewGraphifyInput) => {
    setIsAdding(true)

    try {
      const graphify = await createGraphify(input)
      setGraphifys((current) => [graphify, ...current])
    } finally {
      setIsAdding(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      graphifys,
      isLoading,
      isAdding,
      loadError,
      addGraphify,
    }),
    [graphifys, isLoading, isAdding, loadError, addGraphify],
  )

  return (
    <GraphifysContext.Provider value={value}>{children}</GraphifysContext.Provider>
  )
}

export function useGraphifys() {
  const context = useContext(GraphifysContext)
  if (!context) {
    throw new Error('useGraphifys must be used within GraphifysProvider')
  }
  return context
}
