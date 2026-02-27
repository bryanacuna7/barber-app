# Animation Audit Master Plan (Consolidado)

Version: 1.0  
Fecha: 2026-02-27  
Estado: Ready to Execute  
Cobertura: Mobile + Desktop  
Enfoque: “Premium y sutil” (estilo Apple HIG), sin regresiones funcionales

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

- `src/lib/constants/animations.ts`
- `src/components/ui/motion.tsx`

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
2. Registrar evidencia visual (gif/screenshot + nota breve).
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

Validar:

- Sin animaciones de `width/height/top/left` salvo casos justificados.
- Sin layout thrash por efectos tipo ripple.
- Sin `transition-all` donde alcance con propiedades explicitas.
- Fluidez percibida en interacciones frecuentes.

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

### Listas y cards

1. Entradas/salidas de items con continuidad.
2. Cambios de filtro sin parpadeo o relayout agresivo.
3. Drag/sort sin ghosting raro.

## 10) Reglas de implementacion para fixes

- Preferir `AnimatePresence` para ciclos enter/exit reales.
- Preferir `transform` y `opacity`.
- Evitar `transition-all`.
- Reusar tokens de `animations.ts`.
- No introducir nuevos estilos de animacion ad-hoc sin token.
- Documentar excepciones tecnicas en comentario corto.

## 11) Riesgos y mitigaciones

- Riesgo: cambios globales rompen casos edge de overlays.
  - Mitigacion: regression manual en 3 rutas criticas + test smoke.
- Riesgo: dual-render en collapsible con children stateful.
  - Mitigacion: limitar a consumers de children estaticos o migrar a single-render con media query hook.
- Riesgo: visual drift entre mobile y desktop.
  - Mitigacion: validar ambos breakpoints en cada fix.

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

## Anexo B: Scope de ejecucion inmediata recomendado

1. `ui/modal.tsx`
2. `ui/button.tsx`
3. `ui/collapsible-section.tsx`
4. `ui/fab.tsx`
5. Reemplazos `transition-all` de lista controlada (scope estricto)
