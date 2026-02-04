import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

  const { data: invitations, error } = await supabase
    .from('barber_invitations')
    .select('*')
    .eq('business_id', business.id)
    .is('used_at', null)

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }

  return NextResponse.json(invitations)
}
