'use client'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFaviconBadge } from '@/hooks/useFaviconBadge'

interface ClientEffectsProps {
  title: string
  badgeCount?: number
}

/**
 * Thin 'use client' wrapper for page-level side effects.
 * Pages can render this without needing 'use client' themselves.
 */
export function ClientEffects({ title, badgeCount }: ClientEffectsProps) {
  useDocumentTitle(title)
  useFaviconBadge(badgeCount ?? 0)
  return null
}
