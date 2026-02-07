import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ExchangeRateValue } from '@/types/custom'

// Type for system_settings value column
interface SystemSettingRow {
  value: ExchangeRateValue
}

// GET current exchange rate (public endpoint)
export async function GET() {
  const supabase = await createClient()

  const { data, error } = (await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'exchange_rate')
    .single()) as { data: SystemSettingRow | null; error: unknown }

  if (error || !data) {
    // Return default if not found
    return NextResponse.json<ExchangeRateValue>({
      usd_to_crc: 510,
      last_updated: new Date().toISOString().split('T')[0],
      notes: 'Default rate',
    })
  }

  return NextResponse.json<ExchangeRateValue>(data.value)
}
