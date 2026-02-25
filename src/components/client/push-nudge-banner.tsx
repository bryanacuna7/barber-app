'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { usePushSubscription } from '@/hooks/use-push-subscription'

interface PushNudgeBannerProps {
  /** 'booking' shows after booking confirmation, 'dashboard' shows on client home */
  variant?: 'booking' | 'dashboard'
}

const DISMISS_KEY = 'push-nudge-dismissed'

function getInitialDismissed(variant: string): boolean {
  if (typeof window === 'undefined') return true // SSR: start hidden
  if (variant !== 'dashboard') return false
  const stored = localStorage.getItem(DISMISS_KEY)
  if (!stored) return false
  return Date.now() - Number(stored) < 7 * 24 * 60 * 60 * 1000
}

export function PushNudgeBanner({ variant = 'dashboard' }: PushNudgeBannerProps) {
  const { isSupported, permission, isSubscribed, subscribe, loading } = usePushSubscription()
  const [dismissed, setDismissed] = useState(() => getInitialDismissed(variant))

  // Don't show if: unsupported, already subscribed, permission blocked, or dismissed
  if (!isSupported || isSubscribed || permission === 'denied' || dismissed) return null

  const handleEnable = async () => {
    const ok = await subscribe()
    if (ok) setDismissed(true)
  }

  const handleDismiss = () => {
    setDismissed(true)
    if (variant === 'dashboard') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    }
  }

  if (variant === 'booking') {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 shrink-0">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-blue-900 dark:text-blue-100">
              No pierdas tu cita
            </p>
            <p className="mt-0.5 text-[13px] text-blue-700 dark:text-blue-300">
              Activa las notificaciones y te avisamos 1 hora antes
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleEnable}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[15px] font-semibold text-white ios-press disabled:opacity-60"
          >
            <Bell className="h-4 w-4" />
            {loading ? 'Activando...' : 'Activar'}
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-xl px-4 py-3 text-[15px] font-medium text-blue-600 dark:text-blue-400 ios-press"
          >
            Ahora no
          </button>
        </div>
      </div>
    )
  }

  // Dashboard variant — compact with dismiss
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 shrink-0">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-blue-900 dark:text-blue-100">
            Activa las notificaciones
          </p>
          <p className="mt-0.5 text-[13px] text-blue-700 dark:text-blue-300">
            Recordatorios de citas y ofertas exclusivas
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-[13px] font-semibold text-white ios-press disabled:opacity-60"
            >
              {loading ? 'Activando...' : 'Habilitar'}
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-blue-500 dark:text-blue-400 ios-press"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
