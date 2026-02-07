/**
 * E2E Tests for Booking Flow
 *
 * Tests the complete customer booking journey from service selection to confirmation
 *
 * Coverage Target:
 * - Happy path: Service → Barber → Date/Time → Client Info → Success
 * - Error cases: Invalid input, unavailable slots, business closed
 * - Cancel/reschedule flows
 *
 * Priority: P0 (Critical Path)
 * Estimated time: 10-12h
 */

import { test, expect, type Page } from '@playwright/test'
import { format, addDays, startOfDay } from 'date-fns'

// Test data - seeded with scripts/seed-test-data.ts
// PREREQUISITE: Run `npx tsx scripts/seed-test-data.ts` before running these tests
const TEST_BUSINESS = {
  slug: 'barberia-test',
  name: 'Barberia Test',
  expectedServices: [
    'Corte Clásico',
    'Corte + Barba',
    'Barba Completa',
    'Corte Fade',
    'Corte Niño',
    'Tratamiento Capilar',
    'Corte + Cejas',
  ],
  expectedBarbers: ['Juan Carlos', 'Miguel Ángel', 'David López'],
}

// Helper functions
async function navigateToBookingPage(page: Page, slug: string) {
  await page.goto(`/reservar/${slug}`)
  await page.waitForLoadState('networkidle')
}

async function waitForBusinessLoad(page: Page) {
  // Wait for business data to load
  await page.waitForSelector('[data-testid="booking-header"]', { timeout: 10000 })
}

async function selectService(page: Page, serviceName: string) {
  // Wait for services to load
  await page.waitForSelector('[data-testid="service-card"]', { timeout: 5000 })

  // Click on the service by name
  await page.click(`[data-testid="service-card"]:has-text("${serviceName}")`)

  // Wait for step to change
  await page.waitForTimeout(500) // Small delay for state update
}

async function selectBarber(page: Page, barberIndex: number = 0) {
  // Wait for barbers to load
  await page.waitForSelector('[data-testid="barber-card"]', { timeout: 5000 })

  // Click on the first available barber
  const barbers = await page.locator('[data-testid="barber-card"]').all()
  if (barbers.length > barberIndex) {
    await barbers[barberIndex].click()
  } else {
    throw new Error(`Barber at index ${barberIndex} not found`)
  }

  await page.waitForTimeout(500)
}

async function selectDate(page: Page, daysFromToday: number = 2) {
  // Wait for calendar to load
  await page.waitForSelector('[data-testid="date-picker"]', { timeout: 5000 })

  // Use at least 2 days from today to avoid timezone issues with past slots
  const actualDays = Math.max(daysFromToday, 2)
  const targetDate = addDays(startOfDay(new Date()), actualDays)
  const dateButton = format(targetDate, 'yyyy-MM-dd')

  // Click on date button
  await page.click(`[data-date="${dateButton}"]`)

  // Wait for slots to load
  await page.waitForSelector('[data-testid="time-slot"]', { timeout: 10000 })
}

async function selectTimeSlot(page: Page, slotIndex: number = 0) {
  // Wait for time slots to load
  await page.waitForSelector('[data-testid="time-slot"]', { timeout: 5000 })

  // Find enabled slots only (not disabled)
  const enabledSlots = await page.locator('[data-testid="time-slot"]:not([disabled])').all()

  if (enabledSlots.length === 0) {
    throw new Error('No enabled time slots available')
  }

  if (enabledSlots.length > slotIndex) {
    await enabledSlots[slotIndex].click()
  } else {
    throw new Error(
      `Enabled time slot at index ${slotIndex} not found. Only ${enabledSlots.length} enabled slots available`
    )
  }

  await page.waitForTimeout(500)
}

async function fillClientInfo(
  page: Page,
  clientData: {
    name: string
    phone: string
    email: string
    notes?: string
  }
) {
  // Wait for form to load
  await page.waitForSelector('[data-testid="client-info-form"]', { timeout: 5000 })

  // Fill form fields
  await page.fill('[name="name"]', clientData.name)
  await page.fill('[name="phone"]', clientData.phone)
  await page.fill('[name="email"]', clientData.email)

  if (clientData.notes) {
    await page.fill('[name="notes"]', clientData.notes)
  }
}

async function submitBooking(page: Page) {
  // Click submit button
  await page.click('[data-testid="submit-booking"]')

  // Wait for either success or error
  await Promise.race([
    page.waitForSelector('[data-testid="booking-success"]', { timeout: 15000 }),
    page.waitForSelector('[data-testid="booking-error"]', { timeout: 15000 }),
  ])
}

// Test Suite
test.describe('Booking Flow E2E Tests', () => {
  test.describe('E2E-BOOKING-001: Happy Path - Complete Booking Flow', () => {
    test('should complete full booking flow successfully', async ({ page }) => {
      // Step 1: Navigate to booking page
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Verify business name is displayed
      await expect(page.locator('[data-testid="business-name"]')).toContainText(TEST_BUSINESS.name)

      // Step 2: Select Service
      await selectService(page, TEST_BUSINESS.expectedServices[0])

      // Verify we moved to barber selection step
      await expect(page.locator('[data-testid="step-barber"]')).toHaveAttribute(
        'data-active',
        'true'
      )

      // Step 3: Select Barber
      await selectBarber(page, 0)

      // Verify we moved to date/time selection step
      await expect(page.locator('[data-testid="step-datetime"]')).toHaveAttribute(
        'data-active',
        'true'
      )

      // Step 4: Select Date and Time
      await selectDate(page, 1) // Tomorrow
      await selectTimeSlot(page, 0) // First available slot

      // Verify we moved to client info step
      await expect(page.locator('[data-testid="step-info"]')).toHaveAttribute('data-active', 'true')

      // Step 5: Fill Client Information
      await fillClientInfo(page, {
        name: 'E2E Test Client',
        phone: '88887777',
        email: 'e2e-test@example.com',
        notes: 'Test booking from E2E suite',
      })

      // Step 6: Submit Booking
      await submitBooking(page)

      // Verify success message is displayed
      await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()
      await expect(page.locator('[data-testid="confirmation-message"]')).toContainText('Reservada')

      // Verify booking details are shown
      await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible()

      // Take screenshot for visual regression
      await page.screenshot({
        path: 'tests/screenshots/booking-success.png',
        fullPage: true,
      })
    })

    test('should display progress steps correctly throughout flow', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Verify progress steps component exists
      await expect(page.locator('[data-testid="progress-steps"]')).toBeVisible()

      // Step 1: Service (should be active)
      await expect(page.locator('[data-testid="step-service"]')).toHaveAttribute(
        'data-active',
        'true'
      )

      // Select service and verify step 2 is active
      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await expect(page.locator('[data-testid="step-barber"]')).toHaveAttribute(
        'data-active',
        'true'
      )

      // Select barber and verify step 3 is active
      await selectBarber(page, 0)
      await expect(page.locator('[data-testid="step-datetime"]')).toHaveAttribute(
        'data-active',
        'true'
      )

      // Select date/time and verify step 4 is active
      await selectDate(page, 1)
      await selectTimeSlot(page, 0)
      await expect(page.locator('[data-testid="step-info"]')).toHaveAttribute('data-active', 'true')
    })

    test('should allow going back to previous steps', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Complete first 3 steps
      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)
      await selectDate(page, 1)

      // Click back button
      await page.click('[data-testid="back-button"]')

      // Verify we're back at barber selection
      await expect(page.locator('[data-testid="step-barber"]')).toHaveAttribute(
        'data-active',
        'true'
      )

      // Go back again
      await page.click('[data-testid="back-button"]')

      // Verify we're back at service selection
      await expect(page.locator('[data-testid="step-service"]')).toHaveAttribute(
        'data-active',
        'true'
      )
    })
  })

  test.describe('E2E-BOOKING-002: Error Cases and Validation', () => {
    test('should show error for invalid business slug', async ({ page }) => {
      await page.goto('/reservar/invalid-slug-that-does-not-exist')

      // Wait for error message
      await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 })

      // Verify error is displayed
      await expect(page.locator('[data-testid="error-message"]')).toContainText('no encontrado')
    })

    test('should validate client info form fields', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Complete steps to reach client info
      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)
      await selectDate(page, 1)
      await selectTimeSlot(page, 0)

      // Try to submit with empty form
      await page.click('[data-testid="submit-booking"]')

      // Verify validation errors appear
      await expect(page.locator('[data-error="name"]')).toBeVisible()
      await expect(page.locator('[data-error="phone"]')).toBeVisible()

      // Fill only name, leave phone empty
      await page.fill('[name="name"]', 'Test Client')
      await page.click('[data-testid="submit-booking"]')

      // Verify phone error still shows
      await expect(page.locator('[data-error="phone"]')).toBeVisible()
    })

    test('should validate phone number format', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Complete steps to reach client info
      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)
      await selectDate(page, 1)
      await selectTimeSlot(page, 0)

      // Fill form with invalid phone
      await fillClientInfo(page, {
        name: 'Test Client',
        phone: '123', // Too short
        email: 'test@example.com',
      })

      await page.click('[data-testid="submit-booking"]')

      // Verify phone validation error
      await expect(page.locator('[data-error="phone"]')).toContainText('válido')
    })

    test('should validate email format', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Complete steps to reach client info
      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)
      await selectDate(page, 1)
      await selectTimeSlot(page, 0)

      // Fill form with invalid email
      await fillClientInfo(page, {
        name: 'Test Client',
        phone: '88887777',
        email: 'invalid-email', // Invalid format
      })

      await page.click('[data-testid="submit-booking"]')

      // Verify email validation error
      await expect(page.locator('[data-error="email"]')).toContainText('válido')
    })

    test('should show error when no time slots available', async ({ page }) => {
      // TODO: Implement test for business closed or fully booked scenario
      // This requires mocking or setting up specific test data
      test.skip()
    })

    test('should handle API errors gracefully', async ({ page }) => {
      // TODO: Implement test with network errors or API failures
      // This requires mocking network responses
      test.skip()
    })
  })

  test.describe('E2E-BOOKING-003: Service and Barber Selection', () => {
    test('should display all available services', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Verify services are displayed
      const serviceCards = await page.locator('[data-testid="service-card"]').all()
      expect(serviceCards.length).toBeGreaterThan(0)

      // Verify each service has name, duration, and price
      for (const service of serviceCards) {
        await expect(service.locator('[data-testid="service-name"]')).toBeVisible()
        await expect(service.locator('[data-testid="service-duration"]')).toBeVisible()
        await expect(service.locator('[data-testid="service-price"]')).toBeVisible()
      }
    })

    test('should display all available barbers', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Select a service first
      await selectService(page, TEST_BUSINESS.expectedServices[0])

      // Verify barbers are displayed
      const barberCards = await page.locator('[data-testid="barber-card"]').all()
      expect(barberCards.length).toBeGreaterThan(0)

      // Verify each barber has name and photo
      for (const barber of barberCards) {
        await expect(barber.locator('[data-testid="barber-name"]')).toBeVisible()
      }
    })

    test('should highlight selected service', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      const firstService = page.locator('[data-testid="service-card"]').first()
      await firstService.click()

      // Verify service is marked as selected
      await expect(firstService).toHaveAttribute('data-selected', 'true')
    })
  })

  test.describe('E2E-BOOKING-004: Date and Time Selection', () => {
    test('should display calendar with available dates', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)

      // Verify calendar is displayed
      await expect(page.locator('[data-testid="date-picker"]')).toBeVisible()

      // Verify dates are displayed
      const dateCells = await page.locator('[data-testid="date-cell"]').all()
      expect(dateCells.length).toBeGreaterThan(0)
    })

    test('should load time slots when date is selected', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)

      // Select a date
      await selectDate(page, 1)

      // Verify time slots are loaded
      const timeSlots = await page.locator('[data-testid="time-slot"]').all()
      expect(timeSlots.length).toBeGreaterThan(0)

      // Verify time slots have proper format (HH:MM)
      const firstSlotText = await timeSlots[0].textContent()
      expect(firstSlotText).toMatch(/\d{1,2}:\d{2}/)
    })

    test('should show loading state while fetching slots', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)

      // Click on a date and immediately check for loading state
      const targetDate = format(addDays(startOfDay(new Date()), 1), 'yyyy-MM-dd')
      await page.click(`[data-date="${targetDate}"]`)

      // Verify loading indicator appears
      await expect(page.locator('[data-testid="slots-loading"]')).toBeVisible()
    })

    test('should disable past dates', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)

      // Verify today's date is enabled
      const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
      const todayButton = page.locator(`[data-date="${today}"]`)
      await expect(todayButton).not.toBeDisabled()

      // TODO: Verify past dates are disabled
      // This requires calendar to show past dates, which may not be the case
    })
  })

  test.describe('E2E-BOOKING-005: Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

    test('should display correctly on mobile', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Verify header is visible
      await expect(page.locator('[data-testid="booking-header"]')).toBeVisible()

      // Verify services are displayed in mobile layout
      await expect(page.locator('[data-testid="service-card"]').first()).toBeVisible()

      // Take screenshot for visual regression
      await page.screenshot({
        path: 'tests/screenshots/booking-mobile.png',
        fullPage: true,
      })
    })

    test('should complete booking flow on mobile', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Complete full flow on mobile
      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)
      await selectDate(page, 1)
      await selectTimeSlot(page, 0)

      await fillClientInfo(page, {
        name: 'Mobile Test Client',
        phone: '88887777',
        email: 'mobile-test@example.com',
      })

      await submitBooking(page)

      // Verify success on mobile
      await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()
    })
  })

  test.describe('E2E-BOOKING-006: Performance Tests', () => {
    test('should load booking page in under 3 seconds', async ({ page }) => {
      const startTime = Date.now()

      await page.goto(`/reservar/${TEST_BUSINESS.slug}`)
      await waitForBusinessLoad(page)

      const loadTime = Date.now() - startTime

      // Verify page loads in under 3 seconds
      expect(loadTime).toBeLessThan(3000)

      console.log(`✅ Booking page loaded in ${loadTime}ms`)
    })

    test('should fetch time slots in under 2 seconds', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      await selectService(page, TEST_BUSINESS.expectedServices[0])
      await selectBarber(page, 0)

      const startTime = Date.now()

      await selectDate(page, 1)

      // Wait for slots to load
      await page.waitForSelector('[data-testid="time-slot"]', { timeout: 5000 })

      const fetchTime = Date.now() - startTime

      // Verify slots load in under 2 seconds
      expect(fetchTime).toBeLessThan(2000)

      console.log(`✅ Time slots loaded in ${fetchTime}ms`)
    })
  })

  test.describe('E2E-BOOKING-007: Accessibility Tests', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Verify important elements have ARIA labels
      await expect(page.locator('[aria-label="Seleccionar servicio"]')).toBeVisible()

      // TODO: Add more accessibility checks
    })

    test('should be keyboard navigable', async ({ page }) => {
      await navigateToBookingPage(page, TEST_BUSINESS.slug)
      await waitForBusinessLoad(page)

      // Test Tab navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Verify focus is visible
      // TODO: Implement focus verification
    })
  })
})

// TODO: Implement Cancel/Reschedule tests
test.describe.skip('E2E-BOOKING-008: Cancel and Reschedule', () => {
  test('should cancel an existing booking', async ({ page }) => {
    // TODO: Implement cancel booking test
    // Requires:
    // 1. Create a booking first
    // 2. Navigate to booking details/management page
    // 3. Click cancel button
    // 4. Verify cancellation
  })

  test('should reschedule an existing booking', async ({ page }) => {
    // TODO: Implement reschedule booking test
    // Requires:
    // 1. Create a booking first
    // 2. Navigate to booking details/management page
    // 3. Click reschedule button
    // 4. Select new date/time
    // 5. Verify reschedule
  })
})
