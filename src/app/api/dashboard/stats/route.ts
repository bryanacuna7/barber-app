import { withAuth, errorResponse } from '@/lib/api/middleware'
import { NextResponse } from 'next/server'
import { normalizeDisplayBusinessName } from '@/lib/branding'
import { logger } from '@/lib/logger'

export const GET = withAuth(async (request, context, { business, supabase }) => {
  try {
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

    const todayRevenueTotal =
      todayRevenue?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0
    const monthRevenueTotal =
      monthRevenue?.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0) || 0
    const displayName = normalizeDisplayBusinessName(business.name)
    const shareName = business.name?.trim() || displayName

    return NextResponse.json({
      todayAppointments: todayAppointments || 0,
      todayRevenue: todayRevenueTotal,
      monthAppointments: monthAppointments || 0,
      monthRevenue: monthRevenueTotal,
      totalClients: totalClients || 0,
      business: {
        id: business.id,
        name: displayName,
        shareName,
        slug: business.slug,
      },
    })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching dashboard stats')
    return errorResponse('Error interno del servidor')
  }
})
