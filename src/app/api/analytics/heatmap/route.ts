/**
 * API Route: Demand Heatmap
 * Returns appointment density by day-of-week and hour for the last 90 days.
 * Used by the Configuracion > Promociones page to visualize slow hours.
 *
 * Statuses counted: confirmed, completed, no_show (real demand).
 * Excludes: pending, cancelled.
 * Uses withAuth to support both owners and barbers
 */

import { NextResponse } from 'next/server'
import { withAuth, errorResponse } from '@/lib/api/middleware'

export interface HeatmapCell {
  day: number // 0=Sun...6=Sat
  hour: number // 0-23
  count: number
}

export interface HeatmapResponse {
  cells: HeatmapCell[]
  maxCount: number
  totalAppointments: number
  operatingHours: Record<string, { open: string; close: string; enabled: boolean }> | null
}

export const GET = withAuth(async (request, context, { business, supabase }) => {
  try {
    // timezone and operating_hours are now included in withAuth context
    const timezone = (business as any).timezone || 'America/Costa_Rica'

    // Last 90 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)

    // Try RPC first (migration 047 — DB-side timezone-aware aggregation)
    const { data: rpcResult, error: rpcError } = await (supabase as any).rpc('get_demand_heatmap', {
      p_business_id: business.id,
      p_start_date: startDate.toISOString(),
      p_timezone: timezone,
    })

    if (!rpcError && rpcResult) {
      const cells = ((rpcResult.cells as any[]) || []).map((c: any) => ({
        day: Number(c.day),
        hour: Number(c.hour),
        count: Number(c.count),
      }))
      return NextResponse.json({
        cells,
        maxCount: Number(rpcResult.maxCount ?? 0),
        totalAppointments: Number(rpcResult.totalAppointments ?? 0),
        operatingHours: (business as any).operating_hours ?? null,
      })
    }

    // Fallback: original JS aggregation (safe for pre-migration deploy)
    if (rpcError) {
      console.warn(`[analytics/heatmap] RPC fallback: ${rpcError.code} - ${rpcError.message}`)
    }

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('scheduled_at')
      .eq('business_id', business.id)
      .in('status', ['confirmed', 'completed', 'no_show'])
      .gte('scheduled_at', startDate.toISOString())

    if (appointmentsError) {
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    const cellMap = new Map<string, number>()
    let maxCount = 0

    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
    })
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      timeZone: timezone,
    })
    const dayLookup: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    }

    for (const apt of appointments || []) {
      const date = new Date(apt.scheduled_at)
      const hour = parseInt(hourFormatter.format(date), 10) % 24
      const day = dayLookup[dayFormatter.format(date)] ?? 0
      const key = `${day}-${hour}`
      const count = (cellMap.get(key) || 0) + 1
      cellMap.set(key, count)
      if (count > maxCount) maxCount = count
    }

    const cells: HeatmapCell[] = []
    for (const [key, count] of cellMap) {
      const [day, hour] = key.split('-').map(Number)
      cells.push({ day, hour, count })
    }

    return NextResponse.json({
      cells,
      maxCount,
      totalAppointments: appointments?.length || 0,
      operatingHours: (business as any).operating_hours ?? null,
    })
  } catch {
    return errorResponse('Error interno del servidor')
  }
})
