'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { animations, reducedMotion } from '@/lib/design-system'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  className?: string
  headerClassName?: string
  enableContentSwipeToClose?: boolean
  contentSwipeCloseThreshold?: number
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  description,
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  headerClassName,
  enableContentSwipeToClose = false,
  contentSwipeCloseThreshold = 80,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const contentSwipeStartYRef = useRef<number | null>(null)
  const canContentSwipeCloseRef = useRef(false)
  const prefersReducedMotion = useReducedMotion()
  const [isDragging, setIsDragging] = useState(false)
  const y = useMotionValue(0)
  const opacity = useTransform(y, (latestY) => {
    const safeY = Number.isFinite(latestY) ? latestY : 0
    const clampedY = Math.min(Math.max(safeY, 0), 200)
    return 1 - (clampedY / 200) * 0.5
  })

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Focus management: capture previous focus on open, restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      drawerRef.current?.focus()
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose()
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offsetY = Number.isFinite(info.offset.y) ? info.offset.y : 0

    // Only allow dragging down
    if (offsetY > 0) {
      y.set(offsetY)
    } else {
      y.set(0)
    }
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 150
    const offsetY = Number.isFinite(info.offset.y) ? info.offset.y : 0
    const velocityY = Number.isFinite(info.velocity.y) ? info.velocity.y : 0

    // Close if dragged down beyond threshold or velocity is high
    if (offsetY > threshold || velocityY > 500) {
      onClose()
    } else {
      // Snap back
      y.set(0)
    }
  }

  const resetContentSwipeState = () => {
    contentSwipeStartYRef.current = null
    canContentSwipeCloseRef.current = false
  }

  const handleContentTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!enableContentSwipeToClose) return
    contentSwipeStartYRef.current = e.touches[0]?.clientY ?? null
    canContentSwipeCloseRef.current = e.currentTarget.scrollTop <= 0
  }

  const handleContentTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!enableContentSwipeToClose) return
    if (!canContentSwipeCloseRef.current) return

    const startY = contentSwipeStartYRef.current
    const currentY = e.touches[0]?.clientY
    if (startY == null || currentY == null) return

    if (e.currentTarget.scrollTop > 0) {
      canContentSwipeCloseRef.current = false
      return
    }

    const deltaY = currentY - startY
    if (deltaY > contentSwipeCloseThreshold) {
      resetContentSwipeState()
      onClose()
    }
  }

  const handleContentTouchEnd = () => {
    resetContentSwipeState()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'drawer-title' : undefined}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion
                ? reducedMotion.spring.default.duration
                : animations.duration.normal,
            }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={prefersReducedMotion ? reducedMotion.spring.sheet : animations.spring.sheet}
            style={{
              y: isDragging ? y : 0,
              opacity,
            }}
            className={cn(
              'relative w-full rounded-t-[28px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl',
              'border-x border-t border-zinc-200/70 dark:border-zinc-800/80',
              'shadow-[0_24px_70px_rgba(9,9,11,0.35)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.62)]',
              'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px',
              'before:bg-gradient-to-r before:from-transparent before:via-zinc-300/70 before:to-transparent dark:before:via-zinc-600/60',
              'max-h-[85vh] overflow-hidden flex flex-col',
              'focus-visible:!outline-none',
              'pb-safe', // Safe area for iOS home indicator
              className
            )}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={cn(
                  'flex items-start justify-between border-b border-zinc-200/70 bg-gradient-to-b from-zinc-50/80 to-transparent px-4 pb-4 pt-2 dark:border-zinc-800/70 dark:from-zinc-900/55 sm:px-6',
                  headerClassName
                )}
              >
                <div className="flex-1 pr-4">
                  {title && (
                    <h2
                      id="drawer-title"
                      className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
                    >
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1 text-base text-muted">{description}</p>}
                </div>
                {showCloseButton && (
                  <motion.button
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    onClick={onClose}
                    className={cn(
                      'inline-flex h-11 w-11 items-center justify-center rounded-2xl border p-2 transition-colors duration-200',
                      'border-zinc-200/70 bg-white/80 text-zinc-400 backdrop-blur hover:text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:hover:text-zinc-200',
                      'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80',
                      'focus:outline-none focus:ring-2 focus:ring-zinc-500'
                    )}
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div
              className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6"
              onTouchStart={handleContentTouchStart}
              onTouchMove={handleContentTouchMove}
              onTouchEnd={handleContentTouchEnd}
              onTouchCancel={handleContentTouchEnd}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
