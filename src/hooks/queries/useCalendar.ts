/**
 * Calendar Query Hooks
 * Module: Citas (Calendar Cinema + macOS)
 */

import { useQuery } from '@tanstack/react-query'
import { startOfDay, endOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/react-query/config'
import { getCalendarQuery, adaptToCalendarEvent } from '@/lib/adapters/calendar'

export function useCalendarEvents(date: Date, businessId: string, barberId?: string) {
  return useQuery({
    queryKey: barberId
      ? queryKeys.calendar.view(date.toISOString(), barberId)
      : queryKeys.calendar.view(date.toISOString()),
    queryFn: async () => {
      const startDate = startOfDay(date)
      const endDate = endOfDay(date)

      let query = supabase
        .from('appointments')
        .select(getCalendarQuery())
        .eq('business_id', businessId)
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString())

      if (barberId) {
        query = query.eq('barber_id', barberId)
      }

      const { data, error } = await query.order('scheduled_at', { ascending: true })

      if (error) throw error

      // Transform to calendar events
      return (data || []).map((appt: any) =>
        adaptToCalendarEvent(
          appt,
          appt.clients?.name || 'Unknown',
          appt.services?.name || 'Unknown',
          appt.barbers?.name || 'Unassigned'
        )
      )
    },
    enabled: !!businessId,
  })
}
