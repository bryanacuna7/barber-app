/**
 * Seed test appointments for Mi Día testing
 * Creates appointments for today with different statuses
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { addHours, format, startOfDay } from 'date-fns'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedMiDiaAppointments() {
  console.log('\n🌱 Seeding Mi Día test appointments...\n')

  // Get demo business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', 'demo')
    .single()

  if (!business) {
    console.error('❌ Demo business not found')
    return
  }

  // Get first barber (linked to demo user)
  const { data: barber } = await supabase
    .from('barbers')
    .select('id, user_id')
    .eq('business_id', business.id)
    .not('user_id', 'is', null)
    .order('display_order', { ascending: true })
    .limit(1)
    .single()

  if (!barber) {
    console.error('❌ No barber linked to demo user')
    return
  }

  console.log(`✅ Found barber: ${barber.id}`)

  // Get services
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price')
    .eq('business_id', business.id)
    .limit(3)

  if (!services || services.length === 0) {
    console.error('❌ No services found')
    return
  }

  // Clean existing appointments for today
  const today = startOfDay(new Date())
  const todayEnd = addHours(today, 24)

  await supabase
    .from('appointments')
    .delete()
    .eq('barber_id', barber.id)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', todayEnd.toISOString())

  console.log('✅ Cleaned old test appointments')

  // Get or create test client
  let { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('business_id', business.id)
    .eq('phone', '8888-1234')
    .single()

  if (!client) {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        business_id: business.id,
        name: 'Juan Pérez',
        phone: '8888-1234',
        email: 'juan@test.com',
      })
      .select()
      .single()

    if (clientError || !newClient) {
      console.error('❌ Error creating test client:', clientError?.message)
      return
    }

    client = newClient
    console.log('✅ Created test client')
  } else {
    console.log('✅ Using existing test client')
  }

  // Create appointments with different statuses
  const appointments = [
    {
      // Pending - waiting for check-in
      business_id: business.id,
      barber_id: barber.id,
      client_id: client.id,
      service_id: services[0].id,
      scheduled_at: addHours(today, 9).toISOString(), // 9:00 AM
      duration_minutes: services[0].duration_minutes,
      price: services[0].price,
      status: 'pending',
      internal_notes: 'Test pending appointment',
    },
    {
      // Confirmed - ready for completion
      business_id: business.id,
      barber_id: barber.id,
      client_id: client.id,
      service_id: services[1]?.id || services[0].id,
      scheduled_at: addHours(today, 10).toISOString(), // 10:00 AM
      duration_minutes: services[1]?.duration_minutes || services[0].duration_minutes,
      price: services[1]?.price || services[0].price,
      status: 'confirmed',
      internal_notes: 'Test confirmed appointment',
    },
    {
      // Another pending for later
      business_id: business.id,
      barber_id: barber.id,
      client_id: client.id,
      service_id: services[2]?.id || services[0].id,
      scheduled_at: addHours(today, 14).toISOString(), // 2:00 PM
      duration_minutes: services[2]?.duration_minutes || services[0].duration_minutes,
      price: services[2]?.price || services[0].price,
      status: 'pending',
      internal_notes: 'Test afternoon appointment',
    },
  ]

  const { data: newAppointments, error: appointmentsError } = await supabase
    .from('appointments')
    .insert(appointments)
    .select()

  if (appointmentsError) {
    console.error('❌ Error creating appointments:', appointmentsError.message)
    return
  }

  console.log(`✅ Created ${newAppointments?.length || 0} test appointments for today`)
  console.log(`\n📅 Appointments for barber ${barber.id}:`)
  newAppointments?.forEach((apt) => {
    const time = format(new Date(apt.scheduled_at), 'HH:mm')
    console.log(`   - ${time} | ${apt.status} | ${apt.internal_notes}`)
  })

  console.log('\n✅ Mi Día test data ready!')
}

seedMiDiaAppointments()
