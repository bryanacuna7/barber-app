# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** BarberShop Pro
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS v4, Framer Motion
- **Last Updated:** 2026-01-27 (Session 11)
- **Last Commit:** `d2bc3b8` feat(branding): apply brand colors to Servicios and Barberos pages

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
  - [x] Color Picker component con **9 colores premium** + custom hex
  - [x] Color **"Default"** monocromático (#27272A) como fallback premium
  - [x] Auto-refresh UI después de guardar cambios de branding
  - [x] Branding aplicado sutilmente en Servicios y Barberos (líneas 2px, iconos)
  - [x] Dashboard stats sin branding (colores fijos info/success)
  - [x] API para subir/eliminar logos (POST/DELETE /api/business/logo)
  - [x] ThemeProvider con WCAG 2.0 contrast calculations
  - [x] UI de configuración con sección "Personaliza tu Marca"
  - [x] PWA manifest dinámico con theme_color del negocio
  - [x] Fix dropdown overflow en appointment cards
  - [x] Mejoras de contraste en dark mode (dropdowns)
  - [x] Responsive color grid (5/6/9 columnas)
- [x] **FASE 2: Panel de Super Admin (MVP Minimalista)** ✅
  - [x] Migración 004_admin.sql con tabla admin_users
  - [x] Middleware protege ruta `/admin` (requiere auth + admin)
  - [x] Utilidad `verifyAdmin()` para verificar permisos
  - [x] Admin layout con sidebar (Dashboard, Negocios)
  - [x] **Stats globales SaaS**: total negocios, activos/inactivos, crecimiento mensual
  - [x] **API routes admin**: `/api/admin/stats`, `/api/admin/businesses`, `/api/admin/businesses/[id]`
  - [x] **Dashboard admin** con métricas de plataforma (perspectiva SaaS, no de barberías)
  - [x] **Lista de negocios** con búsqueda, filtros, stats (barberos, servicios, citas)
  - [x] **Detalle de negocio** con info completa, toggle activar/desactivar
  - [x] Placeholders para MRR, trials, conversión (se calculan en Fase 3)
  - [x] Link "Volver al Dashboard" desde admin panel

### In Progress
- [ ] **FASE 3: Sistema de Suscripción** (próximo)

### Key Files
| File | Purpose |
|------|---------|
| `src/components/ui/color-picker.tsx` | **9 colores premium**, responsive grid (5/6/9 cols) |
| `src/components/theme-provider.tsx` | WCAG 2.0 contrast, CSS variables dinámicas |
| `src/app/(dashboard)/layout.tsx` | **Default color #27272A** (monochrome fallback) |
| `src/app/(dashboard)/servicios/page.tsx` | Branding sutil (línea 2px top, iconos) |
| `src/app/(dashboard)/barberos/page.tsx` | Branding sutil (avatar rings, header) |
| `src/components/appointments/appointment-card.tsx` | **Fixed dropdown overflow** (removed overflow-hidden) |
| `src/components/ui/dropdown.tsx` | Mejorado contraste text (zinc-900 dark mode) |
| `src/components/dashboard/dashboard-stats.tsx` | **Sin branding** (variant="info" fixed) |
| `supabase/migrations/003_branding.sql` | Schema de personalización |
| `scripts/test-all-colors.mjs` | Valida WCAG AA compliance (9 colores) |
| **FASE 2: Admin Panel** | |
| `supabase/migrations/004_admin.sql` | Tabla admin_users, is_active en businesses |
| `src/lib/admin.ts` | `verifyAdmin()`, `isUserAdmin()` utils |
| `src/app/(admin)/layout.tsx` | Layout con auth + admin check, redirect a /dashboard |
| `src/components/admin/admin-sidebar.tsx` | Sidebar con escudo, Dashboard, Negocios |
| `src/app/api/admin/stats/route.ts` | Stats globales SaaS (perspectiva vendedor) |
| `src/app/api/admin/businesses/route.ts` | Lista de negocios con búsqueda/filtros |
| `src/app/api/admin/businesses/[id]/route.ts` | Detalle + PATCH activar/desactivar |
| `src/app/(admin)/admin/page.tsx` | Dashboard admin con métricas plataforma |
| `src/app/(admin)/admin/negocios/page.tsx` | Lista negocios con cards, stats, paginación |
| `src/app/(admin)/admin/negocios/[id]/page.tsx` | Detalle negocio completo con toggle |

---

## Current State

### Working
- ✅ Sistema de branding completo y funcional (Fase 1)
- ✅ **Admin Panel MVP** completo y funcional (Fase 2)
- ✅ Stats SaaS desde perspectiva de vendedor (no de barberías)
- ✅ Gestión de negocios con activar/desactivar
- ✅ Búsqueda y filtros en lista de negocios
- ✅ Detalle completo de cada negocio (barberos, servicios, clientes, citas)
- ✅ Protección de rutas admin (solo bryn.acuna7@gmail.com)
- ✅ Color picker responsive (5/6/9 columnas según pantalla)
- ✅ Excelente contraste en light/dark mode (WCAG AA)

### Recent Changes (Session 11)
- ✅ Creada tabla `admin_users` en Supabase
- ✅ Agregada columna `is_active` a businesses
- ✅ Implementado Admin Panel completo en `/admin`
- ✅ API routes admin: stats, businesses, businesses/[id]
- ✅ Dashboard admin con métricas SaaS (total, activos, inactivos, crecimiento)
- ✅ Lista de negocios con cards, stats, búsqueda, filtros
- ✅ Detalle de negocio con toggle activar/desactivar
- ✅ Placeholders para suscripciones (MRR, trials, conversión) - Fase 3

---

## Next Session

### Continue With
1. **Phase 3: Sistema de Suscripción** (próximo)
   - Migración con tablas `subscription_plans` y `business_subscriptions`
   - Trial de 7 días con features Pro
   - 2 planes: Básico ($9.99) y Pro ($24.99)
   - Feature gating (max barberos, servicios, branding)
   - Trial banner en dashboard
   - Página de precios (`/precios`)
   - Gestión de suscripciones en admin panel
2. **Refinamientos adicionales del Admin Panel** (si hay feedback)
3. **Testing del sistema completo** en diferentes dispositivos

### Commands to Run
```bash
npm run dev
# Acceder a http://localhost:3000/admin (requiere bryn.acuna7@gmail.com)
```

### Context Notes
- **Admin Panel:** Solo accesible por `bryn.acuna7@gmail.com`
- **Stats SaaS:** Perspectiva de vendedor (total negocios, activos, crecimiento, MRR)
- **Placeholders:** MRR, trials activos, conversión, churn - se calculan en Fase 3
- **Admin DB:** Tabla `admin_users` con política RLS para verificar admin status
- **API Admin:** Usa `createServiceClient()` con `verifyAdmin()` previo
- **Activar/Desactivar:** PATCH `/api/admin/businesses/[id]` con `is_active` boolean

---

## Session History

### 2026-01-27 - Session 11: Admin Panel MVP (Fase 2 Completa) ✅
- ✅ Creada migración `004_admin.sql` con tabla `admin_users` e `is_active` en businesses
- ✅ Implementada utilidad `verifyAdmin()` en `src/lib/admin.ts`
- ✅ Protegida ruta `/admin` en middleware (requiere auth + admin)
- ✅ Creado layout admin con sidebar (Dashboard, Negocios)
- ✅ API routes admin: stats, businesses, businesses/[id]
- ✅ **Dashboard admin** con stats SaaS (total, activos, inactivos, crecimiento)
- ✅ **Lista de negocios** con búsqueda, filtros, paginación, stats
- ✅ **Detalle de negocio** con info completa, toggle activar/desactivar
- ✅ Placeholders para suscripciones (MRR, trials, conversión - Fase 3)
- ✅ Verificado con Playwright: dashboard, lista, detalle, toggle funciona
- 🎯 **Scope:** MVP minimalista enfocado en gestión básica de negocios
- 📊 **Stats:** Perspectiva SaaS (vendedor), no de barberías (clientes)

### 2026-01-27 - Session 10: Premium Colors & Subtle Branding ✅
- ✅ Creada paleta premium de **9 colores** con validación WCAG (Default + 8)
- ✅ Agregado color **"Default" monocromático** (#27272A - zinc-800)
- ✅ Aplicado branding sutil en **Servicios y Barberos** (líneas 2px, iconos, avatars)
- ✅ **Fixed dropdown overflow** en appointment cards (removed overflow-hidden)
- ✅ Mejorado contraste de texto en dropdowns (zinc-900 dark mode)
- ✅ **Responsive color grid** (5 mobile / 6 tablet / 9 desktop)
- ✅ Removido branding de dashboard stats (variant="info" fijo)
- 🎨 **Focus:** Premium, minimalista, accesible (WCAG AA), sin color como opción

### 2026-01-27 - Session 9 (FASE 1: Personalización Completa) ✅
- Aplicada migración 003_branding.sql manualmente en Supabase Dashboard
- Creado bucket 'logos' en Supabase Storage con políticas RLS
- Creado ColorPicker component con 16 presets + custom hex
- Creado ThemeProvider component (client) que aplica CSS al :root
- Creada API /api/business/logo (POST/DELETE) para upload/eliminar logos
- Actualizado layout dashboard para usar ThemeProvider
- Actualizado booking page para aplicar branding con useEffect
- Creado manifest.json dinámico en /api/public/[slug]/manifest
- Verificado con Playwright: dorado (#C4953A) aplicado correctamente

### 2026-01-24 - Session 8 (Mobile UX Improvements) ✅
- Rediseño completo de stat cards en Citas y Clientes
- iOS-style horizontal scroll pills para métricas
- Fix de iconos sobreponiéndose al texto (absolute → flex layout)
- Mejora de contraste en dark mode (Card component)
- Commit: `4dd2029` (31 files, +3154/-977 lines)

### 2026-01-24 - Session 7 (Auditoría UX/UI Apple Design)
- Auditoría brutal cuestionando TODA la UI
- Creado sistema de diseño Apple-style (`design-system.ts`)
- Nuevo: iOS Time Picker Wheel, iOS Toggle, Motion components
- Rediseño: Servicios (sin stats), Configuración (iOS picker), Dashboard (gradients)
- Score UX mejoró de 4.1 a ~7.3

---

## Plan File
Archivo del plan actual: `/Users/bryanacuna/.claude/plans/curried-snuggling-pike.md`
