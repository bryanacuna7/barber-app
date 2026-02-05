/**
 * Feature Flag Router - Configuración Page
 *
 * Routes between old and new implementations based on feature flag
 * Flag: NEXT_PUBLIC_FF_NEW_CONFIGURACION
 */

import ConfiguracionPageOld from './page-old'
import ConfiguracionPageV2 from './page-v2'

export default function ConfiguracionPage() {
  const useNewVersion = process.env.NEXT_PUBLIC_FF_NEW_CONFIGURACION === 'true'

  if (useNewVersion) {
    return <ConfiguracionPageV2 />
  }

  return <ConfiguracionPageOld />
}
