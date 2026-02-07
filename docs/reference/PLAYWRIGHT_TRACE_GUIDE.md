# 🎬 Playwright Trace Viewer Guide

El Trace Viewer de Playwright te permite ver todas las interacciones del navegador como una **grabación visual interactiva**, similar a Antigravity.

## 🚀 Quick Start

### 1. Ejecutar tests (genera traces automáticamente)

```bash
npm run test:e2e
```

Con la configuración actual, **cada test genera automáticamente**:

- ✅ Trace completo de todas las acciones
- ✅ Screenshots en cada paso
- ✅ Video de la sesión completa

### 2. Ver el trace más reciente

```bash
npm run test:e2e:trace
```

O especifica un archivo trace:

```bash
npx playwright show-trace test-results/chromium-[test-name]/trace.zip
```

## 📂 Dónde se guardan los traces

```
test-results/
├── chromium-[test-name]-[timestamp]/
│   ├── trace.zip          ← Trace completo (ESTE es el que abres)
│   ├── video.webm         ← Video de la sesión
│   └── test-failed-1.png  ← Screenshots
```

## 🎯 Qué puedes ver en Trace Viewer

### 1. **Timeline de acciones**

- Cada click, tipo, navegación
- Tiempo exacto de cada acción
- Duración de cada operación

### 2. **Screenshots automáticos**

- Antes y después de cada acción
- Hover sobre timeline para ver screenshot

### 3. **Network requests**

- Todas las llamadas HTTP
- Status codes, headers, payload
- Timing de cada request

### 4. **Console logs**

- console.log, warn, error del navegador
- Errores de JavaScript

### 5. **DOM Snapshots**

- Estado del DOM en cada paso
- Inspect elements en cualquier punto

### 6. **Video playback**

- Ver la sesión completa como video
- Sincronizado con las acciones

## 🔧 Configuración actual (playwright.config.ts)

```typescript
use: {
  trace: 'on',         // Graba SIEMPRE (no solo en fallos)
  screenshot: 'on',    // Screenshot en cada acción
  video: 'on',         // Video completo de la sesión
}
```

### Opciones de configuración:

| Opción                | Descripción          | Uso recomendado                     |
| --------------------- | -------------------- | ----------------------------------- |
| `'on'`                | Siempre graba        | **Desarrollo** (máxima visibilidad) |
| `'retain-on-failure'` | Solo guarda si falla | **CI/CD** (ahorra espacio)          |
| `'on-first-retry'`    | Solo en reintentos   | **CI/CD** (balance)                 |
| `'off'`               | Nunca graba          | **Producción** (performance)        |

## 💡 Casos de uso

### Debugging de test que falla

```bash
# 1. Ejecutar el test que falla
npm run test:e2e

# 2. Abrir el trace
npm run test:e2e:trace test-results/chromium-[nombre-del-test]/trace.zip

# 3. En Trace Viewer:
#    - Ver exactamente qué pasó antes del error
#    - Inspeccionar el DOM en el momento del fallo
#    - Ver network requests que pudieron causar el problema
```

### Ver cómo funciona una feature visualmente

```bash
# 1. Escribir test para la feature
# 2. Ejecutar test
npm run test:e2e

# 3. Abrir trace para ver la interacción completa
npm run test:e2e:trace
```

### Reportar bug con evidencia visual

```bash
# 1. Reproducir bug en test
# 2. Compartir trace.zip
#    - Contiene TODO: screenshots, video, network, DOM
#    - Otra persona puede ver exactamente lo que pasó
```

## 🎮 Interfaz de Trace Viewer

```
┌─────────────────────────────────────────────────────────┐
│  [Timeline] ← Cada acción del test                      │
├─────────────────────────────────────────────────────────┤
│  [Screenshot] │ [Source] │ [Network] │ [Console] │ [Video]│
│                                                          │
│  Click en timeline → ve screenshot de ese momento        │
│  Hover timeline → quick preview                          │
│  Play video → ver sesión completa                        │
└─────────────────────────────────────────────────────────┘
```

## 🔥 Tips Pro

### 1. Navegación rápida

- `←→` : Siguiente/anterior acción
- `Space` : Play/pause video
- Click en action → jump to that moment

### 2. Buscar problemas

- Tab "Network" → filtrar por status code (500, 404)
- Tab "Console" → buscar errores rojos
- Tab "Source" → ver código ejecutado

### 3. Compartir traces

Los archivos `trace.zip` son portables:

```bash
# Enviar a alguien
zip -r mi-bug.zip test-results/chromium-checkout-failure/

# Otra persona abre:
npx playwright show-trace mi-bug.zip
```

## 📊 Performance considerations

**Traces ocupan espacio:**

- Trace completo: ~2-5 MB por test
- Video: ~1-3 MB por test
- Screenshots: ~100-500 KB por test

**Recomendaciones:**

```typescript
// Desarrollo local
trace: 'on' // Ver todo

// CI/CD
trace: 'retain-on-failure' // Solo fallos
video: 'retain-on-failure'

// Producción
trace: 'off' // Sin overhead
```

## 🆚 Trace Viewer vs Modo Debug

| Feature         | Trace Viewer      | Debug Mode (`--debug`) |
| --------------- | ----------------- | ---------------------- |
| Ver después     | ✅ Sí             | ❌ En tiempo real solo |
| Compartible     | ✅ Sí (trace.zip) | ❌ No                  |
| Breakpoints     | ❌ No             | ✅ Sí                  |
| Timeline visual | ✅ Sí             | ❌ No                  |
| Performance     | ✅ Rápido         | 🐌 Lento (interactivo) |

**Usa Trace Viewer cuando:**

- Quieres ver qué pasó después de ejecutar
- Necesitas compartir evidencia de bug
- Debugging de CI/CD

**Usa Debug Mode cuando:**

- Quieres pausar ejecución
- Necesitas inspeccionar en tiempo real
- Debugging interactivo

## 🎯 Ejemplo práctico

Supongamos que tienes un test que falla intermitentemente:

```typescript
// e2e/checkout.spec.ts
test('checkout flow', async ({ page }) => {
  await page.goto('/products')
  await page.click('button[data-testid="add-to-cart"]')
  await page.click('a[href="/checkout"]')

  // A veces falla aquí ⚠️
  await expect(page.locator('h1')).toContainText('Checkout')
})
```

**Con Trace Viewer puedes:**

1. Ejecutar test 10 veces
2. Cuando falle, abrir el trace
3. Ver network tab → tal vez un API call tardó mucho
4. Ver console → tal vez hay un JS error
5. Ver screenshot → tal vez el botón no era clickeable
6. **Encontrar la causa raíz sin adivinar**

## 📚 Recursos

- [Playwright Trace Viewer Docs](https://playwright.dev/docs/trace-viewer)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Best Practices](https://playwright.dev/docs/ci-intro)

---

**Pro tip:** Agrega este alias a tu shell para acceso rápido:

```bash
# .zshrc o .bashrc
alias pwtrace="npx playwright show-trace"

# Uso:
pwtrace test-results/chromium-*/trace.zip
```
