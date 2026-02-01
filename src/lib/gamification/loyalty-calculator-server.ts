/**
 * Loyalty Calculator - Server-Side Functions
 *
 * Handles:
 * - Reward eligibility checks
 * - Redemption logic
 * - Referral processing
 * - Analytics
 *
 * NOTE: This file uses tables from migration 014_loyalty_system.sql
 * that don't have generated TypeScript types yet.
 * Run `npx supabase gen types` to generate types when ready.
 *
 * IMPORTANT: Only import this file in Server Components, API Routes, or Server Actions.
 * For client components, use loyalty-calculator.ts instead.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import type { RewardEligibility, TransactionType, ReferralRewardType } from './loyalty-calculator'

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

// ===========================================
// AUTOMATIC LOYALTY PROCESSING
// ===========================================

/**
 * Process loyalty points and rewards after appointment is created
 * Called automatically from booking API
 */
export async function processAppointmentLoyalty(
  appointmentId: string,
  clientId: string,
  businessId: string,
  appointmentPrice: number
): Promise<{ success: boolean; error?: string; pointsEarned?: number }> {
  const supabase = (await createClient()) as any

  try {
    // 1. Get loyalty program config
    const { data: programData, error: programError } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('business_id', businessId)
      .eq('enabled', true)
      .single()

    const program = programData as LoyaltyProgramRow | null

    // If no active loyalty program, skip
    if (programError || !program) {
      return { success: true, pointsEarned: 0 } // Not an error, just no program
    }

    // 2. Get client info with user_id
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, user_id, name')
      .eq('id', clientId)
      .single()

    if (clientError || !clientData) {
      return { success: false, error: 'Client not found' }
    }

    // If client has no user_id, they can't participate in loyalty
    if (!clientData.user_id) {
      return { success: true, pointsEarned: 0 } // Not an error, just not enrolled
    }

    // 3. Get or create client loyalty status
    const { data: statusData, error: statusError } = await supabase
      .from('client_loyalty_status')
      .select('*')
      .eq('client_id', clientId)
      .single()

    let status = statusData as ClientLoyaltyStatusRow | null

    // If no status exists, create it
    if (statusError || !status) {
      const { data: newStatus, error: createError } = await supabase
        .from('client_loyalty_status')
        .insert({
          client_id: clientId,
          business_id: businessId,
          user_id: clientData.user_id,
          points_balance: 0,
          lifetime_points: 0,
          visit_count: 0,
          current_tier: 'bronze',
          referral_code: `${clientData.name
            ?.replace(/\s+/g, '')
            .substring(0, 4)
            .toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        })
        .select()
        .single()

      if (createError) {
        return { success: false, error: 'Failed to create loyalty status' }
      }

      status = newStatus as ClientLoyaltyStatusRow
    }

    // 4. Calculate points earned (only for points or hybrid programs)
    let pointsEarned = 0
    if (
      (program.program_type === 'points' || program.program_type === 'hybrid') &&
      program.points_per_currency_unit
    ) {
      pointsEarned = Math.floor(appointmentPrice / program.points_per_currency_unit)
    }

    // 5. Update loyalty status
    const newLifetimePoints = status.lifetime_points + pointsEarned
    const newPointsBalance = status.points_balance + pointsEarned
    const newVisitCount = status.visit_count + 1

    // Calculate new tier based on lifetime points
    let newTier: string = status.current_tier
    if (newLifetimePoints >= 5000) newTier = 'platinum'
    else if (newLifetimePoints >= 2000) newTier = 'gold'
    else if (newLifetimePoints >= 500) newTier = 'silver'
    else newTier = 'bronze'

    const { error: updateError } = await supabase
      .from('client_loyalty_status')
      .update({
        points_balance: newPointsBalance,
        lifetime_points: newLifetimePoints,
        visit_count: newVisitCount,
        current_tier: newTier,
        last_points_earned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('client_id', clientId)

    if (updateError) {
      console.error('Failed to update loyalty status:', updateError)
      return { success: false, error: 'Failed to update loyalty status' }
    }

    // 6. Create loyalty transaction
    if (pointsEarned > 0) {
      await supabase.from('loyalty_transactions').insert({
        client_id: clientId,
        business_id: businessId,
        transaction_type: 'earned_appointment',
        points_delta: pointsEarned,
        amount_delta: appointmentPrice,
        related_appointment_id: appointmentId,
        notes: `Earned ${pointsEarned} points from appointment`,
      })
    }

    // 7. Create notification for tier upgrade
    if (newTier !== status.current_tier) {
      const tierEmojis = {
        bronze: '🥉',
        silver: '🥈',
        gold: '🥇',
        platinum: '💎',
      }

      await supabase.from('notifications').insert({
        user_id: clientData.user_id,
        type: 'loyalty_tier_upgraded',
        title: `¡Nivel mejorado! ${tierEmojis[newTier as keyof typeof tierEmojis]}`,
        message: `Has alcanzado el nivel ${newTier.toUpperCase()}`,
        metadata: {
          business_id: businessId,
          old_tier: status.current_tier,
          new_tier: newTier,
        },
      })
    }

    // 8. Create notification for points earned (if significant amount)
    if (pointsEarned >= 50) {
      await supabase.from('notifications').insert({
        user_id: clientData.user_id,
        type: 'loyalty_points_earned',
        title: '¡Puntos ganados! 🎉',
        message: `Has ganado ${pointsEarned} puntos. Total: ${newPointsBalance}`,
        metadata: {
          business_id: businessId,
          points_earned: pointsEarned,
          total_balance: newPointsBalance,
        },
      })
    }

    return { success: true, pointsEarned }
  } catch (error) {
    console.error('Error processing appointment loyalty:', error)
    return { success: false, error: 'Unexpected error processing loyalty' }
  }
}
