import { test, expect } from '@playwright/test'

/**
 * 🎬 Ejemplo de test con Trace Viewer
 *
 * Este test demuestra cómo usar el Trace Viewer de Playwright.
 * Al ejecutar este test, se genera automáticamente:
 * - trace.zip (timeline completo de acciones)
 * - video.webm (grabación de pantalla)
 * - screenshots (en cada paso importante)
 *
 * Para ver el trace después de ejecutar:
 * npm run test:e2e:trace test-results/chromium-example-trace/trace.zip
 */

test.describe('Example: Trace Viewer Demo', () => {
  test('navigate and interact with homepage', async ({ page }) => {
    // 1. Navegar a homepage
    await page.goto('/')

    // El trace captura automáticamente:
    // - Screenshot del homepage
    // - Network requests (HTML, CSS, JS, APIs)
    // - Console logs

    // 2. Verificar título
    await expect(page).toHaveTitle(/Barber/)

    // 3. Interactuar con elementos
    // (ajusta los selectores según tu app real)
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    // 4. Navegar a otra página
    // await page.click('a[href="/about"]')
    // await expect(page).toHaveURL(/.*about/)

    // 5. Interactuar con formulario (ejemplo)
    // await page.fill('input[name="search"]', 'haircut')
    // await page.click('button[type="submit"]')

    // Cada una de estas acciones se captura en el trace con:
    // - Timestamp exacto
    // - Screenshot antes/después
    // - DOM snapshot
    // - Network activity
  })

  test('handle errors gracefully', async ({ page }) => {
    // Este test demuestra cómo el trace ayuda a debuggear errores

    await page.goto('/')

    // Si este selector no existe, el trace mostrará:
    // - Qué elementos SÍ existen en la página
    // - Screenshot del estado actual
    // - Console errors si los hay
    //
    // await page.click('button[data-testid="non-existent"]')
    //
    // Abre el trace para ver exactamente por qué falló
  })

  test('verify API calls', async ({ page }) => {
    // El trace captura todas las network requests

    await page.goto('/')

    // En Trace Viewer → Network tab, verás:
    // - Todas las llamadas HTTP
    // - Status codes
    // - Response bodies
    // - Timing de cada request

    // Útil para debuggear:
    // - API calls que fallan
    // - Requests lentos
    // - Datos incorrectos del backend
  })
})

/**
 * 🔍 Cómo usar este ejemplo:
 *
 * 1. Ejecutar test:
 *    npm run test:e2e e2e/example-with-trace.spec.ts
 *
 * 2. Ver el trace:
 *    npm run test:e2e:trace
 *    (o especifica el path completo del trace.zip)
 *
 * 3. Explorar en Trace Viewer:
 *    - Timeline: Ver secuencia de acciones
 *    - Screenshots: Hover sobre acciones
 *    - Network: Ver todas las requests
 *    - Console: Ver logs y errores
 *    - Source: Ver código ejecutado
 *    - Video: Ver sesión completa
 *
 * 4. Para debugging:
 *    - Si un test falla, abre su trace
 *    - Ve exactamente qué pasó antes del error
 *    - Inspecciona DOM, network, console
 *    - No más "funciona en mi máquina" 🎯
 */
