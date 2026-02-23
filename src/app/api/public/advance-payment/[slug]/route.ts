/**
 * GET /api/public/advance-payment/[slug]
 *
 * Public endpoint — no auth required.
 * Returns advance payment (SINPE) info for the booking success page.
 * Calculates discounted price based on the service price query param.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const priceParam = request.nextUrl.searchParams.get('price')
    const price = priceParam ? Number(priceParam) : 0

    const serviceClient = createServiceClient()

    const { data: business, error: businessError } = (await (serviceClient as any)
      .from('businesses')
      .select(
        'advance_payment_enabled, advance_payment_discount, advance_payment_deadline_hours, sinpe_phone, sinpe_holder_name'
      )
      .eq('slug', slug)
      .single()) as any

    if (businessError || !business) {
      return NextResponse.json({ enabled: false })
    }

    if (!business.advance_payment_enabled) {
      return NextResponse.json({ enabled: false })
    }

    const discount: number = business.advance_payment_discount ?? 10
    const discountAmount = Math.round((price * discount) / 100)
    const finalPrice = price - discountAmount

    return NextResponse.json({
      enabled: true,
      discount,
      deadline_hours: business.advance_payment_deadline_hours ?? 2,
      sinpe_phone: business.sinpe_phone ?? '',
      sinpe_holder_name: business.sinpe_holder_name ?? '',
      service_price: price,
      discount_amount: discountAmount,
      final_price: finalPrice,
    })
  } catch {
    return NextResponse.json({ enabled: false })
  }
}
