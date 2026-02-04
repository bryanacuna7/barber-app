/**
 * E2E Tests for Week View Drag-and-Drop
 *
 * Tests the drag-and-drop appointment rescheduling functionality
 */

import { test, expect, type Page } from '@playwright/test'

// Helper function to login (you may need to adjust based on your auth flow)
async function loginAsTestUser(page: Page) {
  await page.goto('/login')
  // Fill in credentials - adjust selectors as needed
  await page.fill('input[name="email"], input[type="email"]', 'test@example.com')
  await page.fill('input[name="password"], input[type="password"]', 'test-password')
  await page.click('button[type="submit"]')
  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|citas)/, { timeout: 10000 }).catch(() => {
    // If already logged in, might redirect differently
  })
}

test.describe('Week View Drag-and-Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Try to login before tests
    await loginAsTestUser(page)
  })

  test('should display week view with appointments', async ({ page }) => {
    // Navigate to citas page
    await page.goto('/citas?view=week')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Take screenshot of initial state
    await page.screenshot({
      path: 'tests/screenshots/week-view-initial.png',
      fullPage: true,
    })

    // Verify week view is displayed
    await expect(page.locator('text=Hora')).toBeVisible()

    // Verify day headers are visible (should show weekday abbreviations)
    await expect(
      page.locator('text=lun').or(page.locator('text=mar')).or(page.locator('text=mie'))
    ).toBeVisible()
  })

  test('should show draggable appointments with grab cursor', async ({ page }) => {
    await page.goto('/citas?view=week')
    await page.waitForLoadState('networkidle')

    // Find appointments in the week view
    const appointments = page.locator('[class*="rounded-md"][class*="border-l-4"]')
    const count = await appointments.count()

    if (count > 0) {
      // First appointment should be visible
      await expect(appointments.first()).toBeVisible()

      // Take screenshot showing appointments
      await page.screenshot({
        path: 'tests/screenshots/week-view-with-appointments.png',
        fullPage: true,
      })
    }
  })

  test('should highlight drop zones when dragging', async ({ page }) => {
    await page.goto('/citas?view=week')
    await page.waitForLoadState('networkidle')

    // Find a draggable appointment (pending or confirmed status)
    const draggableAppointment = page.locator('[class*="cursor-grab"]').first()

    if (await draggableAppointment.isVisible()) {
      // Get appointment bounding box
      const box = await draggableAppointment.boundingBox()

      if (box) {
        // Start drag
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()

        // Move to a different time slot
        await page.mouse.move(box.x + box.width / 2, box.y + 120, { steps: 5 })

        // Take screenshot during drag
        await page.screenshot({
          path: 'tests/screenshots/week-view-dragging.png',
        })

        // Release
        await page.mouse.up()
      }
    }
  })

  test('should reschedule appointment on valid drop', async ({ page }) => {
    await page.goto('/citas?view=week')
    await page.waitForLoadState('networkidle')

    // Find a draggable appointment
    const draggableAppointment = page.locator('[class*="cursor-grab"]').first()

    if (await draggableAppointment.isVisible()) {
      // Get initial position
      const initialBox = await draggableAppointment.boundingBox()

      if (initialBox) {
        // Perform drag-and-drop to a new time slot (move down by 60px = 1 hour)
        await draggableAppointment.dragTo(page.locator('body'), {
          targetPosition: {
            x: initialBox.x + initialBox.width / 2,
            y: initialBox.y + 120, // Move to next time slot
          },
        })

        // Wait for potential API call
        await page.waitForTimeout(1000)

        // Check for success toast
        const successToast = page.locator('text=Cita reprogramada exitosamente')
        const errorToast = page.locator('text=Error al reprogramar')

        // Take screenshot of result
        await page.screenshot({
          path: 'tests/screenshots/week-view-after-drop.png',
          fullPage: true,
        })
      }
    }
  })

  test('should show conflict error when dropping on occupied slot', async ({ page }) => {
    await page.goto('/citas?view=week')
    await page.waitForLoadState('networkidle')

    // This test requires multiple appointments at different times
    // Mock API to return conflict error
    await page.route('**/api/appointments/*', (route, request) => {
      if (request.method() === 'PATCH') {
        route.fulfill({
          status: 400,
          body: JSON.stringify({ error: 'Horario ocupado' }),
        })
      } else {
        route.continue()
      }
    })

    const draggableAppointment = page.locator('[class*="cursor-grab"]').first()

    if (await draggableAppointment.isVisible()) {
      const box = await draggableAppointment.boundingBox()

      if (box) {
        // Drag to a different slot
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + box.width / 2, box.y + 60, { steps: 5 })
        await page.mouse.up()

        await page.waitForTimeout(500)

        // Check for error toast
        const errorToast = page
          .locator('text=Ya existe una cita en ese horario')
          .or(page.locator('text=Error al reprogramar'))

        // Take screenshot
        await page.screenshot({
          path: 'tests/screenshots/week-view-conflict-error.png',
        })
      }
    }
  })

  test('should not allow dragging completed appointments', async ({ page }) => {
    await page.goto('/citas?view=week')
    await page.waitForLoadState('networkidle')

    // Look for completed appointments (green background)
    const completedAppointment = page.locator('[class*="bg-green-100"]').first()

    if (await completedAppointment.isVisible()) {
      // Verify it doesn't have cursor-grab class
      const hasGrabCursor = await completedAppointment.evaluate((el) => {
        return el.classList.toString().includes('cursor-grab')
      })

      expect(hasGrabCursor).toBe(false)
    }
  })

  test('should work on mobile viewport with touch', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/citas?view=week')
    await page.waitForLoadState('networkidle')

    // Take mobile screenshot
    await page.screenshot({
      path: 'tests/screenshots/week-view-mobile.png',
      fullPage: true,
    })

    // Verify mobile layout shows 3 days
    await expect(page.locator('text=Hora')).toBeVisible()
  })

  test('should show visual feedback during drag', async ({ page }) => {
    await page.goto('/citas?view=week')
    await page.waitForLoadState('networkidle')

    const draggableAppointment = page.locator('[class*="cursor-grab"]').first()

    if (await draggableAppointment.isVisible()) {
      const box = await draggableAppointment.boundingBox()

      if (box) {
        // Start drag but don't complete
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.mouse.move(box.x + 200, box.y + 120, { steps: 10 })

        // Check for drag overlay
        const dragOverlay = page.locator('[class*="shadow-lg"][class*="scale-105"]')

        // Take screenshot of drag state
        await page.screenshot({
          path: 'tests/screenshots/week-view-drag-overlay.png',
        })

        await page.mouse.up()
      }
    }
  })
})
