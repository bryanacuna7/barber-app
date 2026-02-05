/**
 * React Query Error Handling Patterns
 *
 * Standardized error handling for queries and mutations.
 * Provides retry logic, toast notifications, and optimistic rollback.
 *
 * Created: Session 115 (Phase 0 Week 4)
 */

import { toast } from 'sonner'
import type { QueryClient } from '@tanstack/react-query'

/**
 * Query Error Handler
 *
 * Standard pattern for handling query errors with user-friendly messages.
 *
 * Usage:
 * ```tsx
 * const { data, error, refetch } = useQuery({
 *   queryKey: ['appointments'],
 *   queryFn: fetchAppointments,
 * })
 *
 * if (error) {
 *   return <QueryErrorUI error={error} onRetry={refetch} />
 * }
 * ```
 */
export interface QueryError {
  message: string
  code?: string
  statusCode?: number
}

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: unknown): string {
  // Network error
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
  }

  // Supabase error with message
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message

    // Common Supabase errors
    if (message.includes('JWT')) {
      return 'Tu sesión expiró. Por favor, inicia sesión nuevamente.'
    }
    if (message.includes('permission')) {
      return 'No tienes permisos para realizar esta acción.'
    }
    if (message.includes('not found')) {
      return 'No se encontró el recurso solicitado.'
    }

    return message
  }

  // HTTP status code errors
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode: number }).statusCode

    switch (statusCode) {
      case 401:
        return 'No estás autenticado. Por favor, inicia sesión.'
      case 403:
        return 'No tienes permisos para acceder a este recurso.'
      case 404:
        return 'El recurso solicitado no existe.'
      case 429:
        return 'Demasiadas solicitudes. Por favor, espera un momento.'
      case 500:
        return 'Error del servidor. Intenta de nuevo más tarde.'
      default:
        return `Error del servidor (código ${statusCode}). Intenta de nuevo.`
    }
  }

  // Generic error
  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
}

/**
 * Mutation Error Handler
 *
 * Handles mutation errors with toast notifications and optional optimistic rollback.
 *
 * Usage with optimistic updates:
 * ```tsx
 * const { mutate } = useMutation({
 *   mutationFn: updateAppointment,
 *   onMutate: async (newData) => {
 *     await queryClient.cancelQueries({ queryKey: ['appointments'] })
 *     const previous = queryClient.getQueryData(['appointments'])
 *     queryClient.setQueryData(['appointments'], newData)
 *     return { previous }
 *   },
 *   onError: (error, variables, context) => {
 *     handleMutationError(error, {
 *       queryClient,
 *       queryKey: ['appointments'],
 *       context,
 *       actionName: 'actualizar la cita',
 *     })
 *   },
 * })
 * ```
 */
export interface MutationErrorOptions {
  queryClient: QueryClient
  queryKey: unknown[]
  context?: { previous?: unknown }
  actionName?: string
  showToast?: boolean
}

export function handleMutationError(error: unknown, options: MutationErrorOptions): void {
  const {
    queryClient,
    queryKey,
    context,
    actionName = 'realizar la acción',
    showToast = true,
  } = options

  const errorMessage = getErrorMessage(error)

  // Rollback optimistic update if context exists
  if (context?.previous) {
    queryClient.setQueryData(queryKey, context.previous)
  }

  // Show toast notification
  if (showToast) {
    toast.error(`Error al ${actionName}`, {
      description: errorMessage,
      action: {
        label: 'Cerrar',
        onClick: () => {}, // Toast will auto-dismiss
      },
    })
  }

  // Log error for debugging
  console.error(`[MutationError] Failed to ${actionName}:`, error)
}

/**
 * Success Toast for Mutations
 *
 * Standard success message after successful mutations.
 *
 * Usage:
 * ```tsx
 * const { mutate } = useMutation({
 *   mutationFn: createAppointment,
 *   onSuccess: () => {
 *     showSuccessToast('Cita creada exitosamente')
 *   },
 * })
 * ```
 */
export function showSuccessToast(message: string, description?: string): void {
  toast.success(message, {
    description,
  })
}

/**
 * Error Toast for Mutations
 *
 * Standard error message for failed mutations.
 *
 * Usage:
 * ```tsx
 * const { mutate } = useMutation({
 *   mutationFn: deleteAppointment,
 *   onError: (error) => {
 *     showErrorToast('Error al eliminar cita', error.message)
 *   },
 * })
 * ```
 */
export function showErrorToast(message: string, description?: string): void {
  toast.error(message, {
    description,
    action: {
      label: 'Cerrar',
      onClick: () => {},
    },
  })
}

/**
 * Loading Toast for Long Operations
 *
 * Shows a loading toast for operations that take more than 1 second.
 *
 * Usage:
 * ```tsx
 * const toastId = showLoadingToast('Guardando cambios...')
 * await mutation()
 * dismissToast(toastId)
 * showSuccessToast('Cambios guardados')
 * ```
 */
export function showLoadingToast(message: string): string | number {
  return toast.loading(message)
}

export function dismissToast(toastId: string | number): void {
  toast.dismiss(toastId)
}

/**
 * Retry Logic Configuration
 *
 * Determines if a query should retry based on error type.
 * Used in React Query configuration.
 *
 * Usage in query config:
 * ```tsx
 * const queryClient = new QueryClient({
 *   defaultOptions: {
 *     queries: {
 *       retry: (failureCount, error) => shouldRetry(error, failureCount),
 *     },
 *   },
 * })
 * ```
 */
export function shouldRetry(error: unknown, failureCount: number): boolean {
  // Don't retry after 3 attempts
  if (failureCount >= 3) {
    return false
  }

  // Don't retry authentication errors (401, 403)
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode: number }).statusCode
    if (statusCode === 401 || statusCode === 403) {
      return false
    }
  }

  // Don't retry JWT errors
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: string }).message
    if (message.includes('JWT') || message.includes('unauthorized')) {
      return false
    }
  }

  // Retry network errors and 5xx errors
  return true
}

/**
 * Exponential Backoff Delay
 *
 * Calculates retry delay with exponential backoff.
 *
 * Usage in query config:
 * ```tsx
 * const queryClient = new QueryClient({
 *   defaultOptions: {
 *     queries: {
 *       retryDelay: getRetryDelay,
 *     },
 *   },
 * })
 * ```
 */
export function getRetryDelay(attemptIndex: number): number {
  // 1st retry: 1s, 2nd: 2s, 3rd: 4s
  return Math.min(1000 * 2 ** attemptIndex, 10000)
}
