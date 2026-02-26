/**
 * Owner Smoke Tests
 *
 * Tests every owner-accessible route + services CRUD + navigation links.
 * Uses storageState from global-setup (no login per test).
 */

import { test, expect } from '@playwright/test'
import { OWNER_AUTH, loadSmokeState, waitForPageContent, assertNoCrash } from './smoke-shared'

test.use({ storageState: OWNER_AUTH })

// ─────────────────────────────────────────────────────────────────────
// Route Smoke: Every owner page loads without crashing
// ─────────────────────────────────────────────────────────────────────
test.describe('Owner dashboard routes load', () => {
  const routes = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/citas', label: 'Citas' },
    { path: '/servicios', label: 'Servicios' },
    { path: '/barberos', label: 'Barberos' },
    { path: '/clientes', label: 'Clientes' },
    { path: '/analiticas', label: 'Analíticas' },
    { path: '/configuracion', label: 'Configuración' },
    { path: '/lealtad', label: 'Lealtad' },
    { path: '/suscripcion', label: 'Suscripción' },
    { path: '/guia', label: 'Guía' },
    { path: '/changelog', label: 'Changelog' },
    { path: '/referencias', label: 'Referencias' },
  ]

  for (const route of routes) {
    test(`GET ${route.path} — ${route.label} loads`, async ({ page }) => {
      await page.goto(route.path, { timeout: 60000 })
      await waitForPageContent(page)
      await assertNoCrash(page)

      // Should still be on the expected route (not redirected to /login)
      expect(page.url()).not.toContain('/login')
    })
  }
})

// ─────────────────────────────────────────────────────────────────────
// Navigation: Sidebar/bottom-nav links work correctly
// ─────────────────────────────────────────────────────────────────────
test.describe('Navigation links work', () => {
  /** Dismiss any onboarding tour overlay that might be blocking clicks */
  async function dismissTourOverlay(page: import('@playwright/test').Page) {
    const overlay = page.locator('.fixed.inset-0.bg-black\\/60')
    if (await overlay.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Press Escape to skip the tour (clicking overlay is intercepted by tooltip)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      // If still visible, force-click the overlay
      if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
        await overlay.click({ force: true })
        await page.waitForTimeout(500)
      }
    }
  }

  test('sidebar/nav Citas link navigates correctly', async ({ page }) => {
    await page.goto('/dashboard', { timeout: 60000 })
    await waitForPageContent(page)
    await dismissTourOverlay(page)

    const link = page.locator('a[href="/citas"]').first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await link.click()
    await expect(page).toHaveURL(/\/citas/, { timeout: 30000 })
    await assertNoCrash(page)
  })

  test('sidebar/nav Barberos link navigates correctly', async ({ page }) => {
    await page.goto('/dashboard', { timeout: 60000 })
    await waitForPageContent(page)
    await dismissTourOverlay(page)

    const link = page.locator('a[href="/barberos"]').first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await link.click()
    await expect(page).toHaveURL(/\/barberos/, { timeout: 30000 })
    await assertNoCrash(page)
  })

  test('sidebar/nav Clientes link navigates correctly', async ({ page }) => {
    await page.goto('/dashboard', { timeout: 60000 })
    await waitForPageContent(page)
    await dismissTourOverlay(page)

    const link = page.locator('a[href="/clientes"]').first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await link.click()
    await expect(page).toHaveURL(/\/clientes/, { timeout: 30000 })
    await assertNoCrash(page)
  })

  test('sidebar/nav Servicios link navigates correctly', async ({ page }) => {
    await page.goto('/dashboard', { timeout: 60000 })
    await waitForPageContent(page)
    await dismissTourOverlay(page)

    const link = page.locator('a[href="/servicios"]').first()
    await expect(link).toBeVisible({ timeout: 15000 })
    await link.click()
    await expect(page).toHaveURL(/\/servicios/, { timeout: 30000 })
    await assertNoCrash(page)
  })
})

// ─────────────────────────────────────────────────────────────────────
// Services: Seeded data visible on page
// ─────────────────────────────────────────────────────────────────────
test.describe('Services page content', () => {
  test('services page shows seeded services', async ({ page }) => {
    await page.goto('/servicios')
    await waitForPageContent(page)

    // Wait for service data to load from API (may take a moment after page renders)
    await page.waitForFunction(
      () => {
        const text = document.body.innerText || ''
        return text.includes('Corte Clásico')
      },
      { timeout: 15000 }
    )

    const content = await page.textContent('body')
    expect(content).toContain('Corte Clásico')
    expect(content).toContain('Barba Completa')
  })
})

// ─────────────────────────────────────────────────────────────────────
// Services CRUD via API (uses page.request with storageState cookies)
// ─────────────────────────────────────────────────────────────────────
test.describe('Services CRUD via API', () => {
  let createdServiceId: string

  test('POST /api/services — creates a service', async ({ request }) => {
    const response = await request.post('/api/services', {
      data: {
        name: 'Smoke Test Service',
        category: 'combo',
        duration_minutes: 45,
        price: 7500,
      },
    })

    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.id).toBeTruthy()
    expect(body.name).toBe('Smoke Test Service')
    createdServiceId = body.id
  })

  test('GET /api/services — returns services including created one', async ({ request }) => {
    const response = await request.get('/api/services')
    expect(response.status()).toBe(200)

    const services = await response.json()
    expect(Array.isArray(services)).toBe(true)
    // Should contain our seeded services + the one we just created
    expect(services.length).toBeGreaterThanOrEqual(3)

    const names = services.map((s: { name: string }) => s.name)
    expect(names).toContain('Smoke Test Service')
    expect(names).toContain('Corte Clásico')
  })

  test('PATCH /api/services/:id — updates service name', async ({ request }) => {
    expect(createdServiceId).toBeTruthy()

    const response = await request.patch(`/api/services/${createdServiceId}`, {
      data: { name: 'Smoke Test Service Updated' },
    })
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.name).toBe('Smoke Test Service Updated')
  })

  test('DELETE /api/services/:id — deletes service', async ({ request }) => {
    expect(createdServiceId).toBeTruthy()

    const response = await request.delete(`/api/services/${createdServiceId}`)
    expect(response.status()).toBe(200)
  })

  test('GET /api/services — confirms deletion', async ({ request }) => {
    const response = await request.get('/api/services')
    const services = await response.json()
    const ids = services.map((s: { id: string }) => s.id)
    expect(ids).not.toContain(createdServiceId)
  })
})

// ─────────────────────────────────────────────────────────────────────
// Clients API
// ─────────────────────────────────────────────────────────────────────
test.describe('Clients API', () => {
  test('GET /api/clients — returns paginated data', async ({ request }) => {
    const response = await request.get('/api/clients')
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body.data).toBeDefined()
    expect(body.pagination).toBeDefined()
    expect(body.pagination.total).toBeGreaterThanOrEqual(1)

    // Our seeded client should be there
    const names = body.data.map((c: { name: string }) => c.name)
    expect(names).toContain('Cliente Smoke')
  })

  test('POST /api/clients — creates a client', async ({ request }) => {
    const state = loadSmokeState()
    const phone = `7777${state.runId.slice(-4)}`

    const response = await request.post('/api/clients', {
      data: {
        name: 'Smoke API Client',
        phone,
      },
    })
    expect(response.status()).toBe(201)

    const body = await response.json()
    expect(body.id).toBeTruthy()
    expect(body.name).toBe('Smoke API Client')
  })
})

// ─────────────────────────────────────────────────────────────────────
// Barbers API
// ─────────────────────────────────────────────────────────────────────
test.describe('Barbers API', () => {
  test('GET /api/barbers — returns barbers list', async ({ request }) => {
    const response = await request.get('/api/barbers')
    expect(response.status()).toBe(200)

    const barbers = await response.json()
    expect(Array.isArray(barbers)).toBe(true)
    expect(barbers.length).toBeGreaterThanOrEqual(1)

    const names = barbers.map((b: { name: string }) => b.name)
    expect(names).toContain('Barber Smoke')
  })
})

// ─────────────────────────────────────────────────────────────────────
// Appointments API
// ─────────────────────────────────────────────────────────────────────
test.describe('Appointments API', () => {
  test('GET /api/appointments — returns 200', async ({ request }) => {
    const response = await request.get('/api/appointments')
    expect(response.status()).toBe(200)
  })
})
