import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
      .select('id, name, slug')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

    // Fetch stats in parallel
    const [
      { count: todayAppointments },
      { data: todayRevenue },
      { count: monthAppointments },
      { data: monthRevenue },
      { count: totalClients },
    ] = await Promise.all([
      // Today's appointments count
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .gte('scheduled_at', startOfDay)
        .lte('scheduled_at', endOfDay)
        .in('status', ['pending', 'confirmed', 'completed']),

      // Today's revenue
      supabase
        .from('appointments')
        .select('price')
        .eq('business_id', business.id)
        .gte('scheduled_at', startOfDay)
        .lte('scheduled_at', endOfDay)
        .eq('status', 'completed'),

      // Month's appointments
      supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .gte('scheduled_at', startOfMonth)
        .in('status', ['pending', 'confirmed', 'completed']),

      // Month's revenue
      supabase
        .from('appointments')
        .select('price')
        .eq('business_id', business.id)
        .gte('scheduled_at', startOfMonth)
        .eq('status', 'completed'),

      // Total clients
      supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id),
    ])

    const todayRevenueTotal = todayRevenue?.reduce((sum, apt) => sum + Number(apt.price), 0) || 0
    const monthRevenueTotal = monthRevenue?.reduce((sum, apt) => sum + Number(apt.price), 0) || 0

    return NextResponse.json({
      todayAppointments: todayAppointments || 0,
      todayRevenue: todayRevenueTotal,
      monthAppointments: monthAppointments || 0,
      monthRevenue: monthRevenueTotal,
      totalClients: totalClients || 0,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
