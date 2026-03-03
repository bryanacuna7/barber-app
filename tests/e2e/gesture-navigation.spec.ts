import { test, expect } from '@playwright/test'
import { assertNoHorizontalOverflow, assertMinTapTargets } from './helpers/mobile-utils'

/**
 * Ola 6.1 — Gesture contract validation
 *
 * Verifies the critical navigation/gesture behaviors:
 * 1. Browser back works from deep routes (edge swipe not captured)
 * 2. No horizontal overflow from swipeable rows
 * 3. Swipe affordance indicators render on actionable rows
 *
 * Contract priority (from src/lib/gesture-config.ts):
 *   System back > Vertical scroll > SwipeableRow > Pull-to-refresh
 */

const TEST_EMAIL = process.env.TEST_USER_EMAIL ?? process.env.E2E_OWNER_EMAIL ?? ''
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD ?? process.env.E2E_OWNER_PASSWORD ?? ''
const HAS_TEST_CREDENTIALS = Boolean(TEST_EMAIL && TEST_PASSWORD)
const CORE_TAP_TARGET_SELECTOR = [
  'main button.h-11',
  'main button.h-12',
  'main a.h-11',
  'main a.h-12',
  'main [role="button"].h-11',
  'main [role="button"].h-12',
  'nav button.h-11',
  'nav button.h-12',
  'nav a.h-11',
  'nav a.h-12',
].join(', ')

async function login(page: import('@playwright/test').Page) {
  // Ensure form is hydrated before submit to avoid native GET fallback
  // (/login?email=...&password=...) when React handlers are not yet attached.
  const waitForHydratedLoginForm = async () => {
    await expect(page.locator('[data-testid="login-card"]')).toBeVisible({ timeout: 20000 })
    await page
      .waitForFunction(
        () => {
          const form = document.querySelector('[data-testid="login-form"]')
          if (!form) return false
          const keys = Object.keys(form)
          return keys.some(
            (key) => key.startsWith('__reactProps$') || key.startsWith('__reactFiber$')
          )
        },
        undefined,
        { timeout: 12000 }
      )
      .catch(() => {})
  }

  // Dev server can be under heavy compile load across multi-project runs.
  // Retry login for hydration races and transient route settles.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
      await waitForHydratedLoginForm()

      const emailInput = page
        .locator('[data-testid="login-email"], input[name="email"], input[type="email"]')
        .first()
      const passwordInput = page
        .locator('[data-testid="login-password"], input[name="password"], input[type="password"]')
        .first()
      const submitButton = page
        .locator(
          '[data-testid="login-submit"], button:has-text("Iniciar Sesión"), button:has-text("Entrar")'
        )
        .first()

      await emailInput.fill(TEST_EMAIL)
      await passwordInput.fill(TEST_PASSWORD)
      await submitButton.click()
      await page.waitForURL(/\/(dashboard|mi-cuenta|onboarding)/, { timeout: 35000 })
      return
    } catch (error) {
      const loginErrorVisible = await page
        .locator('[data-testid="login-error"]')
        .isVisible()
        .catch(() => false)
      if (loginErrorVisible) {
        throw new Error(
          `Gesture test login failed with visible auth error. Verify TEST_USER_EMAIL/TEST_USER_PASSWORD.`
        )
      }

      if (attempt === 3) throw error
      await page.waitForTimeout(1200)
    }
  }
}

test.describe('Gesture & Navigation Contract', () => {
  test.skip(
    !HAS_TEST_CREDENTIALS,
    'Set TEST_USER_EMAIL/TEST_USER_PASSWORD (or E2E_OWNER_EMAIL/E2E_OWNER_PASSWORD) for gesture auth checks.'
  )

  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('browser back works from deep config routes', async ({ page }) => {
    // Navigate to a deep route
    await page.goto('/configuracion/general')
    await page.waitForLoadState('networkidle')

    // Verify we're on the deep route
    await expect(page).toHaveURL(/configuracion\/general/)

    // Browser back should work (not captured by any gesture)
    // NOTE: page.goBack() validates browser history navigation, not iOS edge-swipe
    // gesture capture. Real edge-swipe exclusion (24px zones in SwipeableRow) cannot
    // be tested via Playwright — requires manual QA on physical iOS device.
    await page.goBack()
    await page.waitForTimeout(1000)

    // Should be on configuracion landing or previous page
    const url = page.url()
    expect(url).not.toContain('/configuracion/general')
  })

  test('no horizontal overflow on pages with swipeable rows', async ({ page }) => {
    // Clientes page has SwipeableRow in list view
    await page.goto('/clientes')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await assertNoHorizontalOverflow(page)

    // Citas page has SwipeableRow in compact appointment cards
    await page.goto('/citas')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await assertNoHorizontalOverflow(page)
  })

  test('swipeable rows have visible action fallback (MoreVertical menu)', async ({ page }) => {
    // Citas page — compact appointment cards should have MoreVertical dropdown
    await page.goto('/citas')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Check if there are any appointment cards on the page
    const appointmentCards = page.locator('[data-testid="appointment-card"], .border-l-4')
    const cardCount = await appointmentCards.count()

    if (cardCount === 0) {
      // No appointments today — skip check (cannot validate fallback without data)
      test.skip(true, 'No appointment cards rendered — cannot validate fallback')
      return
    }

    // If there ARE appointment cards, they MUST have MoreVertical fallback buttons
    const moreButtons = page.locator('button:has(svg.lucide-more-vertical)')
    const buttonCount = await moreButtons.count()

    expect(buttonCount).toBeGreaterThan(0)

    // Verify first one is visible and clickable
    const firstButton = moreButtons.first()
    await expect(firstButton).toBeVisible()
  })

  test('touch targets meet 44px minimum on gesture-enabled pages', async ({ page }) => {
    await page.goto('/clientes')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check contract-level touch targets (primary actions and nav controls)
    await assertMinTapTargets(page, CORE_TAP_TARGET_SELECTOR)
  })

  test('dark mode parity on core mobile modules', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })

    for (const path of ['/citas', '/clientes', '/servicios', '/barberos', '/analiticas']) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(700)
      await assertNoHorizontalOverflow(page)
      await assertMinTapTargets(page, CORE_TAP_TARGET_SELECTOR)
    }
  })
})
