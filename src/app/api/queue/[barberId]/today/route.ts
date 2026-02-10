/**
 * GET /api/queue/[barberId]/today?businessId=xxx
 *
 * Returns anonymized queue data for a barber's day.
 * Used by client dashboard to show live queue tracking.
 *
 * Security:
 * - Requires authentication (client must be logged in)
 * - Verifies client has an appointment with this barber today
 * - NEVER returns client names, phones, emails, notes
 * - Uses service client to bypass RLS (read-only, anonymized)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'

interface RouteParams {
  params: Promise<{ barberId: string }>
}

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

interface QueueResponse {
  barberName: string
  date: string
  yourAppointmentId: string
  queue: QueueItem[]
  stats: {
    completed: number
    inProgress: number
    pending: number
    beforeYou: number
    estimatedDelay: number
    estimatedStartTime: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // 1. Authenticate
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { barberId } = await params
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId requerido' }, { status: 400 })
    }

    // 2. Verify client has appointment with this barber today
    const serviceClient = createServiceClient()

    // Get client record for this user
    const { data: clientRecord } = await serviceClient
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .maybeSingle()

    if (!clientRecord) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 403 })
    }

    // Date range for today (UTC)
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setUTCHours(23, 59, 59, 999)

    // Verify client has appointment with this barber today
    const { data: clientAppt } = await (
      serviceClient
        .from('appointments')
        .select('id, scheduled_at')
        .eq('client_id', clientRecord.id)
        .eq('barber_id', barberId)
        .eq('business_id', businessId) as any
    )
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!clientAppt) {
      return NextResponse.json({ error: 'No tienes cita con este barbero hoy' }, { status: 403 })
    }

    // 3. Fetch barber name
    const { data: barber } = await serviceClient
      .from('barbers')
      .select('name')
      .eq('id', barberId)
      .single()

    // 4. Fetch ALL appointments for this barber today (anonymized)
    const { data: appointments, error: fetchError } = await (
      serviceClient
        .from('appointments')
        .select(
          'id, scheduled_at, duration_minutes, status, started_at, actual_duration_minutes, service:services!appointments_service_id_fkey(name)'
        ) as any
    )
      .eq('barber_id', barberId)
      .eq('business_id', businessId)
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
      .not('status', 'in', '("cancelled","no_show")')
      .order('scheduled_at', { ascending: true })

    if (fetchError) {
      console.error('Queue fetch error:', fetchError)
      return NextResponse.json({ error: 'Error al obtener la cola' }, { status: 500 })
    }

    const yourAppointmentId = clientAppt.id
    const yourScheduledAt = new Date(clientAppt.scheduled_at)

    // 5. Build anonymized queue + calculate ETA
    let completed = 0
    let inProgress = 0
    let pending = 0
    let beforeYou = 0

    // Running time calculation for ETA propagation
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

        // Count stats
        if (appt.status === 'completed') {
          completed++
          if (scheduledAt < yourScheduledAt) beforeYou++ // completed before you = still "before you"
        } else if (appt.status === 'confirmed' && appt.started_at) {
          inProgress++
          if (scheduledAt <= yourScheduledAt && !isYours) beforeYou++
        } else {
          pending++
          if (scheduledAt < yourScheduledAt) beforeYou++
        }

        // Propagate running time for ETA (only for appointments before yours + yours)
        if (scheduledAt <= yourScheduledAt || isYours) {
          if (appt.status === 'completed' && appt.started_at && appt.actual_duration_minutes) {
            const actualEnd =
              new Date(appt.started_at).getTime() + appt.actual_duration_minutes * 60_000
            runningTime = Math.max(actualEnd, (runningTime ?? scheduledAt.getTime()) + durationMs)
          } else if (appt.status === 'confirmed' && appt.started_at) {
            const expectedEnd = new Date(appt.started_at).getTime() + durationMs
            runningTime = Math.max(expectedEnd, Date.now())
          } else if (!isYours) {
            // Pending — accumulate duration
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

    // ETA = runningTime (when all before-you appointments finish)
    const estimatedStartTime = runningTime
      ? new Date(runningTime).toISOString()
      : yourScheduledAt.toISOString()
    const estimatedDelay = runningTime
      ? Math.round((runningTime - yourScheduledAt.getTime()) / 60_000)
      : 0

    const response: QueueResponse = {
      barberName: barber?.name ?? 'Barbero',
      date: now.toISOString().split('T')[0],
      yourAppointmentId,
      queue,
      stats: {
        completed,
        inProgress,
        pending,
        beforeYou,
        estimatedDelay,
        estimatedStartTime,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Queue API error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
