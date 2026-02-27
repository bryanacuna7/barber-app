import { NextResponse } from 'next/server'
import { z } from 'zod'
import { canAddClient } from '@/lib/subscription'
import { withAuth, errorResponse } from '@/lib/api/middleware'
import { logger } from '@/lib/logger'
import { getStaffPermissions, mergePermissions } from '@/lib/auth/roles'

// Validation schema for creating clients
const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  email: z.string().email().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// GET - Fetch clients for the authenticated user's business
export const GET = withAuth(async (request, context, { business, role, barberId, supabase }) => {
  try {
    // Permission check: barbers need nav_clientes permission
    if (role === 'barber' && barberId) {
      const [{ data: bizRow }, { data: barberRow }] = await Promise.all([
        supabase.from('businesses').select('staff_permissions').eq('id', business.id).single(),
        supabase.from('barbers').select('custom_permissions').eq('id', barberId).single(),
      ])
      const perms = mergePermissions(
        getStaffPermissions((bizRow as any)?.staff_permissions),
        (barberRow as any)?.custom_permissions
      )
      if (!perms.nav_clientes) {
        return errorResponse('No tienes permiso para ver clientes', 403)
      }
    }

    // Parse query params with input validation
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10)
    const rawOffset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = Number.isNaN(rawLimit) ? 20 : Math.max(0, rawLimit)
    const offset = Number.isNaN(rawOffset) ? 0 : Math.max(0, rawOffset)

    // Build query with pagination
    let query = supabase
      .from('clients')
      .select(
        'id, name, phone, email, notes, created_at, last_visit_at, total_visits, total_spent, business_id',
        { count: 'exact' }
      )
      .eq('business_id', business.id)
      .order('name', { ascending: true })

    // limit=0 means "return all" (no range applied)
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: clients, error, count } = await query

    if (error) {
      logger.error({ err: error }, 'Error fetching clients')
      return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
    }

    return NextResponse.json({
      data: clients,
      pagination: {
        total: count || 0,
        offset,
        limit,
        hasMore: limit === 0 ? false : count ? offset + limit < count : false,
      },
    })
  } catch (error) {
    logger.error({ err: error }, 'Unexpected error in GET /api/clients')
    return errorResponse('Error interno del servidor')
  }
})

// POST - Create a new client
export const POST = withAuth(async (request, context, { business, supabase }) => {
  try {
    // Parse and validate request body
    const body = await request.json()
    const result = clientSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Check subscription limits
    const limitCheck = await canAddClient(supabase, business.id)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Límite de plan alcanzado',
          message: limitCheck.reason,
          current: limitCheck.current,
          max: limitCheck.max,
          upgrade_required: true,
        },
        { status: 403 }
      )
    }

    // Create client
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        business_id: business.id,
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email,
        notes: result.data.notes,
      })
      .select('id, name, phone, email, notes, created_at, business_id')
      .single()

    if (error) {
      // Check for duplicate phone
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe un cliente con ese teléfono' },
          { status: 409 }
        )
      }
      logger.error({ err: error }, 'Error creating client')
      return NextResponse.json({ error: 'Error al crear el cliente' }, { status: 500 })
    }

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, 'Unexpected error in POST /api/clients')
    return errorResponse('Error interno del servidor')
  }
})
