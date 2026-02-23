import { test, expect } from '@playwright/test'

/**
 * Authentication Flow Tests
 *
 * Tests cover:
 * - Login with valid credentials
 * - Login with invalid credentials
 * - Logout functionality
 * - Protected route redirection
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login')
  })

  test('should display login page correctly', async ({ page }) => {
    // Verify login page elements are present
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
    await expect(page.getByPlaceholder(/correo/i)).toBeVisible()
    await expect(page.getByPlaceholder(/contraseña/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByPlaceholder(/correo/i).fill('invalid@example.com')
    await page.getByPlaceholder(/contraseña/i).fill('wrongpassword')

    // Click login button
    await page.getByRole('button', { name: /entrar/i }).click()

    // Wait for error message
    await expect(page.getByText(/credenciales inválidas/i)).toBeVisible({ timeout: 5000 })
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Fill in valid credentials (these should be test credentials in your env)
    const testEmail = process.env.TEST_USER_EMAIL || 'test@barbershop.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123'

    await page.getByPlaceholder(/correo/i).fill(testEmail)
    await page.getByPlaceholder(/contraseña/i).fill(testPassword)

    // Click login button
    await page.getByRole('button', { name: /entrar/i }).click()

    // Wait for navigation — owners go to /dashboard, barbers to /mi-dia
    await page.waitForURL(/\/(dashboard|mi-dia)/, { timeout: 10000 })

    // Verify dashboard or Mi Día elements are present
    await expect(page.getByText(/dashboard|mi día/i)).toBeVisible()
  })

  test('should protect dashboard route when not authenticated', async ({ page, context }) => {
    // Clear cookies to ensure no authentication
    await context.clearCookies()

    // Try to access protected route
    await page.goto('/dashboard')

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 })
    await expect(page.url()).toContain('/login')
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    const testEmail = process.env.TEST_USER_EMAIL || 'test@barbershop.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123'

    await page.getByPlaceholder(/correo/i).fill(testEmail)
    await page.getByPlaceholder(/contraseña/i).fill(testPassword)
    await page.getByRole('button', { name: /entrar/i }).click()

    // Wait for dashboard or Mi Día
    await page.waitForURL(/\/(dashboard|mi-dia)/, { timeout: 10000 })

    // Find and click logout button (adjust selector based on your UI)
    await page.getByRole('button', { name: /cerrar sesión/i }).click()

    // Wait for redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 })
    await expect(page.url()).toContain('/login')
  })
})
