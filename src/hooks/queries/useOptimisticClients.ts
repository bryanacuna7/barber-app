'use client'

/**
 * useOptimisticDeleteClient
 *
 * Wraps client deletion with delayed-commit (undo toast) pattern.
 * Uses useUndoableAction: removes client from cache immediately,
 * shows undo toast for 5s, then commits server DELETE.
 *
 * Drop-in replacement for pages that want undoable client delete.
 */

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { useUndoableAction } from '@/hooks/useUndoableAction'

interface DeleteClientArgs {
  clientId: string
}

// Snapshot stored per trigger for onCancel restore
type ClientsSnapshot = Map<string, unknown>

// Module-level snapshot store (shared across renders via ref in hook)
let snapshotStore: ClientsSnapshot = new Map()

/**
 * Remove a client from all list-shaped caches.
 */
function removeClientFromCache(old: unknown, clientId: string): unknown {
  if (!old) return old

  // Array of clients
  if (Array.isArray(old)) {
    return old.filter((c: any) => c.id !== clientId)
  }

  // Paginated response { clients: Client[], total: number, pagination: {...} }
  if (typeof old === 'object' && 'clients' in (old as Record<string, unknown>)) {
    const obj = old as Record<string, unknown>
    const clients = obj.clients as any[]
    return {
      ...obj,
      clients: clients.filter((c) => c.id !== clientId),
      total: Math.max(0, (obj.total as number) - 1),
    }
  }

  return old
}

export function useOptimisticDeleteClient() {
  const queryClient = useQueryClient()

  const { trigger } = useUndoableAction<DeleteClientArgs>({
    onPreview: ({ clientId }) => {
      // Snapshot all client list queries
      const snapshot = new Map<string, unknown>()
      const allQueriesData = queryClient.getQueriesData({
        queryKey: queryKeys.clients.all,
      })
      for (const [key, data] of allQueriesData) {
        snapshot.set(JSON.stringify(key), data)
      }
      snapshotStore = snapshot

      // Optimistically remove from all client caches
      queryClient.setQueriesData({ queryKey: queryKeys.clients.all }, (old: unknown) =>
        removeClientFromCache(old, clientId)
      )
    },

    onCommit: async ({ clientId }) => {
      const response = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.message || body.error || 'Error al eliminar cliente')
      }
      // Reconcile with server
      invalidateQueries.afterClientChange(queryClient)
    },

    onCancel: () => {
      // Restore from snapshot
      for (const [keyStr, data] of snapshotStore.entries()) {
        const key = JSON.parse(keyStr)
        queryClient.setQueryData(key, data)
      }
      snapshotStore = new Map()
    },

    successMessage: 'Cliente eliminado',
    pendingMessage: 'Cliente eliminado',
    delay: 5000,
  })

  const deleteClient = useCallback(
    (clientId: string) => {
      trigger({ clientId })
    },
    [trigger]
  )

  return { deleteClient }
}
