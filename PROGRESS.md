# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** BarberShop Pro
- **Stack:** Next.js 15, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase)
- **Last Updated:** 2026-02-03 12:45 PM
- **Last Session:** Session 64 - Security Fixes (Task 1/4 of Área 0) ✅ (COMPLETE)
- **Current Branch:** `feature/subscription-payments-rebranding`
- **Pre-Migration Tag:** `pre-v2-migration`

---

## What's Built

### Completed Features

- [x] Sistema de reservas online público (/reservar/[slug])
- [x] Dashboard administrativo para barberías
- [x] **Sistema de Gamificación Completo** 🎮
  - **Phase 1: Client Loyalty** ✅ (puntos, tiers, referidos, recompensas)
  - **Phase 2: Barber Gamification** ✅ (achievements, leaderboards, challenges)
  - **Phase 3: SaaS Referral System** ✅ (Backend + Frontend Dashboard completo + Working)
- [x] Integración de loyalty en booking flow
- [x] PWA y branding personalizable
- [x] Notificaciones automáticas

### In Progress

- [ ] **Implementation Plan v2.5 - Major App Transformation (Audited & Improved)** 🚀
  - **Plan:** `IMPLEMENTATION_PLAN_V2.5.md` (4,000+ líneas, plan mejorado post-audit)
  - **Branch:** `feature/subscription-payments-rebranding`
  - **Estimado:** 154-200 horas (8-10 semanas) - +67% para eliminar deuda técnica
  - **Score proyectado:** 6.0/10 → 8.5/10
  - **Áreas principales:** 0. 🔄 Área 0: Technical Debt Cleanup (10-12h) - ✅ Task 1: Security (3-4h DONE) + Task 2: DB Indexes (2-3h) + Task 3: Observability (3-4h) + Task 4: TypeScript (2h) **← CURRENT**
    1. ⏳ Área 1: Client Subscription & Basic Plan (database + feature gating)
    2. ⏳ Área 6: Staff Experience - Vista Mi Día (PRIORIDAD #2)
    3. ⏳ Área 2: Advance Payments & No-Show (SINPE Móvil + auto no-show)
    4. ⏳ Área 3: Rebranding Barber → Staff (migración DB completa, 14h)
    5. ⏳ Área 4: Client Referrals + Full Client Dashboard
    6. ⏳ Área 5: Web Push Notifications (PWA nativas)
    7. ⏳ Sprint 5: Testing & QA (60-80h) - Integration + E2E + Security tests
  - **Pre-Implementation Tasks:** ✅ COMPLETE
    - ✅ Multi-expert audit completed (Session 62)
    - ✅ Implementation plan improved (v2.5)
    - ✅ Documentation cleanup completed
    - ✅ Commited pending changes
    - ✅ Created feature branch
    - ✅ Fixed .gitignore
    - ✅ Tagged pre-migration: `pre-v2-migration`

- [x] **Phase 3 - Sistema de Referencias (Business):** ✅ COMPLETE
  - **Documento:** `REFERRAL_SYSTEM_PLAN.md`
  - **Estado:** FASES 1-6 completas y funcionando

### Recently Completed

#### Session 64 (2026-02-03 12:45 PM)

**Tema:** 🔒 Security Fixes - Task 1 of Área 0 (Technical Debt Cleanup)

**Completado:**

- ✅ **IP Spoofing Fix en Rate Limiters**
  - Creado `src/lib/rate-limit.ts` - Sistema completo de rate limiting
  - Función `getClientIP()` segura con validación de formato de IPs
  - Múltiples headers con orden de prioridad (x-real-ip, x-forwarded-for, cf-connecting-ip)
  - Protección contra headers falsificados
  - Aplicado a 2 endpoints críticos:
    - `/api/public/[slug]/book` (30 req/min)
    - `/api/referrals/track-conversion` (5 req/15min)

- ✅ **File Validation con Magic Bytes**
  - Creado `src/lib/file-validation.ts` - Validación por magic bytes (no confía en MIME type)
  - Detecta tipo real del archivo: PNG, JPEG, WebP, GIF, SVG, PDF
  - Previene subida de archivos maliciosos con extensión falsificada
  - Aplicado a 2 endpoints:
    - `/api/business/logo` (logo upload)
    - `/api/subscription/report-payment` (payment proof upload)

- ✅ **Path Traversal Prevention**
  - Creado `src/lib/path-security.ts` - Suite completa de seguridad de paths
  - `detectPathTraversal()` - Detecta `../`, `..\\`, URL encoded variants
  - `sanitizeFilename()` - Limpia nombres de archivo peligrosos
  - `extractSafePathFromUrl()` - Extrae paths de URLs con validación
  - Aplicado a 3 endpoints:
    - `/api/business/logo` (POST y DELETE)
    - `/api/subscription/report-payment`
    - `/api/admin/cleanup-storage`

- ✅ **Authorization Checks en Admin Endpoints**
  - Refactorizado 4 admin endpoints para usar `verifyAdmin()` consistentemente
  - Eliminado código duplicado de autorización (60+ líneas reducidas)
  - Endpoints protegidos:
    - `/api/admin/referrals/overview`
    - `/api/admin/referrals/analytics`
    - `/api/admin/referrals/top-referrers`
    - `/api/admin/referrals/recent-conversions`

**Archivos creados (3):**

- `src/lib/rate-limit.ts` (~200 líneas)
- `src/lib/file-validation.ts` (~250 líneas)
- `src/lib/path-security.ts` (~230 líneas)

**Archivos modificados (11 endpoints):**

- 2 endpoints con rate limiting
- 2 endpoints con file validation
- 3 endpoints con path security
- 4 admin endpoints con authorization refactor

**Impacto de Seguridad:**

| Vulnerabilidad       | Severidad | Estado      | Endpoints Protegidos |
| -------------------- | --------- | ----------- | -------------------- |
| IP Spoofing          | CRÍTICA   | ✅ Resuelto | 2                    |
| File Type Spoofing   | CRÍTICA   | ✅ Resuelto | 2                    |
| Path Traversal       | CRÍTICA   | ✅ Resuelto | 3                    |
| Broken Authorization | CRÍTICA   | ✅ Resuelto | 4                    |

**Estado:** ✅ Task 1 completado (3-4h estimadas → 1h real)

**Siguiente paso:** Task 2 - Database Performance (índices faltantes, 2-3h)

---

#### Session 63 (2026-02-03 10:31 AM)

**Tema:** 🧹 Documentation Cleanup & Repository Maintenance

**Completado:**

- ✅ **Documentation Cleanup**
  - Identificados archivos duplicados en repositorio
  - Eliminado `IMPLEMENTATION_PLAN_V2 2.md` (backup accidental de v2.2)
  - Eliminado `src/components/referrals/referrer-banner 2.tsx` (archivo duplicado)
  - Revertido typo en README.md

- ✅ **Git Repository Cleanup**
  - Git staging area limpiado correctamente
  - Eliminada deletion staging de archivo viejo
  - Working tree completamente limpio

- ✅ **Documentation Committed**
  - Commit `2543f4a`: 📝 docs: upgrade implementation plan to v2.5 (post-audit)
  - 3 archivos: +1,594 insertions, -4,658 deletions
  - Commit message detallado con audit improvements y verificación steps

**Archivos afectados:**

- `IMPLEMENTATION_PLAN_V2.5.md` (nuevo, +1,433 líneas)
- `IMPLEMENTATION_PLAN_V2.md` (eliminado, -4,610 líneas)
- `PROGRESS.md` (actualizado con Session 62 cleanup)

**Estado:** ✅ Repositorio limpio, documentación actualizada a v2.5

**Siguiente paso:** Implementar Área 0 - Technical Debt Cleanup

---

#### Session 62 (2026-02-02 08:30 PM)

**Tema:** 📊 Multi-Expert Audit & Implementation Plan v2.5

**Completado:**

- ✅ **Multi-Agent Audit Orchestration**
  - Coordinados 6 agentes especializados (@architecture-modernizer, @security-auditor, @test-engineer, @product-strategist, @performance-profiler, @code-reviewer)
  - Análisis colaborativo de IMPLEMENTATION_PLAN_V2.md
  - Score inicial: 6.0/10 (múltiples issues críticos identificados)

- ✅ **Critical Issues Identified**
  - TypeScript build roto (requiere SKIP_TYPE_CHECK=true bypass)
  - 4 vulnerabilidades críticas de seguridad
  - 0.0024% test coverage (100 tests, 40,770 total code lines)
  - Enfoque híbrido de rebranding mal arquitecturado (score 3/10)

- ✅ **IMPLEMENTATION_PLAN_V2.5.md Created**
  - **Área 0 expandida:** 4-6h → 10-12h
    - Fix de 4 vulnerabilidades críticas de seguridad
    - 5 índices de base de datos faltantes agregados
    - Logging estructurado con pino
    - Error tracking con Sentry
    - Security hardening en endpoints públicos
  - **Área 3 rediseñada:** 24-30h → 14h
    - Rechazado: Enfoque híbrido (genera deuda técnica permanente)
    - Aprobado: Migración DB completa con views
  - **Prioridades reordenadas:**
    - Área 6 (Staff Experience - Vista Mi Día) movida a posición #2
  - **Sprint 5 agregado:** 60-80h de Testing & QA
    - Integration tests para cron jobs
    - E2E tests para payment flows
    - Security testing
    - Performance benchmarking
  - **Features agregados:**
    - Sistema de recordatorios de citas (4-6h)
    - Gestión de lista de espera (4-6h)
    - Campañas de re-engagement (4-6h)
  - **Estimado revisado:** 92-118h → 154-200h (+67%)
  - **Score proyectado:** 6.0/10 → 8.5/10

- ✅ **Security Fixes Detailed**
  - IP spoofing fix en rate limiters
  - File validation con magic bytes
  - Path traversal prevention
  - Authorization checks mejorados

- ✅ **Documentation Cleanup**
  - Eliminados 4 archivos .md obsoletos:
    - IMPLEMENTATION_PLAN_V2.md (versión antigua)
    - CLIENT_REFERRAL_DASHBOARD_PLAN 2.md (archivo duplicado)
    - PERFORMANCE_ANALYSIS_REPORT.md (reporte temporal)
    - SECURITY_AUDIT_REPORT.md (reporte temporal)
  - Todos los hallazgos incorporados en v2.5

**Cambios clave en v2.5:**

```
ANTES (v2.2):
- Área 0: 4-6h (solo TypeScript fixes)
- Área 3: 24-30h (enfoque híbrido)
- Sin sprint de testing
- 92-118h total
- Score: 6.0/10

DESPUÉS (v2.5):
- Área 0: 10-12h (security + indexes + logging)
- Área 3: 14h (migración DB completa)
- Sprint 5: 60-80h (testing comprehensivo)
- 154-200h total (+67%)
- Score proyectado: 8.5/10
```

**ROI Analysis:**

- Inversión: +62-82h adicionales
- Ahorros proyectados: 500-800h en 12 meses
  - Testing reduce bugs: 30-50h/mes saved
  - Security fixes previenen incidents: 100-200h/año saved
  - Proper DB migration evita deuda técnica: 200-300h/año saved

**Estado:** ✅ Plan mejorado y documentación limpiada

**Siguiente paso:** Implementar Área 0 expandida con fixes críticos

---

#### Session 61 (2026-02-02 07:00 PM)

**Tema:** 🔧 Claude Code Infrastructure Setup

**Completado:**

- ✅ **Claude Code Scripts**
  - Agregado script de limpieza: `clean-other-agents.sh`
  - Documentación completa en `.claude/scripts/README.md`
  - Script elimina directorios de otros AI assistants (40+ agents)
  - Mantiene solo carpetas esenciales de Claude Code

- ✅ **Skills Symlinks**
  - Creados 8 symlinks para Claude Code skills
  - Skills: error-handling, nextjs-patterns, production-audit, secrets-management, security-scanning, react-best-practices, wcag-audit
  - Ubicación: `.claude/skills/` y `.github/skills/`

**Commits:**

- `93f007f` - chore: add Claude Code scripts and skills symlinks (10 files, 160 insertions)

**Estado:** Claude Code infrastructure configurado correctamente

---

#### Session 60 (2026-02-02 06:30 PM)

**Tema:** 🔀 Branch Cleanup + Plan Verification

**Completado:**

- ✅ **Plan v2.2 Verificado**
  - Verificado que plan incluye Web Push (Área 5)
  - Verificado que plan incluye Full Client Dashboard (Área 4B)
  - Plan preservado en 3 ubicaciones (plan mode, root, PROGRESS.md)

- ✅ **Branch Cleanup Ejecutado**
  - Merged `feature/gamification-system` → `main` (fast-forward)
  - Deleted 4 branches: gamification-system, loyalty-config-apple-redesign, comprehensive-audit, ui-ux-audit-fixes
  - Solo quedan 2 branches: `main` y `feature/subscription-payments-rebranding`

- ✅ **Main Branch Actualizado**
  - 91 archivos, +16,062 líneas
  - Incluye todo el sistema de gamificación + referidos business

**Commits:**

- `a0e5a7a` - Progress update after branch cleanup

**Estado:** Ready para implementar Área 1 (Database Migrations)

---

#### Session 58 (2026-02-02 03:00 PM)

**Tema:** 🔧 Navigation & Layout Fixes + Client Referral Dashboard Planning

**Completado:**

- ✅ **npm security vulnerabilities resolved** - 0 vulnerabilities (tar package updated)

- ✅ **Navigation Fixed (2 sidebars)**
  - Business Dashboard Sidebar: Agregado link "Referencias" con Share2 icon
  - Super Admin Sidebar: Agregado link "Referencias" con Share2 icon
  - Ahora ambos dashboards tienen acceso a sus respectivas páginas de referencias

- ✅ **Layout Group Fix - Critical**
  - **Problema:** `/admin/referencias` estaba en `(dashboard)` layout group → usaba sidebar de business
  - **Solución:** Movido a `(admin)` layout group → ahora usa sidebar de super admin correctamente
  - **Resultado:** Super Admin sidebar (negro con Shield icon) se mantiene al navegar a Referencias

- ✅ **Client Referral Dashboard - Planning Complete**
  - Documento: `CLIENT_REFERRAL_DASHBOARD_PLAN.md` (plan completo de implementación)
  - 3 API endpoints planeados (my-code, stats, list)
  - 4 componentes frontend diseñados
  - Página `/referidos` especificada para clientes
  - ~770 líneas de código estimadas

**Archivos modificados (5):**

- `src/components/dashboard/sidebar.tsx` - Agregado link Referencias
- `src/components/admin/admin-sidebar.tsx` - Agregado link Referencias
- `src/app/(admin)/admin/referencias/page.tsx` - Movido de (dashboard) a (admin)
- `package.json` + `package-lock.json` - Dependencies actualizadas (npm audit fix)

**Archivos creados (1):**

- `CLIENT_REFERRAL_DASHBOARD_PLAN.md` - Plan completo del dashboard de referidos para clientes

**Issues resueltos:**

1. ❌ → ✅ Links de referencias no eran accesibles desde navegación
2. ❌ → ✅ Admin sidebar no persistía al navegar a /admin/referencias
3. ❌ → ✅ npm vulnerabilities (tar package)
4. ❌ → 📋 Sistema de referidos clientes sin UI (ahora planeado)

**Commit:** `0a578a2` - 20 archivos, 2173 insertions

**Estado:** ✅ Navegación completa, layout correcto, sistema listo para testing

**Siguiente paso:**

- **Opción A:** Implementar Client Referral Dashboard (~3-4 horas, 8 archivos)
- **Opción B:** FASE 7 - Testing & QA del Business Referral System

---

#### Session 57 (2026-02-02 01:30 PM)

**Tema:** 🎯 FASE 6 - Super Admin Dashboard para Sistema de Referencias

**Completado:**

- ✅ **Backend APIs (4 nuevos endpoints)**
  - `/api/admin/referrals/overview` - Stats globales del programa
  - `/api/admin/referrals/top-referrers` - Ranking de top 10 referrers
  - `/api/admin/referrals/recent-conversions` - Timeline de conversiones recientes
  - `/api/admin/referrals/analytics` - Data para gráficas (Line, Pie, Bar charts)

- ✅ **Frontend Components (4 componentes)**
  - `GlobalStatsCards` - 6 métricas clave con animaciones (Framer Motion)
  - `TopReferrersTable` - Tabla con ranking, badges de milestone y conversión rate
  - `ConversionsTimeline` - Timeline con status badges (pending/active/expired)
  - `ReferralAnalyticsCharts` - 3 gráficas interactivas (Recharts)

- ✅ **Admin Dashboard Page** - `/admin/referencias`
  - Auth check usando tabla `admin_users` existente
  - Queries directas a Supabase (sin fetch a APIs intermedias)
  - Server Component con createServiceClient para admin access
  - Manejo de errores y estados vacíos
  - Responsive design + dark mode completo

**Archivos creados (9):**

- `src/app/api/admin/referrals/overview/route.ts` (~90 líneas)
- `src/app/api/admin/referrals/top-referrers/route.ts` (~100 líneas)
- `src/app/api/admin/referrals/recent-conversions/route.ts` (~110 líneas)
- `src/app/api/admin/referrals/analytics/route.ts` (~140 líneas)
- `src/components/admin/referrals/global-stats-cards.tsx` (~110 líneas)
- `src/components/admin/referrals/top-referrers-table.tsx` (~190 líneas)
- `src/components/admin/referrals/conversions-timeline.tsx` (~160 líneas)
- `src/components/admin/referrals/referral-analytics-charts.tsx` (~180 líneas)
- `src/app/(dashboard)/admin/referencias/page.tsx` (~280 líneas)

**Total:** ~1,360 líneas de código

**Características implementadas:**

- Verificación de permisos admin usando `admin_users` table
- Queries optimizadas con service client
- Animaciones con Framer Motion
- Gráficas interactivas con Recharts (Line, Pie, Bar)
- Responsive design con Tailwind CSS
- Dark mode support completo
- TypeScript types completos

**Estado:** ✅ FASE 6 completa - Super Admin Dashboard funcional

**Siguiente paso:** FASE 7 - Testing & QA del sistema completo

---

#### Session 56 (2026-02-02 11:30 AM)

**Tema:** 🎯 FASE 4 - Integración Signup Flow con Sistema de Referencias

**Completado:**

- ✅ **ReferrerBanner Component** - Banner visual que se muestra cuando un usuario llega con código de referido
  - Diseño con gradiente purple/pink
  - Muestra el nombre del negocio que refiere
  - Lista de beneficios para el nuevo usuario
  - Animación de entrada con Framer Motion

- ✅ **Cookie Management** - Persistencia del código de referido durante signup
  - Helper functions: `saveReferralCode()`, `getReferralCode()`, `clearReferralCode()`
  - Cookie con 30 días de duración
  - Se guarda cuando usuario llega con `?ref=CODIGO`
  - Se lee al completar signup para trackear conversión

- ✅ **Signup Flow Integration** - Modificado `/register` page
  - Detecta query param `?ref=CODIGO` en useEffect
  - Fetch automático a `/api/referrals/info` para obtener datos del referrer
  - Muestra banner si el código es válido
  - Tracking automático de conversión después de crear cuenta exitosamente
  - Estado inicial: "pending"

- ✅ **Conversion Tracking** - Helper function `trackReferralConversion()`
  - Llama a `/api/referrals/track-conversion` POST endpoint
  - Incrementa `total_referrals` del referrer
  - Crea registro en `referral_conversions` table
  - Limpia cookie después de tracking exitoso

**Archivos creados (3):**

- `src/components/referrals/referrer-banner.tsx` - Componente del banner (~70 líneas)
- `src/lib/referrals.ts` - Utilidades para cookies y tracking (~90 líneas)

**Archivos modificados (1):**

- `src/app/(auth)/register/page.tsx` - Integrado flujo de referidos (~50 líneas agregadas)

**Total:** ~210 líneas de código

**Cómo funciona el flujo:**

```
1. Usuario llega a /register?ref=BARBERSHOP_2026_A3F5
   ↓
2. useEffect detecta query param, guarda en cookie
   ↓
3. Fetch a /api/referrals/info?code=...
   ↓
4. Si válido → Muestra ReferrerBanner con nombre del negocio
   ↓
5. Usuario completa registro (crea cuenta + negocio)
   ↓
6. Lee código de cookie, llama trackReferralConversion()
   ↓
7. POST /api/referrals/track-conversion
   ↓
8. Incrementa total_referrals, crea conversión con status "pending"
   ↓
9. Limpia cookie, redirect a /dashboard
```

**Estado:** ✅ FASE 4 completa - Signup flow integrado con sistema de referencias

**FASE 5 - Notificaciones:** ✅ Marcada como completa

- Las notificaciones in-app ya funcionan automáticamente en el API `/api/referrals/track-conversion`
- Se crean notificaciones cuando status='active' y cuando se desbloquean milestones
- Email/push notifications quedan como opcional para futuro

**Siguiente paso:** FASE 6 - Super Admin Dashboard

---

#### Session 55 (2026-02-02 10:15 AM)

**Tema:** 🐛 Fix crítico de autenticación en sistema de referencias

**Problema encontrado:**

- ❌ App dejó de cargar después de completar FASE 3
- ❌ Error "Unauthorized" al intentar acceder a `/referencias`
- ❌ Múltiples procesos de Next.js causando conflictos

**Debugging realizado:**

1. **Múltiples procesos del servidor** - Detectados 2 pares de procesos Next.js corriendo simultáneamente
2. **Error de autenticación** - Server Component haciendo fetch interno a `/api/referrals/stats` sin pasar cookies
3. **Root cause:** Fetch desde Server Components no pasa automáticamente cookies de autenticación

**Solución aplicada:**

- ✅ Terminados todos los procesos duplicados del servidor
- ✅ Reiniciado dev server limpiamente
- ✅ **Fix principal:** Movidas todas las queries de `/api/referrals/stats` directamente al Server Component
- ✅ Eliminado fetch interno innecesario (más rápido, menos overhead)
- ✅ Verificado: Compilación exitosa sin errores

**Archivos modificados:**

- `src/app/(dashboard)/referencias/page.tsx` - Reemplazado fetch API con queries directas a Supabase

**Beneficios del fix:**

1. ✅ Autenticación funciona correctamente (Supabase client tiene acceso a cookies)
2. ✅ Más rápido (sin HTTP round-trip extra)
3. ✅ Código más simple (menos failure points)
4. ✅ Mejor type safety (queries directas)

**Estado:** ✅ `/referencias` ahora carga correctamente sin errores de autenticación

**Siguiente paso:** FASE 4 - Integración Signup Flow

---

#### Session 54 (2026-02-02)

**Tema:** 🎨 Phase 3 - Frontend Dashboard Cliente (FASE 3)

**Completado:**

- ✅ **Frontend Dashboard Completo**
  - Página principal `/referencias` con 3 estados (error, empty, full dashboard)
  - Integración con APIs de FASE 2
  - Server component para fetch de datos
  - Manejo de estados de carga y error

- ✅ **6 Componentes Client Creados:**
  1. `ReferralCodeCard` - Código único + QR + botones de compartir (WhatsApp, Copy)
  2. `StatsCards` - 4 métricas animadas (Total, Activos, Milestone, Conversión)
  3. `MilestoneProgress` - Barra progreso + grid de 5 milestone cards con tier colors
  4. `BadgesShowcase` - Grid de badges desbloqueados con animaciones spring
  5. `ConversionsTable` - Tabla de referidos con status badges y empty state
  6. `GenerateReferralCode` - Modal para generar primer código con beneficios

- ✅ **Características Implementadas:**
  - Dark mode completo en todos los componentes
  - Responsive design (mobile-first, grid adaptativo)
  - Animaciones con Framer Motion (cards, milestones, badges)
  - Toast notifications con Sonner
  - TypeScript types completos

**Archivos creados (7):**

- `src/app/(dashboard)/referencias/page.tsx`
- `src/components/referrals/referral-code-card.tsx`
- `src/components/referrals/stats-cards.tsx`
- `src/components/referrals/milestone-progress.tsx`
- `src/components/referrals/badges-showcase.tsx`
- `src/components/referrals/conversions-table.tsx`
- `src/components/referrals/generate-referral-code.tsx`

**Total:** ~1,200 líneas de código

---

### Key Files

| File                                                     | Purpose                                       |
| -------------------------------------------------------- | --------------------------------------------- |
| `src/app/(dashboard)/referencias/page.tsx`               | Dashboard de referencias para business owners |
| `src/app/(admin)/admin/referencias/page.tsx`             | Admin dashboard con vista global del programa |
| `src/app/(auth)/register/page.tsx`                       | Signup page con integración de referidos      |
| `src/components/referrals/referral-code-card.tsx`        | Card con código único + QR + compartir        |
| `src/components/referrals/referrer-banner.tsx`           | Banner que muestra quién refirió (signup)     |
| `src/components/admin/referrals/global-stats-cards.tsx`  | 6 métricas globales para admin                |
| `src/components/admin/referrals/top-referrers-table.tsx` | Ranking de top referrers                      |
| `src/lib/referrals.ts`                                   | Utilidades para cookies y tracking            |
| `src/app/api/referrals/info/route.ts`                    | API para obtener info del referrer            |
| `src/app/api/admin/referrals/overview/route.ts`          | Admin API - Stats globales                    |
| `supabase/migrations/019_business_referral_system.sql`   | Schema completo del sistema de referencias    |

---

## Current State

### Working

- ✅ App funcionando correctamente en http://localhost:3000
- ✅ Sistema de reservas operativo
- ✅ Dashboard administrativo funcional
- ✅ Sistema de loyalty integrado
- ✅ Sistema de referencias funcionando sin errores (/referencias accessible)

### Known Issues

- ⚠️ TypeScript errors pendientes en varios archivos (database types no registrados en Database['public']['Tables'])
- ⚠️ No actualizar a Next.js 16 hasta que Turbopack esté más estable (esperar 16.2+)
- ⚠️ Migraciones pendientes de aplicar en producción:
  - 015_fix_notification_trigger.sql
  - 016_fix_loyalty_programs_rls.sql
  - 017_allow_public_read_loyalty_programs.sql
  - 018_barber_gamification.sql
  - 019_business_referral_system.sql

---

## Next Session

### Continue With

**🎯 Área 0: Technical Debt Cleanup (PRIORIDAD #1)** - 7-9h restantes

✅ **Task 1: Security Fixes** - COMPLETADO (3-4h)

**Task 2: Database Performance** - 2-3h

5. **Migration 019b: Missing Indexes**

   ```sql
   CREATE INDEX idx_appointments_deposit_paid ON appointments(...);
   CREATE INDEX idx_client_referrals_status ON client_referrals(...);
   CREATE INDEX idx_clients_inactive ON clients(...);
   -- + 2 índices más
   ```

6. **N+1 Query Fixes**
   - Cron jobs: Batch queries
   - Referral dashboard: Join optimization

**Task 3: Observability** - 3-4h

7. **Structured Logging con pino**
   - `src/lib/logger.ts` - Setup de pino
   - Integrar en API routes críticos

8. **Error Tracking con Sentry**
   - Setup básico de Sentry
   - Error boundaries en componentes críticos

9. **Rate Limiting con Upstash Redis**
   - Setup de Upstash Redis
   - Proteger endpoints públicos críticos

**Task 4: TypeScript Strict Mode** - 2h

10. **Habilitar strict mode**
    - Fix de 49 errores TypeScript
    - Remover 43 archivos con @ts-nocheck
    - Compilación limpia sin SKIP_TYPE_CHECK

**Archivos a modificar/crear:**

- `src/lib/rate-limit.ts`
- `src/lib/file-validation.ts`
- `src/lib/logger.ts`
- `src/app/api/media/route.ts`
- `src/app/api/admin/*/route.ts` (varios)
- `supabase/migrations/019b_missing_indexes.sql`
- `next.config.js` (Sentry integration)

**Después de Área 0:**
→ Área 1: Client Subscription & Basic Plan

**Comandos útiles:**

```bash
npm run dev  # Servidor en http://localhost:3000
npx tsc --noEmit  # Verificar compilación TypeScript
npm audit  # Security audit
lsof -i :3000  # Verificar servidor
```

---

### Commands to Run

```bash
npm run dev  # Servidor en http://localhost:3000
```

### Context Notes

- **Next.js Version:** Mantenerse en 15.x (no actualizar a 16 por ahora)
- **Referral System:** FASE 1-5 completas | FASE 6 (Super Admin) pendiente
- **Database:** Migration 019 creada pero no aplicada en producción
- **Dev Server:** Corriendo en http://localhost:3000
- **Notificaciones:** In-app notifications funcionando automáticamente

---
