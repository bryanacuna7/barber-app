/**
 * Clientes (Clients) Page - Feature Flag Router
 *
 * Routes between old implementation (page-old.tsx) and modernized implementation (page-v2.tsx)
 * based on NEXT_PUBLIC_FF_NEW_CLIENTES feature flag.
 *
 * Created: Session 120 (Phase 1 Week 1 - Clientes Modernization)
 * Pattern: Same as Mi Día feature flag router
 */

import ClientesPageOld from './page-old'
import ClientesPageV2 from './page-v2'

export default function ClientesPage() {
  const isNewVersion = process.env.NEXT_PUBLIC_FF_NEW_CLIENTES === 'true'

  if (isNewVersion) {
    return <ClientesPageV2 />
  }

  return <ClientesPageOld />
}
