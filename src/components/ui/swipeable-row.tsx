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

import { motion, useMotionValue, useTransform, animate, type MotionValue } from 'framer-motion'
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
  containerClassName?: string
  threshold?: number // default 72
}

interface SwipeActionButtonProps {
  action: SwipeAction
  index: number
  count: number
  side: 'left' | 'right'
  x: MotionValue<number>
  actionSize: number
  actionGap: number
  edgePadding: number
}

function SwipeActionButton({
  action,
  index,
  count,
  side,
  x,
  actionSize,
  actionGap,
  edgePadding,
}: SwipeActionButtonProps) {
  const revealOrder = side === 'right' ? count - 1 - index : index
  const dragDistance = useTransform(x, (value) =>
    side === 'right' ? Math.max(0, -value) : Math.max(0, value)
  )

  const unit = actionSize + actionGap
  const start = edgePadding + revealOrder * unit * 0.65
  const end = start + unit * 0.95
  const progress = useTransform(dragDistance, [start, end], [0, 1])
  const easedProgress = useTransform(progress, (value) => {
    const t = Math.max(0, Math.min(1, value))
    // iOS-like easing: fast start, gentle settle
    return 1 - Math.pow(1 - t, 3)
  })
  const scale = useTransform(easedProgress, [0, 1], [0.66, 1])
  const opacity = useTransform(easedProgress, [0, 1], [0, 1])
  const translateX = useTransform(easedProgress, [0, 1], side === 'right' ? [16, 0] : [-16, 0])

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation()
        haptics.tap()
        action.onClick()
      }}
      aria-label={action.label}
      title={action.label}
      style={{ scale, opacity, x: translateX }}
      className={cn(
        'flex items-center justify-center text-white rounded-2xl shadow-[0_8px_18px_rgba(0,0,0,0.24)]',
        action.color,
        'w-[46px] h-[46px]'
      )}
    >
      <div className="flex items-center justify-center">{action.icon}</div>
      <span className="sr-only">{action.label}</span>
    </motion.button>
  )
}

export function SwipeableRow({
  children,
  rightActions = [],
  leftActions = [],
  className,
  containerClassName,
  threshold = 72,
}: SwipeableRowProps) {
  const hasRevealed = useRef(false)
  const x = useMotionValue(0)
  const ACTION_SIZE = 46
  const ACTION_GAP = 8
  const ACTION_EDGE_PADDING = 8

  const calculateActionWidth = (count: number) => {
    if (count === 0) return 0
    return ACTION_EDGE_PADDING * 2 + count * ACTION_SIZE + (count - 1) * ACTION_GAP
  }

  // Calculate drag constraints based on actions
  const rightActionsWidth = calculateActionWidth(rightActions.length)
  const leftActionsWidth = calculateActionWidth(leftActions.length)
  const leftConstraint = rightActions.length > 0 ? -rightActionsWidth : 0
  const rightConstraint = leftActions.length > 0 ? leftActionsWidth : 0
  const hasActions = rightActions.length > 0 || leftActions.length > 0
  const rightActionsOpacity = useTransform(x, [0, -6, -18], [0, 0.4, 1])
  const leftActionsOpacity = useTransform(x, [0, 6, 18], [0, 0.4, 1])

  // Haptic feedback when actions are revealed
  const handleDrag = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
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

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
      hasRevealed.current = false

      const offsetX = info.offset.x
      let targetX = 0

      // Swipe left to reveal right actions
      if (rightActions.length > 0 && offsetX < -threshold * 0.8) {
        targetX = leftConstraint
      }

      // Swipe right to reveal left actions
      if (leftActions.length > 0 && offsetX > threshold * 0.8) {
        targetX = rightConstraint
      }

      animate(x, targetX, {
        type: 'spring',
        stiffness: targetX === 0 ? 560 : 500,
        damping: targetX === 0 ? 42 : 38,
        mass: 0.58,
      })
    },
    [leftActions.length, rightActions.length, threshold, leftConstraint, rightConstraint, x]
  )

  return (
    <div className={cn('relative overflow-hidden rounded-xl', containerClassName)}>
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
        <motion.div
          style={{ opacity: leftActionsOpacity }}
          className="absolute left-2 top-1/2 z-0 -translate-y-1/2 flex items-center gap-2"
        >
          {leftActions.map((action, index) => (
            <SwipeActionButton
              key={index}
              action={action}
              index={index}
              count={leftActions.length}
              side="left"
              x={x}
              actionSize={ACTION_SIZE}
              actionGap={ACTION_GAP}
              edgePadding={ACTION_EDGE_PADDING}
            />
          ))}
        </motion.div>
      )}

      {/* Right actions (revealed on swipe left) */}
      {rightActions.length > 0 && (
        <motion.div
          style={{ opacity: rightActionsOpacity }}
          className="absolute right-2 top-1/2 z-0 -translate-y-1/2 flex items-center gap-2"
        >
          {rightActions.map((action, index) => (
            <SwipeActionButton
              key={index}
              action={action}
              index={index}
              count={rightActions.length}
              side="right"
              x={x}
              actionSize={ACTION_SIZE}
              actionGap={ACTION_GAP}
              edgePadding={ACTION_EDGE_PADDING}
            />
          ))}
        </motion.div>
      )}

      {/* Swipeable content */}
      <motion.div
        drag={hasActions ? 'x' : false}
        dragDirectionLock
        dragPropagation
        dragConstraints={{ left: leftConstraint, right: rightConstraint }}
        dragElastic={0.1}
        dragMomentum={false}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        transition={animations.spring.snappy}
        className={cn('relative z-10 w-full touch-pan-y', className)}
        style={{ x }}
      >
        {children}
      </motion.div>
    </div>
  )
}
