'use client'

/**
 * useOptimisticMutation — Generic optimistic update wrapper for React Query mutations.
 *
 * Implements the `immediate-compensate` execution model:
 * 1. onMutate: cancel queries → snapshot cache → apply optimistic update
 * 2. onError: rollback to snapshot → show contextual error toast by HTTP status
 * 3. onSettled: invalidate queries to reconcile with server
 *
 * Used by: useOptimisticAppointmentStatus, useOptimisticServiceToggle
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toast'

interface OptimisticMutationConfig<TData, TVars> {
  mutationFn: (vars: TVars) => Promise<TData>
  /** Query keys to snapshot and optimistically update */
  affectedQueryKeys: readonly (readonly unknown[])[]
  /** Apply optimistic change to cached data. Return new data for the query. */
  optimisticUpdater: (oldData: unknown, vars: TVars) => unknown
  /** Called on settle (success or error) to reconcile cache with server */
  invalidate: (queryClient: ReturnType<typeof useQueryClient>) => void
  /** Toast message on success (optional — omit for silent success) */
  successMessage?: string
  /** Called on success with result data (optional) */
  onSuccess?: (data: TData, vars: TVars) => void
}

// Snapshot type: array of [queryKey, data] pairs
type CacheSnapshot = [readonly unknown[], unknown][]

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const statusCode = (error as Error & { statusCode?: number }).statusCode

    switch (statusCode) {
      case 409:
        return 'Alguien más modificó este registro'
      case 403:
        return 'No tienes permisos para esta acción'
      case 404:
        return 'Este registro ya no existe'
      case 500:
        return 'Error del servidor. Intenta de nuevo'
      default:
        break
    }

    // Network error (no status code, fetch failed)
    if (!statusCode && error.message.includes('fetch')) {
      return 'Sin conexión. Verifica tu internet'
    }

    return error.message
  }

  return 'Error inesperado'
}

export function useOptimisticMutation<TData, TVars>({
  mutationFn,
  affectedQueryKeys,
  optimisticUpdater,
  invalidate,
  successMessage,
  onSuccess,
}: OptimisticMutationConfig<TData, TVars>) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn,

    onMutate: async (vars: TVars) => {
      // 1. Cancel in-flight queries to avoid overwriting our optimistic update
      await Promise.all(
        affectedQueryKeys.map((key) => queryClient.cancelQueries({ queryKey: key as unknown[] }))
      )

      // 2. Snapshot current cache for rollback
      const snapshot: CacheSnapshot = affectedQueryKeys.map((key) => [
        key,
        queryClient.getQueryData(key as unknown[]),
      ])

      // 3. Apply optimistic update to all affected caches
      for (const key of affectedQueryKeys) {
        queryClient.setQueryData(key as unknown[], (old: unknown) => optimisticUpdater(old, vars))
      }

      return { snapshot }
    },

    onError: (error, _vars, context) => {
      // Rollback all affected queries from snapshot
      const snapshot = (context as { snapshot: CacheSnapshot } | undefined)?.snapshot
      if (snapshot) {
        for (const [key, data] of snapshot) {
          queryClient.setQueryData(key as unknown[], data)
        }
      }

      toast.error(getErrorMessage(error))
    },

    onSuccess: (data, vars) => {
      if (successMessage) {
        toast.success(successMessage)
      }
      onSuccess?.(data, vars)
    },

    onSettled: () => {
      // Always reconcile with server after optimistic update
      invalidate(queryClient)
    },
  })
}
