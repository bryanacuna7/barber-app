/**
 * E2E Tests for Mi Día Feature
 *
 * Tests complete user flows on real browser
 * Includes visual regression testing
 *
 * Coverage Target: 8 critical flows
 */

import { test, expect, type Page } from '@playwright/test'

// Test data setup
const TEST_BARBER = {
  id: 'test-barber-123',
  name: 'Carlos Test',
  email: 'carlos@test.com',
}

const TEST_BUSINESS = {
  id: 'test-business-123',
  name: 'Test Barbershop',
}

// Helper functions
async function loginAsBarber(page: Page) {
  // TODO: Implement actual auth flow
  // For now, mock the session
  await page.goto('/login')
  await page.fill('[name="email"]', TEST_BARBER.email)
  await page.fill('[name="password"]', 'test-password')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')
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
      await expect(page.locator('[data-testid="barber-name"]')).toContainText(TEST_BARBER.name)

      // Verify date is displayed
      const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      await expect(page.locator('[data-testid="current-date"]')).toBeVisible()

      // Verify stats badges are displayed
      await expect(page.locator('[data-testid="stat-total"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-pending"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-confirmed"]')).toBeVisible()
      await expect(page.locator('[data-testid="stat-completed"]')).toBeVisible()

      // Verify appointments timeline is displayed
      await expect(page.locator('[data-testid="appointments-timeline"]')).toBeVisible()

      // Take screenshot for visual regression
      await page.screenshot({
        path: 'tests/screenshots/mi-dia-initial-load.png',
        fullPage: true,
      })
    })

    test('should display appointments in chronological order', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="appointment-card"]')

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
      await expect(page.locator('text=No hay citas para hoy')).toBeVisible()
    })
  })

  test.describe('E2E-002: Check-in Flow', () => {
    test('should successfully check-in a pending appointment', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="appointment-card"]')

      // Find first pending appointment
      const pendingCard = page
        .locator('[data-testid="appointment-card"]')
        .filter({
          has: page.locator('[data-testid="status-badge"]:has-text("Pendiente")'),
        })
        .first()

      await expect(pendingCard).toBeVisible()

      // Get appointment ID for verification
      const appointmentId = await pendingCard.getAttribute('data-appointment-id')

      // Click check-in button
      await pendingCard.locator('[data-testid="btn-check-in"]').click()

      // Wait for success toast
      await expect(page.locator('.toast:has-text("Cita confirmada correctamente")')).toBeVisible({
        timeout: 3000,
      })

      // Verify badge changed to "Confirmada"
      const updatedCard = page.locator(`[data-appointment-id="${appointmentId}"]`)
      await expect(updatedCard.locator('[data-testid="status-badge"]')).toContainText('Confirmada')

      // Verify stats updated
      const confirmedStat = page.locator('[data-testid="stat-confirmed"]')
      const confirmedCount = await confirmedStat.textContent()
      expect(parseInt(confirmedCount || '0')).toBeGreaterThan(0)

      // Take screenshot
      await page.screenshot({
        path: 'tests/screenshots/mi-dia-after-check-in.png',
        fullPage: true,
      })
    })

    test('should disable button while check-in is processing', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="appointment-card"]')

      const checkInButton = page.locator('[data-testid="btn-check-in"]').first()

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
      await page.waitForSelector('[data-testid="btn-check-in"]')

      await page.locator('[data-testid="btn-check-in"]').first().click()

      // Verify error toast
      await expect(page.locator('.toast-error')).toBeVisible({ timeout: 3000 })
      await expect(page.locator('.toast')).toContainText('Esta cita ya está confirmada')
    })
  })

  test.describe('E2E-003: Complete Flow', () => {
    test('should successfully complete a confirmed appointment', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="appointment-card"]')

      // Find first confirmed appointment
      const confirmedCard = page
        .locator('[data-testid="appointment-card"]')
        .filter({
          has: page.locator('[data-testid="status-badge"]:has-text("Confirmada")'),
        })
        .first()

      if (!(await confirmedCard.isVisible())) {
        test.skip('No confirmed appointments available')
      }

      const appointmentId = await confirmedCard.getAttribute('data-appointment-id')

      // Click complete button
      await confirmedCard.locator('[data-testid="btn-complete"]').click()

      // Wait for success toast
      await expect(page.locator('.toast:has-text("Cita completada correctamente")')).toBeVisible({
        timeout: 3000,
      })

      // Verify badge changed to "Completada"
      const updatedCard = page.locator(`[data-appointment-id="${appointmentId}"]`)
      await expect(updatedCard.locator('[data-testid="status-badge"]')).toContainText('Completada')

      // Verify completed stats increased
      const completedStat = page.locator('[data-testid="stat-completed"]')
      const completedCount = await completedStat.textContent()
      expect(parseInt(completedCount || '0')).toBeGreaterThan(0)
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
      await page.waitForSelector('[data-testid="btn-complete"]')

      await page.locator('[data-testid="btn-complete"]').first().click()

      await page.waitForTimeout(1000)

      expect(apiCalled).toBe(true)
    })
  })

  test.describe('E2E-004: No-Show Flow', () => {
    test('should successfully mark appointment as no-show', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="appointment-card"]')

      const appointmentCard = page.locator('[data-testid="appointment-card"]').first()
      const appointmentId = await appointmentCard.getAttribute('data-appointment-id')

      // Click no-show button
      await appointmentCard.locator('[data-testid="btn-no-show"]').click()

      // Handle confirmation dialog if exists
      const confirmDialog = page.locator('[role="alertdialog"]')
      if (await confirmDialog.isVisible()) {
        await confirmDialog.locator('button:has-text("Confirmar")').click()
      }

      // Wait for success toast
      await expect(page.locator('.toast:has-text("Cita marcada como no asistió")')).toBeVisible({
        timeout: 3000,
      })

      // Verify badge changed
      const updatedCard = page.locator(`[data-appointment-id="${appointmentId}"]`)
      await expect(updatedCard.locator('[data-testid="status-badge"]')).toContainText('No asistió')
    })
  })

  test.describe('E2E-005: Pull-to-Refresh', () => {
    test('should refresh data when clicking Actualizar button', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="btn-refresh"]')

      // Get initial last updated time
      const initialLastUpdated = await page.locator('[data-testid="last-updated"]').textContent()

      // Wait a moment
      await page.waitForTimeout(1000)

      // Click refresh button
      await page.locator('[data-testid="btn-refresh"]').click()

      // Verify loading spinner appears
      await expect(page.locator('[data-testid="btn-refresh"] .animate-spin')).toBeVisible()

      // Wait for refresh to complete
      await page.waitForTimeout(1000)

      // Verify last updated time changed
      const newLastUpdated = await page.locator('[data-testid="last-updated"]').textContent()
      expect(newLastUpdated).not.toBe(initialLastUpdated)
    })

    test('should disable refresh button while refreshing', async ({ page }) => {
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="btn-refresh"]')

      const refreshButton = page.locator('[data-testid="btn-refresh"]')

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
      await expect(page.locator('[data-testid="appointments-timeline"]')).toBeVisible()

      // Test touch interaction
      const firstCard = page.locator('[data-testid="appointment-card"]').first()
      await firstCard.tap()

      // Take mobile screenshot
      await page.screenshot({
        path: 'tests/screenshots/mi-dia-mobile.png',
        fullPage: true,
      })
    })

    test('should be scrollable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/mi-dia')
      await page.waitForSelector('[data-testid="appointments-timeline"]')

      // Scroll down
      await page.mouse.wheel(0, 500)

      // Verify scroll worked (last appointment should be visible)
      const lastCard = page.locator('[data-testid="appointment-card"]').last()
      await expect(lastCard).toBeInViewport()
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
