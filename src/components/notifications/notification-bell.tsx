'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  CreditCard,
  AlertCircle,
  Clock,
  Building,
  Users,
  AlertTriangle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNotificationTime, type NotificationType } from '@/lib/notifications'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  created_at: string
  reference_type: string | null
  reference_id: string | null
}

interface NotificationStats {
  total: number
  unread: number
}

const notificationIcons: Record<string, React.ElementType> = {
  trial_expiring: Clock,
  trial_expired: AlertCircle,
  subscription_expiring: Clock,
  subscription_expired: AlertCircle,
  payment_approved: Check,
  payment_rejected: X,
  new_appointment: Calendar,
  appointment_reminder: Bell,
  appointment_cancelled: Calendar,
  new_business: Building,
  payment_pending: CreditCard,
  trials_expiring_bulk: Users,
  system_alert: AlertTriangle,
}

const notificationColors: Record<string, { icon: string; bg: string }> = {
  trial_expiring: { icon: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  trial_expired: { icon: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  subscription_expiring: { icon: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  subscription_expired: { icon: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  payment_approved: { icon: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  payment_rejected: { icon: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  new_appointment: { icon: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  appointment_reminder: { icon: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  appointment_cancelled: { icon: 'text-zinc-600', bg: 'bg-zinc-100 dark:bg-zinc-800' },
  new_business: { icon: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  payment_pending: { icon: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  trials_expiring_bulk: { icon: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  system_alert: { icon: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  // Hydration-safe: Only render portal on client
  const [mounted, setMounted] = useState(typeof window !== 'undefined')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Ensure mounted state is set after hydration - valid pattern for SSR + portals
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mounted) setMounted(true)
  }, [mounted])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=10')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setStats(data.stats || { total: 0, unread: 0 })
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      // Check if click is outside both the button and dropdown
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Update position when window resizes
  useEffect(() => {
    function updatePosition() {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect()
        const dropdownWidth = 384 // sm:w-96 = 24rem = 384px

        // Calculate left position - prefer aligning to right of button, but ensure it fits
        let left = rect.right - dropdownWidth
        if (left < 16) {
          left = 16 // Minimum margin from left edge
        }

        setDropdownPosition({
          top: rect.bottom + 8,
          left,
        })
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 384

      let left = rect.right - dropdownWidth
      if (left < 16) {
        left = 16
      }

      setDropdownPosition({
        top: rect.bottom + 8,
        left,
      })
      fetchNotifications()
    }
    setIsOpen(!isOpen)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        )
        setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setStats((prev) => ({ ...prev, unread: 0 }))
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
    setIsLoading(false)
  }

  const dropdown =
    isOpen && mounted ? (
      <div
        ref={dropdownRef}
        className="fixed z-[9999] w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-800 sm:w-96"
        style={{
          top: dropdownPosition.top,
          left: dropdownPosition.left,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Notificaciones</h3>
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={isLoading}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 dark:text-blue-400"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell
                const colors = notificationColors[notification.type] || {
                  icon: 'text-zinc-600',
                  bg: 'bg-zinc-100',
                }

                return (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id)
                      }
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/50',
                      !notification.is_read && 'bg-blue-50/50 dark:bg-blue-900/10'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
                        colors.bg
                      )}
                    >
                      <Icon className={cn('h-4 w-4', colors.icon)} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            notification.is_read
                              ? 'text-zinc-600 dark:text-zinc-400'
                              : 'text-zinc-900 dark:text-white'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {stats.total > 10 && (
          <div className="border-t border-zinc-200 px-4 py-2 dark:border-zinc-700">
            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              Mostrando 10 de {stats.total} notificaciones
            </p>
          </div>
        )}
      </div>
    ) : null

  return (
    <>
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-white"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {stats.unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {stats.unread > 9 ? '9+' : stats.unread}
          </span>
        )}
      </button>

      {/* Portal dropdown to body */}
      {mounted && createPortal(dropdown, document.body)}
    </>
  )
}
