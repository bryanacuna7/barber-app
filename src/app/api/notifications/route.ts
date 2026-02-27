import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNotifications, markAllAsRead } from '@/lib/notifications'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread_only') === 'true'

    const { notifications, stats } = await getNotifications(supabase, {
      limit,
      offset,
      unreadOnly,
    })

    return NextResponse.json({ notifications, stats })
  } catch (error) {
    logger.error({ err: error }, 'Error in GET /api/notifications')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mark all as read
    const success = await markAllAsRead(supabase)

    if (!success) {
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, 'Error in PATCH /api/notifications')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
