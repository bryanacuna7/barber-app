'use client'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useFaviconBadge } from '@/hooks/useFaviconBadge'
import { useBusiness } from '@/contexts/business-context'

interface ClientEffectsProps {
  title: string
  badgeCount?: number
}

/**
 * Thin 'use client' wrapper for page-level side effects.
 * Pages can render this without needing 'use client' themselves.
 */
export function ClientEffects({ title, badgeCount }: ClientEffectsProps) {
  const { businessName } = useBusiness()
  useDocumentTitle(title, businessName)
  useFaviconBadge(badgeCount ?? 0)
  return null
}
