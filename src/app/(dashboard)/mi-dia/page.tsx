/**
 * Mi Día - Feature Flag Router
 *
 * Routes between old (legacy) and new (modernized) Mi Día implementations
 * based on NEXT_PUBLIC_FF_NEW_MI_DIA feature flag.
 *
 * Phase 0 Week 5-6 Data Integration
 */

'use client'

import { featureFlags } from '@/lib/feature-flags'
import MiDiaPageOld from './page-old'
import MiDiaPageV2 from './page-v2'

export default function MiDiaPage() {
  // Check feature flag
  const useNewVersion = featureFlags.use_new_mi_dia

  // Route to appropriate version
  return useNewVersion ? <MiDiaPageV2 /> : <MiDiaPageOld />
}
