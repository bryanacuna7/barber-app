/**
 * Loyalty Calculator - Pure Business Logic (Client-Safe)
 *
 * Handles:
 * - Points calculation
 * - Tier progression
 * - Pure computation functions
 *
 * NOTE: This file contains NO server dependencies.
 * Server-side functions moved to loyalty-calculator-server.ts
 */

// ===========================================
// TYPES
// ===========================================

export type ProgramType = 'points' | 'visits' | 'referral' | 'hybrid'
export type ReferralRewardType = 'discount' | 'points' | 'free_service'
export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum'
export type TransactionType =
  | 'earned_appointment'
  | 'earned_referral'
  | 'redeemed_discount'
  | 'redeemed_free_service'
  | 'expired'
  | 'reversed'

export interface LoyaltyProgram {
  id: string
  businessId: string
  enabled: boolean
  programType: ProgramType

  // Points-based config
  pointsPerCurrencyUnit?: number
  pointsExpiryDays?: number

  // Visit-based config
  freeServiceAfterVisits?: number
  discountAfterVisits?: number
  discountPercentage?: number

  // Referral config
  referralRewardType?: ReferralRewardType
  referralRewardAmount?: number
  refereeRewardAmount?: number

  createdAt: string
  updatedAt: string
}

export interface ClientLoyaltyStatus {
  id: string
  clientId: string
  businessId: string
  userId: string

  pointsBalance: number
  lifetimePoints: number
  visitCount: number
  currentTier: TierLevel

  lastPointsEarnedAt?: string
  lastRewardRedeemedAt?: string
  referredByClientId?: string
  referralCode: string

  createdAt: string
  updatedAt: string
}

export interface LoyaltyTransaction {
  id: string
  clientId: string
  businessId: string
  transactionType: TransactionType
  pointsDelta: number
  amountDelta?: number
  relatedAppointmentId?: string
  relatedReferralId?: string
  notes?: string
  createdAt: string
}

export interface RewardEligibility {
  eligible: boolean
  rewardType: 'discount' | 'free_service' | 'points' | null
  rewardValue: number
  requiredPoints?: number
  requiredVisits?: number
  currentProgress: number
  progressPercentage: number
}

// ===========================================
// CORE CALCULATIONS (Pure Functions)
// ===========================================

/**
 * Calculate points earned from appointment price
 */
export function calculatePointsEarned(
  appointmentPrice: number,
  loyaltyProgram: LoyaltyProgram
): number {
  if (!loyaltyProgram.enabled) return 0
  if (!loyaltyProgram.pointsPerCurrencyUnit) return 0

  return Math.floor(appointmentPrice / loyaltyProgram.pointsPerCurrencyUnit)
}

/**
 * Calculate tier based on lifetime points
 */
export function calculateTier(lifetimePoints: number): TierLevel {
  if (lifetimePoints >= 5000) return 'platinum' // 5000+ points
  if (lifetimePoints >= 2000) return 'gold' // 2000-4999 points
  if (lifetimePoints >= 500) return 'silver' // 500-1999 points
  return 'bronze' // 0-499 points
}

/**
 * Get tier multiplier for bonus points
 */
export function getTierMultiplier(tier: TierLevel): number {
  switch (tier) {
    case 'platinum':
      return 1.5 // 50% bonus
    case 'gold':
      return 1.3 // 30% bonus
    case 'silver':
      return 1.1 // 10% bonus
    case 'bronze':
    default:
      return 1.0 // No bonus
  }
}

/**
 * Get points needed for next tier
 */
export function getPointsToNextTier(currentPoints: number): {
  nextTier: TierLevel | null
  pointsNeeded: number
} {
  if (currentPoints < 500) {
    return { nextTier: 'silver', pointsNeeded: 500 - currentPoints }
  }
  if (currentPoints < 2000) {
    return { nextTier: 'gold', pointsNeeded: 2000 - currentPoints }
  }
  if (currentPoints < 5000) {
    return { nextTier: 'platinum', pointsNeeded: 5000 - currentPoints }
  }
  return { nextTier: null, pointsNeeded: 0 } // Max tier reached
}
