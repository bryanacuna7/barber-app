import { NextResponse } from 'next/server'
import { withAuth, notFoundResponse, errorResponse } from '@/lib/api/middleware'

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
 * - Validates that the barber belongs to the authenticated user's business
 * - Returns appointments ordered by scheduled_at ascending
 * - Includes client info, service details, and status
 */
export const GET = withAuth<RouteParams>(async (request, { params }, { business, supabase }) => {
  try {
    const { id: barberId } = await params

    // 1. Verify barber exists and belongs to this business
    const { data: barber, error: barberError } = await supabase
      .from('barbers')
      .select('id, name, business_id')
      .eq('id', barberId)
      .eq('business_id', business.id)
      .single()

    if (barberError || !barber) {
      return notFoundResponse('Barbero no encontrado')
    }

    // 2. Get today's date range in business timezone (or UTC if not set)
    // Note: We use UTC for server-side date calculations
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setUTCHours(23, 59, 59, 999)

    // 3. Fetch today's appointments for this barber
    const { data: appointments, error: appointmentsError } = await supabase
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
        client:clients(id, name, phone, email),
        service:services(id, name, duration_minutes, price)
      `
      )
      .eq('barber_id', barberId)
      .eq('business_id', business.id)
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
      .order('scheduled_at', { ascending: true })

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return errorResponse('Error al obtener las citas')
    }

    // 4. Calculate stats
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

    // 5. Build response
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
    console.error('Unexpected error in GET /api/barbers/[id]/appointments/today:', error)
    return errorResponse('Error interno del servidor')
  }
})
