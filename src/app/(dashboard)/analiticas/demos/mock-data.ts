/**
 * Mock Data for Reportes/Analíticas Demos
 * Comprehensive analytics data for auth-free demos
 */

export interface OverviewMetrics {
  // Current period
  totalRevenue: number
  completedAppointments: number
  totalAppointments: number
  avgPerAppointment: number
  completionRate: number

  // Previous period comparison
  prevTotalRevenue: number
  prevCompletedAppointments: number
  prevAvgPerAppointment: number
  prevCompletionRate: number

  // Calculated changes
  revenueChange: number // percentage
  appointmentsChange: number
  avgChange: number
  rateChange: number
}

export interface RevenueSeries {
  date: string // YYYY-MM-DD
  revenue: number
  appointments: number
}

export interface ServiceMetric {
  id: string
  name: string
  count: number
  revenue: number
  avgDuration: number // minutes
  completionRate: number
}

export interface BarberMetric {
  id: string
  name: string
  avatar?: string
  appointments: number
  revenue: number
  avgRating: number
  completionRate: number
}

export interface ClientSegment {
  segment: 'VIP' | 'Regular' | 'New'
  count: number
  revenue: number
  avgVisits: number
}

export interface Alert {
  id: string
  type: 'warning' | 'success' | 'info'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  date: string
}

// Current Period: January 2026
export const mockOverview: OverviewMetrics = {
  // Current
  totalRevenue: 487500,
  completedAppointments: 142,
  totalAppointments: 156,
  avgPerAppointment: 3433,
  completionRate: 91,

  // Previous (December 2025)
  prevTotalRevenue: 435000,
  prevCompletedAppointments: 128,
  prevAvgPerAppointment: 3398,
  prevCompletionRate: 89,

  // Changes
  revenueChange: 12.1, // +12.1%
  appointmentsChange: 10.9,
  avgChange: 1.0,
  rateChange: 2.2,
}

// Daily revenue for January 2026 (31 days)
export const mockRevenueSeries: RevenueSeries[] = [
  { date: '2026-01-01', revenue: 12500, appointments: 4 },
  { date: '2026-01-02', revenue: 15200, appointments: 5 },
  { date: '2026-01-03', revenue: 18900, appointments: 6 },
  { date: '2026-01-04', revenue: 16800, appointments: 5 },
  { date: '2026-01-05', revenue: 8500, appointments: 3 },
  { date: '2026-01-06', revenue: 14200, appointments: 4 },
  { date: '2026-01-07', revenue: 19500, appointments: 6 },
  { date: '2026-01-08', revenue: 16300, appointments: 5 },
  { date: '2026-01-09', revenue: 17800, appointments: 5 },
  { date: '2026-01-10', revenue: 20100, appointments: 6 },
  { date: '2026-01-11', revenue: 18400, appointments: 5 },
  { date: '2026-01-12', revenue: 9200, appointments: 3 },
  { date: '2026-01-13', revenue: 15600, appointments: 5 },
  { date: '2026-01-14', revenue: 21300, appointments: 7 },
  { date: '2026-01-15', revenue: 17900, appointments: 5 },
  { date: '2026-01-16', revenue: 16700, appointments: 5 },
  { date: '2026-01-17', revenue: 19800, appointments: 6 },
  { date: '2026-01-18', revenue: 18200, appointments: 5 },
  { date: '2026-01-19', revenue: 10100, appointments: 3 },
  { date: '2026-01-20', revenue: 14800, appointments: 4 },
  { date: '2026-01-21', revenue: 20500, appointments: 6 },
  { date: '2026-01-22', revenue: 17600, appointments: 5 },
  { date: '2026-01-23', revenue: 16900, appointments: 5 },
  { date: '2026-01-24', revenue: 19200, appointments: 6 },
  { date: '2026-01-25', revenue: 18100, appointments: 5 },
  { date: '2026-01-26', revenue: 9800, appointments: 3 },
  { date: '2026-01-27', revenue: 15400, appointments: 5 },
  { date: '2026-01-28', revenue: 20800, appointments: 6 },
  { date: '2026-01-29', revenue: 17300, appointments: 5 },
  { date: '2026-01-30', revenue: 16500, appointments: 5 },
  { date: '2026-01-31', revenue: 19100, appointments: 6 },
]

export const mockServices: ServiceMetric[] = [
  {
    id: '1',
    name: 'Corte Clásico',
    count: 45,
    revenue: 135000,
    avgDuration: 30,
    completionRate: 95,
  },
  {
    id: '2',
    name: 'Corte + Barba',
    count: 38,
    revenue: 152000,
    avgDuration: 45,
    completionRate: 92,
  },
  {
    id: '3',
    name: 'Fade Moderno',
    count: 32,
    revenue: 128000,
    avgDuration: 40,
    completionRate: 90,
  },
  {
    id: '4',
    name: 'Afeitado Premium',
    count: 18,
    revenue: 54000,
    avgDuration: 35,
    completionRate: 94,
  },
  {
    id: '5',
    name: 'Diseño de Barba',
    count: 9,
    revenue: 18500,
    avgDuration: 25,
    completionRate: 88,
  },
]

export const mockBarbers: BarberMetric[] = [
  {
    id: '1',
    name: 'Carlos Méndez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    appointments: 52,
    revenue: 182000,
    avgRating: 4.9,
    completionRate: 96,
  },
  {
    id: '2',
    name: 'Juan Ramírez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
    appointments: 48,
    revenue: 168000,
    avgRating: 4.8,
    completionRate: 92,
  },
  {
    id: '3',
    name: 'Miguel Torres',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel',
    appointments: 42,
    revenue: 137500,
    avgRating: 4.7,
    completionRate: 88,
  },
]

export const mockClientSegments: ClientSegment[] = [
  {
    segment: 'VIP',
    count: 28,
    revenue: 168000,
    avgVisits: 4.2,
  },
  {
    segment: 'Regular',
    count: 85,
    revenue: 255000,
    avgVisits: 2.8,
  },
  {
    segment: 'New',
    count: 43,
    revenue: 64500,
    avgVisits: 1.0,
  },
]

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'success',
    title: 'Nuevo récord de ingresos',
    description: 'Enero 2026 superó diciembre en 12.1% (₡52,500 más)',
    impact: 'high',
    date: '2026-01-31',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Caída en domingos',
    description: 'Ingresos de domingos bajaron 18% vs promedio semanal',
    impact: 'medium',
    date: '2026-01-26',
  },
  {
    id: '3',
    type: 'info',
    title: 'Servicio emergente',
    description: 'Diseño de Barba creció 35% este mes',
    impact: 'low',
    date: '2026-01-20',
  },
]

// Helper function to get comparison text
export function getComparisonText(
  value: number,
  prevValue: number
): {
  change: number
  text: string
  positive: boolean
} {
  const change = ((value - prevValue) / prevValue) * 100
  const positive = change >= 0
  const text = `${positive ? '+' : ''}${change.toFixed(1)}% vs mes anterior`

  return { change, text, positive }
}

// Helper function to format currency
export function formatCurrency(value: number): string {
  return `₡${value.toLocaleString()}`
}

// Helper function to get week label
export function getWeekLabel(date: string): string {
  const d = new Date(date)
  const week = Math.ceil(d.getDate() / 7)
  return `Semana ${week}`
}
