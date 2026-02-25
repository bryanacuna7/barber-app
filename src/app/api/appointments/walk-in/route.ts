import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuthAndRateLimit, errorResponse, unauthorizedResponse } from '@/lib/api/middleware'
import { logger, logSecurity } from '@/lib/logger'
import { detectUserRole, getStaffPermissions, mergePermissions } from '@/lib/auth/roles'
import { sendPushToBusinessOwner } from '@/lib/push/sender'

const WalkInBodySchema = z.object({
  service_id: z.string().uuid(),
  barber_id: z.string().uuid(),
  mode: z.enum(['queue', 'start_now']),
})

/**
 * POST /api/appointments/walk-in
 *
 * Create a walk-in appointment with proper RBAC.
 *
 * Security:
 * - Owner: can create walk-in for any barber in their business
 * - Barber: can only create walk-in for themselves, requires can_create_citas
 * - source: 'walk_in' is forced server-side (never trusted from client)
 * - Concurrency guard: start_now rejects if barber already has an active appointment
 *
 * Rate Limiting: 10 requests per minute per user
 */
export const POST = withAuthAndRateLimit(
  async (request, _context, { user, business, supabase }) => {
    try {
      // 1. Parse and validate body
      const body = await request.json()
      const parsed = WalkInBodySchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        )
      }

      const { service_id, barber_id, mode } = parsed.data

      // 2. RBAC: detect role and check permissions
      const roleInfo = await detectUserRole(supabase, user.id)

      if (!roleInfo) {
        return unauthorizedResponse('No se pudo determinar tu rol')
      }

      const isOwner = roleInfo.isOwner || roleInfo.isAdmin

      if (!isOwner) {
        // Barber: must be creating for themselves
        if (roleInfo.barberId !== barber_id) {
          logSecurity('unauthorized', 'high', {
            userId: user.id,
            userEmail: user.email,
            requestedBarberId: barber_id,
            ownBarberId: roleInfo.barberId,
            endpoint: '/api/appointments/walk-in',
            action: 'walk_in_other_barber',
          })
          return unauthorizedResponse('Solo puedes crear walk-ins para ti mismo')
        }

        // Check can_create_citas permission
        const { data: businessRow } = await supabase
          .from('businesses')
          .select('staff_permissions')
          .eq('id', business.id)
          .single()

        const { data: barberRow } = await supabase
          .from('barbers')
          .select('custom_permissions')
          .eq('id', barber_id)
          .single()

        const businessPerms = getStaffPermissions((businessRow as any)?.staff_permissions)
        const effectivePerms = mergePermissions(
          businessPerms,
          (barberRow as any)?.custom_permissions
        )

        if (!effectivePerms.can_create_citas) {
          logSecurity('unauthorized', 'medium', {
            userId: user.id,
            barberId: barber_id,
            endpoint: '/api/appointments/walk-in',
            action: 'walk_in_no_permission',
          })
          return NextResponse.json({ error: 'No tienes permiso para crear citas' }, { status: 403 })
        }
      }

      // 3. Validate barber belongs to business
      const { data: barber, error: barberError } = await supabase
        .from('barbers')
        .select('id, name, business_id, is_active')
        .eq('id', barber_id)
        .eq('business_id', business.id)
        .single()

      if (barberError || !barber) {
        return NextResponse.json(
          { error: 'Barbero no encontrado en este negocio' },
          { status: 404 }
        )
      }

      if (!barber.is_active) {
        return NextResponse.json({ error: 'El barbero no está activo' }, { status: 400 })
      }

      // 4. Validate service belongs to business
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('id, name, duration_minutes, price, is_active')
        .eq('id', service_id)
        .eq('business_id', business.id)
        .single()

      if (serviceError || !service) {
        return NextResponse.json(
          { error: 'Servicio no encontrado en este negocio' },
          { status: 404 }
        )
      }

      if (!service.is_active) {
        return NextResponse.json({ error: 'El servicio no está activo' }, { status: 400 })
      }

      // 5. Concurrency guard for start_now: reject if barber has active appointment
      if (mode === 'start_now') {
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)

        const { data: activeAppts } = await (supabase as any)
          .from('appointments')
          .select('id')
          .eq('barber_id', barber_id)
          .eq('status', 'confirmed')
          .not('started_at', 'is', null)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
          .limit(1)

        if (activeAppts && activeAppts.length > 0) {
          return NextResponse.json(
            {
              error: 'Cita en progreso',
              message:
                'El barbero ya tiene una cita en progreso. Complétala antes de iniciar otra.',
            },
            { status: 409 }
          )
        }
      }

      // 6. Insert appointment
      const now = new Date().toISOString()

      const insertData: Record<string, any> = {
        business_id: business.id,
        barber_id,
        service_id,
        client_id: null,
        scheduled_at: now,
        duration_minutes: service.duration_minutes ?? 30,
        price: service.price,
        source: 'walk_in',
        status: mode === 'start_now' ? 'confirmed' : 'pending',
      }

      if (mode === 'start_now') {
        insertData.started_at = now
      }

      const { data: appointment, error: insertError } = await (supabase as any)
        .from('appointments')
        .insert(insertData)
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
          advance_payment_status,
          source,
          client:clients!appointments_client_id_fkey(id, name, phone, email),
          service:services!appointments_service_id_fkey(id, name, duration_minutes, price)
        `
        )
        .single()

      if (insertError) {
        logger.error({ insertError, barber_id, service_id }, 'Walk-in insert failed')
        return errorResponse('Error al crear el walk-in')
      }

      logger.info(
        { appointmentId: appointment.id, barberId: barber_id, mode, serviceId: service_id },
        'Walk-in created'
      )

      // 7. Push notification (skip if owner is creating for themselves)
      const isOwnerCreating = user.id === business.owner_id
      if (!isOwnerCreating) {
        const pushTitle = mode === 'start_now' ? 'Walk-in iniciado' : 'Walk-in en cola'
        const pushBody =
          mode === 'start_now'
            ? `${service.name} · ${barber.name}`
            : `${service.name} · ${barber.name}`

        sendPushToBusinessOwner(business.id, {
          title: pushTitle,
          body: pushBody,
          url: '/mi-dia',
          tag: `walkin-${appointment.id}`,
        }).catch((err) =>
          logger.error({ err, appointmentId: appointment.id }, 'Push error on walk-in')
        )
      }

      return NextResponse.json(appointment, { status: 201 })
    } catch (error) {
      logger.error({ error }, 'Unexpected error in POST /api/appointments/walk-in')
      return errorResponse('Error interno del servidor')
    }
  },
  {
    interval: 60 * 1000,
    maxRequests: 10,
  }
)
