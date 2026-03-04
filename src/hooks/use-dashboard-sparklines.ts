import { useQuery } from '@tanstack/react-query'
import { subDays, startOfDay, format, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/contexts/business-context'

export interface DashboardSparklines {
  revenue: number[]
  appointments: number[]
  clients: number[]
  revenueWeeklyTrend: number // % vs prior 7 days
  clientWeeklyChange: number // abs diff vs prior 7 days
}

export function useDashboardSparklines() {
  const { businessId } = useBusiness()

  return useQuery<DashboardSparklines>({
    queryKey: ['dashboard-sparklines', businessId],
    queryFn: async () => {
      if (!businessId) throw new Error('Business ID required')
      const supabase = createClient()

      const now = new Date()
      // 14 days: prior 7 for trend comparison + last 7 for display
      const since = startOfDay(subDays(now, 13)).toISOString()

      const [apptResult, clientResult] = await Promise.all([
        supabase
          .from('appointments')
          .select('scheduled_at, price, status')
          .eq('business_id', businessId)
          .gte('scheduled_at', since)
          .not('status', 'in', '(cancelled,no_show)'),
        supabase
          .from('clients')
          .select('created_at')
          .eq('business_id', businessId)
          .gte('created_at', since),
      ])

      if (apptResult.error) throw apptResult.error
      if (clientResult.error) throw clientResult.error

      // 14-day key array [oldest → newest]
      const dayKeys = Array.from({ length: 14 }, (_, i) =>
        format(startOfDay(subDays(now, 13 - i)), 'yyyy-MM-dd')
      )

      const revenueByDay: Record<string, number> = {}
      const countByDay: Record<string, number> = {}
      const clientsByDay: Record<string, number> = {}
      dayKeys.forEach((k) => {
        revenueByDay[k] = 0
        countByDay[k] = 0
        clientsByDay[k] = 0
      })
      ;(apptResult.data || []).forEach((apt: { scheduled_at: string; price: number }) => {
        const day = format(parseISO(apt.scheduled_at), 'yyyy-MM-dd')
        if (revenueByDay[day] !== undefined) {
          revenueByDay[day] += apt.price || 0
          countByDay[day] += 1
        }
      })
      ;(clientResult.data || []).forEach((c: { created_at: string | null }) => {
        if (!c.created_at) return
        const day = format(parseISO(c.created_at), 'yyyy-MM-dd')
        if (clientsByDay[day] !== undefined) clientsByDay[day] += 1
      })

      const prior7 = dayKeys.slice(0, 7)
      const last7 = dayKeys.slice(7)

      const priorRevenue = prior7.reduce((s, k) => s + revenueByDay[k], 0)
      const lastRevenue = last7.reduce((s, k) => s + revenueByDay[k], 0)
      const revenueWeeklyTrend =
        priorRevenue === 0 ? 0 : Math.round(((lastRevenue - priorRevenue) / priorRevenue) * 100)

      const priorClients = prior7.reduce((s, k) => s + clientsByDay[k], 0)
      const lastClients = last7.reduce((s, k) => s + clientsByDay[k], 0)
      const clientWeeklyChange = lastClients - priorClients

      return {
        revenue: last7.map((k) => revenueByDay[k]),
        appointments: last7.map((k) => countByDay[k]),
        clients: last7.map((k) => clientsByDay[k]),
        revenueWeeklyTrend,
        clientWeeklyChange,
      }
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}
