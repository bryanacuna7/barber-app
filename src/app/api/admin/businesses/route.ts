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
    let query = serviceClient
      .from('businesses')
      .select(`
        id,
        name,
        slug,
        phone,
        address,
        is_active,
        created_at,
        brand_primary_color
      `, { count: 'exact' })

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
    const { data: businesses, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get stats for each business
    const businessesWithStats = await Promise.all(
      (businesses || []).map(async (business) => {
        // Get barber count
        const { count: barberCount } = await serviceClient
          .from('barbers')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', business.id)

        // Get service count
        const { count: serviceCount } = await serviceClient
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', business.id)

        // Get appointment count (all time)
        const { count: appointmentCount } = await serviceClient
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', business.id)

        return {
          ...business,
          stats: {
            barbers: barberCount || 0,
            services: serviceCount || 0,
            appointments: appointmentCount || 0,
          },
        }
      })
    )

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
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}
