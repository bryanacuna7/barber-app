'use client'

import React, { useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const DURATION = '0.4s'
const EASING = 'cubic-bezier(0.32, 0.72, 0, 1)'
const DRAG_DISMISS_THRESHOLD = 150
const DRAG_VELOCITY_THRESHOLD = 500

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
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef(0)

  // animatedOpen drives the CSS transition; exitComplete tracks unmount timing
  const [animatedOpen, setAnimatedOpen] = useState(false)
  const [exitComplete, setExitComplete] = useState(true)
  // visible = keep in DOM while open OR while exit animation is still running
  const visible = isOpen || !exitComplete

  // Drag state (refs to avoid re-renders during gesture)
  const isDraggingRef = useRef(false)
  const dragStartYRef = useRef(0)
  const dragCurrentYRef = useRef(0)
  const dragVelocityRef = useRef(0)
  const lastTouchTimeRef = useRef(0)
  const lastTouchYRef = useRef(0)

  // ── Open/close lifecycle ──
  useEffect(() => {
    if (isOpen) {
      // Double rAF: ensure browser paints "closed" before transitioning
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setAnimatedOpen(true)
          setExitComplete(false)
        })
      })
    } else {
      cancelAnimationFrame(rafRef.current)
      // Wrap in rAF to satisfy lint (no sync setState in effect body)
      rafRef.current = requestAnimationFrame(() => {
        setAnimatedOpen(false)
      })
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [isOpen])

  // Mark exit complete when CSS transition finishes
  const onTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.target === drawerRef.current && e.propertyName === 'transform' && !isOpen) {
        setExitComplete(true)
      }
    },
    [isOpen]
  )

  // ── Escape key ──
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // ── Lock body scroll ──
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

  // ── Focus management ──
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      drawerRef.current?.focus()
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [isOpen])

  // ── Drag handle touch events ──
  const onHandleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    isDraggingRef.current = true
    dragStartYRef.current = touch.clientY
    dragCurrentYRef.current = 0
    dragVelocityRef.current = 0
    lastTouchTimeRef.current = Date.now()
    lastTouchYRef.current = touch.clientY

    // Disable CSS transition during drag
    if (drawerRef.current) {
      drawerRef.current.style.transition = 'none'
    }
  }, [])

  const onHandleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current) return
    const touch = e.touches[0]
    if (!touch) return

    const deltaY = Math.max(0, touch.clientY - dragStartYRef.current)
    dragCurrentYRef.current = deltaY

    // EMA velocity
    const now = Date.now()
    const dt = now - lastTouchTimeRef.current
    if (dt > 0) {
      const instantV = ((touch.clientY - lastTouchYRef.current) / dt) * 1000
      dragVelocityRef.current = 0.4 * instantV + 0.6 * dragVelocityRef.current
    }
    lastTouchTimeRef.current = now
    lastTouchYRef.current = touch.clientY

    // Apply transform directly (no React re-renders)
    if (drawerRef.current) {
      drawerRef.current.style.transform = `translateY(${deltaY}px)`
    }
  }, [])

  const onHandleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false

    const deltaY = dragCurrentYRef.current
    const velocity = dragVelocityRef.current

    // Restore CSS transition
    if (drawerRef.current) {
      drawerRef.current.style.transition = `transform ${DURATION} ${EASING}`
    }

    if (deltaY > DRAG_DISMISS_THRESHOLD || velocity > DRAG_VELOCITY_THRESHOLD) {
      // Dismiss
      if (drawerRef.current) {
        drawerRef.current.style.transform = 'translateY(100%)'
      }
      onClose()
    } else {
      // Snap back
      if (drawerRef.current) {
        drawerRef.current.style.transform = 'translateY(0)'
      }
    }
  }, [onClose])

  // ── Content swipe to close (uses native event for preventDefault) ──
  const contentScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enableContentSwipeToClose || !isOpen) return
    const el = contentScrollRef.current
    if (!el) return

    let startY: number | null = null
    let canSwipeClose = false
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? null
      canSwipeClose = el.scrollTop <= 0
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!canSwipeClose || startY == null) return
      const currentY = e.touches[0]?.clientY
      if (currentY == null) return

      // If content has scrolled down, cancel swipe-to-close
      if (el.scrollTop > 0) {
        canSwipeClose = false
        return
      }

      const deltaY = currentY - startY
      if (deltaY > 0) {
        // User is swiping down while at top — prevent content scroll
        e.preventDefault()
      }

      if (deltaY > contentSwipeCloseThreshold) {
        startY = null
        canSwipeClose = false
        onClose()
      }
    }

    const onTouchEnd = () => {
      startY = null
      canSwipeClose = false
    }

    // passive: false is required for preventDefault to work on iOS
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [enableContentSwipeToClose, isOpen, contentSwipeCloseThreshold, onClose])

  // ── Overlay click ──
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose()
      }
    },
    [closeOnOverlayClick, onClose]
  )

  if (!visible) return null

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        aria-hidden="true"
        style={{
          opacity: animatedOpen ? 1 : 0,
          transition: `opacity ${DURATION} ${EASING}`,
        }}
      />

      {/* Drawer container */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        onTransitionEnd={onTransitionEnd}
        className={cn(
          'relative w-full rounded-t-[28px] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl',
          'border-x border-t border-zinc-200/70 dark:border-zinc-800/80',
          'shadow-[0_24px_70px_rgba(9,9,11,0.35)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.62)]',
          'max-h-[85vh] overflow-hidden flex flex-col',
          'focus-visible:!outline-none',
          'pb-safe',
          className
        )}
        style={{
          transform: animatedOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: `transform ${DURATION} ${EASING}`,
          willChange: 'transform',
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
          onTouchStart={onHandleTouchStart}
          onTouchMove={onHandleTouchMove}
          onTouchEnd={onHandleTouchEnd}
          onTouchCancel={onHandleTouchEnd}
        >
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
              <button
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
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          ref={contentScrollRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6"
          style={{ overscrollBehavior: 'contain' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
