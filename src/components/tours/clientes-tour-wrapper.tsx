'use client';

/**
 * Clientes Tour Wrapper
 * Client component that activates the clientes tour
 */

import { useEffect } from 'react';
import { useAutoTour } from '@/lib/tours/use-auto-tour';
import { TOUR_IDS } from '@/lib/tours/tour-definitions';

export function ClientesTourWrapper({ children }: { children: React.ReactNode }) {
  // Auto-start clientes tour on first visit
  useAutoTour(TOUR_IDS.CLIENTES);

  return <>{children}</>;
}
