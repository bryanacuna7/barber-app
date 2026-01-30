import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type NotificationType =
  // Business owner notifications
  | 'trial_expiring'
  | 'trial_expired'
  | 'subscription_expiring'
  | 'subscription_expired'
  | 'payment_approved'
  | 'payment_rejected'
  | 'new_appointment'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  // Admin notifications
  | 'new_business'
  | 'payment_pending'
  | 'trials_expiring_bulk'
  | 'system_alert'

export interface Notification {
  id: string
  user_id: string | null
  business_id: string | null
  type: NotificationType
  title: string
  message: string
  reference_type: string | null
  reference_id: string | null
  is_read: boolean
  read_at: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface NotificationStats {
  total: number
  unread: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any>

/**
 * Get notifications for the current user
 */
export async function getNotifications(
  supabase: SupabaseClient<Database>,
  options: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
  } = {}
): Promise<{ notifications: Notification[]; stats: NotificationStats }> {
  const { limit = 20, offset = 0, unreadOnly = false } = options

  // Get user's business if they have one
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { notifications: [], stats: { total: 0, unread: 0 } }
  }

  // Build query
  let query = (supabase as AnySupabase)
    .from('notifications')
    .select('*', { count: 'exact' })
    .or(
      `user_id.eq.${user.id},business_id.in.(select id from businesses where owner_id = '${user.id}')`
    )
    .order('created_at', { ascending: false })

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching notifications:', error)
    return { notifications: [], stats: { total: 0, unread: 0 } }
  }

  // Get unread count separately
  const { count: unreadCount } = await (supabase as AnySupabase)
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .or(
      `user_id.eq.${user.id},business_id.in.(select id from businesses where owner_id = '${user.id}')`
    )
    .eq('is_read', false)

  return {
    notifications: (data as Notification[]) || [],
    stats: {
      total: count || 0,
      unread: unreadCount || 0,
    },
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(
  supabase: SupabaseClient<Database>,
  notificationId: string
): Promise<boolean> {
  const { error } = await (supabase as AnySupabase)
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId)

  return !error
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(supabase: SupabaseClient<Database>): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { error } = await (supabase as AnySupabase)
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .or(
      `user_id.eq.${user.id},business_id.in.(select id from businesses where owner_id = '${user.id}')`
    )
    .eq('is_read', false)

  return !error
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(supabase: SupabaseClient<Database>): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 0

  const { count } = await (supabase as AnySupabase)
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .or(
      `user_id.eq.${user.id},business_id.in.(select id from businesses where owner_id = '${user.id}')`
    )
    .eq('is_read', false)

  return count || 0
}

/**
 * Create a notification (for server-side use with service role)
 */
export async function createNotification(
  supabase: SupabaseClient<Database>,
  notification: {
    user_id?: string
    business_id?: string
    type: NotificationType
    title: string
    message: string
    reference_type?: string
    reference_id?: string
    metadata?: Record<string, unknown>
  }
): Promise<string | null> {
  const { data, error } = await (supabase as AnySupabase)
    .from('notifications')
    .insert({
      user_id: notification.user_id || null,
      business_id: notification.business_id || null,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      reference_type: notification.reference_type || null,
      reference_id: notification.reference_id || null,
      metadata: notification.metadata || {},
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return null
  }

  return data?.id || null
}

/**
 * Delete old read notifications (cleanup)
 */
export async function cleanupOldNotifications(
  supabase: SupabaseClient<Database>,
  daysOld: number = 30
): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const { data, error } = await (supabase as AnySupabase)
    .from('notifications')
    .delete()
    .eq('is_read', true)
    .lt('created_at', cutoffDate.toISOString())
    .select('id')

  if (error) {
    console.error('Error cleaning up notifications:', error)
    return 0
  }

  return data?.length || 0
}

/**
 * Get notification icon and color based on type
 */
export function getNotificationStyle(type: NotificationType): {
  icon: string
  color: string
  bgColor: string
} {
  const styles: Record<NotificationType, { icon: string; color: string; bgColor: string }> = {
    // Business owner notifications
    trial_expiring: {
      icon: 'clock',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    trial_expired: {
      icon: 'alert-circle',
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    subscription_expiring: {
      icon: 'clock',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    subscription_expired: {
      icon: 'alert-circle',
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    payment_approved: {
      icon: 'check-circle',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    payment_rejected: {
      icon: 'x-circle',
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    new_appointment: {
      icon: 'calendar',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    appointment_reminder: {
      icon: 'bell',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    appointment_cancelled: {
      icon: 'calendar-x',
      color: 'text-zinc-600',
      bgColor: 'bg-zinc-100 dark:bg-zinc-800',
    },
    // Admin notifications
    new_business: {
      icon: 'building',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    payment_pending: {
      icon: 'credit-card',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    trials_expiring_bulk: {
      icon: 'users',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    },
    system_alert: {
      icon: 'alert-triangle',
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  }

  return styles[type] || { icon: 'bell', color: 'text-zinc-600', bgColor: 'bg-zinc-100' }
}

/**
 * Format notification time relative to now
 */
export function formatNotificationTime(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `hace ${diffMins}m`
  if (diffHours < 24) return `hace ${diffHours}h`
  if (diffDays < 7) return `hace ${diffDays}d`

  return created.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })
}
