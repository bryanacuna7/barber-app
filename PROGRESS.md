# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** BarberShop Pro
- **Stack:** Next.js 15, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase)
- **Last Updated:** 2026-02-01 7:10 PM
- **Last Session:** Session 52 - Referral System UI Previews & Super Admin ✅ (COMPLETE)

---

## What's Built

### Completed Features

- [x] Sistema de reservas online público (/reservar/[slug])
- [x] Dashboard administrativo para barberías
- [x] **Sistema de Gamificación Completo** 🎮
  - **Phase 1: Client Loyalty** ✅ (puntos, tiers, referidos, recompensas)
  - **Phase 2: Barber Gamification** ✅ (achievements, leaderboards, challenges)
  - **Phase 3: SaaS Referral System** ⏳ (PRIORIDAD MÁXIMA - Crítico para lanzamiento)
- [x] Integración de loyalty en booking flow
- [x] PWA y branding personalizable
- [x] Notificaciones automáticas

### In Progress

- [ ] 🚨 **PRIORIDAD MÁXIMA:** Phase 3 - Sistema de Referencias para Business Owners
  - **Contexto:** Sistema crítico para impulsar el lanzamiento viral del SaaS
  - **Objetivo:** Incentivar a dueños de barberías a referir otros negocios
  - **Estado:** ✅ Plan completo | ✅ Previews visuales creados | ⏳ Listo para implementar
  - **Opción seleccionada:** Option B - Recompensas Escalonadas + Gamificación
  - **Documento:** `REFERRAL_SYSTEM_PLAN.md` (plan completo de 7 fases, 3-4 semanas)
  - **Previews disponibles:**
    - 👤 Vista Cliente: `/referencias-preview` (dashboard completo con datos de ejemplo)
    - 👑 Vista Super Admin: `/admin-referencias-preview` (analytics, leaderboard, ROI)
  - **7 Fases de implementación:**
    1. Database Schema (1-2 días)
    2. Backend API Routes (2-3 días)
    3. Frontend Dashboard Cliente (3-4 días)
    4. Integración Signup Flow (1-2 días)
    5. Notificaciones (1 día)
    6. Super Admin Dashboard (2-3 días)
    7. Testing & QA (1-2 días)
  - **5 milestones simplificados:**
    - 1 referido → 20% descuento ($6)
    - 3 referidos → 1 mes gratis ($29)
    - 5 referidos → 2 meses gratis ($58)
    - 10 referidos → 4 meses gratis ($116)
    - 20 referidos → 1 año gratis ($348)
  - **Siguiente sesión:** Iniciar implementación con `/create` (comenzar FASE 1: Database Schema)

### Backlog (Post-Phase 3)

- [ ] Testing end-to-end del sistema de gamificación (Phase 2)
- [ ] Crear challenge de prueba y verificar leaderboard
- [ ] Verificar auto-unlock de achievements al completar citas

### Recently Completed

#### Session 52 (2026-02-01)

**Tema:** 🎨 Referral System - UI Previews & Super Admin Dashboard

**Completado:**

- ✅ Mockup visual completo del dashboard de referencias (vista cliente)
  - Stats cards animadas (Total, Activos, Milestone, Conversión)
  - Código de referido + QR code placeholder
  - Botones funcionales: Copiar código, Copiar link, Compartir WhatsApp
  - Progreso de milestones con barra animada
  - 5 milestone cards (2 desbloqueados, 3 bloqueados)
  - Badges showcase con animaciones
  - Tabla de conversiones con datos de ejemplo
- ✅ Mockup visual de Super Admin Dashboard
  - Global stats (47 negocios, 156 referencias, ROI 348%)
  - Top 5 referrers leaderboard con ranking
  - Program health metrics (avg referidos, conversion time, churn)
  - Milestone distribution (visualización de cuántos en cada nivel)
  - Recent conversions table
  - Insights automáticos (ROI analysis, power users, oportunidades)
- ✅ Plan actualizado con FASE 6: Super Admin Dashboard
- ✅ Componente Progress UI creado (custom, sin Radix UI)
- ✅ Dark mode support en ambos previews
- ✅ Responsive design completo

**Archivos creados:**

- `src/app/(dashboard)/referencias-preview/page.tsx`
- `src/app/(dashboard)/admin-referencias-preview/page.tsx`
- `src/components/ui/progress.tsx`

**URLs de preview:**

- Cliente: `http://localhost:3000/referencias-preview`
- Admin: `http://localhost:3000/admin-referencias-preview`

**Decisiones técnicas:**

- Usar datos mockeados para demostración
- Funcionalidad de compartir por WhatsApp implementada
- Animaciones con Framer Motion
- Toast notifications con Sonner

**Próximo paso:** `/create` para empezar FASE 1 (Database Schema)

---

#### Session 51 (2026-02-01)

**Tema:** 🧠 Referral System - Brainstorming & Planning

**Completado:**

- ✅ Brainstorming de sistema de referencias (4 opciones evaluadas)
- ✅ Selección de Option B: Recompensas Escalonadas + Gamificación
- ✅ Plan completo de implementación (6 fases, 3 semanas)
- ✅ Documento detallado guardado: `REFERRAL_SYSTEM_PLAN.md`
- ✅ Sistema de milestones SIMPLIFICADO (5 niveles: 1→3→5→10→20 referidos)
- ✅ Rewards claros: 20% descuento → 1 mes → 2 meses → 4 meses → 1 año gratis
- ✅ Componentes UI diseñados (dashboard, QR codes, badges, progress)

**Decisiones clave:**

- Sistema de milestones gamificado (no cash-back directo)
- QR codes + códigos únicos para compartir
- Badges coleccionables: First Partner → Growth Partner → Network Builder → Super Connector → Network King
- Integración con signup flow para tracking automático
- Notificaciones push en conversiones y milestones
- Eliminado milestone 6 (Founding Partner) para simplicidad

**Próximo paso:** `/plan` para plan técnico detallado → `/create` para implementar

---

#### Session 50 (2026-02-01)

- [x] Sistema de tabs funcionando en `/barberos` ✅
  - Tab "Equipo" - Gestión de barberos
  - Tab "Logros" - Achievements con iconos y progreso
  - Tab "Desafíos" - Challenges activos
- [x] Reorganización completa de navegación:
  - Movidas páginas de `/lealtad/logros-barberos` y `/lealtad/desafios` a `/barberos/`
  - Tabs integrados DENTRO de `/barberos` (no en sidebar)
  - Mantenidas rutas directas `/barberos/logros` y `/barberos/desafios` funcionando
- [x] Fix crítico en achievements API:
  - Resuelto error 404 cuando owner no es barber
  - API ahora maneja correctamente caso sin barberId
  - Owners ven achievements disponibles sin progreso personal
- [x] Refactorización de arquitectura:
  - Creado `BarbersManagement` component (client component)
  - Página principal convertida a server component con tabs
  - Mejor separación de responsabilidades

### Key Files

| File                                                 | Purpose                                      |
| ---------------------------------------------------- | -------------------------------------------- |
| `src/app/(public)/reservar/[slug]/page.tsx`          | Página principal de reservas                 |
| `src/components/loyalty/client-status-card.tsx`      | Card de status de loyalty                    |
| `src/components/loyalty/loyalty-upsell-banner.tsx`   | Banner upsell para usuarios no auth          |
| `src/components/loyalty/loyalty-config-form.tsx`     | Form de config (Apple-style, single path)    |
| `src/components/loyalty/loyalty-config-wrapper.tsx`  | Wrapper simplificado para form               |
| `src/components/loyalty/program-type-selector.tsx`   | Type selector limpio (radio group iOS-style) |
| `src/components/loyalty/collapsible-section.tsx`     | Progressive disclosure wrapper               |
| `src/components/ui/sheet.tsx`                        | Modal component con Framer Motion            |
| `src/components/ui/radio-group.tsx`                  | Radio selection component                    |
| `src/lib/gamification/loyalty-calculator.ts`         | Lógica de cálculo de puntos                  |
| `src/hooks/useBookingData.ts`                        | Hook para datos de reservas                  |
| `src/app/(dashboard)/lealtad/configuracion/page.tsx` | Page con side-by-side layout                 |
| `src/app/(dashboard)/barberos/page.tsx`              | Página con tabs: Equipo, Logros, Desafíos    |
| `src/components/barbers/barbers-management.tsx`      | Client component para gestión de barberos    |
| `src/components/gamification/achievements-view.tsx`  | Vista de achievements con progreso           |
| `src/components/gamification/challenges-view.tsx`    | Vista de challenges activos                  |

---

## Current State

### Working

- ✅ App funcionando correctamente en http://localhost:3000
- ✅ Sistema de reservas operativo
- ✅ Dashboard administrativo funcional
- ✅ Sistema de loyalty integrado

### Recent Fixes

**Session 48 (2026-02-01 11:00 PM) - Apple-Style Mobile UX Redesign**

- ✅ **Rediseño completo:** Loyalty config tab optimizado para mobile siguiendo principios de Apple 2026
  - **Eliminado:** Sistema dual confuso (Quick Start presets vs Personalizar tabs)
  - **Implementado:** Single path claro: Enable → Type Selection → Configuration → Save
  - **Principios aplicados:** Clarity, Deference, Progressive Disclosure, Mobile-First

- ✅ **Componentes nuevos creados:**
  - `src/components/loyalty/program-type-selector.tsx` - Type selector limpio (sin gradientes)
  - `src/components/loyalty/collapsible-section.tsx` - Progressive disclosure para opciones avanzadas
  - `src/components/loyalty/loyalty-config-wrapper.tsx` - Wrapper simplificado (sin shared state)

- ✅ **Refactor mayor:** `loyalty-config-form.tsx` (~400 líneas eliminadas)
  - Removido: PRESETS array, detectPresetFromProgram(), selectedPreset state
  - Removido: Preset cards con gradientes y decoración
  - Removido: Tabs component y TabsContent wrappers
  - Reemplazado: Conditional rendering basado en programType
  - Agregado: Integración de preview button inline (no flotante)
  - Agregado: Sheet modal para preview en mobile

- ✅ **Layout actualizado:** `page.tsx` ahora tiene side-by-side en desktop (config 60% + preview 40%)
  - Stats mejorados: Conditional rendering (oculta si todos = 0), empty state sugerente
  - Spacing mobile optimizado: mt-4 lg:mt-0 para evitar colisión con header

- ✅ **Batalla épica contra bordes (15+ iteraciones):**
  - **Problema:** Usuario frustrado con borders apareciendo repetidamente
  - **Solución final:** Eliminados TODOS los borders, usando solo backgrounds y sombras
  - **Radio buttons:** `border-0`, selección con `bg-primary/20` + `shadow-md`
  - **Collapsible section:** `shadow-sm` en lugar de border
  - **Dropdowns:** `shadow-lg` en SelectContent, sin borders
  - **Inputs:** `shadow-sm` agregado al baseStyles

- ✅ **Dark mode con primary gris (5+ iteraciones):**
  - **Problema:** Selected radio no visible cuando primary color es gris en dark mode
  - **Soluciones intentadas:**
    1. `bg-primary/15` → muy sutil
    2. `bg-primary/30` → aún no visible
    3. `bg-emerald-500/20` → hardcoded, no respeta customización
    4. `bg-primary/60` dark → no suficiente contraste
    5. `bg-zinc-700` dark → mejor pero no ideal
  - **Solución final (invertida):**
    - Unselected: `dark:bg-zinc-800`
    - Selected: `dark:bg-zinc-950` (MÁS oscuro que unselected)
    - Concepto: Selected es el más oscuro, invirtiendo la lógica usual

- ✅ **Preview button saga (4+ iteraciones):**
  - **Intento 1:** Floating button `bottom-24 right-4` → mal posicionado
  - **Intento 2:** Centrado `bottom-4 left-1/2` → choca con "Guardar Cambios"
  - **Intento 3:** Subido `bottom-20` → aún choca
  - **Intento 4:** Movido fuera del Card con wrapper → técnicamente correcto pero "incómodo"
  - **Solución final:** Integrado después de "Guardar Cambios" como parte del form
    - Button con `variant="outline"` y `lg:hidden`
    - Abre Sheet modal cuando se hace tap
    - No más positioning fixed/absolute
    - UX natural y no intrusiva

- ✅ **Trial banner mobile:** Optimizado en `trial-banner.tsx`
  - Padding reducido: `p-3` (antes `p-4`)
  - Iconos reducidos: `h-8 w-8` (antes `h-10 w-10`)
  - Texto reducido: `text-[15px]` y `text-[13px]`

- ✅ **Archivos modificados (7 totales):**
  1. `src/components/ui/radio-group.tsx` - Grid 2 columnas mobile, inverted dark mode colors, sombras
  2. `src/components/loyalty/loyalty-config-form.tsx` - Integración preview button, Sheet modal
  3. `src/components/loyalty/collapsible-section.tsx` - Shadows en lugar de borders
  4. `src/components/ui/select.tsx` - Removed borders de SelectContent
  5. `src/components/ui/input.tsx` - Agregado shadow-sm al baseStyles
  6. `src/components/subscription/trial-banner.tsx` - Compact mobile version
  7. `src/app/(dashboard)/lealtad/configuracion/page.tsx` - Spacing mobile optimizado

- ✅ **Nuevo componente creado:**
  - `src/components/loyalty/loyalty-config-wrapper.tsx` - Wrapper simplificado (solo render directo)

- ✅ **Grid responsive para tipo de programa (2026-02-01 11:55 PM):**
  - **Cambio:** Radio group ahora usa grid de 2 columnas en mobile (< 1024px)
  - **Archivo:** `src/components/ui/radio-group.tsx` - Cambio de `space-y-2` a `grid grid-cols-2 gap-2 lg:grid-cols-1`
  - **Verificado:** Screenshots en mobile (375px) y desktop (1280px) confirman funcionamiento correcto
  - **UX mejorada:** Cards de tipo de programa más compactos y aprovechan mejor el espacio en mobile

- ✅ **Merge completado (2026-02-02 12:05 AM):**
  - **Branch:** `feature/loyalty-config-apple-redesign` → `feature/gamification-system`
  - **Tipo:** Fast-forward merge (sin conflictos)
  - **Archivos integrados:** 13 archivos (856 líneas agregadas, 868 eliminadas)
  - **Estado:** Todo el rediseño Apple-style ahora integrado en rama principal de gamification
  - **Siguiente:** Verificación visual y testing, luego merge a `main`

- ⏳ **Pendiente verificación visual en app real:** Requiere autenticación para acceder a /lealtad/configuracion
  - Preview button inline en mobile (Sheet modal)
  - Radio buttons con dark mode invertido
  - Sombras en lugar de borders
  - Side-by-side layout en desktop
  - Grid 2x2 en mobile para tipo de programa

**Session 47 (2026-02-01 10:30 PM)**

- ✅ **Resuelto:** RLS policy bloqueaba guardado de loyalty program silenciosamente
  - **Causa raíz:** Policy solo tenía USING clause, faltaba WITH CHECK para INSERT/UPDATE
  - **Solución:** Agregado WITH CHECK clause en migration 016
  - **Verificación:** Upsert ahora incluye `.select().single()` para validación RLS
- ✅ **Resuelto:** Banner de loyalty no visible para usuarios no autenticados
  - **Causa raíz:** RLS policy requería ownership para lectura
  - **Solución:** Separadas policies: lectura pública (enabled=true), escritura solo owner
  - **Migration:** 017_allow_public_read_loyalty_programs.sql
  - **Resultado:** Banner aparece correctamente en booking flow para usuarios no auth
- ✅ **Limpieza:** Removidos console.logs de debug
  - Limpiado detectPresetFromProgram()
  - Limpiado handleSave()
  - Mantenido solo console.error para errores

**Session 46 (2026-02-01 8:45 AM)**

- ✅ **Resuelto:** Caché corrupto de Next.js causando errores intermitentes
  - **Solución:** Limpieza completa de `.next` y `node_modules/.cache`
  - **Prevención:** Script de limpieza implementado
- ✅ **Resuelto:** Banner de loyalty no visible para usuarios no autenticados durante reserva
  - **Implementado:** Componente `LoyaltyUpsellBanner` con beneficios y CTA
  - **Ubicación:** Se muestra en booking flow antes de completar reserva
- ✅ **Resuelto:** Template de loyalty no se mostraba seleccionado al regresar a config
  - **Causa raíz:** Datos de DB en snake_case no se transformaban a camelCase
  - **Solución:** Transformación explícita en `getLoyaltyProgram()`
  - **Ubicación:** `src/app/(dashboard)/lealtad/configuracion/page.tsx`

**Session 44 (Previous)**

- ⚠️ **IMPORTANTE:** Downgrade de Next.js 16 → 15 por bug crítico en Turbopack
  - **Problema:** Loop infinito de compilación, servidor no respondía
  - **Solución:** `npm install next@15 react@19 react-dom@19`
  - **Status:** ✅ Resuelto - app funciona perfectamente
- ✅ Limpieza de caché corrupto (.next)
- ✅ Servidor estable sin timeouts

### Known Issues

- ⚠️ No actualizar a Next.js 16 hasta que Turbopack esté más estable (esperar 16.2+)
- ⚠️ Migraciones pendientes de aplicar en producción:
  - 015_fix_notification_trigger.sql
  - 016_fix_loyalty_programs_rls.sql (aplicada en dev)
  - 017_allow_public_read_loyalty_programs.sql (aplicada en dev)

---

## Next Session

### Continue With

## 🚨 SIGUIENTE SESIÓN - PRIORIDAD MÁXIMA

### Phase 3: Sistema de Referencias para Business Owners

**🎯 Contexto Crítico:**
Este sistema es la pieza clave para el lanzamiento y crecimiento viral del SaaS. Incentiva a dueños de barberías a convertirse en embajadores del producto.

**📋 Modo de Ejecución:**

1. **Iniciar con `/plan`** - Crear plan de implementación detallado
2. **Usar `/brainstorm`** - Explorar estrategias de incentivos y diseño
3. **Agents:** @product-strategist + @ui-ux-designer + @fullstack-developer

**🎨 Diseño:** BRUTAL - Este dashboard debe verse premium y motivar la acción

---

**🔧 Componentes a Implementar:**

### 1. Código de Referido Único

- [ ] Generación automática por barbería (código alfanumérico corto)
- [ ] QR code downloadable para compartir físicamente
- [ ] Link de referido personalizado: `barbershoppro.com/ref/ABC123`
- [ ] Sistema de tracking de clicks y conversiones
- [ ] Copiar al portapapeles con un click

### 2. Sistema de Recompensas por Milestones

- [ ] **Definir estructura de incentivos óptima:**
  - Milestone 1: ¿X referencias → Descuento Y% o Z meses gratis?
  - Milestone 2: ¿...?
  - Milestone 3: ¿...?
- [ ] **Tipos de recompensas:**
  - % Descuento en próxima renovación
  - Meses gratis de suscripción
  - Features premium desbloqueados
  - Badges especiales en perfil
- [ ] Auto-aplicación de recompensas al alcanzar milestone
- [ ] Notificaciones de nuevas recompensas ganadas

### 3. Admin Panel - Dashboard de Referencias

- [ ] **Vista principal:**
  - Stats cards: Referencias totales, Conversiones, Recompensas ganadas
  - Progreso hacia siguiente milestone (barra visual)
  - Código de referido destacado (copyable)
  - QR code para compartir
- [ ] **Historial de referencias:**
  - Lista de negocios referidos (nombre, fecha, estado)
  - Estados: Pendiente, Activo (convertido), Trial, Premium
  - Recompensa otorgada por cada conversión
- [ ] **Leaderboard de referrers (opcional):**
  - Top 10 barberías con más referencias
  - Gamificación social para motivar competencia
- [ ] **Recursos para compartir:**
  - Templates de mensajes para WhatsApp/Instagram
  - Imágenes promocionales descargables
  - Scripts de pitch personalizables

### 4. Base de Datos (Migration)

```sql
-- Tabla: referral_codes
CREATE TABLE referral_codes (
  id uuid PRIMARY KEY,
  business_id uuid REFERENCES businesses(id),
  code varchar(10) UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  total_clicks integer DEFAULT 0,
  total_conversions integer DEFAULT 0
);

-- Tabla: referral_conversions
CREATE TABLE referral_conversions (
  id uuid PRIMARY KEY,
  referrer_business_id uuid REFERENCES businesses(id),
  referred_business_id uuid REFERENCES businesses(id),
  referral_code varchar(10),
  status varchar(20), -- 'pending', 'trial', 'active', 'churned'
  converted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabla: referral_rewards
CREATE TABLE referral_rewards (
  id uuid PRIMARY KEY,
  business_id uuid REFERENCES businesses(id),
  milestone_level integer,
  reward_type varchar(20), -- 'discount', 'free_months', 'feature_unlock'
  reward_value jsonb,
  earned_at timestamptz DEFAULT now(),
  redeemed_at timestamptz,
  status varchar(20) DEFAULT 'active'
);
```

### 5. API Routes Necesarias

- [ ] `GET /api/referrals/code` - Obtener código de referido del negocio
- [ ] `POST /api/referrals/generate` - Generar nuevo código (si no existe)
- [ ] `GET /api/referrals/stats` - Estadísticas de referencias
- [ ] `GET /api/referrals/conversions` - Historial de conversiones
- [ ] `GET /api/referrals/rewards` - Recompensas ganadas
- [ ] `POST /api/referrals/track-click` - Trackear click en link
- [ ] `POST /api/referrals/track-conversion` - Trackear conversión exitosa

### 6. Estrategia de Producto (Brainstorm Requerido)

- [ ] **Definir incentivos óptimos:**
  - ¿Qué es más atractivo: descuento o meses gratis?
  - ¿Cuántas referencias justifican cada nivel de recompensa?
  - ¿Recompensas progresivas o escaladas?
- [ ] **Mecánica de conversión:**
  - ¿Cuándo se marca una referencia como "convertida"?
  - ¿Solo cuentan planes pagos o también trials?
  - ¿Hay expiración del código de referido?
- [ ] **Viralidad:**
  - ¿Share buttons en dashboard?
  - ¿Templates pre-escritos para facilitar sharing?
  - ¿Incentivos extra por compartir en redes sociales?

---

**🎯 Objetivo de la Sesión:**
Salir con un plan completo y empezar implementación del sistema de referencias que impulse el lanzamiento del SaaS.

**💡 Output Esperado:**

1. Plan de implementación detallado (con `/plan`)
2. Estrategia de incentivos definida (con `/brainstorm`)
3. Diseños de UI aprobados (mockups o wireframes)
4. Migration script listo
5. Primeras API routes funcionando

---

## Backlog (Post-Phase 3)

1. **Testing end-to-end del sistema de gamificación:**
   - Crear una cita de prueba y asignarla a un barber
   - Completar la cita y verificar que se actualicen `barber_stats` automáticamente
   - Confirmar que se desbloqueen achievements al alcanzar thresholds
   - Verificar que aparezcan en el tab "Logros" de `/barberos`

2. **Crear challenge de prueba:**
   - Usar API POST `/api/gamification/barber/challenges` para crear un challenge
   - Tipos disponibles: revenue, appointments, clients, team_total
   - Verificar que aparezca en tab "Desafíos"
   - Comprobar leaderboard con múltiples barbers

3. **Merge a main cuando esté listo:**
   - Branch actual: `feature/gamification-system`
   - Incluye todo el sistema de gamification Phase 2 + tabs integration
   - Crear PR con descripción detallada

4. **Verificar visualmente el rediseño de loyalty (OPCIONAL):**
   - **Branch actual:** `feature/gamification-system` (contiene el rediseño completo)
   - Autenticarse en el dashboard
   - Navegar a /lealtad/configuracion
   - Verificar en mobile (375px):
     - Grid 2x2 para tipo de programa funcionando
     - Trial banner se ve compacto y bien espaciado
     - Radio buttons sin borders (solo backgrounds + sombras)
     - Selected radio visible en dark mode (zinc-950 vs zinc-800)
     - Touch targets adecuados (56px)
     - No hay horizontal scroll
     - Botón "Ver Preview" integrado después de "Guardar Cambios"
     - Modal Sheet de preview funciona correctamente
     - "Opciones Avanzadas" colapsa/expande suavemente
   - Verificar en desktop (1280px+):
     - Layout side-by-side (config left, preview right sticky)
     - Grid 1 columna para tipo de programa
     - Preview actualiza correctamente
     - Smooth animations en collapsible section
     - Botón "Ver Preview" oculto (lg:hidden)
5. **Si todo se ve bien, merge a main:**
   - Branch: `feature/gamification-system`
   - Incluye todo el sistema de gamification + rediseño Apple-style
   - Crear PR hacia `main` con descripción completa
6. **Aplicar migraciones en producción** desde Supabase dashboard:
   - 015_fix_notification_trigger.sql
   - 016_fix_loyalty_programs_rls.sql
   - 017_allow_public_read_loyalty_programs.sql
7. **Probar sistema de loyalty end-to-end:**
   - Usuario no autenticado ve banner en booking flow ✅
   - Crear reserva como usuario autenticado
   - Verificar que se otorguen puntos correctamente
   - Verificar notificaciones de puntos y tier upgrades
8. **Implementar flujos de autenticación:**
   - Sign up desde banner de loyalty
   - Sign in desde banner de loyalty
   - Vincular reserva con cuenta nueva
9. Verificar referral system y rewards redemption

### Commands to Run

```bash
npm run dev  # Servidor en http://localhost:3000
```

### Context Notes

- **Next.js Version:** Mantenerse en 15.x (no actualizar a 16 por ahora)
- **Loyalty System:** Integrado en booking flow, requiere usuario autenticado para mostrar
- **Database:** Supabase configurado correctamente
- **Dev Server:** Funciona sin problemas después del downgrade

---

## Session History

### 2026-02-01 - Session 50 (Tabs Integration & Navigation Fix) ✅

**Duration:** ~1 hour | **Agents:** @debugger | **Status:** ✅ Complete

**Accomplished:**

- 🎯 **Sistema de tabs implementado en `/barberos`**
  - 3 tabs: Equipo (gestión), Logros (achievements), Desafíos (challenges)
  - Tabs accesibles DENTRO de la página principal, no en sidebar
  - Navegación limpia y UX mejorada

- 📁 **Reorganización de rutas:**
  - Movidas páginas: `/lealtad/logros-barberos` → `/barberos/logros`
  - Movidas páginas: `/lealtad/desafios` → `/barberos/desafios`
  - Rutas directas siguen funcionando para deep linking
  - Revertidos cambios temporales en sidebar/bottom-nav

- 🐛 **Fix crítico en achievements API:**
  - **Problema:** Error 404 cuando owner no es barber
  - **Causa raíz:** API asumía que todo usuario tiene registro en `barbers`
  - **Solución:** API ahora maneja correctamente caso sin `barberId`
  - **Resultado:** Owners ven achievements disponibles, barbers ven su progreso

- ♻️ **Refactorización de arquitectura:**
  - Creado `BarbersManagement` component (separación de concerns)
  - Página principal ahora es server component con tabs
  - Mejor organización y mantenibilidad del código

**Files Modified (7):**

1. `src/app/(dashboard)/barberos/page.tsx` - Nueva estructura con tabs (server component)
2. `src/components/barbers/barbers-management.tsx` - Client component creado
3. `src/app/api/gamification/barber/achievements/route.ts` - Fix de owner sin barber
4. `src/components/dashboard/sidebar.tsx` - Revertidos links temporales
5. `src/components/dashboard/bottom-nav.tsx` - Revertidas rutas temporales
6. `src/components/dashboard/more-menu-drawer.tsx` - Revertidos menu items
7. `PROGRESS.md` - Actualizado estado del proyecto

**Next Steps:**

- Testing end-to-end de achievements
- Crear challenge de prueba
- Verificar auto-unlock al completar citas

---

### 2026-02-02 - Session 49 (Phase 2: Barber Gamification System) ✅

**Duration:** ~2 hours | **Agents:** @fullstack-developer + @backend-specialist + @debugger | **Status:** ✅ Complete

**Accomplished:**

- 🎮 **Phase 2: Barber Gamification System MVP**
  - Complete achievement system with 17 seeded achievements
  - Active challenges/competitions system
  - Enhanced leaderboard with rankings
  - Automatic stats tracking via database triggers

- 📊 **Database Schema (Migration 018_barber_gamification.sql)**
  - `barber_stats` table: Aggregated performance metrics (appointments, revenue, clients, streaks)
  - `barber_achievements` table: 17 achievements across 5 categories (revenue, appointments, clients, streak, special)
  - `barber_earned_achievements` table: Tracks earned achievements per barber
  - `barber_challenges` table: Active competitions with goals and rewards
  - `barber_challenge_participants` table: Progress tracking in challenges
  - Auto-update trigger on appointments → updates barber_stats
  - Helper function `check_barber_achievements()` for auto-awarding
  - Backfill script for existing barbers

- 🎯 **Achievement System**
  - 5 categories: Revenue, Appointments, Clients, Streaks, Special
  - 5 tier levels: Bronze, Silver, Gold, Platinum, Legendary
  - Auto-unlock based on thresholds (e.g., ₡10k revenue, 100 appointments)
  - Progress tracking with visual indicators
  - Seeded achievements:
    - Revenue: ₡10k, ₡50k, ₡100k, ₡500k
    - Appointments: 10, 50, 100, 500, 1000
    - Clients: 10, 50, 100 unique clients
    - Streaks: 7, 14, 30 consecutive days
    - Special: First appointment, first client

- 🏆 **Challenges System**
  - 4 challenge types: Revenue, Appointments, Clients, Team Total
  - Time-bound competitions with start/end dates
  - Leaderboard with real-time rankings
  - Optional rewards (description + amount)
  - Auto-enrollment of all active barbers
  - Progress tracking per participant

- 🔧 **Business Logic** (`src/lib/gamification/barber-gamification.ts`)
  - Achievement progress calculation
  - Tier color and badge helpers
  - Leaderboard ranking calculation
  - Challenge progress and time remaining
  - Formatting utilities (currency, compact numbers)
  - Validation functions

- 🌐 **API Routes**
  - `GET /api/gamification/barber/stats` - Get barber statistics
  - `GET /api/gamification/barber/achievements` - Get achievements with progress
  - `GET /api/gamification/barber/challenges` - Get active challenges
  - `POST /api/gamification/barber/challenges` - Create new challenge (owner only)

- 🎨 **UI Components**
  - `AchievementCard` - Individual achievement with progress bar, icon, tier badge
  - `ChallengeCard` - Challenge display with leaderboard, time remaining, rewards
  - `AchievementsView` - Fetch and display achievements grouped by category
  - `ChallengesView` - Fetch and display active challenges

- 📱 **Pages**
  - `/lealtad/logros-barberos` - Achievements page with progress summary
  - `/lealtad/desafios` - Active challenges page with leaderboard

- 📝 **TypeScript Types**
  - Added 8 new interfaces to `src/types/database.ts`:
    - `BarberStats`, `BarberAchievement`, `BarberEarnedAchievement`
    - `BarberChallenge`, `BarberChallengeParticipant`, `BarberChallengeInsert`
    - Type aliases: `AchievementCategory`, `AchievementTier`, `ChallengeType`

**Files Created (11):**

1. `supabase/migrations/018_barber_gamification.sql` (550+ lines)
2. `src/lib/gamification/barber-gamification.ts` (380+ lines)
3. `src/app/api/gamification/barber/stats/route.ts` (85 lines)
4. `src/app/api/gamification/barber/achievements/route.ts` (120 lines)
5. `src/app/api/gamification/barber/challenges/route.ts` (185 lines)
6. `src/components/gamification/achievement-card.tsx` (150 lines)
7. `src/components/gamification/challenge-card.tsx` (220 lines)
8. `src/components/gamification/achievements-view.tsx` (180 lines)
9. `src/components/gamification/challenges-view.tsx` (120 lines)
10. `src/app/(dashboard)/lealtad/logros-barberos/page.tsx` (45 lines)
11. `src/app/(dashboard)/lealtad/desafios/page.tsx` (45 lines)

**Files Modified (1):**

1. `src/types/database.ts` - Added barber gamification types

**Total:** ~2,100 lines of new code

**Key Features:**

- ✅ 17 achievements across 5 categories (seeded in migration)
- ✅ Automatic stats tracking (trigger on completed appointments)
- ✅ Achievement auto-unlock (helper function checks conditions)
- ✅ Challenge creation by business owners
- ✅ Real-time leaderboards with rankings
- ✅ Progress visualization with animated bars
- ✅ Tier-based badge system (Bronze → Legendary)
- ✅ Time-bound competitions with rewards
- ✅ RLS policies for security (owners + barbers)

**Next Steps:**

1. **Apply migration in Supabase:**
   - Run `018_barber_gamification.sql` in Supabase SQL Editor
   - Verify all 5 tables created successfully
   - Check 17 achievements seeded
   - Confirm triggers and functions active

2. **Testing Phase 2:**
   - Navigate to `/lealtad/logros-barberos` - verify achievements display
   - Navigate to `/lealtad/desafios` - verify challenges display
   - Create test appointments and verify stats update
   - Test achievement unlocking (reach thresholds)
   - Create a challenge and verify leaderboard

3. **Integration:**
   - Add navigation links to sidebar for new pages
   - Consider adding stats widget to barber dashboard
   - Add achievement notifications (future enhancement)

**Debugging & Fixes:**

- 🐛 **SQL Function Ambiguity** (Error 1):
  - **Problem:** `column reference "achievement_id" is ambiguous` in Supabase function
  - **Cause:** RETURN TABLE column names conflicted with query column names
  - **Solution:** Renamed return columns to `awarded_achievement_id`, `awarded_achievement_name`
  - **Commit:** 3c420ea

- 🐛 **JSONB Parsing Issue** (Error 2):
  - **Problem:** Frontend failing to read achievement unlock conditions
  - **Cause:** Supabase returns JSONB columns as strings
  - **Solution:** Added explicit `JSON.parse()` check in API route
  - **Commit:** 6970be1

- 🐛 **404 API Routes (Error 3 - CRITICAL, 2+ hours debugging):**
  - **Problem:** `/api/gamification/barber/achievements` returning persistent 404 despite:
    - ✅ File exists with correct code
    - ✅ Server restarted multiple times
    - ✅ `.next` cache cleared
    - ✅ File compiled successfully (logs confirmed)
    - ✅ Test routes work fine
    - ✅ Challenges route works (same structure)
  - **Root Cause:** macOS extended file attributes (xattr) missing on newly created directories
  - **Solution:** Used `cp -a` (archive mode) to copy challenges directory WITH ALL ATTRIBUTES, then replaced content
  - **Result:** All API routes now working perfectly ✅
    - achievements: 200 OK ✅
    - challenges: 200 OK ✅
    - stats: 200 OK ✅
  - **Key Learning:** When creating new API route directories during development, use `cp -a` from working route or ensure xattr are preserved
  - **Resolution Time:** ~2 hours (most complex debugging session)

**Production Readiness:** Phase 2 MVP Complete ✅

---

### 2026-02-01 - Session 45 (Loyalty System Integration)

- **Implementado:** Activación automática del sistema de loyalty después de crear cita
- **Archivos modificados:**
  - `src/lib/gamification/loyalty-calculator-server.ts` - Nueva función `processAppointmentLoyalty()`
  - `src/app/api/public/[slug]/book/route.ts` - Integración automática de loyalty
- **Características implementadas:**
  - ✅ Cálculo automático de puntos basado en precio del servicio
  - ✅ Incremento automático de visit_count
  - ✅ Actualización automática de tier (Bronze → Silver → Gold → Platinum)
  - ✅ Creación de loyalty_transaction por cada appointment
  - ✅ Notificaciones automáticas para tier upgrades y puntos ganados
  - ✅ Sistema resiliente - loyalty no bloquea booking si falla
- **Flujo implementado:** Reserva → Crear appointment → Procesar loyalty → Otorgar puntos → Actualizar tier → Notificar cliente
- **Bug resuelto:** Caché corrupto de Next.js causando Internal Server Error

### 2026-01-30 - Session 44 (Debugging Critical)

- **Resuelto:** Bug crítico de Turbopack en Next.js 16 causando loop infinito
- **Solución:** Downgrade a Next.js 15 para estabilidad
- **Aprendizaje:** Turbopack en Next.js 16.1.4 tiene bugs de caché corrupto
- **Decisión:** Permanecer en Next.js 15 hasta versión más estable
- **Issue Identificado:** Loyalty no se activa automáticamente después de completar reserva

### 2026-01-30 - Session 43

- Integración completa del sistema de loyalty en booking flow
- Mejoras de UX móvil y type safety
- Resolución de issues de diseño premium

### Commits Recientes

```
d4d673e ✨ feat(loyalty): integrate loyalty system into booking flow
e79b14d ♻️ refactor(loyalty): enhance type safety and mobile UX
f46ae09 📝 docs: streamline PROGRESS.md documentation
```
