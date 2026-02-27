/**
 * Client Segment Classification — Pure Business Logic
 *
 * Extracted from clientes/page-v2.tsx for reuse across
 * Clientes page KPIs and Analíticas Clientes tab.
 *
 * No UI dependencies (colors, icons) — see segment-config.ts for visual constants.
 */

import { subDays, isAfter } from 'date-fns'
import type { Client } from '@/types'

export type ClientSegmentType = 'vip' | 'frequent' | 'new' | 'inactive'

export function getClientSegment(client: Client): ClientSegmentType {
  const visits = client.total_visits || 0
  const spent = Number(client.total_spent || 0)
  const lastVisit = client.last_visit_at ? new Date(client.last_visit_at) : null
  const thirtyDaysAgo = subDays(new Date(), 30)

  // VIP: 5+ visitas O +50,000 gastados
  if (visits >= 5 || spent >= 50000) return 'vip'

  // Inactivo: sin visitas en 30+ días
  if (lastVisit && !isAfter(lastVisit, thirtyDaysAgo)) return 'inactive'

  // Frecuente: 3-4 visitas
  if (visits >= 3) return 'frequent'

  // Nuevo: 0-2 visitas
  return 'new'
}

export function calculateLoyalty(client: Client): number {
  const visits = client.total_visits || 0
  const lastVisit = client.last_visit_at ? new Date(client.last_visit_at) : null

  if (!lastVisit) return 0

  const daysSince = Math.floor((new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))

  // Base score from visits (max 60%)
  const visitScore = Math.min(visits * 10, 60)

  // Recency score (max 40%)
  let recencyScore = 40
  if (daysSince > 60) recencyScore = 0
  else if (daysSince > 30) recencyScore = 10
  else if (daysSince > 14) recencyScore = 20
  else if (daysSince > 7) recencyScore = 30

  return Math.min(visitScore + recencyScore, 100)
}

export function getSpendingTier(client: Client): 'bronze' | 'silver' | 'gold' | 'platinum' {
  const spent = Number(client.total_spent || 0)

  if (spent >= 100000) return 'platinum'
  if (spent >= 50000) return 'gold'
  if (spent >= 20000) return 'silver'
  return 'bronze'
}
