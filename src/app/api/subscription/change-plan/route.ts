// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { changePlan } from '@/lib/subscription'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const body = await request.json()
  const { plan_id } = body as { plan_id: string }

  if (!plan_id) {
    return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
  }

  const result = await changePlan(supabase, business.id, plan_id)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, upgrade_required: result.error === 'Upgrade requires payment' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}
