'use client'

/**
 * Collapsible Section
 * Reusable wrapper for progressive disclosure
 * Smooth animations with framer-motion
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { animations, reducedMotion } from '@/lib/design-system'

interface Props {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  className = '',
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={className}>
      {/* Header button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-white/[0.04] px-4 py-3 text-left shadow-sm transition-colors hover:bg-zinc-100/80 dark:hover:bg-white/10"
        aria-expanded={isOpen}
        aria-controls={`collapsible-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`collapsible-${title.replace(/\s+/g, '-').toLowerCase()}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: reducedMotion.spring.default.duration }
                : {
                    duration: animations.duration.normal,
                    ease: animations.easing.easeInOut as [number, number, number, number],
                  }
            }
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
