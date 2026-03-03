'use client'

import dynamic from 'next/dynamic'

// Prevents SSR — NextUpChip calls useQuery which requires QueryClientProvider
// and fails during server rendering of the dashboard layout.
export const NextUpChipClient = dynamic(
  () => import('./next-up-chip').then((m) => ({ default: m.NextUpChip })),
  { ssr: false }
)
