import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

    // Upcoming appointments today
    const { data: upcomingAppointments, error } = await supabase
      .from('appointments')
      .select(
        `
        id,
        scheduled_at,
        status,
        client:clients(name, phone),
        service:services(name)
      `
      )
      .eq('business_id', business.id)
      .gte('scheduled_at', new Date().toISOString())
      .lte('scheduled_at', endOfDay)
      .in('status', ['pending', 'confirmed'])
      .order('scheduled_at', { ascending: true })
      .limit(5)

    if (error) {
      logger.error({ err: error }, 'Error fetching appointments')
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    return NextResponse.json({ appointments: upcomingAppointments || [] })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching dashboard appointments')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
