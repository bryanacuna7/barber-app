/**
 * API Route: Service Performance Analytics
 * Returns top performing services by revenue and bookings
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
      .select('service_id, price, status')
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
        existing.revenue += apt.price
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
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
