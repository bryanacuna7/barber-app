/**
 * Analytics Query Hooks
 * Module: Reportes (Intelligence Report)
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/react-query/config'
import { getAnalyticsQuery } from '@/lib/adapters/analytics'

export function useAnalytics(startDate: Date, endDate: Date, businessId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.period(startDate.toISOString(), endDate.toISOString()),
    queryFn: async () => {
      const query = getAnalyticsQuery(startDate, endDate)

      // Fetch appointments with all relationships
      const { data, error } = await supabase
        .from('appointments')
        .select(query.appointmentsQuery)
        .eq('business_id', businessId)
        .gte('scheduled_at', query.startDate)
        .lte('scheduled_at', query.endDate)

      if (error) throw error

      // Transform to analytics format
      // (In production, this would be more complex aggregation)
      return data
    },
    enabled: !!businessId,
  })
}
