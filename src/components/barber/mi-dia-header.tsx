'use client'

import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { anchorDateToNoon } from '@/lib/utils/timezone'

interface MiDiaHeaderProps {
  barberName: string
  date: string
  completedCount: number
  totalCount: number
  canCreateCitas?: boolean
  onWalkIn?: () => void
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/**
 * Compact sticky header for Mi Dia — Mock E style.
 * Row 1: "Mi Dia" + date | progress counter (3/8) + "+" walk-in button
 * Row 2: thin progress bar (3px)
 */
export function MiDiaHeader({
  barberName,
  date,
  completedCount,
  totalCount,
  canCreateCitas,
  onWalkIn,
  className,
}: MiDiaHeaderProps) {
  const formattedDate = dateFormatter.format(anchorDateToNoon(date))
  const progress = totalCount > 0 ? completedCount / totalCount : 0

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl',
        'border-b border-zinc-200/60 dark:border-zinc-800/60',
        className
      )}
      data-testid="mi-dia-header"
    >
      <div className="container mx-auto max-w-4xl px-4 py-3 lg:py-4">
        {/* Row 1: Title + actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg lg:text-xl font-bold text-zinc-900 dark:text-white leading-tight truncate">
              Mi Dia
            </h1>
            <p className="text-xs lg:text-sm text-muted capitalize truncate mt-0.5">
              {barberName} &middot; {formattedDate}
            </p>
          </div>

          <div className="flex items-center gap-2.5 lg:gap-3 shrink-0">
            {/* Progress counter */}
            <span
              className="text-sm lg:text-base font-semibold tabular-nums text-zinc-900 dark:text-white"
              aria-label={`${completedCount} de ${totalCount} completadas`}
            >
              {completedCount}/{totalCount}
            </span>

            {/* Walk-in button: icon on mobile, label on desktop */}
            {canCreateCitas && onWalkIn && (
              <button
                onClick={onWalkIn}
                className={cn(
                  'flex items-center justify-center rounded-full',
                  'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900',
                  'active:scale-95 lg:hover:opacity-90 transition-all',
                  'w-8 h-8 lg:w-auto lg:h-9 lg:rounded-lg lg:px-3.5 lg:gap-1.5'
                )}
                aria-label="Agregar walk-in"
                data-testid="header-walk-in-button"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden lg:inline text-sm font-medium">Walk-in</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Progress bar */}
        {totalCount > 0 && (
          <div className="mt-2.5 h-[3px] rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </header>
  )
}
