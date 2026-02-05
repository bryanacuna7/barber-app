/**
 * Analytics Query Hooks
 *
 * React Query hooks for business analytics and reporting.
 * Module: Reportes (Analytics Dashboard)
 *
 * Created: Session 117 - Phase 0 Week 5-6
 * Updated: Modernized to consolidate 4 analytics endpoints
 */

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query/config'

/**
 * Period type for analytics queries
 */
export type AnalyticsPeriod = 'week' | 'month' | 'year'

/**
 * Overview metrics response
 */
export interface OverviewMetrics {
  totalAppointments: number
  completedAppointments: number
  totalRevenue: number
  avgPerAppointment: number
  completionRate: number
}

/**
 * Revenue series data point
 */
export interface RevenueDataPoint {
  date: string
  value: number
}

/**
 * Service performance data
 */
export interface ServiceData {
  name: string
  value: number
}

/**
 * Barber performance data
 */
export interface BarberData {
  name: string
  value: number
  avatar?: string
}

/**
 * Consolidated analytics response
 */
export interface BusinessAnalytics {
  overview: OverviewMetrics
  revenueSeries: RevenueDataPoint[]
  services: ServiceData[]
  barbers: BarberData[]
  period: AnalyticsPeriod
  dateRange: {
    start: string
    end: string
  }
}

/**
 * Fetch consolidated business analytics
 *
 * Combines all 4 analytics endpoints into a single query:
 * - Overview metrics (KPIs)
 * - Revenue time series
 * - Services performance
 * - Barbers leaderboard
 *
 * @param period - Time period ('week' | 'month' | 'year')
 * @returns Consolidated analytics data
 *
 * @example
 * ```tsx
 * const { data: analytics, isLoading, error } = useBusinessAnalytics('month')
 *
 * if (isLoading) return <Skeleton />
 * if (error) return <QueryError error={error} retry={refetch} />
 *
 * return (
 *   <>
 *     <KPICards metrics={analytics.overview} />
 *     <RevenueChart data={analytics.revenueSeries} />
 *     <ServicesChart data={analytics.services} />
 *     <BarbersLeaderboard data={analytics.barbers} />
 *   </>
 * )
 * ```
 */
export function useBusinessAnalytics(period: AnalyticsPeriod = 'month') {
  return useQuery({
    queryKey: queryKeys.analytics.byPeriod(period),
    queryFn: async (): Promise<BusinessAnalytics> => {
      // Fetch all 4 endpoints in parallel
      const [overviewRes, revenueRes, servicesRes, barbersRes] = await Promise.all([
        fetch(`/api/analytics/overview?period=${period}`),
        fetch(`/api/analytics/revenue-series?period=${period}`),
        fetch(`/api/analytics/services?period=${period}`),
        fetch(`/api/analytics/barbers?period=${period}`),
      ])

      // Check all responses
      if (!overviewRes.ok) {
        throw new Error(`Overview fetch failed: ${overviewRes.statusText}`)
      }
      if (!revenueRes.ok) {
        throw new Error(`Revenue series fetch failed: ${revenueRes.statusText}`)
      }
      if (!servicesRes.ok) {
        throw new Error(`Services fetch failed: ${servicesRes.statusText}`)
      }
      if (!barbersRes.ok) {
        throw new Error(`Barbers fetch failed: ${barbersRes.statusText}`)
      }

      // Parse all responses
      const [overviewData, revenueData, servicesData, barbersData] = await Promise.all([
        overviewRes.json(),
        revenueRes.json(),
        servicesRes.json(),
        barbersRes.json(),
      ])

      // Return consolidated structure
      return {
        overview: overviewData.metrics,
        revenueSeries: revenueData.series || [],
        services: servicesData.services || [],
        barbers: barbersData.barbers || [],
        period: overviewData.period || period,
        dateRange: overviewData.dateRange || { start: '', end: '' },
      }
    },
    // Analytics data changes frequently, shorter stale time
    staleTime: 1 * 60 * 1000, // 1 minute
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Hook for overview metrics only (lighter query)
 *
 * Use this when you only need KPI metrics without charts.
 *
 * @param period - Time period
 * @returns Overview metrics only
 */
export function useOverviewMetrics(period: AnalyticsPeriod = 'month') {
  return useQuery({
    queryKey: [...queryKeys.analytics.byPeriod(period), 'overview-only'],
    queryFn: async (): Promise<OverviewMetrics> => {
      const response = await fetch(`/api/analytics/overview?period=${period}`)

      if (!response.ok) {
        throw new Error(`Overview fetch failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data.metrics
    },
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
