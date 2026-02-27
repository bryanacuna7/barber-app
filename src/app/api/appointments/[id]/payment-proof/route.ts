/**
 * GET /api/appointments/[id]/payment-proof
 *
 * Authenticated endpoint — owner or barber only.
 * Returns a signed URL for the advance payment proof image (1 hour expiry).
 * The deposit-proofs bucket is private; signed URLs are required.
 *
 * Security:
 * - Requires authenticated user
 * - User must own the business or be a barber in that business
 * - Returns 404 if no proof URL exists on the appointment
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
import { logger, logSecurity } from '@/lib/logger'
import { canModifyBarberAppointments } from '@/lib/rbac'
import { createServiceClient } from '@/lib/supabase/service-client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export const GET = withAuthAndRateLimit<RouteParams>(
  async (request, { params }, { user, business, supabase }) => {
    try {
      const { id: appointmentId } = await params

      // 1. Fetch appointment
      const { data: appointment, error: fetchError } = (await supabase
        .from('appointments')
        .select(
          'id, barber_id, business_id, advance_payment_proof_url, barber:barbers!appointments_barber_id_fkey(id, name)'
        )
        .eq('id', appointmentId)
        .eq('business_id', business.id)
        .single()) as any

      if (fetchError || !appointment) {
        return notFoundResponse('Cita no encontrada')
      }

      // 2. IDOR protection — verify user has access to this appointment
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
          endpoint: '/api/appointments/[id]/payment-proof',
          action: 'view_payment_proof',
        })
        return unauthorizedResponse('No tienes permiso para ver el comprobante de esta cita')
      }

      // 3. Guard: proof must exist
      if (!appointment.advance_payment_proof_url) {
        return notFoundResponse('No hay comprobante de pago para esta cita')
      }

      // 4. Generate signed URL via service client (bucket is private)
      const serviceClient = createServiceClient()
      const { data: signedData, error: signedError } = await (serviceClient as any).storage
        .from('deposit-proofs')
        .createSignedUrl(appointment.advance_payment_proof_url, 3600)

      if (signedError || !signedData?.signedUrl) {
        logger.error({ err: signedError }, 'Payment proof signed URL error')
        return errorResponse('Error al generar el enlace del comprobante')
      }

      return NextResponse.json({ url: signedData.signedUrl })
    } catch (error) {
      logger.error({ err: error }, 'Unexpected error in GET /api/appointments/[id]/payment-proof')
      return errorResponse('Error interno del servidor')
    }
  },
  {
    interval: 60 * 1000,
    maxRequests: 10,
  }
)
