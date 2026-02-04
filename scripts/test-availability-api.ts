/**
 * Test availability API endpoint
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAPI() {
  // List all services first
  const { data: allServices } = await supabase
    .from('services')
    .select('id, name, business_id')
    .limit(10)

  console.log('📋 All services:', allServices)

  // Get test business ID
  const { data: testBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', 'barberia-test')
    .single()

  if (!testBusiness) {
    console.error('❌ Test business not found')
    return
  }

  // Get service ID from test business
  const { data: service } = await supabase
    .from('services')
    .select('id, name')
    .eq('business_id', testBusiness.id)
    .eq('name', 'Corte Clásico')
    .single()

  if (!service) {
    console.error('❌ Service "Corte Clásico" not found for test business')
    return
  }

  console.log(`✅ Service: ${service.name} (${service.id})`)

  // Test API
  const testDate = '2026-02-04' // Wednesday
  const url = `http://localhost:3000/api/public/barberia-test/availability?date=${testDate}&service_id=${service.id}`

  console.log(`\n🔍 Testing: ${url}\n`)

  const response = await fetch(url)
  const data = await response.json()

  console.log('Response:', JSON.stringify(data, null, 2))
  console.log(`\n📊 Total slots: ${Array.isArray(data) ? data.length : 0}`)

  if (Array.isArray(data)) {
    const enabledSlots = data.filter((slot: any) => slot.available)
    console.log(`✅ Available slots: ${enabledSlots.length}`)
    console.log(`❌ Disabled slots: ${data.length - enabledSlots.length}`)

    if (enabledSlots.length > 0) {
      console.log(`\n📋 First 5 available slots:`)
      enabledSlots.slice(0, 5).forEach((slot: any) => {
        console.log(`   - ${slot.time}`)
      })
    }
  }
}

testAPI().catch(console.error)
