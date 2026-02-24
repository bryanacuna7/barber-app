'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

export function ClientNotificationBell({ businessId }: { businessId: string }) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    async function load() {
      if (!businessId) return
      try {
        const res = await fetch(`/api/client/notifications?business_id=${businessId}&limit=1`, {
          cache: 'no-store',
        })

        if (!res.ok) return
        const data = await res.json()
        setUnread(data?.stats?.unread || 0)
      } catch {
        // Silent fail: no badge
      }
    }

    void load()
    const interval = setInterval(() => void load(), 30000)
    return () => clearInterval(interval)
  }, [businessId])

  return (
    <Link
      href="/mi-cuenta/notificaciones"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      aria-label="Notificaciones"
    >
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] leading-5 text-center font-semibold">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  )
}
