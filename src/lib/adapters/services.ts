/**
 * Services Data Adapter
 *
 * Transforms Supabase services data to UI-friendly format for Servicios module.
 * Handles business metrics and performance stats.
 *
 * Module: Servicios (Simplified Hybrid + Sidebar)
 * Demo: preview-d
 */

import { resolveServiceIcon, type ServiceIconName } from '@/lib/services/icons'

type SupabaseService = {
  id: string
  name: string
  description: string | null
  category: string | null
  icon: string | null
  duration_minutes: number
  price: number | string
  display_order: number | null
  is_active: boolean
}

type ServiceMetricsMapValue = {
  bookings: number
  revenue: number
  avgRating: number
  popularityRank: number
}

// UI types for demo
export interface UIService {
  id: string
  name: string
  description: string
  category: string
  duration: number // minutes
  price: number
  displayOrder: number
  isActive: boolean
  icon?: ServiceIconName // Lucide icon name for demo
  // Business metrics (calculated from appointments)
  bookings?: number
  revenue?: number
  avgRating?: number
  popularityRank?: number
}

/**
 * Adapt single service from Supabase to UI format
 */
export function adaptService(row: SupabaseService, metrics?: ServiceMetricsMapValue): UIService {
  const icon = resolveServiceIcon(row.icon, row.category, row.name, row.description)

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    category: row.category || 'corte',
    duration: row.duration_minutes,
    price: Number(row.price),
    displayOrder: row.display_order || 0,
    isActive: row.is_active,
    icon,
    // Business metrics
    bookings: metrics?.bookings,
    revenue: metrics?.revenue,
    avgRating: metrics?.avgRating,
    popularityRank: metrics?.popularityRank,
  }
}

/**
 * Adapt multiple services
 */
export function adaptServices(
  rows: SupabaseService[],
  metricsMap?: Map<string, ServiceMetricsMapValue>
): UIService[] {
  return rows.map((row) => adaptService(row, metricsMap?.get(row.id)))
}

/**
 * Supabase query for services with metrics
 *
 * Note: Metrics require JOIN with appointments table
 *
 * @example
 * ```ts
 * const { data, error } = await supabase
 *   .from('services')
 *   .select('*')
 *   .eq('business_id', businessId)
 *   .eq('is_active', true)
 *   .order('display_order', { ascending: true })
 * ```
 */
export function getServicesQuery() {
  return '*'
}

/**
 * Calculate service performance metrics
 * (Run this query separately or in a DB function)
 *
 * @example
 * ```sql
 * SELECT
 *   service_id,
 *   COUNT(*) as bookings,
 *   SUM(price) as revenue,
 *   RANK() OVER (ORDER BY COUNT(*) DESC) as popularity_rank
 * FROM appointments
 * WHERE business_id = $1
 *   AND scheduled_at >= $2
 *   AND scheduled_at < $3
 *   AND status != 'cancelled'
 * GROUP BY service_id
 * ```
 */
export interface ServiceMetrics {
  serviceId: string
  bookings: number
  revenue: number
  popularityRank: number
}

/**
 * Calculate aggregate statistics for services sidebar
 */
export function calculateServiceStats(services: UIService[]) {
  const totalServices = services.length
  const activeServices = services.filter((s) => s.isActive).length
  const totalRevenue = services.reduce((sum, s) => sum + (s.revenue || 0), 0)
  const avgBookings = services.reduce((sum, s) => sum + (s.bookings || 0), 0) / totalServices

  return {
    totalServices,
    activeServices,
    totalRevenue,
    avgBookings,
  }
}

/**
 * Sort services by popularity
 */
export function sortByPopularity(services: UIService[]): UIService[] {
  return [...services].sort((a, b) => (b.bookings || 0) - (a.bookings || 0))
}
