'use client'

/**
 * Collapsible Section
 * Reusable wrapper for progressive disclosure
 * Smooth animations with framer-motion
 */

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function CollapsibleSection({ title, defaultOpen = false, children, className = '' }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      {/* Header button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-background px-4 py-3 text-left transition-colors hover:bg-muted/30"
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
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
