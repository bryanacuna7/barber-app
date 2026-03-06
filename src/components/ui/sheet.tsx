'use client'

/**
 * Sheet Component (Modal that slides from side/bottom)
 * Uses CSS transitions (compositor thread) for buttery-smooth animations.
 * Drag-to-dismiss via raw touch events — no framer-motion overhead.
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { haptics } from '@/lib/utils/mobile'

// ─── Types ─────────────────────────────────────────────────

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  zIndex?: number
}

interface SheetContentProps {
  side?: 'bottom' | 'right' | 'left' | 'top'
  centered?: boolean
  className?: string
  children: React.ReactNode
}

// ─── Context ───────────────────────────────────────────────

const SheetContext = React.createContext<{
  onOpenChange: (open: boolean) => void
  zIndex: number
  open: boolean
  animatedOpen: boolean
  onContentTransitionEnd: () => void
} | null>(null)

const useSheetContext = () => {
  const context = React.useContext(SheetContext)
  if (!context) throw new Error('Sheet components must be used within Sheet')
  return context
}

// ─── Constants ─────────────────────────────────────────────

const SHEET_OPEN_DURATION_MS = 300
const SHEET_CLOSE_DURATION_MS = 200
const BACKDROP_OPEN_DURATION_MS = 240
const BACKDROP_CLOSE_DURATION_MS = 160
const OPEN_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)' // smooth iOS-like ease out
const CLOSE_EASING = 'cubic-bezier(0.4, 0, 1, 1)' // faster ease in
const DRAG_DISMISS_THRESHOLD = 150 // px
const DRAG_VELOCITY_THRESHOLD = 500 // px/s
const REDUCED_MOTION_DURATION_MS = 10

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setPrefersReducedMotion(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return prefersReducedMotion
}

// ─── Sheet ─────────────────────────────────────────────────

export function Sheet({ open, onOpenChange, children, zIndex = 70 }: SheetProps) {
  const [mounted, setMounted] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [animatedOpen, setAnimatedOpen] = React.useState(false)
  const previousFocusRef = React.useRef<HTMLElement | null>(null)
  const rafRef = React.useRef(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  React.useEffect(() => setMounted(true), [])

  // Open/close lifecycle
  React.useEffect(() => {
    if (open) {
      setVisible(true)
      // Double rAF: ensure browser paints closed state before animating
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setAnimatedOpen(true)
        })
      })
    } else {
      cancelAnimationFrame(rafRef.current)
      setAnimatedOpen(false)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [open])

  // Called when SheetContent's transform transition finishes
  const onContentTransitionEnd = React.useCallback(() => {
    if (!open) setVisible(false)
  }, [open])

  // Body scroll lock
  React.useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
        previousFocusRef.current = null
      }
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  const ctxValue = React.useMemo(
    () => ({ onOpenChange, zIndex, open, animatedOpen, onContentTransitionEnd }),
    [onOpenChange, zIndex, open, animatedOpen, onContentTransitionEnd]
  )

  if (!mounted || !visible) return null

  const portal = (
    <>
      {/* Backdrop — CSS opacity transition */}
      <div
        onClick={() => onOpenChange(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex,
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: animatedOpen ? 1 : 0,
          transition: `opacity ${
            prefersReducedMotion
              ? REDUCED_MOTION_DURATION_MS
              : open
                ? BACKDROP_OPEN_DURATION_MS
                : BACKDROP_CLOSE_DURATION_MS
          }ms ${open ? OPEN_EASING : CLOSE_EASING}`,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />
      {children}
    </>
  )

  return (
    <SheetContext.Provider value={ctxValue}>
      {createPortal(portal, document.body)}
    </SheetContext.Provider>
  )
}

// ─── SheetContent ──────────────────────────────────────────

export function SheetContent({
  side = 'bottom',
  centered = false,
  className = '',
  children,
}: SheetContentProps) {
  const { onOpenChange, zIndex, open, animatedOpen, onContentTransitionEnd } = useSheetContext()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef({ startY: 0, currentY: 0, active: false, startTime: 0 })
  const prefersReducedMotion = usePrefersReducedMotion()

  const isBottomSheet = side === 'bottom' && !centered
  const isCenteredBottomSheet = side === 'bottom' && centered

  // ── Transform based on side + open state ──

  const getTransform = (): string => {
    if (isCenteredBottomSheet) {
      return animatedOpen
        ? 'translate(-50%, -50%) scale(1)'
        : 'translate(-50%, calc(-50% + 24px)) scale(0.98)'
    }
    const closed: Record<string, string> = {
      bottom: 'translateY(100%)',
      right: 'translateX(100%)',
      left: 'translateX(-100%)',
      top: 'translateY(-100%)',
    }
    return animatedOpen ? 'translateY(0)' : closed[side]
  }

  // ── Touch drag-to-dismiss (bottom sheets only) ──

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (!isBottomSheet || !open) return
      // Don't start drag from interactive elements (buttons, inputs, etc.)
      const target = e.target as HTMLElement
      if (target.closest('button, a, input, textarea, select, [role="button"]')) return
      dragRef.current = {
        startY: e.touches[0].clientY,
        currentY: 0,
        active: true,
        startTime: Date.now(),
      }
      if (contentRef.current) {
        contentRef.current.style.transition = 'none'
      }
    },
    [isBottomSheet, open]
  )

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    const ds = dragRef.current
    if (!ds.active || !contentRef.current) return
    const deltaY = e.touches[0].clientY - ds.startY
    if (deltaY > 0) {
      contentRef.current.style.transform = `translateY(${deltaY}px)`
      ds.currentY = deltaY
    }
  }, [])

  const handleTouchEnd = React.useCallback(() => {
    const ds = dragRef.current
    if (!ds.active || !contentRef.current) return
    ds.active = false
    const el = contentRef.current
    const elapsed = Math.max(Date.now() - ds.startTime, 1)
    const velocity = (ds.currentY / elapsed) * 1000

    if (ds.currentY > DRAG_DISMISS_THRESHOLD || velocity > DRAG_VELOCITY_THRESHOLD) {
      // Dismiss
      haptics.tap()
      el.style.transition = `transform ${
        prefersReducedMotion ? REDUCED_MOTION_DURATION_MS : SHEET_CLOSE_DURATION_MS
      }ms ${CLOSE_EASING}`
      el.style.transform = 'translateY(100%)'
      const done = () => {
        el.removeEventListener('transitionend', done)
        onOpenChange(false)
      }
      el.addEventListener('transitionend', done)
    } else {
      // Snap back
      el.style.transition = `transform ${
        prefersReducedMotion ? REDUCED_MOTION_DURATION_MS : SHEET_OPEN_DURATION_MS
      }ms ${OPEN_EASING}`
      el.style.transform = 'translateY(0)'
      const done = () => {
        el.removeEventListener('transitionend', done)
        // Restore React-managed styles
        el.style.removeProperty('transition')
        el.style.removeProperty('transform')
      }
      el.addEventListener('transitionend', done)
    }
    ds.currentY = 0
  }, [onOpenChange, prefersReducedMotion])

  // ── Transition end handler (for close unmount) ──

  const handleTransitionEnd = React.useCallback(
    (e: React.TransitionEvent) => {
      // Only react to this element's transform transition (ignore bubbled events)
      if (e.target === contentRef.current && e.propertyName === 'transform') {
        onContentTransitionEnd()
      }
    },
    [onContentTransitionEnd]
  )

  // ── Position classes ──

  const positionClass = isCenteredBottomSheet
    ? 'left-1/2 top-1/2 w-[calc(100%-1rem)] max-w-lg rounded-[28px] border border-zinc-200/70 dark:border-zinc-800/80'
    : side === 'bottom'
      ? 'inset-x-0 bottom-0 rounded-t-[28px] border-x border-t border-zinc-200/70 dark:border-zinc-800/80 touch-pan-x'
      : side === 'right'
        ? 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-zinc-200/70 dark:border-zinc-800/80 sm:max-w-md'
        : side === 'left'
          ? 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-zinc-200/70 dark:border-zinc-800/80 sm:max-w-md'
          : 'inset-x-0 top-0 rounded-b-[28px] border-x border-b border-zinc-200/70 dark:border-zinc-800/80'

  // ── Transition string ──

  const transitionDuration = prefersReducedMotion
    ? REDUCED_MOTION_DURATION_MS
    : open
      ? SHEET_OPEN_DURATION_MS
      : SHEET_CLOSE_DURATION_MS
  const transitionEasing = open ? OPEN_EASING : CLOSE_EASING
  const transitionProp = isCenteredBottomSheet
    ? `transform ${transitionDuration}ms ${transitionEasing}, opacity ${transitionDuration}ms ${transitionEasing}`
    : `transform ${transitionDuration}ms ${transitionEasing}`

  return (
    <div
      ref={contentRef}
      onTransitionEnd={handleTransitionEnd}
      {...(isBottomSheet && {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
      })}
      className={`fixed flex flex-col gap-4 p-6 bg-white dark:bg-zinc-950 shadow-[0_24px_70px_rgba(9,9,11,0.35)] dark:shadow-[0_30px_90px_rgba(0,0,0,0.62)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-zinc-300/70 before:to-transparent dark:before:via-zinc-600/60 ${positionClass} ${className}`}
      style={{
        zIndex: zIndex + 1,
        transform: getTransform(),
        opacity: isCenteredBottomSheet ? (animatedOpen ? 1 : 0) : undefined,
        transition: transitionProp,
        pointerEvents: open ? 'auto' : 'none',
        willChange: 'transform',
      }}
    >
      {/* Drag handle for bottom sheets */}
      {isBottomSheet && (
        <div className="flex justify-center -mt-2 mb-2 md:hidden">
          <div className="h-1 w-10 rounded-full bg-zinc-300/90 dark:bg-zinc-700/90" />
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Subcomponents ─────────────────────────────────────────

export function SheetHeader({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>
      {children}
    </div>
  )
}

export function SheetTitle({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <h2 className={`text-lg font-semibold text-foreground ${className}`}>{children}</h2>
}

export function SheetDescription({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
}

export function SheetClose({
  className = '',
  onClose,
}: {
  className?: string
  onClose: () => void
}) {
  return (
    <button
      onClick={onClose}
      aria-label="Cerrar"
      className={`absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-xl opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none ${className}`}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Cerrar</span>
    </button>
  )
}
