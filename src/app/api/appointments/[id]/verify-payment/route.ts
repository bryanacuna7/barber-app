/**
 * POST /api/appointments/[id]/verify-payment
 *
 * Authenticated endpoint — owner or barber only.
 * Verifies or rejects an advance payment proof for an appointment.
 *
 * Security:
 * - Requires authenticated user
 * - User must own the business or be a barber in that business
 * - advance_payment_status must be 'pending' before action
 *
 * Rate Limiting:
 * - 10 requests per minute per user
 */

import { NextResponse } from 'next/server'
import {
  withAuthAndRateLimit,
  notFoundResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/lib/api/middleware'
import { logSecurity } from '@/lib/logger'
import { canModifyBarberAppointments } from '@/lib/rbac'

interface RouteParams {
  params: Promise<{ id: string }>
}

export const POST = withAuthAndRateLimit<RouteParams>(
  async (request, { params }, { user, business, supabase }) => {
    try {
      const { id: appointmentId } = await params

      // 1. Parse body
      let body: { action?: string }
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
      }

      const { action } = body

      if (!action || !['verify', 'reject'].includes(action)) {
        return NextResponse.json(
          { error: 'Acción inválida. Use "verify" o "reject"' },
          { status: 400 }
        )
      }

      // 2. Fetch appointment
      const { data: appointment, error: fetchError } = (await supabase
        .from('appointments')
        .select(
          'id, status, barber_id, business_id, client_id, advance_payment_status, barber:barbers!appointments_barber_id_fkey(id, name)'
        )
        .eq('id', appointmentId)
        .eq('business_id', business.id)
        .single()) as any

      if (fetchError || !appointment) {
        return notFoundResponse('Cita no encontrada')
      }

      // 3. IDOR protection — verify user has access to this appointment
      const canModify = await canModifyBarberAppointments(
        supabase,
        user.id,
        appointment.barber_id,
        business.id,
        business.owner_id
      )

      if (!canModify) {
        logSecurity('unauthorized', 'high', {
          userId: user.id,
          userEmail: user.email,
          appointmentId,
          businessId: business.id,
          endpoint: '/api/appointments/[id]/verify-payment',
          action: 'verify_payment',
        })
        return unauthorizedResponse('No tienes permiso para verificar pagos de esta cita')
      }

      // 4. Guard: advance_payment_status must be 'pending'
      if (appointment.advance_payment_status !== 'pending') {
        return NextResponse.json(
          {
            error: 'Estado inválido',
            message: `No se puede ${action === 'verify' ? 'verificar' : 'rechazar'} un pago con estado "${appointment.advance_payment_status}". Solo pagos pendientes pueden procesarse.`,
          },
          { status: 400 }
        )
      }

      // 5. Build update payload based on action
      const updateData: Record<string, unknown> =
        action === 'verify'
          ? {
              advance_payment_status: 'verified',
              verified_by_user_id: user.id,
              verified_at: new Date().toISOString(),
            }
          : {
              advance_payment_status: 'rejected',
            }

      // 6. Apply update
      const { error: updateError } = await (supabase as any)
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .eq('business_id', business.id)

      if (updateError) {
        console.error('Verify payment update error:', updateError)
        return errorResponse('Error al actualizar el estado del pago')
      }

      return NextResponse.json({ success: true, action })
    } catch (error) {
      console.error('Unexpected error in POST /api/appointments/[id]/verify-payment:', error)
      return errorResponse('Error interno del servidor')
    }
  },
  {
    interval: 60 * 1000,
    maxRequests: 10,
  }
)
