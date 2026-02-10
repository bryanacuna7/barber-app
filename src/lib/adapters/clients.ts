/**
 * Clients Data Adapter
 *
 * Transforms Supabase clients data to UI-friendly format for Clientes module.
 * Handles client segments, loyalty tiers, and activity tracking.
 *
 * Module: Clientes (Dashboard + Canvas + Depth Fusion)
 * Demo: preview-fusion
 */

// Supabase types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

// UI types for demo
export interface UIClient {
  id: string
  name: string
  phone: string
  email: string
  totalVisits: number
  totalSpent: number
  lastVisit: Date | null
  segment: 'vip' | 'regular' | 'new' | 'at-risk'
  tier: 'gold' | 'silver' | 'bronze' | 'none'
  loyaltyPoints?: number
  notes?: string
  // Calculated fields
  avgSpent?: number
  visitFrequency?: number // visits per month
  daysSinceLastVisit?: number
}

/**
 * Adapt single client from Supabase to UI format
 */
export function adaptClient(row: SupabaseClient): UIClient {
  const lastVisit = row.last_visit_at ? new Date(row.last_visit_at) : null
  const daysSinceLastVisit = lastVisit
    ? Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || '',
    totalVisits: row.total_visits,
    totalSpent: Number(row.total_spent),
    lastVisit,
    segment: calculateSegment(row),
    tier: calculateTier(row.total_spent),
    notes: row.notes || undefined,
    avgSpent: row.total_visits > 0 ? Number(row.total_spent) / row.total_visits : 0,
    daysSinceLastVisit: daysSinceLastVisit || undefined,
  }
}

/**
 * Adapt multiple clients
 */
export function adaptClients(rows: SupabaseClient[]): UIClient[] {
  return rows.map(adaptClient)
}

/**
 * Calculate client segment based on behavior
 */
function calculateSegment(client: SupabaseClient): 'vip' | 'regular' | 'new' | 'at-risk' {
  const totalSpent = Number(client.total_spent)
  const totalVisits = client.total_visits
  const lastVisit = client.last_visit_at ? new Date(client.last_visit_at) : null
  const daysSinceLastVisit = lastVisit
    ? Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    : 999

  // VIP: High spend + frequent visits
  if (totalSpent >= 10000 && totalVisits >= 10) return 'vip'

  // At-risk: Not visited in 60+ days
  if (daysSinceLastVisit > 60 && totalVisits > 3) return 'at-risk'

  // New: < 3 visits
  if (totalVisits < 3) return 'new'

  // Regular: Everyone else
  return 'regular'
}

/**
 * Calculate loyalty tier based on total spent
 */
function calculateTier(totalSpent: number | string): 'gold' | 'silver' | 'bronze' | 'none' {
  const spent = Number(totalSpent)

  if (spent >= 15000) return 'gold'
  if (spent >= 7500) return 'silver'
  if (spent >= 3000) return 'bronze'
  return 'none'
}

/**
 * Supabase query for clients
 *
 * @example
 * ```ts
 * const { data, error } = await supabase
 *   .from('clients')
 *   .select('*')
 *   .eq('business_id', businessId)
 *   .order('total_spent', { ascending: false })
 * ```
 */
export function getClientsQuery() {
  return '*'
}

/**
 * Calculate client statistics for dashboard
 */
export function calculateClientStats(clients: UIClient[]) {
  const totalClients = clients.length
  const vipClients = clients.filter((c) => c.segment === 'vip').length
  const newClients = clients.filter((c) => c.segment === 'new').length
  const atRiskClients = clients.filter((c) => c.segment === 'at-risk').length

  const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgSpent = totalClients > 0 ? totalRevenue / totalClients : 0

  return {
    totalClients,
    vipClients,
    newClients,
    atRiskClients,
    totalRevenue,
    avgSpent,
  }
}

/**
 * Group clients by segment
 */
export function groupBySegment(clients: UIClient[]): Record<string, UIClient[]> {
  return clients.reduce(
    (acc, client) => {
      if (!acc[client.segment]) {
        acc[client.segment] = []
      }
      acc[client.segment].push(client)
      return acc
    },
    {} as Record<string, UIClient[]>
  )
}

/**
 * Filter at-risk clients (for retention campaigns)
 */
export function getAtRiskClients(clients: UIClient[]): UIClient[] {
  return clients
    .filter((c) => c.segment === 'at-risk')
    .sort((a, b) => (b.daysSinceLastVisit || 0) - (a.daysSinceLastVisit || 0))
}
