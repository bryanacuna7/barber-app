# 🔍 UI/UX Exploration & Analysis Guide

Herramientas para explorar, analizar y comparar UI/UX con grabación completa.

## 🎯 Casos de uso

| Escenario               | Comando                                             | Output                  |
| ----------------------- | --------------------------------------------------- | ----------------------- |
| Explorar tu app         | `npm run explore`                                   | Trace + código generado |
| Analizar competencia    | `npm run explore https://competitor.com`            | Trace navegable         |
| Comparar lado a lado    | `npm run explore:competitor https://competitor.com` | 2 traces                |
| Grabar flujo específico | `npm run record:flow "checkout"`                    | Trace + test code       |

---

## 🚀 Comandos

### 1. Explorar tu aplicación

```bash
npm run explore
```

**Qué hace:**

- Abre navegador en localhost:3000
- Graba TODO lo que hagas
- Genera código de test automáticamente
- Guarda trace para revisar después

**Cuándo usar:**

- Revisar nueva feature manualmente
- Documentar flujos de usuario
- Encontrar bugs navegando
- Crear screenshots para docs

---

### 2. Explorar sitio externo (competencia)

```bash
npm run explore https://competidor.com
```

**Qué hace:**

- Abre navegador en la URL especificada
- Graba toda tu navegación
- Captura network requests
- Permite analizar después

**Cuándo usar:**

- Research de competencia
- Analizar features de otros productos
- Benchmark de UX/UI
- Estudiar flujos de usuario

**Ejemplo:**

```bash
# Analizar checkout de competencia
npm run explore https://competitor.com/pricing

# Después, revisar el trace:
npx playwright show-trace explorations/[timestamp]/trace.zip
```

---

### 3. Comparación lado a lado

```bash
npm run explore:competitor https://competitor.com
npm run explore:competitor https://competitor.com /pricing
```

**Qué hace:**

- Abre 2 navegadores simultáneamente
- Izquierda: TU APP
- Derecha: COMPETENCIA
- Graba ambas sesiones por separado

**Cuándo usar:**

- Comparar features directamente
- Benchmark de performance
- Analizar diferencias en UX
- Validar que tu feature es mejor

**Workflow:**

```bash
# 1. Abrir ambos navegadores
npm run explore:competitor https://competitor.com

# 2. Hacer las mismas acciones en ambos
#    - Buscar producto
#    - Agregar al carrito
#    - Ir a checkout
#    - etc.

# 3. Cerrar navegadores

# 4. Comparar traces
npx playwright show-trace explorations/comparison_[timestamp]/yours-trace.zip
npx playwright show-trace explorations/comparison_[timestamp]/competitor-trace.zip
```

---

### 4. Grabar flujo específico

```bash
npm run record:flow "checkout-flow"
npm run record:flow "onboarding" https://staging.myapp.com
```

**Qué hace:**

- Graba un flujo de usuario completo
- Genera código de test automáticamente
- Organiza por nombre de flujo
- Guarda como referencia

**Cuándo usar:**

- Documentar happy path
- Crear test automático después
- Onboarding de nuevos devs
- Specs visuales para product team

**Output:**

```
explorations/flows/
├── checkout-flow_20260203_143022/
│   ├── trace.zip
│   └── generated-test.js (en clipboard)
├── onboarding_20260203_144531/
│   └── trace.zip
└── user-registration_20260203_150122/
    └── trace.zip
```

---

## 🎬 Qué se graba

En TODOS los comandos, se captura:

```
✅ Timeline completo de acciones
   - Clicks
   - Typing
   - Navegación
   - Scrolling

✅ Screenshots automáticos
   - Antes/después de cada acción

✅ Network requests
   - API calls
   - Tiempos de respuesta
   - Payloads

✅ Console logs
   - Errores JavaScript
   - Warnings
   - Logs de debug

✅ DOM snapshots
   - Estado de la página en cada momento

✅ Video (si configurado)
   - Grabación completa de la sesión
```

---

## 📊 Analizar después

### Ver trace

```bash
# Último exploration
ls explorations/ -lt | head -5

# Abrir trace
npx playwright show-trace explorations/[timestamp]/trace.zip
```

### En Trace Viewer puedes:

**1. Timeline**

- Ver cada acción en orden cronológico
- Hover para preview rápido
- Click para detalles completos

**2. Network Tab**

- Filtrar por tipo (XHR, Fetch, etc)
- Ver payloads completos
- Analizar tiempos de respuesta
- **Útil para:** Comparar performance vs competencia

**3. Console Tab**

- Ver errores JavaScript
- Warnings
- **Útil para:** Detectar problemas técnicos en competencia

**4. Screenshots**

- Ver estado visual en cada paso
- **Útil para:** Documentación, comparación de UI

**5. Source Tab**

- Ver código ejecutado
- **Útil para:** Reverse engineering (legal)

---

## 💡 Workflows recomendados

### Competitive Analysis

```bash
# 1. Explorar competencia
npm run explore https://competitor.com

# 2. Navegar:
#    - Homepage → features → pricing → checkout
#    - Tomar nota mental de diferencias

# 3. Cerrar navegador (guarda trace)

# 4. Explorar tu app
npm run explore

# 5. Hacer el MISMO flujo

# 6. Comparar traces
#    Abrir ambos traces en tabs diferentes
#    Comparar side-by-side:
#    - Número de pasos
#    - Tiempos de carga
#    - Claridad de UX

# 7. Documentar findings
#    Crear: docs/analysis/competitor-comparison.md
```

### Feature Development Validation

```bash
# 1. Antes de implementar feature:
npm run record:flow "checkout-current"

# 2. Implementar nueva feature

# 3. Después de implementar:
npm run record:flow "checkout-new"

# 4. Comparar:
#    - ¿Menos pasos?
#    - ¿Más rápido?
#    - ¿Más claro para usuario?
```

### Bug Documentation

```bash
# 1. Reproducir bug manualmente
npm run record:flow "bug-checkout-crash"

# 2. Navegar hasta que reproduzcas el bug

# 3. El trace muestra:
#    - Pasos exactos para reproducir
#    - Console errors
#    - Network failures
#    - Estado del DOM cuando falló

# 4. Compartir trace.zip con el equipo
#    No más "no puedo reproducirlo" 🎯
```

### Onboarding Docs

```bash
# Grabar cada flujo crítico:
npm run record:flow "user-registration"
npm run record:flow "first-booking"
npm run record:flow "payment-setup"
npm run record:flow "admin-dashboard"

# Organizar:
mv explorations/flows/* docs/flows/

# Nuevos devs pueden:
# 1. Ver traces para entender flujos
# 2. Usar código generado como starting point
```

---

## 🎨 Análisis de UI/UX

### Checklist de comparación

Cuando explores competencia, fijate en:

```
□ First Impression
  □ Tiempo de carga inicial
  □ Visual hierarchy
  □ Call-to-actions claros

□ Navigation
  □ Cuántos clicks al objetivo
  □ Breadcrumbs / back buttons
  □ Search functionality

□ Forms
  □ Validación inline
  □ Mensajes de error claros
  □ Autofill support

□ Performance
  □ Lazy loading
  □ Optimistic updates
  □ Loading states

□ Accessibility
  □ Keyboard navigation
  □ Color contrast
  □ Screen reader friendly

□ Mobile responsiveness
  □ Touch targets
  □ Scrolling suave
  □ Gestures
```

### Documentar findings

Template para análisis de competencia:

```markdown
# Competitor Analysis: [Name]

**Date:** 2026-02-03
**URL:** https://competitor.com
**Trace:** explorations/[timestamp]/trace.zip

## Summary

[2-3 líneas de impresión general]

## Strengths

- Feature X es muy intuitivo
- Performance excelente (2s load)
- Checkout en solo 3 pasos

## Weaknesses

- Error messages poco claros
- No hay validación inline
- Mobile UX confusa

## Ideas to steal (legally!)

1. **One-click checkout**
   - Implementation: [notas]
   - Effort: Medium
   - Impact: High

2. **Inline search results**
   - Implementation: [notas]
   - Effort: Low
   - Impact: Medium

## Network Analysis

- API calls: 15 requests
- Total load time: 3.2s
- Largest payload: 800KB (images)

## Screenshots

![Checkout flow](path/to/screenshot.png)

## Trace

`npx playwright show-trace explorations/[timestamp]/trace.zip`
```

---

## 🔒 Consideraciones legales

### ✅ Permitido

- Analizar UI/UX pública
- Comparar features
- Benchmark de performance
- Inspiración de diseño

### ❌ NO permitido

- Copiar código exacto
- Scraping de datos privados
- Reverse engineering de algoritmos
- Violar términos de servicio

**Regla de oro:** Solo analiza lo que cualquier usuario normal vería.

---

## 📁 Estructura de archivos

```
explorations/
├── 20260203_143022/          # Exploration timestamp
│   ├── trace.zip
│   └── screenshots/
├── 20260203_150134/
│   └── trace.zip
├── comparison_20260203_151200/
│   ├── yours-trace.zip
│   └── competitor-trace.zip
└── flows/
    ├── checkout-flow_20260203_143022/
    ├── onboarding_20260203_144531/
    └── user-registration_20260203_150122/
```

**Limpieza:**

```bash
# Limpiar explorations viejas (30+ días)
find explorations -type d -mtime +30 -exec rm -rf {} \;

# Mantener solo flows importantes
mv explorations/flows/checkout-flow_* docs/flows/checkout-baseline
```

---

## 🔥 Pro Tips

### 1. Usa device emulation

```bash
# Mobile view
npx playwright codegen https://competitor.com --device="iPhone 13"

# Tablet
npx playwright codegen https://competitor.com --device="iPad Pro"
```

### 2. Test dark mode

```bash
npx playwright codegen https://competitor.com --color-scheme=dark
```

### 3. Simula slow network

```bash
# En el trace viewer:
# Network tab → Throttling → Slow 3G
# Para ver cómo se comporta la competencia en mal internet
```

### 4. Exportar código generado

El navegador tiene un panel "Playwright Inspector":

- Copy el código generado
- Pegarlo en un test
- Modificar para tus necesidades

```typescript
// Código generado automáticamente:
test('checkout flow', async ({ page }) => {
  await page.goto('https://competitor.com')
  await page.click('button:has-text("Add to cart")')
  await page.click('a[href="/checkout"]')
  // ... etc
})

// Modificar para tu app:
test('our checkout flow', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.click('button[data-testid="add-to-cart"]')
  await page.click('a[href="/checkout"]')
  // Debe ser más simple que competencia! 🎯
})
```

---

## 📚 Recursos

- Ver trace: `npm run test:e2e:trace`
- Playwright docs: https://playwright.dev/docs/codegen
- Trace Viewer: [PLAYWRIGHT_TRACE_GUIDE.md](./PLAYWRIGHT_TRACE_GUIDE.md)

---

**Ready to explore? 🚀**

```bash
# Explorar tu app
npm run explore

# Analizar competencia
npm run explore https://competitor.com

# Comparar lado a lado
npm run explore:competitor https://competitor.com
```
