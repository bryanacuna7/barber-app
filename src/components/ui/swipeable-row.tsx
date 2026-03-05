'use client'

/**
 * SwipeableRow — Spark Mail 4-gesture swipe pattern
 *
 * Uses raw touch events for fluid gesture tracking (no framer-motion drag).
 * Motion values + animate() for rendering and spring snap-back only.
 *
 * 4 distinct gestures:
 *   Left short  -> reveal right action tray (row stays open)
 *   Left long   -> auto-execute right commit action (instant)
 *   Right short -> reveal left action tray (row stays open)
 *   Right long  -> auto-execute left commit action (instant)
 *
 * Gesture safety:
 *   - 24px edge exclusion zone preserves iOS back/forward gestures
 *   - Direction-aware: only captures swipe if actions exist for that direction
 *   - prefers-reduced-motion: instant animations, actions still reachable
 *   - Tap-to-close: tap content when open -> closes without triggering child onClick
 */

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { animations } from '@/lib/design-system'
import { haptics } from '@/lib/utils/mobile'
import { useRef, useCallback, useState, useEffect } from 'react'

const EDGE_EXCLUSION_ZONE = 24
const ACTION_SIZE = 46
const ACTION_GAP = 8
const ACTION_EDGE_PADDING = 12
const DEFAULT_REVEAL_THRESHOLD = 70
const DEFAULT_COMMIT_RATIO = 0.55
const DIRECTION_LOCK_THRESHOLD = 6
const FLICK_VELOCITY = 400

export interface SwipeAction {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}

export interface SwipeableRowProps {
  children: React.ReactNode
  rightActions?: SwipeAction[]
  leftActions?: SwipeAction[]
  revealThreshold?: number
  commitThresholdRatio?: number
  showAffordance?: boolean
  className?: string
  containerClassName?: string
}

type RestingState = 'closed' | 'open-left' | 'open-right'
type GestureDirection = 'unknown' | 'horizontal' | 'vertical'

interface GestureState {
  startX: number
  startY: number
  startOffset: number
  direction: GestureDirection
  isDragging: boolean
  lastTime: number
  lastX: number
  velocityX: number
}

function computeRevealWidth(actionCount: number, baseThreshold: number): number {
  if (actionCount === 0) return 0
  const needed = actionCount * (ACTION_SIZE + ACTION_GAP) - ACTION_GAP + ACTION_EDGE_PADDING * 2
  return Math.max(baseThreshold, needed)
}

/* --- Action Tray (progressively filling strip behind content) --- */

function SwipeActionTray({
  actions,
  side,
  dynamicWidth,
  revealWidth,
  isCommit,
  onActionClick,
}: {
  actions: SwipeAction[]
  side: 'left' | 'right'
  dynamicWidth: MotionValue<number>
  revealWidth: number
  isCommit: boolean
  onActionClick: (action: SwipeAction) => void
}) {
  return (
    <motion.div
      className={cn(
        'absolute top-0 bottom-0 z-[1] overflow-hidden',
        side === 'left' ? 'left-0' : 'right-0'
      )}
      style={{ width: dynamicWidth }}
    >
      {/* Background fills progressively */}
      <div className={cn('absolute inset-0', actions[0]?.color ?? 'bg-zinc-500')} />
      {/* Buttons anchored at revealWidth from edge */}
      <div
        className={cn(
          'absolute top-0 bottom-0 flex items-center justify-center z-[1] transition-opacity duration-100',
          side === 'left' ? 'left-0' : 'right-0',
          isCommit ? 'opacity-0' : 'opacity-100'
        )}
        style={{ width: revealWidth }}
      >
        <div className="flex items-center gap-2">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation()
                onActionClick(action)
              }}
              aria-label={action.label}
              title={action.label}
              className="flex items-center justify-center w-[46px] h-[46px] rounded-2xl text-white"
            >
              {action.icon}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* --- Commit overlay (full-color fill + centered icon) --- */

function CommitOverlay({
  action,
  side,
  isActive,
}: {
  action: SwipeAction
  side: 'left' | 'right'
  isActive: boolean
}) {
  return (
    <motion.div
      className={cn(
        'absolute top-0 bottom-0 flex items-center justify-center z-[2] pointer-events-none',
        side === 'left' ? 'left-0' : 'right-0',
        action.color
      )}
      style={{ width: '100%' }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className="flex items-center justify-center text-white"
        animate={{ scale: isActive ? 1.3 : 0.8, opacity: isActive ? 1 : 0 }}
        transition={animations.spring.snappy}
      >
        {action.icon}
      </motion.div>
    </motion.div>
  )
}

/* --- Main Component --- */

export function SwipeableRow({
  children,
  rightActions = [],
  leftActions = [],
  revealThreshold = DEFAULT_REVEAL_THRESHOLD,
  commitThresholdRatio = DEFAULT_COMMIT_RATIO,
  showAffordance = true,
  className,
  containerClassName,
}: SwipeableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const prefersReducedMotion = useReducedMotion()

  // State machine
  const restingStateRef = useRef<RestingState>('closed')
  const [commitSide, setCommitSide] = useState<'left' | 'right' | null>(null)

  // Tray visibility + dynamic width — all driven by motion value (no React re-renders)
  const leftTrayOpacity = useTransform(x, [0, 14], [0, 1])
  const rightTrayOpacity = useTransform(x, [-14, 0], [1, 0])
  const leftTrayWidth = useTransform(x, (v) => Math.max(0, v))
  const rightTrayWidth = useTransform(x, (v) => Math.max(0, -v))
  const affordanceOpacity = useTransform(x, (v) => (Math.abs(v) > 2 ? 0 : 0.2))

  // Haptic tracking
  const hasTriggeredRevealHaptic = useRef<'left' | 'right' | null>(null)
  const hasTriggeredCommitHaptic = useRef<'left' | 'right' | null>(null)
  const lastDragDirection = useRef<'left' | 'right' | null>(null)

  // Gesture state (refs = no re-renders during drag)
  const gestureRef = useRef<GestureState>({
    startX: 0,
    startY: 0,
    startOffset: 0,
    direction: 'unknown',
    isDragging: false,
    lastTime: 0,
    lastX: 0,
    velocityX: 0,
  })

  const hasActions = rightActions.length > 0 || leftActions.length > 0

  const leftRevealWidth = computeRevealWidth(leftActions.length, revealThreshold)
  const rightRevealWidth = computeRevealWidth(rightActions.length, revealThreshold)

  const leftCommitAction = leftActions[leftActions.length - 1] ?? null
  const rightCommitAction = rightActions[rightActions.length - 1] ?? null

  const springClose = prefersReducedMotion ? { duration: 0.05 } : animations.spring.swipeClose
  const springOpen = prefersReducedMotion ? { duration: 0.05 } : animations.spring.swipeOpen

  /* --- Haptic feedback during drag --- */
  const updateHaptics = useCallback(
    (currentX: number) => {
      const absX = Math.abs(currentX)
      const direction: 'left' | 'right' = currentX < 0 ? 'left' : 'right'
      const containerWidth = containerRef.current?.offsetWidth ?? 375
      const commitThreshold = containerWidth * commitThresholdRatio

      // Reset on direction change
      if (lastDragDirection.current && lastDragDirection.current !== direction && absX > 5) {
        hasTriggeredRevealHaptic.current = null
        hasTriggeredCommitHaptic.current = null
        setCommitSide(null)
      }
      if (absX > 5) lastDragDirection.current = direction

      const hasActionsForDirection =
        direction === 'left' ? rightActions.length > 0 : leftActions.length > 0
      if (!hasActionsForDirection) return

      // Reveal haptic
      if (absX > revealThreshold * 0.5 && hasTriggeredRevealHaptic.current !== direction) {
        haptics.selection()
        hasTriggeredRevealHaptic.current = direction
      } else if (absX < revealThreshold * 0.3) {
        hasTriggeredRevealHaptic.current = null
      }

      // Commit haptic
      if (absX > commitThreshold && hasTriggeredCommitHaptic.current !== direction) {
        haptics.warning()
        hasTriggeredCommitHaptic.current = direction
        setCommitSide(direction === 'left' ? 'right' : 'left')
      } else if (absX < commitThreshold * 0.9 && hasTriggeredCommitHaptic.current) {
        hasTriggeredCommitHaptic.current = null
        setCommitSide(null)
      }
    },
    [revealThreshold, commitThresholdRatio, rightActions.length, leftActions.length]
  )

  /* --- Snap logic on gesture end --- */
  const handleGestureEnd = useCallback(
    (velocity: number) => {
      const currentX = x.get()
      const absX = Math.abs(currentX)
      const absVelocity = Math.abs(velocity)
      const containerWidth = containerRef.current?.offsetWidth ?? 375
      const commitThreshold = containerWidth * commitThresholdRatio
      const goingRight = currentX > 0

      // Reset haptic refs
      hasTriggeredRevealHaptic.current = null
      hasTriggeredCommitHaptic.current = null
      lastDragDirection.current = null

      // Flick detection
      const isFlick = absVelocity > FLICK_VELOCITY
      const flickMatchesDirection = (velocity > 0 && currentX > 0) || (velocity < 0 && currentX < 0)

      // 1) COMMIT
      if (absX > commitThreshold) {
        const actionToExecute = goingRight ? leftCommitAction : rightCommitAction
        if (actionToExecute) {
          actionToExecute.onClick()
          animate(x, 0, { ...springClose, velocity })
          restingStateRef.current = 'closed'
          setCommitSide(null)
          return
        }
      }

      setCommitSide(null)

      // 2) REVEAL — past threshold OR quick flick
      const shouldReveal = absX > revealThreshold || (isFlick && flickMatchesDirection)
      if (shouldReveal) {
        if (goingRight && leftActions.length > 0) {
          animate(x, leftRevealWidth, { ...springOpen, velocity })
          restingStateRef.current = 'open-left'
          return
        }
        if (!goingRight && rightActions.length > 0) {
          animate(x, -rightRevealWidth, { ...springOpen, velocity })
          restingStateRef.current = 'open-right'
          return
        }
      }

      // 3) CLOSE
      animate(x, 0, { ...springClose, velocity })
      restingStateRef.current = 'closed'
    },
    [
      x,
      commitThresholdRatio,
      revealThreshold,
      leftActions.length,
      rightActions.length,
      leftRevealWidth,
      rightRevealWidth,
      leftCommitAction,
      rightCommitAction,
      springClose,
      springOpen,
    ]
  )

  /* --- Close helper --- */
  const closeRow = useCallback(() => {
    animate(x, 0, springClose)
    restingStateRef.current = 'closed'
  }, [x, springClose])

  /* --- Action button click (from tray) --- */
  const handleActionClick = useCallback(
    (action: SwipeAction) => {
      suppressClickUntilRef.current = Date.now() + 350
      haptics.tap()
      action.onClick()
      closeRow()
    },
    [closeRow]
  )

  /* --- Raw touch event handlers (the core of fluid gesture tracking) --- */
  useEffect(() => {
    const el = contentRef.current
    if (!el || !hasActions) return

    const maxRight = leftActions.length > 0 ? (containerRef.current?.offsetWidth ?? 375) : 0
    const maxLeft = rightActions.length > 0 ? -(containerRef.current?.offsetWidth ?? 375) : 0

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const viewportX = touch.clientX

      // Edge exclusion zone
      if (
        viewportX <= EDGE_EXCLUSION_ZONE ||
        viewportX >= window.innerWidth - EDGE_EXCLUSION_ZONE
      ) {
        return
      }

      const g = gestureRef.current
      g.startX = touch.clientX
      g.startY = touch.clientY
      g.startOffset = x.get()
      g.direction = 'unknown'
      g.isDragging = false
      g.lastTime = Date.now()
      g.lastX = touch.clientX
      g.velocityX = 0
    }

    const onTouchMove = (e: TouchEvent) => {
      const g = gestureRef.current
      if (g.direction === 'vertical') return

      const touch = e.touches[0]
      const deltaX = touch.clientX - g.startX
      const deltaY = touch.clientY - g.startY
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Direction detection
      if (g.direction === 'unknown') {
        if (absX > absY + 2 && absX > DIRECTION_LOCK_THRESHOLD) {
          const isLeft = deltaX < 0
          const isRight = deltaX > 0
          const currentOffset = g.startOffset
          const isOpen = Math.abs(currentOffset) > 2
          const canOpen = (isLeft && rightActions.length > 0) || (isRight && leftActions.length > 0)
          const canClose = isOpen
          const canSwipe = canOpen || canClose

          if (canSwipe) {
            g.direction = 'horizontal'
            g.isDragging = true
          } else {
            g.direction = 'vertical'
            return
          }
        } else if (absY > absX && absY > DIRECTION_LOCK_THRESHOLD) {
          g.direction = 'vertical'
          return
        } else {
          return // still deciding
        }
      }

      // We own this gesture — prevent scroll
      e.preventDefault()

      // Track velocity (exponential moving average)
      const now = Date.now()
      const dt = now - g.lastTime
      if (dt > 0) {
        const instantV = ((touch.clientX - g.lastX) / dt) * 1000
        g.velocityX = g.velocityX * 0.4 + instantV * 0.6
        g.lastTime = now
        g.lastX = touch.clientX
      }

      // Calculate and clamp position
      const newX = g.startOffset + deltaX
      const clamped = Math.max(maxLeft, Math.min(maxRight, newX))

      // Set position directly — no React, no framer-motion drag overhead
      x.set(clamped)

      // Haptic feedback
      updateHaptics(clamped)
    }

    const onTouchEnd = () => {
      const g = gestureRef.current
      if (!g.isDragging) return

      g.isDragging = false
      g.direction = 'unknown'
      suppressClickUntilRef.current = Date.now() + 350

      handleGestureEnd(g.velocityX)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [hasActions, rightActions.length, leftActions.length, x, updateHaptics, handleGestureEnd])

  /* --- Tap-to-close + desktop pointer fallback --- */
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickUntilRef = useRef(0)

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
  }, [])

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const start = pointerStartRef.current
      pointerStartRef.current = null
      if (!start) return

      const deltaX = Math.abs(event.clientX - start.x)
      const deltaY = Math.abs(event.clientY - start.y)

      // Tap-to-close: if row is open and this was a tap (no drag)
      if (restingStateRef.current !== 'closed' && deltaX < 8 && deltaY < 8) {
        event.stopPropagation()
        event.preventDefault()
        closeRow()
      }
    },
    [closeRow]
  )

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden rounded-xl', containerClassName)}
    >
      {/* Left side (visible when content displaced right, x > 0) */}
      {leftActions.length > 0 && (
        <motion.div className="absolute inset-0" style={{ opacity: leftTrayOpacity }}>
          {leftCommitAction && (
            <CommitOverlay action={leftCommitAction} side="left" isActive={commitSide === 'left'} />
          )}
          <SwipeActionTray
            actions={leftActions}
            side="left"
            dynamicWidth={leftTrayWidth}
            revealWidth={leftRevealWidth}
            isCommit={commitSide === 'left'}
            onActionClick={handleActionClick}
          />
        </motion.div>
      )}

      {/* Right side (visible when content displaced left, x < 0) */}
      {rightActions.length > 0 && (
        <motion.div className="absolute inset-0" style={{ opacity: rightTrayOpacity }}>
          {rightCommitAction && (
            <CommitOverlay
              action={rightCommitAction}
              side="right"
              isActive={commitSide === 'right'}
            />
          )}
          <SwipeActionTray
            actions={rightActions}
            side="right"
            dynamicWidth={rightTrayWidth}
            revealWidth={rightRevealWidth}
            isCommit={commitSide === 'right'}
            onActionClick={handleActionClick}
          />
        </motion.div>
      )}

      {/* Swipe affordance indicator — fades out during any swipe */}
      {showAffordance && rightActions.length > 0 && (
        <motion.div
          className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5 pointer-events-none z-[3]"
          style={{ opacity: affordanceOpacity }}
        >
          <div className="w-1 h-6 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          <div className="w-1 h-6 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          <div className="w-1 h-6 rounded-full bg-zinc-400 dark:bg-zinc-500" />
        </motion.div>
      )}

      {/* Content — NO framer-motion drag, just motion.div with style={{ x }} */}
      <motion.div
        ref={contentRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClickCapture={(event) => {
          if (Date.now() < suppressClickUntilRef.current) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
        className={cn('relative z-10 w-full touch-pan-y', className)}
        style={{ x }}
      >
        {children}
      </motion.div>
    </div>
  )
}
