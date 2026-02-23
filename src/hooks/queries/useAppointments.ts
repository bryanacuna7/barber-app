/**
 * Appointments Query Hooks
 *
 * React Query hooks for appointment data management.
 * Module: Mi Día (Dashboard Intelligence)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfDay, endOfDay } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
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
      const supabase = createClient()
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

      return adaptAppointments((data as any) || [])
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
      const supabase = createClient()
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select('id, status, updated_at')
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
      const supabase = createClient()
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select(
          'id, status, client_id, service_id, barber_id, scheduled_at, duration_minutes, price, created_at, business_id'
        )
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
 * Fetch today's appointments for a specific barber
 * Used in Mi Día page for barber daily view
 *
 * Returns TodayAppointmentsResponse format for compatibility with existing components
 */
export function useBarberDayAppointments(barberId: string | null) {
  return useQuery({
    queryKey: queryKeys.appointments.barberToday(barberId || ''),
    queryFn: async () => {
      if (!barberId) throw new Error('Barber ID is required')

      const supabase = createClient()
      const today = new Date()
      const startDate = startOfDay(today)
      const endDate = endOfDay(today)

      // Fetch appointments with relations (matches TodayAppointment format)
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(
          `
          id,
          scheduled_at,
          duration_minutes,
          price,
          status,
          client_notes,
          internal_notes,
          started_at,
          actual_duration_minutes,
          payment_method,
          advance_payment_status,
          proof_channel,
          base_price_snapshot,
          discount_pct_snapshot,
          final_price_snapshot,
          client:clients!appointments_client_id_fkey (
            id,
            name,
            phone,
            email
          ),
          service:services!appointments_service_id_fkey (
            id,
            name,
            duration_minutes,
            price
          )
        `
        )
        .eq('barber_id', barberId)
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString())
        .order('scheduled_at', { ascending: true })

      if (appointmentsError) throw appointmentsError

      // Fetch barber info
      const { data: barberData, error: barberError } = await supabase
        .from('barbers')
        .select('id, name')
        .eq('id', barberId)
        .single()

      if (barberError) throw barberError

      // Transform to match TodayAppointment[] format
      const appointments = (appointmentsData || []).map((appt: any) => ({
        id: appt.id,
        scheduled_at: appt.scheduled_at,
        duration_minutes: appt.duration_minutes,
        price: appt.price,
        status: appt.status,
        client_notes: appt.client_notes,
        internal_notes: appt.internal_notes,
        started_at: appt.started_at ?? null,
        actual_duration_minutes: appt.actual_duration_minutes ?? null,
        payment_method: appt.payment_method ?? null,
        advance_payment_status: appt.advance_payment_status ?? null,
        proof_channel: appt.proof_channel ?? null,
        base_price_snapshot: appt.base_price_snapshot ?? null,
        discount_pct_snapshot: appt.discount_pct_snapshot ?? null,
        final_price_snapshot: appt.final_price_snapshot ?? null,
        client: appt.client
          ? {
              id: appt.client.id,
              name: appt.client.name,
              phone: appt.client.phone,
              email: appt.client.email,
            }
          : null,
        service: appt.service
          ? {
              id: appt.service.id,
              name: appt.service.name,
              duration_minutes: appt.service.duration_minutes,
              price: appt.service.price,
            }
          : null,
      }))

      // Calculate stats
      const stats = {
        total: appointments.length,
        pending: appointments.filter((a: any) => a.status === 'pending').length,
        confirmed: appointments.filter((a: any) => a.status === 'confirmed').length,
        completed: appointments.filter((a: any) => a.status === 'completed').length,
        cancelled: appointments.filter((a: any) => a.status === 'cancelled').length,
        no_show: appointments.filter((a: any) => a.status === 'no_show').length,
      }

      // Return in TodayAppointmentsResponse format
      return {
        appointments,
        barber: {
          id: barberData.id,
          name: barberData.name,
        },
        date: format(today, 'yyyy-MM-dd'),
        stats,
      }
    },
    enabled: !!barberId,
    staleTime: 1000 * 60, // 1 minute - will be refreshed by real-time hook anyway
  })
}

/**
 * Fetch appointments for a date range (week/month view)
 * Used in Citas (Calendar) page for multi-day views
 *
 * Returns appointments with client and service relations
 *
 * @example
 * ```tsx
 * // Fetch week's appointments
 * const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
 * const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
 * const { data: appointments } = useCalendarAppointments(weekStart, weekEnd, businessId)
 * ```
 */
export function useCalendarAppointments(startDate: Date, endDate: Date, businessId: string | null) {
  const startDateStr = format(startDate, 'yyyy-MM-dd')
  const endDateStr = format(endDate, 'yyyy-MM-dd')

  return useQuery({
    queryKey: queryKeys.appointments.range(startDateStr, endDateStr),
    queryFn: async () => {
      if (!businessId) throw new Error('Business ID is required')

      const supabase = createClient()

      // Fetch appointments with full relations (client, service)
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          scheduled_at,
          duration_minutes,
          price,
          status,
          client_notes,
          internal_notes,
          barber_id,
          client_id,
          service_id,
          client:clients!appointments_client_id_fkey (
            id,
            name,
            phone,
            email
          ),
          service:services!appointments_service_id_fkey (
            id,
            name,
            duration_minutes,
            price
          )
        `
        )
        .eq('business_id', businessId)
        .gte('scheduled_at', startOfDay(startDate).toISOString())
        .lte('scheduled_at', endOfDay(endDate).toISOString())
        .order('scheduled_at', { ascending: true })

      if (error) throw error

      // Return appointments with proper typing
      return (data || []).map((appt: any) => ({
        id: appt.id,
        scheduled_at: appt.scheduled_at,
        duration_minutes: appt.duration_minutes,
        price: appt.price,
        status: appt.status,
        client_notes: appt.client_notes,
        internal_notes: appt.internal_notes,
        barber_id: appt.barber_id,
        client_id: appt.client_id,
        service_id: appt.service_id,
        client: appt.client
          ? {
              id: appt.client.id,
              name: appt.client.name,
              phone: appt.client.phone,
              email: appt.client.email,
            }
          : null,
        service: appt.service
          ? {
              id: appt.service.id,
              name: appt.service.name,
              duration_minutes: appt.service.duration_minutes,
              price: appt.service.price,
            }
          : null,
      }))
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 2, // 2 minutes - calendar views change less frequently
  })
}
