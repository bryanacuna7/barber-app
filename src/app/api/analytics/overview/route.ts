/**
 * API Route: Analytics Overview
 * Returns KPI summary for the current business
 * Uses withAuth to support both owners and barbers
 */

import { NextResponse } from 'next/server'
import { withAuth, errorResponse } from '@/lib/api/middleware'

export const GET = withAuth(async (request, context, { business, supabase }) => {
  try {
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

    // Try RPC first (migration 045 — DB-side aggregation, zero row egress)
    const { data: rpcResult, error: rpcError } = await (supabase as any).rpc(
      'get_appointment_overview',
      { p_business_id: business.id, p_start_date: startDate.toISOString() }
    )

    if (!rpcError && rpcResult) {
      const total = Number(rpcResult.total ?? 0)
      const completed = Number(rpcResult.completed ?? 0)
      const revenue = Number(rpcResult.total_revenue ?? 0)
      const avg = completed > 0 ? Math.round(revenue / completed) : 0
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0

      return NextResponse.json({
        period,
        dateRange: { start: startDate.toISOString(), end: now.toISOString() },
        metrics: {
          totalAppointments: total,
          completedAppointments: completed,
          totalRevenue: revenue,
          avgPerAppointment: avg,
          completionRate: rate,
        },
      })
    }

    // Fallback: original query (safe for pre-migration deploy)
    if (rpcError) {
      console.warn(
        `[analytics/overview] RPC fallback active: ${rpcError.code} - ${rpcError.message}`
      )
    }

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('status, price')
      .eq('business_id', business.id)
      .gte('scheduled_at', startDate.toISOString())

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    const totalAppointments = appointments?.length || 0
    const completedAppointments = appointments?.filter((a) => a.status === 'completed').length || 0
    const totalRevenue =
      appointments
        ?.filter((a) => a.status === 'completed')
        .reduce((sum, a) => sum + (a.price ?? 0), 0) ?? 0
    const avgPerAppointment = completedAppointments > 0 ? totalRevenue / completedAppointments : 0
    const completionRate =
      totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0

    return NextResponse.json({
      period,
      dateRange: { start: startDate.toISOString(), end: now.toISOString() },
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
    return errorResponse('Error interno del servidor')
  }
})
