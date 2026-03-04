'use client'

import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { animations, reducedMotion } from '@/lib/design-system'

export interface QuickPopoverActionItem {
  id: string
  label: string
  description?: string
  icon: LucideIcon
  onSelect: () => void
}

export interface PopoverAnchorRect {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

interface QuickActionsPopoverProps {
  isOpen: boolean
  onClose: () => void
  anchorRect: PopoverAnchorRect | null
  actions: QuickPopoverActionItem[]
  width?: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function QuickActionsPopover({
  isOpen,
  onClose,
  anchorRect,
  actions,
  width = 304,
}: QuickActionsPopoverProps) {
  const prefersReducedMotion = useReducedMotion()
  const popoverRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const positioning = useMemo(() => {
    if (!anchorRect || typeof window === 'undefined') return null

    const viewportWidth = window.innerWidth
    const margin = 12
    const left = clamp(anchorRect.right - width + 8, margin, viewportWidth - width - margin)
    const top = anchorRect.bottom + 8
    const anchorCenterX = anchorRect.left + anchorRect.width / 2
    const caretLeft = clamp(anchorCenterX - left, 22, width - 22)

    return { left, top, caretLeft }
  }, [anchorRect, width])

  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    popoverRef.current?.querySelector<HTMLElement>('button')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previouslyFocusedRef.current && previouslyFocusedRef.current.isConnected) {
        previouslyFocusedRef.current.focus()
      }
      previouslyFocusedRef.current = null
    }
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && positioning && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion
                ? reducedMotion.spring.default.duration
                : animations.duration.fast,
            }}
            className="fixed inset-0 z-[200] lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={popoverRef}
            role="dialog"
            aria-modal="true"
            aria-label="Acciones rápidas"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.93, y: -6 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.93, y: -6 }}
            transition={
              prefersReducedMotion
                ? { duration: reducedMotion.spring.default.duration }
                : animations.spring.default
            }
            className="fixed z-[201] overflow-hidden rounded-[24px] border border-zinc-200/70 bg-white/95 p-2 shadow-[0_20px_52px_rgba(9,9,11,0.35)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/94 dark:shadow-[0_24px_64px_rgba(0,0,0,0.58)] lg:hidden"
            style={
              {
                width: `${width}px`,
                top: `${positioning.top}px`,
                left: `${positioning.left}px`,
                transformOrigin: `${positioning.caretLeft}px top`,
              } as CSSProperties
            }
          >
            <div
              aria-hidden
              className="absolute -top-1 h-2 w-2 rotate-45 border-l border-t border-zinc-200/70 bg-white/95 dark:border-zinc-800/80 dark:bg-zinc-900/94"
              style={{ left: `${positioning.caretLeft - 4}px` }}
            />

            <div className="space-y-1">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    onClose()
                    action.onSelect()
                  }}
                  className="flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 dark:hover:bg-zinc-800/70"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/85">
                    <action.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                      {action.label}
                    </p>
                    {action.description && (
                      <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-300">
                        {action.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
