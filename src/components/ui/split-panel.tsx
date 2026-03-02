'use client'

/**
 * SplitPanel — Master-detail layout for desktop, Sheet overlay for mobile.
 *
 * Desktop (lg+): inline split — list shrinks, detail panel slides in from right.
 * Mobile (<lg): reuses existing Sheet component with side="right".
 *
 * Inspired by Linear/Apple Mail master-detail pattern.
 */

import { useEffect, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { animations } from '@/lib/design-system'
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'

// lg breakpoint = 1024px
const lgQuery = '(min-width: 1024px)'
const subscribe = (cb: () => void) => {
  const mql = window.matchMedia(lgQuery)
  mql.addEventListener('change', cb)
  return () => mql.removeEventListener('change', cb)
}
const getSnapshot = () => window.matchMedia(lgQuery).matches
const getServerSnapshot = () => true // assume desktop on server

interface SplitPanelProps {
  /** Whether the detail panel is open */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Panel width in px (desktop only). Default 420 */
  panelWidth?: number
  /** Main content (list) */
  children: React.ReactNode
  /** Detail content rendered in the panel */
  panel: React.ReactNode
}

export function SplitPanel({
  isOpen,
  onClose,
  panelWidth = 420,
  children,
  panel,
}: SplitPanelProps) {
  const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Escape key closes panel
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <>
      {/* Desktop: inline split layout */}
      <div className="hidden items-start gap-4 lg:flex">
        <div className="flex-1 min-w-0">{children}</div>
        <AnimatePresence>
          {isOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: panelWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={animations.spring.layout}
              className="relative shrink-0 self-stretch overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/90 shadow-[0_8px_24px_rgba(16,24,40,0.08)] dark:border-zinc-800/80 dark:bg-zinc-900/90 dark:shadow-[0_14px_36px_rgba(0,0,0,0.35)]"
            >
              <div className="h-full overflow-y-auto" style={{ width: panelWidth }}>
                {/* Close button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-3 z-10 p-2 rounded-lg text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Cerrar panel"
                >
                  <X className="h-4 w-4" />
                </button>
                {panel}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile: full-width list + Sheet overlay */}
      <div className="lg:hidden">{children}</div>
      {!isDesktop && (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
            <SheetClose onClose={onClose} />
            {panel}
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
