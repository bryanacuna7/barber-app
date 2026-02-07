'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
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
  const [isDragging, setIsDragging] = useState(false)

  const scrollToValue = useCallback(
    (val: string, smooth = true) => {
      const index = items.indexOf(val)
      if (index !== -1 && containerRef.current) {
        containerRef.current.scrollTo({
          top: index * ITEM_HEIGHT,
          behavior: smooth ? 'smooth' : 'auto',
        })
      }
    },
    [items]
  )

  useEffect(() => {
    scrollToValue(value, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isDragging) return

    const scrollTop = containerRef.current.scrollTop
    const index = Math.round(scrollTop / ITEM_HEIGHT)
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1))

    if (items[clampedIndex] !== value) {
      onChange(items[clampedIndex])
    }
  }, [isDragging, items, value, onChange])

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

    const onScroll = () => {
      handleScroll()
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScrollEnd, 100)
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', onScroll)
      clearTimeout(scrollTimeout)
    }
  }, [handleScroll, handleScrollEnd])

  return (
    <div className="relative h-[220px] flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[88px] bg-gradient-to-b from-white via-white/90 to-transparent dark:from-[#2C2C2E] dark:via-[#2C2C2E]/90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[88px] bg-gradient-to-t from-white via-white/90 to-transparent dark:from-[#2C2C2E] dark:via-[#2C2C2E]/90" />
      <div className="pointer-events-none absolute inset-x-2 top-1/2 z-5 h-[44px] -translate-y-1/2 rounded-xl bg-zinc-100/80 dark:bg-zinc-700/50" />

      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{ paddingTop: 88, paddingBottom: 88 }}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        {items.map((item) => {
          const isSelected = item === value
          return (
            <div
              key={item}
              className={cn(
                'flex h-[44px] items-center justify-center snap-center transition-all duration-150',
                isSelected
                  ? 'text-[22px] font-semibold text-zinc-900 dark:text-white scale-105'
                  : 'text-[20px] font-normal text-zinc-400 dark:text-zinc-500'
              )}
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
}: IOSDatePickerProps) {
  const [viewDate, setViewDate] = useState(value)
  const popoverRef = useRef<HTMLDivElement>(null)

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

  const handleSelectDate = (date: Date) => {
    onChange(date)
    onClose()
  }

  const handlePreviousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/20"
            onClick={onClose}
          />

          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[360px] rounded-2xl bg-white shadow-2xl shadow-black/20 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
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
                      className={cn(
                        'h-9 rounded-lg text-[14px] font-medium transition-colors',
                        !day.isCurrentMonth && 'text-zinc-300 dark:text-zinc-600',
                        day.isCurrentMonth &&
                          !isToday &&
                          !isSelected &&
                          'text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700',
                        isToday &&
                          !isSelected &&
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
}: IOSDatePickerProps) {
  const currentYear = new Date().getFullYear()

  // Generate years: current year - 1 to current year + 1 (3 years)
  const years = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => (currentYear - 1 + i).toString())
  }, [currentYear])

  const [tempDay, setTempDay] = useState(value.getDate().toString())
  const [tempMonth, setTempMonth] = useState(MONTHS[value.getMonth()])
  const [tempYear, setTempYear] = useState(value.getFullYear().toString())

  // Sync temp values when picker opens
  useEffect(() => {
    if (isOpen) {
      setTempDay(value.getDate().toString())
      setTempMonth(MONTHS[value.getMonth()])
      setTempYear(value.getFullYear().toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Generate days based on selected month/year
  const days = useMemo(() => {
    const monthIndex = MONTHS.indexOf(tempMonth)
    const year = parseInt(tempYear, 10)
    const daysInMonth = getDaysInMonth(year, monthIndex)
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString())
  }, [tempMonth, tempYear])

  // Adjust day if it exceeds days in selected month
  useEffect(() => {
    const dayNum = parseInt(tempDay, 10)
    const monthIndex = MONTHS.indexOf(tempMonth)
    const year = parseInt(tempYear, 10)
    const maxDays = getDaysInMonth(year, monthIndex)

    if (dayNum > maxDays) {
      setTempDay(maxDays.toString())
    }
  }, [tempDay, tempMonth, tempYear])

  const handleConfirm = () => {
    const dayNum = parseInt(tempDay, 10)
    const monthIndex = MONTHS.indexOf(tempMonth)
    const year = parseInt(tempYear, 10)

    const newDate = new Date(year, monthIndex, dayNum)
    onChange(newDate)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={animations.spring.sheet}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] bg-white dark:bg-[#2C2C2E]"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            </div>

            <div className="flex items-center justify-between px-4 pb-4">
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-500 active:bg-zinc-100 dark:active:bg-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="text-[17px] font-semibold text-zinc-900 dark:text-white">
                {title}
              </span>
              <button
                onClick={handleConfirm}
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#007AFF] active:bg-blue-50 dark:text-[#0A84FF] dark:active:bg-blue-900/30"
              >
                <Check className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 px-4 pb-8">
              <WheelColumn items={days} value={tempDay} onChange={setTempDay} />
              <WheelColumn items={MONTHS} value={tempMonth} onChange={setTempMonth} />
              <WheelColumn items={years} value={tempYear} onChange={setTempYear} />
            </div>

            <div className="h-safe-area-inset-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Main export - automatically chooses between mobile and desktop variants
export function IOSDatePicker(props: IOSDatePickerProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
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
}

export function DatePickerTrigger({ value, onChange, label, className }: DatePickerTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Format: "Jue 6 Feb 2026" (Spanish)
  const formattedDate = useMemo(() => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
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

    const day = dayNames[value.getDay()]
    const date = value.getDate()
    const month = monthAbbrev[value.getMonth()]
    const year = value.getFullYear()

    return `${day} ${date} ${month} ${year}`
  }, [value])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex h-10 items-center justify-center rounded-xl px-3 gap-2',
          'bg-zinc-100/80 dark:bg-zinc-800/80',
          'text-[15px] font-medium text-zinc-900 dark:text-white',
          'active:scale-95 transition-all duration-150',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          'focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50',
          className
        )}
      >
        <CalendarIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        <span>{formattedDate}</span>
      </button>

      <IOSDatePicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        value={value}
        onChange={onChange}
        title={label || 'Seleccionar fecha'}
      />
    </>
  )
}
