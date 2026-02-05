/**
 * Appointments Query Hooks
 *
 * React Query hooks for appointment data management.
 * Module: Mi Día (Dashboard Intelligence)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfDay, endOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptAppointments, calculateDayStats, getMiDiaQuery } from '@/lib/adapters/appointments'
import type { Appointment, DayStatistics } from '@/types/domain'

/**
 * Fetch appointments for a specific date
 */
export function useAppointments(date: Date, businessId: string) {
  return useQuery({
    queryKey: queryKeys.appointments.list(format(date, 'yyyy-MM-dd')),
    queryFn: async () => {
      const startDate = startOfDay(date)
      const endDate = endOfDay(date)

      const { data, error } = await supabase
        .from('appointments')
        .select(getMiDiaQuery())
        .eq('business_id', businessId)
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString())
        .order('scheduled_at', { ascending: true })

      if (error) throw error

      return adaptAppointments(data || [])
    },
    enabled: !!businessId,
  })
}

/**
 * Fetch day statistics
 */
export function useDayStatistics(date: Date, businessId: string) {
  const { data: appointments = [] } = useAppointments(date, businessId)

  return {
    stats: calculateDayStats(appointments),
    isLoading: !appointments,
  }
}

/**
 * Update appointment status
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      appointmentId,
      status,
    }: {
      appointmentId: string
      status: Appointment['status']
    }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateQueries.afterAppointmentChange(queryClient)
    },
  })
}

/**
 * Create new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (appointment: {
      business_id: string
      client_id: string
      service_id: string
      barber_id: string
      scheduled_at: string
      duration_minutes: number
      price: number
      status: string
    }) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateQueries.afterAppointmentChange(queryClient)
    },
  })
}
