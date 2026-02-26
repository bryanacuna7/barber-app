'use client'

/**
 * GuideContextualTip — Dismissible blue info box that links to a guide section.
 *
 * Matches the "¿Cómo funciona?" pattern from configuracion/pagos.
 * Dismissal is persisted in localStorage scoped to business + user + tip.
 */

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Info, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useBusiness } from '@/contexts/business-context'

interface GuideContextualTipProps {
  /** Unique identifier for this tip (e.g., 'dashboard', 'citas') */
  tipId: string
  title: string
  description: string
  /** Link to the guide section (e.g., '/guia#citas') */
  linkHref: string
  linkText?: string
  className?: string
}

function getStorageKey(businessId: string, userId: string, tipId: string) {
  return `guide-tip-${businessId}-${userId}-${tipId}`
}

function readDismissed(businessId: string, userId: string, tipId: string) {
  if (typeof window === 'undefined') return true // SSR: hidden
  return localStorage.getItem(getStorageKey(businessId, userId, tipId)) === 'true'
}

export function GuideContextualTip({
  tipId,
  title,
  description,
  linkHref,
  linkText = 'Ver en la guía',
  className,
}: GuideContextualTipProps) {
  const { businessId, userId } = useBusiness()
  const [dismissed, setDismissed] = useState(() => readDismissed(businessId, userId, tipId))

  const handleDismiss = useCallback(() => {
    const key = getStorageKey(businessId, userId, tipId)
    localStorage.setItem(key, 'true')
    setDismissed(true)
  }, [businessId, userId, tipId])

  if (dismissed) return null

  return (
    <div
      className={cn(
        'flex items-start gap-3.5 rounded-2xl px-4 py-4 sm:px-5 sm:py-4.5',
        'bg-blue-50 dark:bg-blue-950/30',
        className
      )}
      role="status"
    >
      <Info
        className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5"
        strokeWidth={1.75}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-[15px] font-semibold leading-snug text-blue-900 dark:text-blue-100">
          {title}
        </p>
        <p className="text-[14px] text-blue-700 dark:text-blue-300 leading-relaxed">
          {description}
        </p>
        <Link
          href={linkHref}
          className="inline-block pt-0.5 text-[14px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          {linkText} →
        </Link>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Cerrar consejo"
        className={cn(
          'shrink-0 self-start grid place-items-center h-8 w-8 rounded-md -mr-1',
          'text-blue-400 dark:text-blue-500',
          'hover:text-blue-600 dark:hover:text-blue-300',
          'hover:bg-blue-100 dark:hover:bg-blue-900/40',
          'transition-colors duration-150'
        )}
      >
        <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  )
}
