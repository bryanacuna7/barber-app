/**
 * API Route: Analytics Overview
 * Returns KPI summary for the current business
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    switch (period) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'year':
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'month':
      default:
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 30)
        break
    }

    // Get appointments in period
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, status, price, scheduled_at')
      .eq('business_id', business.id)
      .gte('scheduled_at', startDate.toISOString())

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    // Calculate metrics
    const totalAppointments = appointments?.length || 0
    const completedAppointments = appointments?.filter((a) => a.status === 'completed').length || 0
    const totalRevenue =
      appointments?.filter((a) => a.status === 'completed').reduce((sum, a) => sum + a.price, 0) ||
      0

    // Calculate average per appointment
    const avgPerAppointment = completedAppointments > 0 ? totalRevenue / completedAppointments : 0

    // Calculate completion rate
    const completionRate =
      totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0

    return NextResponse.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      metrics: {
        totalAppointments,
        completedAppointments,
        totalRevenue,
        avgPerAppointment: Math.round(avgPerAppointment),
        completionRate: Math.round(completionRate),
      },
    })
  } catch (error) {
    console.error('Error in GET /api/analytics/overview:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
