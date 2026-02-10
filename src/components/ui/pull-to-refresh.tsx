'use client'

/**
 * PullToRefresh - Container-aware pull-to-refresh component
 *
 * Gesture safety:
 * - Detects nearest scrollable ancestor (not just window.scrollY)
 * - Vertical intent detection prevents conflicts with horizontal SwipeableRow
 * - overscroll-behavior-y: contain prevents native Android refresh
 * - No dragPropagation — self-contained gesture
 */

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useDragControls,
  type PanInfo,
} from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { animations } from '@/lib/design-system'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
  threshold?: number
  className?: string
}

/** Check if an element has scrollable overflow CSS AND actual scrollable content */
function isScrollable(el: HTMLElement): boolean {
  const { overflow, overflowY } = getComputedStyle(el)
  const hasOverflow =
    overflow === 'auto' || overflow === 'scroll' || overflowY === 'auto' || overflowY === 'scroll'
  return hasOverflow && el.scrollHeight > el.clientHeight
}

/** Walk up from element (inclusive) to find nearest truly scrollable ancestor */
function getScrollableAncestor(el: HTMLElement | null): HTMLElement | Window {
  // Check the element itself first
  if (el && isScrollable(el)) return el

  let current = el?.parentElement
  while (current) {
    if (isScrollable(current)) return current
    current = current.parentElement
  }
  return window
}

function getScrollTop(target: HTMLElement | Window): number {
  if (target instanceof Window) return window.scrollY
  return target.scrollTop
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canPull, setCanPull] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pullDistance = useMotionValue(0)
  const dragControls = useDragControls()

  // Pointer-based intent detection (mirrors SwipeableRow pattern but inverted)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const pullStartedRef = useRef(false)

  // Transform pull distance to rotation for spinner
  const spinnerRotation = useTransform(pullDistance, [0, threshold], [0, 360])
  const spinnerOpacity = useTransform(pullDistance, [0, threshold / 2, threshold], [0, 0.5, 1])

  // Container-aware scroll detection
  useEffect(() => {
    const scrollTarget = getScrollableAncestor(containerRef.current)

    const handleScroll = () => {
      setCanPull(getScrollTop(scrollTarget) <= 0)
    }

    const eventTarget = scrollTarget instanceof Window ? window : scrollTarget
    eventTarget.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => eventTarget.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (isRefreshing || disabled || !canPull) return
      pointerStartRef.current = { x: event.clientX, y: event.clientY }
      pullStartedRef.current = false
    },
    [isRefreshing, disabled, canPull]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const start = pointerStartRef.current
      if (!start || pullStartedRef.current || !canPull || isRefreshing || disabled) return

      const deltaX = event.clientX - start.x
      const deltaY = event.clientY - start.y
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Clear downward vertical intent required
      if (absY > 10 && absY > absX + 4 && deltaY > 0) {
        pullStartedRef.current = true
        dragControls.start(event)
      } else if (absX > 10 && absX > absY) {
        // Horizontal intent — cancel pull tracking, let SwipeableRow handle it
        pointerStartRef.current = null
      }
    },
    [canPull, isRefreshing, disabled, dragControls]
  )

  const resetPointerTracking = useCallback(() => {
    pointerStartRef.current = null
    pullStartedRef.current = false
  }, [])

  const handleDrag = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!canPull || isRefreshing || disabled) return

      // Only allow downward drag
      if (info.offset.y > 0) {
        pullDistance.set(Math.min(info.offset.y, threshold * 1.5))
      }
    },
    [canPull, isRefreshing, disabled, pullDistance, threshold]
  )

  const handleDragEnd = useCallback(
    async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      resetPointerTracking()

      if (!canPull || isRefreshing || disabled) {
        pullDistance.set(0)
        return
      }

      // Trigger refresh if pulled beyond threshold
      if (info.offset.y >= threshold) {
        setIsRefreshing(true)

        animate(pullDistance, threshold, animations.spring.sheet)

        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
          animate(pullDistance, 0, animations.spring.sheet)
        }
      } else {
        animate(pullDistance, 0, animations.spring.sheet)
      }
    },
    [canPull, isRefreshing, disabled, threshold, pullDistance, onRefresh, resetPointerTracking]
  )

  const isDragEnabled = canPull && !isRefreshing && !disabled

  return (
    <div
      ref={containerRef}
      className={cn('[overscroll-behavior-y:contain]', className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={resetPointerTracking}
      onPointerCancel={resetPointerTracking}
    >
      {/* Pull indicator */}
      <motion.div
        style={{
          height: pullDistance,
          opacity: spinnerOpacity,
        }}
        className="flex items-center justify-center"
      >
        <motion.div
          style={{
            rotate: isRefreshing ? undefined : spinnerRotation,
          }}
          animate={isRefreshing ? { rotate: 360 } : undefined}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : undefined}
        >
          <RefreshCw className="text-zinc-400 dark:text-zinc-500" size={24} />
        </motion.div>
      </motion.div>

      {/* Draggable content wrapper */}
      <motion.div
        drag={isDragEnabled ? 'y' : false}
        dragControls={dragControls}
        dragListener={false}
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y: pullDistance }}
      >
        {children}
      </motion.div>
    </div>
  )
}
