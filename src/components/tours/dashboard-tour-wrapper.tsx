'use client';

/**
 * Dashboard Tour Wrapper
 * Client component that activates the dashboard tour
 */

import { useEffect } from 'react';
import { useAutoTour } from '@/lib/tours/use-auto-tour';
import { TOUR_IDS } from '@/lib/tours/tour-definitions';

export function DashboardTourWrapper({ children }: { children: React.ReactNode }) {
  // Auto-start dashboard tour on first visit
  useAutoTour(TOUR_IDS.DASHBOARD);

  return <>{children}</>;
}
