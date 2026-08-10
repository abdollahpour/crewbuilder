import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createMcp, deleteMcp as deleteMcpApi, fetchMcps, updateMcp as updateMcpApi } from '../api/mcp'
import type { Mcp, NewMcpInput, UpdateMcpInput } from '../types/mcp'

type McpContextValue = {
  mcps: Mcp[]
  isLoading: boolean
  isAdding: boolean
  updatingId: string | null
  deletingId: string | null
  loadError: string | null
  addMcp: (input: NewMcpInput) => Promise<void>
  updateMcp: (id: string, input: UpdateMcpInput) => Promise<void>
  deleteMcp: (id: string) => Promise<void>
}

const McpContext = createContext<McpContextValue | null>(null)

export function McpProvider({ children }: { children: ReactNode }) {
  const [mcps, setMcps] = useState<Mcp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadMcps = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await fetchMcps()
      setMcps(data)
    } catch {
      setLoadError('Failed to load MCPs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMcps()
  }, [loadMcps])

  const addMcp = useCallback(async (input: NewMcpInput) => {
    setIsAdding(true)

    try {
      const mcp = await createMcp(input)
      setMcps((current) => [mcp, ...current])
    } finally {
      setIsAdding(false)
    }
  }, [])

  const updateMcp = useCallback(async (id: string, input: UpdateMcpInput) => {
    setUpdatingId(id)

    try {
      const mcp = await updateMcpApi(id, input)
      setMcps((current) => current.map((item) => (item.id === id ? mcp : item)))
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const deleteMcp = useCallback(async (id: string) => {
    setDeletingId(id)

    try {
      await deleteMcpApi(id)
      setMcps((current) => current.filter((mcp) => mcp.id !== id))
    } finally {
      setDeletingId(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      mcps,
      isLoading,
      isAdding,
      updatingId,
      deletingId,
      loadError,
      addMcp,
      updateMcp,
      deleteMcp,
    }),
    [mcps, isLoading, isAdding, updatingId, deletingId, loadError, addMcp, updateMcp, deleteMcp],
  )

  return <McpContext.Provider value={value}>{children}</McpContext.Provider>
}

export function useMcps() {
  const context = useContext(McpContext)
  if (!context) {
    throw new Error('useMcps must be used within McpProvider')
  }
  return context
}
