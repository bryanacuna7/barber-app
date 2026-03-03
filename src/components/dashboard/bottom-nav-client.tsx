'use client'

import dynamic from 'next/dynamic'

// Prevents SSR — BottomNav calls useTodayStats → useQuery which requires
// QueryClientProvider and fails during server rendering of the dashboard layout.
export const BottomNavClient = dynamic(
  () => import('./bottom-nav').then((m) => ({ default: m.BottomNav })),
  { ssr: false }
)
