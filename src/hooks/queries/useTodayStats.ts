/**
 * useTodayStats — lightweight hook for today's appointment summary.
 *
 * Powers:
 *  - Badge count on Citas tab in BottomNav
 *  - "Next Up" contextual chip above bottom nav
 *
 * Fetches only pending/confirmed appointments for today.
 * Refetches every 2 minutes; instantly stale so it picks up Realtime changes.
 */

import { useQuery } from '@tanstack/react-query'
import { startOfDay, endOfDay, differenceInMinutes, format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

export interface NextUpAppointment {
  id: string
  clientName: string
  serviceName: string
  scheduledAt: string
  /** minutes until this appointment starts */
  minutesUntil: number
  /** formatted time label e.g. "10:30 AM" */
  timeLabel: string
}

export interface TodayStats {
  /** remaining pending/confirmed appointments today */
  count: number
  /** next upcoming appointment within the next 60 minutes, or null */
  nextUp: NextUpAppointment | null
}

export function useTodayStats(businessId: string | undefined | null): {
  data: TodayStats
  isLoading: boolean
} {
  const result = useQuery<TodayStats>({
    queryKey: ['today-stats', businessId],
    queryFn: async (): Promise<TodayStats> => {
      if (!businessId) return { count: 0, nextUp: null }

      const now = new Date()
      const supabase = createClient()

      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          scheduled_at,
          status,
          client:clients!appointments_client_id_fkey (name),
          service:services!appointments_service_id_fkey (name)
        `
        )
        .eq('business_id', businessId)
        .gte('scheduled_at', startOfDay(now).toISOString())
        .lte('scheduled_at', endOfDay(now).toISOString())
        .in('status', ['pending', 'confirmed'])
        .order('scheduled_at', { ascending: true })

      if (error) throw error

      const appointments = data || []

      // Find first appointment that hasn't started yet (after now)
      const upcoming = appointments.find((apt) => new Date(apt.scheduled_at) > now)
      const minutesUntil = upcoming
        ? differenceInMinutes(new Date(upcoming.scheduled_at), now)
        : null

      const nextUp: NextUpAppointment | null =
        upcoming && minutesUntil !== null && minutesUntil <= 60
          ? {
              id: upcoming.id,
              clientName: (upcoming.client as { name?: string } | null)?.name ?? 'Cliente',
              serviceName: (upcoming.service as { name?: string } | null)?.name ?? 'Servicio',
              scheduledAt: upcoming.scheduled_at,
              minutesUntil,
              timeLabel: format(new Date(upcoming.scheduled_at), 'h:mm a'),
            }
          : null

      return { count: appointments.length, nextUp }
    },
    enabled: !!businessId,
    staleTime: 0, // always re-validate so Realtime invalidations land immediately
    refetchInterval: 2 * 60 * 1000, // 2-minute background poll as safety net
  })

  return {
    data: result.data ?? { count: 0, nextUp: null },
    isLoading: result.isLoading,
  }
}
