'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarPlus, ChevronLeft, ChevronRight, Clock3, Plus, UserPlus } from 'lucide-react'
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
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null)
  const plusBtnRef = useRef<HTMLButtonElement>(null)

  return (
    <>
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
                <Clock3 className="w-5 h-5 text-muted" />
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
          <div className="lg:hidden mb-3 rounded-2xl bg-transparent p-2.5 space-y-2">
            {/* Row 1: [< Date >] · [Hoy] [+] — nav group left, actions right */}
            <div className="flex items-center">
              {/* Nav group */}
              <Button
                variant="ghost"
                onClick={onPrevious}
                className="min-w-[44px] min-h-[44px] h-auto p-0 flex items-center justify-center text-muted flex-shrink-0"
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
                className="min-w-[44px] min-h-[44px] h-auto p-0 flex items-center justify-center text-muted flex-shrink-0"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              {/* Divider — separates navigation from actions */}
              <div className="w-px h-4 bg-zinc-200/70 dark:bg-zinc-700/60 mx-1.5 flex-shrink-0" />

              {/* Action cluster */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {!isSelectedDateToday && (
                  <Button
                    variant="ghost"
                    onClick={onToday}
                    className="min-h-[44px] h-auto px-2 text-xs font-semibold text-blue-600 dark:text-blue-400"
                    aria-label="Ir a hoy"
                  >
                    Hoy
                  </Button>
                )}
                <Button
                  ref={plusBtnRef}
                  variant="ghost"
                  onClick={() => {
                    if (plusBtnRef.current) {
                      const r = plusBtnRef.current.getBoundingClientRect()
                      setMenuPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
                    }
                    setIsActionSheetOpen(true)
                  }}
                  data-testid="create-appointment-btn-mobile"
                  className="min-w-[44px] min-h-[44px] h-auto p-0 flex items-center justify-center text-foreground"
                  aria-label="Crear cita"
                >
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                </Button>
              </div>
            </div>

            {/* Row 2: D/S/M segmented control */}
            <div className="flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-950 p-1">
              {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
                  aria-pressed={viewMode === mode}
                  className={`flex-1 min-h-[38px] rounded-lg border border-transparent text-xs font-semibold transition-colors ${
                    viewMode === mode
                      ? 'brand-tab-active'
                      : 'text-muted hover:bg-zinc-200 dark:hover:bg-zinc-900/70'
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
                  <div className="pt-1 border-t border-zinc-200 dark:border-zinc-800/40">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold text-foreground">
                        {projectedRevenueDisplay}
                      </span>
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

      {typeof window !== 'undefined' && menuPos &&
        createPortal(
          <AnimatePresence>
            {isActionSheetOpen && (
              <>
                <div
                  className="fixed inset-0 z-[200] lg:hidden"
                  onClick={() => setIsActionSheetOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  className="fixed z-[201] w-60 lg:hidden"
                  style={{
                    top: menuPos.top,
                    right: menuPos.right,
                    transformOrigin: 'top right',
                  }}
                >
                  {/* Caret pointing up toward + button */}
                  <div className="absolute -top-[7px] right-3 h-3.5 w-3.5 rotate-45 rounded-sm border-l border-t border-zinc-800/60 bg-zinc-900" />
                  {/* Card */}
                  <div className="relative mt-1 overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900 shadow-2xl">
                    <div className="px-2 py-2">
                      <button
                        onClick={() => { setIsActionSheetOpen(false); onCreateOpen() }}
                        className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors active:bg-zinc-800"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                          <CalendarPlus className="h-4 w-4 text-zinc-100" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Nueva cita</p>
                          <p className="text-xs text-zinc-400">Con fecha y hora</p>
                        </div>
                      </button>
                      <button
                        onClick={() => { setIsActionSheetOpen(false); onWalkInOpen() }}
                        className="flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors active:bg-zinc-800"
                      >
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                          <UserPlus className="h-4 w-4 text-zinc-100" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Walk-in</p>
                          <p className="text-xs text-zinc-400">Sin reserva, llegó ahora</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
