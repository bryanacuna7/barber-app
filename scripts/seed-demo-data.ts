/**
 * Seed rich demo data for the dashboard app.
 *
 * Usage:
 *   DOTENV_CONFIG_PATH=.env.local node --experimental-strip-types -r dotenv/config scripts/seed-demo-data.ts
 */

import { createClient } from '@supabase/supabase-js'

type ClientSeed = {
  name: string
  phone: string
  email: string | null
  notes: string | null
}

type BasicService = {
  id: string
  name: string
  duration_minutes: number
  price: number
}

type BasicBarber = {
  id: string
  name: string
}

type BasicClient = {
  id: string
  name: string
  phone: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
const rawDemoSlug = process.env.SEED_DEMO_SLUG ?? 'demo'
const demoSlug = rawDemoSlug.replace(/^\/+/, '')

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const clientSeeds: ClientSeed[] = [
  {
    name: 'Carlos Ramirez',
    phone: '88010001',
    email: 'carlos.ramirez@test.com',
    notes: 'Prefers low fade',
  },
  {
    name: 'Jose Molina',
    phone: '88010002',
    email: 'jose.molina@test.com',
    notes: 'Morning appointments only',
  },
  {
    name: 'Luis Herrera',
    phone: '88010003',
    email: null,
    notes: 'Sensitive skin, no alcohol products',
  },
  { name: 'Marco Solis', phone: '88010004', email: 'marco.solis@test.com', notes: null },
  { name: 'Pedro Vega', phone: '88010005', email: null, notes: 'Usually books every 2 weeks' },
  { name: 'Andres Rojas', phone: '88010006', email: 'andres.rojas@test.com', notes: 'VIP client' },
  { name: 'Roberto Castro', phone: '88010007', email: null, notes: 'Needs extra beard detailing' },
  { name: 'Fernando Diaz', phone: '88010008', email: 'fernando.diaz@test.com', notes: null },
  {
    name: 'Daniel Mora',
    phone: '88010009',
    email: 'daniel.mora@test.com',
    notes: 'Prefers scissors over machine',
  },
  { name: 'Kevin Sanchez', phone: '88010010', email: null, notes: 'Student discount profile' },
  { name: 'Sergio Vargas', phone: '88010011', email: 'sergio.vargas@test.com', notes: null },
  {
    name: 'Javier Campos',
    phone: '88010012',
    email: null,
    notes: 'No waiting tolerance, keep punctual',
  },
]

function addDays(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function buildDate(dayOffset: number, hour: number) {
  const target = addDays(new Date(), dayOffset)
  target.setHours(hour, 0, 0, 0)
  return target.toISOString()
}

function pickPastStatus(index: number) {
  const statuses = ['completed', 'completed', 'completed', 'no_show', 'cancelled'] as const
  return statuses[index % statuses.length]
}

function pickTodayStatus(index: number) {
  const statuses = ['completed', 'confirmed', 'pending', 'confirmed', 'pending'] as const
  return statuses[index % statuses.length]
}

function pickFutureStatus(index: number) {
  return index % 3 === 0 ? 'confirmed' : 'pending'
}

async function runSeed() {
  console.log('\nSeeding rich demo data...\n')

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, slug')
    .eq('slug', demoSlug)
    .single()

  if (businessError || !business) {
    console.error(`Demo business not found for slug "${demoSlug}"`)
    console.error('Run scripts/create-demo-user.ts first')
    process.exit(1)
  }

  const businessId = business.id
  console.log(`Business found: ${business.name} (${business.slug})`)

  const [{ data: services, error: servicesError }, { data: barbers, error: barbersError }] =
    await Promise.all([
      supabase
        .from('services')
        .select('id, name, duration_minutes, price')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
      supabase
        .from('barbers')
        .select('id, name')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
    ])

  if (servicesError || !services?.length) {
    console.error('No active services found for demo business')
    process.exit(1)
  }
  if (barbersError || !barbers?.length) {
    console.error('No active barbers found for demo business')
    process.exit(1)
  }

  const typedServices = services as BasicService[]
  const typedBarbers = barbers as BasicBarber[]

  const { error: clientsUpsertError } = await supabase.from('clients').upsert(
    clientSeeds.map((client) => ({
      business_id: businessId,
      name: client.name,
      phone: client.phone,
      email: client.email,
      notes: client.notes,
    })),
    { onConflict: 'business_id,phone' }
  )

  if (clientsUpsertError) {
    console.error('Failed to upsert clients:', clientsUpsertError.message)
    process.exit(1)
  }

  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, phone')
    .eq('business_id', businessId)
    .in(
      'phone',
      clientSeeds.map((client) => client.phone)
    )
    .order('name', { ascending: true })

  if (clientsError || !clients?.length) {
    console.error('Failed to fetch seeded clients')
    process.exit(1)
  }

  const typedClients = clients as BasicClient[]
  console.log(`Clients ready: ${typedClients.length}`)

  const cleanupFrom = addDays(new Date(), -45).toISOString()
  const cleanupTo = addDays(new Date(), 45).toISOString()

  const { error: cleanupError } = await supabase
    .from('appointments')
    .delete()
    .eq('business_id', businessId)
    .gte('scheduled_at', cleanupFrom)
    .lte('scheduled_at', cleanupTo)

  if (cleanupError) {
    console.error('Failed to clean old demo appointments:', cleanupError.message)
    process.exit(1)
  }

  const hours = [9, 10, 11, 14, 15, 16]
  const appointmentPayload: Array<Record<string, unknown>> = []

  for (let dayOffset = -7; dayOffset <= 10; dayOffset += 1) {
    const dailyCount = dayOffset < 0 ? 4 : dayOffset === 0 ? 5 : 3

    for (let i = 0; i < dailyCount; i += 1) {
      const loopIndex = dayOffset + i + 20
      const barber = typedBarbers[loopIndex % typedBarbers.length]
      const service = typedServices[(loopIndex * 2) % typedServices.length]
      const client = typedClients[(loopIndex * 3) % typedClients.length]
      const hour = hours[(loopIndex * 5) % hours.length]

      let status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
      if (dayOffset < 0) {
        status = pickPastStatus(loopIndex)
      } else if (dayOffset === 0) {
        status = pickTodayStatus(loopIndex)
      } else {
        status = pickFutureStatus(loopIndex)
      }

      appointmentPayload.push({
        business_id: businessId,
        barber_id: barber.id,
        client_id: client.id,
        service_id: service.id,
        scheduled_at: buildDate(dayOffset, hour),
        duration_minutes: service.duration_minutes,
        price: service.price,
        status,
        internal_notes: `Seed demo ${status} | ${barber.name}`,
      })
    }
  }

  const { data: insertedAppointments, error: appointmentsError } = await supabase
    .from('appointments')
    .insert(appointmentPayload)
    .select('id, client_id, scheduled_at, status, price')

  if (appointmentsError || !insertedAppointments) {
    console.error('Failed to create appointments:', appointmentsError?.message ?? 'unknown error')
    process.exit(1)
  }

  const statsMap = new Map<
    string,
    { completedCount: number; completedSpent: number; lastVisitAt: string | null }
  >()

  for (const client of typedClients) {
    statsMap.set(client.id, { completedCount: 0, completedSpent: 0, lastVisitAt: null })
  }

  for (const appointment of insertedAppointments) {
    if (!appointment.client_id || appointment.status !== 'completed') continue
    const prev = statsMap.get(appointment.client_id)
    if (!prev) continue

    const price =
      typeof appointment.price === 'number' ? appointment.price : Number(appointment.price)
    const nextLastVisit =
      !prev.lastVisitAt || appointment.scheduled_at > prev.lastVisitAt
        ? appointment.scheduled_at
        : prev.lastVisitAt

    statsMap.set(appointment.client_id, {
      completedCount: prev.completedCount + 1,
      completedSpent: prev.completedSpent + price,
      lastVisitAt: nextLastVisit,
    })
  }

  await Promise.all(
    typedClients.map((client) => {
      const stats = statsMap.get(client.id)
      if (!stats) return Promise.resolve()
      return supabase
        .from('clients')
        .update({
          total_visits: stats.completedCount,
          total_spent: stats.completedSpent,
          last_visit_at: stats.lastVisitAt,
        })
        .eq('id', client.id)
    })
  )

  const summary = insertedAppointments.reduce(
    (acc, appointment) => {
      acc.total += 1
      acc[appointment.status] += 1
      return acc
    },
    { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 }
  )

  console.log('\nDemo data ready:')
  console.log(`- Clients: ${typedClients.length}`)
  console.log(`- Appointments: ${summary.total}`)
  console.log(`  - pending: ${summary.pending}`)
  console.log(`  - confirmed: ${summary.confirmed}`)
  console.log(`  - completed: ${summary.completed}`)
  console.log(`  - cancelled: ${summary.cancelled}`)
  console.log(`  - no_show: ${summary.no_show}\n`)
}

runSeed().catch((error) => {
  console.error('Unexpected seed failure:', error)
  process.exit(1)
})
