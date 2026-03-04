'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X, type LucideIcon } from 'lucide-react'
import { animations, reducedMotion } from '@/lib/design-system'

export interface QuickActionItem {
  id: string
  label: string
  description?: string
  icon: LucideIcon
  onSelect: () => void
}

interface QuickActionsSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  actions: QuickActionItem[]
  showBottomConnector?: boolean
  bottomOffsetPx?: number
}

export function QuickActionsSheet({
  isOpen,
  onClose,
  title = 'Crear nuevo',
  actions,
  showBottomConnector = false,
  bottomOffsetPx,
}: QuickActionsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    sheetRef.current?.querySelector<HTMLElement>('button')?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !sheetRef.current) return

      const focusables = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'))

      if (focusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (active === first || active === sheetRef.current) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      if (previousFocusRef.current && previousFocusRef.current.isConnected) {
        previousFocusRef.current.focus()
      }
      previousFocusRef.current = null
    }
  }, [isOpen, onClose])

  const handleActionSelect = (onSelect: () => void) => {
    onClose()
    onSelect()
  }

  const sheetMarginBottom =
    typeof bottomOffsetPx === 'number'
      ? `calc(env(safe-area-inset-bottom, 0px) + ${bottomOffsetPx}px)`
      : 'calc(env(safe-area-inset-bottom, 0px) + 16px)'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion
                ? reducedMotion.spring.default.duration
                : animations.duration.normal,
            }}
            onClick={onClose}
            className={`fixed inset-0 z-[200] backdrop-blur-sm lg:hidden ${
              showBottomConnector
                ? 'bg-gradient-to-t from-black/25 via-black/62 to-black/72'
                : 'bg-black/70'
            }`}
            aria-hidden="true"
          />

          <motion.div
            ref={sheetRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-actions-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={prefersReducedMotion ? reducedMotion.spring.sheet : animations.spring.sheet}
            className="fixed bottom-0 left-0 right-0 z-[201] lg:hidden"
          >
            <div className="relative mx-4" style={{ marginBottom: sheetMarginBottom }}>
              <div className="overflow-hidden rounded-[28px] border border-zinc-200/70 bg-white/95 shadow-[0_24px_70px_rgba(9,9,11,0.35)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/92 dark:shadow-[0_30px_90px_rgba(0,0,0,0.62)]">
                <div className="flex items-center justify-between bg-gradient-to-b from-zinc-50/80 to-transparent px-5 pb-3 pt-4 dark:from-zinc-800/55">
                  <h3
                    id="quick-actions-title"
                    className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
                  >
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100"
                    aria-label="Cerrar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1 px-3 pb-4 pt-2">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionSelect(action.onSelect)}
                      className="flex min-h-[56px] w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-zinc-900 transition-colors hover:bg-zinc-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 dark:text-zinc-100 dark:hover:bg-zinc-800/70"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 backdrop-blur dark:bg-zinc-800/70">
                        <action.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
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
              </div>

              {showBottomConnector && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2"
                >
                  <div className="mx-auto h-8 w-px bg-gradient-to-b from-[var(--brand-primary)]/75 to-transparent dark:from-[var(--brand-primary)]/80" />
                  <div className="mt-0.5 h-2 w-12 rounded-full bg-[var(--brand-primary)]/45 blur-[1px]" />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
