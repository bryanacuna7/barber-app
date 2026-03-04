'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarPlus, ChevronLeft, ChevronRight, Clock3, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  QuickActionsPopover,
  type PopoverAnchorRect,
} from '@/components/dashboard/quick-actions-popover'

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
  projectionWindowLabel: string
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
  projectionWindowLabel,
  appointmentCount,
}: CalendarHeaderProps) {
  const scrolled = useScrolled()
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false)
  const [actionAnchorRect, setActionAnchorRect] = useState<PopoverAnchorRect | null>(null)
  const plusBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isActionSheetOpen) return

    const updateAnchor = () => {
      if (!plusBtnRef.current) return
      const rect = plusBtnRef.current.getBoundingClientRect()
      setActionAnchorRect({
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      })
    }

    updateAnchor()
    window.addEventListener('resize', updateAnchor)
    window.addEventListener('scroll', updateAnchor, true)
    return () => {
      window.removeEventListener('resize', updateAnchor)
      window.removeEventListener('scroll', updateAnchor, true)
    }
  }, [isActionSheetOpen])

  return (
    <>
      <header className="sticky top-0 z-40 bg-transparent backdrop-blur-sm border-b border-transparent dark:border-white/5">
        <div className="px-0 lg:px-6 py-2.5 lg:py-4">
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
          <div className="lg:hidden mb-1 rounded-2xl bg-transparent p-2.5 space-y-2">
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
                    if (isActionSheetOpen) {
                      setIsActionSheetOpen(false)
                      return
                    }

                    if (plusBtnRef.current) {
                      const rect = plusBtnRef.current.getBoundingClientRect()
                      setActionAnchorRect({
                        top: rect.top,
                        right: rect.right,
                        bottom: rect.bottom,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                      })
                    }
                    setIsActionSheetOpen(true)
                  }}
                  data-testid="create-appointment-btn-mobile"
                  className="min-w-[44px] min-h-[44px] h-auto p-0 flex items-center justify-center text-foreground"
                  aria-label="Crear cita"
                  aria-haspopup="dialog"
                  aria-expanded={isActionSheetOpen}
                >
                  <motion.span
                    animate={{
                      rotate: isActionSheetOpen ? 45 : 0,
                      scale: isActionSheetOpen ? 1.08 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    className="inline-flex"
                  >
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                  </motion.span>
                </Button>
              </div>
            </div>

            {/* Row 2: D/S/M segmented control with sliding thumb */}
            <div className="relative flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-950 p-1">
              {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
                  aria-pressed={viewMode === mode}
                  className="relative z-10 flex-1 min-h-[40px] rounded-lg text-xs font-semibold transition-colors"
                  style={{ color: viewMode === mode ? undefined : undefined }}
                >
                  {viewMode === mode && (
                    <motion.div
                      layoutId="citas-view-thumb"
                      className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-zinc-800"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${viewMode === mode ? 'text-foreground' : 'text-muted'}`}
                  >
                    {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}
                  </span>
                </button>
              ))}
            </div>

            {/* Row 3: KPI summary — compact single line, collapses on scroll */}
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
                  <p className="text-[13px] tabular-nums text-muted text-center pt-0.5">
                    <span className="font-semibold text-foreground">{projectedRevenueDisplay}</span>{' '}
                    proy.
                    <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">·</span>
                    <span className="font-semibold text-foreground">{appointmentCount}</span>{' '}
                    {appointmentCount === 1 ? 'cita' : 'citas'}
                  </p>
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
            <div className="flex items-center gap-2">
              <span className="text-muted">{appointmentCount} citas</span>
            </div>
          </div>
        </div>
      </header>

      <QuickActionsPopover
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        anchorRect={actionAnchorRect}
        actions={[
          {
            id: 'create-appointment',
            label: 'Nueva cita',
            description: 'Con fecha y hora',
            icon: CalendarPlus,
            onSelect: onCreateOpen,
          },
          {
            id: 'walk-in',
            label: 'Walk-in',
            description: 'Sin reserva, llegó ahora',
            icon: Clock3,
            onSelect: onWalkInOpen,
          },
        ]}
      />
    </>
  )
}
