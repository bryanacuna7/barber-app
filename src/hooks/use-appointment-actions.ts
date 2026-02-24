'use client'

import { useState, useCallback } from 'react'
import type { TodayAppointment, AppointmentStatusUpdateResponse } from '@/types/custom'

type AppointmentAction = 'check-in' | 'complete' | 'no-show'
type PaymentMethod = 'cash' | 'sinpe' | 'card'

interface UseAppointmentActionsOptions {
  barberId: string | null
  onSuccess?: (action: AppointmentAction, appointment: TodayAppointment) => void
  onError?: (action: AppointmentAction, error: Error) => void
}

interface UseAppointmentActionsReturn {
  checkIn: (appointmentId: string) => Promise<AppointmentStatusUpdateResponse | null>
  complete: (
    appointmentId: string,
    paymentMethod?: PaymentMethod
  ) => Promise<AppointmentStatusUpdateResponse | null>
  noShow: (appointmentId: string) => Promise<AppointmentStatusUpdateResponse | null>
  isLoading: boolean
  error: Error | null
  loadingAppointmentId: string | null
}

/**
 * Hook to handle appointment status updates with optimistic UI support
 */
export function useAppointmentActions({
  barberId,
  onSuccess,
  onError,
}: UseAppointmentActionsOptions): UseAppointmentActionsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [loadingAppointmentId, setLoadingAppointmentId] = useState<string | null>(null)

  const executeAction = useCallback(
    async (
      appointmentId: string,
      action: AppointmentAction,
      extraBody?: Record<string, unknown>
    ): Promise<AppointmentStatusUpdateResponse | null> => {
      // Guard: Don't execute if barberId is not available
      if (!barberId) {
        const error = new Error('ID de miembro del equipo no disponible')
        setError(error)
        if (onError) {
          onError(action, error)
        }
        return null
      }

      setIsLoading(true)
      setLoadingAppointmentId(appointmentId)
      setError(null)

      try {
        const response = await fetch(`/api/appointments/${appointmentId}/${action}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ barberId, ...extraBody }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
          throw new Error(errorData.message || `Error ${response.status}`)
        }

        const result: AppointmentStatusUpdateResponse = await response.json()

        // Call success callback
        if (onSuccess) {
          onSuccess(action, result as TodayAppointment)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(`Error al ejecutar ${action}`)
        setError(error)
        console.error(`Error executing ${action} on appointment:`, err)

        // Call error callback
        if (onError) {
          onError(action, error)
        }

        return null
      } finally {
        setIsLoading(false)
        setLoadingAppointmentId(null)
      }
    },
    [barberId, onSuccess, onError]
  )

  const checkIn = useCallback(
    (appointmentId: string) => executeAction(appointmentId, 'check-in'),
    [executeAction]
  )

  const complete = useCallback(
    (appointmentId: string, paymentMethod?: PaymentMethod) =>
      executeAction(
        appointmentId,
        'complete',
        paymentMethod ? { payment_method: paymentMethod } : undefined
      ),
    [executeAction]
  )

  const noShow = useCallback(
    (appointmentId: string) => executeAction(appointmentId, 'no-show'),
    [executeAction]
  )

  return {
    checkIn,
    complete,
    noShow,
    isLoading,
    error,
    loadingAppointmentId,
  }
}
