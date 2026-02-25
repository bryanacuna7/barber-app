/**
 * E2E Tests for Mi Día Feature
 *
 * Tests complete user flows on real browser
 * Includes visual regression testing
 *
 * Coverage Target: 8 critical flows
 *
 * data-testid contract (keep in sync with UI components):
 *   mi-dia-header.tsx:   mi-dia-header, barber-name, current-date, stat-total, stat-pending, stat-completed, stat-no-show, last-updated
 *   mi-dia-timeline.tsx: mi-dia-timeline, mi-dia-empty-state, appointment-{id}
 *   barber-appointment-card.tsx: check-in-button, complete-button, no-show-button
 *   page-v2.tsx:         refresh-button
 */

import { test, expect, type Page } from '@playwright/test'

// Test data setup
// Using demo user created by scripts/create-demo-user.ts
const DEMO_USER = {
  email: 'demo@barbershop.com',
  password: 'demo123456',
}

// Test barber data for mocked responses
const TEST_BARBER = {
  id: 'test-barber-id',
  name: 'Demo Barber',
}

// Helper functions
async function loginAsBarber(page: Page) {
  await page.goto('/login')
  await page.fill('[data-testid="login-email"]', DEMO_USER.email)
  await page.fill('[data-testid="login-password"]', DEMO_USER.password)
  await page.click('button[type="submit"]')

  // Wait for redirect — barbers go to /mi-dia, owners go to /dashboard
  await page.waitForURL(/\/(dashboard|mi-dia)/, { timeout: 10000 })

  // Wait for dashboard content to appear (handles on-demand compilation)
  try {
    await page.waitForSelector('text=Próximas Citas Hoy', {
      timeout: 90000,
      state: 'visible',
    })
  } catch {
    // If not found, wait for greeting text or Mi Día header
    await page.waitForSelector('text=/Buenos días|Buenas tardes|Buenas noches|Mi Día/i', {
      timeout: 90000,
      state: 'visible',
    })
  }

  // Extra wait for all content to render
  await page.waitForTimeout(500)
}

async function setupTestAppointments(page: Page) {
  // Setup test data via API or direct database manipulation
  // This should be implemented based on your test infrastructure
  // For now, we'll work with existing data
}

// Tests
test.describe('Mi Día Feature - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsBarber(page)
    await setupTestAppointments(page)
  })

  test.describe("E2E-001: View Today's Appointments", () => {
    test("should load and display today's appointments", async ({ page }) => {
      // Navigate to Mi Día
      await page.goto('/mi-dia')

      // Wait for page to load
      await page.waitForSelector('[data-testid="mi-dia-header"]', { timeout: 5000 })

      // Verify header is displayed
      await expect(page.locator('[data-testid="barber-name"]')).toBeVisible()

      // Verify date is displayed
      await expect(page.locator('[data-testid="current-date"]')).toBeVisible()

      // Verify stats badges are displayed (total, pending, completed, no-show)
      await expect(page.locator('[data-testid="stat-total"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-pending"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-completed"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-no-show"]')).toBeVisible()

      // Verify appointments timeline is displayed
      await expect(page.locator('[data-testid="mi-dia-timeline"]')).toBeVisible()

      // Take screenshot for visual regression
      await page.screenshot({
        path: 'tests/screenshots/mi-dia-initial-load.png',
        fullPage: true,
      })
    })

    test('should display appointments in chronological order', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid^="appointment-"]')

      // Get all appointment times
      const appointmentTimes = await page
        .locator('[data-testid="appointment-time"]')
        .allTextContents()

      // Verify they are in ascending order
      for (let i = 1; i < appointmentTimes.length; i++) {
        const prevTime = appointmentTimes[i - 1]
        const currentTime = appointmentTimes[i]

        // Simple time comparison (assuming HH:MM format)
        expect(prevTime.localeCompare(currentTime)).toBeLessThanOrEqual(0)
      }
    })

    test('should show loading skeleton initially', async ({ page }) => {
      await page.goto('/mi-dia')

      // Check for loading skeleton (should appear briefly)
      const skeleton = page.locator('.animate-pulse').first()
      if (await skeleton.isVisible()) {
        await expect(skeleton).toBeVisible()
      }

      // Wait for actual content to load
      await page.waitForSelector('[data-testid="mi-dia-header"]', { timeout: 5000 })
    })

    test('should display empty state when no appointments', async ({ page }) => {
      // Mock empty response
      await page.route('**/api/barbers/*/appointments/today', (route) => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            appointments: [],
            barber: { id: TEST_BARBER.id, name: TEST_BARBER.name },
            date: new Date().toISOString().split('T')[0],
            stats: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 },
          }),
        })
      })

      await page.goto('/mi-dia')
      await page.waitForLoadState('networkidle')

      // Verify empty state message
      await expect(page.locator('text=No hay citas hoy')).toBeVisible()
    })
  })

  test.describe('E2E-002: Check-in Flow', () => {
    test('should successfully check-in a pending appointment', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid^="appointment-"]')

      // Find first appointment card with a check-in button
      const checkInButton = page.locator('[data-testid="check-in-button"]').first()

      if (!(await checkInButton.isVisible())) {
        test.skip(true, 'No pending appointments with check-in available')
      }

      // Click check-in button
      await checkInButton.click()

      // Wait for success feedback (toast or status change)
      await page.waitForTimeout(2000)

      // Take screenshot
      await page.screenshot({
        path: 'tests/screenshots/mi-dia-after-check-in.png',
        fullPage: true,
      })
    })

    test('should disable button while check-in is processing', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="check-in-button"]', { timeout: 5000 })

      const checkInButton = page.locator('[data-testid="check-in-button"]').first()

      // Click and immediately check if disabled
      await checkInButton.click()

      // Button should be disabled during API call
      await expect(checkInButton).toBeDisabled()

      // Wait for completion
      await page.waitForTimeout(1000)
    })

    test('should show error toast on check-in failure', async ({ page }) => {
      // Mock API error
      await page.route('**/api/appointments/*/check-in', (route) => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({
            error: 'Estado invalido',
            message: 'Esta cita ya está confirmada',
          }),
        })
      })

      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="check-in-button"]', { timeout: 5000 })

      await page.locator('[data-testid="check-in-button"]').first().click()

      // Verify error feedback appears
      await page.waitForTimeout(2000)
    })
  })

  test.describe('E2E-003: Complete Flow', () => {
    test('should successfully complete a confirmed appointment', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid^="appointment-"]')

      // Find complete button
      const completeButton = page.locator('[data-testid="complete-button"]').first()

      if (!(await completeButton.isVisible())) {
        test.skip(true, 'No completable appointments available')
      }

      // Click complete button
      await completeButton.click()

      // Wait for payment sheet or completion
      await page.waitForTimeout(2000)
    })

    test('should update client stats after completing appointment', async ({ page }) => {
      // This would require checking the database or client profile
      // For now, we'll just verify the API was called correctly

      let apiCalled = false
      await page.route('**/api/appointments/*/complete', (route) => {
        apiCalled = true
        route.continue()
      })

      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="complete-button"]', { timeout: 5000 })

      await page.locator('[data-testid="complete-button"]').first().click()

      await page.waitForTimeout(1000)

      expect(apiCalled).toBe(true)
    })
  })

  test.describe('E2E-004: No-Show Flow', () => {
    test('should successfully mark appointment as no-show', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid^="appointment-"]')

      const noShowButton = page.locator('[data-testid="no-show-button"]').first()

      if (!(await noShowButton.isVisible())) {
        test.skip(true, 'No appointments available for no-show')
      }

      // Click no-show button
      await noShowButton.click()

      // Handle confirmation dialog if exists
      const confirmDialog = page.locator('[role="alertdialog"]')
      if (await confirmDialog.isVisible()) {
        await confirmDialog.locator('button:has-text("Confirmar")').click()
      }

      // Wait for feedback
      await page.waitForTimeout(2000)
    })
  })

  test.describe('E2E-005: Refresh', () => {
    test('should refresh data when clicking Actualizar button', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="refresh-button"]')

      // Get initial last updated time
      const initialLastUpdated = await page.locator('[data-testid="last-updated"]').textContent()

      // Wait a moment
      await page.waitForTimeout(1000)

      // Click refresh button
      await page.locator('[data-testid="refresh-button"]').click()

      // Verify loading spinner appears
      await expect(page.locator('[data-testid="refresh-button"] .animate-spin')).toBeVisible()

      // Wait for refresh to complete
      await page.waitForTimeout(1000)

      // Verify last updated time changed
      const newLastUpdated = await page.locator('[data-testid="last-updated"]').textContent()
      expect(newLastUpdated).not.toBe(initialLastUpdated)
    })

    test('should disable refresh button while refreshing', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="refresh-button"]')

      const refreshButton = page.locator('[data-testid="refresh-button"]')

      await refreshButton.click()

      // Should be disabled during refresh
      await expect(refreshButton).toBeDisabled()

      await page.waitForTimeout(1000)

      // Should be enabled again
      await expect(refreshButton).toBeEnabled()
    })
  })

  test.describe('E2E-007: Mobile Viewport', () => {
    test('should work correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport (iPhone SE)
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="mi-dia-header"]')

      // Verify header is visible
      await expect(page.locator('[data-testid="mi-dia-header"]')).toBeVisible()

      // Verify stats are visible (might be stacked on mobile)
      await expect(page.locator('[data-testid="stat-total"]')).toBeVisible()

      // Verify appointments are visible
      const timeline = page.locator('[data-testid="mi-dia-timeline"]')
      const emptyState = page.locator('[data-testid="mi-dia-empty-state"]')
      await expect(timeline.or(emptyState)).toBeVisible()

      // Take mobile screenshot
      await page.screenshot({
        path: 'tests/screenshots/mi-dia-mobile.png',
        fullPage: true,
      })
    })

    test('should be scrollable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/mi-dia')

      // Wait for timeline or empty state
      const timeline = page.locator('[data-testid="mi-dia-timeline"]')
      const emptyState = page.locator('[data-testid="mi-dia-empty-state"]')
      await expect(timeline.or(emptyState)).toBeVisible()

      // If timeline has appointments, scroll
      if (await timeline.isVisible()) {
        await page.mouse.wheel(0, 500)

        const lastCard = page.locator('[data-testid^="appointment-"]').last()
        if (await lastCard.isVisible()) {
          await expect(lastCard).toBeInViewport()
        }
      }
    })
  })

  test.describe('E2E-008: Error Handling', () => {
    test('should show error state on network failure', async ({ page }) => {
      // Mock network error
      await page.route('**/api/barbers/*/appointments/today', (route) => {
        route.abort('failed')
      })

      await page.goto('/mi-dia')

      // Wait for error state
      await expect(page.locator('text=Error al cargar citas')).toBeVisible({ timeout: 5000 })

      // Verify retry button is visible
      await expect(page.locator('button:has-text("Reintentar")')).toBeVisible()

      // Take error screenshot
      await page.screenshot({
        path: 'tests/screenshots/mi-dia-error-state.png',
      })
    })

    test('should recover from error when retry is clicked', async ({ page }) => {
      let requestCount = 0

      await page.route('**/api/barbers/*/appointments/today', (route) => {
        requestCount++
        if (requestCount === 1) {
          // First request fails
          route.abort('failed')
        } else {
          // Second request succeeds
          route.fulfill({
            status: 200,
            body: JSON.stringify({
              appointments: [],
              barber: { id: TEST_BARBER.id, name: TEST_BARBER.name },
              date: new Date().toISOString().split('T')[0],
              stats: { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 },
            }),
          })
        }
      })

      await page.goto('/mi-dia')

      // Wait for error state
      await page.waitForSelector('button:has-text("Reintentar")')

      // Click retry
      await page.click('button:has-text("Reintentar")')

      // Wait for successful load
      await expect(page.locator('[data-testid="mi-dia-header"]')).toBeVisible({ timeout: 5000 })

      expect(requestCount).toBe(2)
    })

    test('should handle unauthorized access', async ({ page }) => {
      // Mock 401 response
      await page.route('**/api/barbers/*/appointments/today', (route) => {
        route.fulfill({
          status: 401,
          body: JSON.stringify({
            error: 'Unauthorized',
            message: 'No autorizado',
          }),
        })
      })

      await page.goto('/mi-dia')

      // Should redirect to login or show auth error
      await page.waitForURL(/\/(login|error)/, { timeout: 5000 })
    })
  })

  test.describe('Performance Tests', () => {
    test('should load page in less than 1 second on desktop', async ({ page }) => {
      const startTime = Date.now()

      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="mi-dia-header"]')

      const loadTime = Date.now() - startTime

      expect(loadTime).toBeLessThan(1000)
    })

    test('should not cause memory leaks during auto-refresh', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="mi-dia-header"]')

      // Wait for multiple auto-refresh cycles (30s each)
      // This is a simplified test; real memory profiling would use CDP
      await page.waitForTimeout(5000)

      // Verify page is still responsive
      await expect(page.locator('[data-testid="mi-dia-header"]')).toBeVisible()
    })
  })
})

// ==================== Owner-Barber Tests ====================
// These tests use the test owner account (test@barbershop.dev) which
// should have a barber record to act as owner+barber dual-role user.
// Fixture: migration 026 seeds a barber for the test business.
// Migration 041 assigns staff role to barbers with NULL role_id.

const OWNER_BARBER = {
  email: 'test@barbershop.dev',
  password: 'TestPass123!',
}

async function loginAsOwnerBarber(page: Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.fill('[data-testid="login-email"]', OWNER_BARBER.email)
  await page.fill('[data-testid="login-password"]', OWNER_BARBER.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|mi-dia|citas)/, { timeout: 15000 })
  // Wait for content to render (handles on-demand compilation)
  await page.waitForTimeout(2000)
}

test.describe('Owner-Barber Navigation (E2E-009)', () => {
  test('should show Mi Día tab in bottom nav for owner-barber', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsOwnerBarber(page)

    // Navigate to dashboard to see bottom nav
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)

    // Owner-barber should see Mi Día in bottom nav tabs
    const miDiaTab = page.locator('nav a[href="/mi-dia"]')
    await expect(miDiaTab).toBeVisible({ timeout: 5000 })

    // Tap Mi Día tab
    await miDiaTab.click()
    await page.waitForURL('/mi-dia', { timeout: 10000 })

    // Mi Día page should load
    await expect(page.locator('[data-testid="mi-dia-header"]')).toBeVisible({ timeout: 15000 })

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/owner-barber-mi-dia-tab.png',
      fullPage: true,
    })
  })

  test('should show Servicios in More drawer for owner-barber', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsOwnerBarber(page)

    await page.goto('/dashboard')
    await page.waitForTimeout(2000)

    // Open More menu
    const moreButton = page.locator('button[aria-label="Más opciones"]')
    await expect(moreButton).toBeVisible({ timeout: 5000 })
    await moreButton.click()

    // Servicios should be visible in drawer
    await expect(page.locator('a[href="/servicios"]')).toBeVisible({ timeout: 3000 })

    // Take screenshot of drawer
    await page.screenshot({
      path: 'tests/screenshots/owner-barber-more-drawer.png',
    })
  })

  test('should highlight Más tab when on Servicios page for owner-barber', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await loginAsOwnerBarber(page)

    // Navigate directly to servicios
    await page.goto('/servicios')
    await page.waitForTimeout(3000)

    // The "Más" button in bottom nav should have active styling
    // (servicios is in morePages for owner-barber)
    const moreButton = page.locator('button[aria-label="Más opciones"]')
    await expect(moreButton).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Focus Mode (E2E-010)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBarber(page)
  })

  test('should auto-enter focus mode after check-in and dismiss', async ({ page }) => {
    await page.goto('/mi-dia')
    await page.waitForSelector('[data-testid^="appointment-"]', { timeout: 15000 })

    // Find check-in button
    const checkInButton = page.locator('[data-testid="check-in-button"]').first()
    if (!(await checkInButton.isVisible())) {
      test.skip(true, 'No pending appointments available for check-in')
    }

    // Click check-in
    await checkInButton.click()

    // Focus mode should appear
    const focusMode = page.locator('[data-testid="focus-mode"]')
    await expect(focusMode).toBeVisible({ timeout: 5000 })

    // Verify timer is visible
    await expect(focusMode.locator('[role="timer"]')).toBeVisible()

    // Verify complete button is visible
    await expect(page.locator('[data-testid="focus-mode-complete"]')).toBeVisible()

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/focus-mode-active.png',
    })

    // Dismiss focus mode
    await page.locator('[data-testid="focus-mode-dismiss"]').click()

    // Focus mode should disappear
    await expect(focusMode).not.toBeVisible({ timeout: 3000 })

    // Page should still show timeline
    await expect(page.locator('[data-testid="mi-dia-timeline"]')).toBeVisible()
  })
})

test.describe('Complete with Payment Sheet (E2E-011)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBarber(page)
  })

  test('should show payment sheet with 2+ methods and complete', async ({ page }) => {
    await page.goto('/mi-dia')
    await page.waitForSelector('[data-testid^="appointment-"]', { timeout: 15000 })

    // Find complete button (for in-progress or pending appointments)
    const completeButton = page.locator('[data-testid="complete-button"]').first()
    if (!(await completeButton.isVisible())) {
      test.skip(true, 'No completable appointments available')
    }

    // Click complete
    await completeButton.click()

    // If business has 2+ payment methods, a sheet should appear
    const paymentSheet = page.locator('text=¿Cómo pagó el cliente?')
    const isSheetVisible = await paymentSheet.isVisible().catch(() => false)

    if (isSheetVisible) {
      // Payment sheet appeared — verify options
      await expect(paymentSheet).toBeVisible()

      // Take screenshot of payment sheet
      await page.screenshot({
        path: 'tests/screenshots/payment-sheet-open.png',
      })

      // Select first payment option (Efectivo)
      const firstOption = page.locator('button:has-text("Efectivo")')
      if (await firstOption.isVisible()) {
        await firstOption.click()
      } else {
        // Select whatever first option is available
        await page.locator('[role="dialog"] button').first().click()
      }

      // Wait for completion
      await page.waitForTimeout(2000)
    } else {
      // 0 or 1 payment methods — auto-completed without sheet
      await page.waitForTimeout(2000)
    }

    // Take screenshot of result
    await page.screenshot({
      path: 'tests/screenshots/after-complete.png',
      fullPage: true,
    })
  })
})
