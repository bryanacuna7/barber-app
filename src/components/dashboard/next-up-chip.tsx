'use client'

/**
 * NextUpChip — Spotify mini-player inspired contextual chip.
 *
 * Shows above the bottom nav bar ONLY when:
 *  1. The user is NOT on /citas (they already see all appointments there)
 *  2. The next appointment is within 60 minutes
 *
 * Tapping navigates to /citas.
 * Auto-dismisses when the appointment time passes.
 */

import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronRight } from 'lucide-react'
import { useBusiness } from '@/contexts/business-context'
import { useTodayStats } from '@/hooks/queries/useTodayStats'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'

export function NextUpChip() {
  const pathname = usePathname()
  const router = useRouter()
  const { businessId } = useBusiness()
  const { data } = useTodayStats(businessId)

  // Don't show on /citas — user already has the full calendar
  const isOnCitas = pathname?.startsWith('/citas') || pathname?.startsWith('/mi-dia')

  const nextUp = data?.nextUp
  const shouldShow = !isOnCitas && !!nextUp

  const handleTap = () => {
    if (isMobileDevice()) haptics.tap()
    router.push('/citas')
  }

  const urgencyLabel =
    nextUp?.minutesUntil === 0
      ? 'Ahora'
      : nextUp?.minutesUntil === 1
        ? 'En 1 min'
        : `En ${nextUp?.minutesUntil} min`

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.7 }}
          // Sits just above the floating pill nav (which is ~72px from bottom + safe area)
          className="fixed bottom-[76px] left-4 right-4 z-40 mx-auto max-w-[calc(95%-2rem)] lg:hidden"
          style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 12px) + 8px)' }}
        >
          <button
            onClick={handleTap}
            className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white/90 px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl transition-all active:scale-[0.98] dark:border-zinc-800/70 dark:bg-zinc-900/90 dark:shadow-[0_4px_20px_rgba(0,0,0,0.30)]"
          >
            {/* Pulsing dot */}
            <div className="relative flex-shrink-0">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              />
              <div
                className="absolute inset-0 animate-ping rounded-full opacity-60"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-[13px] font-semibold text-zinc-900 dark:text-white">
                {nextUp?.clientName} · {nextUp?.serviceName}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted" />
                <span className="text-[11px] font-medium text-muted">
                  {urgencyLabel} · {nextUp?.timeLabel}
                </span>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
