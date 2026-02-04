import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { markAsRead } from '@/lib/notifications'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const success = await markAsRead(supabase, id)

  if (!success) {
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
