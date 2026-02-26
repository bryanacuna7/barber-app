'use client'

/**
 * GuideTocSheet — Mobile floating "Índice" button that opens a bottom Sheet.
 *
 * Usage:
 *   import { GuideTocSheet } from '@/components/guide/guide-toc-sheet'
 *   <GuideTocSheet sections={GUIDE_SECTIONS} />
 *
 * Only visible on mobile (lg:hidden). Place this anywhere in the layout —
 * the button is fixed-positioned so it floats above the bottom nav.
 */

import { useState } from 'react'
import { List } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { type GuideSection, GUIDE_COLORS } from '@/lib/guide/guide-content'
import { animations, reducedMotion } from '@/lib/design-system'
import { cn } from '@/lib/utils/cn'

interface GuideTocSheetProps {
  sections: GuideSection[]
}

export function GuideTocSheet({ sections }: GuideTocSheetProps) {
  const [open, setOpen] = useState(false)
  const prefersReduced = useReducedMotion()

  const handleNavigate = (id: string) => {
    setOpen(false)
    // Small delay lets the sheet start closing before we scroll.
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  return (
    <>
      {/* Floating pill button — only on mobile */}
      <div className="lg:hidden fixed bottom-24 right-4 z-40">
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir índice de la guía"
          aria-expanded={open}
          aria-haspopup="dialog"
          whileTap={prefersReduced ? {} : { scale: 0.94 }}
          transition={prefersReduced ? reducedMotion.spring.snappy : animations.spring.snappy}
          className={cn(
            // Layout
            'flex items-center gap-2 px-4 min-h-[44px]',
            // Shape
            'rounded-full',
            // Colors — dark pill in light mode, white pill in dark mode
            'bg-zinc-900 dark:bg-white',
            'text-white dark:text-zinc-900',
            // Shadow
            'shadow-lg shadow-black/20 dark:shadow-black/40',
            // Focus ring
            'focus:outline-none focus:ring-2 focus:ring-zinc-900/40 dark:focus:ring-white/40 focus:ring-offset-2',
            'transition-shadow duration-150'
          )}
        >
          <List className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          <span className="text-sm font-semibold">Índice</span>
        </motion.button>
      </div>

      {/* Bottom Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="pb-safe max-h-[80dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Índice de la guía</SheetTitle>
          </SheetHeader>

          <nav aria-label="Secciones de la guía">
            <ul className="space-y-1 mt-1">
              {sections.map((section) => {
                const colors = GUIDE_COLORS[section.color] ?? GUIDE_COLORS['blue']
                const Icon = section.icon

                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => handleNavigate(section.id)}
                      className={cn(
                        // Full-width tap target
                        'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left',
                        // Min touch target height (Apple HIG)
                        'min-h-[44px]',
                        // Colors
                        'text-zinc-900 dark:text-white',
                        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        'active:bg-zinc-200 dark:active:bg-zinc-700',
                        'transition-colors duration-100',
                        // Focus ring
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-inset'
                      )}
                    >
                      {/* Colored icon badge */}
                      <span
                        className={cn(
                          'flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full',
                          colors.iconBg
                        )}
                        aria-hidden="true"
                      >
                        <Icon className={cn('w-4 h-4', colors.iconText)} strokeWidth={1.75} />
                      </span>

                      {/* Title */}
                      <span className="text-[15px] font-medium leading-snug">{section.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
