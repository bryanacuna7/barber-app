/**
 * Barberos Page - Feature Flag Router
 *
 * Routes between legacy (server component) and modernized (client component) implementations
 * Feature flag: NEXT_PUBLIC_FF_NEW_BARBEROS
 */

import BarberosPageOld from './page-old'
import BarberosPageV2 from './page-v2'

export default function BarberosPage() {
  const useNewVersion = process.env.NEXT_PUBLIC_FF_NEW_BARBEROS === 'true'

  if (useNewVersion) {
    return <BarberosPageV2 />
  }

  return <BarberosPageOld />
}
