/**
 * API Route: Advance Payment (SINPE) Settings
 * GET: Load advance payment config from business
 * PUT: Update advance payment config (validated)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AdvancePaymentConfig } from '@/types/api'

const DEFAULT_CONFIG: AdvancePaymentConfig = {
  enabled: false,
  discount: 10,
  deadline_hours: 2,
  sinpe_phone: '',
  sinpe_holder_name: '',
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business, error: businessError } = (await supabase
      .from('businesses')
      .select(
        'id, advance_payment_enabled, advance_payment_discount, advance_payment_deadline_hours, sinpe_phone, sinpe_holder_name'
      )
      .eq('owner_id', user.id)
      .single()) as any

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({
      enabled: business.advance_payment_enabled ?? DEFAULT_CONFIG.enabled,
      discount: business.advance_payment_discount ?? DEFAULT_CONFIG.discount,
      deadline_hours: business.advance_payment_deadline_hours ?? DEFAULT_CONFIG.deadline_hours,
      sinpe_phone: business.sinpe_phone ?? DEFAULT_CONFIG.sinpe_phone,
      sinpe_holder_name: business.sinpe_holder_name ?? DEFAULT_CONFIG.sinpe_holder_name,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business, error: businessError } = (await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()) as any

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const body = await request.json()
    const { enabled, discount, deadline_hours, sinpe_phone, sinpe_holder_name } = body

    // Validate fields
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
    }

    if (typeof discount !== 'number' || discount < 5 || discount > 50) {
      return NextResponse.json(
        { error: 'discount must be a number between 5 and 50' },
        { status: 400 }
      )
    }

    if (typeof deadline_hours !== 'number' || deadline_hours < 0 || deadline_hours > 48) {
      return NextResponse.json(
        { error: 'deadline_hours must be a number between 0 and 48' },
        { status: 400 }
      )
    }

    if (enabled) {
      if (typeof sinpe_phone !== 'string' || sinpe_phone.trim().length < 8) {
        return NextResponse.json(
          { error: 'sinpe_phone is required and must be at least 8 characters' },
          { status: 400 }
        )
      }

      if (typeof sinpe_holder_name !== 'string' || sinpe_holder_name.trim().length < 2) {
        return NextResponse.json(
          { error: 'sinpe_holder_name is required and must be at least 2 characters' },
          { status: 400 }
        )
      }
    }

    const { error: updateError } = (await supabase
      .from('businesses')
      .update({
        advance_payment_enabled: enabled,
        advance_payment_discount: discount,
        advance_payment_deadline_hours: deadline_hours,
        sinpe_phone: sinpe_phone ? sinpe_phone.trim() : null,
        sinpe_holder_name: sinpe_holder_name ? sinpe_holder_name.trim() : null,
      } as any)
      .eq('id', business.id)) as any

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
