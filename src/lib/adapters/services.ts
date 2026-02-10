/**
 * Services Data Adapter
 *
 * Transforms Supabase services data to UI-friendly format for Servicios module.
 * Handles business metrics and performance stats.
 *
 * Module: Servicios (Simplified Hybrid + Sidebar)
 * Demo: preview-d
 */

// Supabase types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseService = any

// UI types for demo
export interface UIService {
  id: string
  name: string
  description: string
  duration: number // minutes
  price: number
  displayOrder: number
  isActive: boolean
  icon?: string // Lucide icon name for demo
  // Business metrics (calculated from appointments)
  bookings?: number
  revenue?: number
  avgRating?: number
  popularityRank?: number
}

/**
 * Adapt single service from Supabase to UI format
 */
export function adaptService(
  row: SupabaseService,
  metrics?: {
    bookings: number
    revenue: number
    avgRating: number
    popularityRank: number
  }
): UIService {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    duration: row.duration_minutes,
    price: Number(row.price),
    displayOrder: row.display_order || 0,
    isActive: row.is_active,
    // Icon mapping (optional, for demo visual system)
    icon: getServiceIcon(row.name),
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
export function adaptServices(rows: SupabaseService[], metricsMap?: Map<string, any>): UIService[] {
  return rows.map((row) => adaptService(row, metricsMap?.get(row.id)))
}

/**
 * Map service name to Lucide icon (for demo UI)
 */
function getServiceIcon(serviceName: string): string {
  const name = serviceName.toLowerCase()

  if (name.includes('corte') || name.includes('haircut')) return 'scissors'
  if (name.includes('barba') || name.includes('beard')) return 'sparkles'
  if (name.includes('afeitado') || name.includes('shave')) return 'flame'
  if (name.includes('niño') || name.includes('kids')) return 'users'
  if (name.includes('diseño')) return 'zap'
  if (name.includes('cejas')) return 'wind'
  if (name.includes('masaje')) return 'waves'
  if (name.includes('premium')) return 'crown'
  if (name.includes('básico')) return 'circle-dot'

  return 'star' // default
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
