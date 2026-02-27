/**
 * API Route: Revenue Series
 * Returns time-series revenue data for charts
 * Uses withAuth to support both owners and barbers
 */

import { NextResponse } from 'next/server'
import { withAuth, errorResponse } from '@/lib/api/middleware'
import { format, startOfDay, addDays, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { logger } from '@/lib/logger'

export const GET = withAuth(async (request, context, { business, supabase }) => {
  try {
    // Get period from query params (default: month)
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // week, month, year

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let groupBy: 'day' | 'week' | 'month'

    switch (period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        groupBy = 'day'
        break
      case 'year':
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        groupBy = 'month'
        break
      case 'month':
      default:
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        groupBy = 'day'
        break
    }

    // Try RPC first (migration 047 — DB-side timezone-aware grouping)
    const { data: rpcResult, error: rpcError } = await (supabase as any).rpc('get_revenue_series', {
      p_business_id: business.id,
      p_start_date: startDate.toISOString(),
      p_group_by: groupBy,
    })

    if (!rpcError && rpcResult) {
      // RPC returns pre-aggregated rows — fill empty date buckets in JS
      const rpcMap = new Map<string, { revenue: number; appointments: number }>()
      for (const row of rpcResult as any[]) {
        rpcMap.set(row.date_key, {
          revenue: Number(row.revenue ?? 0),
          appointments: Number(row.appointments ?? 0),
        })
      }
      const series = fillDateBuckets(rpcMap, groupBy, startDate, now)
      return NextResponse.json({ period, groupBy, series })
    }

    // Fallback: original JS aggregation (safe for pre-migration deploy)
    if (rpcError) {
      logger.warn(
        { code: rpcError.code, message: rpcError.message },
        'analytics/revenue-series RPC fallback'
      )
    }

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('price, scheduled_at')
      .eq('business_id', business.id)
      .eq('status', 'completed')
      .gte('scheduled_at', startDate.toISOString())
      .order('scheduled_at', { ascending: true })

    if (appointmentsError) {
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    const series = groupByPeriod(appointments || [], groupBy, startDate, now)

    return NextResponse.json({ period, groupBy, series })
  } catch (error) {
    logger.error({ err: error }, 'Error in GET /api/analytics/revenue-series')
    return errorResponse('Error interno del servidor')
  }
})

/**
 * Fill empty date buckets from pre-aggregated RPC data.
 * Ensures chart shows 0-revenue days/months without gaps.
 */
function fillDateBuckets(
  rpcMap: Map<string, { revenue: number; appointments: number }>,
  groupBy: 'day' | 'week' | 'month',
  startDate: Date,
  endDate: Date
): Array<{ date: string; revenue: number; appointments: number }> {
  const dataMap = new Map<string, { revenue: number; appointments: number }>()

  // Initialize all periods with 0
  let current = startOfDay(startDate)
  const end = startOfDay(endDate)

  while (current <= end) {
    let key: string
    if (groupBy === 'day') {
      key = format(current, 'yyyy-MM-dd')
    } else if (groupBy === 'month') {
      key = format(current, 'yyyy-MM')
    } else {
      key = format(current, 'yyyy-ww')
    }
    if (!dataMap.has(key)) {
      dataMap.set(key, rpcMap.get(key) || { revenue: 0, appointments: 0 })
    }
    current =
      groupBy === 'day'
        ? addDays(current, 1)
        : groupBy === 'month'
          ? addMonths(current, 1)
          : addDays(current, 7)
  }

  return Array.from(dataMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({
      date: formatDateLabel(key, groupBy),
      revenue: data.revenue,
      appointments: data.appointments,
    }))
}

/**
 * Group appointments by time period (fallback — raw appointment rows)
 */
function groupByPeriod(
  appointments: Array<{ scheduled_at: string; price: number | null }>,
  groupBy: 'day' | 'week' | 'month',
  startDate: Date,
  endDate: Date
): Array<{ date: string; revenue: number; appointments: number }> {
  // Create map to hold aggregated data
  const dataMap = new Map<string, { revenue: number; appointments: number }>()

  // Initialize all periods with 0
  let current = startOfDay(startDate)
  const end = startOfDay(endDate)

  while (current <= end) {
    let key: string

    if (groupBy === 'day') {
      key = format(current, 'yyyy-MM-dd')
    } else if (groupBy === 'month') {
      key = format(current, 'yyyy-MM')
    } else {
      // week - use ISO week format
      key = format(current, 'yyyy-ww')
    }

    if (!dataMap.has(key)) {
      dataMap.set(key, { revenue: 0, appointments: 0 })
    }

    current =
      groupBy === 'day'
        ? addDays(current, 1)
        : groupBy === 'month'
          ? addMonths(current, 1)
          : addDays(current, 7)
  }

  // Aggregate appointments
  for (const apt of appointments) {
    const date = new Date(apt.scheduled_at)
    let key: string

    if (groupBy === 'day') {
      key = format(date, 'yyyy-MM-dd')
    } else if (groupBy === 'month') {
      key = format(date, 'yyyy-MM')
    } else {
      key = format(date, 'yyyy-ww')
    }

    const existing = dataMap.get(key) || { revenue: 0, appointments: 0 }
    dataMap.set(key, {
      revenue: existing.revenue + (apt.price ?? 0),
      appointments: existing.appointments + 1,
    })
  }

  // Convert map to array and format dates
  return Array.from(dataMap.entries())
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, data]) => ({
      date: formatDateLabel(key, groupBy),
      revenue: data.revenue,
      appointments: data.appointments,
    }))
}

/**
 * Format date label for display
 */
function formatDateLabel(key: string, groupBy: 'day' | 'week' | 'month'): string {
  if (groupBy === 'day') {
    // Format: "15 Ene"
    return format(new Date(key), 'd MMM', { locale: es })
  } else if (groupBy === 'month') {
    // Format: "Ene 2026"
    return format(new Date(key + '-01'), 'MMM yyyy', { locale: es })
  } else {
    // Format: "Semana 3"
    const [, week] = key.split('-')
    return `Sem ${week}`
  }
}
