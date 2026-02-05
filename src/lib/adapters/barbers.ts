/**
 * Barbers Data Adapter
 *
 * Transforms Supabase barbers data to UI-friendly format for Barberos module.
 * Handles staff performance metrics and gamification data.
 *
 * Module: Barberos (Visual CRM Canvas)
 * Demo: preview-b
 */

import { Database } from '@/types/supabase'

// Supabase types
type SupabaseBarber = Database['public']['Tables']['barbers']['Row']

// UI types for demo
export interface UIBarber {
  id: string
  name: string
  email: string
  phone: string
  role: 'owner' | 'barber'
  isActive: boolean
  avatarUrl?: string
  // Performance metrics (calculated from appointments)
  totalAppointments?: number
  totalRevenue?: number
  avgRating?: number
  capacity?: number // % of available slots filled
  // Gamification
  rank?: number // 1, 2, 3, etc.
  badges?: ('top-performer' | 'streak' | 'customer-favorite')[]
  level?: number
  xp?: number
}

/**
 * Adapt single barber from Supabase to UI format
 */
export function adaptBarber(
  row: SupabaseBarber,
  metrics?: {
    totalAppointments: number
    totalRevenue: number
    avgRating: number
    capacity: number
    rank: number
    badges: UIBarber['badges']
    level: number
    xp: number
  }
): UIBarber {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role as 'owner' | 'barber',
    isActive: row.is_active,
    avatarUrl: row.avatar_url || undefined,
    // Performance metrics
    totalAppointments: metrics?.totalAppointments,
    totalRevenue: metrics?.totalRevenue,
    avgRating: metrics?.avgRating,
    capacity: metrics?.capacity,
    // Gamification
    rank: metrics?.rank,
    badges: metrics?.badges,
    level: metrics?.level,
    xp: metrics?.xp,
  }
}

/**
 * Adapt multiple barbers
 */
export function adaptBarbers(rows: SupabaseBarber[], metricsMap?: Map<string, any>): UIBarber[] {
  return rows.map((row) => adaptBarber(row, metricsMap?.get(row.id)))
}

/**
 * Supabase query for barbers
 *
 * @example
 * ```ts
 * const { data, error } = await supabase
 *   .from('barbers')
 *   .select('*')
 *   .eq('business_id', businessId)
 *   .eq('is_active', true)
 *   .order('name', { ascending: true })
 * ```
 */
export function getBarbersQuery() {
  return '*'
}

/**
 * Calculate barber performance metrics
 * (Run this query separately or in a DB function)
 *
 * @example
 * ```sql
 * SELECT
 *   barber_id,
 *   COUNT(*) as total_appointments,
 *   SUM(price) as total_revenue,
 *   RANK() OVER (ORDER BY SUM(price) DESC) as rank
 * FROM appointments
 * WHERE business_id = $1
 *   AND scheduled_at >= $2
 *   AND scheduled_at < $3
 *   AND status = 'completed'
 * GROUP BY barber_id
 * ```
 */
export interface BarberMetrics {
  barberId: string
  totalAppointments: number
  totalRevenue: number
  rank: number
}

/**
 * Calculate team statistics for dashboard
 */
export function calculateTeamStats(barbers: UIBarber[]) {
  const totalBarbers = barbers.length
  const activeBarbers = barbers.filter((b) => b.isActive).length
  const totalRevenue = barbers.reduce((sum, b) => sum + (b.totalRevenue || 0), 0)
  const avgRevenuePerBarber = activeBarbers > 0 ? totalRevenue / activeBarbers : 0

  return {
    totalBarbers,
    activeBarbers,
    totalRevenue,
    avgRevenuePerBarber,
  }
}

/**
 * Sort barbers by performance (for leaderboard)
 */
export function sortByPerformance(barbers: UIBarber[]): UIBarber[] {
  return [...barbers].sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
}

/**
 * Calculate capacity utilization
 *
 * @param totalAppointments - Actual appointments completed
 * @param availableSlots - Maximum possible slots (based on schedule)
 */
export function calculateCapacity(totalAppointments: number, availableSlots: number): number {
  if (availableSlots === 0) return 0
  return Math.min((totalAppointments / availableSlots) * 100, 100)
}

/**
 * Determine badges based on performance
 */
export function calculateBadges(barber: UIBarber): UIBarber['badges'] {
  const badges: UIBarber['badges'] = []

  if (barber.rank === 1) badges.push('top-performer')
  if (barber.avgRating && barber.avgRating >= 4.8) badges.push('customer-favorite')
  // Streak would require additional data tracking (consecutive days worked)

  return badges
}
