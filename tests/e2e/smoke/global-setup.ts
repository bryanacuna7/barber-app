/**
 * Smoke Test Global Setup
 *
 * Creates 3 test users (owner, barber, client) + business + seed data
 * in Supabase, then saves storageState for each role.
 *
 * Runs BEFORE all smoke spec files.
 */

import { chromium, type FullConfig } from '@playwright/test'
import {
  RUN_ID,
  PASSWORD,
  OWNER_EMAIL,
  BARBER_EMAIL,
  CLIENT_EMAIL,
  BUSINESS_NAME,
  BUSINESS_SLUG,
  CLIENT_PHONE,
  SEED_SERVICES,
  OWNER_AUTH,
  BARBER_AUTH,
  CLIENT_AUTH,
  getServiceClient,
  saveSmokeState,
  smokeStateExists,
  loadSmokeState,
  cleanupFiles,
  type SmokeState,
} from './smoke-shared'
import { teardownData } from './global-teardown'

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'
  console.log(`\n🔧 Smoke Setup — RUN_ID: ${RUN_ID}`)

  // ── Cleanup stale data from a previous crashed run ──────────────
  if (smokeStateExists()) {
    console.log('⚠️  Found stale .smoke-state.json — cleaning up previous run...')
    try {
      const staleState = loadSmokeState()
      await teardownData(staleState)
    } catch (e) {
      console.warn('  Stale cleanup warning:', (e as Error).message)
    }
    cleanupFiles()
  }

  const supabase = getServiceClient()

  // ── 1. Create Owner ─────────────────────────────────────────────
  console.log('👤 Creating owner:', OWNER_EMAIL)
  const { data: ownerAuth, error: ownerErr } = await supabase.auth.admin.createUser({
    email: OWNER_EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { business_name: BUSINESS_NAME },
  })
  if (ownerErr) throw new Error(`Failed to create owner: ${ownerErr.message}`)
  const ownerUserId = ownerAuth.user.id

  // ── 2. Create Business ──────────────────────────────────────────
  console.log('🏪 Creating business:', BUSINESS_SLUG)
  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .insert({ owner_id: ownerUserId, name: BUSINESS_NAME, slug: BUSINESS_SLUG })
    .select('id')
    .single()
  if (bizErr) throw new Error(`Failed to create business: ${bizErr.message}`)
  const businessId = business.id

  // Mark onboarding complete (trigger auto-creates with completed=false)
  const { error: onbErr } = await supabase
    .from('business_onboarding')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('business_id', businessId)
  if (onbErr) {
    console.warn('  Onboarding update warning:', onbErr.message)
  }

  // ── 2b. Create Subscription (Pro plan — unlimited) ─────────────
  // Without a subscription, canAddService/canAddClient return allowed=false
  console.log('💳 Creating Pro subscription...')
  const { data: proPlan } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('name', 'pro')
    .single()

  if (proPlan) {
    // A trigger may auto-create a basic subscription — update it to Pro
    const { error: subErr } = await supabase
      .from('business_subscriptions')
      .update({
        plan_id: proPlan.id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('business_id', businessId)

    if (subErr) {
      // If no row to update, insert
      const { error: insertErr } = await supabase.from('business_subscriptions').insert({
        business_id: businessId,
        plan_id: proPlan.id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      if (insertErr) console.warn('  Subscription insert warning:', insertErr.message)
    }
  } else {
    console.warn('  ⚠️  Pro plan not found — CRUD tests may fail with 403')
  }

  // ── 3. Seed Services ───────────────────────────────────────────
  console.log('✂️  Seeding services...')
  const serviceIds: string[] = []
  for (const svc of SEED_SERVICES) {
    const { data, error } = await supabase
      .from('services')
      .insert({ business_id: businessId, ...svc })
      .select('id')
      .single()
    if (error) throw new Error(`Failed to create service "${svc.name}": ${error.message}`)
    serviceIds.push(data.id)
  }

  // ── 4. Create Barber ───────────────────────────────────────────
  console.log('💈 Creating barber:', BARBER_EMAIL)
  const { data: barberAuth, error: barberAuthErr } = await supabase.auth.admin.createUser({
    email: BARBER_EMAIL,
    password: PASSWORD,
    email_confirm: true,
  })
  if (barberAuthErr) throw new Error(`Failed to create barber auth: ${barberAuthErr.message}`)
  const barberUserId = barberAuth.user.id

  const { data: barber, error: barberErr } = await supabase
    .from('barbers')
    .insert({
      business_id: businessId,
      name: 'Barber Smoke',
      email: BARBER_EMAIL,
      role: 'barber',
      is_active: true,
      user_id: barberUserId,
    })
    .select('id')
    .single()
  if (barberErr) throw new Error(`Failed to create barber record: ${barberErr.message}`)

  // ── 5. Create Client ───────────────────────────────────────────
  console.log('🧑 Creating client:', CLIENT_EMAIL)
  const { data: clientAuth, error: clientAuthErr } = await supabase.auth.admin.createUser({
    email: CLIENT_EMAIL,
    password: PASSWORD,
    email_confirm: true,
  })
  if (clientAuthErr) throw new Error(`Failed to create client auth: ${clientAuthErr.message}`)
  const clientUserId = clientAuth.user.id

  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .insert({
      business_id: businessId,
      name: 'Cliente Smoke',
      phone: CLIENT_PHONE,
      email: CLIENT_EMAIL,
      user_id: clientUserId,
    })
    .select('id')
    .single()
  if (clientErr) throw new Error(`Failed to create client record: ${clientErr.message}`)

  // ── 6. Save state ─────────────────────────────────────────────
  const state: SmokeState = {
    runId: RUN_ID,
    ownerUserId,
    barberUserId,
    clientUserId,
    businessId,
    businessSlug: BUSINESS_SLUG,
    barberId: barber.id,
    clientId: client.id,
    serviceIds,
  }
  saveSmokeState(state)
  console.log('💾 Smoke state saved')

  // ── 7. Create storageState for each role ───────────────────────
  console.log('🔐 Creating auth sessions...')
  const browser = await chromium.launch()

  const roles = [
    { email: OWNER_EMAIL, file: OWNER_AUTH, label: 'owner' },
    { email: BARBER_EMAIL, file: BARBER_AUTH, label: 'barber' },
    { email: CLIENT_EMAIL, file: CLIENT_AUTH, label: 'client' },
  ]

  for (const role of roles) {
    console.log(`  🔑 Logging in as ${role.label}...`)
    const context = await browser.newContext({ baseURL })
    const page = await context.newPage()

    await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 })

    // Use data-testid selectors (from existing login page)
    await page.locator('[data-testid="login-email"]').fill(role.email)
    await page.locator('[data-testid="login-password"]').fill(PASSWORD)

    // Click and wait for navigation concurrently (Supabase auth can be slow)
    await Promise.all([
      page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 60000 }),
      page.locator('[data-testid="login-submit"]').click({ timeout: 60000 }),
    ])

    // Extra wait for cookies and any secondary redirects to settle
    await page.waitForTimeout(3000)

    // Save auth state
    await context.storageState({ path: role.file })
    await context.close()
    console.log(`  ✅ ${role.label} session saved → ${page.url()}`)
  }

  await browser.close()
  console.log('✅ Smoke setup complete\n')
}

export default globalSetup
