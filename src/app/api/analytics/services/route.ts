/**
 * API Route: Service Performance Analytics
 * Returns top performing services by revenue and bookings
 * Uses withAuth to support both owners and barbers
 */

import { NextResponse } from 'next/server'
import { withAuth, errorResponse } from '@/lib/api/middleware'

export const GET = withAuth(async (request, context, { business, supabase }) => {
  try {
    // Get period from query params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

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

    // Get all services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, price')
      .eq('business_id', business.id)
      .eq('is_active', true)

    if (servicesError) {
      console.error('Error fetching services:', servicesError)
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    // Get appointments for services in period
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('service_id, price')
      .eq('business_id', business.id)
      .eq('status', 'completed')
      .gte('scheduled_at', startDate.toISOString())
      .not('service_id', 'is', null)

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    // Aggregate by service
    const serviceStats = new Map<string, { name: string; bookings: number; revenue: number }>()

    for (const service of services || []) {
      serviceStats.set(service.id, {
        name: service.name,
        bookings: 0,
        revenue: 0,
      })
    }

    for (const apt of appointments || []) {
      const existing = serviceStats.get(apt.service_id)
      if (existing) {
        existing.bookings++
        existing.revenue += apt.price ?? 0
      }
    }

    // Convert to array and sort by revenue
    const results = Array.from(serviceStats.entries())
      .map(([id, stats]) => ({
        id,
        ...stats,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 services

    return NextResponse.json({
      period,
      services: results,
    })
  } catch (error) {
    console.error('Error in GET /api/analytics/services:', error)
    return errorResponse('Error interno del servidor')
  }
})
