import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business, error } = await (supabase
      .from('businesses')
      .select('id, smart_notifications_enabled')
      .eq('owner_id', user.id)
      .single()) as any

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({
      smart_notifications_enabled: business.smart_notifications_enabled === true,
    })
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
    const enabled = body?.smart_notifications_enabled

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'smart_notifications_enabled must be a boolean' },
        { status: 400 }
      )
    }

    const { data: business, error: businessError } = await (supabase
      .from('businesses')
      .update({ smart_notifications_enabled: enabled } as any)
      .eq('owner_id', user.id)
      .select('id, smart_notifications_enabled')
      .single()) as any

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({
      smart_notifications_enabled: business.smart_notifications_enabled === true,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
