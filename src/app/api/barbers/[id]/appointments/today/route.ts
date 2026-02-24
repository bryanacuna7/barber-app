import { NextResponse } from 'next/server'
import {
  withAuth,
  notFoundResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/middleware'
import { canAccessBarberAppointments } from '@/lib/rbac'
import { logger, logSecurity } from '@/lib/logger'

/**
 * Response types for Mi Dia staff view
 */
export interface TodayAppointmentClient {
  id: string
  name: string
  phone: string | null
  email: string | null
}

export interface TodayAppointmentService {
  id: string
  name: string
  duration_minutes: number
  price: number
}

export interface TodayAppointment {
  id: string
  scheduled_at: string
  duration_minutes: number
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  client_notes: string | null
  internal_notes: string | null
  started_at: string | null
  actual_duration_minutes: number | null
  payment_method: 'cash' | 'sinpe' | 'card' | null
  tracking_token: string | null
  advance_payment_status?: 'none' | 'pending' | 'verified' | 'rejected' | null
  proof_channel?: 'whatsapp' | 'upload' | null
  base_price_snapshot?: number | null
  discount_pct_snapshot?: number | null
  final_price_snapshot?: number | null
  client: TodayAppointmentClient | null
  service: TodayAppointmentService | null
}

export interface TodayAppointmentsResponse {
  appointments: TodayAppointment[]
  barber: {
    id: string
    name: string
  }
  date: string
  stats: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    no_show: number
  }
}

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/barbers/[id]/appointments/today
 *
 * Fetch today's appointments for a specific barber.
 * Used by the "Mi Dia" staff view.
 *
 * Security:
 * - Validates that the barber belongs to the authenticated user's business
 * - IDOR Protection: Validates that the authenticated user IS this barber (via email match)
 * - Returns appointments ordered by scheduled_at ascending
 * - Includes client info, service details, and status
 */
export const GET = withAuth<RouteParams>(
  async (request, { params }, { user, business, supabase }) => {
    try {
      const { id: barberId } = await params

      // 1. Verify barber exists and belongs to this business
      const { data: barber, error: barberError } = await supabase
        .from('barbers')
        .select('id, name, email, business_id')
        .eq('id', barberId)
        .eq('business_id', business.id)
        .single()

      if (barberError || !barber) {
        return notFoundResponse('Miembro del equipo no encontrado')
      }

      // 2. IDOR PROTECTION: Verify authenticated user can access this barber's appointments
      // Uses RBAC system to check:
      // - Business owner (can access all)
      // - User has read_all_appointments permission (recepcionista, admin)
      // - User is the barber themselves (read own appointments)
      const canAccess = await canAccessBarberAppointments(
        supabase,
        user.id,
        barberId,
        business.id,
        business.owner_id
      )

      if (!canAccess) {
        logSecurity('unauthorized', 'high', {
          userId: user.id,
          userEmail: user.email,
          requestedBarberId: barberId,
          barberEmail: barber.email,
          businessId: business.id,
          endpoint: '/api/barbers/[id]/appointments/today',
        })
        return unauthorizedResponse('No tienes permiso para ver las citas de este miembro del equipo')
      }

      // 3. Get today's date range in business timezone (or UTC if not set)
      // Note: We use UTC for server-side date calculations
      const now = new Date()
      const startOfDay = new Date(now)
      startOfDay.setUTCHours(0, 0, 0, 0)
      const endOfDay = new Date(now)
      endOfDay.setUTCHours(23, 59, 59, 999)

      // 4. Fetch today's appointments for this barber
      const { data: appointments, error: appointmentsError } = (await supabase
        .from('appointments')
        .select(
          `
        id,
        scheduled_at,
        duration_minutes,
        price,
        status,
        client_notes,
        internal_notes,
        started_at,
        actual_duration_minutes,
        payment_method,
        tracking_token,
        advance_payment_status,
        proof_channel,
        base_price_snapshot,
        discount_pct_snapshot,
        final_price_snapshot,
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `
        )
        .eq('barber_id', barberId)
        .eq('business_id', business.id)
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
        .order('scheduled_at', { ascending: true })) as any

      if (appointmentsError) {
        logger.error(
          {
            err: appointmentsError,
            barberId,
            businessId: business.id,
          },
          'Error fetching appointments'
        )
        return errorResponse('Error al obtener las citas')
      }

      // 5. Calculate stats
      const stats = {
        total: appointments?.length || 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
      }

      if (appointments) {
        for (const apt of appointments) {
          switch (apt.status) {
            case 'pending':
              stats.pending++
              break
            case 'confirmed':
              stats.confirmed++
              break
            case 'completed':
              stats.completed++
              break
            case 'cancelled':
              stats.cancelled++
              break
            case 'no_show':
              stats.no_show++
              break
          }
        }
      }

      // 6. Build response
      const response: TodayAppointmentsResponse = {
        appointments: (appointments || []) as TodayAppointment[],
        barber: {
          id: barber.id,
          name: barber.name,
        },
        date: startOfDay.toISOString().split('T')[0],
        stats,
      }

      return NextResponse.json(response)
    } catch (error) {
      logger.error(
        {
          err: error,
          barberId: await params.then((p) => p.id),
          userId: user.id,
          businessId: business.id,
        },
        'Unexpected error in GET /api/barbers/[id]/appointments/today'
      )
      return errorResponse('Error interno del servidor')
    }
  }
)
