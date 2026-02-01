# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** BarberShop Pro
- **Stack:** Next.js 15, React 19, TypeScript, Supabase, TailwindCSS, Framer Motion
- **Database:** PostgreSQL (Supabase)
- **Last Updated:** 2026-02-01 11:55 PM

---

## What's Built

### Completed Features

- [x] Sistema de reservas online público (/reservar/[slug])
- [x] Dashboard administrativo para barberías
- [x] Sistema de gamificación y loyalty
  - Puntos por visitas
  - Tiers (Bronze, Silver, Gold, Platinum)
  - Códigos de referidos
  - Recompensas y descuentos
- [x] Integración de loyalty en booking flow
- [x] PWA y branding personalizable
- [x] Notificaciones automáticas

### In Progress

- [ ] Aplicar migración 015_fix_notification_trigger.sql manualmente en Supabase dashboard
- [ ] Testing end-to-end del sistema de loyalty

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

1. **Verificar visualmente el rediseño de loyalty config (PRIORITARIO):**
   - Autenticarse en el dashboard
   - Navegar a /lealtad/configuracion
   - Verificar en mobile (375px):
     - Trial banner se ve compacto y bien espaciado
     - Radio buttons de tipo sin borders (solo backgrounds + sombras)
     - Selected radio visible en dark mode con gris (zinc-950 vs zinc-800)
     - Type selector tiene touch targets adecuados (56px)
     - No hay horizontal scroll
     - Botón "Ver Preview" integrado después de "Guardar Cambios" (NO flotante)
     - Modal Sheet de preview se abre correctamente
     - "Opciones Avanzadas" colapsa/expande suavemente
   - Verificar en desktop (1280px+):
     - Layout side-by-side (config left, preview right sticky)
     - Preview actualiza con debounce (500ms)
     - Smooth animations en collapsible section
     - Botón "Ver Preview" oculto (lg:hidden)
2. **Si todo se ve bien, considerar merge a main:**
   - Branch: feature/loyalty-config-apple-redesign
   - 5 commits ready
   - Crear PR con descripción del redesign
3. **Aplicar migraciones en producción** desde Supabase dashboard:
   - 015_fix_notification_trigger.sql
   - 016_fix_loyalty_programs_rls.sql
   - 017_allow_public_read_loyalty_programs.sql
4. **Probar sistema de loyalty end-to-end:**
   - Usuario no autenticado ve banner en booking flow ✅
   - Crear reserva como usuario autenticado
   - Verificar que se otorguen puntos correctamente
   - Verificar notificaciones de puntos y tier upgrades
5. **Implementar flujos de autenticación:**
   - Sign up desde banner de loyalty
   - Sign in desde banner de loyalty
   - Vincular reserva con cuenta nueva
6. Verificar referral system y rewards redemption

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
