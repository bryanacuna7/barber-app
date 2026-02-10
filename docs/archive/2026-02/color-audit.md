# Color Audit - BarberApp (Dark + Light)

Fecha: 2026-02-07  
Objetivo: elevar el lenguaje de color a estándar premium global (nivel Awwwards) y reducir la sensación "pintoresca".

## 1) Resumen Ejecutivo

La app tiene muy buena base visual (espaciado, blur, jerarquía, motion), pero hoy el sistema de color está **fragmentado**: conviven demasiados acentos saturados por pantalla, con repetición fuerte de gradientes violeta/azul en CTA y headers, mientras el sistema de marca dinámico (`--brand-primary`) se usa poco en las vistas principales.

Diagnóstico global:

- Dark mode: **7.2/10**
- Light mode: **6.4/10**
- Consistencia cromática premium: **5.9/10**
- Riesgo de percepción "demo/template look": **alto**

Conclusión: no falta "estilo"; falta **disciplina cromática sistémica**.

## 2) Metodología

- Revisión visual de pantallas compartidas (Citas, Clientes, Servicios, Analíticas, Barberos).
- Auditoría de código sobre versiones activas `page-v2` (feature flags en `true`).
- Revisión del sistema base de tokens y theme variables.
- Verificación puntual de contraste (WCAG AA) en combinaciones reales.

## 3) Evidencia Técnica (hallazgos principales)

### Hallazgo A - Lenguaje cromático fragmentado por sobreuso de acentos

Impacto: baja percepción premium, ruido visual, menor foco en acciones primarias.

Evidencia:

- Fondo mesh global violeta/azul + púrpura/rosa fijo en toda la app:
  - `src/components/ui/premium-background.tsx:24`
  - `src/components/ui/premium-background.tsx:37`
- Mismo patrón repetido en páginas core:
  - `src/app/(dashboard)/clientes/page-v2.tsx:623`
  - `src/app/(dashboard)/servicios/page-v2.tsx:579`
  - `src/app/(dashboard)/barberos/page-v2.tsx:162`
- Multiplicación de colores por contexto (clientes/servicios):
  - `src/app/(dashboard)/clientes/page-v2.tsx:215`
  - `src/app/(dashboard)/servicios/page-v2.tsx:283`

### Hallazgo B - Dominancia de CTA violeta/azul en casi todas las interacciones primarias

Impacto: fatiga de color, pérdida de jerarquía (todo parece primario).

Evidencia:

- Header/segment buttons con el mismo gradiente en varias secciones:
  - `src/app/(dashboard)/analiticas/page-v2.tsx:192`
  - `src/app/(dashboard)/analiticas/page-v2.tsx:217`
  - `src/app/(dashboard)/citas/page-v2.tsx:682`
  - `src/app/(dashboard)/servicios/page-v2.tsx:623`
  - `src/app/(dashboard)/barberos/page-v2.tsx:198`
- Bottom nav azul activo + glow azul persistente:
  - `src/components/dashboard/bottom-nav.tsx:91`
  - `src/components/dashboard/bottom-nav.tsx:98`
  - `src/components/dashboard/bottom-nav.tsx:140`

### Hallazgo C - Sistema de marca existe, pero no gobierna la UI principal

Impacto: personalización débil, inconsistencia entre branding y producto.

Evidencia:

- Generación robusta de variables de marca:
  - `src/components/theme-provider.tsx:117`
  - `src/components/theme-provider.tsx:124`
  - `src/components/theme-provider.tsx:127`
- Uso real limitado de `--brand-primary` en componentes críticos:
  - `src/app/globals.css:591`
  - `src/components/dashboard/sidebar.tsx:84`
- Mientras tanto, gran parte del dashboard usa colores hardcodeados (blue/violet/amber/etc).

### Hallazgo D - Contraste: secundarios oscuros borderline o por debajo de AA en casos frecuentes

Impacto: legibilidad subóptima (especialmente texto pequeño y metadatos).

Resultados de verificación:

- `#71717a` sobre `#18181b`: **3.67:1** (falla AA para texto normal).
- `#71717a` sobre `#0a0a0a`: **4.10:1** (borderline/falla AA para texto normal).
- `#a1a1aa` sobre `#ffffff`: **2.56:1** (falla AA clara).
- `#a1a1aa` sobre `#0a0a0a`: **7.72:1** (ok).

Zonas de riesgo:

- `src/app/globals.css:74` (`text-zinc-500 dark:text-zinc-400`) como subtítulo global.
- `src/app/(dashboard)/citas/page-v2.tsx:738` (metadata en móvil).
- `src/components/analytics/revenue-chart.tsx:91` (texto pequeño auxiliar).

### Hallazgo E - Charts con colorimetría "vibrant default" y tooltip no adaptado a dark

Impacto: visual no premium y ruptura con dark surfaces.

Evidencia:

- Palette vibrante fija para barras:
  - `src/components/analytics/services-chart.tsx:33`
- Tooltip siempre claro en charts (no tema dark):
  - `src/components/analytics/revenue-chart.tsx:173`
  - `src/components/analytics/services-chart.tsx:101`

### Hallazgo F - Light mode tiene dirección incompleta

Impacto: en claro, el producto se siente más "colorido" que "luxury software".

Evidencia:

- `themeColor` de viewport igual en light/dark (`#0a0a0a`), no refleja modo light:
  - `src/app/layout.tsx:55`
  - `src/app/layout.tsx:56`
- Fondo con mesh cromático constante también en light:
  - `src/components/ui/premium-background.tsx:9`
  - `src/components/ui/premium-background.tsx:24`

## 4) Scorecard Premium (Awwwards-Oriented)

- Coherencia de familia cromática: **5/10**
- Jerarquía cromática (primario/secundario/estado): **6/10**
- Sofisticación dark mode: **7/10**
- Sofisticación light mode: **6/10**
- Integración de marca dinámica: **5/10**
- Accesibilidad de contraste: **6/10**

## 5) Dirección Recomendada (Premium 2026)

### Principio rector

Menos matices simultáneos, más profundidad tonal.  
De "multi-acento por módulo" a "1 acento maestro + semánticos controlados".

### Paleta propuesta (sistema)

Light:

- `surface-0`: `#F6F7F9`
- `surface-1`: `#FFFFFF`
- `surface-2`: `#EEF1F5`
- `text-1`: `#111318`
- `text-2`: `#5A6270`
- `text-3`: `#7A8393`
- `accent`: `#4F46E5`
- `accent-soft`: `#E9EAFE`

Dark:

- `surface-0`: `#080A0E`
- `surface-1`: `#10141B`
- `surface-2`: `#151B24`
- `text-1`: `#F3F6FB`
- `text-2`: `#A6B0BE`
- `text-3`: `#828D9D`
- `accent`: `#6D7CFF`
- `accent-soft`: `#1C2440`

Semánticos (igual en ambos modos, solo ajustar luminancia):

- success: `#22C55E`
- warning: `#F59E0B`
- danger: `#EF4444`
- info: reutilizar `accent` (evitar nuevo azul paralelo)

## 6) Reglas de Sistema (obligatorias para evitar look pintoresco)

- Máximo 1 acento cromático dominante por pantalla.
- Semánticos solo para estado/feedback; no para decoración.
- El gradiente violeta/azul no puede aparecer en **todas** las CTAs, tabs y headers a la vez.
- Si un componente usa `--brand-primary`, no debe mezclarse con gradientes hardcodeados competidores.
- Texto secundario en dark: mínimo ratio efectivo **>= 4.5:1** para tamaños de 12-15px.
- Tooltips/charts deben ser theme-aware (light y dark).

## 7) Plan de Ejecución (priorizado)

### Fase 1 - Fundaciones (alta prioridad)

- Reducir mesh cromático global y bajar saturación/área:
  - `src/components/ui/premium-background.tsx`
- Replantear activo de bottom nav para que dependa de token de marca (no azul fijo):
  - `src/components/dashboard/bottom-nav.tsx`
- Redefinir `variant="gradient"` para que use token de marca o dual-tone controlado:
  - `src/components/ui/button.tsx`

### Fase 2 - Unificación de dashboards

- Migrar headers, tabs y botones principales de `from-violet-600 to-blue-600` a una sola familia de acento:
  - `src/app/(dashboard)/citas/page-v2.tsx`
  - `src/app/(dashboard)/clientes/page-v2.tsx`
  - `src/app/(dashboard)/servicios/page-v2.tsx`
  - `src/app/(dashboard)/analiticas/page-v2.tsx`
  - `src/app/(dashboard)/barberos/page-v2.tsx`

### Fase 3 - Data viz y contraste fino

- Palette de charts más sobria y consistente con tema.
- Tooltip dark/light adaptativo.
- Ajuste de secundarios (`text-zinc-500`, `text-zinc-400`) según superficie real.

## 8) Criterios de Aceptación (definición de “premium”)

- En cada pantalla core, se percibe un solo color de acento dominante.
- No más de 3 colores semánticos visibles simultáneamente en viewport móvil.
- Texto secundario de 12-15px cumple AA en dark y light.
- Branding dinámico realmente visible en navegación/CTA primarios.
- Light mode y dark mode se sienten dos versiones del mismo sistema, no dos estilos distintos.

## 9) Veredicto Final

Tu app ya tiene base de producto premium; el problema no es calidad de UI, es **gobierno del color**.  
Con disciplina de tokens + reducción de acentos + contraste afinado, puedes pasar de “muy buena app moderna” a “estética internacional premium” sin rediseñar toda la interfaz.
