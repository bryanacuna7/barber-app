'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
 * On mobile, content is collapsed by default with a ChevronDown toggle.
 */
export function CollapsibleSection({
  title,
  badge,
  children,
  alwaysVisibleAbove = 'lg',
  className,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(false)
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
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={cn(expanded ? '' : `hidden ${blockClass}`)}
      >
        {children}
      </div>
    </div>
  )
}
