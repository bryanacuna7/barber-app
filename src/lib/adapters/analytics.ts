/**
 * Analytics Data Adapter
 *
 * Transforms Supabase data to UI-friendly format for Reportes/Analíticas module.
 * Aggregates business intelligence from appointments, services, barbers, and clients.
 *
 * Module: Reportes (Intelligence Report)
 * Demo: preview-fusion
 */

import { Database } from '@/types/supabase'

// UI types for analytics dashboard
export interface UIAnalytics {
  // Period metadata
  period: {
    start: Date
    end: Date
    label: string // "Last 30 days", "January 2026", etc.
  }

  // Hero KPI
  heroKPI: {
    metric: 'revenue' | 'appointments' | 'clients'
    value: number
    change: number // % change vs previous period
    trend: 'up' | 'down' | 'stable'
    sparkline: number[] // 7-31 data points for mini chart
  }

  // Secondary KPIs
  kpis: {
    totalRevenue: number
    totalAppointments: number
    activeClients: number
    avgTicket: number
    completionRate: number
  }

  // Service performance
  services: {
    id: string
    name: string
    bookings: number
    revenue: number
    avgPrice: number
    trend: number // % change
    sparkline: number[]
  }[]

  // Barber performance
  barbers: {
    id: string
    name: string
    appointments: number
    revenue: number
    avgRating: number
    capacity: number
    trend: number
  }[]

  // AI insights (calculated)
  insights: {
    type: 'opportunity' | 'alert' | 'achievement'
    title: string
    description: string
    metric?: number
    action?: string
  }[]

  // Time series for charts
  timeSeries: {
    date: string // ISO date
    revenue: number
    appointments: number
  }[]
}

/**
 * Build analytics query for Supabase
 *
 * Note: This is a complex aggregation. Consider using:
 * 1. Database views for pre-aggregated data
 * 2. PostgreSQL functions for server-side calculation
 * 3. Multiple queries combined client-side
 */
export function getAnalyticsQuery(startDate: Date, endDate: Date) {
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    // Query appointments with all relationships
    appointmentsQuery: `
      *,
      clients (id, name),
      services (id, name, price),
      barbers (id, name)
    `,
  }
}

/**
 * Calculate AI-powered insights from raw data
 */
export function generateInsights(analytics: UIAnalytics): UIAnalytics['insights'] {
  const insights: UIAnalytics['insights'] = []

  // Best performing service
  const topService = analytics.services.sort((a, b) => b.revenue - a.revenue)[0]
  if (topService && topService.revenue > 0) {
    insights.push({
      type: 'achievement',
      title: `${topService.name} is your top service`,
      description: `Generated ${formatCurrency(topService.revenue)} (${topService.bookings} bookings)`,
      metric: topService.revenue,
    })
  }

  // Low completion rate alert
  if (analytics.kpis.completionRate < 80) {
    insights.push({
      type: 'alert',
      title: 'Completion rate below target',
      description: `Only ${analytics.kpis.completionRate.toFixed(1)}% of appointments were completed. Review no-show reasons.`,
      metric: analytics.kpis.completionRate,
      action: 'Implement reminder system',
    })
  }

  // Revenue growth opportunity
  if (analytics.kpis.avgTicket < 8000) {
    const potential = (10000 - analytics.kpis.avgTicket) * analytics.kpis.totalAppointments
    insights.push({
      type: 'opportunity',
      title: 'Upsell opportunity detected',
      description: `Average ticket is ${formatCurrency(analytics.kpis.avgTicket)}. Upselling to ₡10,000 could generate ${formatCurrency(potential)} more.`,
      metric: potential,
      action: 'Train staff on premium services',
    })
  }

  // High performer recognition
  const topBarber = analytics.barbers.sort((a, b) => b.revenue - a.revenue)[0]
  if (topBarber && topBarber.revenue > 0) {
    insights.push({
      type: 'achievement',
      title: `${topBarber.name} is top performer`,
      description: `Generated ${formatCurrency(topBarber.revenue)} with ${topBarber.appointments} appointments`,
      metric: topBarber.revenue,
    })
  }

  return insights.slice(0, 3) // Max 3 insights for demo
}

/**
 * Calculate trend (% change vs previous period)
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Format currency for Costa Rica (₡ Colones)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate sparkline data for time series
 */
export function calculateSparkline(timeSeries: { date: string; value: number }[]): number[] {
  return timeSeries.map((point) => point.value)
}

/**
 * Group time series data by day/week/month
 */
export function groupTimeSeries(
  data: { date: Date; value: number }[],
  groupBy: 'day' | 'week' | 'month'
): { date: string; value: number }[] {
  // Implementation would group by date intervals
  // For now, return daily grouped data
  return data.map((point) => ({
    date: point.date.toISOString().split('T')[0],
    value: point.value,
  }))
}

/**
 * Calculate comparison mode data (current vs previous period)
 */
export function calculateComparison(current: UIAnalytics, previous: UIAnalytics) {
  return {
    revenue: {
      current: current.kpis.totalRevenue,
      previous: previous.kpis.totalRevenue,
      change: calculateTrend(current.kpis.totalRevenue, previous.kpis.totalRevenue),
    },
    appointments: {
      current: current.kpis.totalAppointments,
      previous: previous.kpis.totalAppointments,
      change: calculateTrend(current.kpis.totalAppointments, previous.kpis.totalAppointments),
    },
    avgTicket: {
      current: current.kpis.avgTicket,
      previous: previous.kpis.avgTicket,
      change: calculateTrend(current.kpis.avgTicket, previous.kpis.avgTicket),
    },
  }
}
