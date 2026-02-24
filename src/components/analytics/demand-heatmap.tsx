'use client'

/**
 * DemandHeatmap
 *
 * CSS grid heatmap showing appointment density by day-of-week and hour.
 * No external chart library — pure CSS grid with Tailwind intensity classes.
 *
 * Usage:
 * ```tsx
 * <DemandHeatmap
 *   cells={heatmapData.cells}
 *   maxCount={heatmapData.maxCount}
 *   operatingHours={heatmapData.operatingHours}
 *   promoRules={rules}
 * />
 *
 * // Compact variant (no legend, tighter padding — for use inside config pages)
 * <DemandHeatmap cells={cells} maxCount={max} operatingHours={hours} compact />
 * ```
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { PromoRule } from '@/types/promo'

// =====================================================
// Types
// =====================================================

export interface DemandHeatmapProps {
  cells: Array<{ day: number; hour: number; count: number }>
  maxCount: number
  operatingHours: Record<string, { open: string; close: string; enabled: boolean }> | null
  promoRules?: PromoRule[]
  compact?: boolean
}

// =====================================================
// Constants
// =====================================================

// Days ordered Mon–Sun (0=Mon…6=Sun in our grid display)
// PromoRule.days uses 0=Sun…6=Sat (JS convention), so we map accordingly.
const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Map grid column index (0=Mon) to JS day-of-week (0=Sun)
const GRID_COL_TO_JS_DOW: Record<number, number> = {
  0: 1, // Mon
  1: 2, // Tue
  2: 3, // Wed
  3: 4, // Thu
  4: 5, // Fri
  5: 6, // Sat
  6: 0, // Sun
}

const DAY_NAME_TO_GRID_COL: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
}

// =====================================================
// Helpers
// =====================================================

/**
 * Parse "HH:MM" or "H:MM" string → integer hour (0–23).
 * Returns fallback on parse failure.
 */
function parseHour(timeStr: string, fallback: number): number {
  if (!timeStr) return fallback
  const [h] = timeStr.split(':')
  const n = parseInt(h, 10)
  return isNaN(n) ? fallback : n
}

/**
 * Derive the displayed hour range from operatingHours.
 * Scans all ENABLED days and returns { minHour, maxHour }.
 * Falls back to 8–20 if no data.
 */
function getHourRange(
  operatingHours: Record<string, { open: string; close: string; enabled: boolean }> | null
): { minHour: number; maxHour: number } {
  if (!operatingHours) return { minHour: 8, maxHour: 20 }

  let min = 23
  let max = 0
  let foundAny = false

  for (const [, config] of Object.entries(operatingHours)) {
    if (!config || !config.enabled) continue
    foundAny = true
    const open = parseHour(config.open, 8)
    const close = parseHour(config.close, 20)
    if (open < min) min = open
    if (close > max) max = close
  }

  if (!foundAny) return { minHour: 8, maxHour: 20 }
  return { minHour: min, maxHour: Math.max(max, min + 1) }
}

/**
 * Returns the intensity bucket (0–4) for a cell count relative to maxCount.
 */
function intensityBucket(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0 || maxCount === 0) return 0
  const ratio = count / maxCount
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

/** Tailwind cell background classes indexed by bucket. */
const CELL_BG: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-zinc-100 dark:bg-zinc-800',
  1: 'bg-orange-100 dark:bg-orange-900/30',
  2: 'bg-orange-200 dark:bg-orange-800/40',
  3: 'bg-orange-400 dark:bg-orange-600/60',
  4: 'bg-orange-500 dark:bg-orange-500',
}

/**
 * Check whether any ENABLED promo rule covers a given (gridCol, hour) slot.
 * gridCol: 0=Mon…6=Sun. Rules use JS DOW (0=Sun…6=Sat).
 */
function cellHasPromo(rules: PromoRule[] | undefined, gridCol: number, hour: number): boolean {
  if (!rules || rules.length === 0) return false
  const jsDow = GRID_COL_TO_JS_DOW[gridCol]
  return rules.some(
    (r) => r.enabled && r.days.includes(jsDow) && hour >= r.start_hour && hour < r.end_hour
  )
}

// =====================================================
// Legend
// =====================================================

const LEGEND_ITEMS: Array<{ label: string; bucket: 0 | 1 | 2 | 3 | 4 }> = [
  { label: 'Ninguna', bucket: 0 },
  { label: 'Baja', bucket: 1 },
  { label: 'Media', bucket: 2 },
  { label: 'Alta', bucket: 3 },
  { label: 'Máx', bucket: 4 },
]

function Legend({ compact }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 flex-wrap', compact ? 'mt-2' : 'mt-4')}>
      <span className={cn('text-muted shrink-0', compact ? 'text-[10px]' : 'text-xs')}>
        Demanda:
      </span>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.bucket} className="flex items-center gap-1">
          <span
            className={cn(
              'rounded-sm block shrink-0',
              compact ? 'w-3 h-3' : 'w-4 h-4',
              CELL_BG[item.bucket]
            )}
            aria-hidden="true"
          />
          <span className={cn('text-muted', compact ? 'text-[10px]' : 'text-xs')}>
            {item.label}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-1">
        <span
          className={cn(
            'rounded-full block bg-emerald-500 shrink-0',
            compact ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
          aria-hidden="true"
        />
        <span className={cn('text-muted', compact ? 'text-[10px]' : 'text-xs')}>Promo activa</span>
      </div>
    </div>
  )
}

// =====================================================
// Main Component
// =====================================================

export function DemandHeatmap({
  cells,
  maxCount,
  operatingHours,
  promoRules,
  compact = false,
}: DemandHeatmapProps) {
  const { minHour, maxHour } = useMemo(() => getHourRange(operatingHours), [operatingHours])

  // Build lookup map: "day-hour" → count
  const cellMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const cell of cells) {
      map.set(`${cell.day}-${cell.hour}`, cell.count)
    }
    return map
  }, [cells])

  // Hours array for the rows
  const hours = useMemo(() => {
    const arr: number[] = []
    for (let h = minHour; h < maxHour; h++) {
      arr.push(h)
    }
    return arr
  }, [minHour, maxHour])

  // Responsive sizing tokens
  const cellSize = compact ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-6 h-6 sm:w-8 sm:h-8'
  const hourLabelWidth = compact ? 'w-6' : 'w-8'
  const labelTextSize = compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'
  const padding = compact ? 'p-3' : 'p-4 sm:p-5'

  return (
    <div
      className={cn('rounded-xl', padding)}
      role="img"
      aria-label="Mapa de calor de demanda por día y hora"
    >
      {/* Horizontal scroll on narrow screens */}
      <div className="overflow-x-auto -mx-4 px-4 sm:overflow-visible sm:mx-0 sm:px-0">
        <div style={{ minWidth: compact ? '280px' : '320px' }}>
          {/* Day labels row */}
          <div className="flex items-center mb-1.5">
            {/* Spacer for hour label column */}
            <div className={cn('shrink-0', hourLabelWidth)} aria-hidden="true" />
            {/* Day column headers */}
            <div className="flex gap-0.5 flex-1">
              {DAY_LABELS.map((label, colIdx) => {
                // Check if this day is enabled in operating hours
                const dayKey = Object.keys(DAY_NAME_TO_GRID_COL).find(
                  (k) => DAY_NAME_TO_GRID_COL[k] === colIdx
                )
                const isEnabled =
                  !operatingHours || !dayKey || operatingHours[dayKey]?.enabled !== false

                return (
                  <div
                    key={label}
                    className={cn(
                      'flex-1 text-center font-medium',
                      labelTextSize,
                      isEnabled ? 'text-zinc-700 dark:text-zinc-300' : 'text-muted'
                    )}
                    aria-label={label}
                  >
                    {label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Grid rows — one per hour */}
          <div className="flex flex-col gap-0.5" role="grid" aria-label="Celdas de demanda">
            {hours.map((hour) => (
              <div key={hour} className="flex items-center gap-0" role="row">
                {/* Hour label */}
                <div
                  className={cn(
                    'shrink-0 text-right pr-1.5 font-mono text-muted leading-none select-none',
                    labelTextSize,
                    hourLabelWidth
                  )}
                  aria-label={`${hour}:00`}
                >
                  {hour}
                </div>

                {/* 7 day cells */}
                <div className="flex gap-0.5 flex-1">
                  {Array.from({ length: 7 }, (_, colIdx) => {
                    const jsDow = GRID_COL_TO_JS_DOW[colIdx]
                    const count = cellMap.get(`${jsDow}-${hour}`) ?? 0
                    const bucket = intensityBucket(count, maxCount)
                    const hasPromo = cellHasPromo(promoRules, colIdx, hour)

                    // Check if this day/hour falls within operating hours
                    const dayKey = Object.keys(DAY_NAME_TO_GRID_COL).find(
                      (k) => DAY_NAME_TO_GRID_COL[k] === colIdx
                    )
                    const dayConfig = operatingHours && dayKey ? operatingHours[dayKey] : null
                    const isOutsideHours =
                      dayConfig &&
                      (dayConfig.enabled === false ||
                        hour < parseHour(dayConfig.open, 0) ||
                        hour >= parseHour(dayConfig.close, 24))

                    return (
                      <div
                        key={colIdx}
                        role="gridcell"
                        aria-label={`${DAY_LABELS[colIdx]} ${hour}:00 — ${count} citas${hasPromo ? ' · promo activa' : ''}`}
                        className={cn(
                          'flex-1 rounded-sm relative transition-opacity duration-150',
                          cellSize,
                          isOutsideHours
                            ? 'opacity-30 bg-zinc-100 dark:bg-zinc-800/50'
                            : CELL_BG[bucket]
                        )}
                      >
                        {/* Promo indicator dot */}
                        {hasPromo && !isOutsideHours && (
                          <span
                            className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* end min-width inner */}
      </div>
      {/* end overflow-x-auto scroll wrapper */}

      {/* Legend */}
      {!compact && <Legend compact={false} />}
      {compact && <Legend compact />}
    </div>
  )
}
