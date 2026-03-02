'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useToast } from '@/components/ui/toast'

interface UndoableActionConfig<T> {
  onPreview?: (args: T) => void
  onCommit: (args: T) => Promise<void>
  onCancel?: (args: T) => void
  successMessage: string
  pendingMessage?: string
  delay?: number
}

interface PendingAction<T> {
  args: T
  timerId: number
}

/**
 * Delayed-commit helper:
 * - trigger() applies optional preview immediately
 * - shows "Deshacer" toast
 * - commits after delay unless user undoes
 */
export function useUndoableAction<T>({
  onPreview,
  onCommit,
  onCancel,
  successMessage,
  pendingMessage = 'Acción aplicada',
  delay = 5000,
}: UndoableActionConfig<T>) {
  const toast = useToast()
  const pendingRef = useRef<Map<string, PendingAction<T>>>(new Map())

  const clearPending = useCallback((id: string) => {
    const pending = pendingRef.current.get(id)
    if (!pending) return
    window.clearTimeout(pending.timerId)
    pendingRef.current.delete(id)
  }, [])

  const trigger = useCallback(
    (args: T) => {
      const id = Math.random().toString(36).slice(2)

      onPreview?.(args)

      const timerId = window.setTimeout(async () => {
        try {
          await onCommit(args)
          toast.success(successMessage)
        } catch (error) {
          console.error('[useUndoableAction] commit failed:', error)
          toast.error('No se pudo completar la acción')
          onCancel?.(args)
        } finally {
          pendingRef.current.delete(id)
        }
      }, delay)

      pendingRef.current.set(id, { args, timerId })

      toast.undoable(
        pendingMessage,
        () => {
          const pending = pendingRef.current.get(id)
          if (!pending) return
          clearPending(id)
          onCancel?.(pending.args)
        },
        delay
      )
    },
    [onPreview, onCommit, onCancel, successMessage, pendingMessage, delay, toast, clearPending]
  )

  useEffect(() => {
    const pendingMap = pendingRef.current
    return () => {
      for (const { timerId } of pendingMap.values()) {
        window.clearTimeout(timerId)
      }
      pendingMap.clear()
    }
  }, [])

  return { trigger }
}
