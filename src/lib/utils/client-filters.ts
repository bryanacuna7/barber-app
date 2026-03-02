import type { Client } from '@/types'
import { getClientSegment } from '@/lib/utils/client-segments'

export type ClientSegmentFilter = 'all' | 'vip' | 'frequent' | 'new' | 'inactive'
export type ClientVisitRecencyFilter = 'all' | 'last7' | 'last30' | 'over30'
export type ClientSpendFilter = 'all' | 'low' | 'mid' | 'high'
export type ClientFrequencyFilter = 'all' | 'once' | 'repeat' | 'loyal'

export interface ClientFilters {
  segment: ClientSegmentFilter
  visitRecency: ClientVisitRecencyFilter
  spendRange: ClientSpendFilter
  frequency: ClientFrequencyFilter
  highRiskOnly: boolean
}

export const DEFAULT_CLIENT_FILTERS: ClientFilters = {
  segment: 'all',
  visitRecency: 'all',
  spendRange: 'all',
  frequency: 'all',
  highRiskOnly: false,
}

export const VISIT_RECENCY_OPTIONS: Array<{
  value: ClientVisitRecencyFilter
  label: string
}> = [
  { value: 'all', label: 'Cualquier fecha' },
  { value: 'last7', label: 'Últimos 7 días' },
  { value: 'last30', label: 'Últimos 30 días' },
  { value: 'over30', label: 'Más de 30 días' },
]

export const SPEND_RANGE_OPTIONS: Array<{
  value: ClientSpendFilter
  label: string
}> = [
  { value: 'all', label: 'Cualquier gasto' },
  { value: 'low', label: '₡0 - ₡20k' },
  { value: 'mid', label: '₡20k - ₡50k' },
  { value: 'high', label: '₡50k+' },
]

export const FREQUENCY_OPTIONS: Array<{
  value: ClientFrequencyFilter
  label: string
}> = [
  { value: 'all', label: 'Cualquier frecuencia' },
  { value: 'once', label: '1 visita' },
  { value: 'repeat', label: '2-4 visitas' },
  { value: 'loyal', label: '5+ visitas' },
]

export function getDaysSinceLastVisit(client: Client): number | null {
  if (!client.last_visit_at) return null
  const lastVisit = new Date(client.last_visit_at)
  return Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
}

export function isHighRiskLossClient(client: Client): boolean {
  const daysSinceVisit = getDaysSinceLastVisit(client)
  const visits = client.total_visits || 0
  const spent = Number(client.total_spent || 0)
  const segment = getClientSegment(client)

  if (daysSinceVisit === null) return false

  // High-value or loyal customers who are no longer returning.
  if ((segment === 'vip' || visits >= 5 || spent >= 50000) && daysSinceVisit > 30) return true

  // Medium-value repeat customers cooling down.
  if ((visits >= 3 || spent >= 20000) && daysSinceVisit > 45) return true

  // Any customer absent for a long period.
  return daysSinceVisit > 75
}

export function matchesClientFilters(client: Client, filters: ClientFilters): boolean {
  const daysSinceVisit = getDaysSinceLastVisit(client)
  const visits = client.total_visits || 0
  const spent = Number(client.total_spent || 0)

  if (filters.segment !== 'all' && getClientSegment(client) !== filters.segment) return false

  if (filters.visitRecency !== 'all') {
    if (filters.visitRecency === 'last7' && (daysSinceVisit === null || daysSinceVisit > 7))
      return false
    if (filters.visitRecency === 'last30' && (daysSinceVisit === null || daysSinceVisit > 30))
      return false
    if (filters.visitRecency === 'over30' && (daysSinceVisit === null || daysSinceVisit <= 30))
      return false
  }

  if (filters.spendRange !== 'all') {
    if (filters.spendRange === 'low' && !(spent < 20000)) return false
    if (filters.spendRange === 'mid' && !(spent >= 20000 && spent < 50000)) return false
    if (filters.spendRange === 'high' && !(spent >= 50000)) return false
  }

  if (filters.frequency !== 'all') {
    if (filters.frequency === 'once' && visits !== 1) return false
    if (filters.frequency === 'repeat' && !(visits >= 2 && visits <= 4)) return false
    if (filters.frequency === 'loyal' && visits < 5) return false
  }

  if (filters.highRiskOnly && !isHighRiskLossClient(client)) return false

  return true
}

export function countActiveClientFilters(filters: ClientFilters): number {
  let count = 0
  if (filters.segment !== 'all') count++
  if (filters.visitRecency !== 'all') count++
  if (filters.spendRange !== 'all') count++
  if (filters.frequency !== 'all') count++
  if (filters.highRiskOnly) count++
  return count
}
