import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business ID
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get onboarding status
    const { data: onboarding, error } = await supabase
      .from('business_onboarding')
      .select('*')
      .eq('business_id', business.id)
      .single()

    if (error) {
      logger.error({ err: error }, 'Error fetching onboarding')
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(onboarding)
  } catch (error) {
    logger.error({ err: error }, 'Error in GET /api/onboarding')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get business ID
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const body = await request.json()
    const { current_step, completed, skipped, defaults_applied } = body

    // Build update object
    const updates: any = {}
    if (current_step !== undefined) updates.current_step = current_step
    if (completed !== undefined) {
      updates.completed = completed
      if (completed) {
        updates.completed_at = new Date().toISOString()
      } else {
        updates.completed_at = null
      }
    }
    if (skipped !== undefined) updates.skipped = skipped
    if (defaults_applied !== undefined) updates.defaults_applied = defaults_applied

    // Update onboarding status
    const { data, error } = await supabase
      .from('business_onboarding')
      .update(updates)
      .eq('business_id', business.id)
      .select()
      .single()

    if (error) {
      logger.error({ err: error }, 'Error updating onboarding')
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error({ err: error }, 'Error in PATCH /api/onboarding')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
