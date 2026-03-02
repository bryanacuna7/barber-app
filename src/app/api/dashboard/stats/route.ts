import { withAuth, errorResponse } from '@/lib/api/middleware'
import { NextResponse } from 'next/server'
import { normalizeDisplayBusinessName } from '@/lib/branding'
import { logger } from '@/lib/logger'

type AppointmentOverviewRange = {
  total?: number
  total_revenue?: number
}

type RpcError = { code?: string; message?: string } | null

type DashboardStatsRpcClient = {
  rpc: (
    fn: string,
    args?: Record<string, unknown>
  ) => Promise<{ data: AppointmentOverviewRange | null; error: RpcError }>
}

async function getOverviewForRange(
  supabase: unknown,
  businessId: string,
  startDate: string,
  endDate: string
) {
  const rpcClient = supabase as DashboardStatsRpcClient
  const { data, error } = await rpcClient.rpc('get_appointment_overview_range', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error || !data) {
    return null
  }

  const overview = data as AppointmentOverviewRange
  return {
    total: Number(overview.total ?? 0),
    totalRevenue: Number(overview.total_revenue ?? 0),
  }
}

export const GET = withAuth(async (request, context, { business, supabase }) => {
  try {
    const now = new Date()
    const startOfDayDate = new Date(now)
    startOfDayDate.setHours(0, 0, 0, 0)
    const endOfDayDate = new Date(now)
    endOfDayDate.setHours(23, 59, 59, 999)

    const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const startOfDay = startOfDayDate.toISOString()
    const endOfDay = endOfDayDate.toISOString()
    const startOfMonth = startOfMonthDate.toISOString()
    const endOfMonth = endOfMonthDate.toISOString()

    // Try DB-side aggregation first (zero row egress)
    const [todayOverview, monthOverview, totalClientsResult] = await Promise.all([
      getOverviewForRange(supabase, business.id, startOfDay, endOfDay),
      getOverviewForRange(supabase, business.id, startOfMonth, endOfMonth),
      supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id),
    ])

    let todayAppointments = todayOverview?.total ?? 0
    let todayRevenueTotal = todayOverview?.totalRevenue ?? 0
    let monthAppointments = monthOverview?.total ?? 0
    let monthRevenueTotal = monthOverview?.totalRevenue ?? 0

    // Fallback for pre-migration deploys (or temporary RPC failures)
    if (!todayOverview || !monthOverview) {
      logger.warn('dashboard/stats RPC fallback active')

      const [{ count: todayCount }, { count: monthCount }, { data: completedRevenueRows }] =
        await Promise.all([
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', business.id)
            .gte('scheduled_at', startOfDay)
            .lte('scheduled_at', endOfDay)
            .in('status', ['pending', 'confirmed', 'completed']),
          supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', business.id)
            .gte('scheduled_at', startOfMonth)
            .lte('scheduled_at', endOfMonth)
            .in('status', ['pending', 'confirmed', 'completed']),
          supabase
            .from('appointments')
            .select('scheduled_at, price')
            .eq('business_id', business.id)
            .gte('scheduled_at', startOfMonth)
            .lte('scheduled_at', endOfMonth)
            .eq('status', 'completed'),
        ])

      monthAppointments = monthCount ?? 0
      todayAppointments = todayCount ?? 0
      monthRevenueTotal = 0
      todayRevenueTotal = 0

      for (const appointment of completedRevenueRows ?? []) {
        const price = Number(appointment.price) || 0
        monthRevenueTotal += price
        if (appointment.scheduled_at >= startOfDay && appointment.scheduled_at <= endOfDay) {
          todayRevenueTotal += price
        }
      }
    }

    const totalClients = totalClientsResult.count ?? 0
    const displayName = normalizeDisplayBusinessName(business.name)
    const shareName = business.name?.trim() || displayName

    return NextResponse.json({
      todayAppointments,
      todayRevenue: todayRevenueTotal,
      monthAppointments,
      monthRevenue: monthRevenueTotal,
      totalClients,
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
