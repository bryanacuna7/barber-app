# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** BarberShop Pro
- **Stack:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS v4, Framer Motion, Recharts, Resend
- **Last Updated:** 2026-01-28 (Session 16)
- **Last Commit:** Phase 2.1 - Onboarding Wizard Complete

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
- [x] **FASE 3: Sistema de Suscripción (MVP Costa Rica)** ✅
  - [x] Migración `005_subscriptions.sql` con tablas: `subscription_plans`, `business_subscriptions`, `payment_reports`
  - [x] 2 planes: Básico ($12/mes) y Pro ($29/mes)
  - [x] **Límites Básico:** max 2 barberos, 3 servicios, 25 clientes, sin branding
  - [x] **Pro:** todo ilimitado + branding completo
  - [x] Trial de 7 días con features Pro (trigger automático al crear negocio)
  - [x] Auto-degradación a Básico cuando expira trial
  - [x] Feature gating en APIs de barberos, servicios, clientes
  - [x] `src/lib/subscription.ts` con funciones de validación de límites
  - [x] Trial banner en dashboard (muestra días restantes, estado de plan)
  - [x] Página `/suscripcion` para usuarios (ver plan, límites, reportar pago)
  - [x] **Pagos SINPE Móvil:** reportar pago con comprobante o WhatsApp
  - [x] Admin panel `/admin/pagos` para aprobar/rechazar pagos
  - [x] Métricas reales en admin dashboard (MRR, trials activos, conversión)
  - [x] Página pública `/precios` con comparativa de planes y FAQ
  - [x] Bucket `payment-proofs` para comprobantes (pendiente crear en Supabase)
- [x] **FASE 4: Sistema de Notificaciones y UX** ✅
  - [x] Migración `006_notifications.sql` con tabla notificaciones y triggers
  - [x] Triggers automáticos: nueva cita, pago aprobado/rechazado, nuevo negocio
  - [x] `src/lib/notifications.ts` con funciones CRUD y helpers
  - [x] Notification Bell component con dropdown y badge de unread
  - [x] API `/api/notifications` (GET, PATCH) y `/api/notifications/[id]` (PATCH)
  - [x] Mobile Header con notification bell para dispositivos móviles
  - [x] Quick Action "Reportar Pago" en dashboard (condicional por urgencia)
  - [x] Trial Banner con posicionamiento condicional (urgente arriba, normal compacto)
  - [x] Auto-downgrade para pagos vencidos (3 días grace period)
  - [x] API `/api/subscription/change-plan` para upgrade/downgrade
- [x] **PHASE 2: Core Features & UX (Inicio)** 🚧
  - [x] **2.1 Onboarding Wizard** ✅
    - [x] Migración `012_onboarding.sql` con tabla business_onboarding
    - [x] API `/api/onboarding` (GET/PATCH) para tracking de progreso
    - [x] 6 pasos completos: Welcome, Hours, Service, Barber, Branding, Success
    - [x] Progress Bar component animado con indicadores de paso
    - [x] iOS Time Picker integration para horarios
    - [x] Color Picker y logo upload en paso de branding (opcional/skippable)
    - [x] Confetti celebration en paso final con canvas-confetti
    - [x] Auto-save de datos: horarios, primer servicio, primer barbero, branding
    - [x] Layout redirect logic: negocios sin onboarding → /onboarding
    - [x] Middleware x-pathname header para detección de ruta
    - [x] Avatar component creado (fix para analytics)
    - [x] Recharts package instalado (analytics dependency)
- [x] **PLAN DE EVOLUCIÓN: Phase 1 - Foundation & Quick Wins** ✅
  - [x] **1.1 Email Notifications + Preferencias**
    - [x] Migración `009_notification_preferences.sql`
    - [x] Integración con Resend (3,000 emails/mes gratis)
    - [x] Templates React Email: trial-expiring, payment-approved, new-appointment
    - [x] Sistema dual notificaciones (email/app/both)
    - [x] UI preferencias en `/configuracion`
    - [x] API `/api/notifications/send` y `/api/notifications/preferences`
  - [x] **1.2 Storage Retention Strategy**
    - [x] Migración `010_storage_retention.sql`
    - [x] Auto-delete comprobantes aprobados (30 días) y rechazados (inmediato)
    - [x] Cron job diario `/api/admin/cleanup-storage`
    - [x] Configuración `vercel.json` para cron
    - [x] Mantiene storage <1GB → $0/año
  - [x] **1.3 Analytics Dashboard**
    - [x] Página `/analiticas` con charts Recharts
    - [x] APIs: overview, revenue-series, services, barbers
    - [x] KPI cards: ingresos, citas, promedio, tasa completación
    - [x] Revenue chart (área), Top servicios (barras), Barbers leaderboard
    - [x] Filtros por período (semana/mes/año)
    - [x] Agregado a sidebar
  - [x] **1.4 Performance Optimizations**
    - [x] Migración `011_performance_indexes.sql` (15+ indexes)
    - [x] Image optimization (AVIF, WebP) en `next.config.ts`
    - [x] Bundle analyzer configurado
    - [x] Indexes para appointments, clients, subscriptions, notifications

### In Progress
- [x] Ejecutar migración 005_subscriptions.sql en Supabase Dashboard
- [x] Ejecutar migración 006_notifications.sql en Supabase Dashboard
- [x] Ejecutar migración 007_exchange_rate.sql en Supabase Dashboard
- [x] Ejecutar migración 008_payment_settings.sql en Supabase Dashboard
- [x] Ejecutar migración 012_onboarding.sql en Supabase Dashboard ✅
- [x] Crear bucket `payment-proofs` en Supabase Storage
- [ ] Implementar Interactive Tour (2.2) - NEXT
- [ ] Rediseñar Landing Page (2.3)
- [ ] Implementar Premium Appearance (2.5)

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
| **FASE 3: Suscripciones** | |
| `supabase/migrations/005_subscriptions.sql` | Tablas planes, suscripciones, pagos + trigger trial |
| `src/lib/subscription.ts` | Feature gating, validación límites, stats |
| `src/components/subscription/trial-banner.tsx` | Banner de trial/plan en dashboard |
| `src/app/(dashboard)/suscripcion/page.tsx` | Página de suscripción del usuario |
| `src/app/api/subscription/status/route.ts` | Estado de suscripción actual |
| `src/app/api/subscription/plans/route.ts` | Lista de planes disponibles |
| `src/app/api/subscription/report-payment/route.ts` | Reportar pago SINPE |
| `src/app/(admin)/admin/pagos/page.tsx` | Admin: gestión de pagos |
| `src/app/api/admin/payments/route.ts` | API admin: lista pagos |
| `src/app/api/admin/payments/[id]/route.ts` | API admin: aprobar/rechazar pago |
| `src/app/precios/page.tsx` | Página pública de precios |
| **FASE 4: Notificaciones** | |
| `supabase/migrations/006_notifications.sql` | Tabla notificaciones + triggers |
| `src/lib/notifications.ts` | CRUD notificaciones, helpers, estilos |
| `src/components/notifications/notification-bell.tsx` | Campana con dropdown |
| `src/components/dashboard/mobile-header.tsx` | Header mobile con notificaciones |
| `src/app/api/notifications/route.ts` | GET/PATCH notificaciones |
| `src/app/api/subscription/change-plan/route.ts` | API para cambiar plan |
| **Session 14: Configuración** | |
| `supabase/migrations/007_exchange_rate.sql` | Tabla system_settings, exchange rate |
| `supabase/migrations/008_payment_settings.sql` | WhatsApp y SINPE settings |
| `src/app/(admin)/admin/configuracion/page.tsx` | Admin: gestión de configuraciones |
| `src/app/api/admin/settings/route.ts` | API admin: GET/POST settings |
| `src/app/api/settings/route.ts` | API pública: GET settings |
| `src/components/notifications/notification-bell.tsx` | Portal-based dropdown (fix overflow) |
| **Session 15: Phase 1 Foundation** | |
| `supabase/migrations/009_notification_preferences.sql` | Tabla notification_preferences, triggers |
| `supabase/migrations/010_storage_retention.sql` | Auto-delete pagos, triggers retention |
| `supabase/migrations/011_performance_indexes.sql` | 15+ indexes para queries críticos |
| `src/lib/email/sender.ts` | Lógica centralizada envío emails Resend |
| `src/lib/email/templates/trial-expiring.tsx` | Template email trial expiring |
| `src/lib/email/templates/payment-approved.tsx` | Template email payment approved |
| `src/lib/email/templates/new-appointment.tsx` | Template email new appointment |
| `src/app/api/notifications/send/route.ts` | API envío inteligente notificaciones |
| `src/app/api/notifications/preferences/route.ts` | API GET/PATCH preferencias |
| `src/app/api/admin/cleanup-storage/route.ts` | Cron job cleanup storage diario |
| `src/app/api/analytics/overview/route.ts` | API KPIs analytics |
| `src/app/api/analytics/revenue-series/route.ts` | API time-series revenue |
| `src/app/api/analytics/services/route.ts` | API top servicios |
| `src/app/api/analytics/barbers/route.ts` | API barber leaderboard |
| `src/app/(dashboard)/analiticas/page.tsx` | Página analytics dashboard |
| `src/components/analytics/revenue-chart.tsx` | Chart revenue (área) |
| `src/components/analytics/services-chart.tsx` | Chart servicios (barras) |
| `src/components/analytics/barbers-leaderboard.tsx` | Leaderboard barberos |
| `src/components/settings/notification-preferences-section.tsx` | UI preferencias notificaciones |
| `vercel.json` | Configuración cron jobs Vercel |
| `.env.example` | Template variables de entorno |
| `PHASE1_IMPLEMENTATION.md` | Guía completa implementación Phase 1 |
| **Session 16: Onboarding Wizard** | |
| `supabase/migrations/012_onboarding.sql` | Tabla business_onboarding + triggers + RLS |
| `src/app/api/onboarding/route.ts` | API GET/PATCH para tracking |
| `src/app/(dashboard)/onboarding/page.tsx` | Wizard orquestador principal |
| `src/components/onboarding/progress-bar.tsx` | Progress bar animado con steps |
| `src/components/onboarding/steps/welcome.tsx` | Paso 1: Bienvenida con animaciones |
| `src/components/onboarding/steps/hours.tsx` | Paso 2: Horarios con iOS Time Picker |
| `src/components/onboarding/steps/service.tsx` | Paso 3: Primer servicio + sugerencias |
| `src/components/onboarding/steps/barber.tsx` | Paso 4: Primer barbero |
| `src/components/onboarding/steps/branding.tsx` | Paso 5: Color + logo (skippable) |
| `src/components/onboarding/steps/success.tsx` | Paso 6: Success con confetti |
| `src/components/ui/avatar.tsx` | Avatar component (fix analytics) |
| `src/app/(dashboard)/layout.tsx` | Redirect logic para onboarding |
| `src/middleware.ts` | x-pathname header para detección |

---

## Current State

### Working
- ✅ Sistema de branding completo y funcional (Fase 1)
- ✅ **Admin Panel MVP** completo y funcional (Fase 2)
- ✅ **Sistema de Suscripción** completo (Fase 3)
- ✅ Planes Básico ($12) y Pro ($29) con feature gating
- ✅ Trial de 7 días automático para nuevos negocios
- ✅ Pagos SINPE Móvil con reportes y aprobación manual
- ✅ Métricas reales: MRR, trials activos, conversión
- ✅ Página de precios pública
- ✅ **Onboarding Wizard** completo (Phase 2.1)
- ✅ Sistema de notificaciones email + in-app (Phase 1)
- ✅ Analytics dashboard con Recharts (Phase 1)
- ✅ Storage retention automático (Phase 1)

### Recent Changes (Session 16) - Phase 2.1: Onboarding Wizard ✅
- ✅ **Onboarding Wizard Completo (6 Pasos)**
  - Welcome: Bienvenida animada con preview de features (3 cards)
  - Hours: Configuración horarios 7 días con iOS Time Picker + IOSToggle
  - Service: Primer servicio con sugerencias populares + vista previa
  - Barber: Primer barbero con datos básicos (nombre requerido, phone/email opcional)
  - Branding: Color picker (9 premium + custom) + logo upload (skippable)
  - Success: Celebration con confetti automático (canvas-confetti CDN)
- ✅ **Progress Tracking System**
  - Tabla `business_onboarding` con current_step, completed, skipped
  - API `/api/onboarding` con GET/PATCH para actualizar estado
  - Progress Bar animado con Framer Motion (indicadores de paso completado)
  - Auto-save en cada paso para poder resumir wizard después
- ✅ **Layout Integration**
  - Redirect automático: negocios sin onboarding → /onboarding
  - Middleware x-pathname header para detección de ruta actual
  - Skip admin users (no requieren onboarding)
  - Negocios existentes marcados como completados automáticamente
- ✅ **Fixes & Dependencies**
  - Avatar component creado (soluciona import en analytics)
  - Recharts package instalado (charts para analytics dashboard)
  - update_updated_at_column() function agregada a migración

### Session 14 - Conversión de Moneda y Configuración
- ✅ Conversión de moneda USD → CRC con tipo de cambio configurable
- ✅ Migración `007_exchange_rate.sql` y `008_payment_settings.sql`
- ✅ Admin `/admin/configuracion` para gestionar settings
- ✅ API `/api/admin/settings` y `/api/settings`
- ✅ Notification dropdown fix: portal-based rendering

### Session 13 - FASE 4 COMPLETA
- ✅ Sistema de notificaciones completo (migración + lib + componentes + API)
- ✅ Triggers automáticos para: nuevas citas, cambios de pago, nuevos negocios
- ✅ Notification Bell en sidebar (desktop) y mobile header (mobile)
- ✅ Quick Action "Reportar Pago" en dashboard (aparece cuando urgente)
- ✅ Trial Banner con modos: compacto (no urgente) y prominente (urgente)
- ✅ Auto-downgrade para suscripciones vencidas (3 días grace period)
- ✅ API change-plan para upgrade/downgrade de planes

---

## Next Session

### Continue With Phase 2 - Core Features & UX
**Progreso:** 1/4 completado (Onboarding Wizard ✅)

**Siguiente:** 2.2 Interactive Tour System
- Custom TourProvider + TourTooltip components con Portal
- Tours definidos:
  - Dashboard tour (4 steps): stats, citas, quick actions, sidebar
  - Citas tour (3 steps): calendario, filtros, nueva cita
  - Clientes tour (2 steps): lista, agregar
- Tabla `tour_progress` para tracking por negocio
- Context-aware activation (primera vez en cada página)
- UI: Tooltip con flecha, spotlight/highlight, botones siguiente/saltar

**Pendiente:**
- 2.3 Landing Page Rediseñada (premium con demo interactivo)
- 2.5 Premium Appearance (custom components + microinteractions)

### Tareas Técnicas Pendientes
1. **Ejecutar migración en Supabase:**
   - `012_onboarding.sql` ✅ EJECUTADA

2. **Testing Onboarding:**
   - Crear negocio nuevo → verificar wizard se activa
   - Completar todos los pasos → verificar datos se guardan
   - Skip branding → verificar funciona correctamente
   - Confetti en paso final → verificar animación

### Testing Completo Sistema
1. **Phase 1 Features:**
   - Enviar email de prueba desde `/configuracion`
   - Verificar analytics con datos de prueba
   - Confirmar que cron job ejecuta correctamente
2. **Existing Features:**
   - Registrar nuevo negocio → verificar trial + notificación
   - Crear cita → verificar notificación
   - Reportar pago → verificar email + notificación

### Commands to Run
```bash
npm run dev
# Dashboard: http://localhost:3000/dashboard (ver campana de notificaciones)
# Suscripción: http://localhost:3000/suscripcion
# Admin: http://localhost:3000/admin/pagos
# Precios: http://localhost:3000/precios
```

### Context Notes
- **Notificaciones:** In-app con campana, polling cada 30s, triggers automáticos
- **Quick Actions:** "Reportar Pago" aparece cuando trial/suscripción por vencer
- **Banner:** Compacto para estados normales, prominente para urgencias
- **Auto-downgrade:** 3 días grace period después de vencer suscripción
- **Change Plan:** Downgrade inmediato, upgrade requiere pago

---

## Session History

### 2026-01-28 - Session 16: Phase 2.1 - Onboarding Wizard ✅
- ✅ **Migración `012_onboarding.sql`** con tabla business_onboarding y triggers
- ✅ **API `/api/onboarding`** con GET/PATCH para tracking de progreso
- ✅ **6 pasos completos del wizard:**
  - Step 1 (Welcome): Bienvenida animada con preview de features
  - Step 2 (Hours): Configuración horarios con iOS Time Picker + toggles
  - Step 3 (Service): Primer servicio con sugerencias populares + preview
  - Step 4 (Barber): Primer barbero con campos opcionales (phone, email)
  - Step 5 (Branding): Color picker + logo upload (opcional, skippable)
  - Step 6 (Success): Celebration con confetti automático (canvas-confetti)
- ✅ **Progress Bar component** con indicadores animados y porcentaje
- ✅ **Layout redirect logic**: Negocios sin onboarding completado → /onboarding
- ✅ **Middleware actualizado**: x-pathname header para detección de ruta
- ✅ **Auto-save completo**: Guarda horarios, servicio, barbero, branding en DB
- ✅ **Avatar component** creado (fix para analytics barbers-leaderboard)
- ✅ **Recharts instalado** (dependency para analytics charts)
- 📊 **Scope:** MVP wizard de 5 minutos para nuevos negocios
- 🎨 **UX:** Animaciones Framer Motion, skip opcional en branding, confetti celebration

### 2026-01-27 - Session 14: Conversión de Moneda y Configuración Admin ✅
- ✅ Creada migración `007_exchange_rate.sql` con tabla system_settings
- ✅ Creada migración `008_payment_settings.sql` para WhatsApp y SINPE
- ✅ Página admin `/admin/configuracion` para gestionar:
  - Tipo de cambio USD → CRC
  - Cuenta bancaria USD (placeholder)
  - WhatsApp de soporte
  - Detalles SINPE Móvil
- ✅ API `/api/admin/settings` con fix de autenticación
- ✅ API pública `/api/settings` para obtener configuraciones
- ✅ Página `/suscripcion` muestra precios en CRC con tipo de cambio
- ✅ Fix dropdown notificaciones: React Portal (escapa overflow sidebar)
- ✅ Fix auth APIs admin: `createClient()` para auth + `createServiceClient()` para queries
- ✅ Tipos TypeScript: ExchangeRateValue, SupportWhatsAppValue, SinpeDetailsValue
- 💡 **Pendiente:** Ejecutar migración 008, almacenamiento comprobantes (fase futura)

### 2026-01-27 - Session 13: Sistema de Notificaciones (Fase 4 Completa) ✅
- ✅ Creada migración `006_notifications.sql` con tabla y triggers
- ✅ Triggers automáticos para: nuevas citas, pagos, negocios
- ✅ Librería `src/lib/notifications.ts` con funciones CRUD y helpers
- ✅ Notification Bell component con dropdown, badge, mark as read
- ✅ API endpoints: `/api/notifications`, `/api/notifications/[id]`
- ✅ Mobile Header component con notification bell para mobile
- ✅ Quick Action "Reportar Pago" en dashboard (condicional por urgencia)
- ✅ Trial Banner mejorado: modo compacto vs prominente según urgencia
- ✅ Auto-downgrade implementado (3 días grace period para pagos vencidos)
- ✅ API `/api/subscription/change-plan` para upgrade/downgrade
- 🔔 **Notificaciones:** In-app con campana, real-time polling cada 30s
- 📱 **UX:** Banner condicional, quick actions inteligentes

### 2026-01-27 - Session 12: Sistema de Suscripción (Fase 3 Completa) ✅
- ✅ Diseño de modelo de negocio: Básico $12, Pro $29, mercado Costa Rica
- ✅ Migración `005_subscriptions.sql` con tablas y trigger de trial automático
- ✅ Feature gating implementado en APIs de barberos, servicios, clientes
- ✅ Librería `src/lib/subscription.ts` con validación de límites
- ✅ Trial banner dinámico en dashboard (muestra días, estado, uso)
- ✅ Página `/suscripcion` para usuarios (ver plan, reportar pago SINPE)
- ✅ Sistema de pagos manuales SINPE Móvil (upload comprobante + WhatsApp)
- ✅ Admin panel `/admin/pagos` con lista, filtros, aprobar/rechazar
- ✅ Métricas reales en admin dashboard (MRR, trials, conversión)
- ✅ Página pública `/precios` con comparativa de planes y FAQ
- 🎯 **MVP Pagos Costa Rica:** Sin Stripe por ahora, SINPE Móvil manual
- 📊 **Límites Básico:** 2 barberos, 3 servicios, 25 clientes, sin branding

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
Archivo del plan actual: `/Users/bryanacuna/.claude/plans/tingly-toasting-bumblebee.md`
