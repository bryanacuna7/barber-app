# 🎯 Playwright Trace Profiles

Diferentes configuraciones según el caso de uso.

## 📋 Configuración actual

**Profile:** `retain-on-failure` (Smart Recording)

```typescript
trace: 'retain-on-failure',
screenshot: 'only-on-failure',
video: 'retain-on-failure',
```

### ¿Qué hace?

- ✅ **Graba TODO** mientras ejecuta el test
- ✅ **Solo guarda archivos** si el test falla
- ✅ **Elimina automáticamente** traces de tests exitosos
- 🎯 **Perfecto para:** Desarrollo diario

### Ventajas:

- No llenas el disco con traces de tests que pasaron
- Cuando un test falla, tienes TODA la información
- Balance perfecto entre performance y debugging

---

## 🔀 Otros perfiles disponibles

### 1. **Full Recording** (Debug intensivo)

```typescript
trace: 'on',
screenshot: 'on',
video: 'on',
```

**Cuándo usar:**

- Debugging de problema específico
- Documentar flujo completo
- Crear demos/tutoriales
- Analizar performance step-by-step

**Desventaja:** Genera muchos archivos (~2-5 MB por test)

---

### 2. **On-First-Retry** (CI/CD optimizado)

```typescript
trace: 'on-first-retry',
screenshot: 'only-on-failure',
video: 'retain-on-failure',
```

**Cuándo usar:**

- CI/CD pipelines
- Tests flaky que se reintentan
- Ambientes de staging

**Ventaja:** Solo graba cuando hay reintento, ahorra recursos

---

### 3. **Minimal** (Performance máximo)

```typescript
trace: 'off',
screenshot: 'only-on-failure',
video: 'off',
```

**Cuándo usar:**

- Performance testing
- Tests muy rápidos (< 1s)
- Producción (smoke tests)

**Desventaja:** Sin trace = harder debugging

---

## 🚀 Cómo cambiar de profile

### Opción 1: Editar playwright.config.ts

```typescript
// En playwright.config.ts línea 30-32
use: {
  trace: 'retain-on-failure', // Cambiar aquí
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

### Opción 2: Override por línea de comandos

```bash
# Full recording para este run
TRACE=on npm run test:e2e

# Sin traces para este run
TRACE=off npm run test:e2e
```

### Opción 3: Override en test específico

```typescript
// En tu test
test.use({
  trace: 'on', // Solo este test graba siempre
})

test('critical flow', async ({ page }) => {
  // Este test siempre genera trace completo
})
```

---

## 📊 Comparación rápida

| Profile             | Graba       | Guarda         | Espacio usado | Caso de uso                  |
| ------------------- | ----------- | -------------- | ------------- | ---------------------------- |
| `on`                | ✅ Siempre  | ✅ Siempre     | 🔴 Alto       | Debug intensivo              |
| `retain-on-failure` | ✅ Siempre  | ⚠️ Solo fallos | 🟢 Bajo       | **Desarrollo** (recomendado) |
| `on-first-retry`    | ⚠️ En retry | ⚠️ Solo retry  | 🟡 Medio      | CI/CD                        |
| `off`               | ❌ Nunca    | ❌ Nunca       | 🟢 Mínimo     | Performance tests            |

---

## 💡 Recomendaciones por entorno

### Local Development

```typescript
trace: 'retain-on-failure',  // ← Current (perfecto!)
```

**Por qué:** No llenas tu disco, pero tienes traces cuando los necesitas.

### CI/CD

```typescript
trace: 'on-first-retry',
```

**Por qué:** Ahorra recursos, solo graba cuando tests son flaky.

### Staging

```typescript
trace: 'retain-on-failure',
```

**Por qué:** Mismo que dev, quieres evidencia de fallos.

### Production Smoke Tests

```typescript
trace: 'off',
```

**Por qué:** Performance crítico, logs suficientes.

---

## 🎬 Forzar trace en test específico

Si tienes un test crítico que SIEMPRE quieres ver:

```typescript
import { test } from '@playwright/test'

test.describe('Critical checkout flow', () => {
  // Force full tracing for this suite
  test.use({
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  })

  test('complete purchase', async ({ page }) => {
    // Este test SIEMPRE genera trace completo
    // incluso si pasa
  })
})
```

---

## 🔥 Pro Tips

### Ver cuánto espacio usan los traces

```bash
du -sh test-results/
```

### Limpiar traces viejos

```bash
# Todo
rm -rf test-results/

# Solo traces (mantener reports)
find test-results -name "trace.zip" -delete
```

### Auto-cleanup de traces viejos (7+ días)

```bash
# Agregar a .git/hooks/pre-commit
find test-results -name "trace.zip" -mtime +7 -delete
```

---

**Configuración actual: `retain-on-failure` ✅**

Este es el sweet spot para desarrollo. Si necesitas cambiar temporalmente:

```bash
# Full recording para debugging específico
TRACE=on npm run test:e2e

# Luego volver a normal
npm run test:e2e
```
