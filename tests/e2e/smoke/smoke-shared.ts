/**
 * Smoke Test Suite — Shared constants, types, and helpers.
 *
 * Used by global-setup, global-teardown, and all *.smoke.spec.ts files.
 */

import path from 'node:path'
import fs from 'node:fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ─── Run ID (unique per invocation) ─────────────────────────────────
export const RUN_ID = process.env.SMOKE_RUN_ID || Date.now().toString()

// ─── Test credentials ───────────────────────────────────────────────
export const PASSWORD = 'SmokeTest123!'
export const OWNER_EMAIL = `smoke-owner-${RUN_ID}@test.barberapp.dev`
export const BARBER_EMAIL = `smoke-barber-${RUN_ID}@test.barberapp.dev`
export const CLIENT_EMAIL = `smoke-client-${RUN_ID}@test.barberapp.dev`
export const BUSINESS_NAME = `Smoke Barbería ${RUN_ID}`
export const BUSINESS_SLUG = `smoke-barberia-${RUN_ID}`
export const CLIENT_PHONE = `8888${RUN_ID.slice(-4)}`

// ─── Seed data ──────────────────────────────────────────────────────
export const SEED_SERVICES = [
  { name: 'Corte Clásico', category: 'corte' as const, duration_minutes: 30, price: 5000 },
  { name: 'Barba Completa', category: 'barba' as const, duration_minutes: 20, price: 3000 },
]

// ─── File paths ─────────────────────────────────────────────────────
export const SMOKE_DIR = __dirname
export const STATE_FILE = path.join(SMOKE_DIR, '.smoke-state.json')
export const OWNER_AUTH = path.join(SMOKE_DIR, '.auth-owner.json')
export const BARBER_AUTH = path.join(SMOKE_DIR, '.auth-barber.json')
export const CLIENT_AUTH = path.join(SMOKE_DIR, '.auth-client.json')

// ─── Types ──────────────────────────────────────────────────────────
export interface SmokeState {
  runId: string
  ownerUserId: string
  barberUserId: string
  clientUserId: string
  businessId: string
  businessSlug: string
  barberId: string
  clientId: string
  serviceIds: string[]
}

// ─── State I/O ──────────────────────────────────────────────────────
export function saveSmokeState(state: SmokeState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
}

export function loadSmokeState(): SmokeState {
  if (!fs.existsSync(STATE_FILE)) {
    throw new Error(`Smoke state file not found: ${STATE_FILE}. Did global-setup run?`)
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'))
}

export function smokeStateExists(): boolean {
  return fs.existsSync(STATE_FILE)
}

export function cleanupFiles(): void {
  for (const f of [STATE_FILE, OWNER_AUTH, BARBER_AUTH, CLIENT_AUTH]) {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f)
    } catch {
      // ignore
    }
  }
}

// ─── Supabase service client ────────────────────────────────────────
let _serviceClient: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (_serviceClient) return _serviceClient

  // Load .env.local (global-setup runs outside Next.js)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  }

  _serviceClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _serviceClient
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Wait helper for page content to be ready (handles slow dev compilation) */
export async function waitForPageContent(
  page: import('@playwright/test').Page,
  timeout = 60000
): Promise<void> {
  // First wait for network to settle (dev server compilation)
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {})

  // Then wait for meaningful content in the DOM
  await page.waitForFunction(
    () => {
      const body = document.body
      if (!body) return false
      const text = body.innerText || ''
      // Page has meaningful content (not blank, not just loading)
      return text.length > 50
    },
    { timeout: 15000 }
  )
}

/** Assert page has no crash indicators (500 error, blank screen, etc.) */
export async function assertNoCrash(page: import('@playwright/test').Page): Promise<void> {
  const content = await page.textContent('body')
  const lower = (content || '').toLowerCase()

  // Check for common crash indicators
  const crashIndicators = [
    'application error',
    'internal server error',
    'unhandled runtime error',
    'error: ',
    'cannot read properties of',
    'typeerror:',
    'referenceerror:',
  ]

  for (const indicator of crashIndicators) {
    if (lower.includes(indicator)) {
      throw new Error(`Page crash detected: "${indicator}" found on ${page.url()}`)
    }
  }

  // Check page is not blank
  if ((content || '').trim().length < 20) {
    throw new Error(`Blank page detected on ${page.url()}`)
  }
}
