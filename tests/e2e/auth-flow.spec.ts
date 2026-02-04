/**
 * Authentication Flow E2E Tests
 *
 * Test Coverage:
 * - Sign Up (registration + business creation)
 * - Login (authentication + redirect)
 * - Password Reset (forgot + reset flow)
 * - Session Management (persistence + logout)
 * - RLS Policies (basic data access control)
 *
 * Run with: npx playwright test tests/e2e/auth-flow.spec.ts
 */

import { test, expect, type Page } from '@playwright/test'

// ==================== Helper Functions ====================

/**
 * Generate unique email for test isolation
 */
function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `${prefix}.${timestamp}.${random}@test.com`
}

/**
 * Generate unique business name
 */
function generateBusinessName(): string {
  const timestamp = Date.now()
  return `Test Barbería ${timestamp}`
}

/**
 * Navigate to register page
 */
async function navigateToRegister(page: Page) {
  await page.goto('/register')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="register-card"]')).toBeVisible()
}

/**
 * Navigate to login page
 */
async function navigateToLogin(page: Page) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="login-card"]')).toBeVisible()
}

/**
 * Navigate to forgot password page
 */
async function navigateToForgotPassword(page: Page) {
  await page.goto('/forgot-password')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('[data-testid="forgot-password-card"]')).toBeVisible()
}

/**
 * Fill registration form
 */
async function fillRegistrationForm(
  page: Page,
  data: {
    businessName: string
    email: string
    password: string
    confirmPassword: string
  }
) {
  await page.fill('[data-testid="register-business-name"]', data.businessName)
  await page.fill('[data-testid="register-email"]', data.email)
  await page.fill('[data-testid="register-password"]', data.password)
  await page.fill('[data-testid="register-confirm-password"]', data.confirmPassword)
}

/**
 * Fill login form
 */
async function fillLoginForm(page: Page, email: string, password: string) {
  await page.fill('[data-testid="login-email"]', email)
  await page.fill('[data-testid="login-password"]', password)
}

/**
 * Submit form and wait for navigation
 */
async function submitAndWaitForNav(page: Page, buttonTestId: string) {
  await Promise.all([
    page.waitForURL('**/dashboard', { timeout: 10000 }),
    page.click(`[data-testid="${buttonTestId}"]`),
  ])

  // Wait for dashboard to fully load after navigation
  await waitForDashboardLoaded(page)
}

/**
 * Wait for dashboard to fully load (not just navigate to it)
 * Note: In development, Next.js compiles pages on-demand which can take 20-30s
 */
async function waitForDashboardLoaded(page: Page) {
  // Wait for URL to be dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 })

  // Wait for any dashboard content to appear
  // Trying multiple selectors in case one loads before the other
  try {
    await page.waitForSelector('text=Próximas Citas Hoy', {
      timeout: 90000,
      state: 'visible',
    })
  } catch {
    // If "Próximas Citas Hoy" doesn't appear, wait for greeting text
    await page.waitForSelector('text=/Buenos días|Buenas tardes|Buenas noches/i', {
      timeout: 90000,
      state: 'visible',
    })
  }

  // Extra wait for all content to render
  await page.waitForTimeout(500)
}

/**
 * Logout user
 */
async function logout(page: Page) {
  // Navigate to dashboard first if not already there
  if (!page.url().includes('/dashboard')) {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  }

  // Click logout button (available in desktop sidebar or mobile drawer)
  await page.click('[data-testid="logout-button"]')

  // Wait for redirect to login
  await page.waitForURL('**/login', { timeout: 10000 })
}

// ==================== Test Suite ====================

test.describe('Authentication Flow', () => {
  // ==================== Sign Up Tests ====================

  test.describe('Sign Up', () => {
    test('should successfully register a new user with business', async ({ page }) => {
      const businessName = generateBusinessName()
      const email = generateUniqueEmail('signup')
      const password = 'TestPass123!'

      await navigateToRegister(page)

      await fillRegistrationForm(page, {
        businessName,
        email,
        password,
        confirmPassword: password,
      })

      await submitAndWaitForNav(page, 'register-submit')

      // Verify we're logged in (dashboard content visible)
      await expect(page.locator('body')).toContainText(
        /buenos días|buenas tardes|bienvenido|próximas citas/i
      )
    })

    test('should show error for invalid email format', async ({ page }) => {
      await navigateToRegister(page)

      await fillRegistrationForm(page, {
        businessName: 'Test Business',
        email: 'invalid-email',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
      })

      // Trigger validation by blurring email field
      await page.locator('[data-testid="register-email"]').blur()

      // Should show email validation error (from useFormValidation hook)
      // The error might not have a specific testid, but should be visible
      await expect(page.locator('[data-testid="register-email"]')).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    })

    test('should show error for password mismatch', async ({ page }) => {
      await navigateToRegister(page)

      await fillRegistrationForm(page, {
        businessName: 'Test Business',
        email: generateUniqueEmail(),
        password: 'TestPass123!',
        confirmPassword: 'DifferentPass123!',
      })

      await page.click('[data-testid="register-submit"]')

      // Should show validation error
      await expect(page.locator('[data-testid="register-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-error"]')).toContainText(
        /contraseña|password|coinciden|match/i
      )
    })

    test('should show error for weak password', async ({ page }) => {
      await navigateToRegister(page)

      await fillRegistrationForm(page, {
        businessName: 'Test Business',
        email: generateUniqueEmail(),
        password: '123', // Too short
        confirmPassword: '123',
      })

      // Trigger password validation
      await page.locator('[data-testid="register-password"]').blur()

      // Should show password strength indicator or validation error
      await expect(page.locator('[data-testid="register-password"]')).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    })

    test('should show error for duplicate email', async ({ page }) => {
      const email = generateUniqueEmail('duplicate')
      const password = 'TestPass123!'
      const businessName = generateBusinessName()

      // First registration
      await navigateToRegister(page)
      await fillRegistrationForm(page, {
        businessName,
        email,
        password,
        confirmPassword: password,
      })
      await submitAndWaitForNav(page, 'register-submit')

      // Logout
      await logout(page)

      // Try to register again with same email
      await navigateToRegister(page)
      await fillRegistrationForm(page, {
        businessName: generateBusinessName(),
        email, // Same email
        password,
        confirmPassword: password,
      })
      await page.click('[data-testid="register-submit"]')

      // Should show error about duplicate email
      await expect(page.locator('[data-testid="register-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="register-error"]')).toContainText(
        /ya está registrado|already registered/i
      )
    })

    test('should toggle password visibility', async ({ page }) => {
      await navigateToRegister(page)

      const passwordField = page.locator('[data-testid="register-password"]')

      // Initially should be password type
      await expect(passwordField).toHaveAttribute('type', 'password')

      // Click show passwords checkbox
      await page.click('[data-testid="register-show-passwords"]')

      // Should change to text type
      await expect(passwordField).toHaveAttribute('type', 'text')

      // Click again to hide
      await page.click('[data-testid="register-show-passwords"]')
      await expect(passwordField).toHaveAttribute('type', 'password')
    })

    test('should navigate to login from register page', async ({ page }) => {
      await navigateToRegister(page)

      await page.click('[data-testid="login-link"]')

      await expect(page).toHaveURL(/\/login/)
      await expect(page.locator('[data-testid="login-card"]')).toBeVisible()
    })
  })

  // ==================== Login Tests ====================

  test.describe('Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      // First, create a user
      const email = generateUniqueEmail('login')
      const password = 'TestPass123!'
      const businessName = generateBusinessName()

      await navigateToRegister(page)
      await fillRegistrationForm(page, {
        businessName,
        email,
        password,
        confirmPassword: password,
      })
      await submitAndWaitForNav(page, 'register-submit')

      // Logout
      await logout(page)

      // Now login
      await navigateToLogin(page)
      await fillLoginForm(page, email, password)
      await submitAndWaitForNav(page, 'login-submit')

      // Should be on dashboard
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await navigateToLogin(page)

      await fillLoginForm(page, 'nonexistent@test.com', 'WrongPassword123!')
      await page.click('[data-testid="login-submit"]')

      // Should show error message
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="login-error"]')).toContainText(
        /incorrectas|invalid|wrong/i
      )

      // Should still be on login page
      await expect(page).toHaveURL(/\/login/)
    })

    test('should show error for empty email', async ({ page }) => {
      await navigateToLogin(page)

      await fillLoginForm(page, '', 'SomePassword123!')

      // Trigger validation
      await page.locator('[data-testid="login-email"]').blur()

      // Should show validation error
      await expect(page.locator('[data-testid="login-email"]')).toHaveAttribute(
        'aria-invalid',
        'true'
      )
    })

    test('should toggle password visibility', async ({ page }) => {
      await navigateToLogin(page)

      const passwordField = page.locator('[data-testid="login-password"]')

      // Initially password type
      await expect(passwordField).toHaveAttribute('type', 'password')

      // Show password
      await page.click('[data-testid="login-show-password"]')
      await expect(passwordField).toHaveAttribute('type', 'text')

      // Hide password
      await page.click('[data-testid="login-show-password"]')
      await expect(passwordField).toHaveAttribute('type', 'password')
    })

    test('should navigate to register from login page', async ({ page }) => {
      await navigateToLogin(page)

      await page.click('[data-testid="register-link"]')

      await expect(page).toHaveURL(/\/register/)
      await expect(page.locator('[data-testid="register-card"]')).toBeVisible()
    })

    test('should navigate to forgot password from login page', async ({ page }) => {
      await navigateToLogin(page)

      await page.click('[data-testid="forgot-password-link"]')

      await expect(page).toHaveURL(/\/forgot-password/)
      await expect(page.locator('[data-testid="forgot-password-card"]')).toBeVisible()
    })
  })

  // ==================== Password Reset Tests ====================

  test.describe('Password Reset', () => {
    test('should request password reset successfully', async ({ page }) => {
      await navigateToForgotPassword(page)

      await page.fill('[data-testid="forgot-password-email"]', 'test@example.com')
      await page.click('[data-testid="forgot-password-submit"]')

      // Should show success message
      await expect(page.locator('[data-testid="forgot-password-success"]')).toBeVisible()
      await expect(page.locator('[data-testid="forgot-password-success"]')).toContainText(
        /enviamos|sent/i
      )
    })

    test('should handle invalid email format in password reset', async ({ page }) => {
      await navigateToForgotPassword(page)

      await page.fill('[data-testid="forgot-password-email"]', 'invalid-email')

      // HTML5 validation should prevent submission
      const emailInput = page.locator('[data-testid="forgot-password-email"]')
      await expect(emailInput).toHaveAttribute('type', 'email')
    })

    test('should navigate back to login from forgot password', async ({ page }) => {
      await navigateToForgotPassword(page)

      await page.click('[data-testid="back-to-login-link"]')

      await expect(page).toHaveURL(/\/login/)
      await expect(page.locator('[data-testid="login-card"]')).toBeVisible()
    })

    test('should show invalid token message on reset password page without code', async ({
      page,
    }) => {
      await page.goto('/reset-password')
      await page.waitForLoadState('networkidle')

      // Should show invalid token warning
      await expect(page.locator('[data-testid="reset-password-invalid-token"]')).toBeVisible()

      // Submit button should be disabled
      await expect(page.locator('[data-testid="reset-password-submit"]')).toBeDisabled()
    })

    test('should validate password match on reset password form', async ({ page }) => {
      // Simulate having a valid reset code (in real scenario, this would come from email link)
      // For this test, we'll just check the form validation behavior
      await page.goto('/reset-password?code=fake-valid-code')
      await page.waitForLoadState('networkidle')

      await page.fill('[data-testid="reset-password-new-password"]', 'NewPass123!')
      await page.fill('[data-testid="reset-password-confirm-password"]', 'DifferentPass123!')

      await page.click('[data-testid="reset-password-submit"]')

      // Should show error about passwords not matching
      await expect(page.locator('[data-testid="reset-password-error"]')).toBeVisible()
      await expect(page.locator('[data-testid="reset-password-error"]')).toContainText(
        /coinciden|match/i
      )
    })
  })

  // ==================== Session Management Tests ====================

  test.describe('Session Management', () => {
    test('should persist session across page reloads', async ({ page }) => {
      // Create and login user
      const email = generateUniqueEmail('session')
      const password = 'TestPass123!'
      const businessName = generateBusinessName()

      await navigateToRegister(page)
      await fillRegistrationForm(page, {
        businessName,
        email,
        password,
        confirmPassword: password,
      })
      await submitAndWaitForNav(page, 'register-submit')

      // Verify on dashboard
      await expect(page).toHaveURL(/\/dashboard/)

      // Reload page
      await page.reload()

      // Wait for dashboard to load after reload
      await waitForDashboardLoaded(page)

      // Should still be on dashboard (session persisted)
      await expect(page.locator('body')).toContainText(
        /buenos días|buenas tardes|bienvenido|próximas citas/i
      )
    })

    test('should redirect to login when accessing protected route without auth', async ({
      page,
    }) => {
      // Try to access dashboard without authentication
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
      await expect(page.locator('[data-testid="login-card"]')).toBeVisible()
    })

    test('should redirect authenticated user away from auth pages', async ({ page }) => {
      // Create and login user
      const email = generateUniqueEmail('redirect')
      const password = 'TestPass123!'
      const businessName = generateBusinessName()

      await navigateToRegister(page)
      await fillRegistrationForm(page, {
        businessName,
        email,
        password,
        confirmPassword: password,
      })
      await submitAndWaitForNav(page, 'register-submit')

      // Try to access login page while authenticated
      await page.goto('/login')

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test('should logout successfully', async ({ page }) => {
      // Create and login user
      const email = generateUniqueEmail('logout')
      const password = 'TestPass123!'
      const businessName = generateBusinessName()

      await navigateToRegister(page)
      await fillRegistrationForm(page, {
        businessName,
        email,
        password,
        confirmPassword: password,
      })
      await submitAndWaitForNav(page, 'register-submit')

      // Logout
      await logout(page)

      // Should be on login page
      await expect(page).toHaveURL(/\/login/)

      // Try to access dashboard
      await page.goto('/dashboard')

      // Should redirect back to login
      await expect(page).toHaveURL(/\/login/)
    })
  })

  // ==================== RLS Policy Tests (Basic) ====================

  test.describe('RLS Policies', () => {
    test('should only show own business data after login', async ({ page }) => {
      // Create first user with business
      const email1 = generateUniqueEmail('rls1')
      const password = 'TestPass123!'
      const businessName1 = generateBusinessName()

      await navigateToRegister(page)
      await fillRegistrationForm(page, {
        businessName: businessName1,
        email: email1,
        password,
        confirmPassword: password,
      })
      await submitAndWaitForNav(page, 'register-submit')

      // Verify we see our business name in dashboard
      await expect(page.locator('body')).toContainText(businessName1)

      // Logout
      await logout(page)

      // Create second user with different business
      const email2 = generateUniqueEmail('rls2')
      const businessName2 = generateBusinessName()

      await navigateToRegister(page)
      await fillRegistrationForm(page, {
        businessName: businessName2,
        email: email2,
        password,
        confirmPassword: password,
      })
      await submitAndWaitForNav(page, 'register-submit')

      // Should see business2 name, NOT business1 name
      await expect(page.locator('body')).toContainText(businessName2)
      await expect(page.locator('body')).not.toContainText(businessName1)
    })

    test('should prevent access to other business API endpoints', async ({ page, request }) => {
      // This test would require accessing API endpoints directly
      // For now, we'll skip implementation details and mark as TODO
      // Real implementation would use Playwright's request fixture to test API
      test.skip()
    })
  })
})
