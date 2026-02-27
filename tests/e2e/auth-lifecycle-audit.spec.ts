import { test, expect, type Page } from '@playwright/test'

interface RoleCreds {
  email: string
  password: string
  changePasswordPath: string
}

const OWNER: RoleCreds | null =
  process.env.E2E_OWNER_EMAIL && process.env.E2E_OWNER_PASSWORD
    ? {
        email: process.env.E2E_OWNER_EMAIL,
        password: process.env.E2E_OWNER_PASSWORD,
        changePasswordPath: '/configuracion/avanzado/cambiar-contrasena',
      }
    : null

const BARBER: RoleCreds | null =
  process.env.E2E_BARBER_EMAIL && process.env.E2E_BARBER_PASSWORD
    ? {
        email: process.env.E2E_BARBER_EMAIL,
        password: process.env.E2E_BARBER_PASSWORD,
        changePasswordPath: '/mi-dia/cuenta',
      }
    : null

const CLIENT: RoleCreds | null =
  process.env.E2E_CLIENT_EMAIL && process.env.E2E_CLIENT_PASSWORD
    ? {
        email: process.env.E2E_CLIENT_EMAIL,
        password: process.env.E2E_CLIENT_PASSWORD,
        changePasswordPath: '/mi-cuenta/perfil/cambiar-contrasena',
      }
    : null

async function login(page: Page, creds: RoleCreds) {
  await page.goto('/login')
  await expect(page.locator('[data-testid="login-card"]')).toBeVisible()
  await page.fill('[data-testid="login-email"]', creds.email)
  await page.fill('[data-testid="login-password"]', creds.password)
  await page.click('[data-testid="login-submit"]')
  await page.waitForURL(/\/(dashboard|mi-dia|mi-cuenta)/, { timeout: 30000 })
}

async function assertChangePasswordFormVisible(page: Page) {
  await expect(page.locator('[data-testid="change-password-form"]')).toBeVisible()
  await expect(page.locator('[data-testid="change-password-current"]')).toBeVisible()
  await expect(page.locator('[data-testid="change-password-new"]')).toBeVisible()
  await expect(page.locator('[data-testid="change-password-confirm"]')).toBeVisible()
  await expect(page.locator('[data-testid="change-password-submit"]')).toBeVisible()
}

test.describe('Auth Lifecycle Audit', () => {
  test('protects self-service credential routes for unauthenticated users', async ({ page }) => {
    const protectedPaths = [
      '/configuracion/avanzado/cambiar-contrasena',
      '/mi-dia/cuenta',
      '/mi-cuenta/perfil/cambiar-contrasena',
    ]

    for (const path of protectedPaths) {
      await page.goto(path)
      await page.waitForURL('**/login**', { timeout: 15000 })
      const currentUrl = new URL(page.url())
      expect(currentUrl.pathname).toBe('/login')
      expect(currentUrl.searchParams.get('redirect')).toBe(path)
    }
  })

  test('shows password-updated banner on login and dismisses on first input', async ({ page }) => {
    await page.goto('/login?passwordUpdated=1')
    await expect(page.locator('[data-testid="login-card"]')).toBeVisible()
    await expect(
      page.locator('text=Contraseña actualizada. Inicia sesión nuevamente.')
    ).toBeVisible()

    await page.fill('[data-testid="login-email"]', 'user@example.com')
    await expect(
      page.locator('text=Contraseña actualizada. Inicia sesión nuevamente.')
    ).toHaveCount(0)

    const currentUrl = new URL(page.url())
    expect(currentUrl.pathname).toBe('/login')
    expect(currentUrl.searchParams.get('passwordUpdated')).toBeNull()
  })

  test('forgot/reset entry points remain available and guarded', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.locator('[data-testid="forgot-password-card"]')).toBeVisible()

    await page.goto('/reset-password')
    await expect(page.locator('[data-testid="reset-password-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-password-invalid-token"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-password-submit"]')).toBeDisabled()
  })

  test('owner can access self-service change-password form', async ({ page }) => {
    test.skip(!OWNER, 'Set E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD to run this test')
    await login(page, OWNER!)
    await page.goto(OWNER!.changePasswordPath)
    await assertChangePasswordFormVisible(page)
  })

  test('barber can access self-service change-password form', async ({ page }) => {
    test.skip(!BARBER, 'Set E2E_BARBER_EMAIL and E2E_BARBER_PASSWORD to run this test')
    await login(page, BARBER!)
    await page.goto(BARBER!.changePasswordPath)
    await assertChangePasswordFormVisible(page)
  })

  test('client can access self-service change-password form', async ({ page }) => {
    test.skip(!CLIENT, 'Set E2E_CLIENT_EMAIL and E2E_CLIENT_PASSWORD to run this test')
    await login(page, CLIENT!)
    await page.goto(CLIENT!.changePasswordPath)
    await assertChangePasswordFormVisible(page)
  })

  test('change-password form validates weak password and confirmation mismatch', async ({
    page,
  }) => {
    const anyCreds = OWNER ?? BARBER ?? CLIENT
    test.skip(
      !anyCreds,
      'Set at least one role credential (E2E_OWNER_*, E2E_BARBER_*, or E2E_CLIENT_*)'
    )

    await login(page, anyCreds!)
    await page.goto(anyCreds!.changePasswordPath)
    await assertChangePasswordFormVisible(page)

    await page.fill('[data-testid="change-password-current"]', anyCreds!.password)
    await page.fill('[data-testid="change-password-new"]', 'abc')
    await page.fill('[data-testid="change-password-confirm"]', 'abcd')
    await page.click('[data-testid="change-password-submit"]')

    await expect(page.locator('[data-testid="change-password-new"]')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    await expect(page.locator('[data-testid="change-password-confirm"]')).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })
})
