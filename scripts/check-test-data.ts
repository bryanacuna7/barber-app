/**
 * Check Test Data - Verify test business data exists
 *
 * Run with: npx tsx scripts/check-test-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTestData() {
  console.log('\n🔍 Checking test data for E2E tests...\n')

  // Check business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('slug', 'barberia-test')
    .single()

  if (businessError || !business) {
    console.log('❌ Business "barberia-test" not found')
    console.log('\n💡 Solution: Run supabase/seed_test_data.sql in Supabase SQL Editor')
    return
  }

  console.log('✅ Business found:')
  console.log(`   Name: ${business.name}`)
  console.log(`   Slug: ${business.slug}`)
  console.log(`   ID: ${business.id}`)

  // Check services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('name, price, duration_minutes')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('display_order')

  if (servicesError) {
    console.log('\n❌ Error fetching services:', servicesError.message)
    return
  }

  console.log(`\n✅ Services: ${services?.length || 0}`)
  services?.forEach((service, i) => {
    console.log(`   ${i + 1}. ${service.name} (${service.duration_minutes}min, ₡${service.price})`)
  })

  // Check barbers
  const { data: barbers, error: barbersError } = await supabase
    .from('barbers')
    .select('name, email, is_active')
    .eq('business_id', business.id)
    .eq('is_active', true)

  if (barbersError) {
    console.log('\n❌ Error fetching barbers:', barbersError.message)
    return
  }

  console.log(`\n✅ Barbers: ${barbers?.length || 0}`)
  barbers?.forEach((barber, i) => {
    console.log(`   ${i + 1}. ${barber.name} (${barber.email})`)
  })

  // Summary for tests
  console.log('\n📝 Update tests/e2e/booking-flow.spec.ts with:')
  console.log('\nconst TEST_BUSINESS = {')
  console.log(`  slug: '${business.slug}',`)
  console.log(`  name: '${business.name}',`)
  console.log(`  expectedServices: [`)
  services?.forEach((s) => console.log(`    '${s.name}',`))
  console.log(`  ],`)
  console.log(`  expectedBarbers: [`)
  barbers?.forEach((b) => console.log(`    '${b.name}',`))
  console.log(`  ],`)
  console.log('}\n')
}

checkTestData().catch(console.error)
