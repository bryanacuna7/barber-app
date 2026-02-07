import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'
import type { ExchangeRateValue, UsdBankAccountValue } from '@/types/database'

// Type for system_settings table (not in generated types yet)
interface SystemSettingRow {
  id: string
  key: string
  value: Record<string, unknown>
  updated_by: string | null
  updated_at: string
  created_at: string
}

// GET all settings or specific setting by key
export async function GET(request: Request) {
  // Use regular client for auth check (has user session)
  const authClient = await createClient()
  const admin = await verifyAdmin(authClient)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Use service client for data queries (bypasses RLS)
  const supabase = await createServiceClient()

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key) {
    // Get specific setting
    const { data, error } = (await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single()) as { data: SystemSettingRow | null; error: unknown }

    if (error || !data) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  }

  // Get all settings
  const { data: settings, error } = (await supabase
    .from('system_settings')
    .select('*')
    .order('key')) as { data: SystemSettingRow[] | null; error: unknown }

  if (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }

  return NextResponse.json({ settings })
}

// PATCH update a specific setting
export async function PATCH(request: Request) {
  // Use regular client for auth check (has user session)
  const authClient = await createClient()
  const admin = await verifyAdmin(authClient)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Use service client for data queries (bypasses RLS)
  const supabase = await createServiceClient()

  const body = await request.json()
  const { key, value } = body

  if (!key || !value) {
    return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
  }

  // Validate based on setting type
  if (key === 'exchange_rate') {
    const exchangeValue = value as ExchangeRateValue
    if (typeof exchangeValue.usd_to_crc !== 'number' || exchangeValue.usd_to_crc <= 0) {
      return NextResponse.json({ error: 'Invalid exchange rate value' }, { status: 400 })
    }
    // Auto-set last_updated
    exchangeValue.last_updated = new Date().toISOString().split('T')[0]
  }

  if (key === 'usd_bank_account') {
    const bankValue = value as UsdBankAccountValue
    if (typeof bankValue.enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid bank account configuration' }, { status: 400 })
    }
  }

  // Use type assertion since system_settings is not in generated types
  const { data, error } = await (
    supabase.from('system_settings') as ReturnType<typeof supabase.from>
  )
    .update({
      value,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    })
    .eq('key', key)
    .select()
    .single()

  if (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }

  return NextResponse.json(data)
}
