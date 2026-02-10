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

const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@barbershop.dev'
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPass123!'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByPlaceholder(/correo/i).fill(TEST_EMAIL)
  await page.getByPlaceholder(/contraseña/i).fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL(/\/(dashboard|mi-cuenta)/, { timeout: 15000 })
}

test.describe('Gesture & Navigation Contract', () => {
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

    // Check buttons and interactive elements meet tap target minimum
    await assertMinTapTargets(page, 'button, a[href], [role="button"]')
  })
})
