/**
 * Loyalty Calculator - Business Logic for Client Loyalty System
 *
 * Handles:
 * - Points calculation
 * - Reward eligibility
 * - Tier progression
 * - Redemption logic
 *
 * NOTE: This file uses tables from migration 014_loyalty_system.sql
 * that don't have generated TypeScript types yet.
 * Run `npx supabase gen types` to generate types when ready.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'

// ===========================================
// DATABASE ROW TYPES (pending Supabase type generation)
// ===========================================

interface LoyaltyProgramRow {
  id: string
  business_id: string
  enabled: boolean
  program_type: string
  points_per_currency_unit?: number
  points_expiry_days?: number
  free_service_after_visits?: number
  discount_after_visits?: number
  discount_percentage?: number
  referral_reward_type?: string
  referral_reward_amount?: number
  referee_reward_amount?: number
  created_at: string
  updated_at: string
}

interface ClientLoyaltyStatusRow {
  id: string
  client_id: string
  business_id: string
  user_id: string
  points_balance: number
  lifetime_points: number
  visit_count: number
  current_tier: string
  last_points_earned_at?: string
  last_reward_redeemed_at?: string
  referred_by_client_id?: string
  referral_code: string
  created_at: string
  updated_at: string
}

// Helper to get untyped Supabase client for new tables
 
const getUntypedClient = async () => (await createClient()) as any

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
// CORE CALCULATIONS
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

// ===========================================
// REWARD ELIGIBILITY
// ===========================================

/**
 * Check if client is eligible for rewards
 */
export async function checkRewardEligibility(
  clientId: string,
  businessId: string
): Promise<RewardEligibility> {
  const supabase = await createClient()

  // Get loyalty program config
   
  const { data: programData } = await (supabase as any)
    .from('loyalty_programs')
    .select('*')
    .eq('business_id', businessId)
    .eq('enabled', true)
    .single()

  const program = programData as LoyaltyProgramRow | null

  if (!program) {
    return {
      eligible: false,
      rewardType: null,
      rewardValue: 0,
      currentProgress: 0,
      progressPercentage: 0,
    }
  }

  // Get client loyalty status
   
  const { data: statusData } = await (supabase as any)
    .from('client_loyalty_status')
    .select('*')
    .eq('client_id', clientId)
    .single()

  const status = statusData as ClientLoyaltyStatusRow | null

  if (!status) {
    return {
      eligible: false,
      rewardType: null,
      rewardValue: 0,
      currentProgress: 0,
      progressPercentage: 0,
    }
  }

  // Check points-based rewards
  if (program.program_type === 'points' || program.program_type === 'hybrid') {
    const requiredPoints = 500 // Default threshold for discount
    const isEligible = status.points_balance >= requiredPoints

    return {
      eligible: isEligible,
      rewardType: 'discount',
      rewardValue: program.discount_percentage || 20,
      requiredPoints,
      currentProgress: status.points_balance,
      progressPercentage: Math.min((status.points_balance / requiredPoints) * 100, 100),
    }
  }

  // Check visit-based rewards
  if (program.program_type === 'visits' || program.program_type === 'hybrid') {
    const requiredVisits = program.free_service_after_visits || 10
    const isEligible = status.visit_count >= requiredVisits

    return {
      eligible: isEligible,
      rewardType: 'free_service',
      rewardValue: 1, // 1 free service
      requiredVisits,
      currentProgress: status.visit_count,
      progressPercentage: Math.min((status.visit_count / requiredVisits) * 100, 100),
    }
  }

  return {
    eligible: false,
    rewardType: null,
    rewardValue: 0,
    currentProgress: 0,
    progressPercentage: 0,
  }
}

// ===========================================
// REDEMPTION
// ===========================================

/**
 * Redeem reward (deduct points/visits)
 */
export async function redeemReward(
  clientId: string,
  businessId: string,
  rewardType: 'discount' | 'free_service',
  appointmentId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Verify eligibility first
  const eligibility = await checkRewardEligibility(clientId, businessId)

  if (!eligibility.eligible) {
    return {
      success: false,
      error: 'Client is not eligible for this reward',
    }
  }

  // Get current status
   
  const { data: statusData, error: statusError } = await (supabase as any)
    .from('client_loyalty_status')
    .select('*')
    .eq('client_id', clientId)
    .single()

  const status = statusData as ClientLoyaltyStatusRow | null

  if (statusError || !status) {
    return { success: false, error: 'Failed to fetch loyalty status' }
  }

  // Get program config
   
  const { data: programData } = await (supabase as any)
    .from('loyalty_programs')
    .select('*')
    .eq('business_id', businessId)
    .single()

  const program = programData as LoyaltyProgramRow | null

  if (!program) {
    return { success: false, error: 'Loyalty program not found' }
  }

  let pointsToDeduct = 0
  let notes = ''

  if (rewardType === 'discount') {
    pointsToDeduct = 500 // Default points cost for discount
    notes = `Redeemed ${program.discount_percentage || 20}% discount (${pointsToDeduct} points)`
  } else if (rewardType === 'free_service') {
    // For visit-based, we don't deduct points
    // Instead, we track in transaction log
    notes = 'Redeemed 1 free service'
  }

  // Update points balance
   
  const { error: updateError } = await (supabase as any)
    .from('client_loyalty_status')
    .update({
      points_balance: Math.max(0, status.points_balance - pointsToDeduct),
      last_reward_redeemed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('client_id', clientId)

  if (updateError) {
    return { success: false, error: 'Failed to update points balance' }
  }

  // Log transaction
   
  const { error: txError } = await (supabase as any).from('loyalty_transactions').insert({
    client_id: clientId,
    business_id: businessId,
    transaction_type: rewardType === 'discount' ? 'redeemed_discount' : 'redeemed_free_service',
    points_delta: -pointsToDeduct,
    related_appointment_id: appointmentId,
    notes,
  })

  if (txError) {
    console.error('Failed to log loyalty transaction:', txError)
    // Don't fail the redemption if logging fails
  }

  // Create notification
   
  const { error: notifError } = await (supabase as any).from('notifications').insert({
    user_id: status.user_id,
    type: 'loyalty_reward_redeemed',
    title: '¡Recompensa canjeada! 🎁',
    message:
      rewardType === 'discount'
        ? `Has canjeado ${program.discount_percentage || 20}% de descuento`
        : 'Has canjeado 1 servicio gratis',
    metadata: {
      business_id: businessId,
      reward_type: rewardType,
      appointment_id: appointmentId,
    },
  })

  if (notifError) {
    console.error('Failed to create notification:', notifError)
  }

  return { success: true }
}

// ===========================================
// REFERRAL LOGIC
// ===========================================

/**
 * Process referral reward when referee completes first appointment
 */
export async function processReferralReward(
  referrerClientId: string,
  referredClientId: string,
  businessId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = (await createClient()) as any

  // Get program config
  const { data: programData } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('business_id', businessId)
    .eq('enabled', true)
    .single()

  const program = programData as LoyaltyProgramRow | null

  if (!program || !program.referral_reward_amount) {
    return { success: false, error: 'Referral rewards not configured' }
  }

  // Mark referral as completed
  const { data: referral, error: referralError } = await supabase
    .from('client_referrals')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('referrer_client_id', referrerClientId)
    .eq('referred_client_id', referredClientId)
    .eq('status', 'pending')
    .select()
    .single()

  if (referralError || !referral) {
    return { success: false, error: 'Referral not found or already processed' }
  }

  // Award points to referrer
  if (program.referral_reward_type === 'points') {
    const { error: referrerError } = await supabase.rpc('increment_loyalty_points', {
      p_client_id: referrerClientId,
      p_points: program.referral_reward_amount,
    })

    if (referrerError) {
      console.error('Failed to award referrer points:', referrerError)
    }

    // Log transaction
    await supabase.from('loyalty_transactions').insert({
      client_id: referrerClientId,
      business_id: businessId,
      transaction_type: 'earned_referral',
      points_delta: program.referral_reward_amount,
      related_referral_id: referral.id,
      notes: `Earned ${program.referral_reward_amount} points for referring a friend`,
    })
  }

  // Award points to referee
  if (program.referee_reward_amount) {
    const { error: refereeError } = await supabase.rpc('increment_loyalty_points', {
      p_client_id: referredClientId,
      p_points: program.referee_reward_amount,
    })

    if (refereeError) {
      console.error('Failed to award referee points:', refereeError)
    }

    // Log transaction
    await supabase.from('loyalty_transactions').insert({
      client_id: referredClientId,
      business_id: businessId,
      transaction_type: 'earned_referral',
      points_delta: program.referee_reward_amount,
      related_referral_id: referral.id,
      notes: `Welcome bonus: ${program.referee_reward_amount} points`,
    })
  }

  return { success: true }
}

// ===========================================
// ANALYTICS
// ===========================================

/**
 * Get loyalty program statistics
 */
export async function getLoyaltyStats(businessId: string) {
  const supabase = (await createClient()) as any

  // Total enrolled clients (with user accounts)
  const { count: enrolledCount } = await supabase
    .from('client_loyalty_status')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  // Total points awarded (lifetime)
  const { data: totalPointsData } = await supabase
    .from('client_loyalty_status')
    .select('lifetime_points')
    .eq('business_id', businessId)

  const totalPoints =
    (totalPointsData as { lifetime_points: number }[] | null)?.reduce(
      (sum, row) => sum + (row.lifetime_points || 0),
      0
    ) || 0

  // Total rewards redeemed
  const { count: rewardsCount } = await supabase
    .from('loyalty_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .in('transaction_type', ['redeemed_discount', 'redeemed_free_service'])

  // Top referrers (clients who referred the most)
  const { data: topReferrers } = await supabase
    .from('client_referrals')
    .select(
      `
      referrer_client_id,
      clients!client_referrals_referrer_client_id_fkey(name, phone)
    `
    )
    .eq('business_id', businessId)
    .eq('status', 'completed')

  // Group by referrer and count
  const referrerCounts = topReferrers?.reduce(
    (acc, row) => {
      const id = row.referrer_client_id
      if (!acc[id]) {
        acc[id] = {
          clientId: id,
          name: (row.clients as any)?.name || 'Unknown',
          phone: (row.clients as any)?.phone || '',
          referralCount: 0,
        }
      }
      acc[id].referralCount++
      return acc
    },
    {} as Record<string, any>
  )

  const topReferrersList = Object.values(referrerCounts || {})
    .sort((a: any, b: any) => b.referralCount - a.referralCount)
    .slice(0, 10)

  return {
    enrolledClients: enrolledCount || 0,
    totalPointsAwarded: totalPoints,
    totalRewardsRedeemed: rewardsCount || 0,
    topReferrers: topReferrersList,
  }
}

/**
 * Get client loyalty history
 */
export async function getClientLoyaltyHistory(clientId: string, limit: number = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch loyalty history:', error)
    return []
  }

  return data || []
}
