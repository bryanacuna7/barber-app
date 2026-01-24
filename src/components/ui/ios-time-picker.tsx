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

// Generate hours (00-23) and minutes (00-59)
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'))

// Hook to detect if device is touch/mobile
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    // Check for touch capability and small screen
    const checkTouch = () => {
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 768
      setIsTouch(hasTouchScreen && isSmallScreen)
    }

    checkTouch()
    window.addEventListener('resize', checkTouch)
    return () => window.removeEventListener('resize', checkTouch)
  }, [])

  return isTouch
}

const ITEM_HEIGHT = 44 // Apple standard touch target

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

  const scrollToValue = useCallback((val: string, smooth = true) => {
    const index = items.indexOf(val)
    if (index !== -1 && containerRef.current) {
      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  }, [items])

  // Initial scroll to selected value
  useEffect(() => {
    scrollToValue(value, false)
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

    // Snap to nearest item
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
      {/* Gradient overlays for depth effect */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[88px] bg-gradient-to-b from-white via-white/90 to-transparent dark:from-[#2C2C2E] dark:via-[#2C2C2E]/90" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[88px] bg-gradient-to-t from-white via-white/90 to-transparent dark:from-[#2C2C2E] dark:via-[#2C2C2E]/90" />

      {/* Selection indicator */}
      <div className="pointer-events-none absolute inset-x-2 top-1/2 z-5 h-[44px] -translate-y-1/2 rounded-xl bg-zinc-100/80 dark:bg-zinc-700/50" />

      {/* Scrollable column */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{
          paddingTop: 88,
          paddingBottom: 88,
        }}
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

export function IOSTimePicker({
  value,
  onChange,
  isOpen,
  onClose,
  title = 'Seleccionar hora',
}: IOSTimePickerProps) {
  const [hour, minute] = value.split(':')
  const [tempHour, setTempHour] = useState(hour || '09')
  const [tempMinute, setTempMinute] = useState(minute || '00')

  // Reset temp values when opening
  useEffect(() => {
    if (isOpen) {
      const [h, m] = value.split(':')
      setTempHour(h || '09')
      // Round to nearest 5 minutes
      const mins = parseInt(m || '0')
      const rounded = Math.round(mins / 5) * 5
      setTempMinute(rounded.toString().padStart(2, '0'))
    }
  }, [isOpen, value])

  const handleConfirm = () => {
    onChange(`${tempHour}:${tempMinute}`)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] bg-white dark:bg-[#2C2C2E]"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            </div>

            {/* Header */}
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

            {/* Time Picker Wheels */}
            <div className="flex items-center justify-center gap-0 px-4 pb-8">
              <WheelColumn
                items={HOURS}
                value={tempHour}
                onChange={setTempHour}
              />
              <div className="text-[28px] font-bold text-zinc-900 dark:text-white">
                :
              </div>
              <WheelColumn
                items={MINUTES}
                value={tempMinute}
                onChange={setTempMinute}
              />
            </div>

            {/* Safe area */}
            <div className="h-safe-area-inset-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Inline trigger button for the time picker
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
        'flex h-11 min-w-[80px] items-center justify-center rounded-xl',
        'bg-zinc-100 dark:bg-zinc-800',
        'text-[17px] font-semibold text-zinc-900 dark:text-white',
        'active:scale-95 transition-transform duration-150',
        'focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50',
        className
      )}
    >
      {value}
    </button>
  )
}
