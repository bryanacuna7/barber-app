'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, ChevronLeft, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useClientContext } from '@/contexts/client-context'
import { formatNotificationTime } from '@/lib/notifications'

interface ClientNotification {
  id: string
  type: 'smart_promo_offer'
  title: string
  message: string
  is_read: boolean
  created_at: string
  metadata?: {
    url?: string
  } | null
}

export default function ClientNotificationsPage() {
  const router = useRouter()
  const { businessId } = useClientContext()
  const [notifications, setNotifications] = useState<ClientNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const unread = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications])

  const fetchNotifications = useCallback(async () => {
    if (!businessId) return

    try {
      const res = await fetch(`/api/client/notifications?business_id=${businessId}&limit=50`, {
        cache: 'no-store',
      })

      if (!res.ok) {
        setNotifications([])
        return
      }

      const data = await res.json()
      setNotifications((data.notifications || []) as ClientNotification[])
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/client/notifications/${notificationId}`, { method: 'PATCH' })
      if (!res.ok) return
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
    } catch {
      // no-op
    }
  }

  const markAllAsRead = async () => {
    if (!businessId || unread === 0) return

    setMarkingAll(true)
    try {
      const res = await fetch(`/api/client/notifications?business_id=${businessId}`, {
        method: 'PATCH',
      })
      if (!res.ok) return
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="px-4 pt-safe-offset-4 pt-12 pb-24">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-start gap-1">
          <button
            onClick={() => router.push('/mi-cuenta')}
            className="flex items-center justify-center -ml-2 mt-0.5 h-10 w-10 rounded-xl text-zinc-500 dark:text-zinc-400 ios-press"
            aria-label="Volver al inicio"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Notificaciones</h1>
            <p className="text-muted text-sm mt-0.5">Promociones inteligentes y ofertas activas</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          disabled={markingAll || unread === 0}
        >
          <CheckCheck className="h-4 w-4 mr-1.5" />
          Leídas
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 text-sm text-muted">
          Cargando notificaciones...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
          <Bell className="h-8 w-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">Todavía no tenés notificaciones</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const bookingUrl = notification.metadata?.url
            return (
              <article
                key={notification.id}
                className={`rounded-2xl border p-4 ${
                  notification.is_read
                    ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                    : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                      <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {notification.title}
                      </h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted mt-2">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <button
                      className="text-xs text-emerald-700 dark:text-emerald-400 font-medium hover:underline shrink-0"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Marcar leída
                    </button>
                  )}
                </div>

                {bookingUrl && (
                  <div className="mt-3 pt-3 border-t border-zinc-200/70 dark:border-zinc-700/70">
                    <Link
                      href={bookingUrl}
                      className="inline-flex items-center text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Reservar con descuento
                    </Link>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
