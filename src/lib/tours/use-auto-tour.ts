'use client'

/**
 * useAutoTour Hook
 * Automatically starts a tour on first visit to a page
 */

import { useEffect } from 'react'
import { useTour } from './tour-provider'

export function useAutoTour(tourId: string) {
  const { startTour, isTourCompleted, isRunning } = useTour()

  useEffect(() => {
    // Don't start if tour is already running or completed
    if (isRunning || isTourCompleted(tourId)) {
      return
    }

    // Small delay to ensure page elements are rendered
    const timer = setTimeout(() => {
      startTour(tourId)
    }, 500)

    return () => clearTimeout(timer)
  }, [tourId, startTour, isTourCompleted, isRunning])
}
