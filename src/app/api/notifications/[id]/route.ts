import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { markAsRead } from '@/lib/notifications'
import { logger } from '@/lib/logger'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
  } catch (error) {
    logger.error({ err: error }, 'Error in PATCH /api/notifications/[id]')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
