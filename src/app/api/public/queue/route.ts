/**
 * GET /api/public/queue?token=xxx
 *
 * Public queue endpoint — token-based auth (no login required).
 * Returns anonymized queue data for Uber-style live tracking.
 *
 * Security:
 * - Validates tracking_token UUID
 * - Checks token expiration
 * - NEVER returns client names, phones, emails, notes
 * - Uses service client to bypass RLS (read-only, anonymized)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'

interface QueueItem {
  id: string
  scheduledAt: string
  durationMinutes: number
  status: 'pending' | 'confirmed' | 'completed'
  startedAt: string | null
  actualDurationMinutes: number | null
  serviceName: string
  isYours: boolean
}

interface PublicQueueResponse {
  barberName: string
  businessName: string
  brandColor: string | null
  businessSlug: string
  date: string
  yourAppointmentId: string
  appointmentDetails: {
    scheduledAt: string
    serviceName: string
    barberName: string
    durationMinutes: number
    status: string
    startedAt: string | null
  }
  queue: QueueItem[]
  stats: {
    completed: number
    inProgress: number
    pending: number
    beforeYou: number
    estimatedDelay: number
    estimatedStartTime: string
  }
  expired: boolean
}

export async function GET(request: NextRequest) {
  try {
    // Rate limit: 30 requests/min per IP (moderate — client polls every 30s)
    const rl = await rateLimit(request, RateLimitPresets.moderate)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes' },
        { status: 429, headers: rl.headers }
      )
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(token)) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    // 1. Look up appointment by tracking_token
    const { data: appointment, error: apptError } = await (
      serviceClient
        .from('appointments')
        .select(
          'id, business_id, barber_id, client_id, scheduled_at, duration_minutes, status, started_at, actual_duration_minutes, tracking_expires_at, service:services!appointments_service_id_fkey(name)'
        ) as any
    )
      .eq('tracking_token', token)
      .single()

    if (apptError || !appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // 2. Block cancelled/no_show — these appointments should not be trackable
    if (appointment.status === 'cancelled' || appointment.status === 'no_show') {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
    }

    // 3. Check expiration (also catches historical tokens without tracking_expires_at
    //    for completed appointments — they should show "completed" state, not queue)
    if (appointment.tracking_expires_at) {
      const expiresAt = new Date(appointment.tracking_expires_at)
      if (expiresAt < new Date()) {
        // Fetch business slug for rebook CTA
        const { data: biz } = await serviceClient
          .from('businesses')
          .select('slug')
          .eq('id', appointment.business_id)
          .single()

        return NextResponse.json(
          {
            expired: true,
            businessSlug: biz?.slug ?? null,
            error: 'Este link de seguimiento ha expirado',
          },
          { status: 410 }
        )
      }
    }

    // 3. Fetch barber name
    const { data: barber } = await serviceClient
      .from('barbers')
      .select('name')
      .eq('id', appointment.barber_id)
      .single()

    // 4. Fetch business info (for branding)
    const { data: business } = await serviceClient
      .from('businesses')
      .select('name, brand_primary_color, slug')
      .eq('id', appointment.business_id)
      .single()

    // 5. Fetch ALL appointments for this barber today (anonymized)
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setUTCHours(23, 59, 59, 999)

    const { data: appointments } = await (
      serviceClient
        .from('appointments')
        .select(
          'id, scheduled_at, duration_minutes, status, started_at, actual_duration_minutes, service:services!appointments_service_id_fkey(name)'
        ) as any
    )
      .eq('barber_id', appointment.barber_id)
      .eq('business_id', appointment.business_id)
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
      .not('status', 'in', '("cancelled","no_show")')
      .order('scheduled_at', { ascending: true })

    const yourAppointmentId = appointment.id
    const yourScheduledAt = new Date(appointment.scheduled_at)

    // 6. Build anonymized queue + calculate ETA (same logic as authenticated endpoint)
    let completed = 0
    let inProgress = 0
    let pending = 0
    let beforeYou = 0
    let runningTime: number | null = null

    const queue: QueueItem[] = (appointments ?? []).map(
      (appt: {
        id: string
        scheduled_at: string
        duration_minutes: number | null
        status: string
        started_at: string | null
        actual_duration_minutes: number | null
        service: { name: string } | null
      }) => {
        const isYours = appt.id === yourAppointmentId
        const scheduledAt = new Date(appt.scheduled_at)
        const durationMs = (appt.duration_minutes ?? 30) * 60_000

        if (appt.status === 'completed') {
          completed++
          if (scheduledAt < yourScheduledAt) beforeYou++
        } else if (appt.status === 'confirmed' && appt.started_at) {
          inProgress++
          if (scheduledAt <= yourScheduledAt && !isYours) beforeYou++
        } else {
          pending++
          if (scheduledAt < yourScheduledAt) beforeYou++
        }

        if (scheduledAt <= yourScheduledAt || isYours) {
          if (appt.status === 'completed' && appt.started_at && appt.actual_duration_minutes) {
            const actualEnd =
              new Date(appt.started_at).getTime() + appt.actual_duration_minutes * 60_000
            runningTime = Math.max(actualEnd, (runningTime ?? scheduledAt.getTime()) + durationMs)
          } else if (appt.status === 'confirmed' && appt.started_at) {
            const expectedEnd = new Date(appt.started_at).getTime() + durationMs
            runningTime = Math.max(expectedEnd, Date.now())
          } else if (!isYours) {
            runningTime = (runningTime ?? scheduledAt.getTime()) + durationMs
          }
        }

        return {
          id: appt.id,
          scheduledAt: appt.scheduled_at,
          durationMinutes: appt.duration_minutes ?? 30,
          status: appt.status as 'pending' | 'confirmed' | 'completed',
          startedAt: appt.started_at,
          actualDurationMinutes: appt.actual_duration_minutes,
          serviceName: appt.service?.name ?? 'Servicio',
          isYours,
        }
      }
    )

    const estimatedStartTime = runningTime
      ? new Date(runningTime).toISOString()
      : yourScheduledAt.toISOString()
    const estimatedDelay = runningTime
      ? Math.round((runningTime - yourScheduledAt.getTime()) / 60_000)
      : 0

    const response: PublicQueueResponse = {
      barberName: barber?.name ?? 'Miembro del equipo',
      businessName: business?.name ?? 'Barbería',
      brandColor: business?.brand_primary_color ?? null,
      businessSlug: business?.slug ?? '',
      date: now.toISOString().split('T')[0],
      yourAppointmentId,
      appointmentDetails: {
        scheduledAt: appointment.scheduled_at,
        serviceName: appointment.service?.name ?? 'Servicio',
        barberName: barber?.name ?? 'Miembro del equipo',
        durationMinutes: appointment.duration_minutes ?? 30,
        status: appointment.status,
        startedAt: appointment.started_at,
      },
      queue,
      stats: {
        completed,
        inProgress,
        pending,
        beforeYou,
        estimatedDelay,
        estimatedStartTime,
      },
      expired: false,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Public queue API error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
