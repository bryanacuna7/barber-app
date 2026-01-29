import { test, expect } from '@playwright/test'

/**
 * Client Management E2E Tests
 *
 * Tests cover:
 * - Viewing clients list
 * - Creating new client
 * - Searching clients
 * - Pagination (Load More)
 * - Client details display
 */

test.describe('Client Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    const testEmail = process.env.TEST_USER_EMAIL || 'test@barbershop.com'
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123'

    await page.getByPlaceholder(/correo/i).fill(testEmail)
    await page.getByPlaceholder(/contraseña/i).fill(testPassword)
    await page.getByRole('button', { name: /entrar/i }).click()

    // Wait for dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Navigate to clients page
    await page.goto('/clientes')
    await page.waitForLoadState('networkidle')
  })

  test('should display clients list page correctly', async ({ page }) => {
    // Verify page elements
    await expect(page.getByRole('heading', { name: /clientes/i })).toBeVisible()

    // Verify search input exists
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible()

    // Verify "Add Client" button exists
    await expect(page.getByRole('button', { name: /agregar cliente/i })).toBeVisible()
  })

  test('should create a new client successfully', async ({ page }) => {
    // Click "Add Client" button
    await page.getByRole('button', { name: /agregar cliente/i }).click()

    // Wait for modal/form to appear
    await page.waitForSelector('[data-testid="client-form"], [role="dialog"]', {
      timeout: 5000,
    })

    // Fill in client details
    const timestamp = Date.now()
    const testClientName = `Test Client ${timestamp}`
    const testClientPhone = `8888${timestamp.toString().slice(-4)}`

    await page.getByLabel(/nombre/i).fill(testClientName)
    await page.getByLabel(/teléfono/i).fill(testClientPhone)

    // Submit form
    await page.getByRole('button', { name: /guardar|crear/i }).click()

    // Wait for success message or client to appear in list
    await expect(page.getByText(/cliente creado|éxito/i)).toBeVisible({ timeout: 5000 })

    // Verify client appears in the list
    await expect(page.getByText(testClientName)).toBeVisible({ timeout: 5000 })
  })

  test('should search for clients', async ({ page }) => {
    // Wait for clients to load
    await page.waitForTimeout(1000)

    // Get first client name if exists
    const clientNames = await page.locator('[data-testid="client-name"]').all()

    if (clientNames.length > 0) {
      const firstClientName = await clientNames[0].textContent()

      if (firstClientName) {
        // Search for that client
        const searchInput = page.getByPlaceholder(/buscar/i)
        await searchInput.fill(firstClientName)

        // Wait for search results
        await page.waitForTimeout(500)

        // Verify search results contain the client
        await expect(page.getByText(firstClientName)).toBeVisible()
      }
    }
  })

  test('should load more clients when pagination button clicked', async ({ page }) => {
    // Wait for initial clients to load
    await page.waitForTimeout(1000)

    // Count initial clients
    const initialClients = await page
      .locator('[data-testid="client-card"], [data-client-item]')
      .count()

    // Look for "Load More" button
    const loadMoreButton = page.getByRole('button', {
      name: /cargar más clientes/i,
    })

    // If button exists and is visible, click it
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click()

      // Wait for new clients to load
      await page.waitForTimeout(1000)

      // Count clients after loading more
      const afterClients = await page
        .locator('[data-testid="client-card"], [data-client-item]')
        .count()

      // Verify more clients loaded
      expect(afterClients).toBeGreaterThan(initialClients)
    } else {
      // If no "Load More" button, it means all clients are loaded (< 20 clients)
      expect(initialClients).toBeLessThanOrEqual(20)
    }
  })

  test('should display client metrics correctly', async ({ page }) => {
    // Verify metrics cards are visible
    const metricsSection = page.locator('[data-testid="metrics"], .grid')

    // Check for common metric labels
    await expect(metricsSection).toBeVisible()

    // Verify at least one metric is displayed
    const hasMetrics = (await page.getByText(/total|activos|nuevos/i).count()) > 0

    expect(hasMetrics).toBe(true)
  })

  test('should handle empty search results', async ({ page }) => {
    // Search for something that definitely doesn't exist
    const searchInput = page.getByPlaceholder(/buscar/i)
    await searchInput.fill('XYZ_NONEXISTENT_CLIENT_99999')

    // Wait for search to process
    await page.waitForTimeout(500)

    // Verify empty state or no results message
    const noResults =
      (await page.getByText(/no se encontraron|sin resultados/i).count()) > 0 ||
      (await page.locator('[data-testid="client-card"], [data-client-item]').count()) === 0

    expect(noResults).toBe(true)
  })
})
