/**
 * Analytics Dashboard Page - Feature Flag Router
 *
 * Routes between OLD (page-old.tsx) and NEW (page-v2.tsx) implementations
 * based on NEXT_PUBLIC_FF_NEW_ANALYTICS feature flag.
 *
 * Created: Session 117 - Phase 0 Week 5-6
 *
 * Feature Flag:
 * - NEXT_PUBLIC_FF_NEW_ANALYTICS=true  → page-v2.tsx (React Query + Real-time)
 * - NEXT_PUBLIC_FF_NEW_ANALYTICS=false → page-old.tsx (Legacy fetch)
 *
 * Instant Rollback:
 * Change flag in .env.local and reload page - no deployment needed.
 */

import AnaliticasPageOld from './page-old'
import AnaliticasPageV2 from './page-v2'

const useNewAnalytics = process.env.NEXT_PUBLIC_FF_NEW_ANALYTICS === 'true'

export default function AnaliticasPage() {
  if (useNewAnalytics) {
    return <AnaliticasPageV2 />
  }

  return <AnaliticasPageOld />
}
