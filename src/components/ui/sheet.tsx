'use client'

/**
 * Sheet Component (Modal that slides from side/bottom)
 * With drag-to-dismiss support for bottom sheets
 */

import * as React from 'react'
import { X } from 'lucide-react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useReducedMotion,
  PanInfo,
} from 'framer-motion'
import { animations, reducedMotion } from '@/lib/design-system'
import { haptics } from '@/lib/utils/mobile'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface SheetContentProps {
  side?: 'bottom' | 'right' | 'left' | 'top'
  centered?: boolean
  className?: string
  children: React.ReactNode
}

// Context to pass onOpenChange to SheetContent
const SheetContext = React.createContext<{
  onOpenChange: (open: boolean) => void
} | null>(null)

const useSheetContext = () => {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error('Sheet components must be used within Sheet')
  }
  return context
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  return (
    <SheetContext.Provider value={{ onOpenChange }}>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
            />
            {children}
          </>
        )}
      </AnimatePresence>
    </SheetContext.Provider>
  )
}

export function SheetContent({
  side = 'bottom',
  centered = false,
  className = '',
  children,
}: SheetContentProps) {
  const { onOpenChange } = useSheetContext()
  const prefersReducedMotion = useReducedMotion()
  const [isDragging, setIsDragging] = React.useState(false)

  // Drag state for bottom sheets
  const y = useMotionValue(0)
  const sheetOpacity = useTransform(y, [0, 200], [1, 0.5])

  const slideVariants = {
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    top: {
      initial: { y: '-100%' },
      animate: { y: 0 },
      exit: { y: '-100%' },
    },
  }

  const isCenteredBottomSheet = side === 'bottom' && centered
  const variants = isCenteredBottomSheet
    ? {
        initial: { opacity: 0, scale: 0.98, x: '-50%', y: 'calc(-50% + 24px)' },
        animate: { opacity: 1, scale: 1, x: '-50%', y: '-50%' },
        exit: { opacity: 0, scale: 0.98, x: '-50%', y: 'calc(-50% + 24px)' },
      }
    : slideVariants[side]
  const isBottomSheet = side === 'bottom' && !centered

  // Drag handlers for bottom sheets only
  const handleDragStart = () => {
    if (isBottomSheet) {
      setIsDragging(true)
    }
  }

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isBottomSheet) {
      // Only allow dragging down
      if (info.offset.y > 0) {
        y.set(info.offset.y)
      } else {
        y.set(0)
      }
    }
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isBottomSheet) {
      setIsDragging(false)
      const threshold = 150

      // Close if dragged down beyond threshold or velocity is high
      if (info.offset.y > threshold || info.velocity.y > 500) {
        haptics.tap() // Haptic feedback on sheet dismiss
        onOpenChange(false)
      } else {
        // Snap back
        y.set(0)
      }
    }
  }

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={prefersReducedMotion ? reducedMotion.spring.sheet : animations.spring.sheet}
      {...(isBottomSheet && {
        drag: 'y',
        dragDirectionLock: true,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.5 },
        onDragStart: handleDragStart,
        onDrag: handleDrag,
        onDragEnd: handleDragEnd,
        style: {
          y: isDragging ? y : 0,
          opacity: sheetOpacity,
        },
      })}
      className={`fixed z-[71] flex flex-col gap-4 bg-background p-6 shadow-lg ${
        isCenteredBottomSheet
          ? 'left-1/2 top-1/2 w-[calc(100%-1rem)] max-w-lg rounded-2xl border'
          : side === 'bottom'
            ? 'inset-x-0 bottom-0 rounded-t-2xl border-t touch-pan-x'
            : side === 'right'
              ? 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l sm:max-w-md'
              : side === 'left'
                ? 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r sm:max-w-md'
                : 'inset-x-0 top-0 rounded-b-2xl border-b'
      } ${className}`}
    >
      {/* Drag handle for bottom sheets */}
      {isBottomSheet && (
        <div className="flex justify-center -mt-2 mb-2 md:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
      )}
      {children}
    </motion.div>
  )
}

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
      className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none ${className}`}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Cerrar</span>
    </button>
  )
}
