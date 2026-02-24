/**
 * Barbers Domain Types
 *
 * Business logic types for team management and performance tracking.
 * Module: Equipo (Visual CRM Canvas)
 */

export type BarberRole = 'owner' | 'barber'
export type BarberBadge = 'top-performer' | 'streak' | 'customer-favorite'
export type BarberViewMode = 'cards' | 'table' | 'leaderboard' | 'calendar'

export interface Barber {
  id: string
  name: string
  email: string
  phone: string
  role: BarberRole
  isActive: boolean
  avatarUrl?: string
  // Performance metrics
  totalAppointments?: number
  totalRevenue?: number
  avgRating?: number
  capacity?: number // % of available slots filled
  // Gamification
  rank?: number // 1, 2, 3, etc.
  badges?: BarberBadge[]
  level?: number
  xp?: number
}

export interface BarberMetrics {
  barberId: string
  totalAppointments: number
  totalRevenue: number
  rank: number
}

export interface TeamStatistics {
  totalBarbers: number
  activeBarbers: number
  totalRevenue: number
  avgRevenuePerBarber: number
}

export type BarberSortField =
  | 'name'
  | 'totalRevenue'
  | 'totalAppointments'
  | 'avgRating'
  | 'capacity'
