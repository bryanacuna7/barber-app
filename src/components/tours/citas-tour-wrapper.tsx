'use client'

/**
 * Citas Tour Wrapper
 * Client component that activates the citas tour
 */

import { useEffect } from 'react'
import { useAutoTour } from '@/lib/tours/use-auto-tour'
import { TOUR_IDS } from '@/lib/tours/tour-definitions'

export function CitasTourWrapper({ children }: { children: React.ReactNode }) {
  // Auto-start citas tour on first visit
  useAutoTour(TOUR_IDS.CITAS)

  return <>{children}</>
}
