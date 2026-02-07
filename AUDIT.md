# Auditoria Mobile Experience v3 (Re-Audit UX + Motion + Gestures)

## Contexto

- Proyecto: `barber-app`
- Objetivo: elevar la experiencia mobile a nivel "obsesion por detalle", estilo Apple/Awwwards en comportamiento e interaccion (no solo look).
- Fecha: 2026-02-07
- Scope:
  - UX estructural
  - Motion design
  - Gesture design
  - Copy UX
  - Consistencia entre modulos

## Fuentes auditadas

- Capturas mobile:
  - `dashboard-mobile-390.png`
  - `citas-mobile-390.png`
  - `citas-mobile-360-fixed.png`
  - `clientes-mobile-390.png`
  - `servicios-mobile-390.png`
  - `barberos-mobile-390.png`
  - `barberos-add-sheet-390.png`
  - `configuracion-mobile-390.png`
  - `configuracion-sheet-mobile-390.png`
  - `citas-create-sheet-390.png`
- Implementacion:
  - `src/app/(dashboard)/layout.tsx`
  - `src/components/dashboard/mobile-header.tsx`
  - `src/components/dashboard/bottom-nav.tsx`
  - `src/components/dashboard/dashboard-content.tsx`
  - `src/components/dashboard/stats-card.tsx`
  - `src/app/(dashboard)/citas/page-v2.tsx`
  - `src/app/(dashboard)/clientes/page-v2.tsx`
  - `src/app/(dashboard)/servicios/page-v2.tsx`
  - `src/app/(dashboard)/barberos/page-v2.tsx`
  - `src/app/(dashboard)/configuracion/page-v2.tsx`
  - `src/components/ui/sheet.tsx`
  - `src/components/ui/drawer.tsx`
  - `src/components/ui/page-transition.tsx`
  - `src/components/ui/motion.tsx`
  - `src/components/ui/pull-to-refresh.tsx`
  - `src/components/appointments/appointment-card.tsx`
  - `src/lib/design-system.ts`
  - `src/lib/utils/mobile.ts`
  - `src/app/globals.css`

---

## Resumen Ejecutivo

### Veredicto

La app sigue mejorando con cambios estructurales correctos: el `+` global ya dispara intencion de creacion, la consistencia de acciones subio y la legibilidad en light mode mejoro en `clientes`. Aun no esta en nivel "sistema premium cerrado" por deuda en date picker unificado, shell mobile y data-viz touch-first.

### Score global

- Arquitectura de informacion: **8.0/10**
- Jerarquia y foco de tarea: **7.2/10**
- Consistencia cross-modulo: **7.3/10**
- Consistencia tipografica: **6.9/10**
- Consistencia de componentes de accion: **7.0/10**
- Composicion de superficie mobile (respira en pantalla): **6.2/10**
- Calidad de visualizacion de datos en mobile: **5.2/10**
- Motion language (coherencia): **5.8/10**
- Gesture language (claridad y utilidad): **5.4/10**
- Continuidad de transiciones entre escenas: **4.7/10**
- Feedback tactil/perceptual: **5.6/10**
- Sensacion "nativo premium": **7.4/10**

### Diagnostico corto

No te falta "poner mas animaciones". Te falta un **Interaction OS**:

- reglas unicas de como se mueve la app,
- reglas unicas de como responde al dedo,
- reglas unicas de como confirma estados.

### Delta de esta iteracion (QA)

- Mejoras confirmadas:
  - Bottom nav migro a arquitectura recomendada: `Citas`, `Clientes`, `Servicios`, `Mas` + boton `+` global en centro (`src/components/dashboard/bottom-nav.tsx`).
  - Tipografia de nav subio de `10px` a `11px` (`src/components/dashboard/bottom-nav.tsx`).
  - El `+` global ahora navega con `?intent=create` y los destinos core lo consumen para auto-abrir formulario (`citas`, `clientes`, `servicios`).
  - `Nueva Cita` reemplazo `select` nativo por picker sheet dedicado para cliente/servicio/barbero (`src/app/(dashboard)/citas/page-v2.tsx`).
  - `Hora` en `Nueva Cita` mantiene picker dedicado (`IOSTimePicker`).
  - En `servicios` y `barberos`, `max-w` se aplica en `lg` y ya no encajona en mobile por defecto.
  - `Clientes` corrige contraste en light mode en cards de lista (nombre, metricas, fondo y bordes).
  - Consistencia de acciones mejoro de forma medible (mas uso de `Button` y menos `button` manual en modulos core).
- Brechas criticas aun abiertas:
  - `Fecha` en `Nueva Cita` sigue en `input[type=date]` nativo.
  - En `Servicios`, al editar un servicio se abre el modal de "Agregar nuevo servicio" (estado de modo incorrecto: edit/create).
  - Persisten botones manuales en puntos core (especialmente en `citas`/`barberos`).
  - Charts mobile siguen con patron desktop (altura fija, poca tactilidad y narrativa de insight limitada).
  - CTA `+` no es consistente entre modulos (tamano/posicion/jerarquia distinta en `servicios`, `clientes`, `barberos`).
  - Persisten contenedores "card padre" en modulos operativos (especialmente `servicios`, `barberos` y ahora tambien `citas`) que enmarcan de mas el contenido.
  - En `citas`, `Fecha` y `Hora` siguen apilados verticalmente en lugar de composicion compacta horizontal.
  - El modal de `Nueva Cita` no se percibe consistente con `Nuevo Cliente`/`Nuevo Servicio` (estructura y lenguaje de overlay diferente).
  - En `inicio`, el CTA "Ver todas" rompe en multilinea ("Ver / todas") en viewport pequeno.
  - Admins SaaS sin negocio propio no pueden entrar al dashboard de negocio desde mobile (loop funcional hacia `/admin`).
  - En iOS/PWA persiste franja blanca superior en zona de status bar (hora/bateria), rompiendo continuidad visual edge-to-edge.
  - El degradado de fondo presenta carga perceptible de izquierda a derecha en arranque de app (render no inmediato).
  - En primer arranque, el indicador activo del bottom nav puede posicionarse en `Mas` aunque la pantalla actual no corresponda a ese destino.
  - El banner `Trial Pro` presenta separacion visual deficiente (linea/borde fantasma) y jerarquia espacial inconsistente con el header y el contenido operativo.

### Validacion visual (capturas mas recientes)

- `Servicios` mejoro legibilidad y densidad operativa (lista de cards mas limpia y escaneable).
- `Nueva Cita` mejoro en claridad de campos y elimino el picker de hora anterior de baja calidad.
- `Barberos` mejoro en lectura de lista/leaderboard y detalle en sheet.
- La navegacion inferior ya comunica mejor prioridades y reduce carga cognitiva.
- Persisten riesgos de sistema: date picker nativo, shell con doble inset en modulos puntuales y visualizacion de datos aun poco tactil.

### Inconsistencias visuales agregadas (capturas adjuntas)

- `Servicios`:
  - Header sigue percibiendose enmarcado en card/panel y el `+` queda debajo del bloque textual.
  - La pagina operativa aun se percibe encajonada dentro de un contenedor padre/cuadrado en mobile.
  - Recomendacion: alinear CTA en la misma fila del titulo (end-aligned), con jerarquia equivalente a otros modulos.
- `Clientes`:
  - El `+` es mas pequeno y aparece en posicion distinta vs otros modulos.
  - Recomendacion: normalizar un `Header CTA Contract` (tamano, ubicacion, paddings, icon size) para todos los index views.
- `Barberos`:
  - El `+` se ve con estilo distinto y el contenido principal aun se percibe dentro de un contenedor cuadrado/padre.
  - Recomendacion: unificar variante del `+` con `clientes/servicios` y reducir encapsulado del shell en mobile.
- `Citas`:
  - La vista principal sigue dentro de un contenedor cuadrado/padre, reduciendo sensacion edge-to-edge.
  - `Hora` aun va debajo de `Fecha`; el flujo se siente mas largo de lo necesario.
  - Recomendacion: eliminar el contenedor padre en mobile y usar layout 2-column (`Fecha | Hora`) en ancho suficiente (fallback vertical en anchos muy pequenos).
- `Inicio`:
  - CTA "Ver todas" rompe en dos lineas.
  - Recomendacion: asegurar `white-space: nowrap`, ancho minimo de CTA o copy alterno corto ("Ver todo") para 320-360dp.
- `PWA / iOS status bar`:
  - Se observa banda blanca superior en la zona de hora/senal/bateria mientras el hero es oscuro.
  - Recomendacion: unificar color/fondo de la safe-area superior y validar en Safari + standalone PWA para evitar corte visual.
- `Modales de creacion`:
  - `Nueva Cita` no mantiene el mismo contrato visual/estructural que `Nuevo Cliente` y `Nuevo Servicio`.
  - Recomendacion: definir un `Create Modal Contract` unico (header, espaciado, altura, CTA, dismiss, animacion y comportamiento de teclado).
- `Fondo degradado`:
  - Se percibe carga progresiva del degradado (wipe izquierda -> derecha) al abrir app/pantallas.
  - Recomendacion: optimizar first paint del fondo (fallback solido inmediato + degradado listo antes de revelar escena).
- `Bottom nav (estado activo)`:
  - Al abrir por primera vez, el highlight/indicador puede aparecer en `Mas` sin que el usuario este en ese contexto.
  - Recomendacion: corregir sincronizacion de estado activo con ruta real post-hydration/redirect para evitar señal incorrecta.
- `Banner Trial Pro`:
  - Se observa linea de separacion/borde fantasma y acople brusco con el bloque siguiente en mobile.
  - El bloque se percibe como capa "pegada", sin respiracion vertical consistente.
  - Recomendacion: definir `Promo Banner Contract` (spacing estable, borde/sombra sin artefactos de 1px y CTA secundaria con contraste/touch target uniforme).

### Re-Audit Visual (Sesion 140 - paridad Citas/Servicios/Clientes)

- Hallazgo principal:
  - `Clientes` se percibe mejor porque el contenido vive directo sobre el background global.
  - `Citas` y `Servicios` aun renderizan un canvas propio con fondo/caja, generando el efecto de "cuadrado oscuro" o pantalla encajonada.
- `Citas` (P1 alto):
  - Persisten señales de canvas interno: wrapper full-screen con fondo propio + header opaco con borde marcado.
  - Evidencia en codigo:
    - `src/app/(dashboard)/citas/page-v2.tsx`: wrapper con `bg-white dark:bg[#1C1C1E]` y estructura de lienzo interno.
    - `src/app/(dashboard)/citas/page-v2.tsx`: header sticky con `border-b` visible y bloque opaco.
  - Impacto:
    - la pantalla se siente separada del sistema visual del app;
    - corta continuidad entre `TrialBanner` y toolbar de calendario.
  - Recomendacion:
    - remover canvas opaco de pagina y usar solo superficies internas (cards/segmented controls);
    - bajar contraste del divider del header (o usar sombra suave en lugar de linea).
- `Servicios` (P1 medio):
  - Mantiene wrapper con `-mt-6` + fondo gradiente de pagina, distinto a `Clientes`.
  - Evidencia en codigo:
    - `src/app/(dashboard)/servicios/page-v2.tsx`: wrapper con `-mx/-mt` + `bg-gradient-to-br`.
  - Impacto:
    - inconsistencia de shell entre modulos;
    - sensacion de layout "special case" vs sistema unificado.
  - Recomendacion:
    - converger `Servicios` al mismo shell de `Clientes` (sin canvas full-page extra);
    - conservar gradientes solo como acento local (hero/stats), no como base de toda la pantalla.
- `Trial Banner` (P1 medio):
  - Aunque mejoró, su percepción sigue variando por el contexto de cada modulo (especialmente cuando cae encima de headers opacos).
  - Recomendacion:
    - aplicar `Promo Banner Contract` junto con `Page Shell Contract` unificado;
    - validar spacing vertical fijo: header -> banner -> contenido (sin doble borde ni saltos de contraste).
- Decision de diseño recomendada (experta):
  - Adoptar un unico `Mobile Canvas Contract`: mismo comportamiento de fondo, mismos insets y misma separación superior en `Citas`, `Clientes`, `Servicios`, `Barberos`.
  - Regla: si `Clientes` se siente correcto en composición, usarlo como baseline del shell para los demás módulos.

### Update de implementación (Sesion 141)

- Aplicado:
  - `Citas`: se removió el fondo opaco de página y se suavizó el header sticky para reducir efecto de "cuadrado oscuro".
  - `Servicios`: se removió `-mt` y el canvas de fondo propio; ahora hereda mejor el shell global (más cercano a `Clientes`).
  - `Nueva Cita`: migró de sheet inferior a modal centrado, alineado al contrato visual de `Nuevo Cliente`.
  - CTA de formularios de alta en mobile simplificada a `Guardar` (evita salto de línea tipo `Guardar/Cliente`).
- Pendiente de validar visualmente en hardware:
  - continuidad final del `Trial Banner` sobre `Citas` y `Servicios` después del ajuste de shell;
  - paridad exacta de contraste/espaciado entre `Nuevo Cliente` y `Nueva Cita` en dark mode.

### Update de implementación (Sesion 142 - De-generic pass)

- Aplicado:
  - `Citas`, `Barberos` y `Servicios` eliminan wrappers `-mx` en mobile para reducir efecto de lienzo encajonado.
  - `Citas` ajusta toolbar mobile:
    - `Hoy` deja de competir como chip fijo cuando ya estas en hoy.
    - segmented control (`Día/Semana/Mes`) adopta estilo activo/inactivo consistente con el resto del app.
    - separacion vertical mejorada en bloques (`MAÑANA`, `MEDIODÍA`, `TARDE`) y jerarquia mas limpia entre titulo/horario/progreso.
  - `Barberos`:
    - tabs mobile ahora hacen `scrollIntoView` inmediato al seleccionar (mejora visibilidad de `Calendario` y tabs al extremo).
    - lista mobile deja de estar dentro de card padre para reducir encapsulado.
  - `Servicios`:
    - chips de categoria agregan `scrollIntoView` al seleccionar.
    - lista mobile deja de estar dentro de card padre para evitar efecto "cuadro dentro de cuadro".
  - `Lealtad`:
    - header mobile y card principal suavizados para reducir bloque oscuro pesado.
  - `TrialBanner`:
    - spacing vertical estabilizado para mejorar respiracion con el contenido superior/inferior.

- Pendiente recomendado (siguiente pass):
  - validar en dispositivo real que `TrialBanner` no genere linea fantasma en todos los modulos.
  - extender haptics a acciones de primer nivel en todos los flows de alta/edicion (no solo tabs/swipes).
  - terminar estandarizacion de contenedores en vistas secundarias (`Lealtad`, `Configuracion avanzada`, sub-vistas dentro de `Mas`).

### Update de implementación (Sesion 143 - Paridad de gutters con Analíticas)

- Aplicado:
  - Se eliminó padding lateral duplicado en mobile en:
    - `src/app/(dashboard)/citas/page-v2.tsx`
    - `src/app/(dashboard)/barberos/page-v2.tsx`
    - `src/app/(dashboard)/servicios/page-v2.tsx`
  - Objetivo: que estas pantallas usen el mismo gutter visual base que `Analíticas` (margen lateral definido por el layout global, no por wrappers internos).
  - En `Citas`, adicionalmente se simplificó el day-view hacia cards sobrias tipo `Analíticas` (menos ruido visual y mayor coherencia de superficies).

- Resultado esperado:
  - Menor sensación de contenido “encajonado”.
  - Paridad de spacing horizontal entre módulos core.
  - Lectura más directa en mobile (sin doble inset).

- Estado de hallazgos tras este ajuste:
  - **Parcialmente resuelto**: “espacio excesivo entre borde y cards” en `Citas/Barberos/Servicios`.
  - **Pendiente de verificación visual final**: confirmar en dispositivo real que no aparezcan dobles insets en sub-vistas y modales internos.
  - **Sigue pendiente**:
    - contrato visual único de `Create Modal` entre `Nueva Cita`, `Nuevo Cliente`, `Nuevo Servicio`;
    - date picker unificado en `Nueva Cita` (evitar fallback nativo inconsistente);
    - consistencia total de filtros/tabs/search focus states entre módulos.

### Score update rapido (post Sesion 143)

- Composición de superficie mobile (respira en pantalla): **6.2 -> 7.1**
- Consistencia cross-modulo: **7.3 -> 7.6**
- Sensación “nativo premium”: **7.4 -> 7.7**

Nota: el score global aún está limitado por deuda en contratos de interacción (gestos/haptics/modales/feedback), no por colorimetría.

### Re-Audit Full Pass (codigo + capturas)

- Resultado general: no se detectaron nuevos **P0** fuera de los ya documentados (date picker nativo y data-viz no touch-first), pero si se confirmaron inconsistencias **P1** transversales.
- Hallazgos confirmados en codigo:
  - `Servicios`: header usa `flex-wrap` y permite que el `+` caiga debajo del bloque de titulo en mobile (`src/app/(dashboard)/servicios/page-v2.tsx`).
  - `Clientes`: CTA `+` del header usa escala mas pequena y distinta jerarquia vs otros modulos (`src/app/(dashboard)/clientes/page-v2.tsx`).
  - `Barberos`: CTA `+` usa variante/tamano distinto y mantiene panel contenedor de controles muy marcado (`src/app/(dashboard)/barberos/page-v2.tsx`).
  - `Citas`: la escena principal se mantiene dentro de un contenedor rectangular/padre en mobile, en lugar de composicion respirable edge-to-edge (`src/app/(dashboard)/citas/page-v2.tsx`).
  - `Citas`: `Fecha` y `Hora` siguen en stack vertical (`src/app/(dashboard)/citas/page-v2.tsx`).
  - `Inicio`: CTA "Ver todas" en `Proximas Citas Hoy` puede quebrar en pantallas chicas (`src/components/dashboard/dashboard-content.tsx`).
  - `DashboardLayout`: cuando no existe `business` y el usuario es admin, se fuerza `redirect('/admin')`, impidiendo acceso al dashboard de negocio para admins sin negocio propio (`src/app/(dashboard)/layout.tsx`).
  - `MoreMenuDrawer`: no expone acceso admin en mobile para usuarios admin, lo que reduce descubribilidad de cambio de contexto entre dashboard de negocio y super admin (`src/components/dashboard/more-menu-drawer.tsx`).
- Recomendacion de cierre:
  - Definir `Header CTA Contract` unico (tamano, posicion, icono, wrapper y breakpoints).
  - Definir `Compact Field Grid` para formularios cortos en mobile (`Fecha | Hora`).
  - Definir `No-wrap CTA Contract` para botones cortos en cards (`Ver todas`, `Ver todo`).

---

## Que significa "Apple / Awwwards" en este producto

## No es

- meter efectos en cada componente,
- aumentar complejidad visual,
- convertir una app operativa en landing experimental.

## Si es

- latencia perceptual baja,
- transiciones con causalidad (de donde viene y a donde va),
- gestos previsibles,
- jerarquia calmada,
- microfeedback exacto en cada accion importante.

---

## Hallazgos Criticos (ordenados por severidad)

## [P0] No existe un Interaction OS unificado

### Evidencia

- Hay multiples capas de motion con reglas distintas:
  - `src/components/ui/page-transition.tsx`
  - `src/components/ui/motion.tsx`
  - `src/lib/design-system.ts`
  - springs y timings hardcodeados en modulos (`citas`, `servicios`, `barberos`, `dashboard`).

### Impacto

- La app no "se siente una sola". Se siente por bloques.
- Cada pantalla tiene personalidad de movimiento distinta.

### Recomendacion

- Definir un Motion Spec central (tokens + semantica):
  - `enter`, `exit`, `press`, `reveal`, `confirm`, `error`, `dismiss`.
- Prohibir timings/springs custom por pantalla fuera de tokens aprobados.

---

## [P0] Sobrecarga de decisiones en primer viewport (sobre todo Citas y Clientes)

### Evidencia

- En `citas` y `clientes` se concentran modos, filtros, KPIs, acciones y bloques en zona alta.

### Impacto

- Friccion cognitiva.
- Peor uso a una mano, en contexto real de trabajo.

### Recomendacion

- Regla dura: maximo 1 tarea primaria + 1 secundaria visible arriba del fold.
- El resto: disclosure progresivo (sheet, seccion colapsable, submenu contextual).

---

## [P1] Acceso admin cross-context incompleto en mobile

### Evidencia

- `src/app/(dashboard)/layout.tsx`: admin sin negocio propio es redirigido automaticamente a `/admin`.
- `src/components/admin/admin-sidebar.tsx`: `AdminBottomNav` intenta ofrecer "Volver", pero la IA de navegacion entre contextos no esta centralizada.
- `src/components/dashboard/more-menu-drawer.tsx`: no muestra acceso a panel admin para cuentas admin.

### Impacto

- Para admins SaaS en mobile, entrar al dashboard de negocio no es consistente ni predecible.
- Se pierde continuidad de flujo QA/operacion entre "producto de negocio" y "panel super admin".

### Recomendacion

- Definir un `Admin Context Switch Contract`:
  - acceso explicito en mobile a ambos contextos (`Negocio` y `Super Admin`);
  - comportamiento definido para admin sin negocio (pantalla intermedia o selector, no loop silencioso);
  - entrypoint unico y siempre visible para cambio de contexto.

---

## [P1] Gestos existen, pero no forman un lenguaje consistente

### Evidencia

- `src/components/appointments/appointment-card.tsx` tiene swipe lateral en variante compact.
- `src/components/ui/drawer.tsx` tiene drag vertical para dismiss.
- `src/components/ui/sheet.tsx` no tiene drag-to-dismiss consistente.
- En modulos principales no hay contrato gestual uniforme por tipo de entidad.

### Impacto

- El usuario no construye memoria gestual.
- Descubribilidad baja.

### Recomendacion

- Definir Gesture Grammar:
  - Swipe left: acciones de item.
  - Pull down: refresh.
  - Drag down en overlays: dismiss.
  - Long press: acciones avanzadas.
  - Edge-swipe: back/contextual close donde aplique.

---

## [P1] Transiciones de pantalla no estan orquestadas globalmente

### Evidencia

- Existe `PageTransition` pero no esta aplicado como capa sistemica en layout principal.

### Impacto

- Saltos entre vistas sin continuidad espacial.

### Recomendacion

- Implementar escena global con:
  - transition route-to-route consistente,
  - preserved elements (shared continuity) para header, tabs y listas.

---

## [P1] Inconsistencia en modales de creacion (Create Flows)

### Evidencia

- `Nueva Cita` se percibe con estructura y ritmo distintos respecto a `Nuevo Cliente`/`Nuevo Servicio`.
- El lenguaje de overlay no se siente "misma familia" entre flujos de alta.

### Impacto

- Rompe memoria muscular y consistencia perceptual.
- Baja sensacion de sistema premium en tareas repetitivas de creacion.

### Recomendacion

- Definir y aplicar `Create Modal Contract` unico:
  - misma jerarquia de header y cierre,
  - mismo sistema de espaciado y densidad,
  - mismo patron de CTA primario/secundario,
  - mismas transiciones de entrada/salida y comportamiento con teclado.

---

## [P1] Render progresivo del degradado de fondo (performance perceptual)

### Evidencia

- Se reporta carga visible del background de izquierda a derecha al abrir app/pantallas.

### Impacto

- Afecta first impression y sensacion de fluidez.
- Percepcion de app "cargando visualmente" en lugar de superficie estable.

### Recomendacion

- Establecer estrategia de paint del fondo:
  - color base inmediato (sin flash),
  - degradado optimizado y prerenderizado cuando aplique,
  - evitar composiciones pesadas que generen render incremental visible.

---

## [P1] Falta feedback tactil/perceptual en acciones clave

### Evidencia

- Existe utilidad `vibrate` en `src/lib/utils/mobile.ts`, pero no hay mapa de uso de feedback.
- Confirmaciones dependen sobre todo de cambio visual/toast.

### Impacto

- Menor sensacion de precision y confianza.

### Recomendacion

- Definir feedback map:
  - success corto,
  - warning doble corto,
  - destructive largo.
- En web: usar vibration donde soporte; fallback visual donde no.

---

## [P1] Inconsistencia de idioma y tono operativo

### Evidencia

- ES/EN mezclado en labels de vistas y metricas.

### Impacto

- Baja percepcion de cuidado.

### Recomendacion

- Unificar copy en espanol operacional y directo.

---

## [P2] Pull-to-refresh esta construido pero fuera del flujo principal

### Evidencia

- `src/components/ui/pull-to-refresh.tsx` existe.
- Modulos v2 principales no lo usan consistentemente.

### Impacto

- Patron nativo esperado pero ausente.

### Recomendacion

- Incorporarlo en listados core donde tenga valor real (citas/clientes/servicios).

---

## [P2] Se usa demasiado paradigma hover para mobile

### Evidencia

- Amplio uso de `whileHover` en componentes de flujo mobile.

### Impacto

- Efectos pensados para mouse no agregan valor en touch.

### Recomendacion

- Priorizar `whileTap`, press-state, drag-state y scroll-state.
- Reservar hover para desktop.

---

## [P2] Tipografia de navegacion inferior demasiado pequena

### Evidencia

- `src/components/dashboard/bottom-nav.tsx` ahora usa `text-[11px]` en labels de tabs.

### Impacto

- Mejora de legibilidad ya visible en uso dinamico.

### Recomendacion

- Mantener piso de 11px y validar 12px en iPhone SE/360dp para confirmar equilibrio densidad/legibilidad.
- Estado QA: **Resuelto (con mejora incremental posible)**.

---

## [P1] Escala tipografica inconsistente en flujos activos

### Evidencia

- En vistas activas hay mezcla de escalas micro sin criterio uniforme:
  - El problema de `10px` operativo ya no aparece en los modulos core auditados.
  - Persiste variacion amplia de tamanos en pantallas activas (ej. `11/12/13/14/15/17/20/28` en `src/app/(dashboard)/configuracion/page-v2.tsx`).
- `src/lib/design-system.ts` define escala tipografica, pero no se usa en pantallas principales.

### Impacto

- Misma importancia semantica se ve con tamanos distintos segun modulo.
- Se rompe ritmo visual y predictibilidad de lectura.

### Recomendacion

- Definir escala unica mobile operacional y bloquear variaciones libres:
  - Display: 28
  - Title: 20
  - Section: 17
  - Body: 15
  - Meta: 13
  - Caption minima: 12 (evitar 10 salvo badges no criticos)
- Migrar gradualmente clases `text-[Npx]` hacia tokens semanticos.
- Estado QA: **Parcialmente resuelto**.

---

## [P1] Botones equivalentes no se ven ni se comportan igual

### Evidencia

- En pantallas v2 activas mejora la adopcion de `Button`, pero aun no cierra al 100%:
  - `citas/page-v2.tsx`: 21 manuales, 6 `Button`.
  - `clientes/page-v2.tsx`: 14 manuales, 15 `Button`.
  - `servicios/page-v2.tsx`: 7 manuales, 7 `Button`.
  - `barberos/page-v2.tsx`: 7 manuales, 3 `Button`.
  - `configuracion/page-v2.tsx`: 4 manuales, 9 `Button`.
- Se elimino el sistema paralelo refactor (`button-refactored` + derivados), quedando un solo componente base.

### Impacto

- Acciones iguales cambian en alto, padding, peso, radio y feedback.
- Baja consistencia de memoria muscular y confianza.

### Recomendacion

- Establecer un solo Action System:
  - Componente unico de boton para app productiva.
  - Matriz semantica fija: `Primary`, `Secondary`, `Tertiary/Ghost`, `Destructive`.
  - Alturas estandar: 44 (min), 50 (prominente), 36 (compacto contextual).
- Reducir `button` manual en flujos activos solo a casos de bajo nivel (icon-only infra).
- Estado QA: **Parcialmente resuelto** (avance claro, pendiente cerrar `citas` y `barberos`).

---

## [P1] Drift visual por bypass de tokens de sistema

### Evidencia

- Hay tokenizacion de tipografia/espaciado/touch targets en `src/lib/design-system.ts`.
- No hay adopcion en modulos core (sin imports en v2 activas).

### Impacto

- Cada pantalla define su propio mini-sistema.

### Recomendacion

- Exponer utilidades de clase semantica (`text-body`, `text-meta`, `btn-primary`, etc.) y exigir uso en PR de UI.

---

## [P0] Composicion mobile encajonada por "double inset" y canvas desktop

### Evidencia

- El layout global ya aplica inset mobile: `src/app/(dashboard)/layout.tsx` (`px-4 py-6 pb-24`).
- Encima, pantallas v2 agregan padding interno adicional en mobile (`p-6` o `p-4`) que mantiene doble inset perceptual.
- El `max-w` se acoto correctamente a `lg`:
  - `src/app/(dashboard)/servicios/page-v2.tsx` (`lg:mx-auto lg:max-w-[1400px]`).
  - `src/app/(dashboard)/barberos/page-v2.tsx` (`lg:max-w-[1600px] lg:mx-auto`).
- En mobile se agrupan controles dentro de un bloque contenedor grande antes del contenido principal:
  - `src/app/(dashboard)/barberos/page-v2.tsx` (`bg-white ... rounded-2xl p-4 border shadow-sm`).

### Impacto

- Sensacion de app "dentro de otra caja" en vez de superficie nativa que respira.
- El contenido pierde jerarquia espacial y se siente comprimido en anchos chicos.

### Recomendacion

- Definir `Mobile Page Shell` unico:
  - Un solo inset horizontal por viewport (no doble padding en layout + pagina).
  - En mobile, eliminar `max-w-*` y wrappers tipo canvas desktop para flujo core.
  - Mantener cards por modulo, pero evitar "card padre" que encierre toda la pagina.
- Regla de composicion:
  - Header y acciones primarias con edge alignment consistente.
  - Bloques full-width o almost-full-width con respiracion vertical, no encapsulado extra.
- Estado QA: **Parcialmente resuelto**.

---

## [P1] Charts funcionales pero no "premium touch-first"

### Evidencia

- Componentes de chart priorizan patron desktop:
  - `src/components/analytics/revenue-chart.tsx` usa altura fija `300`, ejes `12px`, tooltip basico.
  - `src/components/analytics/services-chart.tsx` usa altura fija `300`, `YAxis width={120}` (compresion en mobile), tooltip basico.
- En clientes dashboard, charts se montan en cards amplias con `p-6` y jerarquia de dashboard de escritorio:
  - `src/app/(dashboard)/clientes/page-v2.tsx` (bloques de grafica con `rounded-xl ... p-6`).
- En analiticas mobile, el tab contiene charts dentro de cards completas pero sin modelo de lectura tactil (scrub/snap/hit targets):
  - `src/app/(dashboard)/analiticas/page-v2.tsx` (`Tabs` + `RevenueChart`/`ServicesChart`).

### Impacto

- Lectura lenta para uso operativo rapido.
- Visualizacion correcta, pero sin sensacion de precision/pulido nativo.
- Densidad alta y jerarquia debil cuando se mezcla KPI + chart + leyenda en un mismo viewport.

### Recomendacion

- Crear `Mobile Data Viz System`:
  - Alturas semanticas: micro (120-140), standard (160-200), focus (220 max).
  - Reducir grid/ruido visual; priorizar 1 insight por chart.
  - Tooltips touch-first con zonas tactiles amplias, estado activo persistente y cierre claro.
  - Leyendas resumidas y accionables (no solo decorativas).
  - Empty/low-data states premium (explican que hacer, no solo "sin datos").
- Aplicar contrato de interaccion:
  - scrub horizontal con feedback visual claro,
  - snap por punto temporal,
  - delta contextual (vs periodo anterior) siempre visible.

---

## [P0] Arquitectura de bottom nav no separa bien destinos vs accion global

### Evidencia

- La navegacion inferior ahora separa destinos y accion global:
  - `src/components/dashboard/bottom-nav.tsx` usa `Citas`, `Clientes`, `Servicios`, `Mas` + boton `+` centrado.
- `Inicio` fue movido correctamente al drawer de `Mas` (`src/components/dashboard/more-menu-drawer.tsx`).

### Impacto

- La arquitectura base mejora velocidad y claridad de navegacion.

### Recomendacion

- Mantener esta arquitectura como contrato fijo de producto.
- Extender quick actions para incluir `Nuevo Barbero` si se mantiene como flujo core.
- Estado QA: **Resuelto (arquitectura)**.

---

## [P2] Boton `+` global: verificar cobertura completa de intents

### Evidencia

- En `src/components/dashboard/bottom-nav.tsx`, `handleQuickAction` navega con `router.push(\`\${action.href}?intent=create\`)`.
- `citas`, `clientes` y `servicios` consumen `intent=create` y auto-abren su formulario de creacion.

### Impacto

- Mejora fuerte de velocidad de tarea en mobile.
- Riesgo residual: asegurar paridad en todos los flujos nuevos que se agreguen al `+`.

### Recomendacion

- Formalizar `Create Intent Contract` para futuros modulos:
  - mantener query intent (`?intent=create`) como contrato oficial.
  - testear cold navigation + same-route navigation en QA mobile.
- Estado QA: **Resuelto en flujos actuales**.

---

## [P1] Safe areas y cutouts: soporte tecnico presente, gobernanza incompleta

### Evidencia

- La app ya tiene base tecnica correcta para PWA edge-to-edge:
  - `src/app/layout.tsx` usa `viewportFit: 'cover'`.
  - `src/app/globals.css` define utilidades con `env(safe-area-inset-*)` (`pt-safe`, `pb-safe`, `p-safe`).
  - Flujos puntuales usan safe area (`bottom-nav`, `drawer`, varios sheets con `pb-safe`).
- Evidencia visual adicional:
  - En iOS se mantiene una franja blanca en la zona superior (status bar), generando salto de superficie respecto al fondo oscuro del contenido.
- Aun no existe un contrato universal de aplicacion + matriz de QA por dispositivo.

### Impacto

- Riesgo de solapamientos puntuales con notch/cutout o barra de gestos en algunas vistas.
- Comportamiento inconsistente entre iOS y Android segun pantalla/componente.
- Sensacion de "no premium" por discontinuidad cromatica en el borde superior de la app.

### Recomendacion

- Formalizar un contrato `Safe Area / Cutout` para toda superficie mobile.
- Incluir QA obligatorio en iOS (notch/dynamic island) y Android (hole-punch/cutout + gesture nav).
- Mantener edge-to-edge, pero con insets consistentes por tipo de contenedor.
- Garantizar continuidad visual en `safe-area-inset-top` (sin banda blanca inesperada) en:
  - Safari iOS,
  - PWA standalone iOS.

---

## [P0] Dropdown nativo inestable dentro de sheet (Nueva Cita)

### Evidencia

- En `src/app/(dashboard)/citas/page-v2.tsx`, `Nueva Cita` ahora usa botones + sheet picker dedicado para cliente/servicio/barbero (sin `<select>` nativo en el sheet principal).
- El flujo de seleccion ahora mantiene control visual y z-index consistentes dentro del sistema de overlays.

### Impacto

- Se reduce de forma fuerte el riesgo de desalineacion y ruptura visual reportada en iOS/PWA.

### Recomendacion

- Mantener este patron y prohibir regresiones a `<select>` nativo en overlays animados.
- Validar especificamente en iOS Safari + iOS PWA standalone + Android Chrome.
- Estado QA: **Resuelto**.

---

## [P0] Date/Time picker nativo rompe calidad en dark mode y usabilidad

### Evidencia

- En `src/app/(dashboard)/citas/page-v2.tsx`, `Hora` ya migro a `IOSTimePicker` + `TimePickerTrigger`.
- `Fecha` sigue en `input type="date"` (aunque con `dark:[color-scheme:dark]`).
- El riesgo visual/UX nativo ahora se concentra solo en fecha.

### Impacto

- Mejora clara de calidad en seleccion de hora.
- Persiste inconsistencia de experiencia en fecha segun navegador/dispositivo.

### Recomendacion

- Completar unificacion migrando tambien `Fecha` a picker dedicado de sistema.
- Si se mantiene nativo temporalmente: mantener estrategia dark + matrix de QA real en iOS/Android/PWA.
- Estado QA: **Parcialmente resuelto**.

---

## Addendum: Matriz de consistencia solicitada (texto y botones)

## Tipografia (estado actual vs objetivo)

- Estado actual: mejora real (sin `text-[10px]` en modulos core auditados), pero aun con variacion amplia no tokenizada.
- Objetivo: 5-6 niveles maximos, semanticos, repetibles, sin excepciones ad-hoc.

## Botones (estado actual vs objetivo)

- Estado actual: coexisten botones de sistema + botones manuales por modulo + variante refactor paralela.
- Objetivo: una sola API de boton, mismo comportamiento para misma accion, solo cambia jerarquia semantica.

## Reglas de oro

1. Misma accion = mismo estilo base en toda la app.
2. Mismo nivel de informacion = mismo tamano de texto.
3. Ningun flujo core nuevo con `button` manual sin justificacion.
4. Ningun texto operativo por debajo de 12px.
5. En mobile, no duplicar inset horizontal entre layout y pagina.
6. No usar "card padre" para encapsular toda una pantalla operativa.
7. Bottom nav: maximo 4 destinos fijos y una accion global `+` fuera del tab set.
8. Todo contenedor mobile respeta safe area y zonas de gestos (iOS/Android) por contrato, no por excepcion.

---

## Analisis por pantalla (con foco interaccion)

## 1) Dashboard

### Lo bueno

- Buen baseline de estructura.
- Navegacion inferior persistente.

### Gap premium

- No hay "hero action flow" claramente dominante.
- Motion de tarjetas existe, pero no cuenta historia operativa.

### Mejoras

- Primer bloque: "Que requiere accion ahora".
- Microinteracciones:
  - stat change animation semantica (up/down con delta),
  - refresh reveal suave en bloque critico,
  - quick actions con confirmacion instantanea.

---

## 2) Citas

### Lo bueno

- Bloques temporales ayudan al escaneo.

### Gap premium

- Exceso de controles visibles.
- Gesture model incompleto para una pantalla naturalmente gestual.

### Mejoras

- Dia como modo canonico mobile.
- Gestos:
  - swipe en cita para confirmar/reagendar/cancelar,
  - drag entre bloques horario con snap,
  - pull-to-refresh en timeline.
- Motion:
  - current-time indicator con animacion sutil,
  - reflow suave al mover una cita (no jump cut).

---

## 3) Clientes

### Lo bueno

- Busqueda y segmentacion presentes.

### Gap premium

- Arranque denso.
- Muchos subcontroles en compresion.
- Dashboard de datos con patrones de chart mas desktop que mobile.

### Mejoras

- Vista canonica: lista con prioridad operacional.
- Si hay dashboard, mostrar solo 1 chart principal arriba del fold.
- Gestos:
  - swipe item para WhatsApp/nota/recordatorio,
  - long press para menu contextual rapido.
- Motion:
  - reveal de acciones por row,
  - transicion master-detail con continuidad de avatar/nombre.

---

## 4) Servicios

### Lo bueno

- CTA de alta visible.

### Gap premium

- Tabla compleja para mobile.
- Shell usa canvas desktop en mobile (`max-w` + padding extra), se siente encajonado.

### Mejoras

- Lista de tarjetas compactas como base.
- Eliminar contenedor padre desktop en mobile y dejar flujo respirable edge-aware.
- Gestos:
  - swipe para editar/pausar/eliminar,
  - reorder por drag cuando aplique.
- Motion:
  - expansion inline de detalle con altura animada.

---

## 5) Barberos

### Lo bueno

- Sheet de alta bien encaminado.

### Gap premium

- Multi-view en mobile fragmenta la experiencia.
- Contenedor de controles en card grande + canvas max-width refuerza sensacion de "app enmarcada".

### Mejoras

- Una vista canonica + switch avanzado secundario.
- Composicion mobile sin card padre de pantalla (cards internas si, encapsulado global no).
- Motion:
  - rank changes con animacion de posicion,
  - progresion de metricas con counter semantico.
- Gestos:
  - swipe para acciones frecuentes por barbero.

---

## 6) Configuracion

### Lo bueno

- Buen patron por secciones y sheets.

### Gap premium

- Cierre de tarea no siempre se siente "concluido".
- Dismiss behavior vario entre overlays.

### Mejoras

- Sheet contract unico:
  - drag down dismiss,
  - CTA footer sticky,
  - estado "sin cambios / cambios pendientes / guardado".
- Motion:
  - success transition breve al guardar seccion.

---

## 7) Analiticas

### Lo bueno

- Arquitectura tecnica buena (lazy loading, boundaries, tabs mobile).

### Gap premium

- Charts con semantica visual generica y altura fija; falta lectura tactil de alta calidad.
- Jerarquia mezcla KPI y charts sin una narrativa de "insight principal" por viewport.

### Mejoras

- Mobile-first chart choreography:
  - 1 insight principal por pantalla,
  - chart focus + resumen delta + accion sugerida.
- Estandarizar interaccion tactil en charts (scrub, snap, active point, tooltip estable).

---

## Motion System propuesto (Interaction OS v1)

## 1. Tokens de tiempo

- `instant`: 80-120ms (tap feedback)
- `fast`: 140-180ms (micro state)
- `normal`: 220-280ms (panel/card transition)
- `slow`: 320-420ms (scene transition)

## 2. Tokens de fisica

- `spring/snappy`: acciones directas (tap, chip, segmented)
- `spring/gentle`: apertura/cierre de bloques
- `spring/settle`: overlays y reordenamientos

## 3. Semantica de movimiento

- `enter`: aparece con contexto (fade + slight translate)
- `exit`: sale con direccion coherente
- `shift`: reacomodo sin salto
- `confirm`: pulse o check corto
- `error`: shake minimo + mensaje claro

## 4. Reglas de calidad

- No animar mas de 2 capas simultaneas sin necesidad.
- Reducir motion automaticamente en `prefers-reduced-motion`.
- Mantener 60fps en listas y drag.

---

## Gesture Grammar propuesto (mobile)

## Global

- Pull down en listas: refresh.
- Drag down en sheet/drawer: dismiss.
- Tap fuera de overlay: close (si no hay riesgo de perdida).

## Entidades de lista (citas/clientes/servicios/barberos)

- Swipe left: acciones rapidas.
- Swipe right: opcion contextual si aporta.
- Long press: menu de acciones avanzadas.

## Navegacion

- Edge swipe para volver cuando la arquitectura lo soporte.
- Bottom nav con press-state y transicion de indicador consistente.

## Umbrales recomendados

- Reveal acciones: 24px
- Commit accion: 72px
- Dismiss panel: 120-160px o alta velocidad

---

## Microinteracciones que faltan (high impact)

1. Confirmacion tactil/visual al completar cita.
2. Transicion shared-element entre lista y detalle (cliente/barbero).
3. Persistencia visual de contexto al abrir sheet (background scale/blur coherente).
4. Estado "saving" en CTA footer con bloqueo temporal claro.
5. Empty states con accion inmediata (no solo mensaje).
6. Skeletons semanticos por modulo (no genericos).
7. Reordenamiento animado en cambios de ranking/estado.

---

## Anti-patterns a evitar para lograr nivel premium

- Animar por decorar, no por informar.
- Repetir bounce/scale en todo.
- Mezclar gestos distintos para la misma accion segun pantalla.
- Meter 4+ controles de jerarquia alta en primer viewport.
- Mantener texto pequeno por densidad.
- Mantener doble contenedor (layout + pagina) en mobile.
- Tratar charts mobile como mini version de dashboard desktop.

---

## Roadmap propuesto (sin codigo aun)

## Fase 1: Foundation (1 sprint)

1. Definir Interaction OS (motion tokens + gesture grammar + copy rules).
2. Congelar variantes experimentales en rutas demo.
3. Establecer vista canonica mobile por modulo.
4. Definir Type Scale semantica unica para mobile.
5. Definir matriz unica de jerarquia de botones.
6. Definir Mobile Page Shell (inset unico, sin `max-w` en vistas core mobile).
7. Definir Navigation Architecture mobile (4 tabs fijos + `+` global + `Mas` secundario).
8. Definir Safe Area / Cutout Contract universal para PWA edge-to-edge.

## Fase 2: Core flows (1-2 sprints)

1. Citas: modelo gestual completo + foco en dia.
2. Clientes: simplificacion arriba del fold + swipe actions.
3. Servicios: pasar de tabla a lista mobile-first.
4. Migrar botones manuales de flujos v2 a componente unico.
5. Eliminar `text-[10px]` en superficies operativas.
6. Remover "card padre" en pantallas mobile donde hoy encajona contenido.

## Fase 3: Overlay system (1 sprint)

1. Unificar `sheet` y `drawer` en contrato unico de comportamiento.
2. Footer CTA sticky + estados de guardado.
3. Drag-to-dismiss consistente en todos los overlays.

## Fase 4: Mobile Data Viz System (1 sprint)

1. Definir tokens de chart mobile (altura, densidad de ejes, tooltip touch, leyenda).
2. Aplicar estandar en `analiticas` y `clientes` dashboard.
3. Validar readability en 360/375/390 sin truncamientos criticos.

## Fase 5: Polish y medicion (1 sprint)

1. Mapa de microinteracciones final.
2. Instrumentacion:
3. time-to-first-action.
4. completion por flujo.
5. error/retry rate.
6. abandono de overlays.
7. consistency score de UI (type scale + buttons + shell + charts).

---

## Definition of Done (nivel Apple/Awwwards aplicado a producto operativo)

- Cada pantalla responde "que hago ahora?" en <= 2 segundos.
- Cada accion primaria tiene feedback inmediato (visual + tactil cuando posible).
- Gestos consistentes entre modulos y aprendibles en un solo uso.
- Transiciones entre pantallas mantienen continuidad espacial.
- Overlays cierran/guardan con reglas uniformes.
- Ningun flujo core usa botones manuales para acciones primarias/secundarias.
- No hay texto operativo por debajo de 12px.
- Mismo rol semantico de boton mantiene mismo alto/radio/padding en todos los modulos.
- No existe doble inset en mobile ni `max-w` desktop en vistas core de telefono.
- No existe "card padre" envolviendo toda la pagina operativa en mobile.
- Charts mobile cumplen checklist touch-first (altura, tactilidad, legibilidad, insight unico).
- Bottom nav usa 4 destinos fijos y la creacion global vive en boton `+` persistente.
- No hay mezcla de idioma en superficie operativa.
- La app se siente calmada, precisa y confiable en uso diario.

---

## Lo que aun falta para nivel Apple (bloqueante)

1. Cerrar decisiones de sistema (hoy aun hay libertad por pantalla).
2. Convertir criterios UX en gates de release (pass/fail, no opinion).
3. Garantizar consistencia en uso con una mano y tareas repetitivas.
4. Garantizar continuidad bajo interrupciones de red y estados vacios.

---

## Contratos no negociables (v1)

## 1) Navigation Contract

- Bottom nav fijo: `Citas`, `Clientes`, `Servicios`, `Mas`.
- `+` global persistente para creacion rapida.
- `Inicio` no vive como tab primario.
- Maximo 4 destinos en barra inferior.
- El indicador activo debe reflejar siempre la ruta real (incluido primer arranque, hydration y redirecciones).

## 2) Page Shell Contract

- Un solo inset horizontal mobile por viewport.
- Prohibido `max-w-*` tipo desktop en vistas core de telefono.
- Prohibido "card padre" envolviendo toda la pantalla operativa.

## 3) Typography Contract

- Escala semantica unica:
  - Display 28, Title 20, Section 17, Body 15, Meta 13, Caption 12.
- Prohibido `text-[10px]` en informacion operativa.
- Mismo nivel semantico = mismo tamano en toda la app.

## 4) Action Contract (botones)

- Un solo componente de boton para producto.
- Matriz fija: `Primary`, `Secondary`, `Tertiary/Ghost`, `Destructive`.
- Alturas fijas: 44 (min), 50 (prominente), 36 (compacto contextual).
- Prohibido `button` manual para acciones primarias/secundarias.

## 5) Overlay Contract

- Sheets/drawers con el mismo comportamiento:
  - drag down dismiss,
  - tap backdrop dismiss (si no hay riesgo de perdida),
  - CTA footer sticky,
  - estados: `idle`, `dirty`, `saving`, `saved`, `error`.

## 6) Motion + Feedback Contract

- Todos los timings/springs provienen de tokens.
- No hover-driven UX en mobile; priorizar tap/drag/scroll states.
- Feedback inmediato en acciones clave:
  - visual siempre,
  - tactil cuando el dispositivo lo soporte.

## 7) Data Viz Contract (mobile)

- Un insight principal por viewport.
- Alturas semanticas:
  - micro: 120-140
  - standard: 160-200
  - focus: hasta 220
- Tooltip touch-first estable + snap por punto + delta contextual visible.
- Prohibido chart "desktop miniaturizado" en mobile.

## 8) State Contract

- Todo modulo core debe definir estados:
  - loading,
  - empty,
  - error (con retry),
  - success.
- Empty states siempre con accion inmediata sugerida.

## 9) Accessibility Contract

- Touch targets minimos de 44x44 en acciones interactivas.
- Soporte de Dynamic Type sin ruptura de layout en tamanos grandes.
- Labels accesibles para icon-only actions (lectores de pantalla).
- Respeto estricto de `prefers-reduced-motion`.
- Contraste suficiente en informacion operativa y estados criticos.

## 10) Safe Area / Cutout Contract

- Mantener `viewport-fit=cover` para experiencia edge-to-edge.
- Todos los shells mobile aplican insets via utilidades semanticas (no hardcode por pantalla).
- Elementos persistentes (bottom nav, FAB, CTA footer, sheets) nunca pisan:
  - indicador de home en iOS,
  - barra de gestos en Android.
- Inset lateral/top/bottom se valida en:
  - portrait,
  - landscape,
  - modo standalone PWA.
- Android se considera explicitamente:
  - notch/cutout,
  - hole-punch,
  - navegacion por gestos.

## 11) Form Controls in Overlay Contract

- Inputs criticos en sheet/modal no deben depender de popups nativos inestables.
- Selectores de cliente/servicio/barbero en mobile deben usar patron robusto:
  - listbox/picker con portal estable, o
  - pantalla/select sheet dedicada.
- Cualquier control con popup debe validarse dentro de overlays animados.
- Fecha y hora en flujos core deben usar picker unificado theme-aware (no UX divergente por navegador).

## 12) Promo Banner Contract

- Banners persistentes de producto (ej. trial/suscripcion) deben respetar un contrato unico:
  - altura minima consistente,
  - margenes verticales semanticos contra header y primer bloque operativo,
  - radio y tratamiento de borde/sombra sin lineas fantasma.
- Prohibido stacking de capas que genere artefactos de 1px entre banner y secciones adyacentes.
- CTA secundaria (`Ver detalles`) debe cumplir:
  - area tactil minima de 44x44,
  - contraste suficiente,
  - truncado predecible sin romper alineacion horizontal.
- El banner nunca debe competir con la accion primaria del modulo (`+`, crear, confirmar).

---

## Release Gates (ship/no-ship)

## Estado actual de gates (post-iteracion QA)

- Gate A (Consistencia estructural): **PARCIAL**.
- Gate B (Tipografia y acciones): **PARCIAL ALTA**.
- Gate C (Interaccion): **PARCIAL ALTA**.
- Gate D (Performance perceptual): **PENDIENTE DE MEDICION**.
- Gate E (Data Viz mobile): **FAIL**.
- Gate F (Copy UX): **PENDIENTE DE VALIDACION GLOBAL**.
- Gate G (Accesibilidad operacional): **PENDIENTE DE PRUEBAS FORMALES**.
- Gate H (Safe Area / Cutout): **PARCIAL** (base tecnica correcta; falta matriz completa en hardware real).
- Gate I (Formularios en overlays): **PARCIAL ALTA**.

---

## Gate A: Consistencia estructural

- PASS si 100% de pantallas core respetan Navigation + Page Shell Contract.
- FAIL si existe al menos 1 flujo core con doble inset, card padre de pantalla, o indicador activo de nav desincronizado con la ruta actual.

## Gate B: Consistencia tipografica y acciones

- PASS si 100% de superficies core usan escala tipografica semantica y boton unico.
- FAIL si hay `text-[10px]` operativo o botones manuales primarios.

## Gate C: Interaccion

- PASS si gestos y overlays son coherentes entre modulos.
- FAIL si la misma accion usa patrones diferentes segun pantalla.

## Gate D: Performance perceptual

- PASS si:
  - feedback de tap <= 100ms,
  - transicion comun <= 300ms perceptuales,
  - scroll y drag sin jank visible.
- FAIL si hay micro-lag perceptible en tareas repetitivas o si el fondo/gradientes muestran carga progresiva visible (ej. izquierda -> derecha).

## Gate E: Data Viz mobile

- PASS si charts son legibles y accionables en 360/375/390.
- FAIL si labels/leyendas se truncaron de forma critica o no hay interaccion tactil util.

## Gate F: Calidad de copy UX

- PASS si no hay mezcla ES/EN en superficie operativa.
- FAIL si tono y terminologia cambian por modulo.

## Gate G: Accesibilidad operacional

- PASS si:
  - acciones criticas cumplen 44x44,
  - icon-only tiene label accesible,
  - Dynamic Type no rompe flujos core,
  - reduced motion mantiene usabilidad.
- FAIL si cualquier flujo core pierde accionabilidad por accesibilidad.

## Gate H: Safe Area y dispositivos con notch/cutout

- PASS si:
  - no hay solapamientos con notch/cutout/home indicator/gesture bar,
  - bottom nav/FAB/sheets mantienen separacion segura,
  - portrait + landscape en standalone PWA son usables,
  - la zona superior (status bar/safe-area top) mantiene continuidad visual con el shell de la app (sin franja blanca no intencional).
- FAIL si algun control primario queda comprometido por insets.

## Gate I: Formularios en overlays (fiabilidad)

- PASS si dropdowns/pickers en sheets/modals:
  - no se desalinean,
  - no quedan tapados por backdrop/z-index,
  - mantienen seleccion y foco correctamente,
  - preservan modo correcto del flujo (`crear` vs `editar`) sin mezclar acciones,
  - respetan dark mode (iconografia/contraste) y no degradan la experiencia al abrir picker.
- FAIL si un control de seleccion se rompe en iOS/Android/PWA.

---

## Ritual de calidad recomendado

1. Design Review semanal de 3 flujos canonicos (`Crear cita`, `Gestionar cliente`, `Editar servicio`).
2. Accessibility Review semanal sobre esos mismos flujos.
3. QA mobile en dispositivos 360/375/390 antes de cada release.
4. Checklist de release firmado por Engineering + Product + Design.
5. QA minima en hardware real (iPhone con notch/dynamic island + Android con hole-punch/cutout y gesture navigation).
6. Smoke test obligatorio de formularios en overlays (`Nueva Cita` incluido).
7. Cualquier FAIL en gates A-I bloquea release.

---

## Conclusion

Tu intuicion era correcta: faltaba profundizar en animaciones y gestos, pero no en cantidad, sino en sistema.

Esta iteracion movio la app de forma clara hacia el objetivo. El siguiente salto grande depende de cerrar 3 frentes: unificar picker de fecha, terminar migracion de acciones manuales y elevar data-viz a patron touch-first.

---

## Recomendaciones Finales Consolidadas (para cerrar gap Apple/Awwwards)

## Veredicto de readiness

- Con los cambios actuales: **aun no Awwwards-level**.
- Objetivo realista: llegar a nivel "premium operacional" en 2-3 iteraciones mas, si se cierran los bloqueantes de esta lista.

## Prioridad P0 (obligatorio antes de afirmar nivel premium)

1. Completar `Interaction OS` unificado:
   - mismo sistema de motion, gestos y feedback en todos los modulos core.
2. Unificar Date + Time picker en `Nueva Cita`:
   - remover dependencia de `input[type=date]` nativo en flujo core.
3. Cerrar inconsistencia de shell mobile:
   - eliminar por completo la sensacion de "card padre" y doble inset en vistas operativas.
4. Resolver acceso admin en mobile sin loops silenciosos:
   - definir cambio de contexto explicito entre `Negocio` y `Super Admin`.
   - evitar redirecciones opacas que bloqueen la intencion del usuario.

## Prioridad P1 (sube percepcion de calidad y coherencia)

1. Estandarizar Header CTA Contract:
   - misma posicion, escala y jerarquia del boton `+` en `servicios`, `clientes`, `barberos`.
2. Estandarizar Action Contract:
   - minimizar `button` manual en flujos core y cerrar API unica de acciones.
3. Estandarizar Typography Contract:
   - converger todas las pantallas activas a escala semantica fija.
4. Elevar Data Viz mobile a touch-first:
   - charts con lectura rapida, interaccion tactil util y narrativa accionable.
5. Corregir microfricciones de layout:
   - `Fecha | Hora` en composicion compacta cuando el ancho lo permita.
   - CTA "Ver todas" sin saltos de linea en viewports chicos.
6. Rediseñar `MobileHeader` en pantallas internas:
   - evitar barra persistente de branding (`nombre negocio + campana`) en todos los modulos operativos.
   - usar header contextual por vista y dejar branding para `Inicio`/`Mas`.

## Prioridad P2 (pulido de excelencia)

1. Reducir patrones hover-only en mobile.
2. Formalizar matriz de QA real por dispositivo:
   - iPhone notch/dynamic island, Android hole-punch/cutout, gesture nav.
3. Consolidar copy UX (tono/idioma) para eliminar drift entre modulos.

## Recomendaciones especificas: Admin SaaS en mobile

1. Definir `Admin Context Switch Contract`:
   - un entrypoint visible para cambiar entre panel de negocio y panel super admin.
2. Corregir fallback de admin sin negocio:
   - reemplazar `redirect` forzado por una pantalla de decision contextual (o switch persistente).
3. Alinear navegacion admin mobile:
   - el destino "Volver" debe ser predecible y consistente con el contexto actual.
4. Agregar gate de QA:
   - "Admin puede entrar/salir de ambos contextos en mobile sin bloqueo ni confusion".

## Recomendaciones especificas: Header Mobile Superior (nombre negocio + campana)

### Contexto actual

- El componente actual (`src/components/dashboard/mobile-header.tsx`) muestra siempre logo/scissors + nombre del negocio + campana de notificaciones.
- En vistas operativas (ej. `Citas`) este header compite con el contenido principal y consume altura valiosa.

### Opcion A: Mantener header global, solo reducirlo

- Cambios:
  - bajar altura y reducir peso visual del nombre.
  - mantener campana persistente.
- Pros:
  - cambio rapido y de bajo riesgo.
- Contras:
  - sigue duplicando contexto (branding + titulo de pantalla) y mantiene ruido en tareas operativas.

### Opcion B: Header contextual por pantalla (Recomendada)

- Cambios:
  - en pantallas internas mostrar titulo de la vista (`Citas`, `Clientes`, `Servicios`, etc.).
  - mover branding (nombre/logo) a `Inicio` y `Mas`.
  - notificaciones via campana compacta e inbox dedicado.
- Pros:
  - mejora foco, reduce carga cognitiva y libera espacio vertical.
  - comportamiento mas cercano a apps mobile premium orientadas a tarea.
- Contras:
  - requiere contrato unico de header en todos los modulos.

### Opcion C: Header auto-hide + acciones contextuales

- Cambios:
  - header compacto que se oculta al scroll down y reaparece al scroll up.
  - acciones dinamicas por modulo.
- Pros:
  - maximiza area util y sensacion nativa.
- Contras:
  - mayor complejidad y riesgo de inconsistencias si no hay `Interaction OS` cerrado.

### Recomendacion experta (skills: `mobile-design` + `web-design-guidelines`)

- Elegir **Opcion B** como baseline de producto.
- Aplicar **Opcion C** solo despues de cerrar consistencia de motion/gestos.
- Regla de calidad:
  - branding persistente solo en superficies de contexto global,
  - header operativo siempre orientado a la tarea actual.

### Decision para este producto (notificaciones criticas y frecuentes)

- Dado que las notificaciones son operativas y frecuentes, se recomienda modelo **hibrido**:
  - campana **icon-only** persistente en header contextual (acceso en 1 tap),
  - inbox completo dentro de `Mas`,
  - badge consistente en campana e inbox.
- Se descarta mover notificaciones solo a `Mas`, porque agregaria friccion en escenarios de alta frecuencia.

### Notification Contract (v1)

- Acceso:
  - campana compacta siempre visible en vistas core (`Citas`, `Clientes`, `Servicios`, `Barberos`).
  - tap abre centro de notificaciones con historial accionable.
- Estructura del inbox:
  - `Nuevas`,
  - `Hoy`,
  - `Archivadas`.
- Acciones por item:
  - `Abrir`,
  - `Marcar leida`,
  - `Silenciar tipo`.
- Señal:
  - badge numerico en campana cuando haya pendientes,
  - eventos criticos disparan banner/toast contextual.
- Regla anti-ruido:
  - sin pendientes, campana sin badge ni indicadores extras.

## Criterio de cierre (cuando si seria "nivel Awwwards")

- Solo considerar "Awwwards-ready" cuando:
  - Gates A-I esten en **PASS**,
  - no existan loops funcionales en mobile (incluido admin context),
  - y los flujos canonicos (`Crear cita`, `Gestionar cliente`, `Editar servicio`) se perciban consistentes en movimiento, gestos y feedback.
