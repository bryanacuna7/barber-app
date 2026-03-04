'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { haptics, isMobileDevice, warmupAudioHaptics } from '@/lib/utils/mobile'

type HourFormat = 'auto' | '12h' | '24h'

interface IOSTimePickerProps {
  value: string // Internal format: "HH:mm" (24h)
  onChange: (value: string) => void
  isOpen: boolean
  onClose: () => void
  title?: string
  zIndex?: number
  hourFormat?: HourFormat
  forceDesktop?: boolean
}

interface TimeParts {
  hour24: string
  minute: string
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const HOURS_12 = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))
const PERIODS: Array<'AM' | 'PM'> = ['AM', 'PM']
const ITEM_HEIGHT = 44

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
    const checkMobile = () => setIsMobile(getIsMobile())
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

function resolveUse12Hour(format: HourFormat = 'auto'): boolean {
  if (format === '12h') return true
  if (format === '24h') return false
  if (typeof window === 'undefined') return false

  try {
    const options = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions()
    if (typeof options.hour12 === 'boolean') return options.hour12
    return (options.hourCycle || '').startsWith('h1')
  } catch {
    return false
  }
}

function parseTime(value: string): TimeParts {
  const [h = '09', m = '00'] = value.split(':')
  const hourNum = Number.parseInt(h, 10)
  const minuteNum = Number.parseInt(m, 10)

  const safeHour = Number.isNaN(hourNum) ? 9 : Math.max(0, Math.min(23, hourNum))
  const safeMinute = Number.isNaN(minuteNum) ? 0 : Math.max(0, Math.min(59, minuteNum))
  const roundedTotalMinutes = Math.round((safeHour * 60 + safeMinute) / 5) * 5
  const wrappedTotalMinutes = ((roundedTotalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const normalizedHour = Math.floor(wrappedTotalMinutes / 60)
  const normalizedMinute = wrappedTotalMinutes % 60

  return {
    hour24: normalizedHour.toString().padStart(2, '0'),
    minute: normalizedMinute.toString().padStart(2, '0'),
  }
}

function to12Hour(hour24: string): { hour12: string; period: 'AM' | 'PM' } {
  const h = Math.max(0, Math.min(23, Number.parseInt(hour24, 10) || 0))
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
  const value12 = ((h + 11) % 12) + 1
  return { hour12: value12.toString().padStart(2, '0'), period }
}

function to24Hour(hour12: string, period: 'AM' | 'PM'): string {
  const h12 = Math.max(1, Math.min(12, Number.parseInt(hour12, 10) || 12))
  let h24 = h12 % 12
  if (period === 'PM') h24 += 12
  return h24.toString().padStart(2, '0')
}

function formatDisplayTime(value: string, use12Hour: boolean): string {
  const { hour24, minute } = parseTime(value)
  if (!use12Hour) return `${hour24}:${minute}`

  const { hour12, period } = to12Hour(hour24)
  const cleanHour = Number.parseInt(hour12, 10).toString()
  return `${cleanHour}:${minute} ${period}`
}

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
  const lastEmittedValueRef = useRef(value)
  const lastHapticValueRef = useRef(value)
  const selectedIndex = items.indexOf(value)

  useEffect(() => {
    lastEmittedValueRef.current = value
    lastHapticValueRef.current = value
  }, [value])

  // Fires during active drag — touchmove IS a user gesture on iOS, so AudioContext plays
  const handleTouchMove = useCallback(() => {
    if (!containerRef.current) return
    const index = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT)
    const centered = items[Math.max(0, Math.min(index, items.length - 1))]
    if (centered !== lastHapticValueRef.current) {
      lastHapticValueRef.current = centered
      if (isMobileDevice()) haptics.selection()
    }
  }, [items])

  const emitValueChange = useCallback(
    (nextValue: string, options?: { haptic?: boolean }) => {
      if (nextValue === lastEmittedValueRef.current) return
      lastEmittedValueRef.current = nextValue
      onChange(nextValue)
      if (options?.haptic && isMobileDevice()) haptics.selection()
    },
    [onChange]
  )

  const scrollToValue = useCallback(
    (val: string, smooth = true) => {
      const index = items.indexOf(val)
      if (index === -1 || !containerRef.current) return

      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'auto',
      })
    },
    [items]
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
    emitValueChange(items[clampedIndex])
  }, [emitValueChange, items])

  const handleScrollEnd = useCallback(() => {
    if (!containerRef.current) return

    const scrollTop = containerRef.current.scrollTop
    const index = Math.round(scrollTop / ITEM_HEIGHT)
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1))

    containerRef.current.scrollTo({
      top: clampedIndex * ITEM_HEIGHT,
      behavior: 'auto',
    })
    emitValueChange(items[clampedIndex], { haptic: true })
  }, [emitValueChange, items])

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
        onTouchStart={() => {
          warmupAudioHaptics()
          setIsDragging(true)
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
        onTouchCancel={() => setIsDragging(false)}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {items.map((item, index) => {
          const isSelected = item === value
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
                'flex h-[44px] items-center justify-center snap-center leading-none transition-[color,transform,opacity] duration-150',
                isSelected
                  ? 'text-[24px] font-semibold text-zinc-900 dark:text-zinc-100'
                  : 'text-[21px] font-medium text-zinc-400 dark:text-zinc-500'
              )}
              style={{
                transform: `perspective(320px) rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`,
                opacity,
                textShadow: isSelected ? undefined : 'none',
              }}
              onClick={() => {
                emitValueChange(item, { haptic: true })
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

function DesktopTimePicker({
  value,
  onChange,
  isOpen,
  onClose,
  title = 'Seleccionar hora',
  zIndex = 70,
  hourFormat = 'auto',
}: IOSTimePickerProps) {
  const use12Hour = resolveUse12Hour(hourFormat)
  const initial = parseTime(value)
  const initial12 = to12Hour(initial.hour24)
  const [tempHour, setTempHour] = useState(use12Hour ? initial12.hour12 : initial.hour24)
  const [tempMinute, setTempMinute] = useState(initial.minute)
  const [tempPeriod, setTempPeriod] = useState<'AM' | 'PM'>(initial12.period)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) onClose()
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

  const setFrom24 = (hour24: string, minute: string) => {
    const parsed = parseTime(`${hour24}:${minute}`)
    const parsed12 = to12Hour(parsed.hour24)
    setTempMinute(parsed.minute)
    setTempHour(use12Hour ? parsed12.hour12 : parsed.hour24)
    setTempPeriod(parsed12.period)
  }

  const handleConfirm = () => {
    const normalizedHour = use12Hour ? to24Hour(tempHour, tempPeriod) : tempHour
    onChange(`${normalizedHour}:${tempMinute}`)
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-black/20 dark:border-zinc-700 dark:bg-zinc-800"
            style={{ zIndex: zIndex + 1 }}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-700">
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                {title}
              </span>
              <button
                onClick={handleConfirm}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
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
                    className="h-14 w-24 appearance-none rounded-xl border-0 bg-zinc-100 text-center text-[24px] font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-zinc-700 dark:text-white"
                  >
                    {(use12Hour ? HOURS_12 : HOURS_24).map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="mt-5 text-[32px] font-bold text-zinc-400 dark:text-zinc-500">
                  :
                </span>

                <div className="flex flex-col items-center gap-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                    Minutos
                  </label>
                  <select
                    value={tempMinute}
                    onChange={(e) => setTempMinute(e.target.value)}
                    className="h-14 w-24 appearance-none rounded-xl border-0 bg-zinc-100 text-center text-[24px] font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-zinc-700 dark:text-white"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {use12Hour && (
                  <div className="flex flex-col items-center gap-1">
                    <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      Periodo
                    </label>
                    <select
                      value={tempPeriod}
                      onChange={(e) => setTempPeriod(e.target.value as 'AM' | 'PM')}
                      className="h-14 w-20 appearance-none rounded-xl border-0 bg-zinc-100 text-center text-[22px] font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-zinc-700 dark:text-white"
                    >
                      {PERIODS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-muted">
                <Clock className="h-4 w-4" />
                <span className="text-[14px]">
                  {formatDisplayTime(
                    `${use12Hour ? to24Hour(tempHour, tempPeriod) : tempHour}:${tempMinute}`,
                    use12Hour
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-2 px-4 pb-4">
              <button
                type="button"
                onClick={() => setFrom24('09', '00')}
                className="h-9 flex-1 rounded-lg bg-zinc-100 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
              >
                9:00 AM
              </button>
              <button
                type="button"
                onClick={() => setFrom24('12', '00')}
                className="h-9 flex-1 rounded-lg bg-zinc-100 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
              >
                12:00 PM
              </button>
              <button
                type="button"
                onClick={() => setFrom24('18', '00')}
                className="h-9 flex-1 rounded-lg bg-zinc-100 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
              >
                6:00 PM
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}

function MobileTimePicker({
  value,
  onChange,
  isOpen,
  onClose,
  title = 'Seleccionar hora',
  zIndex = 70,
  hourFormat = 'auto',
}: IOSTimePickerProps) {
  const use12Hour = resolveUse12Hour(hourFormat)
  const initial = parseTime(value)
  const initial12 = to12Hour(initial.hour24)
  const [tempHour, setTempHour] = useState(use12Hour ? initial12.hour12 : initial.hour24)
  const [tempMinute, setTempMinute] = useState(initial.minute)
  const [tempPeriod, setTempPeriod] = useState<'AM' | 'PM'>(initial12.period)
  const [wheelKey, setWheelKey] = useState(0)

  const handleConfirm = () => {
    const normalizedHour = use12Hour ? to24Hour(tempHour, tempPeriod) : tempHour
    onChange(`${normalizedHour}:${tempMinute}`)
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
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 mx-auto max-h-[78vh] w-[calc(100%-0.75rem)] max-w-md overflow-y-auto rounded-[26px] bg-white dark:bg-zinc-900/98 shadow-[0_16px_48px_rgba(0,0,0,0.12)] dark:shadow-[0_26px_64px_rgba(0,0,0,0.65)]"
            style={{ zIndex: zIndex + 1 }}
          >
            <div className="flex justify-center pb-2 pt-3">
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
                  key={`hour-${wheelKey}`}
                  items={use12Hour ? HOURS_12 : HOURS_24}
                  value={tempHour}
                  onChange={setTempHour}
                />
                <div className="flex h-[44px] w-8 items-center justify-center pb-[1px] text-[30px] font-semibold leading-none text-zinc-400">
                  :
                </div>
                <WheelColumn
                  key={`min-${wheelKey}`}
                  items={MINUTES}
                  value={tempMinute}
                  onChange={setTempMinute}
                />
                {use12Hour && (
                  <WheelColumn
                    key={`period-${wheelKey}`}
                    items={PERIODS}
                    value={tempPeriod}
                    onChange={(v) => setTempPeriod(v as 'AM' | 'PM')}
                  />
                )}
              </div>
            </div>

            {/* Quick shortcuts */}
            <div className="px-4 pb-4 pt-0 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const now = new Date()
                  const roundedNow = parseTime(
                    `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
                  )
                  if (use12Hour) {
                    const { hour12, period } = to12Hour(roundedNow.hour24)
                    setTempHour(hour12)
                    setTempPeriod(period)
                  } else {
                    setTempHour(roundedNow.hour24)
                  }
                  setTempMinute(roundedNow.minute)
                  setWheelKey((k) => k + 1)
                }}
                className="w-full h-[44px] rounded-xl bg-zinc-100 dark:bg-white/8 text-[15px] font-medium text-zinc-600 dark:text-zinc-300 active:bg-zinc-200 dark:active:bg-white/14 transition-colors"
              >
                Ahora
              </button>
              <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-600">
                Intervalos de 5 minutos
              </p>
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

export function IOSTimePicker(props: IOSTimePickerProps) {
  const isMobile = useIsMobile()
  const pickerKey = `${props.value}-${props.hourFormat ?? 'auto'}-${props.isOpen ? 'open' : 'closed'}-${isMobile ? 'm' : 'd'}`
  if (isMobile && !props.forceDesktop) return <MobileTimePicker key={pickerKey} {...props} />
  return <DesktopTimePicker key={pickerKey} {...props} />
}

interface TimePickerTriggerProps {
  value: string // Internal format: "HH:mm" (24h)
  onClick: () => void
  className?: string
  hourFormat?: HourFormat
}

export function TimePickerTrigger({
  value,
  onClick,
  className,
  hourFormat = 'auto',
}: TimePickerTriggerProps) {
  const use12Hour = resolveUse12Hour(hourFormat)
  const displayValue = formatDisplayTime(value, use12Hour)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-11 min-w-[72px] items-center justify-center rounded-xl px-3 border',
        'border-zinc-300 bg-zinc-100 dark:border-zinc-700/80 dark:bg-zinc-900/85',
        'text-[15px] font-medium text-zinc-900 dark:text-zinc-100',
        'active:scale-95 transition-[transform,background-color,border-color] duration-150',
        'hover:bg-zinc-200 dark:hover:bg-zinc-900',
        'focus:outline-none focus:ring-2 focus:ring-[#007AFF]/40',
        className
      )}
    >
      {displayValue}
    </button>
  )
}
