'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DashboardPageHeaderBreadcrumb {
  label: string
  href?: string
}

interface DashboardPageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: DashboardPageHeaderBreadcrumb[]
  actions?: ReactNode
  className?: string
}

export function DashboardPageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: DashboardPageHeaderProps) {
  const hasBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 0)

  return (
    <header className={cn('hidden lg:block', className)}>
      {hasBreadcrumbs && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {breadcrumbs?.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="rounded px-1 py-0.5 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="px-1 py-0.5 text-zinc-700 dark:text-zinc-300">
                    {crumb.label}
                  </span>
                )}
                {index < (breadcrumbs?.length ?? 0) - 1 && <ChevronRight className="h-3 w-3" />}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="app-page-title">{title}</h1>
          {subtitle && <p className="app-page-subtitle mt-1">{subtitle}</p>}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </header>
  )
}
