'use client'

/**
 * SwipeableRow - Generic swipeable list item component
 *
 * Inspired by iOS Mail app swipe actions
 * Supports left and right swipe actions with haptic feedback
 *
 * Usage:
 * <SwipeableRow
 *   rightActions={[
 *     { icon: <Edit />, label: 'Edit', color: 'bg-blue-500', onClick: () => {} }
 *   ]}
 * >
 *   <div>Your content here</div>
 * </SwipeableRow>
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { animations } from '@/lib/design-system'
import { haptics } from '@/lib/utils/mobile'
import { useRef, useCallback } from 'react'

export interface SwipeAction {
  icon: React.ReactNode
  label: string
  color: string // bg color class e.g. 'bg-emerald-500'
  onClick: () => void
}

export interface SwipeableRowProps {
  children: React.ReactNode
  rightActions?: SwipeAction[] // revealed on swipe left
  leftActions?: SwipeAction[] // revealed on swipe right (optional)
  className?: string
  threshold?: number // default 72
}

export function SwipeableRow({
  children,
  rightActions = [],
  leftActions = [],
  className,
  threshold = 72,
}: SwipeableRowProps) {
  const hasRevealed = useRef(false)

  // Calculate drag constraints based on actions
  const leftConstraint = rightActions.length > 0 ? -(rightActions.length * threshold) : 0
  const rightConstraint = leftActions.length > 0 ? leftActions.length * threshold : 0

  // Haptic feedback when actions are revealed
  const handleDrag = useCallback(
    (_event: any, info: { offset: { x: number } }) => {
      const dragDistance = Math.abs(info.offset.x)

      // Trigger haptic when user drags past the first action threshold
      if (dragDistance > threshold * 0.5 && !hasRevealed.current) {
        haptics.selection()
        hasRevealed.current = true
      } else if (dragDistance < threshold * 0.3 && hasRevealed.current) {
        hasRevealed.current = false
      }
    },
    [threshold]
  )

  const handleDragEnd = useCallback(() => {
    hasRevealed.current = false
  }, [])

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Swipe affordance indicator (3 dots on right edge) */}
      {rightActions.length > 0 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-20 pointer-events-none z-0">
          <div className="w-1 h-6 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          <div className="w-1 h-6 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          <div className="w-1 h-6 rounded-full bg-zinc-400 dark:bg-zinc-500" />
        </div>
      )}

      {/* Left actions (revealed on swipe right) */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex -translate-x-full">
          {leftActions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick()
              }}
              className={cn(
                'flex flex-col items-center justify-center text-white',
                action.color,
                'w-[72px] h-full'
              )}
            >
              <div className="flex items-center justify-center mb-1">{action.icon}</div>
              <span className="text-[11px] font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right actions (revealed on swipe left) */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex translate-x-full">
          {rightActions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                action.onClick()
              }}
              className={cn(
                'flex flex-col items-center justify-center text-white',
                action.color,
                'w-[72px] h-full'
              )}
            >
              <div className="flex items-center justify-center mb-1">{action.icon}</div>
              <span className="text-[11px] font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Swipeable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: leftConstraint, right: rightConstraint }}
        dragElastic={0.1}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        transition={animations.spring.snappy}
        className={cn('relative z-10 w-full touch-pan-y', className)}
      >
        {children}
      </motion.div>
    </div>
  )
}
