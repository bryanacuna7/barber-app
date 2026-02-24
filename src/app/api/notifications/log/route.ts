/**
 * GET /api/notifications/log
 *
 * Returns notification_log entries for the authenticated business owner.
 * Supports filtering by appointment_id or date range.
 *
 * Query params:
 *   appointment_id — filter by specific appointment
 *   from           — ISO datetime, start of range (inclusive)
 *   to             — ISO datetime, end of range (inclusive)
 *   limit          — max entries (default 50, max 200)
 *   offset         — pagination offset (default 0)
 */

import { NextResponse } from 'next/server'
import { withAuthAndRateLimit, errorResponse } from '@/lib/api/middleware'

export const GET = withAuthAndRateLimit(
  async (request, _params, { business, supabase }) => {
    try {
      const url = new URL(request.url)
      const appointmentId = url.searchParams.get('appointment_id')
      const from = url.searchParams.get('from')
      const to = url.searchParams.get('to')
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200)
      const offset = parseInt(url.searchParams.get('offset') || '0', 10)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('notification_log')
        .select('*', { count: 'exact' })
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (appointmentId) {
        query = query.eq('appointment_id', appointmentId)
      }

      if (from) {
        query = query.gte('created_at', from)
      }

      if (to) {
        query = query.lte('created_at', to)
      }

      const { data, count, error } = await query

      if (error) {
        console.error('Error fetching notification log:', error)
        return errorResponse('Error al obtener registro de notificaciones')
      }

      return NextResponse.json({
        data: data || [],
        total: count || 0,
        limit,
        offset,
      })
    } catch (error) {
      console.error('Notification log API error:', error)
      return errorResponse('Error interno')
    }
  },
  { interval: 60_000, maxRequests: 30 }
)
