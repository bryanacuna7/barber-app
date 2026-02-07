'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
  threshold?: number
  className?: string
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

  // Transform pull distance to rotation for spinner
  const spinnerRotation = useTransform(pullDistance, [0, threshold], [0, 360])

  // Transform pull distance to opacity
  const spinnerOpacity = useTransform(pullDistance, [0, threshold / 2, threshold], [0, 0.5, 1])

  // Check if user can pull (scroll is at top)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setCanPull(container.scrollTop === 0)
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDragStart = () => {
    // Only allow pull if at top of scroll
    return canPull && !isRefreshing && !disabled
  }

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!canPull || isRefreshing || disabled) return

    // Only allow downward drag
    if (info.offset.y > 0) {
      pullDistance.set(Math.min(info.offset.y, threshold * 1.5))
    }
  }

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!canPull || isRefreshing || disabled) {
      pullDistance.set(0)
      return
    }

    // Trigger refresh if pulled beyond threshold
    if (info.offset.y >= threshold) {
      setIsRefreshing(true)

      // Animate to threshold position
      animate(pullDistance, threshold, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      })

      try {
        await onRefresh()
      } finally {
        // Reset after refresh
        setIsRefreshing(false)
        animate(pullDistance, 0, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
        })
      }
    } else {
      // Reset if not pulled enough
      animate(pullDistance, 0, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      })
    }
  }

  return (
    <div ref={containerRef} className={className} style={{ overflowY: 'auto', height: '100%' }}>
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
        drag="y"
        dragListener={canPull && !isRefreshing && !disabled}
        dragPropagation
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y: pullDistance }}
      >
        {children}
      </motion.div>
    </div>
  )
}
