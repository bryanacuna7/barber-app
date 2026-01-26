import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createDemoUser() {
  const email = 'demo@barbershop.com'
  const password = 'demo123456'
  
  // Check if user exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email === email)
  
  if (existingUser) {
    console.log('Demo user already exists, updating password...')
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: password
    })
    if (error) {
      console.error('Error updating:', error.message)
      return
    }
    console.log('✅ Password updated!')
    console.log(`\nCredentials:\n  Email: ${email}\n  Password: ${password}`)

    const business = await getOrCreateBusiness(existingUser.id)
    if (business) {
      await seedServices(business.id)
      await seedBarbers(business.id)
    }
    return
  }
  
  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  })
  
  if (error) {
    console.error('Error creating user:', error.message)
    return
  }
  
  console.log('✅ Demo user created!')
  console.log(`\nCredentials:\n  Email: ${email}\n  Password: ${password}`)
  
  const business = await getOrCreateBusiness(data.user.id)
  if (business) {
    await seedServices(business.id)
    await seedBarbers(business.id)
  }
}

createDemoUser()

async function getOrCreateBusiness(ownerId: string) {
  const { data: existing, error: existingError } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('owner_id', ownerId)
    .single()

  if (existing && !existingError) {
    console.log('✅ Demo business already exists!')
    return existing
  }

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: ownerId,
      name: 'Barbería Demo',
      slug: 'demo',
      phone: '8888-8888',
      whatsapp: '8888-8888',
      address: 'San José, Costa Rica',
      operating_hours: {
        mon: { open: '09:00', close: '19:00' },
        tue: { open: '09:00', close: '19:00' },
        wed: { open: '09:00', close: '19:00' },
        thu: { open: '09:00', close: '19:00' },
        fri: { open: '09:00', close: '19:00' },
        sat: { open: '09:00', close: '17:00' },
        sun: null
      }
    })
    .select('id, slug')
    .single()

  if (error) {
    console.error('Error creating business:', error.message)
    return null
  }

  console.log('✅ Demo business created!')
  return data
}

async function seedServices(businessId: string) {
  const { count } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  if ((count || 0) > 0) {
    console.log('✅ Demo services already seeded!')
    return
  }

  const { error } = await supabase.from('services').insert([
    {
      business_id: businessId,
      name: 'Corte Clásico',
      description: 'Corte tradicional con terminación a navaja.',
      duration_minutes: 30,
      price: 8000,
      display_order: 1,
      is_active: true
    },
    {
      business_id: businessId,
      name: 'Fade + Barba',
      description: 'Degradado premium con perfilado de barba.',
      duration_minutes: 45,
      price: 12000,
      display_order: 2,
      is_active: true
    },
    {
      business_id: businessId,
      name: 'Barba VIP',
      description: 'Hot towel, aceite y delineado preciso.',
      duration_minutes: 25,
      price: 6000,
      display_order: 3,
      is_active: true
    },
    {
      business_id: businessId,
      name: 'Color + Estilo',
      description: 'Coloración express y styling.',
      duration_minutes: 60,
      price: 15000,
      display_order: 4,
      is_active: true
    }
  ])

  if (error) {
    console.error('Error seeding services:', error.message)
    return
  }

  console.log('✅ Demo services seeded!')
}

async function seedBarbers(businessId: string) {
  const { count } = await supabase
    .from('barbers')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  if ((count || 0) > 0) {
    console.log('✅ Demo barbers already seeded!')
    return
  }

  const { error } = await supabase.from('barbers').insert([
    {
      business_id: businessId,
      name: 'Marco Rivera',
      email: 'marco@barbershop.com',
      bio: 'Especialista en fades y diseño de barba.',
      display_order: 1,
      is_active: true
    },
    {
      business_id: businessId,
      name: 'Andrés Vega',
      email: 'andres@barbershop.com',
      bio: 'Cortes clásicos y styling premium.',
      display_order: 2,
      is_active: true
    },
    {
      business_id: businessId,
      name: 'Diego Mora',
      email: 'diego@barbershop.com',
      bio: 'Color y estilos modernos.',
      display_order: 3,
      is_active: true
    }
  ])

  if (error) {
    console.error('Error seeding barbers:', error.message)
    return
  }

  console.log('✅ Demo barbers seeded!')
}
