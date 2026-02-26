/**
 * Smoke Test Global Teardown
 *
 * Deletes all test data created by global-setup.
 * All operations are wrapped in try/catch — failures are logged but don't throw.
 */

import {
  getServiceClient,
  loadSmokeState,
  smokeStateExists,
  cleanupFiles,
  type SmokeState,
} from './smoke-shared'

/**
 * Delete all test data from Supabase.
 * Exported so global-setup can call it for stale data cleanup.
 */
export async function teardownData(state: SmokeState): Promise<void> {
  const supabase = getServiceClient()

  // Delete in dependency order (children first)
  const deletions = [
    { table: 'appointments', filter: { business_id: state.businessId } },
    { table: 'services', filter: { business_id: state.businessId } },
    { table: 'clients', filter: { business_id: state.businessId } },
    { table: 'barber_invitations', filter: { business_id: state.businessId } },
    { table: 'barbers', filter: { business_id: state.businessId } },
    { table: 'business_onboarding', filter: { business_id: state.businessId } },
    { table: 'notification_preferences', filter: { business_id: state.businessId } },
    { table: 'business_subscriptions', filter: { business_id: state.businessId } },
    { table: 'businesses', filter: { id: state.businessId } },
  ]

  for (const { table, filter } of deletions) {
    try {
      const [col, val] = Object.entries(filter)[0]
      const { error } = await supabase.from(table).delete().eq(col, val)
      if (error) console.warn(`  ⚠️  Delete ${table}: ${error.message}`)
    } catch (e) {
      console.warn(`  ⚠️  Delete ${table}: ${(e as Error).message}`)
    }
  }

  // Delete auth users
  for (const userId of [state.ownerUserId, state.barberUserId, state.clientUserId]) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) console.warn(`  ⚠️  Delete auth user ${userId}: ${error.message}`)
    } catch (e) {
      console.warn(`  ⚠️  Delete auth user ${userId}: ${(e as Error).message}`)
    }
  }
}

async function globalTeardown() {
  console.log('\n🧹 Smoke Teardown')

  if (!smokeStateExists()) {
    console.log('  No .smoke-state.json found — nothing to clean up')
    return
  }

  try {
    const state = loadSmokeState()
    console.log(`  Cleaning up RUN_ID: ${state.runId}`)
    await teardownData(state)
    console.log('  ✅ Supabase data deleted')
  } catch (e) {
    console.warn('  ⚠️  Teardown error:', (e as Error).message)
  }

  // Clean up local files
  cleanupFiles()
  console.log('  ✅ Local files cleaned\n')
}

export default globalTeardown
