import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'
import { logger, logRequest, logResponse, logReferral, logSecurity } from '@/lib/logger'

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
  const startTime = Date.now()
  logRequest(request, { endpoint: 'track_conversion' })

  // Strict rate limiting - prevent fake conversions (5 requests per 15 min)
  const rateLimitResult = await rateLimit(request as any, RateLimitPresets.strict)
  if (!rateLimitResult.success) {
    logSecurity('rate_limit', 'medium', { endpoint: 'track_conversion' })
    logResponse(request, 429, Date.now() - startTime)
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
      logger.warn(
        { referralCode, referredBusinessId },
        'Missing required fields for conversion tracking'
      )
      logResponse(request, 400, Date.now() - startTime)
      return NextResponse.json(
        { error: 'referralCode and referredBusinessId are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'trial', 'active', 'churned']
    if (!validStatuses.includes(status)) {
      logger.warn({ referralCode, status }, 'Invalid status for conversion tracking')
      logResponse(request, 400, Date.now() - startTime)
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
      logger.warn({ referralCode, error: referrerError }, 'Invalid referral code')
      logResponse(request, 404, Date.now() - startTime)
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
      logger.error(
        {
          referrerBusinessId: referrer.business_id,
          referredBusinessId,
          referralCode,
          status,
          error: conversionError,
        },
        'Failed to upsert conversion'
      )
      logResponse(request, 500, Date.now() - startTime)
      return NextResponse.json({ error: 'Failed to track conversion' }, { status: 500 })
    }

    // Log conversion tracked
    logReferral('conversion_tracked', referrer.business_id, {
      conversionId: conversion.id,
      referredBusinessId,
      status,
      wasAlreadyActive,
    })

    // Update referral stats
    if (status === 'active' && !wasAlreadyActive) {
      // Increment successful_referrals
      const { error: incrementError } = await supabase.rpc('increment_referral_count', {
        p_business_id: referrer.business_id,
        p_column: 'successful_referrals',
        p_amount: 1,
      })

      if (incrementError) {
        logger.error(
          { businessId: referrer.business_id, error: incrementError },
          'Failed to increment successful_referrals'
        )
      }

      // Check and update milestones
      const { data: milestones, error: milestonesError } = await supabase.rpc(
        'check_referral_milestones',
        {
          p_business_id: referrer.business_id,
        }
      )

      if (milestonesError) {
        logger.error(
          { businessId: referrer.business_id, error: milestonesError },
          'Failed to check milestones'
        )
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

              // Log milestone unlock
              logReferral('milestone_unlocked', referrer.business_id, {
                milestoneNumber: milestone.milestone_achieved,
                rewardDescription: milestone.reward_description,
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
        logger.error(
          { businessId: referrer.business_id, error: decrementError },
          'Failed to decrement successful_referrals after churn'
        )
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
        logger.error(
          { businessId: referrer.business_id, error: totalError },
          'Failed to increment total_referrals'
        )
      }
    }

    logResponse(request, 200, Date.now() - startTime, {
      conversionId: conversion.id,
      status,
      newlyActive: isNowActive && !wasAlreadyActive,
    })

    return NextResponse.json({
      success: true,
      conversion,
      message:
        status === 'active'
          ? '¡Conversión exitosa! El referidor ha sido notificado.'
          : 'Conversión trackeada exitosamente',
    })
  } catch (error) {
    logger.error({ error }, 'Unexpected error tracking conversion')
    logResponse(request, 500, Date.now() - startTime)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
