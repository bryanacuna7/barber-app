import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/referrals/claim-reward
 * Reclama una recompensa de milestone alcanzado
 *
 * Body: {
 *   businessId: string,
 *   milestoneId: string
 * }
 *
 * Validaciones:
 * - Usuario debe ser dueño del negocio
 * - Milestone debe estar desbloqueado (referidos suficientes)
 * - Reward no debe haber sido reclamada previamente
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { businessId, milestoneId } = await request.json()

    // Validation
    if (!businessId || !milestoneId) {
      return NextResponse.json(
        { error: 'businessId and milestoneId are required' },
        { status: 400 }
      )
    }

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify business ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, owner_id')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found or unauthorized' }, { status: 404 })
    }

    // Get milestone details
    const { data: milestone, error: milestoneError } = await supabase
      .from('referral_milestones')
      .select('*')
      .eq('id', milestoneId)
      .eq('is_active', true)
      .single()

    if (milestoneError || !milestone) {
      return NextResponse.json({ error: 'Milestone not found or inactive' }, { status: 404 })
    }

    // Get business referral stats
    const { data: referralStats, error: statsError } = await supabase
      .from('business_referrals')
      .select('successful_referrals, current_milestone')
      .eq('business_id', businessId)
      .single()

    if (statsError || !referralStats) {
      return NextResponse.json(
        { error: 'Referral program not initialized for this business' },
        { status: 404 }
      )
    }

    // Verify milestone has been reached
    if (referralStats.successful_referrals < milestone.referrals_required) {
      return NextResponse.json(
        {
          error: 'Milestone not reached',
          required: milestone.referrals_required,
          current: referralStats.successful_referrals,
          remaining: milestone.referrals_required - referralStats.successful_referrals,
        },
        { status: 400 }
      )
    }

    // Check if reward already claimed
    const { data: existingClaim } = await supabase
      .from('referral_rewards_claimed')
      .select('id, claimed_at')
      .eq('business_id', businessId)
      .eq('milestone_id', milestoneId)
      .single()

    if (existingClaim) {
      return NextResponse.json(
        {
          error: 'Reward already claimed',
          claimedAt: existingClaim.claimed_at,
        },
        { status: 400 }
      )
    }

    // Calculate expiration date for free_months rewards
    let expiresAt = null
    if (milestone.reward_type === 'free_months') {
      const expirationDate = new Date()
      expirationDate.setMonth(expirationDate.getMonth() + milestone.reward_value)
      expiresAt = expirationDate.toISOString()
    }

    // Claim reward
    const { data: reward, error: claimError } = await supabase
      .from('referral_rewards_claimed')
      .insert({
        business_id: businessId,
        milestone_id: milestoneId,
        claimed_at: new Date().toISOString(),
        applied_at: new Date().toISOString(),
        expires_at: expiresAt,
        metadata: {
          reward_type: milestone.reward_type,
          reward_value: milestone.reward_value,
          milestone_number: milestone.milestone_number,
          badge_name: milestone.badge_name,
        },
      })
      .select()
      .single()

    if (claimError) {
      console.error('Error claiming reward:', claimError)
      return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
    }

    // NOTE: Reward is recorded but credit is not yet auto-applied.
    // Integration with payment provider planned for future release.

    // Create notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'reward_claimed',
      title: '✨ ¡Recompensa Reclamada!',
      message: `Has reclamado: ${milestone.reward_description}`,
      metadata: {
        milestone_number: milestone.milestone_number,
        reward_type: milestone.reward_type,
        reward_value: milestone.reward_value,
        badge_name: milestone.badge_name,
        expires_at: expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      reward,
      message: `¡Recompensa registrada! ${milestone.reward_description}. El crédito se aplicará en tu próximo ciclo de facturación.`,
      milestone: {
        number: milestone.milestone_number,
        badge: milestone.badge_name,
        icon: milestone.badge_icon,
        tier: milestone.tier,
      },
      expiresAt,
    })
  } catch (error) {
    console.error('Error claiming reward:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
