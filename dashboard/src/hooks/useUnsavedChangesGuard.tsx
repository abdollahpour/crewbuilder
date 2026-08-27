import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'
import { useBlocker, type BlockerFunction } from 'react-router-dom'

export function formValuesEqual(current: unknown, original: unknown): boolean {
  return JSON.stringify(current) === JSON.stringify(original)
}

export function useUnsavedChangesGuard(isDirty: boolean) {
  const isDirtyRef = useRef(isDirty)
  const skipBlockRef = useRef(false)

  isDirtyRef.current = isDirty

  const allowLeave = useCallback(() => {
    skipBlockRef.current = true
  }, [])

  const shouldBlock = useCallback<BlockerFunction>(({ currentLocation, nextLocation }) => {
    if (skipBlockRef.current) return false
    if (currentLocation.pathname === nextLocation.pathname) return false
    return isDirtyRef.current
  }, [])

  const blocker = useBlocker(shouldBlock)

  useEffect(() => {
    if (!isDirty) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (skipBlockRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (blocker.state === 'blocked' && !isDirty) {
      blocker.reset()
    }
  }, [blocker, isDirty])

  const dialog = (
    <Dialog
      open={blocker.state === 'blocked'}
      onClose={() => blocker.reset?.()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Unsaved changes</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You have unsaved changes. If you leave this page, those changes will be gone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => blocker.reset?.()}>Stay</Button>
        <Button color="error" variant="contained" onClick={() => blocker.proceed?.()}>
          Leave
        </Button>
      </DialogActions>
    </Dialog>
  )

  return { allowLeave, dialog }
}
