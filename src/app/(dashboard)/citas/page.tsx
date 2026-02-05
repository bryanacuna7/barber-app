/**
 * Citas (Calendar) Page - Feature Flag Router
 *
 * Routes between old implementation (page-old.tsx) and modernized implementation (page-v2.tsx)
 * based on NEXT_PUBLIC_FF_NEW_CITAS feature flag.
 *
 * Created: Session 121 (Phase 1 Week 2 - Citas Modernization)
 * Pattern: Same as Clientes and Mi Día feature flag routers
 */

import CitasPageOld from './page-old'
import CitasPageV2 from './page-v2'

export default function CitasPage() {
  const isNewVersion = process.env.NEXT_PUBLIC_FF_NEW_CITAS === 'true'

  if (isNewVersion) {
    return <CitasPageV2 />
  }

  return <CitasPageOld />
}
