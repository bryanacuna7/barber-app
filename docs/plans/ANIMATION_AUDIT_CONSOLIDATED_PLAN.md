# Animation Audit Master Plan (Consolidado)

Version: 2.0
Fecha: 2026-02-27
Estado: Ready to Execute (plan actualizado con hallazgos de investigacion)
Cobertura: Mobile + Desktop
Enfoque: “Premium y sutil” (estilo Apple HIG), sin regresiones funcionales
Cambios v2: Anexos B-E expandidos con hallazgos de 4 agentes de investigacion paralelos

## 1) Objetivo

Ejecutar una auditoria completa de animaciones para identificar inconsistencias, anti-patrones y oportunidades de polish, y cerrar los gaps con un criterio uniforme de calidad visual, accesibilidad y performance.

## 2) Resultado esperado

Al finalizar, la app debe tener:

- Animaciones coherentes entre componentes y rutas.
- Jerarquia de movimiento clara (navegacion, overlays, microinteracciones).
- Comportamiento consistente en mobile y desktop.
- Respeto a `prefers-reduced-motion`.
- Performance estable (animaciones basadas en `transform` y `opacity` cuando aplique).

## 3) Principios de calidad (Apple-like)

- Sutileza: sin efectos llamativos ni rebotes excesivos.
- Continuidad: entrada/salida conectadas visualmente.
- Fisica consistente: springs y duraciones estables.
- Feedback inmediato: `tap` claro y breve en mobile.
- Accesibilidad: reducir movimiento sin romper comprension.
- Performance: evitar animar propiedades de layout costosas.

## 4) Scope

Incluye:

- UI base (`ui/*`) con impacto global.
- Flujos operativos principales: dashboard, citas, mi-dia.
- Flujos de autenticacion y reservas publicas.
- Vistas admin de uso diario.
- Estados de loading/error/empty, overlays y transiciones de listas.

Excluye (en este pass):

- Rebranding visual.
- Reescritura total de animaciones landing marketing.
- Efectos decorativos no funcionales.

## 5) Criterios de auditoria (dimensiones)

Cada superficie se evalua en escala 0-5 por dimension:

1. Consistencia de tokens de movimiento
2. Calidad de entrada/salida (incluye exit animation real)
3. Microinteracciones (hover/tap/focus/drag)
4. Accesibilidad de movimiento (`prefers-reduced-motion`)
5. Focus/scroll correctness (modals, drawers, overlays)
6. Performance (propiedades animadas, jank, layout thrash)
7. Claridad semantica del movimiento (el movimiento explica estado/cambio)
8. Calidad cross-platform (mobile + desktop)

Score total recomendado:

- 4.5–5.0: Premium
- 3.8–4.4: Muy bueno, requiere polish menor
- 3.0–3.7: Aceptable, requiere correcciones importantes
- <3.0: Deficiente, requiere rediseño de motion

## 6) Matriz de cobertura (rutas y superficies)

Cobertura minima obligatoria:

| Area                | Rutas                                                        | Prioridad |
| ------------------- | ------------------------------------------------------------ | --------- |
| Dashboard operativo | `/dashboard`, `/citas`, `/mi-dia`, `/clientes`               | P0        |
| Auth                | `/login`, `/register`, `/forgot-password`, `/reset-password` | P1        |
| Reservas publicas   | `/reservar/[slug]`, `/track/[token]`                         | P0        |
| Admin               | `/admin`, `/admin/pagos`, `/admin/negocios`                  | P2        |
| Configuracion       | `/configuracion/*`                                           | P2        |
| Shared UI           | `ui/*`, `dashboard/*`, `appointments/*`, `barber/*`          | P0        |

Breakpoints obligatorios:

- Mobile: 390x844 (iPhone), 375x812 (fallback), 360x800 (Android baseline)
- Desktop: 1440x900

Preferencias de sistema:

- `prefers-reduced-motion: no-preference`
- `prefers-reduced-motion: reduce`

## 7) Metodologia de ejecucion (end-to-end)

### Fase 0: Baseline y preparacion

1. Confirmar motion tokens existentes en:

- `src/lib/design-system.ts` (fuente ACTIVA — springs, durations, easing, reducedMotion)
- `src/lib/constants/animations.ts` (legacy — SCALE, TRANSLATE, ROTATE, VARIANTS)
- `src/components/ui/motion.tsx` (10 componentes reutilizables con reduced-motion)
- `src/components/ui/page-transition.tsx` (PageTransition, StaggerContainer, RevealOnScroll)
- `src/app/globals.css` (16 keyframes, 3 CSS duration vars, 3 easing vars, 3 reduced-motion media queries)

Ver Anexo C para inventario completo de tokens.

2. Definir baseline visual por tipo de componente:

- Modal/Drawer/Sheet
- Button/FAB
- Collapsible/Accordion
- Dropdown/Command Palette
- Cards/Lists

3. Establecer formato unico para hallazgos (ver seccion 14).

### Fase 1: Inventario automatico (estatico)

Objetivo: detectar hotspots y deuda de motion.

Comandos sugeridos:

```bash
rg -n "transition-all|animate-|@keyframes|whileHover|whileTap|AnimatePresence|useReducedMotion" src
rg -n "return null" src/components/ui | rg -n "modal|drawer|sheet|popover"
rg -n "height: 'auto'|layout|motion\\." src/components src/app
```

Clasificar resultados en:

- Riesgo alto: overlays sin exit animation, focus restore incompleto, scroll lock inseguro.
- Riesgo medio: `transition-all` en componentes de alto uso.
- Riesgo bajo: polish menor o inconsistencias de timing.

### Fase 2: Auditoria manual por flujo (desktop + mobile)

Para cada ruta critica:

1. Evaluar `enter`, `exit`, `interaction`, `error`, `empty`, `loading`.
2. Registrar evidencia visual con **Chrome DevTools MCP** (`mcp__chrome-devtools__take_screenshot`) + nota breve.
3. Puntuar dimensiones 1-8.
4. Listar issues con severidad P0/P1/P2.

Checklist por flujo:

- Navegacion inicial a la pantalla.
- Apertura/cierre de overlays.
- Interacciones repetidas rapidas.
- Estados vacios y estados con data.
- Cambios de filtro y cambios de vista.
- Gestos/taps en mobile.

### Fase 3: Accesibilidad de movimiento

Con `prefers-reduced-motion: reduce`:

- Verificar que desaparecen springs largos y desplazamientos amplios.
- Mantener feedback minimo (opacity breve) para no perder contexto.
- Confirmar que la UX sigue entendible sin transiciones complejas.

### Fase 4: Performance de animacion

Umbral: >= 58 FPS en interacciones frecuentes (mobile low-end como referencia).

Validar:

- Sin animaciones de `width/height/top/left` salvo casos justificados (excepcion: `collapsible-section.tsx` height:auto con overflow:hidden).
- Sin layout thrash por efectos tipo ripple (ya eliminado: ripple removido de button + globals.css).
- Sin `transition-all` donde alcance con propiedades explicitas (49 archivos detectados, ver Anexo E.1).
- Fluidez percibida en interacciones frecuentes.
- `boxShadow` en hover solo via GPU-safe approach (card.tsx combina scale+y+boxShadow).
- `backdrop-filter: blur` estatico, nunca animado (drawer, command-palette, sheet).
- Stagger chains no excedan 800ms total (horario/page.tsx tiene 24 items x 50ms = 1.2s, reducir a 30ms).

### Fase 5: Priorizacion y plan de fix

Agrupar hallazgos:

- P0: rompe percepcion de calidad o accesibilidad (overlay/focus/scroll/exit).
- P1: inconsistencias visibles de jerarquia o feedback.
- P2: mejoras finas de polish.

Plan de entrega en lotes:

1. Lote global `ui/*`
2. Lote rutas P0
3. Lote rutas P1/P2
4. Regression pass final

### Fase 6: Cierre

Definition of done:

- Sin hallazgos P0 abiertos.
- Hallazgos P1 con plan aceptado o corregidos.
- Score promedio >= 4.5 en rutas P0.
- `prefers-reduced-motion` validado.
- Lint y pruebas de regresion visual sin incidentes criticos.

## 8) Checklist consolidada Mobile vs Desktop

### Mobile checklist

- No hover-dependencia.
- `tap` feedback breve y consistente.
- Gestos (swipe/drag/pull) sin conflicto visual.
- Overlays con cierre claro y sin “jump”.
- Scroll lock correcto durante exit animation.
- Teclado/safe-area sin desplazamientos bruscos.
- Duraciones mas cortas que desktop cuando aplique.

### Desktop checklist

- Hover/focus discretos, no exagerados.
- Navegacion entre vistas con continuidad.
- Dropdowns/modals/command palette con apertura/cierre coherente.
- Stagger de listas solo cuando agrega claridad.
- Sin acumulacion de efectos al mover mouse rapido.

### Checklist comun

- Misma familia de easing/spring por tipo de componente.
- Reduced-motion funcional.
- Sin `transition-all` innecesario.
- Sin bloqueos de foco al cerrar overlays.

## 9) Casos de prueba obligatorios

### Overlays (Modal/Drawer/Sheet)

1. Abrir con teclado (Enter/Espacio) y con click/tap.
2. Cerrar por boton, `Esc`, click en backdrop.
3. Verificar exit animation visible.
4. Verificar focus restore al trigger original.
5. Verificar body scroll lock durante todo el cierre.

### Buttons/FAB

1. Tap rapido repetido (no doble animacion erratica).
2. Hover desktop sutil (sin escalados bruscos).
3. Sin ripple MD en componentes iOS-like.

### Collapsible

1. Expand/collapse con transicion de altura fluida.
2. Sin salto de layout abrupto.
3. En desktop `alwaysVisibleAbove`: estado estable y sin flicker.
4. Reduced-motion: instant o transicion minima.

### Dropdown (NUEVO — P0)

1. Abrir dropdown: verificar animacion de entrada (actualmente CSS-only, sin framer-motion).
2. Cerrar dropdown: verificar exit animation visible (actualmente NO existe — desaparece instantaneamente).
3. Verificar con `prefers-reduced-motion: reduce` (actualmente NO respetado).
4. Verificar focus restore al trigger original al cerrar con Esc.
5. Verificar que scroll del body no ocurre durante dropdown abierto.
6. Keyboard: Arrow Up/Down para navegar items, Enter para seleccionar.

### Command Palette (NUEVO — P1)

1. Abrir con Cmd+K: verificar backdrop + panel animation.
2. Cerrar con Esc: verificar exit animation visible (existe pero hardcoded).
3. Verificar scroll lock del body durante apertura (actualmente NO existe).
4. Verificar que tokens de `design-system.ts` se usan (actualmente hardcoded `duration: 0.2`).
5. Verificar `layoutId` indicator: no causa jank al navegar rapido con Arrow keys.
6. Abrir/cerrar 5x rapido: sin animaciones fantasma o acumuladas.

### Listas y cards

1. Entradas/salidas de items con continuidad.
2. Cambios de filtro sin parpadeo o relayout agresivo.
3. Drag/sort sin ghosting raro.

### Overlay rapid-cycle test (NUEVO)

1. Abrir y cerrar modal 5x rapido: sin animaciones fantasma, focus correcto.
2. Abrir drawer, drag-to-dismiss: verificar snap-back animado (actualmente instantaneo).
3. Abrir command palette, navegar con arrows, cerrar con Esc: focus restore.

## 10) Reglas de implementacion para fixes

- Preferir `AnimatePresence` para ciclos enter/exit reales (TODOS los overlays).
- Preferir `transform` y `opacity` (GPU-only properties).
- Evitar `transition-all` — usar propiedades explicitas (`transition-colors`, `transition-transform`, etc.).
- Reusar tokens de `design-system.ts` (fuente activa) o `animations.ts` (legacy).
- NUNCA hardcodear `duration`, `ease`, o spring values — siempre usar tokens.
- `whileTap` para mobile, `whileHover` solo en desktop (nunca ambos sin check).
- No introducir nuevos estilos de animacion ad-hoc sin token.
- Documentar excepciones tecnicas en comentario corto.
- Focus restore: guardar `document.activeElement` antes de abrir overlay, restaurar en `onExitComplete`.
- Scroll lock: `document.body.style.overflow = 'hidden'` on open, clear en `onExitComplete` (no antes).

## 11) Riesgos y mitigaciones

- Riesgo: cambios globales rompen casos edge de overlays.
  - Mitigacion: regression manual en 3 rutas criticas + test smoke.
- Riesgo: dual-render en collapsible con children stateful.
  - Mitigacion: limitar a consumers de children estaticos o migrar a single-render con media query hook.
- Riesgo: visual drift entre mobile y desktop.
  - Mitigacion: validar ambos breakpoints en cada fix.
- Riesgo: dropdown refactor (P0) rompe SelectDropdown consumers.
  - Mitigacion: mantener API publica identica, solo cambiar internals de animacion.
- Riesgo: scroll lock en command-palette interfiere con input search scroll.
  - Mitigacion: scroll lock solo en body, no en el contenedor del palette.
- Riesgo: dos fuentes de tokens divergen (animations.ts vs design-system.ts).
  - Mitigacion: usar design-system.ts como fuente activa, migrar refs a animations.ts cuando se toquen.
- Riesgo: StaggeredList duplicado (motion.tsx vs page-transition.tsx) causa inconsistencias.
  - Mitigacion: unificar en motion.tsx, re-exportar desde page-transition.tsx.

## 12) Entregables (en este mismo pass de auditoria)

1. Scorecard consolidada por ruta/componente.
2. Lista priorizada de hallazgos P0/P1/P2.
3. Matriz before/after por cada fix aprobado.
4. Evidencia visual (capturas y notas de comportamiento).
5. Resumen ejecutivo final con recomendacion Go/No-Go.

## 13) Cronograma sugerido

- Dia 1: Fase 0 + Fase 1 + inicio Fase 2 (P0).
- Dia 2: Fase 2 completa + Fase 3 + Fase 4.
- Dia 3: Fase 5 (fixes P0/P1) + Fase 6 cierre.

## 14) Plantillas de trabajo (usar tal cual)

### 14.1 Template de hallazgo

```md
ID: MOT-###
Ruta/Componente:
Plataforma: Mobile | Desktop | Ambos
Severidad: P0 | P1 | P2
Dimension afectada: (1-8)
Problema:
Impacto UX:
Evidencia:
Causa probable:
Fix recomendado:
Estado: Open | In Progress | Fixed | Won't Fix
```

### 14.2 Template de score por ruta

```md
Ruta:
Mobile score:
Desktop score:
Dim 1:
Dim 2:
Dim 3:
Dim 4:
Dim 5:
Dim 6:
Dim 7:
Dim 8:
Promedio:
Notas:
```

### 14.3 Template de cierre

```md
P0 abiertos: #
P1 abiertos: #
P2 abiertos: #
Promedio rutas P0:
Reduced-motion: Pass/Fail
Focus restore overlays: Pass/Fail
Scroll lock overlays: Pass/Fail
Decision: GO | NO-GO
```

## 15) Criterio final de “premium y sutil”

La app puede considerarse “premium y sutil” cuando:

- El movimiento no distrae ni compite con el contenido.
- Las transiciones explican cambio de estado en lugar de decorarlo.
- No hay inconsistencias entre pantallas clave.
- Mobile y desktop se sienten parte del mismo sistema.
- `prefers-reduced-motion` mantiene usabilidad completa.

---

## Anexo A: Comandos de apoyo

```bash
# Inventario rapido de patrones de motion
rg -n "transition-all|whileHover|whileTap|AnimatePresence|useReducedMotion|animate-" src

# Focos de overlays en ui
rg -n "modal|drawer|sheet|popover|dialog" src/components/ui

# Lugares con potencial layout-heavy animation
rg -n "width|height|top|left|filter|backdrop-filter" src/components src/app
```

## Anexo B: Scope de ejecucion inmediata (con hallazgos pre-audit)

### B.1 Componentes ya en scope (confirmados)

| #   | Componente                   | Score estimado | Issues principales                                         |
| --- | ---------------------------- | -------------- | ---------------------------------------------------------- |
| 1   | `ui/modal.tsx`               | 4.0            | Usar tokens de `animations.ts`, verificar exit real        |
| 2   | `ui/button.tsx`              | 3.5            | `transition-all` presente, migrar a propiedades explicitas |
| 3   | `ui/collapsible-section.tsx` | 3.5            | Height animation (layout-heavy), dual-render risk          |
| 4   | `ui/fab.tsx`                 | 3.8            | Verificar tap feedback, `transition-all`                   |

### B.2 Componentes FALTANTES (agregados post-investigacion)

| #   | Componente                              | Score estimado | Issues principales                                                                                                                          | Prioridad   |
| --- | --------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 5   | `ui/drawer.tsx`                         | 4.2            | Bueno: AnimatePresence, drag-to-dismiss, scroll lock, reduced-motion. Falta: focus restore al trigger original                              | P1          |
| 6   | `ui/dropdown.tsx`                       | 2.0            | CRITICO: CSS `animate-in` sin AnimatePresence, SIN exit animation, SIN reduced-motion, SIN focus management                                 | P0          |
| 7   | `dashboard/command-palette.tsx`         | 3.5            | Tiene AnimatePresence pero: hardcoded `duration: 0.2` y ease en vez de tokens, SIN reduced-motion, SIN scroll lock, `layoutId` en indicator | P1          |
| 8   | `ui/page-transition.tsx`                | 4.5            | Bueno: AnimatePresence mode="wait", reduced-motion, design-system tokens. Contiene tambien StaggerContainer, StaggerItem, RevealOnScroll    | P2 (polish) |
| 9   | `ui/sheet.tsx`                          | ~3.5           | Verificar: exit animation, focus restore, scroll lock                                                                                       | P1          |
| 10  | `ui/toast.tsx` + `toast-refactored.tsx` | ~3.5           | Dos implementaciones coexisten — verificar cual es activa, reduced-motion                                                                   | P2          |

### B.3 `transition-all` hotspots (49 archivos detectados)

Archivos de alto impacto para migrar primero (componentes base reutilizados):

- `ui/radio-group.tsx`
- `ui/ios-date-picker.tsx`
- `ui/ios-time-picker.tsx`
- `ui/color-picker.tsx`
- `ui/progress.tsx`
- `appointments/appointment-card.tsx`
- `appointments/appointment-filters.tsx`
- `appointments/appointment-form.tsx`

Regla: reemplazar `transition-all` por propiedades explicitas (`transition-colors`, `transition-opacity`, `transition-transform`, o combinacion).

## Anexo C: Inventario de tokens existentes (baseline)

### C.1 Fuente: `src/lib/constants/animations.ts`

**Springs:**

| Token           | Stiffness | Damping | Uso recomendado                      |
| --------------- | --------- | ------- | ------------------------------------ |
| `spring.quick`  | 400       | 30      | Feedback tactil (buttons, toggles)   |
| `spring.smooth` | 300       | 24      | Transiciones fluidas (cards, modals) |
| `spring.bouncy` | 500       | 20      | Personalidad (empty states, success) |
| `spring.gentle` | 200       | 17      | Floating (icons, badges)             |

**Duraciones:**

| Token                 | Valor | Uso                |
| --------------------- | ----- | ------------------ |
| `DURATION.modal`      | 0.25s | Modal open/close   |
| `DURATION.drawer`     | 0.3s  | Drawer slide       |
| `DURATION.toast`      | 0.3s  | Toast enter/exit   |
| `DURATION.ripple`     | 0.6s  | Touch feedback     |
| `TRANSITIONS.fast`    | 150ms | Hover states       |
| `TRANSITIONS.default` | 200ms | Standard           |
| `TRANSITIONS.slow`    | 300ms | Complex animations |

**Easings:**

| Token               | Valor                    | Uso                    |
| ------------------- | ------------------------ | ---------------------- |
| `easing.easeOut`    | [0.16, 1, 0.3, 1]        | Mayoria de animaciones |
| `easing.easeInOut`  | [0.43, 0.13, 0.23, 0.96] | Transiciones complejas |
| `easing.emphasized` | [0.05, 0.7, 0.1, 1]      | CTAs                   |

**Variants predefinidos:** `fade`, `slideUp`, `slideLeft`, `scale`, `stagger`, `staggerItem`

**Hover/Tap presets:** `HOVER_VARIANTS.card/button/icon/link`, `TAP_VARIANTS.button/icon/card`

### C.2 Fuente: `src/components/ui/motion.tsx`

Componentes motion reutilizables (todos respetan `useReducedMotion`):

- `FadeInUp` — render estatico (no-op, evita flash SSR)
- `StaggeredList` / `StaggeredItem` — listas con stagger
- `Pressable` — iOS tap effect (scale 0.97)
- `HoverLift` — hover y=-2
- `ScaleOnHover` — tap scale 0.98
- `PageTransition` — opacity + y:8 con exit
- `SlideInRight` — nav transitions
- `AnimatedNumber` — spring counter
- `SuccessCheckmark` — SVG animated

### C.3 Fuente: `src/components/ui/page-transition.tsx`

- `PageTransition` — AnimatePresence mode="wait" con pathname key
- `StaggerContainer` / `StaggerItem` — duplica los de motion.tsx (candidato a unificar)
- `RevealOnScroll` — whileInView con viewport once

### C.4 Fuente: `src/lib/design-system.ts`

Se usa `animations.spring.snappy`, `animations.spring.sheet`, `animations.spring.default`, `animations.spring.gentle`, `animations.duration.fast/normal/slow`, `animations.easing.easeOut`, `reducedMotion.spring.default/sheet`.

**Nota:** Hay DOS fuentes de tokens (`animations.ts` constants vs `design-system.ts`). Verificar consistencia y consolidar si divergen.

## Anexo D: Issues pre-categorizados (hallazgos de investigacion)

### P0 — Rompe percepcion de calidad

| ID      | Componente        | Problema                                                    | Fix recomendado                            |
| ------- | ----------------- | ----------------------------------------------------------- | ------------------------------------------ |
| MOT-001 | `ui/dropdown.tsx` | Sin exit animation (conditional render sin AnimatePresence) | Migrar a framer-motion con AnimatePresence |
| MOT-002 | `ui/dropdown.tsx` | Sin soporte `prefers-reduced-motion`                        | Agregar `useReducedMotion` check           |
| MOT-003 | `ui/dropdown.tsx` | Sin focus restore al cerrar                                 | Guardar ref del trigger, restore on close  |
| MOT-004 | `ui/dropdown.tsx` | CSS `animate-in` classes (no tokenizado)                    | Reemplazar con framer-motion variants      |

### P1 — Inconsistencias visibles

| ID      | Componente                            | Problema                                             | Fix recomendado                                     |
| ------- | ------------------------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| MOT-005 | `command-palette.tsx`                 | Hardcoded `duration: 0.2` y ease `[0.16, 1, 0.3, 1]` | Migrar a tokens `DURATION.modal` y `easing.easeOut` |
| MOT-006 | `command-palette.tsx`                 | Sin `useReducedMotion`                               | Agregar checks para backdrop y panel                |
| MOT-007 | `command-palette.tsx`                 | Sin scroll lock (body sigue scrolleable)             | Agregar `document.body.style.overflow = 'hidden'`   |
| MOT-008 | `ui/drawer.tsx`                       | Sin focus restore al trigger original                | Guardar `activeElement` antes de abrir              |
| MOT-009 | 49 archivos                           | `transition-all` innecesario                         | Migrar a propiedades explicitas                     |
| MOT-010 | `motion.tsx` vs `page-transition.tsx` | StaggeredList/Item duplicados                        | Unificar en un solo archivo                         |

### P2 — Polish fino

| ID      | Componente                             | Problema                                          | Fix recomendado                              |
| ------- | -------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| MOT-011 | `command-palette.tsx`                  | `layoutId` en indicator puede causar layout shift | Evaluar si es necesario, alternativa opacity |
| MOT-012 | `drawer.tsx`                           | `backdrop-filter: blur` en backdrop (GPU heavy)   | Aceptable si no causa jank; monitorear       |
| MOT-013 | `toast.tsx` + `toast-refactored.tsx`   | Dos implementaciones coexisten                    | Consolidar en una sola                       |
| MOT-014 | `page-transition.tsx` `RevealOnScroll` | y:50 es un desplazamiento grande                  | Reducir a y:20 para sutileza Apple-like      |

## Anexo E: Anti-patrones de performance detectados

### E.1 `transition-all` (49 archivos)

Impacto: Fuerza el browser a calcular transicion en TODAS las propiedades CSS, incluyendo layout-triggering. En componentes de alto uso (cards, buttons, inputs), esto se multiplica.

**Top 8 archivos criticos** (componentes base):
`radio-group`, `ios-date-picker`, `ios-time-picker`, `color-picker`, `progress`, `appointment-card`, `appointment-filters`, `appointment-form`

### E.2 `backdrop-filter` animaciones

- `drawer.tsx:128` — `backdrop-blur-sm` en overlay (acceptable, single instance)
- `command-palette.tsx:431` — `backdrop-blur-sm` en overlay
- `command-palette.tsx:442` — `backdrop-blur-xl` en panel (heavier)

Riesgo: medio en mobile de gama baja. Mitigacion: no animar el blur itself, solo opacity del container.

### E.3 Reduced-motion coverage gaps

**Componentes SIN `useReducedMotion` o `prefers-reduced-motion`:**

- `ui/dropdown.tsx` (P0)
- `dashboard/command-palette.tsx` (P1)
- `ui/input.tsx` (usa AnimatePresence pero no checks)
- Multiples page components con `transition-all` CSS sin media query

**CSS `prefers-reduced-motion` solo en 3 archivos:**

- `globals.css`
- `swipeable-row.tsx`
- `toast-refactored.tsx`

### E.4 Layout-triggering animations

No se detectaron animaciones de `width`/`height`/`top`/`left` en framer-motion variants (bien). El unico riesgo es `collapsible-section.tsx` que anima height implicitamente.

### E.5 Duplicacion de componentes motion

- `motion.tsx` tiene `StaggeredList`/`StaggeredItem`
- `page-transition.tsx` tiene `StaggerContainer`/`StaggerItem`
- Ambos hacen lo mismo — riesgo de divergencia de tokens/behavior

## Anexo F: Cambios ya en progreso (git diff unstaged)

Estos cambios YA estan hechos (unstaged) y deben considerarse como baseline durante la auditoria:

| Archivo                   | Cambio completado                                                        | Estado  |
| ------------------------- | ------------------------------------------------------------------------ | ------- |
| `globals.css`             | Eliminado `@keyframes ripple` + `.animate-ripple`                        | Done    |
| `button.tsx`              | Eliminado ripple state/JSX, solo `whileTap={{ scale: 0.95 }}`            | Done    |
| `badge.tsx`               | `transition-all` → `transition-colors`                                   | Done    |
| `input.tsx`               | `transition-all` → `transition-[background-color,box-shadow]`            | Done    |
| `modal.tsx`               | Refactored con AnimatePresence + `useReducedMotion` + spring tokens      | Done    |
| `drawer.tsx`              | Agregado `focus-visible:!outline-none`                                   | Partial |
| `dropdown.tsx`            | `transition-all` → `transition-[border-color,box-shadow]` (trigger only) | Partial |
| `fab.tsx`                 | Eliminado `whileHover`, `transition-all` → `transition-shadow`           | Done    |
| `collapsible-section.tsx` | AnimatePresence + height animation + `useReducedMotion`                  | Done    |
| `command-palette.tsx`     | 2x `transition-all` → `transition-colors` (items only)                   | Partial |

**Filosofia del shift en progreso:**

- De: ripple effects + `transition-all` generico
- A: iOS `whileTap` + propiedades especificas + Framer Motion para overlays

## Anexo G: Inventario de microinteracciones

### G.1 whileHover (7 instancias, desktop-only)

| Componente               | Efecto                          | Spring           | Riesgo GPU             |
| ------------------------ | ------------------------------- | ---------------- | ---------------------- |
| `card.tsx`               | `y: -4, scale: 1.01, boxShadow` | `spring.card`    | MEDIO (repaint shadow) |
| `empty-state.tsx`        | `scale: 1.05`                   | `spring.default` | BAJO                   |
| `drawer.tsx` close btn   | `scale: 1.05`                   | default          | BAJO                   |
| `motion.tsx` HoverLift   | `y: -2`                         | configurable     | BAJO                   |
| `guide-toc-sheet.tsx`    | `scale: 0.94`                   | default          | BAJO                   |
| `stats-section.tsx`      | scale + shadow                  | default          | MEDIO                  |
| `barbers-management.tsx` | scale + shadow                  | default          | MEDIO                  |

### G.2 whileTap (8 instancias, mobile-friendly)

| Componente                | Efecto                          | Riesgo |
| ------------------------- | ------------------------------- | ------ |
| `card.tsx`                | `scale: 0.98`                   | BAJO   |
| `empty-state.tsx`         | `scale: 0.95`                   | BAJO   |
| `drawer.tsx` close btn    | `scale: 0.95`                   | BAJO   |
| `motion.tsx` Pressable    | `scale: 0.97` (configurable)    | BAJO   |
| `motion.tsx` ScaleOnHover | `scale: 0.98`                   | BAJO   |
| `toast-refactored.tsx`    | `scale: 1.05, rotate: 5` (drag) | BAJO   |
| `guide-toc-sheet.tsx`     | `scale: 0.94`                   | BAJO   |

### G.3 Drag gestures (3 instancias)

| Componente             | Mecanismo            | Propiedades                | Riesgo |
| ---------------------- | -------------------- | -------------------------- | ------ |
| `swipeable-row.tsx`    | `useTransform`       | scale, opacity, translateX | MEDIO  |
| `drawer.tsx`           | `drag="y"` + elastic | y transform + opacity      | BAJO   |
| `toast-refactored.tsx` | whileDrag            | scale, rotate              | BAJO   |

### G.4 CSS globals con `transition: all` (a migrar)

- `.interactive` (150ms) — transition: all
- `.ios-segment-item` (200ms) — transition: all
- `.touch-active:active` (100ms) — transition: all

## Anexo H: Scorecard baseline de overlays

Scores estimados pre-auditoria basados en analisis estatico de codigo:

| Componente                | Dim 1 Tokens | Dim 2 Enter/Exit | Dim 3 Micro | Dim 4 a11y | Dim 5 Focus/Scroll | Dim 6 Perf | Dim 7 Semantic | Dim 8 Cross-plat | Promedio |
| ------------------------- | :----------: | :--------------: | :---------: | :--------: | :----------------: | :--------: | :------------: | :--------------: | :------: |
| `modal.tsx`               |      5       |        5         |      4      |     5      |         5          |     5      |       5        |        5         | **4.9**  |
| `drawer.tsx`              |      5       |        5         |      4      |     4      |         3          |     4      |       5        |        4         | **4.2**  |
| `sheet.tsx`               |      4       |        4         |      3      |     4      |         3          |     4      |       4        |        4         | **3.8**  |
| `dropdown.tsx`            |      1       |        1         |      2      |     0      |         1          |     3      |       3        |        3         | **1.8**  |
| `command-palette.tsx`     |      2       |        4         |      4      |     1      |         2          |     3      |       5        |        4         | **3.1**  |
| `page-transition.tsx`     |      5       |        4         |      3      |     4      |        N/A         |     5      |       4        |        4         | **4.1**  |
| `button.tsx`              |      4       |       N/A        |      5      |     4      |        N/A         |     5      |       5        |        5         | **4.7**  |
| `fab.tsx`                 |      4       |       N/A        |      5      |     3      |        N/A         |     5      |       5        |        5         | **4.5**  |
| `collapsible-section.tsx` |      4       |        4         |      3      |     5      |        N/A         |     3      |       4        |        4         | **3.9**  |
| `toast-refactored.tsx`    |      3       |        4         |      4      |     3      |        N/A         |     4      |       4        |        4         | **3.7**  |

**Promedio general: 3.9** (meta: >= 4.5 en P0)

### Prioridad de fix por score

1. `dropdown.tsx` — **1.8** (P0, requiere rediseno completo de motion)
2. `command-palette.tsx` — **3.1** (P1, tokens + scroll lock + reduced-motion)
3. `toast-refactored.tsx` — **3.7** (P2, consolidar con toast.tsx)
4. `sheet.tsx` — **3.8** (P1, verificar focus + scroll lock)
5. `collapsible-section.tsx` — **3.9** (ya mejorado, verificar height perf)
