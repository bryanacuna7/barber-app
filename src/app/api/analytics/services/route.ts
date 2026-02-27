/**
 * API Route: Service Performance Analytics
 * Returns top performing services by revenue and bookings
 * Uses withAuth to support both owners and barbers
 */

import { NextResponse } from 'next/server'
import { withAuth, errorResponse } from '@/lib/api/middleware'
import { logger } from '@/lib/logger'

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

    // Try RPC first (migration 047 — DB-side LEFT JOIN aggregation, zero row egress)
    const { data: rpcResult, error: rpcError } = await (supabase as any).rpc(
      'get_service_analytics',
      { p_business_id: business.id, p_start_date: startDate.toISOString() }
    )

    if (!rpcError && rpcResult) {
      return NextResponse.json({
        period,
        services: (rpcResult as any[]).map((s: any) => ({
          id: s.id,
          name: s.name,
          bookings: Number(s.bookings ?? 0),
          revenue: Number(s.revenue ?? 0),
        })),
      })
    }

    // Fallback: original JS aggregation (safe for pre-migration deploy)
    if (rpcError) {
      logger.warn(
        { code: rpcError.code, message: rpcError.message },
        'analytics/services RPC fallback'
      )
    }

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, name, price')
      .eq('business_id', business.id)
      .eq('is_active', true)

    if (servicesError) {
      return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
    }

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('service_id, price')
      .eq('business_id', business.id)
      .eq('status', 'completed')
      .gte('scheduled_at', startDate.toISOString())
      .not('service_id', 'is', null)

    if (appointmentsError) {
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }

    const serviceStats = new Map<string, { name: string; bookings: number; revenue: number }>()
    for (const service of services || []) {
      serviceStats.set(service.id, { name: service.name, bookings: 0, revenue: 0 })
    }
    for (const apt of appointments || []) {
      const existing = serviceStats.get(apt.service_id)
      if (existing) {
        existing.bookings++
        existing.revenue += apt.price ?? 0
      }
    }

    const results = Array.from(serviceStats.entries())
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return NextResponse.json({ period, services: results })
  } catch (error) {
    logger.error({ err: error }, 'Error in GET /api/analytics/services')
    return errorResponse('Error interno del servidor')
  }
})
