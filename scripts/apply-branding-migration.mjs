#!/usr/bin/env node

/**
 * Apply branding migration manually to remote Supabase
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const migrationSQL = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/003_branding.sql'),
  'utf8'
)

async function applyMigration() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: migrationSQL }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('❌ Migration failed:', error)

    // Try alternative method: direct SQL query
    console.log('\n🔄 Trying alternative method...')

    const pgResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sql',
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: 'params=single-object',
      },
      body: migrationSQL,
    })

    if (!pgResponse.ok) {
      console.error('❌ Alternative method also failed')
      console.error(await pgResponse.text())
      process.exit(1)
    }
  }

  console.log('✅ Migration 003_branding.sql applied successfully!')
  console.log('\nColumns added to businesses table:')
  console.log('  - brand_primary_color (TEXT, default #007AFF)')
  console.log('  - brand_secondary_color (TEXT, nullable)')
  console.log('  - logo_url (TEXT, nullable)')
}

applyMigration().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
