# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** BarberShop Pro
- **Stack:** Next.js 16, React 19, Supabase, Tailwind CSS 4, Framer Motion
- **Last Updated:** 2026-01-27 18:45
- **Last Commit:** Fase 1 de Personalización de Marca completada

---

## What's Built

### Completed Features
- [x] Autenticación completa (login, register, logout)
- [x] Dashboard con stats animados y gradientes
- [x] Página de Citas (`/citas`) - calendario, filtros, 3 vistas
- [x] Página de Servicios (`/servicios`) - sin stats inútiles, animaciones
- [x] Página de Clientes (`/clientes`) - lista, búsqueda, agregar
- [x] Página de Barberos (`/barberos`) - CRUD simplificado
- [x] Página de Configuración (`/configuracion`) - iOS time picker wheel
- [x] Página Pública de Reservas (`/reservar/[slug]`) - flujo de 3-4 pasos
- [x] **Apple Design System** con framer-motion
- [x] **iOS Time Picker Wheel** component
- [x] **iOS Toggle Switch** component
- [x] **Motion Components** reutilizables
- [x] **FASE 1: Personalización de Marca Completa**
  - [x] Migración DB con columnas branding (brand_primary_color, brand_secondary_color, logo_url)
  - [x] Bucket 'logos' en Supabase Storage con RLS policies
  - [x] Color Picker component con 16 presets + custom hex
  - [x] API para subir/eliminar logos (POST/DELETE /api/business/logo)
  - [x] ThemeProvider que aplica CSS variables al :root dinámicamente
  - [x] UI de configuración con sección "Personaliza tu Marca"
  - [x] Dashboard aplica branding del negocio
  - [x] Booking page aplica branding del negocio
  - [x] PWA manifest dinámico con theme_color del negocio

### In Progress
- [ ] **FASE 2: Panel de Super Admin** (próximo)
- [ ] **FASE 3: Sistema de Suscripción** (después de Fase 2)

### Key Files (Últimos cambios)
| File | Purpose |
|------|---------|
| `supabase/migrations/003_branding.sql` | Columnas de branding en businesses table |
| `src/lib/theme.ts` | Sistema de temas con CSS variables |
| `src/components/ui/color-picker.tsx` | Selector de color con 16 presets |
| `src/components/theme-provider.tsx` | Aplica CSS variables al :root (client component) |
| `src/app/api/business/logo/route.ts` | API para subir/eliminar logos |
| `src/app/api/public/[slug]/manifest/route.ts` | Manifest.json dinámico para PWA |
| `src/app/(dashboard)/layout.tsx` | Usa ThemeProvider para aplicar branding |
| `src/app/(public)/reservar/[slug]/page.tsx` | Aplica branding con useEffect |
| `public/sw.js` | Service Worker mínimo para PWA |
| `public/icon-192.png`, `public/icon-512.png` | Iconos PWA genéricos |

---

## Current State

### Working
- ✅ Build compila sin errores
- ✅ Server/Client component boundary correcta
- ✅ Migración 003_branding.sql aplicada en Supabase
- ✅ Bucket 'logos' creado con políticas RLS públicas/authenticated
- ✅ Color picker con 16 presets estética barbería (dorados, negros, azules, etc.)
- ✅ Vista previa en vivo de color seleccionado
- ✅ Upload de logos con validación (2MB, PNG/JPG/WebP/SVG)
- ✅ ThemeProvider aplica CSS variables correctamente al :root
- ✅ Dashboard carga brand_primary_color desde DB y aplica tema
- ✅ Booking page (/reservar/demo) muestra branding dorado (#C4953A)
- ✅ PWA manifest dinámico con theme_color personalizado
- ✅ Service Worker registrado correctamente

### Verified with Playwright
- ✅ `/configuracion` - Color picker funciona, guarda en DB correctamente
- ✅ `/dashboard` - CSS variables --brand-primary = #C4953A (dorado)
- ✅ `/reservar/demo` - Ícono con círculo dorado, step indicator dorado

### Score UX/UI
- **Antes:** 4.1/10
- **Ahora:** ~7.8/10 (mobile mejorado)
- **Meta:** 8.5+ (nivel Awwwards)

---

## Next Session

### Continue With (Plan Original)
1. **FASE 2: Panel de Super Admin** (ver plan en `.claude/plans/curried-snuggling-pike.md`)
   - Tabla admin_users en DB
   - Rutas /admin protegidas
   - Dashboard admin con stats globales
   - Lista de todos los negocios
   - Activar/desactivar negocios

### Commands to Run
```bash
npm run dev  # Already running
```

### Context Notes
- **IMPORTANTE:** Dashboard es Server Component, usa ThemeProvider (Client) para aplicar CSS al :root
- **IMPORTANTE:** Booking page también usa useEffect para aplicar CSS variables al :root
- Bucket 'logos' en Supabase Storage está público para lectura, autenticado para escritura
- Para verificar UI: usar Playwright con `mcp__playwright__` tools
- Migración aplicada: `003_branding.sql` con columnas brand_primary_color, brand_secondary_color, logo_url

---

## Session History

### 2026-01-27 - Session 9 (FASE 1: Personalización Completa) ✅ READY TO COMMIT
- Aplicada migración 003_branding.sql manualmente en Supabase Dashboard
- Creado bucket 'logos' en Supabase Storage con políticas RLS
- Creado ColorPicker component con 16 presets + custom hex
- Creado ThemeProvider component (client) que aplica CSS al :root
- Creada API /api/business/logo (POST/DELETE) para upload/eliminar logos
- Actualizado layout dashboard para usar ThemeProvider
- Actualizado booking page para aplicar branding con useEffect
- Creado manifest.json dinámico en /api/public/[slug]/manifest
- Registrado service worker en booking page
- Verificado con Playwright: dorado (#C4953A) aplicado correctamente
- **Archivos nuevos:** theme-provider.tsx, color-picker.tsx, api/business/logo/route.ts, api/public/[slug]/manifest/route.ts, sw.js, icon-192.png, icon-512.png
- **Archivos modificados:** layout.tsx (dashboard), page.tsx (booking), configuracion/page.tsx, business/route.ts, public/[slug]/route.ts

### 2026-01-24 - Session 8 (Mobile UX Improvements) ✅ COMMITTED
- Rediseño completo de stat cards en Citas y Clientes
- iOS-style horizontal scroll pills para métricas
- Fix de iconos sobreponiéndose al texto (absolute → flex layout)
- Mejora de contraste en dark mode (Card component)
- Filtros de citas más compactos con color dots
- View toggle como botones de íconos
- `formatCurrency` muestra montos completos (₡150,000) como solicitado
- Commit: `4dd2029` (31 files, +3154/-977 lines)

### 2026-01-24 - Session 7 (Auditoría UX/UI Apple Design)
- Auditoría brutal cuestionando TODA la UI
- Creado sistema de diseño Apple-style (`design-system.ts`)
- Nuevo: iOS Time Picker Wheel, iOS Toggle, Motion components
- Rediseño: Servicios (sin stats), Configuración (iOS picker), Dashboard (gradients)
- Fix crítico: Server/Client boundary con iconos Lucide → DashboardStats wrapper
- Score UX mejoró de 4.1 a ~7.3

---

## Plan File
Archivo del plan actual: `/Users/bryanacuna/.claude/plans/curried-snuggling-pike.md`
