/**
 * Servicios Page - Feature Flag Router
 *
 * Routes between legacy and modernized implementations
 * Feature flag: NEXT_PUBLIC_FF_NEW_SERVICIOS
 */

import ServiciosPageOld from './page-old'
import ServiciosPageV2 from './page-v2'

export default function ServiciosPage() {
  const useNewVersion = process.env.NEXT_PUBLIC_FF_NEW_SERVICIOS === 'true'

  if (useNewVersion) {
    return <ServiciosPageV2 />
  }

  return <ServiciosPageOld />
}
