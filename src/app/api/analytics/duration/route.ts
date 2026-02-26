/**
 * API Route: Analytics Duration
 * Returns smart duration insights for completed appointments
 * Uses withAuth to support both owners and barbers
 */

import { NextResponse } from 'next/server'
import { withAuth, errorResponse } from '@/lib/api/middleware'

type ServiceDurationStats = {
  serviceId: string
  serviceName: string
  completedCount: number
  avgScheduled: number
  avgActual: number
  recoveredMinutes: number
}

export const GET = withAuth(async (request, context, { business, supabase }) => {
  try {
    // Fetch extra business fields not included in withAuth
    // Note: smart_duration_enabled added in migration 033, using `as any` until types regenerated
    const { data: businessExtra } = (await supabase
      .from('businesses')
      .select('smart_duration_enabled')
      .eq('id', business.id)
      .single()) as any

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

    // Get completed appointments with duration data
    // Note: actual_duration_minutes added in migration 025, using `as any` until types regenerated
    const { data: appointments, error: appointmentsError } = (await supabase
      .from('appointments')
      .select('id, service_id, duration_minutes, actual_duration_minutes, services(id, name)')
      .eq('business_id', business.id)
      .eq('status', 'completed')
      .not('actual_duration_minutes', 'is', null)
      .gte('scheduled_at', startDate.toISOString())) as any

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        period,
        smartDurationEnabled: businessExtra?.smart_duration_enabled || false,
        overall: {
          completedWithDuration: 0,
          avgScheduledMinutes: 0,
          avgActualMinutes: 0,
          totalRecoveredMinutes: 0,
          avgRecoveredPerAppointment: 0,
        },
        services: [],
      })
    }

    // Group by service and calculate stats
    const serviceMap = new Map<
      string,
      {
        serviceId: string
        serviceName: string
        scheduledSum: number
        actualSum: number
        recoveredSum: number
        count: number
      }
    >()

    let totalScheduled = 0
    let totalActual = 0
    let totalRecovered = 0

    for (const apt of appointments) {
      const serviceId = apt.service_id
      const serviceName = apt.services?.name || 'Unknown Service'
      const scheduled = apt.duration_minutes
      const actual = apt.actual_duration_minutes!

      // Track overall
      totalScheduled += scheduled
      totalActual += actual

      // Calculate recovered time (positive = time saved)
      const recovered = scheduled > actual ? scheduled - actual : 0
      totalRecovered += recovered

      // Track by service
      if (!serviceMap.has(serviceId)) {
        serviceMap.set(serviceId, {
          serviceId,
          serviceName,
          scheduledSum: 0,
          actualSum: 0,
          recoveredSum: 0,
          count: 0,
        })
      }

      const stats = serviceMap.get(serviceId)!
      stats.scheduledSum += scheduled
      stats.actualSum += actual
      stats.recoveredSum += recovered
      stats.count += 1
    }

    // Calculate overall averages
    const completedWithDuration = appointments.length
    const avgScheduledMinutes = Math.round(totalScheduled / completedWithDuration)
    const avgActualMinutes = Math.round((totalActual / completedWithDuration) * 10) / 10
    const avgRecoveredPerAppointment =
      Math.round((totalRecovered / completedWithDuration) * 10) / 10

    // Build service stats array
    const services: ServiceDurationStats[] = Array.from(serviceMap.values()).map((stats) => ({
      serviceId: stats.serviceId,
      serviceName: stats.serviceName,
      completedCount: stats.count,
      avgScheduled: Math.round(stats.scheduledSum / stats.count),
      avgActual: Math.round((stats.actualSum / stats.count) * 10) / 10,
      recoveredMinutes: stats.recoveredSum,
    }))

    // Sort by completed count descending
    services.sort((a, b) => b.completedCount - a.completedCount)

    return NextResponse.json({
      period,
      smartDurationEnabled: businessExtra?.smart_duration_enabled || false,
      overall: {
        completedWithDuration,
        avgScheduledMinutes,
        avgActualMinutes,
        totalRecoveredMinutes: totalRecovered,
        avgRecoveredPerAppointment,
      },
      services,
    })
  } catch (error) {
    console.error('Error in GET /api/analytics/duration:', error)
    return errorResponse('Error interno del servidor')
  }
})
