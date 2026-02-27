'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IOSTimePickerProps {
  value: string // Format: "HH:mm"
  onChange: (value: string) => void
  isOpen: boolean
  onClose: () => void
  title?: string
}

// Generate hours (00-23) and minutes (00-59 in 5-min increments)
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))

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
    <div className="relative h-[220px] w-[80px] overflow-hidden">
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
                'flex h-[44px] items-center justify-center snap-center transition-[color,transform] duration-150',
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

// Desktop Time Picker - Clean dropdown style
function DesktopTimePicker({
  value,
  onChange,
  isOpen,
  onClose,
  title = 'Seleccionar hora',
}: IOSTimePickerProps) {
  const [hour, minute] = value.split(':')
  const [tempHour, setTempHour] = useState(hour || '09')
  const [tempMinute, setTempMinute] = useState(minute || '00')
  const popoverRef = useRef<HTMLDivElement>(null)

  // Sync temp values when picker opens - valid pattern for controlled inputs
  useEffect(() => {
    if (isOpen) {
      const [h, m] = value.split(':')

      setTempHour(h || '09')
      const mins = parseInt(m || '0')
      const rounded = Math.round(mins / 5) * 5

      setTempMinute(rounded.toString().padStart(2, '0'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only sync when modal opens
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

  const handleConfirm = () => {
    onChange(`${tempHour}:${tempMinute}`)
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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-[71] -translate-x-1/2 -translate-y-1/2 w-[320px] rounded-2xl bg-white shadow-2xl shadow-black/20 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
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
              <button
                onClick={handleConfirm}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    Hora
                  </label>
                  <select
                    value={tempHour}
                    onChange={(e) => setTempHour(e.target.value)}
                    className="h-14 w-24 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-center text-[24px] font-semibold text-zinc-900 dark:text-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-[32px] font-bold text-zinc-400 dark:text-zinc-500 mt-5">
                  :
                </span>

                <div className="flex flex-col items-center gap-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    Minutos
                  </label>
                  <select
                    value={tempMinute}
                    onChange={(e) => setTempMinute(e.target.value)}
                    className="h-14 w-24 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-center text-[24px] font-semibold text-zinc-900 dark:text-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-muted">
                <Clock className="h-4 w-4" />
                <span className="text-[14px]">
                  {tempHour}:{tempMinute}
                </span>
              </div>
            </div>

            <div className="px-4 pb-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTempHour('09')
                  setTempMinute('00')
                }}
                className="flex-1 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                9:00 AM
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempHour('12')
                  setTempMinute('00')
                }}
                className="flex-1 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                12:00 PM
              </button>
              <button
                type="button"
                onClick={() => {
                  setTempHour('18')
                  setTempMinute('00')
                }}
                className="flex-1 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-[13px] font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                6:00 PM
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Mobile Time Picker - iOS wheel style with bottom sheet
function MobileTimePicker({
  value,
  onChange,
  isOpen,
  onClose,
  title = 'Seleccionar hora',
}: IOSTimePickerProps) {
  const [hour, minute] = value.split(':')
  const [tempHour, setTempHour] = useState(hour || '09')
  const [tempMinute, setTempMinute] = useState(minute || '00')

  // Sync temp values when picker opens - valid pattern for controlled inputs
  useEffect(() => {
    if (isOpen) {
      const [h, m] = value.split(':')

      setTempHour(h || '09')
      const mins = parseInt(m || '0')
      const rounded = Math.round(mins / 5) * 5

      setTempMinute(rounded.toString().padStart(2, '0'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only sync when modal opens
  }, [isOpen])

  const handleConfirm = () => {
    onChange(`${tempHour}:${tempMinute}`)
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
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, x: '-50%', y: 'calc(-50% + 24px)' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.98, x: '-50%', y: 'calc(-50% + 24px)' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-1rem)] max-w-md max-h-[72vh] overflow-y-auto rounded-2xl border border-zinc-200/70 bg-white shadow-2xl dark:border-zinc-700/70 dark:bg-[#2C2C2E]"
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

            <div className="flex items-center justify-center gap-0 px-4 pb-8">
              <WheelColumn items={HOURS} value={tempHour} onChange={setTempHour} />
              <div className="text-[28px] font-bold text-zinc-900 dark:text-white">:</div>
              <WheelColumn items={MINUTES} value={tempMinute} onChange={setTempMinute} />
            </div>

            <div className="h-safe-area-inset-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Main export - automatically chooses between mobile and desktop variants
export function IOSTimePicker(props: IOSTimePickerProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return <MobileTimePicker {...props} />
  }

  return <DesktopTimePicker {...props} />
}

// Trigger button for opening the time picker
interface TimePickerTriggerProps {
  value: string
  onClick: () => void
  className?: string
}

export function TimePickerTrigger({ value, onClick, className }: TimePickerTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-10 min-w-[72px] items-center justify-center rounded-xl px-3',
        'bg-zinc-100/80 dark:bg-zinc-800/80',
        'text-[15px] font-medium text-zinc-900 dark:text-white',
        'active:scale-95 transition-[transform,background-color] duration-150',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        'focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50',
        className
      )}
    >
      {value}
    </button>
  )
}
