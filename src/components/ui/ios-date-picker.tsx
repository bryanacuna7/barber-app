'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { animations } from '@/lib/design-system'

interface IOSDatePickerProps {
  value: Date
  onChange: (value: Date) => void
  isOpen: boolean
  onClose: () => void
  title?: string
  minDate?: Date
  maxDate?: Date
  zIndex?: number
  forceMobile?: boolean
  forceDesktop?: boolean
}

// Spanish month names
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

// Spanish day abbreviations for calendar headers
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Hook to detect if should use mobile picker (based on screen width)
function useIsMobile() {
  const getIsMobile = () => {
    if (typeof window === 'undefined') return false
    return (
      window.innerWidth < 768 ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(hover: none)').matches
    )
  }

  const [isMobile, setIsMobile] = useState(getIsMobile)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(getIsMobile())
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

const ITEM_HEIGHT = 44 // Apple standard touch target

// Generate days for a given month/year
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function toDayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dateToTimestamp(date: Date): number {
  return toDayStart(date).getTime()
}

// Wheel column for mobile iOS-style picker
function WheelColumn({
  items,
  value,
  onChange,
}: {
  items: string[]
  value: string
  onChange: (value: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [, setIsDragging] = useState(false)
  const resolveIndex = useCallback(
    (candidate: string) => {
      if (items.length === 0) return -1
      const exactIndex = items.indexOf(candidate)
      if (exactIndex !== -1) return exactIndex

      const numeric = Number.parseInt(candidate, 10)
      if (!Number.isNaN(numeric)) {
        return Math.max(0, Math.min(items.length - 1, numeric - 1))
      }

      return 0
    },
    [items]
  )
  const selectedIndex = resolveIndex(value)

  const scrollToValue = useCallback(
    (val: string, smooth = true) => {
      const index = resolveIndex(val)
      if (index !== -1 && containerRef.current) {
        containerRef.current.scrollTo({
          top: index * ITEM_HEIGHT,
          behavior: smooth ? 'smooth' : 'auto',
        })
      }
    },
    [resolveIndex]
  )

  useEffect(() => {
    scrollToValue(value, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const index = Math.round(scrollTop / ITEM_HEIGHT)
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1))

    if (items[clampedIndex] !== value) {
      onChange(items[clampedIndex])
    }
  }, [items, value, onChange])

  const handleScrollEnd = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const index = Math.round(scrollTop / ITEM_HEIGHT)
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1))

    containerRef.current.scrollTo({
      top: clampedIndex * ITEM_HEIGHT,
      behavior: 'smooth',
    })

    onChange(items[clampedIndex])
  }, [items, onChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout
    let rafId: number | null = null

    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          handleScroll()
          rafId = null
        })
      }
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScrollEnd, 80)
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    container.addEventListener('scrollend', handleScrollEnd, {
      passive: true,
    } as AddEventListenerOptions)
    return () => {
      container.removeEventListener('scroll', onScroll)
      container.removeEventListener('scrollend', handleScrollEnd)
      if (rafId !== null) cancelAnimationFrame(rafId)
      clearTimeout(scrollTimeout)
    }
  }, [handleScroll, handleScrollEnd])

  return (
    <div
      className="relative h-[220px] flex-1 overflow-hidden touch-pan-y"
      style={{
        mask: 'linear-gradient(transparent, white 20%, white 80%, transparent)',
        WebkitMask: 'linear-gradient(transparent, white 20%, white 80%, transparent)',
      }}
    >
      <div
        ref={containerRef}
        className="h-full overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-hide snap-y snap-mandatory select-none touch-pan-y"
        style={{
          paddingTop: 88,
          paddingBottom: 88,
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
        }}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchCancel={() => setIsDragging(false)}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex
          const distance = selectedIndex === -1 ? 99 : Math.abs(index - selectedIndex)
          const direction = index - selectedIndex
          const rotateX = Math.max(-72, Math.min(72, direction * 18))
          const scale = Math.max(0.62, 1 - distance * 0.12)
          const opacity = Math.max(0.28, 1 - distance * 0.15)
          const translateZ = Math.max(0, 24 - distance * 8)
          return (
            <div
              key={item}
              className={cn(
                'flex h-[44px] items-center justify-center snap-center transition-[color,transform,opacity] duration-150',
                isSelected
                  ? 'text-[22px] font-semibold text-zinc-900 dark:text-zinc-100'
                  : 'text-[20px] font-medium text-zinc-400 dark:text-zinc-500'
              )}
              style={{
                transform: `perspective(320px) rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`,
                opacity,
                textShadow: isSelected ? undefined : 'none',
              }}
              onClick={() => {
                onChange(item)
                scrollToValue(item)
              }}
            >
              {item}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Desktop Date Picker - Calendar grid
function DesktopDatePicker({
  value,
  onChange,
  isOpen,
  onClose,
  title = 'Seleccionar fecha',
  minDate,
  maxDate,
  zIndex = 70,
}: IOSDatePickerProps) {
  const [viewDate, setViewDate] = useState(value)
  const popoverRef = useRef<HTMLDivElement>(null)
  const minDateTs = useMemo(() => (minDate ? dateToTimestamp(minDate) : null), [minDate])
  const maxDateTs = useMemo(() => (maxDate ? dateToTimestamp(maxDate) : null), [maxDate])
  const minMonthTs = useMemo(
    () => (minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), 1).getTime() : null),
    [minDate]
  )
  const maxMonthTs = useMemo(
    () => (maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), 1).getTime() : null),
    [maxDate]
  )

  // Sync view date when picker opens
  useEffect(() => {
    if (isOpen) {
      setViewDate(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const isDateDisabled = useCallback(
    (date: Date) => {
      const ts = dateToTimestamp(date)
      if (minDateTs !== null && ts < minDateTs) return true
      if (maxDateTs !== null && ts > maxDateTs) return true
      return false
    },
    [maxDateTs, minDateTs]
  )

  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return
    onChange(date)
    onClose()
  }

  const handlePreviousMonth = () => {
    const nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
    if (minMonthTs !== null && nextDate.getTime() < minMonthTs) return
    setViewDate(nextDate)
  }

  const handleNextMonth = () => {
    const nextDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    if (maxMonthTs !== null && nextDate.getTime() > maxMonthTs) return
    setViewDate(nextDate)
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = getDaysInMonth(year, month)
    const daysInPrevMonth = getDaysInMonth(year, month - 1)

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = []

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    // Next month days (fill to 42 total days - 6 weeks)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }, [viewDate])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isPrevMonthDisabled =
    minMonthTs !== null &&
    new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getTime() <= minMonthTs
  const isNextMonthDisabled =
    maxMonthTs !== null &&
    new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getTime() >= maxMonthTs

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            style={{ zIndex }}
            onClick={onClose}
          />

          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] rounded-2xl bg-white shadow-2xl shadow-black/20 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
            style={{ zIndex: zIndex + 1 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-700">
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                {title}
              </span>
              <div className="w-8" />
            </div>

            <div className="p-4">
              {/* Month/Year navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePreviousMonth}
                  disabled={isPrevMonthDisabled}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    isPrevMonthDisabled
                      ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button
                  onClick={handleNextMonth}
                  disabled={isNextMonthDisabled}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    isNextMonthDisabled
                      ? 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[11px] font-medium text-zinc-400 dark:text-zinc-500 h-8 flex items-center justify-center"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isDisabled = isDateDisabled(day.date)
                  const isToday =
                    day.date.getFullYear() === today.getFullYear() &&
                    day.date.getMonth() === today.getMonth() &&
                    day.date.getDate() === today.getDate()

                  const isSelected =
                    day.date.getFullYear() === value.getFullYear() &&
                    day.date.getMonth() === value.getMonth() &&
                    day.date.getDate() === value.getDate()

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectDate(day.date)}
                      disabled={isDisabled}
                      className={cn(
                        'h-9 rounded-lg text-[14px] font-medium transition-colors',
                        isDisabled && 'cursor-not-allowed opacity-40',
                        !day.isCurrentMonth && 'text-zinc-300 dark:text-zinc-600',
                        day.isCurrentMonth &&
                          !isToday &&
                          !isSelected &&
                          !isDisabled &&
                          'text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700',
                        isToday &&
                          !isSelected &&
                          !isDisabled &&
                          'text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30',
                        isSelected &&
                          'bg-blue-600 dark:bg-blue-500 text-white font-bold hover:bg-blue-700 dark:hover:bg-blue-600'
                      )}
                    >
                      {day.date.getDate()}
                    </button>
                  )
                })}
              </div>

              {/* Quick actions */}
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectDate(new Date())}
                  className="flex-1 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                >
                  Hoy
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Mobile Date Picker - iOS wheel style with bottom sheet
function MobileDatePicker({
  value,
  onChange,
  isOpen,
  onClose,
  title = 'Seleccionar fecha',
  minDate,
  maxDate,
  zIndex = 70,
}: IOSDatePickerProps) {
  const minDay = useMemo(() => (minDate ? toDayStart(minDate) : null), [minDate])
  const maxDay = useMemo(() => (maxDate ? toDayStart(maxDate) : null), [maxDate])

  const clampDateToRange = useCallback(
    (date: Date) => {
      const candidate = toDayStart(date)
      if (minDay && candidate < minDay) return minDay
      if (maxDay && candidate > maxDay) return maxDay
      return candidate
    },
    [maxDay, minDay]
  )

  const [tempDay, setTempDay] = useState(value.getDate().toString())
  const [tempMonth, setTempMonth] = useState(MONTHS[value.getMonth()])
  const [tempYear, setTempYear] = useState(value.getFullYear().toString())
  const [wheelKey, setWheelKey] = useState(0)

  // Sync temp values when picker opens
  useEffect(() => {
    if (isOpen) {
      const nextDate = clampDateToRange(value)
      setTempDay(nextDate.getDate().toString())
      setTempMonth(MONTHS[nextDate.getMonth()])
      setTempYear(nextDate.getFullYear().toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, clampDateToRange])

  const availableMonths = useMemo(() => MONTHS, [])

  // Generate days based on selected month/year
  const days = useMemo(() => {
    const monthIndex = MONTHS.indexOf(tempMonth)
    if (monthIndex < 0) return ['1']
    const year = parseInt(tempYear, 10)
    const daysInMonth = getDaysInMonth(year, monthIndex)
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString())
  }, [tempMonth, tempYear])

  // Adjust day if out of bounds for selected month/year.
  useEffect(() => {
    if (days.length === 0) return

    const dayNum = parseInt(tempDay, 10)
    const firstDay = parseInt(days[0], 10)
    const lastDay = parseInt(days[days.length - 1], 10)

    if (Number.isNaN(dayNum) || dayNum < firstDay) {
      setTempDay(firstDay.toString())
      return
    }

    if (dayNum > lastDay) {
      setTempDay(lastDay.toString())
    }
  }, [days, tempDay])

  const handleConfirm = () => {
    const dayNum = parseInt(tempDay, 10)
    const monthIndex = MONTHS.indexOf(tempMonth)
    const year = parseInt(tempYear, 10)

    const newDate = clampDateToRange(new Date(year, monthIndex, dayNum))
    onChange(newDate)
    onClose()
  }

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/55 backdrop-blur-[2px]"
            style={{ zIndex }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={animations.spring.sheet}
            className="fixed inset-x-0 bottom-0 mx-auto max-h-[78vh] w-[calc(100%-0.75rem)] max-w-md overflow-y-auto rounded-[26px] bg-white dark:bg-zinc-900/98 shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_26px_64px_rgba(0,0,0,0.65)]"
            style={{ zIndex: zIndex + 1 }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-500/80" />
            </div>

            <div className="flex items-center justify-between px-4 pb-4">
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400 active:bg-zinc-100 dark:active:bg-zinc-800/70"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </span>
              <button
                onClick={handleConfirm}
                className="flex h-11 w-11 items-center justify-center rounded-full text-blue-500 dark:text-[#5ab0ff] active:bg-blue-50 dark:active:bg-blue-950/60"
              >
                <Check className="h-5 w-5" />
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="relative mx-auto flex h-[220px] items-center justify-center gap-1 px-1">
                <div className="pointer-events-none absolute inset-x-3 top-1/2 h-[44px] -translate-y-1/2 rounded-xl bg-zinc-100/80 dark:bg-white/8" />
                <WheelColumn
                  key={`day-${wheelKey}`}
                  items={days}
                  value={tempDay}
                  onChange={setTempDay}
                />
                <WheelColumn
                  key={`month-${wheelKey}`}
                  items={availableMonths}
                  value={tempMonth}
                  onChange={setTempMonth}
                />
              </div>
            </div>

            {/* Quick shortcut */}
            <div className="px-4 pb-4 pt-0 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const today = clampDateToRange(new Date())
                  setTempDay(today.getDate().toString())
                  setTempMonth(MONTHS[today.getMonth()])
                  setTempYear(today.getFullYear().toString())
                  setWheelKey((k) => k + 1)
                }}
                className="w-full h-[44px] rounded-xl bg-zinc-100 dark:bg-white/8 text-[15px] font-medium text-zinc-600 dark:text-zinc-300 active:bg-zinc-200 dark:active:bg-white/14 transition-colors"
              >
                Hoy
              </button>
            </div>
            <div className="h-safe-area-inset-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}

// Main export - automatically chooses between mobile and desktop variants
export function IOSDatePicker(props: IOSDatePickerProps) {
  const isMobile = useIsMobile()
  const shouldUseMobile = props.forceDesktop ? false : props.forceMobile || isMobile

  if (shouldUseMobile) {
    return <MobileDatePicker {...props} />
  }

  return <DesktopDatePicker {...props} />
}

// Trigger button for opening the date picker
interface DatePickerTriggerProps {
  value: Date
  onChange: (date: Date) => void
  label?: string
  className?: string
  pickerZIndex?: number
  minDate?: Date
  maxDate?: Date
  forceMobile?: boolean
  forceDesktop?: boolean
}

export function DatePickerTrigger({
  value,
  onChange,
  label,
  className,
  pickerZIndex = 70,
  minDate,
  maxDate,
  forceMobile,
  forceDesktop,
}: DatePickerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Compact format: "6 Feb" (Spanish)
  const formattedDate = useMemo(() => {
    const monthAbbrev = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ]

    const date = value.getDate()
    const month = monthAbbrev[value.getMonth()]
    return `${date} ${month}`
  }, [value])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex h-11 min-w-0 items-center justify-center rounded-xl border px-3 gap-2',
          'border-zinc-700/80 bg-zinc-900/85',
          'text-[15px] font-medium text-zinc-100',
          'active:scale-95 transition-[transform,background-color,border-color] duration-150',
          'hover:bg-zinc-900',
          'focus:outline-none focus:ring-2 focus:ring-[#007AFF]/40',
          className
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-zinc-400" />
        <span className="min-w-0 truncate whitespace-nowrap text-left">{formattedDate}</span>
      </button>

      <IOSDatePicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        value={value}
        onChange={onChange}
        title={label || 'Seleccionar fecha'}
        minDate={minDate}
        maxDate={maxDate}
        zIndex={pickerZIndex}
        forceMobile={forceMobile}
        forceDesktop={forceDesktop}
      />
    </>
  )
}
