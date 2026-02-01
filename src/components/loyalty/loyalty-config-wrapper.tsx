'use client'

/**
 * Loyalty Config Wrapper
 * Client wrapper for the loyalty configuration form
 * Preview button now integrated within form (non-floating)
 */

import { LoyaltyConfigForm } from './loyalty-config-form'
import type { LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'

interface Props {
  businessId: string
  initialProgram: LoyaltyProgram | null
}

export function LoyaltyConfigWrapper({ businessId, initialProgram }: Props) {
  return <LoyaltyConfigForm businessId={businessId} initialProgram={initialProgram} />
}
