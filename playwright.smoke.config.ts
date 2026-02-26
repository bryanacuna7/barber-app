import { defineConfig, devices } from '@playwright/test'

/**
 * Smoke Test Config
 *
 * Separate from main playwright.config.ts because:
 * - Has globalSetup/globalTeardown (creates + cleans test users)
 * - Runs serial within specs (CRUD tests depend on order)
 * - Should NOT interfere with regular `test:e2e`
 *
 * Usage: npm run test:smoke
 */
export default defineConfig({
  testDir: './tests/e2e/smoke',
  testMatch: /.*smoke\.spec\.ts$/,

  globalSetup: require.resolve('./tests/e2e/smoke/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/smoke/global-teardown.ts'),

  // Serial within each spec (CRUD order matters)
  fullyParallel: false,

  // Single worker to avoid race conditions on shared test data
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  timeout: 90000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: 'smoke',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
