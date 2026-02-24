import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface ClientNotificationPreferencesResponse {
  business_id: string
  smart_promos_enabled: boolean
  smart_promos_paused_until: string | null
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('business_id')

    if (!businessId) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 })
    }

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found for this business' }, { status: 404 })
    }

    const { data: pref } = await (supabase as any)
      .from('client_notification_preferences')
      .select('business_id, smart_promos_enabled, smart_promos_paused_until')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .maybeSingle()

    const response: ClientNotificationPreferencesResponse = {
      business_id: businessId,
      smart_promos_enabled: pref ? pref.smart_promos_enabled !== false : true,
      smart_promos_paused_until: pref?.smart_promos_paused_until || null,
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const businessId = body?.business_id as string | undefined
    const enabled = body?.smart_promos_enabled as boolean | undefined
    const pausedUntil = body?.smart_promos_paused_until as string | null | undefined

    if (!businessId) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 })
    }

    if (enabled !== undefined && typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'smart_promos_enabled must be a boolean' }, { status: 400 })
    }

    if (pausedUntil !== undefined && pausedUntil !== null && Number.isNaN(Date.parse(pausedUntil))) {
      return NextResponse.json(
        { error: 'smart_promos_paused_until must be null or a valid ISO date' },
        { status: 400 }
      )
    }

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found for this business' }, { status: 404 })
    }

    const payload: Record<string, unknown> = {
      business_id: businessId,
      client_id: client.id,
      user_id: user.id,
    }

    if (enabled !== undefined) payload.smart_promos_enabled = enabled
    if (pausedUntil !== undefined) payload.smart_promos_paused_until = pausedUntil

    const { data: updated, error: updateError } = await (supabase as any)
      .from('client_notification_preferences')
      .upsert(payload, { onConflict: 'business_id,user_id' })
      .select('business_id, smart_promos_enabled, smart_promos_paused_until')
      .single()

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    return NextResponse.json({
      business_id: updated.business_id,
      smart_promos_enabled: updated.smart_promos_enabled !== false,
      smart_promos_paused_until: updated.smart_promos_paused_until || null,
    } as ClientNotificationPreferencesResponse)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
