/**
 * API Route: Revenue Series
 * Returns time-series revenue data for charts
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, startOfDay, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

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

    // Get completed appointments in period
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, price, scheduled_at')
      .eq('business_id', business.id)
      .eq('status', 'completed')
      .gte('scheduled_at', startDate.toISOString())
      .order('scheduled_at', { ascending: true })

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    // Group data by period
    const series = groupByPeriod(appointments || [], groupBy, startDate, now)

    return NextResponse.json({
      period,
      groupBy,
      series,
    })
  } catch (error) {
    console.error('Error in GET /api/analytics/revenue-series:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Group appointments by time period
 */
function groupByPeriod(
  appointments: Array<{ scheduled_at: string; price: number }>,
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

    current = addDays(current, groupBy === 'day' ? 1 : groupBy === 'month' ? 30 : 7)
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
      revenue: existing.revenue + apt.price,
      appointments: existing.appointments + 1,
    })
  }

  // Convert map to array and format dates
  return Array.from(dataMap.entries())
    .map(([key, data]) => ({
      date: formatDateLabel(key, groupBy),
      revenue: data.revenue,
      appointments: data.appointments,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Format date label for display
 */
function formatDateLabel(key: string, groupBy: 'day' | 'week' | 'month'): string {
  if (groupBy === 'day') {
    // Format: "15 Ene"
    return format(new Date(key), "d MMM", { locale: es })
  } else if (groupBy === 'month') {
    // Format: "Ene 2026"
    return format(new Date(key + '-01'), "MMM yyyy", { locale: es })
  } else {
    // Format: "Semana 3"
    const [year, week] = key.split('-')
    return `Sem ${week}`
  }
}
