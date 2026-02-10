/**
 * Query Error UI Component
 *
 * Standardized error display for React Query errors.
 * Shows user-friendly message with retry button.
 *
 * Created: Session 115 (Phase 0 Week 4)
 */

import React from 'react'
import { AlertCircle, RefreshCw, WifiOff, Shield, ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { getErrorMessage } from '@/lib/react-query/error-handlers'

interface QueryErrorProps {
  error: unknown
  onRetry?: () => void
  title?: string
  className?: string
}

/**
 * Query Error UI
 *
 * Usage:
 * ```tsx
 * const { data, error, refetch } = useQuery({
 *   queryKey: ['appointments'],
 *   queryFn: fetchAppointments,
 * })
 *
 * if (error) {
 *   return <QueryError error={error} onRetry={refetch} />
 * }
 * ```
 */
export function QueryError({ error, onRetry, title, className }: QueryErrorProps) {
  const errorMessage = getErrorMessage(error)

  // Determine icon based on error type
  const getErrorIcon = () => {
    if (errorMessage.includes('conexión') || errorMessage.includes('internet')) {
      return WifiOff
    }
    if (errorMessage.includes('permisos') || errorMessage.includes('sesión')) {
      return Shield
    }
    if (errorMessage.includes('servidor')) {
      return ServerCrash
    }
    return AlertCircle
  }

  const Icon = getErrorIcon()
  const errorTitle = title || 'Error al cargar datos'

  return (
    <div className={className}>
      <EmptyState
        icon={Icon}
        title={errorTitle}
        description={errorMessage}
        action={
          onRetry ? (
            <Button onClick={onRetry} variant="primary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}

/**
 * Inline Query Error
 *
 * Compact error display for use inside cards or sections.
 *
 * Usage:
 * ```tsx
 * if (error) {
 *   return <InlineQueryError error={error} onRetry={refetch} />
 * }
 * ```
 */
export function InlineQueryError({ error, onRetry }: QueryErrorProps) {
  const errorMessage = getErrorMessage(error)

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-300">Error al cargar</p>
          <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
        </div>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

export default QueryError
