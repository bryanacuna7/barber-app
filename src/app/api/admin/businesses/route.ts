// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify admin
    const adminUser = await verifyAdmin(supabase)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // all, active, inactive
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Use service client for full access
    const serviceClient = await createServiceClient()

    // Build query
    let query = serviceClient.from('businesses').select(
      `
        id,
        name,
        slug,
        phone,
        address,
        is_active,
        created_at,
        brand_primary_color
      `,
      { count: 'exact' }
    )

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    // Apply status filter
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Apply pagination and order
    const {
      data: businesses,
      count,
      error,
    } = await query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

    if (error) throw error

    // PERFORMANCE OPTIMIZATION: Batch queries to avoid N+1 problem
    // Instead of N queries per business (3N queries), do 3 queries total
    const businessIds = (businesses || []).map((b) => b.id)

    // Batch query all stats in parallel
    const [barberStats, serviceStats, appointmentStats] = await Promise.all([
      // Get all barbers for these businesses
      serviceClient.from('barbers').select('business_id').in('business_id', businessIds),

      // Get all services for these businesses
      serviceClient.from('services').select('business_id').in('business_id', businessIds),

      // Get all appointments for these businesses
      serviceClient.from('appointments').select('business_id').in('business_id', businessIds),
    ])

    // Group stats by business_id in memory (O(n) complexity)
    const barberCounts = new Map<string, number>()
    const serviceCounts = new Map<string, number>()
    const appointmentCounts = new Map<string, number>()

    barberStats.data?.forEach((barber) => {
      const count = barberCounts.get(barber.business_id) || 0
      barberCounts.set(barber.business_id, count + 1)
    })

    serviceStats.data?.forEach((service) => {
      const count = serviceCounts.get(service.business_id) || 0
      serviceCounts.set(service.business_id, count + 1)
    })

    appointmentStats.data?.forEach((appointment) => {
      const count = appointmentCounts.get(appointment.business_id) || 0
      appointmentCounts.set(appointment.business_id, count + 1)
    })

    // Attach stats to businesses (O(n) complexity)
    const businessesWithStats = (businesses || []).map((business) => ({
      ...business,
      stats: {
        barbers: barberCounts.get(business.id) || 0,
        services: serviceCounts.get(business.id) || 0,
        appointments: appointmentCounts.get(business.id) || 0,
      },
    }))

    return NextResponse.json({
      businesses: businessesWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Admin businesses error:', error)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
}
