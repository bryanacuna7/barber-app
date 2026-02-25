'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { haptics } from '@/lib/utils/mobile'

interface SlideToCompleteProps {
  onComplete: () => void
  disabled?: boolean
  label?: string
  className?: string
}

/**
 * iOS-style slide-to-complete gesture button.
 * User drags the thumb from left to right to confirm the action.
 * Inspired by iOS alarm dismiss / slide-to-unlock.
 */
export function SlideToComplete({
  onComplete,
  disabled = false,
  label = 'Desliza para completar',
  className,
}: SlideToCompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [completed, setCompleted] = useState(false)
  const x = useMotionValue(0)

  // Track width for calculating completion threshold
  const [trackWidth, setTrackWidth] = useState(0)
  const thumbSize = 56 // h-14 = 56px

  const handleLayout = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerRef.current = node
      setTrackWidth(node.offsetWidth - thumbSize - 8) // 8px for padding
    }
  }, [])

  // Map x position to opacity for the text (fade out as user drags)
  const textOpacity = useTransform(x, [0, trackWidth * 0.5], [1, 0])
  // Map x position to background fill
  const bgWidth = useTransform(x, (val) => val + thumbSize + 4)
  // Chevron pulse opacity
  const chevronOpacity = useTransform(x, [0, 20], [1, 0])

  const handleDragEnd = () => {
    if (disabled || completed) return

    const currentX = x.get()
    const threshold = trackWidth * 0.75 // 75% of track = success

    if (currentX >= threshold) {
      // Complete!
      setCompleted(true)
      haptics.success()
      animate(x, trackWidth, { duration: 0.2 })
      // Delay callback slightly for visual feedback
      setTimeout(() => onComplete(), 300)
    } else {
      // Snap back
      haptics.tap()
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 })
    }
  }

  return (
    <div
      ref={handleLayout}
      className={cn(
        'relative h-16 rounded-2xl overflow-hidden select-none',
        'bg-emerald-950/50 border border-emerald-800/30',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      data-testid="slide-to-complete"
    >
      {/* Fill background (follows thumb) */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-emerald-500/20 rounded-2xl"
        style={{ width: bgWidth }}
      />

      {/* Label text (centered) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        <span className="text-sm font-semibold text-emerald-400 tracking-wide flex items-center gap-2">
          {label}
          <motion.span style={{ opacity: chevronOpacity }}>
            <ChevronRight className="h-4 w-4 animate-pulse" />
          </motion.span>
        </span>
      </motion.div>

      {/* Completed state */}
      {completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-emerald-500 rounded-2xl"
        >
          <Check className="h-6 w-6 text-white" />
        </motion.div>
      )}

      {/* Draggable thumb */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: trackWidth || 200 }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileTap={{ scale: 1.05 }}
        className={cn(
          'absolute top-1 left-1 w-14 h-14 rounded-xl',
          'bg-emerald-500 shadow-lg shadow-emerald-500/30',
          'flex items-center justify-center cursor-grab active:cursor-grabbing',
          'touch-none',
          completed && 'opacity-0'
        )}
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </motion.div>
    </div>
  )
}
