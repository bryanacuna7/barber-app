'use client'

/**
 * Sheet Component (Modal that slides from side/bottom)
 * Basic implementation for loyalty config preview modal
 */

import * as React from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface SheetContentProps {
  side?: 'bottom' | 'right' | 'left' | 'top'
  className?: string
  children: React.ReactNode
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

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          {children}
        </>
      )}
    </AnimatePresence>
  )
}

export function SheetContent({ side = 'bottom', className = '', children }: SheetContentProps) {
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

  const variants = slideVariants[side]

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={`fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg ${
        side === 'bottom'
          ? 'inset-x-0 bottom-0 rounded-t-2xl border-t'
          : side === 'right'
            ? 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l sm:max-w-md'
            : side === 'left'
              ? 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r sm:max-w-md'
              : 'inset-x-0 top-0 rounded-b-2xl border-b'
      } ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function SheetHeader({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>{children}</div>
}

export function SheetTitle({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={`text-lg font-semibold text-foreground ${className}`}>{children}</h2>
}

export function SheetDescription({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
}

export function SheetClose({ className = '', onClose }: { className?: string; onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none ${className}`}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}
