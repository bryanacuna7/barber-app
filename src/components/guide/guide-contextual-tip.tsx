'use client'

/**
 * GuideContextualTip — Dismissible blue info box that links to a guide section.
 *
 * Matches the "¿Cómo funciona?" pattern from configuracion/pagos.
 * Dismissal is persisted in localStorage scoped to business + user + tip.
 */

import { useState, useCallback, useMemo } from 'react'
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
  /** Single-line compact layout for mobile. Default false = full layout (desktop). */
  compact?: boolean
}

function getStorageKey(businessId: string, userId: string, tipId: string) {
  return `guide-tip-${businessId}-${userId}-${tipId}`
}

export function GuideContextualTip({
  tipId,
  title,
  description,
  linkHref,
  linkText = 'Ver en la guía',
  className,
  compact = false,
}: GuideContextualTipProps) {
  const { businessId, userId } = useBusiness()
  const [dismissedInSession, setDismissedInSession] = useState(false)
  const storageKey = useMemo(
    () => getStorageKey(businessId, userId, tipId),
    [businessId, userId, tipId]
  )

  const isDismissedFromStorage = useMemo(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(storageKey) === 'true'
    } catch {
      return false
    }
  }, [storageKey])

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(storageKey, 'true')
    } catch {
      // Ignore localStorage write failures and still dismiss in-session.
    }
    setDismissedInSession(true)
  }, [storageKey])

  if (dismissedInSession || isDismissedFromStorage) return null

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5',
          'bg-blue-50 dark:bg-blue-950/30',
          className
        )}
        role="status"
      >
        <Info
          className="h-4 w-4 text-blue-500 dark:text-blue-400 shrink-0"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <p className="flex-1 min-w-0 text-[13px] font-medium text-blue-800 dark:text-blue-200 truncate">
          {title}
        </p>
        <Link
          href={linkHref}
          className="shrink-0 text-[13px] font-medium text-blue-600 dark:text-blue-400"
        >
          {linkText} →
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar consejo"
          className="shrink-0 grid place-items-center h-6 w-6 rounded text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    )
  }

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
