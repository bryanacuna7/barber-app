import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/referrals/info?code=BUSINESS_2026_A3F5
 * Obtiene información pública del negocio que refiere
 * Usado en el signup flow para mostrar banner de "Referido por X"
 *
 * Returns: {
 *   businessName: string,
 *   businessId: string,
 *   referralCode: string,
 *   isValid: boolean
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'code query parameter is required' }, { status: 400 })
    }

    // Find business by referral code (no auth required - public info)
    const { data: referral, error: referralError } = await supabase
      .from('business_referrals')
      .select(
        `
        id,
        business_id,
        referral_code,
        business:businesses(
          id,
          name,
          slug
        )
      `
      )
      .eq('referral_code', code)
      .single()

    if (referralError || !referral || !referral.business) {
      return NextResponse.json(
        {
          isValid: false,
          error: 'Invalid referral code',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      isValid: true,
      businessName: referral.business.name,
      businessId: referral.business.id,
      businessSlug: referral.business.slug,
      referralCode: referral.referral_code,
    })
  } catch (error) {
    console.error('Error fetching referral info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
