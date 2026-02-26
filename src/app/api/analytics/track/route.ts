import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service-client'

export async function POST(request: Request) {
  try {
    const { event, metadata } = await request.json()

    if (!event || typeof event !== 'string') {
      return NextResponse.json({ ok: true }) // Graceful — never fail analytics
    }

    // Get business_id from session
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ ok: true }) // No session — still succeed
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ ok: true })
    }

    // Insert via service client (bypasses RLS — no INSERT policy for users)
    // Note: analytics_events not in generated types yet — cast needed until `supabase gen types` is run
    const serviceClient = createServiceClient()
    await (serviceClient as any).from('analytics_events').insert({
      business_id: business.id,
      event_name: event,
      metadata: metadata || {},
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Analytics should never return errors
    return NextResponse.json({ ok: true })
  }
}
