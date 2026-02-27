/**
 * Clients Domain Types
 *
 * Business logic types for client relationship management.
 * Module: Clientes (Dashboard + Canvas + Depth Fusion)
 */

export type ClientSegment = 'vip' | 'regular' | 'new' | 'at-risk'
export type LoyaltyTier = 'gold' | 'silver' | 'bronze' | 'none'

export interface Client {
  id: string
  name: string
  phone: string
  email: string
  totalVisits: number
  totalSpent: number
  lastVisit: Date | null
  segment: ClientSegment
  tier: LoyaltyTier
  loyaltyPoints?: number
  notes?: string
  // Calculated fields
  avgSpent?: number
  visitFrequency?: number // visits per month
  daysSinceLastVisit?: number
}

export interface ClientStatistics {
  totalClients: number
  vipClients: number
  newClients: number
  atRiskClients: number
  totalRevenue: number
  avgSpent: number
}

export interface ClientActivityTimeline {
  id: string
  clientId: string
  date: Date
  type: 'appointment' | 'note' | 'loyalty_milestone'
  description: string
  amount?: number
}

export type ClientViewMode = 'cards' | 'table' | 'calendar'

export type ClientSortField =
  | 'name'
  | 'segment'
  | 'tier'
  | 'totalVisits'
  | 'totalSpent'
  | 'lastVisit'
