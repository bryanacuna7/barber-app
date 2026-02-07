/**
 * Analytics Domain Types
 *
 * Business logic types for business intelligence and reporting.
 * Module: Reportes (Intelligence Report)
 */

export type InsightType = 'opportunity' | 'alert' | 'achievement'
export type TrendDirection = 'up' | 'down' | 'stable'
export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface Period {
  start: Date
  end: Date
  label: string // "Last 30 days", "January 2026", etc.
}

export interface HeroKPI {
  metric: 'revenue' | 'appointments' | 'clients'
  value: number
  change: number // % change vs previous period
  trend: TrendDirection
  sparkline: number[] // 7-31 data points for mini chart
}

export interface KPIs {
  totalRevenue: number
  totalAppointments: number
  activeClients: number
  avgTicket: number
  completionRate: number
}

export interface ServicePerformance {
  id: string
  name: string
  bookings: number
  revenue: number
  avgPrice: number
  trend: number // % change
  sparkline: number[]
}

export interface BarberPerformance {
  id: string
  name: string
  appointments: number
  revenue: number
  avgRating: number
  capacity: number
  trend: number // % change
}

export interface AIInsight {
  type: InsightType
  title: string
  description: string
  metric?: number
  action?: string
}

export interface TimeSeriesDataPoint {
  date: string // ISO date
  revenue: number
  appointments: number
}

export interface Analytics {
  period: Period
  heroKPI: HeroKPI
  kpis: KPIs
  services: ServicePerformance[]
  barbers: BarberPerformance[]
  insights: AIInsight[]
  timeSeries: TimeSeriesDataPoint[]
}

export interface ComparisonData {
  revenue: {
    current: number
    previous: number
    change: number
  }
  appointments: {
    current: number
    previous: number
    change: number
  }
  avgTicket: {
    current: number
    previous: number
    change: number
  }
}
