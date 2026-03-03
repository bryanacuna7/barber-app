'use client'

import { useState, useEffect, startTransition } from 'react'
import { Smartphone } from 'lucide-react'

/**
 * Shows a sticky banner when the user is on iOS in browser mode (not standalone).
 * This typically happens after Google OAuth redirects back to Safari instead of the PWA.
 * Dismissed state persists only for the session (sessionStorage).
 */
export function OpenInAppBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Only show on iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    if (!isIOS) return

    // Only show when NOT in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as Record<string, unknown>).standalone === true
    if (isStandalone) return

    // Only show if not dismissed this session
    const dismissed = sessionStorage.getItem('open_in_app_dismissed')
    if (dismissed) return

    startTransition(() => setShow(true))
  }, [])

  if (!show) return null

  const handleDismiss = () => {
    sessionStorage.setItem('open_in_app_dismissed', '1')
    setShow(false)
  }

  return (
    /* z-[60] sits above BottomNav pill (z-50). Bottom clears the floating nav (~72px) + safe area. */
    <div
      className="fixed left-0 right-0 z-[60] lg:hidden"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)' }}
    >
      <div className="mx-3 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
          <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
          Para mejor experiencia,{' '}
          <strong className="text-zinc-900 dark:text-white">
            abrí desde tu pantalla de inicio
          </strong>
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500"
        >
          OK
        </button>
      </div>
    </div>
  )
}
