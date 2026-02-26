/**
 * API Route: Barber Performance Analytics
 * Returns barber leaderboard by revenue and appointments
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

    // Get all barbers
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('id, name, photo_url')
      .eq('business_id', business.id)
      .eq('is_active', true)

    if (barbersError) {
      console.error('Error fetching barbers:', barbersError)
      return NextResponse.json({ error: 'Failed to fetch barbers' }, { status: 500 })
    }

    // Get appointments for barbers in period
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('barber_id, price, status, client_id')
      .eq('business_id', business.id)
      .eq('status', 'completed')
      .gte('scheduled_at', startDate.toISOString())
      .not('barber_id', 'is', null)

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    // Aggregate by barber
    const barberStats = new Map<
      string,
      {
        name: string
        photo_url: string | null
        appointments: number
        revenue: number
        uniqueClients: Set<string>
      }
    >()

    for (const barber of barbers || []) {
      barberStats.set(barber.id, {
        name: barber.name,
        photo_url: barber.photo_url,
        appointments: 0,
        revenue: 0,
        uniqueClients: new Set(),
      })
    }

    for (const apt of appointments || []) {
      const existing = barberStats.get(apt.barber_id)
      if (existing) {
        existing.appointments++
        existing.revenue += apt.price ?? 0
        if (apt.client_id) {
          existing.uniqueClients.add(apt.client_id)
        }
      }
    }

    // Convert to array and calculate average per appointment
    const results = Array.from(barberStats.entries())
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        photo_url: stats.photo_url,
        appointments: stats.appointments,
        revenue: stats.revenue,
        uniqueClients: stats.uniqueClients.size,
        avgPerAppointment:
          stats.appointments > 0 ? Math.round(stats.revenue / stats.appointments) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue) // Sort by revenue

    return NextResponse.json({
      period,
      barbers: results,
    })
  } catch (error) {
    console.error('Error in GET /api/analytics/barbers:', error)
    return errorResponse('Error interno del servidor')
  }
})
