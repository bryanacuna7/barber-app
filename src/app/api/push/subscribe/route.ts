/**
 * POST /api/push/subscribe — Save a push subscription for the authenticated user
 * DELETE /api/push/subscribe — Remove a push subscription
 *
 * Security: Requires authentication. Users can only manage their own subscriptions.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Datos de suscripción incompletos' }, { status: 400 })
    }

    // Upsert: if endpoint already exists, reactivate it
    const { error } = await supabase.from('push_subscriptions' as any).upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        is_active: true,
        failed_count: 0,
      } as any,
      { onConflict: 'endpoint' }
    )

    if (error) {
      console.error('Error saving push subscription:', error)
      return NextResponse.json({ error: 'Error al guardar la suscripción' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in POST /api/push/subscribe:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint requerido' }, { status: 400 })
    }

    // Deactivate (soft delete) — keeps record for analytics
    const { error } = await supabase
      .from('push_subscriptions' as any)
      .update({ is_active: false } as any)
      .eq('endpoint', endpoint)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error removing push subscription:', error)
      return NextResponse.json({ error: 'Error al eliminar la suscripción' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/push/subscribe:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
