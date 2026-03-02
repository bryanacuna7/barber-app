'use client'

import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'
import { animations, reducedMotion as reducedMotionTokens } from '@/lib/design-system'
import { shortcutRegistry } from '@/lib/keyboard/shortcut-registry'

interface CommandShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

/** Static palette-internal shortcuts (not registered in the global registry) */
const PALETTE_INTERNAL_SHORTCUTS = [
  { keys: '↑ / ↓', description: 'Navegar comandos' },
  { keys: 'Enter', description: 'Ejecutar comando seleccionado' },
  { keys: 'Esc', description: 'Cerrar palette o ayuda' },
]

const CATEGORY_LABELS: Record<string, string> = {
  palette: 'Command Palette',
  navigation: 'Navegación',
  action: 'Acciones',
}

const CATEGORY_ORDER = ['palette', 'navigation', 'action'] as const

export function CommandShortcutsHelp({ isOpen, onClose }: CommandShortcutsHelpProps) {
  const prefersReducedMotion = useReducedMotion()

  // Handle Escape at capture phase so help closes first when layered over command palette.
  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onClose()
    }

    document.addEventListener('keydown', handleEscape, true)
    return () => document.removeEventListener('keydown', handleEscape, true)
  }, [isOpen, onClose])

  // Build dynamic shortcuts list from registry + palette-internal
  const groupedShortcuts = useMemo(() => {
    if (!isOpen) return []

    const registered = shortcutRegistry.getAll()

    const groups: { category: string; items: { keys: string; description: string }[] }[] = []

    for (const cat of CATEGORY_ORDER) {
      const items = registered
        .filter((s) => s.category === cat)
        .map((s) => ({ keys: s.keys, description: s.description }))

      // Append palette-internal shortcuts to the palette category
      if (cat === 'palette') {
        items.push(...PALETTE_INTERNAL_SHORTCUTS)
      }

      if (items.length > 0) {
        groups.push({ category: cat, items })
      }
    }

    return groups
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: reducedMotionTokens.spring.default.duration }
                : { duration: animations.duration.fast }
            }
            className="fixed inset-0 z-[70] bg-black/45"
            onClick={onClose}
          />

          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            transition={
              prefersReducedMotion
                ? { duration: reducedMotionTokens.spring.default.duration }
                : animations.spring.default
            }
            className="fixed left-1/2 top-[20vh] z-[71] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-700/70 dark:bg-zinc-900/95"
            role="dialog"
            aria-modal="true"
            aria-label="Ayuda de atajos de teclado"
          >
            <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-700/80">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <Keyboard className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Atajos de Teclado
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Navegación rápida del dashboard
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar ayuda de atajos"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {groupedShortcuts.map((group) => (
                <div key={group.category}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {CATEGORY_LABELS[group.category] ?? group.category}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((item) => (
                      <div
                        key={item.keys}
                        className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200/70 bg-zinc-50/70 px-3 py-2.5 dark:border-zinc-800/70 dark:bg-zinc-800/50"
                      >
                        <span className="text-sm text-zinc-700 dark:text-zinc-200">
                          {item.description}
                        </span>
                        <kbd className="whitespace-nowrap rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                          {item.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
