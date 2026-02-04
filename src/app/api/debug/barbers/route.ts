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

  // Check if barbers table exists
  const { data: tables, error: tablesError } = await supabase.from('barbers').select('*').limit(1)

  return NextResponse.json({
    authenticated: true,
    user_id: user.id,
    tables_check: tablesError ? { error: tablesError.message } : { success: true, sample: tables },
  })
}
