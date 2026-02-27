/**
 * React Query Hook — Client Metrics & Insights
 *
 * Wraps useAllClients to provide calculated KPIs, segment data,
 * and AI-style insights (churn risk, winback, upsell).
 *
 * Used by:
 * - Clientes page (KPI strip + full client list)
 * - Analíticas > Clientes tab (KPIs + charts + insights)
 */

'use client'

import { useMemo } from 'react'
import { startOfMonth, isAfter, subDays } from 'date-fns'
import type { Client } from '@/types'
import { getClientSegment } from '@/lib/utils/client-segments'
import { useAllClients } from './useAllClients'

interface UseClientMetricsOptions {
  enabled?: boolean
}

export interface ClientMetrics {
  total: number
  newThisMonth: number
  recentActive: number
  segments: { vip: number; frequent: number; new: number; inactive: number }
  avgValue: number
  totalRevenue: number
  topClient: Client | undefined
}

export interface ClientMetricsResult {
  metrics: ClientMetrics
  clients: Client[]
  churnRiskClients: Client[]
  winbackClients: Client[]
  upsellCandidates: Client[]
  segmentPieData: Array<{ name: string; value: number; color: string }>
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<unknown>
}

const EMPTY_METRICS: ClientMetrics = {
  total: 0,
  newThisMonth: 0,
  recentActive: 0,
  segments: { vip: 0, frequent: 0, new: 0, inactive: 0 },
  avgValue: 0,
  totalRevenue: 0,
  topClient: undefined,
}

export function useClientMetrics(
  businessId: string | null,
  options?: UseClientMetricsOptions
): ClientMetricsResult {
  const { data, isLoading, error, refetch } = useAllClients(businessId, {
    enabled: options?.enabled,
  })

  const clients = useMemo(() => data?.clients || [], [data?.clients])

  const metrics = useMemo((): ClientMetrics => {
    if (clients.length === 0) return EMPTY_METRICS

    const now = new Date()
    const monthStart = startOfMonth(now)
    const thirtyDaysAgo = subDays(now, 30)

    const newThisMonth = clients.filter((c) => {
      const createdAt = c.created_at ? new Date(c.created_at) : null
      return createdAt && isAfter(createdAt, monthStart)
    }).length

    const recentActive = clients.filter((c) => {
      const lastVisit = c.last_visit_at ? new Date(c.last_visit_at) : null
      return lastVisit && isAfter(lastVisit, thirtyDaysAgo)
    }).length

    const segments = {
      vip: clients.filter((c) => getClientSegment(c) === 'vip').length,
      frequent: clients.filter((c) => getClientSegment(c) === 'frequent').length,
      new: clients.filter((c) => getClientSegment(c) === 'new').length,
      inactive: clients.filter((c) => getClientSegment(c) === 'inactive').length,
    }

    const totalRevenue = clients.reduce((sum, c) => sum + Number(c.total_spent || 0), 0)
    const avgValue = clients.length > 0 ? totalRevenue / clients.length : 0

    const topClient = clients.reduce(
      (top, c) => (Number(c.total_spent || 0) > Number(top?.total_spent || 0) ? c : top),
      clients[0]
    )

    return {
      total: clients.length,
      newThisMonth,
      recentActive,
      segments,
      avgValue,
      totalRevenue,
      topClient,
    }
  }, [clients])

  const churnRiskClients = useMemo(() => {
    return clients
      .filter((c) => {
        const segment = getClientSegment(c)
        const lastVisit = c.last_visit_at ? new Date(c.last_visit_at) : null
        if (!lastVisit) return true

        const daysSinceVisit = Math.floor(
          (new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
        )

        return (
          ((segment === 'vip' || segment === 'frequent') && daysSinceVisit > 30) ||
          daysSinceVisit > 60
        )
      })
      .sort((a, b) => {
        const aVisit = a.last_visit_at ? new Date(a.last_visit_at).getTime() : 0
        const bVisit = b.last_visit_at ? new Date(b.last_visit_at).getTime() : 0
        return aVisit - bVisit
      })
      .slice(0, 8)
  }, [clients])

  const winbackClients = useMemo(() => {
    return clients
      .filter((c) => getClientSegment(c) === 'inactive' && (c.total_visits || 0) >= 3)
      .sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0))
      .slice(0, 12)
  }, [clients])

  const upsellCandidates = useMemo(() => {
    return clients
      .filter((c) => getClientSegment(c) === 'frequent' && (c.total_visits || 0) >= 3)
      .sort((a, b) => (b.total_visits || 0) - (a.total_visits || 0))
      .slice(0, 5)
  }, [clients])

  const segmentPieData = useMemo(() => {
    return [
      { name: 'VIP', value: metrics.segments.vip, color: 'var(--color-amber-500)' },
      { name: 'Frecuente', value: metrics.segments.frequent, color: 'var(--color-blue-500)' },
      { name: 'Nuevo', value: metrics.segments.new, color: 'var(--color-green-500)' },
      { name: 'Inactivo', value: metrics.segments.inactive, color: 'var(--color-zinc-500)' },
    ]
  }, [metrics.segments])

  return {
    metrics,
    clients,
    churnRiskClients,
    winbackClients,
    upsellCandidates,
    segmentPieData,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}
