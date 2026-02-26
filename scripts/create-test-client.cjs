const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function main() {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'maria@test-client.dev',
    password: 'ClientTest123!',
    email_confirm: true,
  })

  let userId
  if (authError) {
    console.log('Auth note:', authError.message)
    const {
      data: { users },
    } = await supabase.auth.admin.listUsers()
    const existing = users.find((u) => u.email === 'maria@test-client.dev')
    if (existing) {
      userId = existing.id
      console.log('Existing user:', userId)
    } else {
      console.error('Could not find or create user')
      return
    }
  } else {
    userId = authData.user.id
    console.log('Created user:', userId)
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, business_id, user_id')
    .eq('business_id', 'b261af68-ba0f-4f09-a957-9a3df303641d')

  console.log('Clients in test business:', JSON.stringify(clients, null, 2))

  if (!clients || clients.length === 0) {
    console.error('No clients found')
    return
  }

  const target = clients.find((c) => !c.user_id) || clients[0]
  console.log('Target:', target.name, target.id)

  if (target.user_id === userId) {
    console.log('Already linked!')
    return
  }

  const { error: upErr } = await supabase
    .from('clients')
    .update({ user_id: userId })
    .eq('id', target.id)

  if (upErr) console.error('Update error:', upErr)
  else console.log('SUCCESS: Linked user', userId, 'to client', target.name)
}

main().catch(console.error)
