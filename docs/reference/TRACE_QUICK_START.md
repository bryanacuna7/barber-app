# 🚀 Trace Viewer - Quick Start

## 3 pasos para empezar

### 1️⃣ Ejecutar un test

```bash
npm run test:e2e
```

Esto genera automáticamente:

- ✅ `trace.zip` - Timeline completo de acciones
- ✅ `video.webm` - Video de la sesión
- ✅ Screenshots en cada paso

### 2️⃣ Abrir el Trace Viewer

```bash
npm run test:e2e:trace
```

Abre automáticamente el trace más reciente en tu navegador.

### 3️⃣ Explorar

**Interfaz del Trace Viewer:**

```
┌─────────────────────────────────────────────┐
│ Timeline     ← Click en acción              │
├─────────────────────────────────────────────┤
│ [Screenshot] [Source] [Network] [Console]   │
│                                             │
│ • Hover → quick preview                     │
│ • Click → ver detalles                      │
│ • ←→ → navegar acciones                    │
└─────────────────────────────────────────────┘
```

## 📋 Comandos útiles

```bash
# Ejecutar todos los tests
npm run test:e2e

# Ejecutar test específico
npm run test:e2e e2e/mi-dia.spec.ts

# Ver trace más reciente
npm run test:e2e:trace

# Ver trace específico
npx playwright show-trace test-results/chromium-[nombre]/trace.zip

# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ejecutar con browser visible
npm run test:e2e:headed

# Modo debug (breakpoints)
npm run test:e2e:debug
```

## 🎯 Casos de uso

### Bug que no puedes reproducir

```bash
# 1. Ejecutar test varias veces
npm run test:e2e

# 2. Cuando falle, ver el trace
npm run test:e2e:trace

# 3. Inspeccionar:
#    - Network tab → API calls fallaron?
#    - Console tab → JS errors?
#    - Screenshot → UI issue?
```

### Compartir evidencia de bug

```bash
# 1. Ejecutar test que reproduce el bug
npm run test:e2e

# 2. Compartir el trace.zip
#    Ubicación: test-results/chromium-[nombre]/trace.zip
#
# Otra persona puede abrirlo:
npx playwright show-trace trace.zip
```

### Documentar flujo de usuario

```bash
# 1. Escribir test del flujo
# 2. Ejecutar y generar trace
npm run test:e2e

# 3. El trace sirve como documentación visual
#    - Screenshots de cada paso
#    - Timeline de acciones
#    - Video completo
```

## 🔥 Tips

### Ver todos los traces disponibles

```bash
ls -lh test-results/*/trace.zip
```

### Limpiar traces antiguos

```bash
rm -rf test-results/
```

### Ver trace mientras debuggeas

```bash
# Terminal 1: Ejecutar test
npm run test:e2e:headed

# Terminal 2: Cuando termine, ver trace
npm run test:e2e:trace
```

### Buscar errores rápido

1. Abre trace
2. Ve a tab "Console"
3. Filtra por "error" o "warn"
4. Click en el error → te lleva al momento exacto

## ⚙️ Configuración

Ubicación: `playwright.config.ts`

```typescript
use: {
  trace: 'on',         // Siempre graba
  screenshot: 'on',    // Screenshot cada acción
  video: 'on',         // Video completo
}
```

**Cambiar para CI/CD:**

```typescript
trace: 'retain-on-failure',  // Solo guarda si falla
```

## 📚 Más info

Ver [PLAYWRIGHT_TRACE_GUIDE.md](./PLAYWRIGHT_TRACE_GUIDE.md) para guía completa.

---

**Listo para probar? 🚀**

```bash
# 1. Ejecutar test de ejemplo
npm run test:e2e e2e/example-with-trace.spec.ts

# 2. Ver el trace
npm run test:e2e:trace
```
