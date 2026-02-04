import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createDemoUser() {
  const email = 'demo@barbershop.com'
  const password = 'demo123456'

  let userId: string | null = null

  // Try to create user first
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  })

  if (newUser?.user) {
    console.log('✅ Demo user created!')
    console.log(`\nCredentials:\n  Email: ${email}\n  Password: ${password}`)
    userId = newUser.user.id
  } else if (createError?.message.includes('already been registered')) {
    // User exists, find their ID via business table
    console.log('✅ Demo user already exists')

    // Look for existing business with slug 'demo'
    const { data: business } = await supabase
      .from('businesses')
      .select('owner_id')
      .eq('slug', 'demo')
      .single()

    if (business?.owner_id) {
      userId = business.owner_id
      console.log(`\nCredentials:\n  Email: ${email}\n  Password: ${password}`)
      console.log(`   User ID: ${userId}`)
    } else {
      console.error('❌ User exists but could not find ID via business table')
      console.log('💡 Try manually finding the user ID in Supabase Dashboard')
      return
    }
  } else {
    console.error('Error:', createError?.message)
    return
  }

  // Setup business and data for the user (new or existing)
  const business = await getOrCreateBusiness(userId!)
  if (business) {
    await seedServices(business.id)
    await seedBarbers(business.id, userId!)
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
        sun: null,
      },
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
      is_active: true,
    },
    {
      business_id: businessId,
      name: 'Fade + Barba',
      description: 'Degradado premium con perfilado de barba.',
      duration_minutes: 45,
      price: 12000,
      display_order: 2,
      is_active: true,
    },
    {
      business_id: businessId,
      name: 'Barba VIP',
      description: 'Hot towel, aceite y delineado preciso.',
      duration_minutes: 25,
      price: 6000,
      display_order: 3,
      is_active: true,
    },
    {
      business_id: businessId,
      name: 'Color + Estilo',
      description: 'Coloración express y styling.',
      duration_minutes: 60,
      price: 15000,
      display_order: 4,
      is_active: true,
    },
  ])

  if (error) {
    console.error('Error seeding services:', error.message)
    return
  }

  console.log('✅ Demo services seeded!')
}

async function seedBarbers(businessId: string, userId: string) {
  const { count } = await supabase
    .from('barbers')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  if ((count || 0) > 0) {
    console.log('✅ Demo barbers already seeded!')

    // Link the first barber to the demo user if not already linked
    const { data: existingBarbers } = await supabase
      .from('barbers')
      .select('id, user_id')
      .eq('business_id', businessId)
      .order('display_order', { ascending: true })
      .limit(1)

    if (existingBarbers && existingBarbers.length > 0 && !existingBarbers[0].user_id) {
      await supabase
        .from('barbers')
        .update({ user_id: userId, email: 'demo@barbershop.com' })
        .eq('id', existingBarbers[0].id)
      console.log('✅ Linked demo user to first barber')
    }
    return
  }

  const { error, data: newBarbers } = await supabase
    .from('barbers')
    .insert([
      {
        business_id: businessId,
        name: 'Marco Rivera',
        email: 'demo@barbershop.com', // Link to demo user
        bio: 'Especialista en fades y diseño de barba.',
        display_order: 1,
        is_active: true,
        user_id: userId, // Link to demo user
      },
      {
        business_id: businessId,
        name: 'Andrés Vega',
        email: 'andres@barbershop.com',
        bio: 'Cortes clásicos y styling premium.',
        display_order: 2,
        is_active: true,
      },
      {
        business_id: businessId,
        name: 'Diego Mora',
        email: 'diego@barbershop.com',
        bio: 'Color y estilos modernos.',
        display_order: 3,
        is_active: true,
      },
    ])
    .select()

  if (error) {
    console.error('Error seeding barbers:', error.message)
    return
  }

  console.log('✅ Demo barbers seeded!')
  console.log(`✅ Marco Rivera linked to demo user (${userId})`)
}
