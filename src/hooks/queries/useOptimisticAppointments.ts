'use client'

/**
 * useOptimisticAppointmentStatus
 *
 * Wraps useUpdateAppointmentStatus with optimistic UI via useOptimisticMutation.
 * Uses `immediate-compensate` execution model: updates badge/status instantly,
 * rolls back on server error.
 *
 * Drop-in replacement: pages swap `useUpdateAppointmentStatus` → `useOptimisticAppointmentStatus`.
 */

import { useOptimisticMutation } from '@/hooks/useOptimisticMutation'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import type { Appointment } from '@/types/domain'

interface StatusUpdateVars {
  appointmentId: string
  status: Appointment['status']
}

/**
 * Optimistically update appointment status in all list-shaped caches.
 * Handles both array caches (appointments list) and object caches
 * with nested appointments (barber day response).
 */
function updateAppointmentInCache(old: unknown, vars: StatusUpdateVars): unknown {
  if (!old) return old

  // Array of appointments (useCalendarAppointments, useAppointments)
  if (Array.isArray(old)) {
    return old.map((appt: any) =>
      appt.id === vars.appointmentId ? { ...appt, status: vars.status } : appt
    )
  }

  // Object with nested appointments array (useBarberDayAppointments response)
  if (typeof old === 'object' && 'appointments' in (old as Record<string, unknown>)) {
    const obj = old as Record<string, unknown>
    return {
      ...obj,
      appointments: Array.isArray(obj.appointments)
        ? (obj.appointments as any[]).map((appt) =>
            appt.id === vars.appointmentId ? { ...appt, status: vars.status } : appt
          )
        : obj.appointments,
    }
  }

  // Single appointment detail
  if (typeof old === 'object' && (old as any).id === vars.appointmentId) {
    return { ...old, status: vars.status }
  }

  return old
}

export function useOptimisticAppointmentStatus() {
  return useOptimisticMutation<unknown, StatusUpdateVars>({
    mutationFn: async ({ appointmentId, status }) => {
      // Same routing logic as useUpdateAppointmentStatus
      const statusEndpoints: Partial<Record<string, string>> = {
        completed: `/api/appointments/${appointmentId}/complete`,
        in_progress: `/api/appointments/${appointmentId}/check-in`,
        no_show: `/api/appointments/${appointmentId}/no-show`,
      }

      const endpoint = statusEndpoints[status]

      if (endpoint) {
        const res = await fetch(endpoint, { method: 'PATCH' })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          const error = new Error(body.error || `Error updating status to ${status}`) as Error & {
            statusCode: number
          }
          error.statusCode = res.status
          throw error
        }
        return res.json()
      }

      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const error = new Error(body.error || `Error updating status to ${status}`) as Error & {
          statusCode: number
        }
        error.statusCode = res.status
        throw error
      }
      return res.json()
    },

    // Broad keys — we update status in any cached query containing appointments
    affectedQueryKeys: [queryKeys.appointments.all, queryKeys.calendar.all],

    optimisticUpdater: updateAppointmentInCache,

    invalidate: (queryClient) => {
      invalidateQueries.afterAppointmentChange(queryClient)
      // Analytics-relevant statuses need extra invalidation
      invalidateQueries.afterAnalyticsRelevantChange(queryClient)
    },
  })
}
