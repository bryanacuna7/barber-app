/**
 * POST /api/public/advance-payment/submit
 *
 * Public endpoint — token-based auth (no login required).
 * Allows clients to submit advance payment proof for their appointment.
 * Supports two channels: 'upload' (image file) and 'whatsapp' (no file needed).
 *
 * Security:
 * - Rate limited: 10 req/min per IP
 * - Validates tracking_token UUID format
 * - Enforces appointment status and advance_payment_enabled guards
 * - Uses service client to bypass RLS
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { createNotification } from '@/lib/notifications'
import { sendPushToBusinessOwner } from '@/lib/push/sender'
import { validateImageFile } from '@/lib/file-validation'

const SUBMIT_RATE_LIMIT = { interval: 60_000, maxRequests: 10 }

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface AppointmentRow {
  id: string
  status: string
  scheduled_at: string
  service_id: string | null
  business_id: string
  advance_payment_status: string
  client: { name: string | null } | null
}

interface BusinessRow {
  id: string
  owner_id: string
  advance_payment_enabled: boolean
  advance_payment_discount: number
  advance_payment_deadline_hours: number
}

interface ServiceRow {
  id: string
  price: number
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit
    const rl = await rateLimit(request, SUBMIT_RATE_LIMIT)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta en un momento.' },
        { status: 429, headers: rl.headers }
      )
    }

    const serviceClient = createServiceClient()

    // 2. Detect content type to decide parse mode
    const contentType = request.headers.get('content-type') || ''

    let token: string | null = null
    let proofChannel: string | null = null
    let file: File | null = null

    if (contentType.includes('multipart/form-data')) {
      // Upload mode — parse as FormData
      let formData: FormData
      try {
        formData = await request.formData()
      } catch {
        return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
      }
      token = formData.get('token') as string | null
      proofChannel = formData.get('channel') as string | null
      file = formData.get('file') as File | null
    } else {
      // WhatsApp mode — parse as JSON
      let body: { token?: string; channel?: string }
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 })
      }
      token = body.token ?? null
      proofChannel = body.channel ?? null
    }

    // 3. Validate token presence and format
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    if (!UUID_REGEX.test(token)) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    // 4. Validate channel
    if (!proofChannel || !['upload', 'whatsapp'].includes(proofChannel)) {
      return NextResponse.json({ error: 'Canal inválido' }, { status: 400 })
    }

    // 5. Lookup appointment by tracking_token
    const { data: appointment, error: apptError } = (await (serviceClient as any)
      .from('appointments')
      .select(
        'id, status, scheduled_at, service_id, business_id, advance_payment_status, client:clients(name)'
      )
      .eq('tracking_token', token)
      .single()) as { data: AppointmentRow | null; error: unknown }

    if (apptError || !appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // 6. Guard: appointment must be pending or confirmed
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Esta cita no acepta comprobantes de pago' },
        { status: 400 }
      )
    }

    // 7. Guard: advance_payment_status must be none or rejected
    if (
      appointment.advance_payment_status !== 'none' &&
      appointment.advance_payment_status !== 'rejected'
    ) {
      return NextResponse.json(
        { error: 'Ya existe un comprobante pendiente o verificado para esta cita' },
        { status: 400 }
      )
    }

    // 8. Lookup business config
    const { data: business, error: bizError } = (await (serviceClient as any)
      .from('businesses')
      .select(
        'id, owner_id, advance_payment_enabled, advance_payment_discount, advance_payment_deadline_hours'
      )
      .eq('id', appointment.business_id)
      .single()) as { data: BusinessRow | null; error: unknown }

    if (bizError || !business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // 9. Guard: advance payment must be enabled
    if (!business.advance_payment_enabled) {
      return NextResponse.json(
        { error: 'Esta barbería no acepta pagos adelantados' },
        { status: 403 }
      )
    }

    // 10. Guard: deadline check (skip if deadline_hours is 0)
    const deadlineHours = business.advance_payment_deadline_hours ?? 2
    if (deadlineHours > 0) {
      const scheduledAt = new Date(appointment.scheduled_at)
      const deadlineMs = deadlineHours * 60 * 60 * 1000
      const deadline = new Date(scheduledAt.getTime() - deadlineMs)

      if (new Date() > deadline) {
        return NextResponse.json(
          { error: 'El tiempo límite para enviar el comprobante ya pasó' },
          { status: 400 }
        )
      }
    }

    // 11. Lookup service price
    let servicePrice = 0
    if (appointment.service_id) {
      const { data: service } = (await (serviceClient as any)
        .from('services')
        .select('id, price')
        .eq('id', appointment.service_id)
        .single()) as { data: ServiceRow | null; error: unknown }

      if (service) {
        servicePrice = service.price
      }
    }

    // 12. Handle file upload if channel is 'upload'
    let proofUrl: string | null = null

    if (proofChannel === 'upload') {
      if (!file) {
        return NextResponse.json(
          { error: 'Archivo requerido para el canal de subida' },
          { status: 400 }
        )
      }

      // Validate file using magic bytes (not just MIME type which is spoofable)
      const validation = await validateImageFile(file, MAX_FILE_SIZE)
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Solo se permiten imágenes (PNG, JPG, WebP, GIF)' },
          { status: 400 }
        )
      }

      // Use detected type from magic bytes for extension
      const ext = validation.detectedType === 'jpeg' ? 'jpg' : validation.detectedType

      // Generate storage path
      const filePath = `${appointment.business_id}/${appointment.id}/${crypto.randomUUID()}.${ext}`

      // Upload to storage bucket
      const fileBuffer = await file.arrayBuffer()
      const { error: uploadError } = await (serviceClient as any).storage
        .from('deposit-proofs')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        logger.error({ err: uploadError }, 'Proof upload error')
        return NextResponse.json({ error: 'Error al subir el comprobante' }, { status: 500 })
      }

      proofUrl = filePath
    }

    // 13. Calculate price snapshots
    const discount = business.advance_payment_discount ?? 10
    const discountAmount = Math.round((servicePrice * discount) / 100)
    const finalPrice = servicePrice - discountAmount

    // 14. Update appointment
    const { error: updateError } = await (serviceClient as any)
      .from('appointments')
      .update({
        advance_payment_status: 'pending',
        proof_channel: proofChannel,
        advance_payment_proof_url: proofUrl,
        proof_submitted_at: new Date().toISOString(),
        base_price_snapshot: servicePrice,
        discount_pct_snapshot: discount,
        discount_amount_snapshot: discountAmount,
        final_price_snapshot: finalPrice,
      })
      .eq('id', appointment.id)

    if (updateError) {
      logger.error({ err: updateError }, 'Proof submit update error')
      return NextResponse.json({ error: 'Error al registrar el comprobante' }, { status: 500 })
    }

    // 15. Fire notifications to owner (non-blocking)
    const clientName = appointment.client?.name ?? 'Cliente'

    createNotification(serviceClient as any, {
      business_id: business.id,
      user_id: business.owner_id,
      type: 'payment_pending',
      title: 'Comprobante de pago recibido',
      message: `${clientName} envió un comprobante de pago adelantado`,
      reference_type: 'appointment',
      reference_id: appointment.id,
    }).catch((err) => {
      logger.error({ err }, 'Submit proof: createNotification error')
    })

    sendPushToBusinessOwner(business.id, {
      title: 'Comprobante de pago',
      body: `${clientName} envió su comprobante de SINPE`,
      url: '/citas',
    }).catch((err) => {
      logger.error({ err }, 'Submit proof: sendPushToBusinessOwner error')
    })

    return NextResponse.json({ success: true, message: 'Comprobante enviado' })
  } catch (error) {
    logger.error({ err: error }, 'Public advance-payment submit API error')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
