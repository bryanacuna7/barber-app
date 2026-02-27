import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'
import { logger } from '@/lib/logger'
import type { Business } from '@/types/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verify admin
    const adminUser = await verifyAdmin(supabase)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = await createServiceClient()

    // Get business details
    const { data: businessData, error } = await serviceClient
      .from('businesses')
      .select(
        'id, name, slug, owner_id, phone, whatsapp, address, timezone, operating_hours, booking_buffer_minutes, advance_booking_days, brand_primary_color, brand_secondary_color, is_active, created_at, updated_at'
      )
      .eq('id', id)
      .single()

    if (error || !businessData) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = businessData as Business

    // Get owner email from auth.users
    const { data: ownerData } = await serviceClient.auth.admin.getUserById(business.owner_id)

    // Get barbers
    const { data: barbers } = await serviceClient
      .from('barbers')
      .select('id, name, email, is_active')
      .eq('business_id', id)
      .order('display_order')

    // Get services
    const { data: services } = await serviceClient
      .from('services')
      .select('id, name, price, is_active')
      .eq('business_id', id)
      .order('display_order')

    // Get appointment stats
    const { count: totalAppointments } = await serviceClient
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id)

    const { count: completedAppointments } = await serviceClient
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id)
      .eq('status', 'completed')

    // Get clients count
    const { count: totalClients } = await serviceClient
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', id)

    return NextResponse.json({
      business: {
        ...business,
        owner_email: ownerData?.user?.email || 'Unknown',
      },
      barbers: barbers || [],
      services: services || [],
      stats: {
        totalAppointments: totalAppointments || 0,
        completedAppointments: completedAppointments || 0,
        totalClients: totalClients || 0,
        totalBarbers: barbers?.length || 0,
        totalServices: services?.length || 0,
      },
    })
  } catch (error) {
    logger.error({ err: error }, 'Admin business detail error')
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verify admin
    const adminUser = await verifyAdmin(supabase)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { is_active } = body

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'is_active must be a boolean' }, { status: 400 })
    }

    const serviceClient = await createServiceClient()

    const { data: business, error } = await serviceClient
      .from('businesses')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: is_active ? 'Business activated' : 'Business deactivated',
      business,
    })
  } catch (error) {
    logger.error({ err: error }, 'Admin business update error')
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verify admin
    const adminUser = await verifyAdmin(supabase)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Safe JSON parse
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { confirmName } = body
    if (typeof confirmName !== 'string' || confirmName.length === 0) {
      return NextResponse.json({ error: 'confirmName is required' }, { status: 400 })
    }

    const serviceClient = await createServiceClient()

    // Fetch business — 404 if not found
    const { data: business, error: fetchError } = await serviceClient
      .from('businesses')
      .select('id, name, is_active')
      .eq('id', id)
      .single()

    if (fetchError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Must be deactivated first
    if (business.is_active) {
      return NextResponse.json(
        { error: 'Business must be deactivated before deletion' },
        { status: 400 }
      )
    }

    // Confirm name must match exactly
    if (confirmName !== business.name) {
      return NextResponse.json({ error: 'Business name does not match' }, { status: 400 })
    }

    // Delete — ON DELETE CASCADE handles all child tables
    const { error: deleteError } = await serviceClient.from('businesses').delete().eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ message: 'Business deleted permanently' })
  } catch (error) {
    logger.error({ err: error }, 'Admin business delete error')
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
  }
}
