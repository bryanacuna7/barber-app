/**
 * Seed a full February dataset for end-to-end testing.
 *
 * Usage:
 *   SEED_DEMO_SLUG=/barbershop-pro-bryan DOTENV_CONFIG_PATH=.env.local node --experimental-strip-types -r dotenv/config scripts/seed-february-full-data.ts
 * Optional:
 *   SEED_YEAR=2026
 *   SEED_MONTH=2
 */

import { createClient } from '@supabase/supabase-js'

type Service = {
  id: string
  name: string
  duration_minutes: number
  price: number
}

type Barber = {
  id: string
  name: string
  email: string
}

type Client = {
  id: string
  name: string
  phone: string
}

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

type AppointmentPayload = {
  business_id: string
  barber_id: string
  client_id: string
  service_id: string
  scheduled_at: string
  duration_minutes: number
  price: number
  status: AppointmentStatus
  internal_notes: string
  client_notes: string | null
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRole) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const rawSlug = process.env.SEED_DEMO_SLUG ?? 'barbershop-pro-bryan'
const slug = rawSlug.replace(/^\/+/, '')
const seedYear = Number(process.env.SEED_YEAR ?? new Date().getFullYear())
const seedMonth = Number(process.env.SEED_MONTH ?? 2)
const marker = `FEB-SEED-${seedYear}-${String(seedMonth).padStart(2, '0')}`

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const extraServices = [
  {
    name: 'Beard Deluxe',
    description: 'Beard trim with hot towel',
    duration_minutes: 30,
    price: 7000,
    display_order: 20,
  },
  {
    name: 'Classic + Wash',
    description: 'Classic cut and wash',
    duration_minutes: 40,
    price: 9500,
    display_order: 21,
  },
  {
    name: 'Premium Combo',
    description: 'Haircut, beard and styling',
    duration_minutes: 60,
    price: 14000,
    display_order: 22,
  },
]

const extraBarbers = [
  {
    name: 'Julian Soto',
    email: 'julian.soto@barbershop.pro',
    bio: 'Skin fades and classic scissor cuts',
    display_order: 20,
  },
  {
    name: 'Ricardo Leon',
    email: 'ricardo.leon@barbershop.pro',
    bio: 'Beard specialist and styling',
    display_order: 21,
  },
]

const clientSeeds = [
  ['Alex Rojas', '88110001'],
  ['Brayan Mendez', '88110002'],
  ['Carlos Pineda', '88110003'],
  ['Daniel Acosta', '88110004'],
  ['Edgar Mena', '88110005'],
  ['Fabian Castro', '88110006'],
  ['Gabriel Arce', '88110007'],
  ['Hector Segura', '88110008'],
  ['Ivan Nunez', '88110009'],
  ['Javier Salas', '88110010'],
  ['Kevin Ulloa', '88110011'],
  ['Luis Barrantes', '88110012'],
  ['Marco Alfaro', '88110013'],
  ['Nestor Chaves', '88110014'],
  ['Oscar Monge', '88110015'],
  ['Pablo Rivas', '88110016'],
  ['Ramon Solano', '88110017'],
  ['Sergio Aguilar', '88110018'],
  ['Tomas Quesada', '88110019'],
  ['Uriel Navarro', '88110020'],
  ['Victor Coto', '88110021'],
  ['Walter Rojas', '88110022'],
  ['Xavier Herrera', '88110023'],
  ['Yamil Mora', '88110024'],
  ['Zack Campos', '88110025'],
  ['Adrian Vega', '88110026'],
  ['Braulio Leon', '88110027'],
  ['Cristian Porras', '88110028'],
  ['Diego Roman', '88110029'],
  ['Esteban Molina', '88110030'],
  ['Felipe Zamora', '88110031'],
  ['Gerardo Roldan', '88110032'],
  ['Harold Umaña', '88110033'],
  ['Joel Madrigal', '88110034'],
  ['Mauricio Solis', '88110035'],
] as const

function monthBounds(year: number, month: number) {
  const start = new Date(year, month - 1, 1, 8, 0, 0, 0)
  const end = new Date(year, month, 1, 0, 0, 0, 0)
  return { start, end }
}

function plusDays(base: Date, days: number) {
  const date = new Date(base)
  date.setDate(date.getDate() + days)
  return date
}

function statusForDate(targetDate: Date, now: Date, idx: number): AppointmentStatus {
  const dayStart = new Date(targetDate)
  dayStart.setHours(0, 0, 0, 0)

  const nowDay = new Date(now)
  nowDay.setHours(0, 0, 0, 0)

  if (dayStart < nowDay) {
    const pattern: AppointmentStatus[] = [
      'completed',
      'completed',
      'completed',
      'completed',
      'cancelled',
      'no_show',
    ]
    return pattern[idx % pattern.length]
  }

  if (dayStart.getTime() === nowDay.getTime()) {
    const pattern: AppointmentStatus[] = [
      'completed',
      'confirmed',
      'pending',
      'confirmed',
      'pending',
    ]
    return pattern[idx % pattern.length]
  }

  const pattern: AppointmentStatus[] = ['confirmed', 'pending', 'confirmed', 'pending', 'cancelled']
  return pattern[idx % pattern.length]
}

function isSunday(date: Date) {
  return date.getDay() === 0
}

function isSaturday(date: Date) {
  return date.getDay() === 6
}

async function ensureBaseData(businessId: string) {
  const { data: existingServices, error: servicesErr } = await supabase
    .from('services')
    .select('id,name')
    .eq('business_id', businessId)

  if (servicesErr) {
    throw new Error(`Failed to load services: ${servicesErr.message}`)
  }

  const existingServiceNames = new Set((existingServices ?? []).map((s) => s.name))
  const missingServices = extraServices.filter((s) => !existingServiceNames.has(s.name))

  if (missingServices.length > 0) {
    const { error } = await supabase
      .from('services')
      .insert(missingServices.map((s) => ({ ...s, business_id: businessId, is_active: true })))
    if (error) {
      throw new Error(`Failed to create extra services: ${error.message}`)
    }
  }

  const { data: existingBarbers, error: barbersErr } = await supabase
    .from('barbers')
    .select('id,email')
    .eq('business_id', businessId)

  if (barbersErr) {
    throw new Error(`Failed to load barbers: ${barbersErr.message}`)
  }

  const existingBarberEmails = new Set((existingBarbers ?? []).map((b) => b.email))
  const missingBarbers = extraBarbers.filter((b) => !existingBarberEmails.has(b.email))

  if (missingBarbers.length > 0) {
    const { error } = await supabase
      .from('barbers')
      .insert(missingBarbers.map((b) => ({ ...b, business_id: businessId, is_active: true })))
    if (error) {
      throw new Error(`Failed to create extra barbers: ${error.message}`)
    }
  }

  const { error: clientErr } = await supabase.from('clients').upsert(
    clientSeeds.map(([name, phone], index) => ({
      business_id: businessId,
      name,
      phone,
      email: index % 2 === 0 ? `${phone}@testmail.local` : null,
      notes: index % 3 === 0 ? 'Seeded for February QA' : null,
    })),
    { onConflict: 'business_id,phone' }
  )

  if (clientErr) {
    throw new Error(`Failed to upsert clients: ${clientErr.message}`)
  }
}

async function loadEntities(businessId: string) {
  const [
    { data: services, error: serviceErr },
    { data: barbers, error: barberErr },
    { data: clients, error: clientErr },
  ] = await Promise.all([
    supabase
      .from('services')
      .select('id,name,duration_minutes,price')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('barbers')
      .select('id,name,email')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('display_order', { ascending: true }),
    supabase
      .from('clients')
      .select('id,name,phone')
      .eq('business_id', businessId)
      .in(
        'phone',
        clientSeeds.map(([, phone]) => phone)
      )
      .order('name', { ascending: true }),
  ])

  if (serviceErr || !services?.length)
    throw new Error(`No services available: ${serviceErr?.message ?? 'unknown'}`)
  if (barberErr || !barbers?.length)
    throw new Error(`No barbers available: ${barberErr?.message ?? 'unknown'}`)
  if (clientErr || !clients?.length)
    throw new Error(`No clients available: ${clientErr?.message ?? 'unknown'}`)

  return {
    services: services as Service[],
    barbers: barbers as Barber[],
    clients: clients as Client[],
  }
}

function buildAppointments(
  businessId: string,
  services: Service[],
  barbers: Barber[],
  clients: Client[],
  year: number,
  month: number
) {
  const { start, end } = monthBounds(year, month)
  const now = new Date()
  const payload: AppointmentPayload[] = []
  const slots = [8, 9, 10, 11, 13, 14, 15, 16, 17, 18]

  let dayCursor = new Date(start)
  let sequence = 0

  while (dayCursor < end) {
    if (!isSunday(dayCursor)) {
      let count = isSaturday(dayCursor) ? 7 : 9
      if (dayCursor.getDay() === 5) count += 2

      for (let i = 0; i < count; i++) {
        const slotHour = slots[(sequence + i) % slots.length]
        const appointmentDate = new Date(dayCursor)
        appointmentDate.setHours(slotHour, (i % 2) * 30, 0, 0)

        const service = services[(sequence + i * 2) % services.length]
        const barber = barbers[(sequence + i) % barbers.length]
        const client = clients[(sequence * 3 + i) % clients.length]
        const status = statusForDate(appointmentDate, now, sequence + i)

        payload.push({
          business_id: businessId,
          barber_id: barber.id,
          client_id: client.id,
          service_id: service.id,
          scheduled_at: appointmentDate.toISOString(),
          duration_minutes: service.duration_minutes,
          price: service.price,
          status,
          internal_notes: `${marker} | ${barber.name} | ${service.name}`,
          client_notes: i % 4 === 0 ? 'Seeded February appointment' : null,
        })
      }
      sequence += count
    }

    dayCursor = plusDays(dayCursor, 1)
  }

  return payload
}

async function insertInChunks(rows: AppointmentPayload[], chunkSize = 200) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from('appointments').insert(chunk)
    if (error) {
      throw new Error(`Failed inserting appointments chunk ${i / chunkSize + 1}: ${error.message}`)
    }
  }
}

async function refreshClientStats(businessId: string, clients: Client[]) {
  const clientIds = clients.map((c) => c.id)
  const { data: completed, error } = await supabase
    .from('appointments')
    .select('client_id,scheduled_at,price,status')
    .eq('business_id', businessId)
    .in('client_id', clientIds)
    .eq('status', 'completed')

  if (error) {
    throw new Error(`Failed to read completed appointments: ${error.message}`)
  }

  const aggregate = new Map<string, { visits: number; spent: number; last: string | null }>()
  for (const id of clientIds) {
    aggregate.set(id, { visits: 0, spent: 0, last: null })
  }

  for (const row of completed ?? []) {
    if (!row.client_id) continue
    const current = aggregate.get(row.client_id)
    if (!current) continue
    const price = typeof row.price === 'number' ? row.price : Number(row.price)
    const last = !current.last || row.scheduled_at > current.last ? row.scheduled_at : current.last
    aggregate.set(row.client_id, { visits: current.visits + 1, spent: current.spent + price, last })
  }

  await Promise.all(
    clientIds.map((id) => {
      const stats = aggregate.get(id)!
      return supabase
        .from('clients')
        .update({
          total_visits: stats.visits,
          total_spent: stats.spent,
          last_visit_at: stats.last,
        })
        .eq('id', id)
    })
  )
}

async function run() {
  console.log(
    `\nSeeding February dataset for "${slug}" (${seedYear}-${String(seedMonth).padStart(2, '0')})...\n`
  )

  const { data: business, error: businessErr } = await supabase
    .from('businesses')
    .select('id,name,slug')
    .eq('slug', slug)
    .single()

  if (businessErr || !business) {
    throw new Error(`Business not found for slug "${slug}"`)
  }

  await ensureBaseData(business.id)
  const { services, barbers, clients } = await loadEntities(business.id)

  const { start, end } = monthBounds(seedYear, seedMonth)
  const { error: cleanupErr } = await supabase
    .from('appointments')
    .delete()
    .eq('business_id', business.id)
    .gte('scheduled_at', start.toISOString())
    .lt('scheduled_at', end.toISOString())
    .ilike('internal_notes', `${marker}%`)

  if (cleanupErr) {
    throw new Error(`Failed cleaning old February seed: ${cleanupErr.message}`)
  }

  const rows = buildAppointments(business.id, services, barbers, clients, seedYear, seedMonth)
  await insertInChunks(rows)
  await refreshClientStats(business.id, clients)

  const summary = rows.reduce(
    (acc, row) => {
      acc.total++
      acc[row.status]++
      return acc
    },
    { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 }
  )

  console.log('February seed complete:')
  console.log(`- business: ${business.slug}`)
  console.log(`- services available: ${services.length}`)
  console.log(`- active barbers: ${barbers.length}`)
  console.log(`- seeded clients: ${clients.length}`)
  console.log(`- appointments created: ${summary.total}`)
  console.log(`  - pending: ${summary.pending}`)
  console.log(`  - confirmed: ${summary.confirmed}`)
  console.log(`  - completed: ${summary.completed}`)
  console.log(`  - cancelled: ${summary.cancelled}`)
  console.log(`  - no_show: ${summary.no_show}`)
  console.log(`- marker: ${marker}\n`)
}

run().catch((error) => {
  console.error('Seed failed:', error.message)
  process.exit(1)
})
