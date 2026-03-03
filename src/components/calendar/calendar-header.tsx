'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ViewMode = 'day' | 'week' | 'month'

interface CalendarHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onCreateOpen: () => void
  onWalkInOpen: () => void
  isSelectedDateToday: boolean
  desktopContextLabel: string
  mobileDateLabel: string
  mobileDateLabelCompact: string
  jumpToCurrentLabel: string
  projectedRevenueDisplay: string
  mobileProjectionAppointmentsLabel: string
  projectionWindowLabel: string
  goalProgress: number
  appointmentCount: number
}

/**
 * useScrolled — returns true once the page has scrolled past `threshold` px.
 * Self-contained so CalendarHeader needs no scroll-related props.
 */
function useScrolled(threshold = 64) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    handler() // sync on mount
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])

  return scrolled
}

export function CalendarHeader({
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
  onCreateOpen,
  onWalkInOpen,
  isSelectedDateToday,
  desktopContextLabel,
  mobileDateLabel,
  mobileDateLabelCompact,
  jumpToCurrentLabel,
  projectedRevenueDisplay,
  mobileProjectionAppointmentsLabel,
  projectionWindowLabel,
  goalProgress,
  appointmentCount,
}: CalendarHeaderProps) {
  const scrolled = useScrolled()

  return (
    <header className="sticky top-0 z-40 bg-transparent backdrop-blur-sm border-b border-transparent dark:border-white/5">
      <div className="px-0 lg:px-6 py-4">
        {/* DESKTOP HEADER - Single row layout */}
        <div className="hidden lg:flex items-center justify-between mb-4 gap-2">
          <div className="text-sm font-medium text-muted min-w-0 flex-shrink-0">
            {desktopContextLabel}
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-zinc-700 text-foreground shadow-sm'
                    : 'text-muted hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onPrevious}
              className="p-1 h-auto hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-muted" />
            </Button>
            <Button
              variant="ghost"
              onClick={onToday}
              className="px-3 py-1 h-auto text-sm font-medium text-red-500 dark:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
              aria-label={`Ir a ${jumpToCurrentLabel.toLowerCase()}`}
            >
              {jumpToCurrentLabel}
            </Button>
            <Button
              variant="ghost"
              onClick={onNext}
              className="p-1 h-auto hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 text-muted" />
            </Button>
            <Button
              onClick={onWalkInOpen}
              data-testid="walk-in-btn-desktop"
              variant="ghost"
              className="min-w-[44px] min-h-[44px] w-10 h-10 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
              aria-label="Agregar walk-in"
            >
              <UserPlus className="w-5 h-5 text-amber-500" />
            </Button>
            <Button
              onClick={onCreateOpen}
              data-testid="create-appointment-btn-desktop"
              variant="cta"
              className="min-w-[44px] min-h-[44px] w-10 h-10 p-2 rounded-xl"
              aria-label="Crear cita"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="lg:hidden mb-3 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_30px_rgba(0,0,0,0.35)] p-2.5 space-y-2">
          {/* Row 1: < Date > [Hoy] [Walk-in] [+] */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={onPrevious}
              className="min-w-[44px] min-h-[44px] h-auto p-0 flex items-center justify-center text-muted"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 text-center min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">
                <span className="hidden min-[390px]:inline">{mobileDateLabel}</span>
                <span className="min-[390px]:hidden">{mobileDateLabelCompact}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onNext}
              className="min-w-[44px] min-h-[44px] h-auto p-0 flex items-center justify-center text-muted"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            {!isSelectedDateToday && (
              <Button
                variant="ghost"
                onClick={onToday}
                className="min-h-[44px] h-auto px-2 text-xs font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0"
                aria-label="Ir a hoy"
              >
                Hoy
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={onWalkInOpen}
              data-testid="walk-in-btn-mobile"
              className="min-w-[44px] min-h-[44px] h-10 w-10 rounded-xl p-0 flex-shrink-0"
              aria-label="Agregar walk-in"
            >
              <UserPlus className="h-5 w-5 text-amber-500" />
            </Button>
            {/* Citas exception: icon-first CTAs to preserve calendar scan speed on mobile */}
            <Button
              variant="cta"
              onClick={onCreateOpen}
              data-testid="create-appointment-btn-mobile"
              className="min-w-[44px] min-h-[44px] h-10 w-10 rounded-xl p-0 flex-shrink-0"
              aria-label="Crear cita"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Row 2: D/S/M segmented control */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/60 dark:bg-white/[0.04] p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => onViewModeChange(mode)}
                aria-pressed={viewMode === mode}
                className={`flex-1 min-h-[38px] rounded-lg border border-transparent text-xs font-semibold transition-colors ${
                  viewMode === mode
                    ? 'brand-tab-active'
                    : 'text-muted hover:bg-zinc-100/80 dark:hover:bg-white/10'
                }`}
              >
                {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          {/* Row 3: Revenue stats — collapses on scroll to reclaim screen space */}
          <AnimatePresence initial={false}>
            {!scrolled && (
              <motion.div
                key="revenue-row"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div className="pt-1 border-t border-zinc-200/70 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-foreground">{projectedRevenueDisplay}</span>
                    <span className="text-muted">{mobileProjectionAppointmentsLabel}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Revenue stats - Desktop expanded */}
        <div className="hidden lg:flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted">Proyección {projectionWindowLabel}:</span>
            <span className="font-bold text-amber-500 dark:text-amber-500">
              {projectedRevenueDisplay}
            </span>
          </div>
          {viewMode === 'day' && (
            <div className="flex-1 max-w-xs">
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalProgress}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 dark:from-amber-500 dark:to-red-500"
                />
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-muted">{appointmentCount} citas</span>
          </div>
        </div>
      </div>
    </header>
  )
}
