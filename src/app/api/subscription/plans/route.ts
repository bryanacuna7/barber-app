import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPlans } from '@/lib/subscription'

export async function GET() {
  const supabase = await createClient()
  const plans = await getPlans(supabase)
  return NextResponse.json(plans)
}
