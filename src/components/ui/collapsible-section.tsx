'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { animations, reducedMotion } from '@/lib/design-system'

interface CollapsibleSectionProps {
  title: string
  badge?: string | number
  children: React.ReactNode
  /** Breakpoint above which section is always visible. Default: 'lg' */
  alwaysVisibleAbove?: 'md' | 'lg' | 'xl'
  className?: string
}

/**
 * Mobile-only collapsible section (Ola 3 pattern).
 * On desktop (above breakpoint), content is always visible and toggle is hidden.
 * On mobile, content is collapsed by default with animated height transition.
 */
export function CollapsibleSection({
  title,
  badge,
  children,
  alwaysVisibleAbove = 'lg',
  className,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const baseId = useId().replace(/:/g, '')
  const buttonId = `collapsible-trigger-${baseId}`
  const contentId = `collapsible-content-${baseId}`

  const hiddenClass =
    alwaysVisibleAbove === 'md'
      ? 'md:hidden'
      : alwaysVisibleAbove === 'xl'
        ? 'xl:hidden'
        : 'lg:hidden'
  const blockClass =
    alwaysVisibleAbove === 'md' ? 'md:block' : alwaysVisibleAbove === 'xl' ? 'xl:block' : 'lg:block'

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn('flex items-center justify-between w-full px-1 py-2', hiddenClass)}
        id={buttonId}
        aria-expanded={expanded}
        aria-controls={contentId}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</span>
          {badge !== undefined && badge !== null && (
            <span className="text-xs text-muted">({badge})</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {/* Mobile: animated collapse/expand */}
      {/* ⚠️ dual-render: safe only for static children (no effects/state/form IDs) */}
      <div className={hiddenClass}>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={contentId}
              role="region"
              aria-labelledby={buttonId}
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
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: always visible, no animation */}
      <div className={cn('hidden', blockClass)} role="region" aria-labelledby={buttonId}>
        {children}
      </div>
    </div>
  )
}
