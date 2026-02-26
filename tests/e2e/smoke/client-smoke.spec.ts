/**
 * Client Smoke Tests
 *
 * Tests client-accessible routes (/mi-cuenta) and public routes (booking, tracking).
 * Two describe blocks: authenticated client + anonymous public.
 */

import { test, expect } from '@playwright/test'
import { CLIENT_AUTH, loadSmokeState, waitForPageContent, assertNoCrash } from './smoke-shared'

// ─────────────────────────────────────────────────────────────────────
// Authenticated client routes
// ─────────────────────────────────────────────────────────────────────
test.describe('Client authenticated routes', () => {
  test.use({ storageState: CLIENT_AUTH })

  test('GET /mi-cuenta — client dashboard loads', async ({ page }) => {
    await page.goto('/mi-cuenta')
    await waitForPageContent(page)
    await assertNoCrash(page)

    // Should be on /mi-cuenta (not redirected to /login or /dashboard)
    expect(page.url()).toContain('/mi-cuenta')

    // Should NOT show "no tienes cuenta" or similar error
    const content = (await page.textContent('body')) || ''
    expect(content.toLowerCase()).not.toContain('sin cuenta de cliente')
    expect(content.toLowerCase()).not.toContain('no tienes cuenta')
  })

  test('GET /mi-cuenta/perfil — profile page loads', async ({ page }) => {
    await page.goto('/mi-cuenta/perfil')
    await waitForPageContent(page)
    await assertNoCrash(page)
    expect(page.url()).toContain('/mi-cuenta')
  })

  test('client visiting /login redirects to /mi-cuenta', async ({ page }) => {
    await page.goto('/login')
    // Middleware detects client role → redirects to /mi-cuenta
    await expect(page).toHaveURL(/\/mi-cuenta/, { timeout: 15000 })
  })

  test('client visiting /dashboard gets redirected', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForPageContent(page, 15000)

    // Client should NOT see owner dashboard — redirected or access denied
    const url = page.url()
    // Middleware allows through, but layout may redirect or show restricted view
    // At minimum, should not crash
    await assertNoCrash(page)

    // Client doesn't own a business, so dashboard should redirect or show error
    const content = (await page.textContent('body')) || ''
    const redirectedAway = !url.includes('/dashboard')
    const showsNoBusinessError =
      content.toLowerCase().includes('negocio') || content.toLowerCase().includes('business')

    expect(redirectedAway || showsNoBusinessError).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────────────────────────
// Public routes (no auth — fresh browser context)
// ─────────────────────────────────────────────────────────────────────
test.describe('Public routes (no auth)', () => {
  // Explicitly clear storageState for anonymous tests
  test.use({ storageState: { cookies: [], origins: [] } })

  test('GET /reservar/{slug} — public booking page loads', async ({ page }) => {
    const state = loadSmokeState()
    await page.goto(`/reservar/${state.businessSlug}`, { timeout: 60000 })
    await waitForPageContent(page)
    await assertNoCrash(page)

    // Wait for service data to load from API
    await page.waitForFunction(() => (document.body.innerText || '').includes('Corte Clásico'), {
      timeout: 15000,
    })

    const content = (await page.textContent('body')) || ''
    expect(content).toContain('Corte Clásico')
  })

  test('booking flow — can select a service', async ({ page }) => {
    const state = loadSmokeState()
    await page.goto(`/reservar/${state.businessSlug}`)
    await waitForPageContent(page)

    // Click the first service card
    const serviceCard = page.locator('[data-testid="service-card"]').first()
    if (await serviceCard.isVisible({ timeout: 10000 })) {
      await serviceCard.click()
      // After selecting a service, the flow should advance (barber selection or next step)
      await page.waitForTimeout(1000)
      await assertNoCrash(page)
    } else {
      // If no data-testid, try clicking by service name
      await page.getByText('Corte Clásico').click()
      await page.waitForTimeout(1000)
      await assertNoCrash(page)
    }
  })

  test('GET /reservar/nonexistent-slug — shows error for invalid business', async ({ page }) => {
    await page.goto('/reservar/this-business-does-not-exist-99999')
    await page.waitForLoadState('networkidle')

    // Should show a not-found message or error (not a crash)
    const content = (await page.textContent('body')) || ''
    const hasErrorMessage =
      content.toLowerCase().includes('no encontr') ||
      content.toLowerCase().includes('not found') ||
      content.toLowerCase().includes('error') ||
      content.toLowerCase().includes('existe')

    expect(hasErrorMessage).toBeTruthy()
  })

  test('GET /login — shows login form', async ({ page }) => {
    await page.goto('/login')
    await waitForPageContent(page)

    await expect(page.locator('[data-testid="login-card"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="login-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-submit"]')).toBeVisible()
  })

  test('GET /register — shows register form', async ({ page }) => {
    await page.goto('/register')
    await waitForPageContent(page)
    await assertNoCrash(page)

    // Should show registration form
    expect(page.url()).toContain('/register')
  })

  test('protected /dashboard without auth redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })

    // Should preserve redirect param
    expect(page.url()).toContain('redirect')
  })

  test('protected /mi-cuenta without auth redirects to /login', async ({ page }) => {
    await page.goto('/mi-cuenta')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('protected /citas without auth redirects to /login with redirect param', async ({
    page,
  }) => {
    await page.goto('/citas')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    expect(page.url()).toContain('redirect=%2Fcitas')
  })
})
