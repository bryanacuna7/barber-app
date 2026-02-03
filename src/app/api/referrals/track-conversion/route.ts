import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'

/**
 * POST /api/referrals/track-conversion
 * Trackea cuando un referido se registra o se convierte en cliente activo
 *
 * Body: {
 *   referralCode: string,
 *   referredBusinessId: string,
 *   status: 'pending' | 'trial' | 'active' | 'churned'
 * }
 *
 * Flujo:
 * - 'pending': Usuario se registró con código de referido
 * - 'trial': Usuario activó trial
 * - 'active': Usuario se convirtió en paying customer (incrementa successful_referrals)
 * - 'churned': Usuario canceló suscripción
 */
export async function POST(request: Request) {
  // Strict rate limiting - prevent fake conversions (5 requests per 15 min)
  const rateLimitResult = await rateLimit(request as any, RateLimitPresets.strict)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many conversion tracking requests. Please try again later.' },
      {
        status: 429,
        headers: rateLimitResult.headers,
      }
    )
  }

  try {
    const supabase = await createClient()
    const { referralCode, referredBusinessId, status } = await request.json()

    // Validation
    if (!referralCode || !referredBusinessId) {
      return NextResponse.json(
        { error: 'referralCode and referredBusinessId are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'trial', 'active', 'churned']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Find referrer business by code
    const { data: referrer, error: referrerError } = await supabase
      .from('business_referrals')
      .select('id, business_id, referral_code')
      .eq('referral_code', referralCode)
      .single()

    if (referrerError || !referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Check if conversion already exists
    const { data: existingConversion } = await supabase
      .from('referral_conversions')
      .select('id, status, converted_at')
      .eq('referrer_business_id', referrer.business_id)
      .eq('referred_business_id', referredBusinessId)
      .single()

    const wasAlreadyActive = existingConversion && existingConversion.status === 'active'
    const isNowActive = status === 'active'

    // Create or update conversion
    const conversionData: any = {
      referrer_business_id: referrer.business_id,
      referred_business_id: referredBusinessId,
      referral_code: referralCode,
      status,
    }

    // Set converted_at timestamp when status becomes 'active'
    if (isNowActive && !wasAlreadyActive) {
      conversionData.converted_at = new Date().toISOString()
    }

    const { data: conversion, error: conversionError } = await supabase
      .from('referral_conversions')
      .upsert(conversionData, {
        onConflict: 'referrer_business_id,referred_business_id',
      })
      .select()
      .single()

    if (conversionError) {
      console.error('Error upserting conversion:', conversionError)
      return NextResponse.json({ error: 'Failed to track conversion' }, { status: 500 })
    }

    // Update referral stats
    if (status === 'active' && !wasAlreadyActive) {
      // Increment successful_referrals
      const { error: incrementError } = await supabase.rpc('increment_referral_count', {
        p_business_id: referrer.business_id,
        p_column: 'successful_referrals',
        p_amount: 1,
      })

      if (incrementError) {
        console.error('Error incrementing successful_referrals:', incrementError)
      }

      // Check and update milestones
      const { data: milestones, error: milestonesError } = await supabase.rpc(
        'check_referral_milestones',
        {
          p_business_id: referrer.business_id,
        }
      )

      if (milestonesError) {
        console.error('Error checking milestones:', milestonesError)
      }

      // If new milestones were unlocked, create notifications
      if (milestones && Array.isArray(milestones)) {
        for (const milestone of milestones) {
          if (milestone.newly_unlocked) {
            // Get business owner user_id
            const { data: ownerBusiness } = await supabase
              .from('businesses')
              .select('owner_id')
              .eq('id', referrer.business_id)
              .single()

            if (ownerBusiness) {
              await supabase.from('notifications').insert({
                user_id: ownerBusiness.owner_id,
                type: 'milestone_achieved',
                title: '🏆 ¡Milestone Alcanzado!',
                message: `Has desbloqueado: ${milestone.reward_description}`,
                metadata: {
                  milestone_number: milestone.milestone_achieved,
                  reward_description: milestone.reward_description,
                  referral_system: true,
                },
              })
            }
          }
        }
      }

      // Create conversion notification
      const { data: ownerBusiness } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', referrer.business_id)
        .single()

      const { data: referredBusiness } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', referredBusinessId)
        .single()

      if (ownerBusiness && referredBusiness) {
        await supabase.from('notifications').insert({
          user_id: ownerBusiness.owner_id,
          type: 'referral_conversion',
          title: '🎉 ¡Referido Convertido!',
          message: `Tu referido ${referredBusiness.name} acaba de activar su suscripción`,
          metadata: {
            referral_code: referralCode,
            referred_business_id: referredBusinessId,
            referred_business_name: referredBusiness.name,
          },
        })
      }
    } else if (status === 'churned' && wasAlreadyActive) {
      // Decrement successful_referrals if churned
      const { error: decrementError } = await supabase.rpc('increment_referral_count', {
        p_business_id: referrer.business_id,
        p_column: 'successful_referrals',
        p_amount: -1,
      })

      if (decrementError) {
        console.error('Error decrementing successful_referrals:', decrementError)
      }
    }

    // Always increment total_referrals on first tracking (status = pending)
    if (!existingConversion && status === 'pending') {
      const { error: totalError } = await supabase.rpc('increment_referral_count', {
        p_business_id: referrer.business_id,
        p_column: 'total_referrals',
        p_amount: 1,
      })

      if (totalError) {
        console.error('Error incrementing total_referrals:', totalError)
      }
    }

    return NextResponse.json({
      success: true,
      conversion,
      message:
        status === 'active'
          ? '¡Conversión exitosa! El referidor ha sido notificado.'
          : 'Conversión trackeada exitosamente',
    })
  } catch (error) {
    console.error('Error tracking conversion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
