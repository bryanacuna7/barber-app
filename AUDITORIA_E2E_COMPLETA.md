# Auditoria E2E Completa - BarberApp

**Fecha:** 23 de febrero de 2026
**Entorno evaluado:** `localhost:3000` (con validaciones parciales en `localhost:3008`)
**Stack:** Next.js 16 + React 19 / Supabase (PostgreSQL + Auth)
**Perspectivas auditadas:** Cliente, Barbero, Dueno/Administrador

---

## Resumen ejecutivo

**Estado para salida a produccion: NO APTO.**

Se identificaron 7 hallazgos de prioridad Alta (P0) que bloquean el lanzamiento, 6 de prioridad Media (P1) que afectan la operacion y confianza del release, y 3 de prioridad Baja (P2) que impactan la retencion a mediano plazo.

Los bloqueadores criticos son:

1. CTAs de autenticacion en reserva publica apuntan a rutas inexistentes (fuga de conversion).
2. Contrato de `data-testid` entre E2E y UI desalineado en `Mi Dia` (0/9 tests pasan; el rol barbero queda sin validacion).
3. Redireccion por rol rompe supuestos de la suite de autenticacion.
4. Pantalla post-reserva es un punto muerto sin navegacion para el cliente.
5. Skeletons perpetuos y datos fantasma en dashboards de Barbero y Dueno.
6. El cliente no puede ver disponibilidad antes de entrar al perfil de cada barbero (16 clics vs 7-8 ideales).
7. Errores `429 Too Many Requests` de Supabase en flujos administrativos bajo carga.

### Resultados de ejecucion de suites E2E

| Suite                                              | Resultado                        | Notas                            |
| -------------------------------------------------- | -------------------------------- | -------------------------------- |
| Legacy desktop (`auth`, `clients`, `appointments`) | 6 passed / 14 failed             | Contratos desfasados             |
| Auth moderna (`auth-flow.spec.ts`)                 | 14 passed / 9 failed / 1 skipped | Fallos por redireccion de rol    |
| Mi Dia barbero (`mi-dia.spec.ts`)                  | 0 passed / 9 failed              | Contrato UI completamente roto   |
| Booking publico movil (legacy)                     | 5 passed / 1 failed              | Selector ambiguo                 |
| Booking moderno (`booking-flow.spec.ts`)           | Fallos generalizados             | Depende de seed/slug inexistente |

---

## Alcance y metodologia

- Ejecucion de suites E2E existentes (legacy y modernas).
- Validacion manual de flujos clave en navegador automatizado (Playwright).
- Revision UX/UI y analisis de friccion (click-depth) por persona.
- Relevamiento de bugs, puntos muertos y problemas de testabilidad.

**Limitaciones:**

1. Build de produccion local no totalmente reproducible por bloqueo de descarga de fuentes externas.
2. Parte de la evidencia se levanto en `:3000` por estabilidad operativa.
3. Suites legacy estaban desactualizadas respecto al estado real de la UI.

---

## 1. Perspectiva del Cliente

### 1.1 Estado de flujos

| Flujo                                | Estado       | Detalle                                                                                                      |
| ------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------ |
| Acceso desde Landing                 | Bloqueado    | La home esta orientada a ventas B2B; el flujo real del cliente inicia desde URL directa (`/reservar/[slug]`) |
| Reserva completa (happy path)        | Funcional    | 5/6 tests legacy pasan; flujo por pasos claro con buen uso de progress                                       |
| CTAs de login/registro desde loyalty | **Roto**     | Apuntan a `/auth/signup` y `/auth/login` que no existen                                                      |
| Pantalla post-reserva                | Punto muerto | Sin navegacion ni acciones despues de confirmar                                                              |

### 1.2 Analisis de friccion (click-depth)

- **Complejidad base:** 7-8 clics si el usuario conoce horario y barbero.
- **Complejidad real medida:** 16 clics.
- **Causa principal:** El cliente no puede ver disponibilidad antes de entrar al perfil de cada barbero; debe entrar y salir repetidamente buscando huecos en la agenda.
- **Mejora sugerida:** Preseleccion inteligente de barbero/fecha cuando solo hay una opcion disponible.

### 1.3 Hallazgos

#### P0-CLI-01: CTAs de autenticacion rotos en reserva publica

- **Prioridad:** Alta (P0)
- **Impacto:** Conversion directa y retencion de clientes.
- **Evidencia:**
  - `window.location.href = '/auth/signup'` -- ruta inexistente.
  - `window.location.href = '/auth/login'` -- ruta inexistente.
  - Archivo: `src/app/(public)/reservar/[slug]/page.tsx` lineas 282 y 286.
- **Riesgo:** Punto muerto total desde banner loyalty para usuarios no autenticados. Fuga directa en conversion.
- **Recomendacion:** Corregir a rutas existentes (`/register`, `/login`) y cubrir con test E2E.

#### P0-CLI-02: Pantalla post-reserva es un punto muerto

- **Prioridad:** Alta (P0)
- **Impacto:** Experiencia de cliente y retencion.
- **Evidencia:** Tras confirmar cita, el cliente ve "Cita reservada!" sin menu, sin boton "Ver mis citas", sin opcion "Agregar al Calendario".
- **Recomendacion:** Agregar navegacion post-cita (Mis Citas, Agregar al Calendario, Volver al inicio).

#### P0-CLI-03: Sin indicadores de disponibilidad antes de seleccionar barbero

- **Prioridad:** Alta (P0)
- **Impacto:** Friccion excesiva; duplica los clics necesarios.
- **Evidencia:** Los perfiles de barberos no muestran si tienen huecos libres. El cliente debe entrar en cada perfil individualmente.
- **Recomendacion:** Agregar indicadores visuales ("Disponible" / "Completo") en la lista de barberos.

#### P1-CLI-01: Indicadores de disponibilidad poco visibles en movil

- **Prioridad:** Media (P1)
- **Impacto:** Usabilidad movil.
- **Evidencia:** Los dias/horarios sin disponibilidad solo cambian a un gris tenue, apenas perceptible en pantalla movil. No hay texto explicito como "Agotado".
- **Recomendacion:** Usar estados visuales claros (color, texto, icono) para slots no disponibles.

#### P1-CLI-02: Mensajes de error vagos en formularios

- **Prioridad:** Media (P1)
- **Impacto:** Conversion y experiencia.
- **Evidencia:** Errores de validacion devuelven "Invalid request" en ingles en vez de marcar el campo especifico que fallo.
- **Recomendacion:** Implementar validacion campo por campo con mensajes en espanol (ej. "El telefono debe tener 8 digitos").

#### P1-CLI-03: Selector ambiguo en booking legacy

- **Prioridad:** Media (P1)
- **Impacto:** Ruido en auditoria y falsos fallos.
- **Evidencia:** Selector `h1, h2` en strict mode en `e2e/appointments.spec.ts` linea 27.
- **Recomendacion:** Cambiar a selector unico con `data-testid` o `role` especifico.

#### P1-CLI-04: Suite de booking moderna depende de seed/slug fijo

- **Prioridad:** Media (P1)
- **Impacto:** Cobertura de tests del flujo cliente inestable.
- **Evidencia:**
  - Test usa slug fijo `barberia-test`: `tests/e2e/booking-flow.spec.ts` linea 21.
  - Prerequisito explicito de seed: `tests/e2e/booking-flow.spec.ts` linea 19.
- **Riesgo:** Timeouts y falsos fallos cuando el dataset no coincide con lo esperado.
- **Recomendacion:** Parametrizar por variable de entorno (`TEST_BUSINESS_SLUG`) y consolidar seed unico para CI y local.

#### P2-CLI-01: Textos largos rompen tarjetas de servicio en movil

- **Prioridad:** Baja (P2)
- **Impacto:** Consistencia visual.
- **Evidencia:** Descripciones como "Beard Deluxe" con texto extenso rompen el layout de las tarjetas en pantallas pequenas.
- **Recomendacion:** Truncar con ellipsis y mostrar descripcion completa al expandir.

---

## 2. Perspectiva del Barbero

### 2.1 Estado de flujos

| Flujo                         | Estado                      | Detalle                                                      |
| ----------------------------- | --------------------------- | ------------------------------------------------------------ |
| Gestion de agenda             | Funcional                   | Modales funcionales, flujo excelente                         |
| Check-in / Finalizar cita     | Eficiente                   | 1-2 clics por accion                                         |
| Mi Dia (validacion E2E)       | **Sin cobertura confiable** | 0/9 tests pasan; contrato de pruebas completamente desfasado |
| Redireccion post-login        | Funcional pero rompe tests  | Layout redirige a `/mi-dia`, tests esperan `/dashboard`      |
| Bloqueo de tiempo (descansos) | Sin funcionalidad dedicada  | Requiere workaround via "Anadir Cita"                        |

### 2.2 Analisis de friccion (click-depth)

- **Check-in:** 1 clic. Complejidad baja.
- **Completar cita:** 1 clic + posible seleccion de metodo de pago. Complejidad media-baja.
- **Bloquear tiempo para descanso:** Varios clics usando workaround de "Anadir Cita". Friccion alta.
- **Mejora sugerida:** Autoseleccion de metodo de pago cuando solo hay uno. Asegurar consistencia de feedback visual (toasts).

### 2.3 Adecuacion movil

**Puntos fuertes:**

- Bottom-Nav idonea para uso con una mano.
- Componentes disenados en "tamano pulgar" (touch targets adecuados).
- El porcentaje de avance del dia (ej. "38%") aporta gran valor visual.

**Puntos debiles:**

- Pop-ups universales se solapan con funciones criticas (ej. "Instalar BarberApp" tapa botones de la cita).
- Arquitectura de componentes buena, pero sin interfaz de test normalizada.

### 2.4 Hallazgos

#### P0-BAR-01: Contrato E2E vs UI desalineado en Mi Dia

- **Prioridad:** Alta (P0)
- **Impacto:** Rol barbero sin validacion E2E confiable; regression gate roto.
- **Evidencia:**
  - Tests esperan: `stat-confirmed`, `appointments-timeline`, `appointment-card`, `btn-check-in`, `btn-complete`, `btn-no-show`, `btn-refresh`, `last-updated`
    - Ref: `tests/e2e/mi-dia.spec.ts` lineas 85, 89, 171, 331.
  - UI real expone: `stat-pending`, `stat-no-show`, `mi-dia-timeline`, `check-in-button`, `complete-button`, `no-show-button`, `refresh-button`
    - Ref: `src/components/barber/mi-dia-header.tsx` lineas 98, 124; `src/components/barber/mi-dia-timeline.tsx` lineas 97, 139; `src/components/barber/barber-appointment-card.tsx` lineas 418, 433, 462; `src/app/(dashboard)/mi-dia/page-v2.tsx` linea 283.
- **Riesgo:** Suite no valida comportamiento real. Marca falsos negativos. El flujo de operacion diaria del barbero queda sin cobertura.
- **Recomendacion:** Definir contrato unico de `data-testid`, alinear UI y E2E, y versionar ese contrato en documento para evitar regresiones.

#### P0-BAR-02: Redireccion por rol rompe supuestos de Auth E2E

- **Prioridad:** Alta (P0)
- **Impacto:** Login, sesiones y pruebas cross-rol.
- **Evidencia:**
  - Layout redirige barbero de `/dashboard` a `/mi-dia`: `src/app/(dashboard)/layout.tsx` linea 199.
  - Tests legacy esperan llegada estricta a `/dashboard`: `e2e/auth.spec.ts` linea 51; `e2e/appointments.spec.ts` linea 176.
- **Riesgo:** Fallos sistematicos que no representan bug de negocio, sino contrato de prueba incorrecto. Reduce senal de calidad en CI.
- **Recomendacion:** Ajustar pruebas para aceptar destino por rol (`/dashboard` o `/mi-dia`) o usar usuarios owner exclusivamente para esas rutas.

#### P0-BAR-03: Skeletons perpetuos y datos fantasma al alternar pestanas

- **Prioridad:** Alta (P0)
- **Impacto:** Confianza del usuario en la app.
- **Evidencia:** Al alternar entre pestanas, la app presenta Skeletons perpetuos o marca "0 Citas" en dias donde si las hay. Problema de sincronizacion/hidratacion de calendario.
- **Recomendacion:** Revisar logica de hidratacion del calendario y agregar fallback con reintento automatico.

#### P1-BAR-01: Falta boton dedicado de Bloquear Tiempo / Break

- **Prioridad:** Media (P1)
- **Impacto:** Eficiencia operativa del barbero.
- **Evidencia:** No existe boton de "bloquear tiempo". El barbero debe usar "Anadir Cita" como workaround, lo que toma multiples clics y es confuso.
- **Recomendacion:** Implementar accion directa `[Bloquear Tiempo / Break]` en el menu del barbero.

#### P1-BAR-02: Pop-up "Instalar App" tapa botones criticos

- **Prioridad:** Media (P1)
- **Impacto:** Usabilidad movil en operacion real.
- **Evidencia:** La sugerencia de "Instalar BarberApp" se posiciona sobre los botones de "Completar Cita" / "Check-in", bloqueando la interaccion.
- **Recomendacion:** Reposicionar notificaciones generales (z-index) fuera del area de botones de interaccion criticos.

#### P2-BAR-01: Apertura desfasada del calendario

- **Prioridad:** Baja (P2)
- **Impacto:** Orientacion temporal del barbero.
- **Evidencia:** Al iniciar la agenda, ocasionalmente se muestra el dia anterior (domingo) en vez de "Hoy" (lunes).
- **Recomendacion:** Asegurar que la vista inicial siempre seleccione el dia actual (considerar timezone CR: `T12:00:00`).

---

## 3. Perspectiva del Dueno/Administrador

### 3.1 Estado de flujos

| Flujo                         | Estado            | Detalle                                                           |
| ----------------------------- | ----------------- | ----------------------------------------------------------------- |
| Login y acceso al dashboard   | Funcional         | Validado con usuario demo                                         |
| Lectura de analiticas         | Funcional         | Citas e Ingresos visualizables                                    |
| Gestion de citas (`/citas`)   | Funcional parcial | Deuda de testabilidad (IDs duplicados, tests legacy no alineados) |
| Gestion de personal/servicios | Limitado          | Visible pero sin edicion rapida                                   |
| Creacion de cita              | Funcional         | Boton crear + formulario; complejidad media                       |

### 3.2 Analisis de friccion (click-depth)

- **Acceso a analiticas:** Requiere entrar en sub-menu flotante "Mas" de la Bottom-Bar. Excesivo para rol administrativo.
- **Edicion de servicio:** Al tocar un servicio (ej. "Corte Clasico"), no se abre para edicion rapida de precios/tiempo.
- **Creacion de cita:** Entrada por boton de crear + formulario. Complejidad media.
- **Mejora sugerida:** Unificar entrypoint de creacion y evitar ambiguedad de UI para automatizacion.

### 3.3 Adecuacion Desktop/Tablet

**Calificacion: Insuficiente.** La plataforma sigue un enfoque "Mobile-Only". En pantalla 1920x1080 o tablet horizontal se generan margenes vacios gigantes. Los datos operativos no aprovechan el espacio para mostrar la actividad de todos los barberos simultaneamente.

La base visual es consistente entre desktop y movil, pero el layout no se adapta para aprovechar el espacio disponible.

### 3.4 Hallazgos

#### P0-ADM-01: Rate Limit (429) bloquea operacion bajo carga

- **Prioridad:** Alta (P0)
- **Impacto:** Fiabilidad para negocios con alto volumen.
- **Evidencia:** Intentos del lado administrativo fueron frenados por errores `429 Too Many Requests` de Supabase durante pruebas de carga concurrente.
- **Recomendacion:** Implementar retry con backoff exponencial, revisar limites del plan de Supabase y optimizar queries para reducir llamadas.

#### P1-ADM-01: Duplicidad de test id en crear cita

- **Prioridad:** Media (P1)
- **Impacto:** Testabilidad y ambiguedad en automatizacion.
- **Evidencia:** `data-testid="create-appointment-btn"` aparece dos veces en `src/app/(dashboard)/citas/page-v2.tsx` lineas 731 y 782.
- **Recomendacion:** Separar IDs por contexto (`create-appointment-btn-desktop`, `create-appointment-btn-mobile`) o seleccionar por region visible.

#### P2-ADM-01: Vista Desktop no adaptada para rol administrativo

- **Prioridad:** Baja (P2)
- **Impacto:** Retencion de administradores y eficiencia operativa.
- **Evidencia:** El dueno navega con la misma Bottom-Bar comprimida que un telefono. No existe sidebar ni vista panoramica de todos los barberos.
- **Recomendacion:** Si se detecta resolucion desktop, mostrar sidebar izquierdo permanente y calendario tipo Kanban/panal con todos los barberos simultaneamente.

---

## Catalogo consolidado de hallazgos

### Alta prioridad (P0) -- Bloquean lanzamiento

| ID        | Hallazgo                                                       | Perspectiva | Tipo  |
| --------- | -------------------------------------------------------------- | ----------- | ----- |
| P0-CLI-01 | CTAs de autenticacion rotos en reserva publica                 | Cliente     | Bug   |
| P0-CLI-02 | Pantalla post-reserva es punto muerto                          | Cliente     | UX    |
| P0-CLI-03 | Sin indicadores de disponibilidad antes de seleccionar barbero | Cliente     | UX    |
| P0-BAR-01 | Contrato E2E vs UI desalineado en Mi Dia                       | Barbero     | Test  |
| P0-BAR-02 | Redireccion por rol rompe supuestos Auth E2E                   | Barbero     | Test  |
| P0-BAR-03 | Skeletons perpetuos y datos fantasma                           | Barbero     | Bug   |
| P0-ADM-01 | Rate Limit 429 bloquea operacion bajo carga                    | Dueno       | Infra |

### Media prioridad (P1) -- Mejora operativa y estabilidad de tests

| ID        | Hallazgo                                             | Perspectiva | Tipo |
| --------- | ---------------------------------------------------- | ----------- | ---- |
| P1-CLI-01 | Indicadores de disponibilidad poco visibles en movil | Cliente     | UX   |
| P1-CLI-02 | Mensajes de error vagos en formularios               | Cliente     | UX   |
| P1-CLI-03 | Selector ambiguo en booking legacy                   | Cliente     | Test |
| P1-CLI-04 | Suite booking moderna depende de seed/slug fijo      | Cliente     | Test |
| P1-BAR-01 | Falta boton de Bloquear Tiempo / Break               | Barbero     | UX   |
| P1-BAR-02 | Pop-up "Instalar App" tapa botones criticos          | Barbero     | Bug  |
| P1-ADM-01 | Duplicidad de test id en crear cita                  | Dueno       | Test |

### Baja prioridad (P2) -- Retencion y pulido

| ID        | Hallazgo                                          | Perspectiva | Tipo |
| --------- | ------------------------------------------------- | ----------- | ---- |
| P2-CLI-01 | Textos largos rompen tarjetas en movil            | Cliente     | UX   |
| P2-BAR-01 | Apertura desfasada del calendario                 | Barbero     | Bug  |
| P2-ADM-01 | Vista Desktop no adaptada para rol administrativo | Dueno       | UX   |

---

## Plan de ejecucion recomendado

### Fase 1 -- Bloqueadores (P0)

Objetivo: Desbloquear la salida a produccion.

1. **Corregir CTAs rotos:** Cambiar `/auth/signup` y `/auth/login` a `/register` y `/login` en `src/app/(public)/reservar/[slug]/page.tsx`. Cubrir con test E2E.
2. **Alinear contrato `data-testid` de Mi Dia:** Definir contrato unico, actualizar componentes UI o adaptar suite E2E. Versionar contrato en documento de referencia.
3. **Corregir supuestos de redireccion auth por rol:** Ajustar tests para aceptar destino `/dashboard` o `/mi-dia` segun rol, o usar usuarios owner para las rutas de dashboard.
4. **Agregar navegacion post-reserva:** Incluir botones "Mis Citas", "Agregar al Calendario" y "Volver al inicio" en pantalla de exito.
5. **Agregar indicadores de disponibilidad:** Mostrar "Disponible" / "Completo" en la lista de barberos antes de que el cliente entre a cada perfil.
6. **Resolver Skeletons perpetuos:** Revisar logica de hidratacion del calendario y agregar fallback con reintento.
7. **Mitigar Rate Limit 429:** Implementar retry con backoff exponencial y optimizar queries concurrentes.

### Fase 2 -- Estabilidad de pruebas (P1 Test)

Objetivo: Aumentar la confianza del release.

1. Parametrizar booking moderno por `TEST_BUSINESS_SLUG`.
2. Consolidar seed deterministico para CI y local.
3. Eliminar selectores ambiguos legacy (`h1, h2`, placeholders fragiles).
4. Separar IDs duplicados de crear cita (`create-appointment-btn-desktop` / `create-appointment-btn-mobile`).

### Fase 3 -- UX y operacion (P1 UX/Bug)

Objetivo: Mejorar la experiencia operativa diaria.

1. Implementar boton `[Bloquear Tiempo / Break]` para barberos.
2. Reemplazar mensajes de error en ingles por validacion visual campo por campo en espanol.
3. Reposicionar notificaciones generales ("Instalar App") fuera de botones criticos (z-index).
4. Mejorar indicadores de disponibilidad en movil (color, texto, icono).

### Fase 4 -- Pulido y retencion (P2)

Objetivo: Mejorar la experiencia a mediano plazo.

1. Truncar textos largos en tarjetas de servicio en movil.
2. Corregir apertura desfasada del calendario (siempre mostrar "Hoy").
3. Disenar vista Desktop adaptada para el rol administrativo (sidebar + calendario panoramico).

---

## Criterios de salida a produccion

Para considerar la aplicacion apta para lanzamiento, se deben cumplir **todos** los siguientes criterios:

1. **P0 abiertos = 0.** Ninguno de los 7 hallazgos de Alta prioridad puede quedar sin resolver.
2. **Suites criticas por rol en verde:**
   - Auth core (login/registro funcional por rol).
   - Mi Dia core actions (check-in, completar, no-show).
   - Booking publico happy path (reserva completa sin punto muerto).
3. **Sin rutas muertas en CTAs criticos.** Todo enlace de autenticacion y post-reserva lleva a una pagina funcional.
4. **Sin selectores ambiguos en pruebas gating.** Los tests E2E que bloquean release usan `data-testid` o selectores unicos.
5. **Sin errores de infraestructura reproducibles.** Rate limiting bajo carga normal no bloquea operacion.
