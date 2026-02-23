/**
 * API Route: Promotional Slots Settings
 * GET: Load promotional_slots from business
 * PUT: Replace entire rules array (validated)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePromoRules } from '@/lib/promo-engine'
import type { PromoRule } from '@/types/promo'

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
      .select('id, promotional_slots')
      .eq('owner_id', user.id)
      .single()) as any

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({
      rules: ((business as any).promotional_slots as PromoRule[]) || [],
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

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const body = await request.json()
    const rules: PromoRule[] = body.rules

    if (!Array.isArray(rules)) {
      return NextResponse.json({ error: 'rules must be an array' }, { status: 400 })
    }

    // Validate rules
    const validation = validatePromoRules(rules)

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      )
    }

    // Save — full replacement (same pattern as accepted_payment_methods)
    const { error: updateError } = (await supabase
      .from('businesses')
      .update({ promotional_slots: rules } as any)
      .eq('id', business.id)) as any

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      warnings: validation.warnings,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
