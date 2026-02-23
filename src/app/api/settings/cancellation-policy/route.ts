/**
 * API Route: Cancellation Policy Settings
 * GET: Load cancellation_policy from business
 * PUT: Update cancellation_policy (validated)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CancellationPolicy } from '@/types'

const DEFAULT_POLICY: CancellationPolicy = {
  enabled: false,
  deadline_hours: 24,
  allow_reschedule: false,
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
      .select('id, cancellation_policy')
      .eq('owner_id', user.id)
      .single()) as any

    if (businessError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const policy = (business.cancellation_policy as CancellationPolicy | null) ?? DEFAULT_POLICY

    return NextResponse.json({
      enabled: policy.enabled ?? DEFAULT_POLICY.enabled,
      deadline_hours: policy.deadline_hours ?? DEFAULT_POLICY.deadline_hours,
      allow_reschedule: policy.allow_reschedule ?? DEFAULT_POLICY.allow_reschedule,
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
    const { enabled, deadline_hours, allow_reschedule } = body

    // Validate fields
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
    }

    if (
      typeof deadline_hours !== 'number' ||
      !Number.isInteger(deadline_hours) ||
      deadline_hours < 1 ||
      deadline_hours > 168
    ) {
      return NextResponse.json(
        { error: 'deadline_hours must be an integer between 1 and 168' },
        { status: 400 }
      )
    }

    if (typeof allow_reschedule !== 'boolean') {
      return NextResponse.json({ error: 'allow_reschedule must be a boolean' }, { status: 400 })
    }

    const policy: CancellationPolicy = { enabled, deadline_hours, allow_reschedule }

    const { error: updateError } = (await supabase
      .from('businesses')
      .update({ cancellation_policy: policy } as any)
      .eq('id', business.id)) as any

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
