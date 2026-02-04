/**
 * Seed Test Data - Populate test business with realistic data
 *
 * Run with: npx tsx scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedTestData() {
  console.log('\n🌱 Seeding test data...\n')

  // Get business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', 'barberia-test')
    .single()

  if (businessError || !business) {
    console.error('❌ Business "barberia-test" not found')
    console.error('Create the business first or run the seed SQL script')
    return
  }

  const businessId = business.id
  console.log(`✅ Found business: ${businessId}`)

  // Update business operating hours if not set
  // IMPORTANT: Use abbreviated keys (mon, tue, wed) as expected by availability.ts
  const operatingHours = {
    mon: { enabled: true, open: '09:00', close: '18:00' },
    tue: { enabled: true, open: '09:00', close: '18:00' },
    wed: { enabled: true, open: '09:00', close: '18:00' },
    thu: { enabled: true, open: '09:00', close: '18:00' },
    fri: { enabled: true, open: '09:00', close: '18:00' },
    sat: { enabled: true, open: '09:00', close: '14:00' },
    sun: { enabled: false, open: null, close: null },
  }

  const { error: updateError } = await supabase
    .from('businesses')
    .update({
      operating_hours: operatingHours,
      booking_buffer_minutes: 15,
    })
    .eq('id', businessId)

  if (updateError) {
    console.warn('⚠️  Could not update operating hours:', updateError.message)
  } else {
    console.log('✅ Updated operating hours: Mon-Fri 9am-6pm, Sat 9am-2pm')
  }

  // Delete existing test data
  console.log('\n🧹 Cleaning existing test data...')

  await supabase.from('appointments').delete().eq('business_id', businessId)
  await supabase.from('services').delete().eq('business_id', businessId)
  await supabase.from('barbers').delete().eq('business_id', businessId)

  console.log('✅ Cleaned old data')

  // Insert services
  console.log('\n📋 Creating services...')

  const services = [
    {
      name: 'Corte Clásico',
      description: 'Corte tradicional',
      duration_minutes: 30,
      price: 8000,
      display_order: 1,
    },
    {
      name: 'Corte + Barba',
      description: 'Corte más barba',
      duration_minutes: 45,
      price: 12000,
      display_order: 2,
    },
    {
      name: 'Barba Completa',
      description: 'Perfilado de barba',
      duration_minutes: 25,
      price: 5000,
      display_order: 3,
    },
    {
      name: 'Corte Fade',
      description: 'Degradado moderno',
      duration_minutes: 40,
      price: 10000,
      display_order: 4,
    },
    {
      name: 'Corte Niño',
      description: 'Corte para niños',
      duration_minutes: 20,
      price: 5000,
      display_order: 5,
    },
    {
      name: 'Tratamiento Capilar',
      description: 'Tratamiento premium',
      duration_minutes: 35,
      price: 15000,
      display_order: 6,
    },
    {
      name: 'Corte + Cejas',
      description: 'Corte con cejas',
      duration_minutes: 35,
      price: 9000,
      display_order: 7,
    },
  ]

  const { data: insertedServices, error: servicesError } = await supabase
    .from('services')
    .insert(services.map((s) => ({ ...s, business_id: businessId, is_active: true })))
    .select()

  if (servicesError) {
    console.error('❌ Error creating services:', servicesError)
    return
  }

  console.log(`✅ Created ${insertedServices.length} services`)

  // Insert barbers - check existing structure first
  console.log('\n👨‍💼 Creating barbers...')

  // Query existing barber to see schema
  const { data: existingBarbers } = await supabase.from('barbers').select('*').limit(1)

  console.log(
    '📝 Existing barber schema:',
    existingBarbers?.[0] ? Object.keys(existingBarbers[0]) : 'No barbers found'
  )

  const barbers = [
    { name: 'Juan Carlos', email: 'juan.carlos@barberia.cr' },
    { name: 'Miguel Ángel', email: 'miguel.angel@barberia.cr' },
    { name: 'David López', email: 'david.lopez@barberia.cr' },
  ]

  const { data: insertedBarbers, error: barbersError } = await supabase
    .from('barbers')
    .insert(barbers.map((b) => ({ ...b, business_id: businessId, is_active: true })))
    .select()

  if (barbersError) {
    console.error('❌ Error creating barbers:', barbersError)
    console.log('\n💡 Trying minimal insert...')

    // Try minimal insert
    const { data: minimalBarbers, error: minimalError } = await supabase
      .from('barbers')
      .insert(barbers.map((b) => ({ name: b.name, email: b.email, business_id: businessId })))
      .select()

    if (minimalError) {
      console.error('❌ Minimal insert also failed:', minimalError)
      return
    }

    console.log(`✅ Created ${minimalBarbers.length} barbers (minimal)`)
  } else {
    console.log(`✅ Created ${insertedBarbers.length} barbers`)
  }

  console.log('\n✅ Test data seeded successfully!')
  console.log('\n📝 You can now run E2E tests:')
  console.log('   npx playwright test tests/e2e/booking-flow.spec.ts\n')
}

seedTestData().catch(console.error)
