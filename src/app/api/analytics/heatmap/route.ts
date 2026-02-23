/**
 * API Route: Demand Heatmap
 * Returns appointment density by day-of-week and hour for the last 90 days.
 * Used by the Configuracion > Promociones page to visualize slow hours.
 *
 * Statuses counted: confirmed, completed, no_show (real demand).
 * Excludes: pending, cancelled.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business, error: businessError } = (await supabase
      .from('businesses')
      .select('id, timezone, operating_hours')
      .eq('owner_id', user.id)
      .single()) as any

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const timezone = business.timezone || 'America/Costa_Rica'

    // Last 90 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 90)

    // Query appointments grouped by day-of-week and hour in business timezone
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('scheduled_at, status')
      .eq('business_id', business.id)
      .in('status', ['confirmed', 'completed', 'no_show'])
      .gte('scheduled_at', startDate.toISOString())

    if (appointmentsError) {
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    // Group by day+hour in business timezone (client-side aggregation to avoid raw SQL)
    const cellMap = new Map<string, number>()
    let maxCount = 0

    for (const apt of appointments || []) {
      const date = new Date(apt.scheduled_at)
      // Use Intl.DateTimeFormat for timezone-aware extraction (sufficient for aggregation)
      const hourFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone,
      })
      const dayFormatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        timeZone: timezone,
      })

      const hour = parseInt(hourFormatter.format(date), 10) % 24
      const dayStr = dayFormatter.format(date)
      const dayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      }
      const day = dayMap[dayStr] ?? 0

      const key = `${day}-${hour}`
      const count = (cellMap.get(key) || 0) + 1
      cellMap.set(key, count)
      if (count > maxCount) maxCount = count
    }

    // Convert map to array
    const cells: HeatmapCell[] = []
    for (const [key, count] of cellMap) {
      const [day, hour] = key.split('-').map(Number)
      cells.push({ day, hour, count })
    }

    return NextResponse.json({
      cells,
      maxCount,
      totalAppointments: appointments?.length || 0,
      operatingHours: business.operating_hours,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
