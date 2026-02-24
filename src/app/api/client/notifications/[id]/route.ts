import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CLIENT_NOTIFICATION_TYPES = ['smart_promo_offer'] as const

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .in('type', [...CLIENT_NOTIFICATION_TYPES])

    if (error) {
      return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
