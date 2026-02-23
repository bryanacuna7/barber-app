# Plan: Resolver Dolores Reales de Barberos (Customer Discovery)

## Context

Bryan ha realizado entrevistas de customer discovery con 2 barberos siguiendo el método NovoLabs. El feedback revela dolores reales que la app actual NO resuelve. El martes hay otra reunión con Barbero 1 para profundizar.

**Decisiones del usuario:**

- Duration tracking = prioridad #1 para demo del martes
- WhatsApp API automatizado = diferido (costo). Deep links ($0) = incluidos
- Marketing = diferido hasta más entrevistas (método NovoLabs)
- SINPE Móvil = confirmado como método de pago estándar en CR
- Método de pago al completar = NUEVO requerimiento
- Todo debe ser configurable
- UX del barbero = lo más simple posible (el negocio se mueve rápido)
- Diseño = DEBE seguir el design system existente, 0 excepciones
- Notificaciones = deben funcionar 100%
- Push notifications = PRIORIDAD #1 (email y WhatsApp = secundarios)
- Forzar clientes a usar la app (features exclusivas in-app)
- Feature 5 = NO solo status page, sino CLIENT DASHBOARD completo (reservar, historial, live status)
- 4 vistas de usuario distintas: SaaS admin, dueño barbería, barberos, clientes

---

## Arquitectura de 4 Vistas de Usuario

El app tiene 4 roles con vistas y necesidades completamente diferentes:

### Vista 1: Super Admin (SaaS Owner — Bryan)

- **Ruta:** `/admin/*`
- **Existente:** `/admin/referencias` (básico)
- **Propósito:** Multi-tenant management, métricas SaaS, gestión de negocios
- **Futuro:** Dashboard con métricas de todos los negocios, facturación, soporte

### Vista 2: Dueño de Barbería (Business Owner)

- **Ruta:** `/dashboard/*` (actual: citas, barberos, clientes, servicios, analytics, config)
- **Puede ser barbero también** → tiene acceso a Vista 3
- **Propósito:** Gestión completa del negocio
- **Acciones únicas:** Configuración, ver todos los barberos, analytics, promociones, depósitos

### Vista 3: Barbero (Staff)

- **Ruta:** `/mi-dia` (actual)
- **Propósito:** Ver SUS citas del día, ejecutar flujo Iniciar→Completar→Cobrar
- **Acciones únicas:** Solo sus citas, timer, método de pago, "Llegá antes"
- **NO ve:** Analytics, configuración, otros barberos

### Vista 4: Cliente de Barbería (NUEVA — prioridad alta)

- **Ruta:** `/mi-cuenta` o `/cliente/*`
- **Propósito:** Reservar, ver historial, live tracking, recibir notificaciones
- **Auth:** Puede registrarse con email (flujo simplificado, sin password complejo)
- **Home page del cliente:**
  ```
  ┌─────────────────────────────────┐
  │  Hola, [Nombre]                 │
  │                                 │
  │  ┌─ Próxima Cita ────────────┐  │
  │  │  Martes 11 Feb, 10:30     │  │
  │  │  Corte Clásico            │  │
  │  │  Carlos                   │  │
  │  │  [Ver Estado en Vivo]      │  │
  │  └───────────────────────────┘  │
  │                                 │
  │  [Reservar Cita]                │
  │                                 │
  │  ─── Historial ───              │
  │  5 Feb — Corte + Barba          │
  │  22 Ene — Corte Clásico         │
  │  8 Ene — Corte + Diseño         │
  │                                 │
  │  ─── Ofertas ───                │
  │  Happy Hour Martes -15%         │
  └─────────────────────────────────┘
  ```
- **Features exclusivas in-app (vs web-only):**
  - Push notifications (solo funciona con app instalada)
  - Live tracking del barbero
  - Historial completo
  - Descuentos exclusivos in-app
  - Programa de puntos (gamificación existente)

### Implicaciones Técnicas

- **Auth unificado:** Supabase Auth ya soporta múltiples roles
- **Routing:** Middleware debe detectar rol y redirigir a vista correcta
- **DB:** La tabla `clients` ya tiene `user_id` (nullable) — conectar auth user con client record
- **Push:** Requiere service worker (ya existe: `public/sw.js`) + tabla `push_subscriptions`

---

## Git Strategy

- **Branch:** `feature/customer-discovery-features` (desde `main`)
- **Squash merge** al terminar (mismo patrón que `feature/ui-ux-redesign` → 138 commits → 1)
- **Después de CADA sesión:** actualizar `PROGRESS.md` + Memory MCP (obligatorio, sin preguntar)
- **Commits frecuentes** dentro del branch (1 por tarea completada)

---

## Reglas de Implementación

### R1: Design System (0 excepciones)

- TODO nuevo componente usa los tokens de `src/lib/design-system.ts`
- Botones: usar `<Button>` con variantes existentes (primary, ghost, outline, danger, gradient, success)
- Sheets: usar `src/components/ui/sheet.tsx` para modals/pickers
- Touch targets: mínimo 44x44px en TODOS los elementos interactivos
- Colores: usar CSS variables (`text-muted`, `text-subtle`, `--brand-primary`)
- Motion: `whileTap` only, spring configs del design system
- NO crear estilos nuevos, NO usar colores hardcodeados
- Verificar visualmente con Playwright ANTES de declarar completado

### R2: UX del Barbero (velocidad máxima)

- Flujo de "Iniciar → Completar → Cobrar" = **máximo 3 taps total**
- Flujo actual: Check-in (1 tap) + Complete (1 tap) = 2 taps
- Nuevo flujo: Iniciar (1 tap) + Completar+Pago (2 taps) = 3 taps
- Botones grandes (mínimo 44px), feedback háptico, sin formularios largos
- Si algo puede ser 1 tap menos, hacerlo 1 tap menos

### R3: Configurabilidad

- Toda feature nueva tiene un toggle on/off en Configuración
- Settings organizados por sección en el flujo existente de cards → sheets
- Defaults sensatos: todo desactivado por defecto excepto lo esencial
- El barbero no debe configurar nada para empezar a usar — solo activar lo que quiera

### R4: Notificaciones

- Las notificaciones son core, no opcional
- Email de confirmación al reservar = siempre activo (a menos que el dueño lo desactive)
- El sistema debe manejar fallos silenciosamente (retry, log error, NO bloquear la cita)
- Cada notificación enviada se registra con timestamp

### R5: Base de Datos

- SIEMPRE verificar contra DATABASE_SCHEMA.md antes de crear migración
- Actualizar DATABASE_SCHEMA.md después de cada migración
- Nuevas tablas necesitan RLS policies
- Guiar al usuario para ejecutar migration en Supabase Dashboard

### R6: Equipos por Fase

- Cada feature activa el equipo apropiado según la matriz de CLAUDE.md
- UI/UX Team para componentes visuales
- Backend Specialist para APIs y DB
- Security Auditor para RLS y validaciones
- QA Team post-implementación

---

## Feature 0: Control de Acceso por Rol (P0 - BLOCKER)

**Dolor:** Barberos logueados ven analíticas, configuración, suscripción y datos del negocio. Clientes podrían ver todo el dashboard. No hay gestión de usuarios para el dueño.

**Equipo:** Security Team + Full Feature Team

### Problema actual

```
AHORA: Cualquier usuario autenticado → ve TODO el dashboard
       Barbero logueado → ve Analíticas, Config, Suscripción, Barberos, Lealtad
       No existe gestión de usuarios del dueño

CORRECTO:
  Super Admin  → /admin/* (ya funciona)
  Dueño        → /dashboard/* todo (citas, analytics, config, barberos, etc.)
  Barbero      → /mi-dia + /citas (solo las suyas) — NADA MÁS
  Cliente      → /mi-cuenta (futuro Feature 5)
```

### Detección de rol (server-side en layout.tsx)

```
1. ¿Es super admin? → admin_users table → acceso total
2. ¿Es owner de un business? → businesses.owner_id = user.id → dashboard completo
3. ¿Es barber de un business? → barbers.user_id = user.id → vista restringida
4. ¿Es client? → clients.user_id = user.id → vista cliente (futuro)
5. Ninguno → pantalla "sin acceso" o redirect a /login
```

### 0A. Role Detection + Page Guard (Fase 1 — PRIORIDAD INMEDIATA)

**Objetivo:** Restringir navegación y acceso según el rol del usuario.

**Implementación:**

1. **Role resolver en layout.tsx** — Ya detecta `isAdmin` y `isBarber`. Falta determinar el rol **primario** del usuario:
   - Si `isAdmin` → role = 'admin'
   - Si `business.owner_id === user.id` → role = 'owner'
   - Si `barberRecord` exists → role = 'barber'
   - Else → role = 'unauthorized'

2. **Páginas por rol:**

   | Página           | Owner                      | Barber        | Client      |
   | ---------------- | -------------------------- | ------------- | ----------- |
   | `/citas`         | ✅ todas                   | ✅ solo suyas | ❌          |
   | `/clientes`      | ✅                         | ❌            | ❌          |
   | `/servicios`     | ✅                         | ❌ (solo ver) | ❌          |
   | `/barberos`      | ✅                         | ❌            | ❌          |
   | `/analiticas`    | ✅                         | ❌            | ❌          |
   | `/configuracion` | ✅                         | ❌            | ❌          |
   | `/suscripcion`   | ✅                         | ❌            | ❌          |
   | `/lealtad/*`     | ✅                         | ❌            | ❌          |
   | `/mi-dia`        | ✅ (si es barbero también) | ✅            | ❌          |
   | `/mi-cuenta`     | ❌                         | ❌            | ✅ (futuro) |
   | `/dashboard`     | ✅                         | ❌            | ❌          |

3. **Navegación filtrada** — Bottom nav y More menu solo muestran páginas que el rol puede acceder:
   - Owner: todo (como ahora)
   - Barber: Citas (filtradas), Mi Día, + (crear cita)
   - Redirect si intenta acceder a página no autorizada

4. **Server-side guard** — Si un barbero navega a `/analiticas` → redirect a `/mi-dia`

**Archivos a modificar:**

- `src/app/(dashboard)/layout.tsx` — role resolver + pass role prop
- `src/components/dashboard/bottom-nav.tsx` — filtrar tabs por rol
- `src/components/dashboard/more-menu-drawer.tsx` — filtrar items por rol
- `src/lib/auth/roles.ts` (NUEVO) — role types + permission helpers
- Middleware o layout guard para redirect en rutas no autorizadas

### 0B. Gestión de Usuarios del Dueño (Fase 2)

**Objetivo:** El dueño puede crear cuentas de barbero y gestionar accesos.

**UI en Configuración → "Equipo" o en Barberos page:**

- Lista de barberos con status (activo/inactivo) y email vinculado
- "Invitar barbero" → genera link de invitación o crea cuenta
- Toggle: activar/desactivar acceso de un barbero
- Futuro: permisos granulares (puede ver citas de otros, puede ver analytics lite, etc.)

**Flujo de invitación:**

1. Dueño ingresa nombre + email del barbero
2. Sistema crea un auth user en Supabase + registro en `barbers` con `user_id`
3. Barbero recibe email con link para setear password
4. Al loguearse → role = barber → ve solo Mi Día

### 0C. Permisos Granulares del Dueño (Fase 3 — futuro)

- Nueva tabla `barber_permissions` o campo JSONB en barbers
- El dueño puede dar acceso extra: "Ver citas de todos", "Ver analytics básico"
- UI: checkboxes en perfil del barbero
- Default: acceso mínimo (Mi Día + sus citas)

---

## Feature 1: Dynamic Duration + Smart Completion Flow (P1 - CRITICO)

**Dolor:** "Si se reservó un bloque de media hora y él hizo el corte en 10 minutos, tiene 20 minutos un barbero desocupado."

**Equipo:** Full Feature Team (frontend + backend + security + test)

### 1A. Nuevo Flujo de Completar con Método de Pago (MVP - Martes)

**Flujo actual (2 taps):**

```
[Iniciar] → [Completar] → listo
```

**Flujo nuevo (3 taps, máximo):**

```
[Iniciar] → [Completar] → Sheet: [Efectivo] [SINPE] [Tarjeta] → listo
```

**Detalle del flujo:**

1. **Tap 1 — "Iniciar"** (renombrar "Check-in" a español)
   - Setea `started_at = NOW()`
   - Badge cambia a "En progreso" con timer visual
   - Botón cambia a "Completar" (verde, prominente)
   - Haptic feedback

2. **Tap 2 — "Completar"**
   - Abre bottom sheet inmediato (NO pantalla nueva)
   - Sheet contiene 3 botones grandes (44px+):
     ```
     ┌─────────────────────────────┐
     │    ¿Cómo pagó el cliente?    │
     │                             │
     │  [Efectivo]                 │
     │  [SINPE]                    │
     │  [Tarjeta]                  │
     │                             │
     │  (x) Cerrar                 │
     └─────────────────────────────┘
     ```

3. **Tap 3 — Seleccionar método de pago**
   - Cierra sheet automáticamente
   - Guarda: `payment_method`, `actual_duration_minutes`, `status = 'completed'`
   - Toast: "Completado en 12 min — Efectivo C8,000"
   - Haptic feedback (success)
   - Si hay próxima cita en <60 min → muestra botón "Avisar a [nombre]"

**Configurabilidad:**

- En Configuración → "Métodos de Pago Aceptados":
  - Toggle: Efectivo (on/off, default: on)
  - Toggle: SINPE Móvil (on/off, default: on)
  - Toggle: Tarjeta (on/off, default: off)
- Si solo 1 método activo → skip la sheet, auto-selecciona (2 taps total)
- Si 0 métodos configurados → no pide método (2 taps, como ahora)

**Archivos a modificar:**

- `src/components/barber/barber-appointment-card.tsx` — renombrar botones, agregar timer visual
- `src/hooks/use-appointment-actions.ts` — agregar payment_method al complete
- `src/app/api/appointments/[id]/complete/route.ts` — guardar payment_method + actual_duration
- `src/app/api/appointments/[id]/check-in/route.ts` — guardar started_at
- `src/app/(dashboard)/citas/page-v2.tsx` — badge de duración real + método de pago

### 1B. Trackeo de Duración Real

- `started_at` se setea en check-in (1A ya lo hace)
- `actual_duration_minutes` se calcula en complete (1A ya lo hace)
- Badge en cita completada: "12 min - Efectivo"
- Analytics: nueva métrica "Tiempo muerto recuperado" = sum(duration_minutes - actual_duration_minutes)

### 1C. Promedios Inteligentes (Semana 2)

- Nueva tabla `service_duration_stats`
- Promedios por: Barbero+Cliente+Servicio → Barbero+Servicio → Servicio → Default
- DB trigger on complete → actualiza promedios automáticamente
- Outlier detection: ignora si actual > 3x promedio (fue un break, no un corte)

### 1D. Scheduling Inteligente (Semana 3)

- `calculateAvailableSlots()` usa duración predicha en vez de fija
- Calendar view: bloques con tamaño proporcional a duración predicha
- Grilla de 1 hora como referencia visual, bloques de tamaño variable dentro

### 1E. "Llegá Antes" — Killer Feature (Semana 2)

Al completar, si hay próxima cita en <60 min:

- Botón en la cita completada: "Avisar a [próximo cliente]"
- 1 tap → WhatsApp deep link ($0): "Hola [nombre]! Tu barbero ya está disponible. Podés llegar antes?"
- O email automático si tiene email registrado
- **Configurable:** Toggle on/off en Configuración → "Notificaciones"

---

## Feature 2: Smart Slot Suggestions con Descuentos (P2)

**Dolor:** "Que la app sugiera a los clientes días u horas para cita con descuento basado en los días más malos."

**Equipo:** UI/UX Team (heatmap) + Architecture Team (pricing engine)

### 2A. Heatmap de Demanda (Semana 1)

- Endpoint `GET /api/analytics/demand-heatmap`
- Query de citas completadas últimos 90 días, agrupadas por día+hora
- Componente en Analytics: heatmap 7x12, coloreado por densidad
- Auto-identifica las 5 horas más flojas

### 2B. Horarios Promocionales (Semana 2)

- Nueva tabla `promotional_slots`
- UI en Configuración → nueva sección "Promociones"
  - Muestra mini-heatmap como guía
  - "Agregar descuento": día, hora, %, nombre (ej: "Happy Hour Martes")
  - Lista de promociones activas con toggle on/off
- **Configurable:** Todo — día, hora, %, servicios incluidos, fechas de vigencia

### 2C. Descuentos en Booking Público (Semana 2)

- Slots con descuento en `/reservar/[slug]` muestran badge "-15%"
- Precio original tachado + precio con descuento
- Confirmación: "Ahorraste C1,800"

---

## Feature 3: Depósito SINPE Móvil (P3)

**Dolor:** "Incentivo por pagos antes de clientes al reservar su cita."

**Equipo:** Security Team (pagos) + Full Feature Team

### Flujo de Booking con Depósito

1. Cliente reserva normalmente (flujo existente)
2. Si `deposit_enabled = true` → Step 5: Depósito SINPE
   - Número SINPE grande + copiable
   - Nombre del titular
   - Monto (% configurable)
   - "Subir comprobante" (foto) o "Pagar en local"
3. Cita se crea con `deposit_status`

### Verificación en Dashboard

- Badges en citas: Pendiente / Verificado / Sin depósito
- Tap → ver screenshot → Verificar / Rechazar
- Sheet style (consistente con design system)

### Configurabilidad (Configuración → "Depósitos")

- Toggle: Habilitar depósitos (default: off)
- Slider: % del servicio (10-100%, default: 50%)
- Campo: Número SINPE Móvil
- Campo: Nombre del titular SINPE
- Toggle: Permitir reservas sin depósito (default: on)
- Política de reembolso (texto libre)

---

## Feature 4: Notificaciones (P4 — PRIORIDAD PUSH)

**Dolor:** "Su principal dolor de cabeza es la gestión de las citas vía WhatsApp y usar una agenda manual."

**Equipo:** Full Feature Team + Debug Team (asegurar 100% delivery)

### Prioridad de canales (definida por usuario):

1. **Push Notifications** — PRIORIDAD #1 (fuerza al cliente a instalar la app)
2. **Email** — segunda prioridad (funciona sin app)
3. **WhatsApp Deep Links** — tercera prioridad ($0, complementario)

### 4A. Push Notifications (PRIORIDAD #1)

**Por qué push es #1:**

- Fuerza a los clientes a instalar la PWA (retención)
- Funciona en background (no necesita abrir la app)
- Delivery instantáneo al dispositivo
- Gratis (Web Push API, no necesita Firebase)

**Implementación:**

- Service Worker YA EXISTE (`public/sw.js`) — agregar push listener
- Nueva tabla `push_subscriptions` (user_id, endpoint, keys, created_at)
- API: `POST /api/push/subscribe` — guardar suscripción
- API: `POST /api/push/send` — enviar notificación (server-side)
- Usar Web Push Protocol (VAPID keys — gratis, sin servidor de terceros)

**Eventos que disparan push:**

- Cita confirmada → "Tu cita está confirmada para [fecha] a las [hora]"
- Recordatorio 24h → "Mañana tienes cita a las [hora] con [barbero]"
- Recordatorio 1h → "En 1 hora tienes cita con [barbero]"
- "Llegá antes" → "Tu barbero ya está disponible. Podés llegar antes?"
- Cita cancelada → "Tu cita del [fecha] fue cancelada"
- Promoción → "Happy Hour: -15% en cortes los martes"

**Archivos a crear/modificar:**

- `src/lib/push/vapid.ts` — generar VAPID keys
- `src/lib/push/send.ts` — server-side push sender
- `src/app/api/push/subscribe/route.ts` — guardar suscripción
- `src/app/api/push/send/route.ts` — enviar push
- `public/sw.js` — agregar push event listener
- `src/components/push/push-permission-prompt.tsx` — UI de opt-in

### 4B. Emails Automáticos (Segunda prioridad)

- Infra YA EXISTE (`src/lib/email/sender.ts` con Resend — 3,000 emails/mes gratis)
- Templates YA EXISTEN
- Solo falta CONECTAR:
  - Al reservar → email confirmación al cliente
  - Al completar → email "Gracias por visitarnos" (opcional)
  - Reminder 24h → Vercel Cron (futuro)
- **IMPORTANTE:** El envío NO debe bloquear la creación de cita

### 4C. WhatsApp Deep Links (Tercera prioridad, $0)

- Utility: `src/lib/whatsapp/deep-link.ts`
- En cada cita: ícono de WhatsApp → 1 tap → abre WhatsApp con mensaje
- Templates en español CR (confirmación, recordatorio, "llegá antes")

### Sistema de Fallback Inteligente

```
Evento (ej: cita confirmada)
  → Tiene push subscription? → Enviar push
  → Tiene email? → Enviar email
  → Tiene teléfono? → Mostrar botón WhatsApp al barbero
  → Ninguno → Loguear, no bloquear
```

---

## Feature 5: Client Dashboard + Live Tracking (P5 — CLIENTE COMO USUARIO)

**Concepto:** No solo un status page — un **dashboard completo para clientes** que los fuerza a usar la app y los retiene.

**Equipo:** Full Feature Team + UI/UX Team + Security Team

### 5A. Client Auth (registro simplificado)

### 5B. Client Home Dashboard (`/mi-cuenta`)

### 5C. Live Tracking (integrado en dashboard)

### 5D. Features Exclusivas In-App (Estrategia de Retención)

### 5E. Client Tab Navigation

(Ver plan completo en `.claude/plans/declarative-soaring-thunder.md`)

---

## Migration de Base de Datos

`supabase/migrations/025_smart_scheduling_features.sql`

```sql
-- P1: Duration Tracking + Payment Method
ALTER TABLE appointments
  ADD COLUMN started_at TIMESTAMPTZ,
  ADD COLUMN actual_duration_minutes INT,
  ADD COLUMN payment_method TEXT CHECK (payment_method IN ('cash', 'sinpe', 'card'));

-- P3: Deposits (SINPE Móvil)
ALTER TABLE appointments
  ADD COLUMN deposit_required BOOLEAN DEFAULT false,
  ADD COLUMN deposit_amount DECIMAL(10,2),
  ADD COLUMN deposit_status TEXT CHECK (deposit_status IN
    ('pending', 'submitted', 'verified', 'rejected', 'refunded')),
  ADD COLUMN deposit_proof_url TEXT,
  ADD COLUMN deposit_submitted_at TIMESTAMPTZ,
  ADD COLUMN deposit_verified_at TIMESTAMPTZ;

ALTER TABLE businesses
  ADD COLUMN deposit_enabled BOOLEAN DEFAULT false,
  ADD COLUMN deposit_percent INT CHECK (deposit_percent BETWEEN 10 AND 100) DEFAULT 50,
  ADD COLUMN sinpe_phone TEXT,
  ADD COLUMN sinpe_name TEXT,
  ADD COLUMN accepted_payment_methods JSONB DEFAULT '["cash"]'::jsonb,
  ADD COLUMN notification_settings JSONB DEFAULT '{
    "email_on_booking": true, "email_post_visit": false,
    "whatsapp_buttons": true, "arrive_early_enabled": true,
    "tracking_link_enabled": false
  }'::jsonb;

-- P5: Live Tracking Token
ALTER TABLE appointments
  ADD COLUMN tracking_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN tracking_expires_at TIMESTAMPTZ;

-- P4: Push Notifications
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- + RLS Policies + Indexes (ver plan detallado)
```

---

## Orden de Implementación

### Antes del Martes — Demo para Barbero 1 (~3h)

1. Migration 025 (columnas P1 + payment_method)
2. Check-in → renombrar "Iniciar" + `started_at`
3. Complete → sheet método de pago + `actual_duration`
4. Badge duración + método en cita completada
5. Email auto al reservar (conectar infra existente)
6. Playwright verification

### Semana 1-4: Ver plan detallado en `.claude/plans/declarative-soaring-thunder.md`
