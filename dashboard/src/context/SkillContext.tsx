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
  createSkill,
  deleteSkill as deleteSkillApi,
  fetchSkills,
  updateSkill as updateSkillApi,
} from '../api/skill'
import type { NewSkillInput, Skill, UpdateSkillInput } from '../types/skill'

type SkillContextValue = {
  skills: Skill[]
  isLoading: boolean
  isAdding: boolean
  updatingId: string | null
  deletingId: string | null
  loadError: string | null
  addSkill: (input: NewSkillInput) => Promise<void>
  updateSkill: (id: string, input: UpdateSkillInput) => Promise<void>
  deleteSkill: (id: string) => Promise<void>
}

const SkillContext = createContext<SkillContextValue | null>(null)

export function SkillProvider({ children }: { children: ReactNode }) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadSkills = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    try {
      const data = await fetchSkills()
      setSkills(data)
    } catch {
      setLoadError('Failed to load skills')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSkills()
  }, [loadSkills])

  const addSkill = useCallback(async (input: NewSkillInput) => {
    setIsAdding(true)

    try {
      const skill = await createSkill(input)
      setSkills((current) => [skill, ...current])
    } finally {
      setIsAdding(false)
    }
  }, [])

  const updateSkill = useCallback(async (id: string, input: UpdateSkillInput) => {
    setUpdatingId(id)

    try {
      const skill = await updateSkillApi(id, input)
      setSkills((current) => {
        const filtered = current.filter((item) => item.id !== id && item.id !== skill.id)
        return [skill, ...filtered]
      })
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const deleteSkill = useCallback(async (id: string) => {
    setDeletingId(id)

    try {
      await deleteSkillApi(id)
      setSkills((current) => current.filter((skill) => skill.id !== id))
    } finally {
      setDeletingId(null)
    }
  }, [])

  const value = useMemo(
    () => ({
      skills,
      isLoading,
      isAdding,
      updatingId,
      deletingId,
      loadError,
      addSkill,
      updateSkill,
      deleteSkill,
    }),
    [skills, isLoading, isAdding, updatingId, deletingId, loadError, addSkill, updateSkill, deleteSkill],
  )

  return <SkillContext.Provider value={value}>{children}</SkillContext.Provider>
}

export function useSkills() {
  const context = useContext(SkillContext)
  if (!context) {
    throw new Error('useSkills must be used within SkillProvider')
  }
  return context
}
