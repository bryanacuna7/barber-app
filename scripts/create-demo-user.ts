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
  
  // Create business for this user
  const { error: bizError } = await supabase.from('businesses').insert({
    owner_id: data.user.id,
    name: 'Barbería Demo',
    slug: 'demo',
    phone: '8888-8888',
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
  
  if (bizError) {
    console.error('Error creating business:', bizError.message)
  } else {
    console.log('✅ Demo business created!')
  }
}

createDemoUser()
