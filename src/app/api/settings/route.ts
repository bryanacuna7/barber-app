// @ts-nocheck
import { NextResponse } from 'next/server'
import { withAuth, errorResponse, notFoundResponse } from '@/lib/api/middleware'

// GET public settings (exchange rate, USD bank account, etc.)
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 })
  }

  // Only allow certain public settings
  const publicSettings = ['exchange_rate', 'usd_bank_account', 'support_whatsapp', 'sinpe_details']
  if (!publicSettings.includes(key)) {
    return NextResponse.json({ error: 'Setting not found or not public' }, { status: 404 })
  }

  const { data, error } = (await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .single()) as { data: { value: Record<string, unknown> } | null; error: unknown }

  if (error || !data) {
    return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
