import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CLIENT_NOTIFICATION_TYPES = ['smart_promo_offer'] as const

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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
    const unreadOnly = searchParams.get('unread_only') === 'true'

    let query = (supabase as any)
      .from('notifications')
      .select(
        'id, type, title, message, is_read, created_at, metadata, reference_type, reference_id, business_id',
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .in('type', [...CLIENT_NOTIFICATION_TYPES])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (businessId) query = query.eq('business_id', businessId)
    if (unreadOnly) query = query.eq('is_read', false)

    const { data, count, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    let unreadQuery = (supabase as any)
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('type', [...CLIENT_NOTIFICATION_TYPES])
      .eq('is_read', false)

    if (businessId) unreadQuery = unreadQuery.eq('business_id', businessId)

    const { count: unreadCount } = await unreadQuery

    return NextResponse.json({
      notifications: data || [],
      stats: {
        total: count || 0,
        unread: unreadCount || 0,
      },
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

    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('business_id')

    let updateQuery = (supabase as any)
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .in('type', [...CLIENT_NOTIFICATION_TYPES])
      .eq('is_read', false)

    if (businessId) updateQuery = updateQuery.eq('business_id', businessId)

    const { error } = await updateQuery

    if (error) {
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
