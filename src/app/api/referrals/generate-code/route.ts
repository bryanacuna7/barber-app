import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/referrals/generate-code
 * Genera un código de referido único para un negocio
 *
 * Body: { businessId: string }
 * Returns: { referralCode: string, qrCodeUrl: string | null, signupUrl: string }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 })
    }

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify business ownership
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, slug, owner_id')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found or unauthorized' }, { status: 404 })
    }

    // Check if referral code already exists
    const { data: existingReferral } = await supabase
      .from('business_referrals')
      .select('referral_code, qr_code_url')
      .eq('business_id', businessId)
      .single()

    if (existingReferral) {
      // Return existing code
      const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${existingReferral.referral_code}`
      return NextResponse.json({
        referralCode: existingReferral.referral_code,
        qrCodeUrl: existingReferral.qr_code_url || null,
        signupUrl,
        isNew: false,
      })
    }

    // Generate new code using DB function
    const { data: codeResult, error: codeError } = await supabase.rpc(
      'generate_business_referral_code',
      { p_business_slug: business.slug }
    )

    if (codeError || !codeResult) {
      console.error('Error generating referral code:', codeError)
      return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 })
    }

    const referralCode = codeResult as string

    // TODO: Generate QR code
    // const qrCodeDataUrl = await QRCode.toDataURL(signupUrl, {
    //   width: 400,
    //   margin: 2,
    //   color: { dark: '#000000', light: '#ffffff' },
    // })
    const qrCodeDataUrl = null // Placeholder until qrcode package is installed

    // Save to business_referrals
    const { data: referral, error: insertError } = await supabase
      .from('business_referrals')
      .insert({
        business_id: businessId,
        referral_code: referralCode,
        qr_code_url: qrCodeDataUrl,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving referral:', insertError)
      return NextResponse.json({ error: 'Failed to save referral code' }, { status: 500 })
    }

    const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralCode}`

    return NextResponse.json({
      referralCode,
      qrCodeUrl: qrCodeDataUrl,
      signupUrl,
      isNew: true,
    })
  } catch (error) {
    console.error('Error in generate-code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
