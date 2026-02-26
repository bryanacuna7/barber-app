'use client'

/**
 * GuideTocSidebar — Desktop sticky table of contents with IntersectionObserver.
 *
 * Usage:
 *   import { GuideTocSidebar } from '@/components/guide/guide-toc-sidebar'
 *   <GuideTocSidebar sections={GUIDE_SECTIONS} />
 *
 * Renders only on desktop (hidden lg:block wrapper must be placed by the
 * parent layout — or use the className prop).
 */

import { useEffect, useRef, useState } from 'react'
import { type GuideSection, GUIDE_COLORS } from '@/lib/guide/guide-content'
import { cn } from '@/lib/utils/cn'

interface GuideTocSidebarProps {
  sections: GuideSection[]
  className?: string
}

export function GuideTocSidebar({ sections, className }: GuideTocSidebarProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Track which sections are intersecting and pick the topmost one.
  const intersectingRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersectingRef.current.add(entry.target.id)
          } else {
            intersectingRef.current.delete(entry.target.id)
          }
        })

        // Find the topmost intersecting section in document order.
        const topmost = sections.find((s) => intersectingRef.current.has(s.id))
        if (topmost) {
          setActiveId(topmost.id)
        }
      },
      {
        // Show section as active when it occupies the upper-middle viewport band.
        rootMargin: '-20% 0px -60% 0px',
      }
    )

    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [sections])

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav aria-label="Tabla de contenidos" className={cn('sticky top-6', className)}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500 px-3">
        En esta guía
      </p>

      <ul className="space-y-0.5">
        {sections.map((section) => {
          const isActive = activeId === section.id
          const colors = GUIDE_COLORS[section.color] ?? GUIDE_COLORS['blue']
          const Icon = section.icon

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => handleClick(section.id)}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  // Base layout
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left',
                  // Min touch target
                  'min-h-[44px]',
                  // Left border indicator
                  'border-l-2',
                  // Transition
                  'transition-colors duration-150',
                  // Active state
                  isActive
                    ? 'border-blue-500 text-zinc-900 dark:text-white font-medium bg-zinc-50 dark:bg-zinc-800/60'
                    : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                )}
              >
                {/* Small colored icon */}
                <span
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center w-5 h-5',
                    isActive ? colors.iconText : 'text-zinc-400 dark:text-zinc-500',
                    'transition-colors duration-150'
                  )}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </span>

                <span className="text-sm leading-snug truncate">{section.title}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
