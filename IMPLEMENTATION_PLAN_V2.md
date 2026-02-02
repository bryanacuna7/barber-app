# Plan de Implementación: Mejoras al Sistema de Reservas y Rebranding

**Proyecto:** BarberShop Pro → Salon Booking Platform
**Fecha:** 2026-02-02 (Actualizado con Technical Debt Fixes)
**Estimado Total:** 102-130 horas (5-6 semanas)
**Archivos Afectados:** ~180 archivos
**Complejidad:** Alta (Área 0 + 6 áreas principales)
**Versión:** 2.4 (con Technical Debt & Pre-Implementation Fixes)

---

## 📑 Table of Contents

> **Nota:** Este archivo es grande (4,500+ líneas). Considera partirlo en archivos separados cuando se completen áreas individuales.

### Quick Navigation

- [⚠️ Changelog](#️-cambios-importantes-v20--v21) - Historial de versiones
- [🚀 Pre-Implementation Tasks](#-pre-implementation-tasks-hacer-antes-de-implementar) - Setup inicial
- [Área 0: Technical Debt Fixes](#área-0-technical-debt--pre-implementation-fixes) - Bloqueadores técnicos (HACER PRIMERO)
- [Área 1: Client Subscription & Basic Plan](#área-1-client-subscription--basic-plan-system) - Sistema de subscripciones
- [Área 2: Advance Payments & No-Show](#área-2-advance-payments--no-show-prevention) - SINPE Móvil + prevención no-show
- [Área 3: Rebranding (Barber → Staff)](#área-3-rebranding-barber--staff) - Renombrado masivo
- [Área 4: Client Referrals Dashboard](#área-4-sistema-de-referidos-cliente-a-cliente) - Dashboard de referidos clientes
- [Área 4B: Full Client Dashboard](#área-4b-full-client-dashboard-layout-nuevo) - Layout completo cliente
- [Área 5: Web Push Notifications](#área-5-web-push-notifications-nuevo) - Notificaciones PWA
- [Área 6: Staff Experience](#área-6-staff-experience---vista-mi-día-nuevo) - Vista "Mi Día" para staff

### Estimated Time by Area

| Área      | Descripción                | Estimado    | Estado        |
| --------- | -------------------------- | ----------- | ------------- |
| 0         | Technical Debt Fixes       | 4-6h        | ⏳ Bloqueante |
| 1         | Subscriptions & Basic Plan | 18-22h      | 🔄 Current    |
| 2         | Advance Payments           | 12-16h      | ⏳ Pending    |
| 3         | Rebranding                 | 24-30h      | ⏳ Pending    |
| 4         | Client Referrals           | 6-8h        | ⏳ Pending    |
| 4B        | Client Dashboard           | 8-10h       | ⏳ Pending    |
| 5         | Web Push                   | 12-16h      | ⏳ Pending    |
| 6         | Staff Experience           | 8-10h       | ⏳ Pending    |
| **Total** |                            | **92-118h** | **5-6 weeks** |

### How to Use This Document

1. **Start with Pre-Implementation Tasks** - Setup git, branches, cleanup
2. **Complete Área 0 FIRST** - Fix TypeScript errors and technical debt (blocker)
3. **Work through areas sequentially** - Each area builds on previous work
4. **Archive completed areas** - Move to `docs/specs/area-X-[name].md` when done
5. **Update PROGRESS.md** - Auto-saved after each completion

---

## ⚠️ Cambios Importantes v2.0 → v2.1

**v2.0:**

- ✅ Corregido: Moneda → Colones (₡) en vez de dólares
- ✅ Corregido: Comprobantes se mantienen 7 días, luego se eliminan
- ✅ Corregido: Todos los cron jobs unificados en Vercel Cron
- ✅ Agregado: Data migration para datos existentes
- ✅ Agregado: Flujo completo de rechazo de depósito
- ✅ Agregado: Flujo de vinculación guest → registered client
- ✅ Agregado: RLS policies faltantes
- ✅ Agregado: Archivos de rebranding faltantes (emails, landing, manifest)
- ✅ Agregado: Timezone handling para cron jobs
- ✅ Agregado: Rollback strategy

**v2.1:**

- ✅ Agregado: Sistema de referidos cliente-a-cliente completo (Área 4)
  - Booking flow: detección de ?ref=CODE + creación de referral record
  - Reward distribution: puntos al completar primera cita
  - Dashboard: código, stats, lista de referidos
- ✅ Agregado: PWA bloqueado para Plan Básico
- ✅ Agregado: Sección Pre-Implementation Tasks (git, branches, docs)

**v2.2:**

- ✅ Agregado: Web Push Notifications (Área 5) - notificaciones nativas de PWA
  - Service Worker con push handling
  - VAPID keys setup
  - Push subscription API
  - Permission UI
- ✅ Expandido: Full Client Dashboard con todas las secciones
  - Mi Cuenta (perfil del cliente)
  - Mis Citas (historial de citas)
  - Mis Puntos (balance de loyalty)
  - Referidos (ya planeado en v2.1)
- ✅ Corregido: Layout `(client-dashboard)` necesario (no existía)

**v2.3:**

- ✅ Agregado: Staff Experience (Área 6) - Vista simplificada para barberos/staff
  - Vista "Mi Día" - solo citas de hoy
  - Próximo cliente destacado
  - Botones de acción rápida (WhatsApp, marcar llegada)
  - Total del día visible
  - PWA-optimizado para uso en móvil
- ✅ Agregado: Botones de compartir WhatsApp en booking pages

**v2.4 (ACTUAL):**

- ✅ Agregado: Área 0 - Technical Debt & Pre-Implementation Fixes (basado en code audit)
  - Fix 49+ errores de TypeScript que bloquean build real
  - Remover `@ts-nocheck` de 30+ archivos
  - Agregar rate limiting a APIs públicas (seguridad)
  - Eliminar archivos duplicados y cleanup de código
  - Completar TODOs pendientes críticos
- ✅ Actualizado: Estimado total +4-6 horas por fixes técnicos
- ✅ Nota: Estos fixes son BLOQUEANTES - deben hacerse antes de cualquier área

---

## 🚀 Pre-Implementation Tasks (Hacer ANTES de implementar)

### Paso 1: Git & Branch Cleanup

```bash
# 1. Commitear cambios pendientes en feature/gamification-system
git add PROGRESS.md SKILLS_INSTALLED.md
git commit -m "📝 docs: finalize gamification Phase 3 documentation"

# 2. Merge/rebase a main (gamificación completada)
git checkout main
git pull origin main
git merge feature/gamification-system --ff-only  # O rebase si prefieres historia lineal

# 3. Limpiar branches viejos (verificar primero que estén mergeados)
git branch -d feature/loyalty-config-apple-redesign  # Si ya está en main
git branch -d feature/comprehensive-audit  # Si ya no se usa
git branch -d ui-ux-audit-fixes  # Si ya no se usa

# 4. Crear nuevo branch para este plan
git checkout -b feature/subscription-payments-rebranding

# 5. Tag pre-migration (para rollback)
git tag pre-v2-migration
```

### Paso 2: Corregir .gitignore

```diff
# Cambiar:
-.agent/
+.agents/

# Agregar:
+.claude/plans/
+.playwright-mcp/
```

### Paso 3: Mover Plan a Root

```bash
# Mover plan a root para que sea visible y versionado
cp ~/.claude/plans/snuggly-shimmying-dove.md ./IMPLEMENTATION_PLAN_V2.md
git add IMPLEMENTATION_PLAN_V2.md
git commit -m "📋 plan: add comprehensive implementation plan v2"
```

### Paso 4: Update PROGRESS.md

```markdown
# Agregar sección:

## Current Sprint: Subscription + Payments + Rebranding + Client Referrals

**Plan:** IMPLEMENTATION_PLAN_V2.md
**Branch:** feature/subscription-payments-rebranding
**Estimado:** 4 semanas (70-90 horas)
```

### Paso 5: Auditoría con Skills (Opcional pero Recomendado)

```bash
# Antes de implementar, ejecutar auditorías:
# 1. Performance audit
"@vercel-react-best-practices audit booking flow performance"

# 2. Code quality
"@production-code-audit scan codebase for production readiness"

# 3. Security
"@security-scanning-security-sast scan for vulnerabilities"

# Documentar hallazgos en AUDIT_REPORT.md
```

### Paso 6: Environment Variables

```bash
# Agregar a .env.local y Vercel dashboard:
CRON_SECRET=generate-secure-random-string

# Verificar que existen:
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=... # O el email provider que uses
```

---

## Resumen Ejecutivo

Este plan aborda **7 áreas** para transformar la aplicación de un sistema específico para barberías a una plataforma genérica para salones de belleza, con mejoras en monetización y retención de clientes:

**🔴 BLOQUEANTE (hacer primero):**

0. **Technical Debt Fixes** - Corregir errores TypeScript, seguridad, y cleanup (4-6h)

**Áreas principales:**

1. **Sistema de Clientes con Plan Básico** - Incentivos para registro + límites de demo + PWA bloqueado
2. **Pagos Anticipados** - Reducir no-shows con depósitos opcionales + bonificación de puntos
3. **Rebranding Barber → Staff** - Cambiar terminología en 95+ archivos
4. **Sistema de No-Show** - Detección automática + penalizaciones configurables
5. **Sistema de Referidos Cliente-a-Cliente** - Dashboard para clientes + milestones + rewards
6. **Staff Experience** - Vista "Mi Día" para barberos/staff

---

## Decisiones de Arquitectura (Confirmadas con Usuario)

### Cliente Registration System

- **Plan Básico:** Solo reservas (SIN gamificación, notificaciones, PWA, referidos cliente)
- **Plan Pro:** Acceso completo a todas las características premium
- **Retención de datos:** 30 días de inactividad → auto-eliminación (solo en Plan Básico)
- **Incentivo:** Modal post-booking mostrando puntos potenciales
- **PWA:** Ocultar prompt de instalación en Plan Básico
- **Push Notifications:** NO implementadas en esta versión (solo in-app notifications)

### Advance Payment System

- **Método de pago:** SINPE Móvil manual (reutilizar infraestructura de suscripciones)
- **Bonificación:** Configurable por negocio (1.2x - 3.0x puntos)
- **Penalización:** Pierde depósito si no se presenta (no reembolsable)
- **Comprobantes:** Enviar por email → eliminar de storage inmediatamente

### No-Show Prevention

- **Auto-detección:** Configurable por negocio (5-60 minutos después de cita)
- **Cron job:** Cada 5 minutos revisa citas pendientes
- **Notificaciones:** Email al dueño del negocio cuando se marca no-show

### Rebranding Strategy

- **Término genérico:** "Staff" / "Personal" / "Equipo"
- **Enfoque:** Híbrido - mantener DB, cambiar código/UI
- **Scope:** 81 archivos TypeScript + 40 strings en español

---

## 🔴 Área 0: Technical Debt & Pre-Implementation Fixes (BLOQUEANTE)

**Objetivo:** Estabilizar el codebase antes de agregar nuevas features. Estos fixes son **BLOQUEANTES** - el build actual usa `SKIP_TYPE_CHECK=true` para evitar errores.

**Tiempo estimado:** 4-6 horas
**Prioridad:** CRÍTICA - Hacer ANTES de cualquier otra área
**Basado en:** Code Audit realizado 2026-02-02

### 0.1 TypeScript Type Safety (2-3 horas)

**Estado actual:** 49+ errores de TypeScript, build real falla sin `SKIP_TYPE_CHECK=true`

#### Archivos con errores críticos:

| Archivo                                                  | Errores | Problema                | Solución                                  |
| -------------------------------------------------------- | ------- | ----------------------- | ----------------------------------------- |
| `src/app/(admin)/admin/referencias/page.tsx`             | 33      | Type 'never' en queries | Tipar respuesta de Supabase correctamente |
| `src/app/(dashboard)/barberos/page.tsx`                  | 3       | Missing 'id' on `{}`    | Tipar `business` response                 |
| `src/app/(dashboard)/barberos/desafios/page.tsx`         | 2       | Missing 'id' on `{}`    | Tipar `business` response                 |
| `src/app/(dashboard)/barberos/logros/page.tsx`           | 2       | Missing 'id' on `{}`    | Tipar `business` response                 |
| `src/app/(dashboard)/lealtad/configuracion/page.tsx`     | 10      | Type 'never' issues     | Tipar loyalty program response            |
| `src/app/(auth)/register/page.tsx:168`                   | 1       | Empty object type       | Add proper typing to business creation    |
| `src/app/(dashboard)/admin-referencias-preview/page.tsx` | 1       | BadgeVariant type       | Fix variant prop type                     |

#### Remover `@ts-nocheck` de archivos:

**API Routes (alta prioridad):**

```
src/app/api/appointments/route.ts
src/app/api/appointments/[id]/route.ts
src/app/api/public/[slug]/book/route.ts
src/app/api/admin/payments/route.ts
src/app/api/referrals/*/route.ts (5 archivos)
src/app/api/gamification/barber/*/route.ts (3 archivos)
```

**Componentes (media prioridad):**

```
src/components/loyalty/*.tsx
src/components/gamification/*.tsx
src/lib/gamification/loyalty-calculator-server.ts
src/lib/notifications.ts
```

**Acción:** Agregar tipos correctos en lugar de `@ts-nocheck`

### 0.2 Security Hardening (1 hora)

#### Rate Limiting para APIs públicas

**Problema:** El endpoint `/api/public/[slug]/book` no tiene rate limiting, vulnerable a spam de reservas.

**Solución:** Implementar rate limiting con Upstash o similar

**Archivo a modificar:** `src/app/api/public/[slug]/book/route.ts`

```typescript
// Agregar al inicio del archivo
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 bookings per minute per IP
  analytics: true,
})

export async function POST(request: Request, { params }) {
  // Rate limit check
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  // ... resto del código existente
}
```

**Variables de entorno necesarias:**

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

**Alternativa sin Upstash:** Usar in-memory rate limiting (solo para single-instance deployments):

```typescript
// Simple in-memory rate limiter (NOT for production with multiple instances)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
```

### 0.3 Code Cleanup (30 min)

#### Eliminar archivos duplicados/innecesarios:

```bash
# Archivo duplicado con espacio en nombre (probablemente backup accidental)
rm "src/lib/referrals 2.ts"

# Verificar y consolidar componentes refactorizados:
# Si existen ambas versiones, eliminar la vieja:
# - src/components/ui/toast.tsx vs toast-refactored.tsx
# - src/components/ui/button.tsx vs button-refactored.tsx
# - src/components/ui/card.tsx vs card-refactored.tsx
```

#### Limpiar console.log antes de producción:

**Estado actual:** 161 console statements en 73 archivos

**Estrategia:**

1. **Mantener** `console.error` en catch blocks (útil para debugging)
2. **Eliminar** `console.log` de debugging
3. **Convertir** logs importantes a un logger estructurado (futuro)

**Comando para encontrar:**

```bash
# Ver todos los console.log
grep -r "console.log" src/ --include="*.ts" --include="*.tsx" | wc -l
```

**Acción inmediata:** Eliminar console.log obvios de debugging, mantener error logging.

### 0.4 Completar TODOs Críticos (1 hora)

| Archivo                                          | Línea   | TODO                                           | Prioridad | Acción                                                                      |
| ------------------------------------------------ | ------- | ---------------------------------------------- | --------- | --------------------------------------------------------------------------- |
| `src/app/api/appointments/[id]/route.ts`         | 158     | Update client stats when appointment completed | ALTA      | Implementar actualización de `total_visits`, `total_spent`, `last_visit_at` |
| `src/app/api/referrals/claim-reward/route.ts`    | 141     | Apply actual discount/credit to subscription   | MEDIA     | Implementar lógica de descuento                                             |
| `src/components/dashboard/dashboard-content.tsx` | 40      | Get subscription status                        | BAJA      | Ya existe hook, solo conectar                                               |
| `src/app/api/referrals/generate-code/route.ts`   | 72      | Generate QR code                               | BAJA      | Opcional, puede posponerse                                                  |
| `src/app/(public)/reservar/[slug]/page.tsx`      | 275-279 | Account creation/sign in flow                  | MEDIA     | Parte de Área 1                                                             |

**Implementación del TODO más crítico:**

```typescript
// src/app/api/appointments/[id]/route.ts - línea 158
// Después de marcar appointment como 'completed':

if (result.data.status === 'completed' && result.data.client_id) {
  // Update client stats
  const { data: client } = await supabase
    .from('clients')
    .select('total_visits, total_spent')
    .eq('id', result.data.client_id)
    .single()

  if (client) {
    await supabase
      .from('clients')
      .update({
        total_visits: (client.total_visits || 0) + 1,
        total_spent: (client.total_spent || 0) + result.data.price,
        last_visit_at: new Date().toISOString(),
      })
      .eq('id', result.data.client_id)
  }
}
```

### 0.5 Verificación Post-Fixes

**Checklist obligatorio antes de continuar con Área 1:**

```bash
# 1. TypeScript compila sin errores
npm run build
# (NO usar build:skip-ts)

# 2. Lint pasa
npm run lint

# 3. Tests unitarios pasan
npm run test:unit

# 4. No hay archivos duplicados
ls "src/lib/referrals 2.ts" 2>/dev/null && echo "DELETE THIS FILE"

# 5. Verificar que rate limiting funciona (manual)
# Hacer 6 bookings seguidos, el 6to debe fallar con 429
```

### 0.6 Archivos Afectados (Resumen)

| Categoría        | Archivos         | Acción                             |
| ---------------- | ---------------- | ---------------------------------- |
| TypeScript fixes | ~15              | Agregar tipos, remover @ts-nocheck |
| Rate limiting    | 1                | Agregar middleware                 |
| Cleanup          | 1-4              | Eliminar duplicados                |
| TODOs            | 2                | Implementar lógica faltante        |
| **Total**        | **~20 archivos** |                                    |

**Estimated LOC:** ~300 líneas de cambios

---

## Área 1: Client Subscription & Basic Plan System

**Objetivo:** Diferenciar clientes guest vs registered, aplicar límites de Plan Básico, y auto-eliminar datos inactivos.

### 1.1 Database Schema Changes

**Migration 020: Client Authentication Enhancement**

```sql
-- Add user_id link to clients table (nullable for guests)
ALTER TABLE clients
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_clients_user_id ON clients(user_id) WHERE user_id IS NOT NULL;

-- Add last_activity tracking for retention
ALTER TABLE clients
ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT now();

-- Trigger to update last_activity on new appointment
CREATE OR REPLACE FUNCTION update_client_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clients
  SET last_activity_at = now()
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_appointment_update_activity
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_client_activity();
```

**Migration 021: Data Retention System**

```sql
-- Table to track deletion warnings sent
CREATE TABLE client_deletion_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  warning_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_deletion_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  UNIQUE(client_id)
);

CREATE INDEX idx_deletion_warnings_scheduled ON client_deletion_warnings(scheduled_deletion_at)
  WHERE cancelled_at IS NULL;

-- Add soft delete to clients
ALTER TABLE clients
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deleted_reason TEXT;

CREATE INDEX idx_clients_deleted ON clients(deleted_at) WHERE deleted_at IS NOT NULL;

-- RLS Policies for client_deletion_warnings
ALTER TABLE client_deletion_warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view own warnings"
  ON client_deletion_warnings FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "System can manage warnings"
  ON client_deletion_warnings FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM admin_users));
```

**Migration 021b: Data Migration for Existing Clients**

```sql
-- CRITICAL: Set last_activity_at for existing clients to prevent mass deletion
-- Use most recent appointment date, or created_at if no appointments
UPDATE clients c
SET last_activity_at = COALESCE(
  (SELECT MAX(scheduled_at) FROM appointments a WHERE a.client_id = c.id),
  c.created_at
)
WHERE c.last_activity_at IS NULL;

-- Set deleted_at = NULL explicitly for all existing clients
UPDATE clients SET deleted_at = NULL WHERE deleted_at IS NULL;
```

### 1.2 Guest → Registered Client Linking Flow

**Nuevo flujo cuando un guest client se registra:**

```typescript
// src/lib/auth/link-client-to-user.ts (NEW)
export async function linkClientToUser(
  supabase: SupabaseClient,
  userId: string,
  phone: string,
  businessId: string
): Promise<{ linked: boolean; clientId?: string }> {
  // 1. Find existing client by phone in this business
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id, user_id')
    .eq('business_id', businessId)
    .eq('phone', phone)
    .single()

  if (existingClient) {
    // 2. If client exists and has no user_id, link them
    if (!existingClient.user_id) {
      await supabase
        .from('clients')
        .update({ user_id: userId, last_activity_at: new Date().toISOString() })
        .eq('id', existingClient.id)

      return { linked: true, clientId: existingClient.id }
    }

    // 3. If already linked to different user, don't overwrite
    if (existingClient.user_id !== userId) {
      console.warn(`Client ${existingClient.id} already linked to different user`)
      return { linked: false }
    }

    return { linked: true, clientId: existingClient.id }
  }

  // 4. No existing client found - will be created on next booking
  return { linked: false }
}
```

**Integrar en registro post-booking:**

```typescript
// src/components/reservar/BookingSuccess.tsx
const handleRegister = async () => {
  // After successful auth registration...
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && createdClientId) {
    // Link the client record to the new user account
    await linkClientToUser(supabase, user.id, booking.client.phone, business.id)
  }
}
```

### 1.3 PWA Blocking for Basic Plan

**Objetivo:** Ocultar el prompt de instalación de PWA para negocios en Plan Básico.

**Modify:** `src/app/layout.tsx` (o donde se renderiza el PWA prompt)

```typescript
// Check if business has PWA access
export default async function RootLayout({ children }) {
  // For public booking pages, check business plan
  const canUsePWA = await checkPWAAccess()

  return (
    <html>
      <body>
        {children}
        {/* Only show PWA prompt if plan allows */}
        {canUsePWA && <PWAInstallPrompt />}
      </body>
    </html>
  )
}
```

**New File:** `src/lib/pwa-access.ts`

```typescript
export async function checkPWAAccess(businessId?: string): Promise<boolean> {
  if (!businessId) return false

  const supabase = createClient()
  const canAccess = await canAccessFeature(supabase, businessId, 'pwa')

  return canAccess
}
```

**Modify:** `src/components/pwa/install-prompt.tsx` (si existe)

```typescript
export function PWAInstallPrompt({ businessId }: { businessId: string }) {
  const [canInstall, setCanInstall] = useState(false)
  const [hasPWAAccess, setHasPWAAccess] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      const access = await checkPWAAccess(businessId)
      setHasPWAAccess(access)
    }
    checkAccess()
  }, [businessId])

  // Don't show if business is on Basic plan
  if (!hasPWAAccess) return null

  // Rest of PWA install logic...
}
```

**Nota sobre Push Notifications:**

- Las push notifications reales (Web Push API) NO están implementadas actualmente
- Solo existen in-app notifications (tabla `notifications` + UI en dashboard)
- Implementar Web Push queda como mejora futura (requiere service worker, VAPID keys, etc.)

### 1.4 Feature Gating System

**New File:** `src/lib/subscription-features.ts`

```typescript
// Feature gating with 5-minute cache
export async function canAccessFeature(
  supabase: SupabaseClient,
  businessId: string,
  feature: 'gamification' | 'push_notifications' | 'pwa' | 'referrals' | 'unlimited_data'
): Promise<boolean> {
  // Get subscription status with cache
  const status = await getSubscriptionStatus(supabase, businessId)

  if (!status) return false

  // Basic plan blocks premium features
  if (status.plan.name === 'basic') {
    return false
  }

  // Pro plan (or trial) has all features
  return true
}

// Check if business can add more clients (Basic plan limit: 25)
export async function canAddClient(
  supabase: SupabaseClient,
  businessId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getSubscriptionStatus(supabase, businessId)

  if (!status) return { allowed: false, reason: 'No subscription found' }

  // Pro plan: unlimited
  if (status.plan.name === 'pro' || status.status === 'trial') {
    return { allowed: true }
  }

  // Basic plan: check limit
  const { usage } = status
  if (usage.clients.max && usage.clients.current >= usage.clients.max) {
    return {
      allowed: false,
      reason: `Plan Básico permite máximo ${usage.clients.max} clientes. Actualiza a Pro para clientes ilimitados.`,
    }
  }

  return { allowed: true }
}
```

### 1.4 Registration Incentive System

**Modify:** `src/components/reservar/BookingSuccess.tsx`

```typescript
// Add post-booking modal showing loyalty potential
// IMPORTANT: Check business plan before showing gamification features
export function BookingSuccess({ appointment, business, createdClientId }) {
  const [showRegisterModal, setShowRegisterModal] = useState(true)
  const [estimatedPoints, setEstimatedPoints] = useState(0)
  const [hasGamification, setHasGamification] = useState(false)

  useEffect(() => {
    async function checkFeaturesAndCalculate() {
      // Check if business has gamification access (Pro plan or trial)
      const canUseGamification = await canAccessFeature(
        supabase,
        business.id,
        'gamification'
      )
      setHasGamification(canUseGamification)

      // Only calculate points if gamification is available
      if (canUseGamification) {
        const program = await getLoyaltyProgram(business.id)
        if (program) {
          const points = Math.floor(appointment.price * program.pointsPerCurrencyUnit)
          setEstimatedPoints(points)
        }
      }
    }
    checkFeaturesAndCalculate()
  }, [])

  return (
    <>
      {/* Existing success message */}

      {/* NEW: Registration Modal - content varies by plan */}
      {showRegisterModal && (
        <Modal>
          {hasGamification && estimatedPoints > 0 ? (
            // Pro plan: Show gamification benefits
            <>
              <h3>¡Crea tu cuenta y gana {estimatedPoints} puntos! 🎉</h3>
              <ul>
                <li>Acumula puntos en cada visita</li>
                <li>Recibe notificaciones de recordatorio</li>
                <li>Accede desde tu teléfono (PWA)</li>
                <li>Refiere amigos y gana recompensas</li>
              </ul>
            </>
          ) : (
            // Basic plan: Show basic benefits (no gamification)
            <>
              <h3>¡Crea tu cuenta para reservar más fácil! 📱</h3>
              <ul>
                <li>Reserva más rápido sin llenar tus datos cada vez</li>
                <li>Recibe confirmación de tu cita por email</li>
                <li>Historial de tus visitas</li>
              </ul>
            </>
          )}
          <Button onClick={handleRegister}>Crear Cuenta Gratis</Button>
          <Button variant="ghost" onClick={() => setShowRegisterModal(false)}>
            Tal vez después
          </Button>
        </Modal>
      )}
    </>
  )
}
```

### 1.5 Data Retention Automation

**New File:** `src/app/api/cron/data-retention/route.ts`

```typescript
// Vercel Cron Job - runs daily at 2 AM UTC
// UNIFIED: All cron jobs use Vercel Cron for consistency
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseAdmin = createServiceClient() // Uses service role

  // Step 1: Find inactive clients in Basic plan businesses (30+ days)
  const { data: inactiveClients } = await supabaseAdmin
    .from('clients')
    .select(
      `
      id,
      business_id,
      name,
      email,
      last_activity_at,
      businesses!inner(
        owner_id,
        business_subscriptions!inner(
          plan:subscription_plans!inner(name)
        )
      )
    `
    )
    .eq('deleted_at', null)
    .eq('businesses.business_subscriptions.plan.name', 'basic')
    .lt('last_activity_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Step 2: Send warnings (7 days before deletion)
  for (const client of inactiveClients || []) {
    const existingWarning = await supabaseAdmin
      .from('client_deletion_warnings')
      .select('id')
      .eq('client_id', client.id)
      .single()

    if (!existingWarning.data) {
      // Create warning
      await supabaseAdmin.from('client_deletion_warnings').insert({
        business_id: client.business_id,
        client_id: client.id,
        scheduled_deletion_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })

      // Send email to business owner
      await sendDeletionWarningEmail(client)
    }
  }

  // Step 3: Soft delete clients past warning period
  const { data: toDelete } = await supabaseAdmin
    .from('client_deletion_warnings')
    .select('client_id')
    .lt('scheduled_deletion_at', new Date().toISOString())
    .is('cancelled_at', null)

  for (const warning of toDelete || []) {
    await supabaseAdmin
      .from('clients')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_reason: 'inactive_30_days_basic_plan',
      })
      .eq('id', warning.client_id)
  }

  // Step 4: Hard delete after 30 more days (GDPR compliance)
  // IMPORTANT: Delete related records first to avoid orphans
  const { data: clientsToHardDelete } = await supabaseAdmin
    .from('clients')
    .select('id')
    .lt('deleted_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  for (const client of clientsToHardDelete || []) {
    // Delete related records in order (respecting foreign keys)
    await supabaseAdmin.from('loyalty_transactions').delete().eq('client_id', client.id)
    await supabaseAdmin.from('client_loyalty_status').delete().eq('client_id', client.id)
    await supabaseAdmin.from('client_referrals').delete().eq('referrer_client_id', client.id)
    await supabaseAdmin.from('client_referrals').delete().eq('referred_client_id', client.id)
    // Note: appointments are kept for business records, but client_id set to NULL
    await supabaseAdmin.from('appointments').update({ client_id: null }).eq('client_id', client.id)
    // Finally delete the client
    await supabaseAdmin.from('clients').delete().eq('id', client.id)
  }

  return NextResponse.json({
    success: true,
    warnings_sent: warnings.length,
    soft_deleted: toDelete?.length || 0,
    hard_deleted: clientsToHardDelete?.length || 0,
    timestamp: new Date().toISOString(),
  })
}
```

### 1.5 API Route Modifications

**Modify:** `src/app/api/clients/route.ts`

```typescript
// Add plan check before creating client
export async function POST(req: Request) {
  const supabase = createServiceClient()
  const body = await req.json()

  // Check if business can add more clients
  const { allowed, reason } = await canAddClient(supabase, body.business_id)

  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 403 })
  }

  // Proceed with client creation...
}
```

**Modify:** `src/lib/gamification/loyalty-calculator-server.ts`

```typescript
// Add feature gate before awarding points
export async function awardLoyaltyPoints(appointmentId: string) {
  // Get appointment details
  const appointment = await getAppointment(appointmentId)

  // Check if business has gamification access
  const hasAccess = await canAccessFeature(supabase, appointment.business_id, 'gamification')

  if (!hasAccess) {
    console.log(`Gamification disabled for business ${appointment.business_id} (Basic plan)`)
    return { success: false, reason: 'feature_locked' }
  }

  // Proceed with points calculation...
}
```

### 1.6 Archivos Críticos (19 archivos)

**Database:**

1. `supabase/migrations/020_client_auth_enhancement.sql` (NEW)
2. `supabase/migrations/021_data_retention_system.sql` (NEW)

**Backend:** 3. `src/lib/subscription-features.ts` (NEW) 4. `src/lib/subscription.ts` (MODIFY - add canAddClient check) 5. `src/app/api/clients/route.ts` (MODIFY) 6. `src/lib/gamification/loyalty-calculator-server.ts` (MODIFY) 7. `supabase/functions/data-retention-cron/index.ts` (NEW)

**Frontend:** 8. `src/components/reservar/BookingSuccess.tsx` (MODIFY) 9. `src/components/loyalty/registration-incentive-modal.tsx` (NEW) 10. `src/components/dashboard/upgrade-banner.tsx` (NEW - for locked features)

**Types:** 11. `src/types/database.ts` (MODIFY - add deletion warnings types)

**Email:** 12. `src/lib/email/templates/deletion-warning.tsx` (NEW)

**Testing:** 13. `e2e/client-registration.spec.ts` (NEW)

**Estimated LOC:** ~1,880 lines

---

## Área 2: Advance Payments & No-Show Prevention

**Objetivo:** Permitir pagos anticipados opcionales con bonificación de puntos, y auto-detectar no-shows.

### 2.1 Database Schema Changes

**Migration 022: Advance Payment System**

```sql
-- Add payment fields to appointments
ALTER TABLE appointments
ADD COLUMN deposit_amount DECIMAL(10,2),
ADD COLUMN deposit_paid BOOLEAN DEFAULT false,
ADD COLUMN deposit_proof_url TEXT,
ADD COLUMN deposit_verified_at TIMESTAMPTZ,
ADD COLUMN deposit_verified_by UUID REFERENCES auth.users(id),
ADD COLUMN points_multiplier DECIMAL(3,2) DEFAULT 1.0;

CREATE INDEX idx_appointments_pending_deposits ON appointments(business_id, deposit_verified_at)
  WHERE deposit_paid = true AND deposit_verified_at IS NULL;

-- Add configuration to businesses
ALTER TABLE businesses
ADD COLUMN advance_payment_enabled BOOLEAN DEFAULT false,
ADD COLUMN advance_payment_multiplier DECIMAL(3,2) DEFAULT 1.5 CHECK (advance_payment_multiplier >= 1.2 AND advance_payment_multiplier <= 3.0),
ADD COLUMN no_show_delay_minutes INT DEFAULT 15 CHECK (no_show_delay_minutes >= 5 AND no_show_delay_minutes <= 60);

-- Modify loyalty points trigger to apply multiplier
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  program_record RECORD;
  points_to_award INT;
  base_points INT;
BEGIN
  -- Only award points for completed appointments
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get loyalty program
  SELECT * INTO program_record
  FROM loyalty_programs
  WHERE business_id = NEW.business_id AND enabled = true;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Calculate base points
  base_points := FLOOR(NEW.price * program_record.points_per_currency_unit);

  -- Apply multiplier if deposit was paid
  points_to_award := FLOOR(base_points * COALESCE(NEW.points_multiplier, 1.0));

  -- Award points (rest of existing logic...)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2.2 Booking Flow Integration

**Modify:** `src/app/(public)/reservar/[slug]/page.tsx`

```typescript
// Add optional deposit payment step
export default function BookingPage() {
  const [showDepositStep, setShowDepositStep] = useState(false)

  // After client info, check if deposit enabled
  const handleClientInfoSubmit = async (clientData) => {
    setBooking({ ...booking, client: clientData })

    // Check if business has deposit enabled
    if (business.advance_payment_enabled) {
      setShowDepositStep(true)
      setStep('deposit')
    } else {
      // Skip deposit, submit directly
      handleSubmit()
    }
  }

  return (
    <>
      {step === 'service' && <ServiceSelection />}
      {step === 'barber' && <BarberSelection />}
      {step === 'datetime' && <DateTimeSelection />}
      {step === 'client' && <ClientInfoForm onSubmit={handleClientInfoSubmit} />}

      {/* NEW: Optional deposit step */}
      {step === 'deposit' && showDepositStep && (
        <DepositPaymentStep
          amount={booking.service.price}
          multiplier={business.advance_payment_multiplier}
          onSubmit={handleDepositSubmit}
          onSkip={handleSubmit}
        />
      )}

      {step === 'success' && <BookingSuccess />}
    </>
  )
}
```

**New File:** `src/components/reservar/DepositPaymentStep.tsx`

```typescript
export function DepositPaymentStep({ amount, multiplier, businessPhone, onSubmit, onSkip }) {
  const [file, setFile] = useState<File | null>(null)
  const basePoints = Math.floor(amount * 10) // Example calculation
  const bonusPoints = Math.floor(basePoints * multiplier)

  // Format amount in Costa Rican Colones
  const formattedAmount = new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0
  }).format(amount)

  return (
    <Card>
      <CardHeader>
        <h2>¿Quieres pagar por adelantado? (Opcional)</h2>
      </CardHeader>
      <CardContent>
        {/* Incentive box */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg text-white mb-4">
          <h3>🎁 ¡Bonus de {multiplier}x puntos!</h3>
          <p>
            Pago normal: {basePoints} puntos<br/>
            <strong>Con pago anticipado: {bonusPoints} puntos</strong>
          </p>
        </div>

        {/* SINPE Móvil info - CORRECTED: Uses Colones (₡) */}
        <div className="border p-4 rounded mb-4">
          <h4>Instrucciones de pago:</h4>
          <p>1. Abre tu app bancaria</p>
          <p>2. SINPE Móvil a: <strong>{businessPhone}</strong></p>
          <p>3. Monto: <strong>{formattedAmount}</strong></p>
          <p>4. Sube captura del comprobante abajo</p>
        </div>

        {/* File upload */}
        <FileUpload
          accept="image/*"
          maxSize={5 * 1024 * 1024}
          onChange={setFile}
        />

        <div className="flex gap-2 mt-4">
          <Button onClick={() => onSubmit(file)} disabled={!file}>
            Subir comprobante
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Pagar en persona
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          ⚠️ Depósitos no son reembolsables si no te presentas a tu cita.
        </p>
      </CardContent>
    </Card>
  )
}
```

### 2.3 Deposit Verification API

**New File:** `src/app/api/appointments/[id]/verify-deposit/route.ts`

```typescript
// API to verify or reject a deposit
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient()
  const { action, rejection_reason } = await req.json()

  // Validate action
  if (!['verify', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Get appointment with business info
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, client:clients(*), businesses!inner(owner_id)')
    .eq('id', params.id)
    .single()

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  }

  // Verify ownership
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (appointment.businesses.owner_id !== user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  if (action === 'verify') {
    // Verify deposit and confirm appointment
    await supabase
      .from('appointments')
      .update({
        deposit_verified_at: new Date().toISOString(),
        deposit_verified_by: user.id,
        status: 'confirmed',
      })
      .eq('id', params.id)

    // Send confirmation to client
    if (appointment.client?.email) {
      await sendDepositConfirmedEmail(appointment)
    }

    return NextResponse.json({ success: true, action: 'verified' })
  } else if (action === 'reject') {
    // Reject deposit - give client option to re-submit or cancel
    await supabase
      .from('appointments')
      .update({
        deposit_paid: false,
        deposit_proof_url: null,
        status: 'pending', // Back to pending so client can retry
        internal_notes: `Depósito rechazado: ${rejection_reason || 'Sin motivo especificado'}`,
      })
      .eq('id', params.id)

    // Notify client of rejection
    if (appointment.client?.email) {
      await sendDepositRejectedEmail(appointment, rejection_reason)
    }

    // Create notification
    await supabase.from('notifications').insert({
      user_id: appointment.client?.user_id,
      type: 'deposit_rejected',
      title: 'Depósito rechazado',
      message: `Tu comprobante de pago fue rechazado. ${rejection_reason || ''}`,
      metadata: { appointment_id: params.id },
    })

    return NextResponse.json({ success: true, action: 'rejected' })
  }
}
```

**New Email Template:** `src/lib/email/templates/deposit-rejected.tsx`

```typescript
export function DepositRejectedEmail({ appointment, reason }: {
  appointment: Appointment
  reason?: string
}) {
  return (
    <EmailTemplate>
      <h1>⚠️ Comprobante de pago no válido</h1>
      <p>Hola {appointment.client.name},</p>
      <p>El comprobante que subiste para tu cita no pudo ser verificado.</p>

      {reason && (
        <div className="bg-yellow-50 p-4 rounded">
          <strong>Motivo:</strong> {reason}
        </div>
      )}

      <p>Tu cita sigue programada, pero necesitas:</p>
      <ul>
        <li>Subir un nuevo comprobante válido, o</li>
        <li>Pagar en persona al llegar</li>
      </ul>

      <p>
        <strong>Cita:</strong> {format(appointment.scheduled_at, 'PPp')}<br/>
        <strong>Servicio:</strong> {appointment.service?.name}
      </p>

      <Button href={`${BASE_URL}/reservar/${appointment.business.slug}`}>
        Subir nuevo comprobante
      </Button>
    </EmailTemplate>
  )
}
```

### 2.4 Payment Verification Dashboard

**Modify:** `src/app/(dashboard)/citas/page.tsx`

```typescript
// Add "Pending Deposits" section
export default function AppointmentsPage() {
  const [pendingDeposits, setPendingDeposits] = useState([])

  useEffect(() => {
    async function loadPendingDeposits() {
      const { data } = await supabase
        .from('appointments')
        .select('*, client:clients(*), service:services(*)')
        .eq('business_id', businessId)
        .eq('deposit_paid', true)
        .is('deposit_verified_at', null)
        .order('created_at', { ascending: false })

      setPendingDeposits(data || [])
    }
    loadPendingDeposits()
  }, [])

  return (
    <div>
      {/* Pending deposits section */}
      {pendingDeposits.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h3>📋 Depósitos Pendientes de Verificación</h3>
          </CardHeader>
          <CardContent>
            {pendingDeposits.map(apt => (
              <PendingDepositCard
                key={apt.id}
                appointment={apt}
                onVerify={handleVerifyDeposit}
                onReject={handleRejectDeposit}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Existing appointments list */}
    </div>
  )
}
```

**New File:** `src/components/appointments/pending-deposit-card.tsx`

```typescript
export function PendingDepositCard({ appointment, onVerify, onReject }) {
  const [showProof, setShowProof] = useState(false)

  return (
    <div className="border p-4 rounded-lg mb-2">
      <div className="flex justify-between items-start">
        <div>
          <p><strong>{appointment.client.name}</strong></p>
          <p className="text-sm text-muted-foreground">
            {format(appointment.scheduled_at, 'PPp')}
          </p>
          <p className="text-sm">Monto: ${appointment.deposit_amount}</p>
        </div>

        {/* Proof preview */}
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProof(true)}
          >
            Ver comprobante
          </Button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <Button onClick={() => onVerify(appointment.id)}>
          ✅ Verificar y confirmar
        </Button>
        <Button variant="destructive" onClick={() => onReject(appointment.id)}>
          ❌ Rechazar
        </Button>
      </div>

      {/* Modal with image */}
      {showProof && (
        <Modal onClose={() => setShowProof(false)}>
          <img src={appointment.deposit_proof_url} alt="Comprobante" />
        </Modal>
      )}
    </div>
  )
}
```

### 2.4 Email System Integration

**New File:** `src/lib/email/templates/deposit-received.tsx`

```typescript
export function DepositReceivedEmail({ business, appointment, proofUrl }) {
  return (
    <EmailTemplate>
      <h1>Nuevo depósito recibido</h1>
      <p>Cliente: {appointment.client.name}</p>
      <p>Fecha: {format(appointment.scheduled_at, 'PPp')}</p>
      <p>Monto: ${appointment.deposit_amount}</p>

      <img src={proofUrl} alt="Comprobante de pago" width="400" />

      <p>
        <a href={`${BASE_URL}/citas`}>Ver y verificar en el dashboard</a>
      </p>
    </EmailTemplate>
  )
}
```

**Modify:** `src/app/api/public/[slug]/book/route.ts`

```typescript
// Handle deposit upload and email
export async function POST(req: Request, { params }) {
  // ... existing booking logic

  // If deposit was paid, handle file upload
  if (body.depositFile) {
    // Upload to Supabase Storage
    const fileName = `${appointment.id}_${Date.now()}.${body.depositFile.type.split('/')[1]}`
    const filePath = `appointment-deposits/${businessId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, body.depositFile)

    if (uploadError) throw uploadError

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('payment-proofs').getPublicUrl(filePath)

    // Update appointment with proof URL
    await supabase
      .from('appointments')
      .update({
        deposit_paid: true,
        deposit_amount: body.depositAmount,
        deposit_proof_url: publicUrl,
        points_multiplier: business.advance_payment_multiplier,
      })
      .eq('id', appointment.id)

    // Send email to business owner with link to view proof
    await sendDepositReceivedEmail(business, appointment, publicUrl)

    // NOTE: File is kept for 7 days, then auto-deleted by cleanup cron
    // This provides backup in case email delivery fails
  }

  return NextResponse.json({ appointment })
}
```

**New File:** `src/app/api/cron/cleanup-deposit-proofs/route.ts`

```typescript
// Vercel Cron Job - runs daily at 3 AM UTC
// Cleans up deposit proof files older than 7 days
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServiceClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Find appointments with old deposits that have been verified or cancelled
  const { data: oldDeposits } = await supabase
    .from('appointments')
    .select('id, deposit_proof_url')
    .not('deposit_proof_url', 'is', null)
    .or(
      `deposit_verified_at.lt.${sevenDaysAgo.toISOString()},status.eq.cancelled,status.eq.no_show`
    )

  let deletedCount = 0

  for (const apt of oldDeposits || []) {
    if (apt.deposit_proof_url) {
      // Extract file path from URL
      const urlParts = apt.deposit_proof_url.split('/payment-proofs/')
      if (urlParts[1]) {
        const filePath = `payment-proofs/${urlParts[1]}`
        await supabase.storage.from('payment-proofs').remove([filePath])

        // Clear URL in database (keep other deposit fields for records)
        await supabase.from('appointments').update({ deposit_proof_url: null }).eq('id', apt.id)

        deletedCount++
      }
    }
  }

  return NextResponse.json({
    success: true,
    deleted: deletedCount,
    timestamp: new Date().toISOString(),
  })
}
```

### 2.5 Auto No-Show Detection

**New File:** `src/app/api/cron/auto-noshow/route.ts`

```typescript
// Vercel Cron Job - runs every 5 minutes
// IMPORTANT: Handles timezone properly using business timezone
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServiceClient()

  // Find appointments that should be marked as no-show
  // Only process appointments with deposits (as per business rules)
  // Note: scheduled_at is stored in UTC in the database
  const { data: appointments } = await supabase
    .from('appointments')
    .select(
      `
      id,
      scheduled_at,
      deposit_paid,
      deposit_amount,
      business_id,
      client:clients(*),
      businesses!inner(
        no_show_delay_minutes,
        name,
        timezone,
        owner_id
      )
    `
    )
    .eq('status', 'confirmed')
    .eq('deposit_paid', true)

  let markedCount = 0
  const now = new Date()

  for (const apt of appointments || []) {
    // scheduled_at is already in UTC, compare directly
    const scheduledTime = new Date(apt.scheduled_at)
    const delayMinutes = apt.businesses.no_show_delay_minutes || 15
    const cutoffTime = new Date(scheduledTime.getTime() + delayMinutes * 60 * 1000)

    // If past cutoff time, mark as no-show
    if (now >= cutoffTime) {
      // Update status
      await supabase.from('appointments').update({ status: 'no_show' }).eq('id', apt.id)

      // Create notification for business owner
      await supabase.from('notifications').insert({
        user_id: apt.businesses.owner_id,
        type: 'no_show_detected',
        title: 'Cliente no se presentó',
        message: `${apt.client.name} no llegó a su cita. Depósito de ₡${apt.deposit_amount?.toLocaleString('es-CR') || '0'} retenido.`,
        metadata: { appointment_id: apt.id, deposit_amount: apt.deposit_amount },
      })

      // ALSO notify the client that they were marked as no-show
      if (apt.client?.user_id) {
        await supabase.from('notifications').insert({
          user_id: apt.client.user_id,
          type: 'marked_as_no_show',
          title: 'Cita marcada como no-show',
          message: `No te presentaste a tu cita en ${apt.businesses.name}. El depósito de ₡${apt.deposit_amount?.toLocaleString('es-CR') || '0'} no es reembolsable.`,
          metadata: { appointment_id: apt.id },
        })
      }

      // Send email to client if they have email
      if (apt.client?.email) {
        await sendNoShowNotificationEmail(apt)
      }

      markedCount++
    }
  }

  return NextResponse.json({
    success: true,
    marked: markedCount,
    checked: appointments?.length || 0,
    timestamp: new Date().toISOString(),
  })
}
```

**New Email Template:** `src/lib/email/templates/no-show-client.tsx`

```typescript
export function NoShowClientEmail({ appointment }) {
  return (
    <EmailTemplate>
      <h1>😔 No te presentaste a tu cita</h1>
      <p>Hola {appointment.client.name},</p>

      <p>Lamentamos informarte que no llegaste a tu cita programada:</p>

      <div className="bg-gray-50 p-4 rounded">
        <p><strong>Fecha:</strong> {format(appointment.scheduled_at, 'PPp')}</p>
        <p><strong>Negocio:</strong> {appointment.businesses.name}</p>
        <p><strong>Servicio:</strong> {appointment.service?.name}</p>
      </div>

      <div className="bg-red-50 p-4 rounded mt-4">
        <p>
          <strong>Depósito no reembolsable:</strong> ₡{appointment.deposit_amount?.toLocaleString('es-CR')}
        </p>
        <p className="text-sm text-gray-600">
          Según nuestra política, los depósitos no son reembolsables en caso de no presentarse.
        </p>
      </div>

      <p>Si hubo un error o emergencia, por favor contacta directamente al negocio.</p>
    </EmailTemplate>
  )
}
```

**Add to:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-noshow",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/data-retention",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup-deposit-proofs",
      "schedule": "0 3 * * *"
    }
  ]
}
```

**Environment variables needed:**

```bash
# Add to .env.local and Vercel dashboard
CRON_SECRET=your-secure-random-string-here

```

### 2.6 Settings UI

**Modify:** `src/app/(dashboard)/configuracion/page.tsx`

```typescript
// Add "Advance Payments" section
export default function SettingsPage() {
  const [advancePaymentEnabled, setAdvancePaymentEnabled] = useState(false)
  const [multiplier, setMultiplier] = useState(1.5)
  const [noShowDelay, setNoShowDelay] = useState(15)

  // Load settings from business
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('businesses')
        .select('advance_payment_enabled, advance_payment_multiplier, no_show_delay_minutes')
        .eq('id', businessId)
        .single()

      if (data) {
        setAdvancePaymentEnabled(data.advance_payment_enabled)
        setMultiplier(data.advance_payment_multiplier)
        setNoShowDelay(data.no_show_delay_minutes)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    await supabase
      .from('businesses')
      .update({
        advance_payment_enabled: advancePaymentEnabled,
        advance_payment_multiplier: multiplier,
        no_show_delay_minutes: noShowDelay
      })
      .eq('id', businessId)

    toast.success('Configuración guardada')
  }

  return (
    <Card>
      <CardHeader>
        <h3>💰 Pagos Anticipados</h3>
        <p className="text-sm text-muted-foreground">
          Reduce no-shows ofreciendo bonus de puntos a clientes que pagan por adelantado
        </p>
      </CardHeader>
      <CardContent>
        {/* Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Label>Habilitar pagos anticipados</Label>
          <Switch
            checked={advancePaymentEnabled}
            onCheckedChange={setAdvancePaymentEnabled}
          />
        </div>

        {advancePaymentEnabled && (
          <>
            {/* Multiplier slider */}
            <div className="mb-4">
              <Label>Bonus de puntos: {multiplier}x</Label>
              <Slider
                value={[multiplier]}
                onValueChange={([val]) => setMultiplier(val)}
                min={1.2}
                max={3.0}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Ejemplo: Cita de $20 = {Math.floor(20 * 10)} pts normal, {Math.floor(20 * 10 * multiplier)} pts con pago anticipado
              </p>
            </div>

            {/* No-show delay */}
            <div>
              <Label>Minutos de tolerancia: {noShowDelay} min</Label>
              <Slider
                value={[noShowDelay]}
                onValueChange={([val]) => setNoShowDelay(val)}
                min={5}
                max={60}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Si el cliente no llega en {noShowDelay} minutos, se marca automáticamente como no-show
              </p>
            </div>
          </>
        )}

        <Button onClick={handleSave} className="mt-4">
          Guardar cambios
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 2.7 Archivos Críticos (16 archivos)

**Database:**

1. `supabase/migrations/022_advance_payment_system.sql` (NEW)

**Backend API:** 2. `src/app/api/public/[slug]/book/route.ts` (MODIFY) 3. `src/app/api/appointments/[id]/verify-deposit/route.ts` (NEW) 4. `src/app/api/cron/auto-noshow/route.ts` (NEW)

**Frontend Components:** 5. `src/app/(public)/reservar/[slug]/page.tsx` (MODIFY) 6. `src/components/reservar/DepositPaymentStep.tsx` (NEW) 7. `src/app/(dashboard)/citas/page.tsx` (MODIFY) 8. `src/components/appointments/pending-deposit-card.tsx` (NEW) 9. `src/app/(dashboard)/configuracion/page.tsx` (MODIFY)

**Email:** 10. `src/lib/email/templates/deposit-received.tsx` (NEW) 11. `src/lib/email/templates/no-show-notification.tsx` (NEW)

**Config:** 12. `vercel.json` (MODIFY - add cron jobs)

**Types:** 13. `src/types/database.ts` (MODIFY - add deposit fields)

**Estimated LOC:** ~1,860 lines

---

## Área 3: Rebranding (Barber → Staff)

**Objetivo:** Cambiar toda la terminología de "barbero" a "staff" en código, UI, y documentación.

### 3.1 Estrategia Híbrida (Recomendada)

**Decisión:** Mantener nombres de tablas en DB, cambiar TODO el código y UI a usar "Staff".

**Razones:**

- ✅ Bajo riesgo (sin cambios de DB)
- ✅ Rápido (20-25 horas vs 40+ horas)
- ✅ Fácil rollback (git revert)
- ✅ Usuario ve "Equipo/Personal" en todas partes
- ⚠️ Deuda técnica mínima (bien documentada)

### 3.2 Database Documentation

**New File:** `docs/schema-naming-convention.md`

```markdown
# Database Schema Naming Convention

## Legacy Naming: "Barber" Tables

The database uses "barber" in table names for historical reasons, but the application
now refers to these as "Staff Members" or "Team Members" throughout the codebase and UI.

### Table Mapping

| Database Table        | Application Concept | TypeScript Type    |
| --------------------- | ------------------- | ------------------ |
| `barbers`             | Staff Members       | `StaffMember`      |
| `barber_invitations`  | Staff Invitations   | `StaffInvitation`  |
| `barber_stats`        | Staff Statistics    | `StaffStats`       |
| `barber_achievements` | Staff Achievements  | `StaffAchievement` |
| `barber_challenges`   | Staff Challenges    | `StaffChallenge`   |

### Why Not Rename Tables?

Renaming database tables would require:

- Rewriting 6 migrations
- Updating 13+ RLS policies
- Recreating foreign key constraints
- Production downtime
- Risk of data loss
- 40+ hours of work

Instead, we use a clean abstraction layer in code while keeping stable DB schema.
```

### 3.3 TypeScript Type System

**Modify:** `src/types/database.ts`

```typescript
// Legacy DB interface (keep for queries)
export interface Barber {
  id: string
  business_id: string
  user_id: string | null
  name: string
  email: string
  bio: string | null
  photo_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// Modern application type (use everywhere in code)
export type StaffMember = Barber
export type Staff = StaffMember // Shorthand

// Same for other types
export type StaffInvitation = BarberInvitation
export type StaffStats = BarberStats
export type StaffAchievement = BarberAchievement
export type StaffChallenge = BarberChallenge
```

### 3.4 Query Abstraction Layer

**New File:** `src/lib/staff/queries.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { StaffMember } from '@/types/database'

// Clean API using "staff" terminology, queries "barbers" table
export async function getStaffMembers(
  supabase: SupabaseClient,
  businessId: string
): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from('barbers') // Legacy table name
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('display_order')

  if (error) throw error
  return data as StaffMember[]
}

export async function createStaffMember(
  supabase: SupabaseClient,
  data: Partial<StaffMember>
): Promise<StaffMember> {
  const { data: created, error } = await supabase.from('barbers').insert(data).select().single()

  if (error) throw error
  return created as StaffMember
}

export async function updateStaffMember(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<StaffMember>
): Promise<StaffMember> {
  const { data, error } = await supabase
    .from('barbers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as StaffMember
}

export async function deleteStaffMember(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('barbers').delete().eq('id', id)

  if (error) throw error
}
```

**New File:** `src/lib/staff/hooks.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStaffMembers, createStaffMember, updateStaffMember, deleteStaffMember } from './queries'

export function useStaffMembers(businessId: string) {
  return useQuery({
    queryKey: ['staff', businessId],
    queryFn: () => getStaffMembers(supabase, businessId),
  })
}

export function useCreateStaffMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<StaffMember>) => createStaffMember(supabase, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

// Similar for update and delete...
```

### 3.5 Component Refactoring

**Rename Files:**

```bash
# Components
mv src/components/barbers/barbers-management.tsx → src/components/staff/staff-management.tsx
mv src/components/barbers/ → src/components/staff/

# Pages
# Keep URL as /barberos (already Spanish), just update component names
src/app/(dashboard)/barberos/page.tsx - UPDATE imports and component names

# API Routes
# Keep /api/barbers URLs for backwards compatibility
# Just update internal code
```

**Update:** `src/components/staff/staff-management.tsx`

```typescript
// Previously: BarbersManagement
export function StaffManagement() {
  const { data: staffMembers, isLoading } = useStaffMembers(businessId)
  const createMutation = useCreateStaffMember()

  return (
    <Card>
      <CardHeader>
        <h2>👥 Equipo</h2>
        <p>Gestiona los miembros de tu equipo</p>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAddStaffMember}>
          Agregar Miembro
        </Button>

        {/* List of staff members */}
        {staffMembers?.map(member => (
          <StaffMemberCard key={member.id} member={member} />
        ))}
      </CardContent>
    </Card>
  )
}
```

### 3.6 Spanish UI Text Updates

**40+ strings to update across components:**

| Old (Barber-specific) | New (Generic)                        |
| --------------------- | ------------------------------------ |
| "Barbero"             | "Miembro del equipo" / "Profesional" |
| "Barberos"            | "Equipo" / "Personal"                |
| "Staff de Barberos"   | "Tu Equipo"                          |
| "Agregar Barbero"     | "Agregar Miembro"                    |
| "Editar Barbero"      | "Editar Miembro"                     |
| "Eliminar Barbero"    | "Eliminar Miembro"                   |
| "Elige tu barbero"    | "Elige quién te atenderá"            |
| "Ranking de Barberos" | "Ranking del Equipo"                 |
| "Logros de Barberos"  | "Logros del Equipo"                  |
| "Tu Primer Barbero"   | "Tu Primer Miembro del Equipo"       |

**Files to update:**

- `src/components/staff/*` (12 components)
- `src/components/reservar/StaffSelection.tsx`
- `src/components/onboarding/steps/staff.tsx`
- `src/components/dashboard/sidebar.tsx`
- `src/components/dashboard/bottom-nav.tsx`
- `src/app/(dashboard)/barberos/page.tsx` (keep URL, update text)

**Email templates (ADDED - previously missing):**

- `src/lib/email/templates/new-appointment.tsx`
- `src/lib/email/templates/trial-expiring.tsx`
- `src/lib/email/templates/payment-approved.tsx`

**Landing page components (ADDED - previously missing):**

- `src/components/landing/hero-section.tsx`
- `src/components/landing/features-section.tsx`
- `src/components/landing/testimonials-section.tsx`
- `src/components/landing/pricing-section.tsx`
- `src/components/landing/footer.tsx`
- `src/app/page.tsx` (landing page)
- `src/app/precios/page.tsx` (pricing page)

**PWA & SEO (ADDED - previously missing):**

- `src/app/manifest.ts` - Change "BarberShop Pro" → "Salon Pro" o nombre genérico
- `src/app/layout.tsx` - Update metadata (title, description)
- `public/sw.js` - If has barber references

**E2E Tests (ADDED - previously missing):**

- `e2e/auth.spec.ts`
- `e2e/appointments.spec.ts`
- `e2e/clients.spec.ts`

### 3.7 Business Logic Updates

**Modify:** `src/lib/subscription.ts`

```typescript
// Rename function (keep old as deprecated alias)
export async function canAddStaffMember(
  supabase: SupabaseClient,
  businessId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getSubscriptionStatus(supabase, businessId)

  if (!status) return { allowed: false, reason: 'No subscription' }

  // Check staff limit (queries 'barbers' table)
  const { count } = await supabase
    .from('barbers')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)

  if (status.plan.max_barbers && count >= status.plan.max_barbers) {
    return {
      allowed: false,
      reason: `Plan ${status.plan.display_name} permite máximo ${status.plan.max_barbers} miembros del equipo`,
    }
  }

  return { allowed: true }
}

// Deprecated alias for backwards compatibility
export const canAddBarber = canAddStaffMember
```

### 3.8 Implementation Phases

**Phase 1: Foundation (Day 1, 4-6h)**

- Create `docs/schema-naming-convention.md`
- Update `src/types/database.ts` with type aliases
- Create `src/lib/staff/queries.ts` abstraction layer
- Create `src/lib/staff/hooks.ts` React Query hooks
- Test: Verify types compile

**Phase 2: Components (Day 2, 6-8h)**

- Rename `src/components/barbers/` → `src/components/staff/`
- Update all component names and imports
- Fix import statements across ~50 files
- Test: Verify app compiles and runs

**Phase 3: Spanish UI (Day 3, 4-6h)**

- Update 40+ Spanish strings across components
- Update navigation labels
- Update page titles
- Test: Visual verification - no "barbero" visible

**Phase 4: API & Business Logic (Day 3-4, 4-6h)**

- Update `src/lib/subscription.ts`
- Add comments to API routes explaining legacy URLs
- Update error messages
- Test: API endpoints still work

**Phase 5: Gamification (Day 4, 3-4h)**

- Rename `src/lib/gamification/barber-gamification.ts` → `staff-gamification.ts`
- Update type aliases for gamification tables
- Update UI text in achievement/challenge components
- Test: Gamification features work

**Phase 6: Documentation & Polish (Day 4, 2h)**

- Update README.md
- Create migration guide for developers
- Update PROGRESS.md
- Final visual verification

### 3.9 Testing Checklist

**Critical User Flows:**

- [ ] Staff CRUD operations work (`/barberos`)
- [ ] Public booking with staff selection (`/reservar/[slug]`)
- [ ] Staff gamification (achievements, challenges, leaderboard)
- [ ] Analytics staff tab
- [ ] Subscription limit enforcement for staff
- [ ] No "barbero" visible in UI (except URLs)
- [ ] All Spanish text shows "Equipo"/"Personal"/"Miembro"

**Automated:**

```bash
npx tsc --noEmit  # TypeScript compiles
npm run lint      # No lint errors
npm run build     # Production build succeeds
```

### 3.10 Archivos Críticos (81 archivos)

**Foundation (Must do first):**

1. `docs/schema-naming-convention.md` (NEW)
2. `src/types/database.ts` (MODIFY)
3. `src/lib/staff/queries.ts` (NEW)
4. `src/lib/staff/hooks.ts` (NEW)

**Components (Bulk rename):**
5-16. All files in `src/components/staff/` (renamed from barbers/)

**Pages:** 17. `src/app/(dashboard)/barberos/page.tsx` (MODIFY) 18. `src/app/(dashboard)/barberos/logros/page.tsx` (MODIFY) 19. `src/app/(dashboard)/barberos/desafios/page.tsx` (MODIFY)

**API Routes (Comment + update code):**
20-28. All files in `src/app/api/barbers/*` (9 files)

**Business Logic:** 29. `src/lib/subscription.ts` (MODIFY) 30. `src/lib/gamification/staff-gamification.ts` (RENAME + MODIFY)

**Booking Flow:** 31. `src/components/reservar/StaffSelection.tsx` (RENAME) 32. `src/hooks/useBookingData.ts` (MODIFY)

**Onboarding:** 33. `src/components/onboarding/steps/staff.tsx` (RENAME)

**Navigation:** 34. `src/components/dashboard/sidebar.tsx` (MODIFY) 35. `src/components/dashboard/bottom-nav.tsx` (MODIFY)

**Analytics:** 36. `src/components/analytics/staff-leaderboard.tsx` (RENAME)

**Documentation:** 37. `README.md` (MODIFY) 38. `docs/staff-migration-guide.md` (NEW)

**+40 more files** with Spanish text updates

**Estimated LOC:** ~2,000 lines of changes (mostly find-replace + refactoring)

---

## Área 4: Sistema de Referidos Cliente-a-Cliente

**Objetivo:** Permitir que clientes refieran a otros clientes y trackeen sus referidos/rewards desde un dashboard visible.

**Contexto:** El schema ya existe (`client_referrals` + `client_loyalty_status.referral_code`), pero:

- ❌ NO hay tracking de referrals durante booking (`?ref=CODE`)
- ❌ NO hay distribución de rewards cuando referido completa cita
- ❌ NO hay UI/dashboard para que el cliente vea su código y referidos

### 4.0 Flujo de Referral Durante Booking (CRÍTICO)

**Problema:** El booking flow actual NO maneja el parámetro `?ref=CODE`.

**Archivos a modificar:**

1. **`src/app/(public)/reservar/[slug]/page.tsx`** - Detectar `?ref=CODE` con `useSearchParams`
2. **`src/app/api/public/[slug]/book/route.ts`** - Crear `client_referrals` record si hay código

**Lógica:**

```typescript
// En booking page: detectar código
const searchParams = useSearchParams()
const referralCode = searchParams.get('ref')

// Al enviar booking, incluir código
await fetch(`/api/public/${slug}/book`, {
  body: JSON.stringify({ ...data, referralCode }),
})

// En API route: procesar referral
if (referralCode && newClient) {
  // 1. Buscar referrer por código
  const referrer = await supabase
    .from('client_loyalty_status')
    .select('client_id')
    .eq('referral_code', referralCode)
    .single()

  // 2. Crear registro de referral
  if (referrer) {
    await supabase.from('client_referrals').insert({
      business_id,
      referrer_client_id: referrer.client_id,
      referred_client_id: newClient.id,
      referral_code: referralCode,
      status: 'pending',
    })
  }
}
```

### 4.0.1 Distribución de Rewards (CRÍTICO)

**Trigger:** Cuando el referido completa su PRIMERA cita.

**New File:** `src/lib/gamification/referral-rewards.ts`

```typescript
export async function processReferralReward(supabase, appointmentId) {
  // 1. Get appointment
  // 2. Check if client has pending referral
  // 3. Verify it's client's FIRST completed appointment
  // 4. Mark referral as completed
  // 5. Award points to REFERRER
  // 6. Award points to REFERRED (welcome bonus)
  // 7. Create notifications
}
```

**Integrar en:** `src/lib/gamification/loyalty-calculator-server.ts`

```typescript
// Después de completar appointment
await processReferralReward(supabase, appointment.id)
```

### 4.1 Schema Existente (Ya implementado)

Las tablas necesarias ya existen:

```sql
-- client_loyalty_status tiene referral_code
CREATE TABLE client_loyalty_status (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  client_id UUID REFERENCES clients(id),
  user_id UUID REFERENCES auth.users(id),
  referral_code TEXT UNIQUE,  -- Código único del cliente
  points_balance INT DEFAULT 0,
  tier TEXT DEFAULT 'bronze'
);

-- client_referrals trackea referidos
CREATE TABLE client_referrals (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  referrer_client_id UUID REFERENCES clients(id),
  referred_client_id UUID REFERENCES clients(id),
  referral_code TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'expired')),
  referrer_reward_claimed_at TIMESTAMPTZ,
  referred_reward_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- loyalty_programs config tiene reward settings
-- referralRewardType: 'discount' | 'points' | 'free_service'
-- referralRewardAmount: number (ej. 25%)
-- refereeRewardAmount: number (lo que recibe el referido)
```

### 4.2 Backend APIs (3 endpoints)

**New File:** `src/app/api/client-referrals/my-code/route.ts`

```typescript
// GET /api/client-referrals/my-code
// Propósito: Obtener el código de referido del cliente autenticado

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 2. Get client record
  const { data: client } = await supabase
    .from('clients')
    .select('id, business_id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // 3. Get loyalty status with referral code
  const { data: loyaltyStatus } = await supabase
    .from('client_loyalty_status')
    .select('referral_code')
    .eq('client_id', client.id)
    .single()

  // 4. Get business slug for share URL
  const { data: business } = await supabase
    .from('businesses')
    .select('slug, name')
    .eq('id', client.business_id)
    .single()

  // 5. Get loyalty program config for reward info
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('referral_reward_type, referral_reward_amount, referee_reward_amount')
    .eq('business_id', client.business_id)
    .single()

  // 6. Build response
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'
  const shareUrl = `${baseUrl}/reservar/${business?.slug}?ref=${loyaltyStatus?.referral_code}`

  let description = ''
  if (program?.referral_reward_type === 'discount') {
    description = `Tú y tu amigo reciben ${program.referral_reward_amount}% de descuento`
  } else if (program?.referral_reward_type === 'points') {
    description = `Tú ganas ${program.referral_reward_amount} puntos, tu amigo gana ${program.referee_reward_amount} puntos`
  } else if (program?.referral_reward_type === 'free_service') {
    description = `Ambos reciben un servicio gratis después de la primera cita`
  }

  return NextResponse.json({
    referralCode: loyaltyStatus?.referral_code,
    shareUrl,
    rewardInfo: {
      type: program?.referral_reward_type,
      amount: program?.referral_reward_amount,
      description,
    },
  })
}
```

**New File:** `src/app/api/client-referrals/stats/route.ts`

```typescript
// GET /api/client-referrals/stats
// Propósito: Obtener stats de referidos del cliente

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get client_id
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Get all referrals by this client
  const { data: referrals } = await supabase
    .from('client_referrals')
    .select('id, status, referrer_reward_claimed_at')
    .eq('referrer_client_id', client.id)

  // Calculate stats
  const total = referrals?.length || 0
  const completed = referrals?.filter((r) => r.status === 'completed').length || 0
  const pending = referrals?.filter((r) => r.status === 'pending').length || 0
  const rewardsClaimed = referrals?.filter((r) => r.referrer_reward_claimed_at).length || 0

  // Get loyalty program to calculate reward value
  const { data: loyaltyStatus } = await supabase
    .from('client_loyalty_status')
    .select('points_balance')
    .eq('client_id', client.id)
    .single()

  return NextResponse.json({
    totalReferrals: total,
    completedReferrals: completed,
    pendingReferrals: pending,
    rewardsClaimed,
    // Points earned from referrals would need separate tracking
    // For now, show general points balance
    currentPoints: loyaltyStatus?.points_balance || 0,
  })
}
```

**New File:** `src/app/api/client-referrals/list/route.ts`

```typescript
// GET /api/client-referrals/list
// Propósito: Lista de amigos referidos

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get client_id
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Get referrals with referred client name
  const { data: referrals } = await supabase
    .from('client_referrals')
    .select(
      `
      id,
      status,
      created_at,
      completed_at,
      referrer_reward_claimed_at,
      referred_client:clients!referred_client_id(name)
    `
    )
    .eq('referrer_client_id', client.id)
    .order('created_at', { ascending: false })

  // Format response (privacy: only show first name + initial)
  const formattedReferrals = referrals?.map((r) => {
    const fullName = r.referred_client?.name || 'Usuario'
    const nameParts = fullName.split(' ')
    const displayName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0]

    return {
      id: r.id,
      referredName: displayName,
      status: r.status,
      createdAt: r.created_at,
      completedAt: r.completed_at,
      rewardClaimed: !!r.referrer_reward_claimed_at,
    }
  })

  return NextResponse.json({ referrals: formattedReferrals || [] })
}
```

### 4.3 Frontend Components (4 componentes)

**New File:** `src/components/client-referrals/client-referral-code-card.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ReferralCodeData {
  referralCode: string
  shareUrl: string
  rewardInfo: {
    type: string
    amount: number
    description: string
  }
}

export function ClientReferralCodeCard() {
  const [data, setData] = useState<ReferralCodeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCode() {
      const res = await fetch('/api/client-referrals/my-code')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
      setLoading(false)
    }
    fetchCode()
  }, [])

  const handleCopy = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(data.referralCode)
      toast.success('Código copiado')
    }
  }

  const handleWhatsApp = () => {
    if (data?.shareUrl) {
      const message = encodeURIComponent(
        `¡Reserva tu cita y ambos ganamos! Usa mi código: ${data.referralCode}\n\n${data.shareUrl}`
      )
      window.open(`https://wa.me/?text=${message}`, '_blank')
    }
  }

  if (loading) {
    return <Card><CardContent className="p-6"><div className="animate-pulse h-32 bg-muted rounded" /></CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">🎁 Refiere y Gana</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code display */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Tu Código:</p>
          <div className="bg-muted p-3 rounded-lg font-mono text-lg text-center">
            {data?.referralCode || 'N/A'}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleWhatsApp}>
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>

        {/* Reward info */}
        {data?.rewardInfo?.description && (
          <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
            <p className="text-sm">
              💡 {data.rewardInfo.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**New File:** `src/components/client-referrals/client-referral-stats.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, UserCheck, Gift, Star } from 'lucide-react'

interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  rewardsClaimed: number
  currentPoints: number
}

export function ClientReferralStats() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch('/api/client-referrals/stats')
      if (res.ok) {
        const json = await res.json()
        setStats(json)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    { label: 'Total Referidos', value: stats?.totalReferrals || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Completados', value: stats?.completedReferrals || 0, icon: UserCheck, color: 'text-green-500' },
    { label: 'Rewards Ganados', value: stats?.rewardsClaimed || 0, icon: Gift, color: 'text-purple-500' },
    { label: 'Puntos Totales', value: stats?.currentPoints || 0, icon: Star, color: 'text-amber-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-3">
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**New File:** `src/components/client-referrals/client-referrals-table.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Referral {
  id: string
  referredName: string
  status: 'pending' | 'completed' | 'expired'
  createdAt: string
  completedAt: string | null
  rewardClaimed: boolean
}

export function ClientReferralsTable() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchList() {
      const res = await fetch('/api/client-referrals/list')
      if (res.ok) {
        const json = await res.json()
        setReferrals(json.referrals || [])
      }
      setLoading(false)
    }
    fetchList()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">✅ Activo</Badge>
      case 'pending':
        return <Badge variant="secondary">⏳ Pendiente</Badge>
      case 'expired':
        return <Badge variant="destructive">❌ Expirado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">👥 Tus Referidos</h3>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aún no has referido a nadie.</p>
            <p className="text-sm mt-2">¡Comparte tu código y comienza a ganar rewards!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map(referral => (
              <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{referral.referredName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(referral.createdAt), {
                      addSuffix: true,
                      locale: es
                    })}
                  </p>
                </div>
                {getStatusBadge(referral.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**New File:** `src/components/client-referrals/rewards-info-banner.tsx`

```typescript
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

export function RewardsInfoBanner() {
  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold mb-2">📱 ¿Cómo funciona?</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Comparte tu código con amigos</li>
              <li>2. Tu amigo reserva usando tu código</li>
              <li>3. Cuando completa su primera cita, ¡ambos ganan!</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 4.4 Página Principal del Dashboard

**New File:** `src/app/(client-dashboard)/referidos/page.tsx`

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ClientReferralCodeCard } from '@/components/client-referrals/client-referral-code-card'
import { ClientReferralStats } from '@/components/client-referrals/client-referral-stats'
import { ClientReferralsTable } from '@/components/client-referrals/client-referrals-table'
import { RewardsInfoBanner } from '@/components/client-referrals/rewards-info-banner'

export const metadata = {
  title: 'Mis Referidos | Tu Cuenta',
  description: 'Refiere amigos y gana recompensas'
}

export default async function ClientReferralsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Verify client exists and has loyalty status
  const { data: client } = await supabase
    .from('clients')
    .select('id, business_id')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    redirect('/') // Not a registered client
  }

  // Check if business has referral program enabled
  const { data: program } = await supabase
    .from('loyalty_programs')
    .select('program_type, referral_reward_type')
    .eq('business_id', client.business_id)
    .single()

  const hasReferralProgram = program?.program_type === 'referral' ||
                             program?.program_type === 'hybrid'

  if (!hasReferralProgram) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">🎁 Programa de Referidos</h1>
        <p className="text-muted-foreground">
          Este negocio aún no tiene un programa de referidos activo.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">🎁 Refiere y Gana</h1>
        <p className="text-muted-foreground">
          Invita a tus amigos y gana recompensas con cada referido
        </p>
      </div>

      {/* How it works banner */}
      <RewardsInfoBanner />

      {/* Stats */}
      <ClientReferralStats />

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ClientReferralCodeCard />
        </div>
        <div className="lg:col-span-2">
          <ClientReferralsTable />
        </div>
      </div>
    </div>
  )
}
```

### 4.5 Integración con Navegación

**Modify:** `src/components/client-dashboard/sidebar.tsx`

```typescript
// Add "Referidos" link - only show if:
// 1. Client has account (user_id)
// 2. Business has referral/hybrid program
// 3. Business is on Pro plan (feature gated)

const navItems = [
  { href: '/mi-cuenta', label: 'Mi Cuenta', icon: User },
  { href: '/mis-citas', label: 'Mis Citas', icon: Calendar },
  { href: '/mis-puntos', label: 'Mis Puntos', icon: Star },
  // Conditionally add referidos
  ...(hasReferralAccess ? [{ href: '/referidos', label: 'Referidos', icon: Gift }] : []),
]
```

### 4.6 Feature Gating para Referidos

Los referidos cliente-a-cliente están bloqueados para Plan Básico (usa el sistema de feature gating de Área 1):

```typescript
// En la página de referidos, verificar acceso
const hasAccess = await canAccessFeature(supabase, client.business_id, 'referrals')

if (!hasAccess) {
  return (
    <div className="p-6">
      <h1>🔒 Función Premium</h1>
      <p>El programa de referidos está disponible en el Plan Pro.</p>
      <p>Contacta al negocio para más información.</p>
    </div>
  )
}
```

### 4.7 Archivos Críticos (11 archivos)

**Booking Flow Integration (CRÍTICO):**

1. `src/app/(public)/reservar/[slug]/page.tsx` (MODIFY - add ?ref=CODE detection)
2. `src/app/api/public/[slug]/book/route.ts` (MODIFY - create client_referrals record)
3. `src/lib/gamification/referral-rewards.ts` (NEW - ~120 LOC - reward distribution)

**Backend API (Dashboard):** 4. `src/app/api/client-referrals/my-code/route.ts` (NEW - ~80 LOC) 5. `src/app/api/client-referrals/stats/route.ts` (NEW - ~60 LOC) 6. `src/app/api/client-referrals/list/route.ts` (NEW - ~70 LOC)

**Frontend Components:** 7. `src/components/client-referrals/client-referral-code-card.tsx` (NEW - ~100 LOC) 8. `src/components/client-referrals/client-referral-stats.tsx` (NEW - ~80 LOC) 9. `src/components/client-referrals/client-referrals-table.tsx` (NEW - ~100 LOC) 10. `src/components/client-referrals/rewards-info-banner.tsx` (NEW - ~40 LOC)

**Page:** 11. `src/app/(client-dashboard)/referidos/page.tsx` (NEW - ~80 LOC)

**Estimated LOC:** ~780 lines (incluyendo modificaciones)

### 4.8 Testing Checklist

**Booking Flow (CRÍTICO):**

- [ ] `?ref=CODE` es detectado en URL de booking
- [ ] Se crea registro en `client_referrals` con status='pending'
- [ ] Referrer es validado (mismo business, código existe)
- [ ] Cuando referido completa primera cita → status='completed'
- [ ] Puntos se otorgan a REFERRER y REFERRED

**Dashboard UI:**

- [ ] Cliente ve su código de referido
- [ ] Botón "Copiar" funciona (clipboard)
- [ ] Botón "WhatsApp" abre WhatsApp con mensaje pre-armado
- [ ] Stats muestran números correctos (total, completados, pendientes)
- [ ] Lista de referidos muestra nombres con privacidad (solo iniciales)
- [ ] Empty state si no tiene referidos
- [ ] Feature gating: Plan Básico ve mensaje de "función premium"

---

## Área 4B: Full Client Dashboard Layout (NUEVO)

**Objetivo:** Crear el dashboard completo para clientes con todas las secciones.

**Contexto:** El route group `(client-dashboard)` NO EXISTE. Hay que crearlo desde cero.

### 4B.1 Layout Base

**New File:** `src/app/(client-dashboard)/layout.tsx`

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ClientSidebar } from '@/components/client-dashboard/sidebar'

export default async function ClientDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/mi-cuenta')
  }

  // Get client info
  const { data: client } = await supabase
    .from('clients')
    .select('*, business:businesses(*)')
    .eq('user_id', user.id)
    .single()

  if (!client) {
    redirect('/') // No client record found
  }

  return (
    <div className="flex min-h-screen">
      <ClientSidebar client={client} />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
```

### 4B.2 Sidebar para Clientes

**New File:** `src/components/client-dashboard/sidebar.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Calendar, Star, Gift, Bell, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/mi-cuenta', label: 'Mi Cuenta', icon: User },
  { href: '/mis-citas', label: 'Mis Citas', icon: Calendar },
  { href: '/mis-puntos', label: 'Mis Puntos', icon: Star },
  { href: '/referidos', label: 'Referidos', icon: Gift },
  { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
]

export function ClientSidebar({ client }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card">
      {/* Business branding */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">{client.business.name}</h2>
        <p className="text-sm text-muted-foreground">Hola, {client.name}</p>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
```

### 4B.3 Página: Mi Cuenta

**New File:** `src/app/(client-dashboard)/mi-cuenta/page.tsx`

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { ProfileForm } from '@/components/client-dashboard/profile-form'

export const metadata = {
  title: 'Mi Cuenta',
}

export default async function MiCuentaPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mi Cuenta</h1>

      <Card>
        <CardHeader>
          <h2>Información Personal</h2>
        </CardHeader>
        <CardContent>
          <ProfileForm client={client} />
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <Card>
        <CardHeader>
          <h2>Preferencias de Notificaciones</h2>
        </CardHeader>
        <CardContent>
          {/* Push notification toggle, email preferences, etc. */}
        </CardContent>
      </Card>
    </div>
  )
}
```

### 4B.4 Página: Mis Citas

**New File:** `src/app/(client-dashboard)/mis-citas/page.tsx`

```typescript
export default async function MisCitasPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  // Get appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, service:services(*), barber:barbers(*)')
    .eq('client_id', client?.id)
    .order('scheduled_at', { ascending: false })

  // Separate upcoming vs past
  const now = new Date()
  const upcoming = appointments?.filter(a => new Date(a.scheduled_at) > now) || []
  const past = appointments?.filter(a => new Date(a.scheduled_at) <= now) || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis Citas</h1>

      {/* Upcoming appointments */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Próximas Citas</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground">No tienes citas programadas.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </section>

      {/* Past appointments */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Historial</h2>
        <AppointmentsTable appointments={past} />
      </section>
    </div>
  )
}
```

### 4B.5 Página: Mis Puntos

**New File:** `src/app/(client-dashboard)/mis-puntos/page.tsx`

```typescript
export default async function MisPuntosPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const { data: loyaltyStatus } = await supabase
    .from('client_loyalty_status')
    .select('*, loyalty_program:loyalty_programs(*)')
    .eq('user_id', user?.id)
    .single()

  // Get transactions
  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('client_id', loyaltyStatus?.client_id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis Puntos</h1>

      {/* Points balance card */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <p className="text-sm opacity-80">Balance Actual</p>
            <p className="text-4xl font-bold">{loyaltyStatus?.points_balance || 0}</p>
            <p className="text-sm opacity-80">puntos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Tier Actual</p>
            <p className="text-2xl font-bold capitalize">{loyaltyStatus?.current_tier || 'Bronze'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Puntos de por vida</p>
            <p className="text-2xl font-bold">{loyaltyStatus?.lifetime_points || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Available rewards */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Recompensas Disponibles</h2>
        <RewardsCatalog
          loyaltyProgram={loyaltyStatus?.loyalty_program}
          currentPoints={loyaltyStatus?.points_balance}
        />
      </section>

      {/* Transaction history */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Historial de Puntos</h2>
        <TransactionsTable transactions={transactions} />
      </section>
    </div>
  )
}
```

### 4B.6 Archivos Adicionales para Client Dashboard

**Componentes adicionales:**

1. `src/components/client-dashboard/profile-form.tsx` (NEW - ~80 LOC)
2. `src/components/client-dashboard/appointment-card.tsx` (NEW - ~60 LOC)
3. `src/components/client-dashboard/appointments-table.tsx` (NEW - ~80 LOC)
4. `src/components/client-dashboard/rewards-catalog.tsx` (NEW - ~100 LOC)
5. `src/components/client-dashboard/transactions-table.tsx` (NEW - ~70 LOC)

**Estimated LOC adicional:** ~550 lines

---

## Área 5: Web Push Notifications (NUEVO)

**Objetivo:** Implementar notificaciones push nativas para el PWA.

**Requisitos:**

- Service Worker con push event handling
- VAPID keys para autenticación
- API para suscripciones
- UI para pedir permiso
- Backend para enviar pushes

### 5.1 Service Worker Update

**Modify:** `public/sw.js`

```javascript
// Existing service worker code...

// ADD: Push event handler
self.addEventListener('push', function (event) {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// ADD: Notification click handler
self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const url = event.notification.data.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function (clientList) {
      // If app is open, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
```

### 5.2 Push Subscription API

**New File:** `src/app/api/push/subscribe/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subscription, businessId } = await req.json()

  // Save subscription to database
  await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      business_id: businessId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      created_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,business_id',
    }
  )

  return NextResponse.json({ success: true })
}
```

**New File:** `src/app/api/push/unsubscribe/route.ts`

```typescript
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { businessId } = await req.json()

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('business_id', businessId)

  return NextResponse.json({ success: true })
}
```

### 5.3 Push Notification Sender

**New File:** `src/lib/push/send-notification.ts`

```typescript
import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/server'

// Configure VAPID
webpush.setVapidDetails(
  'mailto:support@yourapp.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

interface PushPayload {
  title: string
  body: string
  url?: string
  actions?: { action: string; title: string }[]
}

export async function sendPushNotification(
  userId: string,
  businessId: string,
  payload: PushPayload
) {
  const supabase = createServiceClient()

  // Get user's push subscription
  const { data: subscription } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .single()

  if (!subscription) {
    console.log('No push subscription for user', userId)
    return { success: false, reason: 'no_subscription' }
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload)
    )

    return { success: true }
  } catch (error: any) {
    // Handle expired subscriptions
    if (error.statusCode === 410) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('business_id', businessId)
    }

    return { success: false, reason: error.message }
  }
}

// Convenience functions
export async function sendAppointmentReminder(appointmentId: string) {
  const supabase = createServiceClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, client:clients(*), business:businesses(*)')
    .eq('id', appointmentId)
    .single()

  if (!appointment?.client?.user_id) return

  return sendPushNotification(appointment.client.user_id, appointment.business_id, {
    title: '⏰ Recordatorio de Cita',
    body: `Tu cita en ${appointment.business.name} es mañana a las ${format(appointment.scheduled_at, 'HH:mm')}`,
    url: '/mis-citas',
  })
}

export async function sendReferralCompletedNotification(referralId: string) {
  // ...similar pattern
}
```

### 5.4 Database Migration

**New File:** `supabase/migrations/023_push_subscriptions.sql`

```sql
-- Push subscriptions table
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,  -- { p256dh, auth }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Index for efficient lookups
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_business ON push_subscriptions(business_id);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Business owners can view subscriptions"
  ON push_subscriptions FOR SELECT
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );
```

### 5.5 Permission UI Component

**New File:** `src/components/push/push-permission-prompt.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PushPermissionPrompt({ businessId }: { businessId: string }) {
  const [show, setShow] = useState(false)
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return
    }

    setPermissionState(Notification.permission)

    // Show prompt if not yet asked
    if (Notification.permission === 'default') {
      // Delay to not be intrusive
      const timer = setTimeout(() => setShow(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission()
      setPermissionState(permission)

      if (permission === 'granted') {
        // Subscribe to push
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        })

        // Save to backend
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, businessId })
        })

        setShow(false)
      }
    } catch (error) {
      console.error('Push subscription failed:', error)
    }
  }

  if (!show || permissionState !== 'default') return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border shadow-lg rounded-lg p-4 z-50">
      <button
        className="absolute top-2 right-2"
        onClick={() => setShow(false)}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3">
        <Bell className="w-8 h-8 text-primary flex-shrink-0" />
        <div>
          <h3 className="font-semibold">Activar Notificaciones</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Recibe recordatorios de tus citas y notificaciones de tus puntos.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEnable}>
              Activar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShow(false)}>
              Ahora no
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 5.6 Integration Points

**Lugares donde enviar push notifications:**

1. **Recordatorio de cita (24h antes)** - Cron job
2. **Cita confirmada** - Al completar booking
3. **Referido completó su cita** - En `processReferralReward()`
4. **Puntos ganados** - En `awardLoyaltyPoints()`
5. **Tier upgrade** - En loyalty calculations
6. **Trial expiring** - Cron job (para business owners)

**Modify:** `src/app/api/cron/appointment-reminders/route.ts` (NEW)

```typescript
// Vercel Cron - runs daily at 9 AM local time
export async function GET(req: Request) {
  const supabase = createServiceClient()

  // Find appointments 24h from now
  const tomorrow = new Date()
  tomorrow.setHours(tomorrow.getHours() + 24)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id')
    .gte('scheduled_at', tomorrow.toISOString())
    .lt('scheduled_at', new Date(tomorrow.getTime() + 3600000).toISOString())
    .eq('status', 'confirmed')

  for (const apt of appointments || []) {
    await sendAppointmentReminder(apt.id)
  }

  return NextResponse.json({ sent: appointments?.length || 0 })
}
```

### 5.7 Environment Variables

```bash
# Add to .env.local and Vercel
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here

# Generate keys with:
# npx web-push generate-vapid-keys
```

### 5.8 Archivos Críticos (14 archivos)

**Service Worker:**

1. `public/sw.js` (MODIFY - add push handling)

**Backend:** 2. `src/app/api/push/subscribe/route.ts` (NEW) 3. `src/app/api/push/unsubscribe/route.ts` (NEW) 4. `src/lib/push/send-notification.ts` (NEW) 5. `src/app/api/cron/appointment-reminders/route.ts` (NEW)

**Database:** 6. `supabase/migrations/023_push_subscriptions.sql` (NEW)

**Frontend:** 7. `src/components/push/push-permission-prompt.tsx` (NEW)

**Integration:** 8. `src/lib/gamification/loyalty-calculator-server.ts` (MODIFY - add push) 9. `src/lib/gamification/referral-rewards.ts` (MODIFY - add push) 10. `src/app/api/public/[slug]/book/route.ts` (MODIFY - add push on confirm)

**Config:** 11. `vercel.json` (MODIFY - add reminder cron) 12. `.env.example` (MODIFY - add VAPID keys)

**Dependencies:** 13. `package.json` (MODIFY - add web-push)

**Estimated LOC:** ~650 lines

### 5.9 Testing Checklist

- [ ] Service Worker registra push event handler
- [ ] Permission prompt aparece después de 5 segundos
- [ ] Aceptar permiso crea subscription en DB
- [ ] Push notification se muestra correctamente
- [ ] Click en notification abre la URL correcta
- [ ] Recordatorio de cita se envía 24h antes
- [ ] Feature gating: Básico no puede suscribirse

---

## Roadmap de Implementación

### Priorización por Dependencias

**Sprint 1: Foundation (Week 1)**

- ✅ Área 1 - Phase 1-2: Database + Feature Gating (3-4 días)
- ✅ Área 2 - Phase 1-2: Database + Booking Flow (3-4 días)

**Sprint 2: Features (Week 2)**

- ✅ Área 1 - Phase 3-4: Registration Incentives + Data Retention (3 días)
- ✅ Área 2 - Phase 3-5: Payment Verification + Auto No-Show + Settings (3-4 días)
- ✅ Área 4 - Client Referrals Backend (1-2 días)

**Sprint 3: Client Dashboard + Push (Week 3)**

- ✅ Área 4B - Full Client Dashboard Layout (2-3 días)
- ✅ Área 5 - Web Push Notifications (3-4 días)

**Sprint 4: Rebranding (Week 4)**

- ✅ Área 3 - All Phases: Complete rebranding (4-5 días)

**Sprint 5: Testing & Polish (Week 5-6)**

- E2E testing
- Visual verification
- Performance testing
- Documentation updates

### Critical Path

```
Database Migrations (Área 1 + 2 + 5)
  ↓
Feature Gating System (Área 1)
  ↓
Advance Payment Backend (Área 2)
  ↓
Client Referrals Backend (Área 4)
  ↓
Client Dashboard Layout (Área 4B)
  ↓
Web Push Notifications (Área 5)
  ↓
Rebranding (Área 3)
  ↓
Testing & Polish
```

---

## Archivos Críticos Consolidados

### Top 20 Most Critical Files (Dependency Order)

1. **`supabase/migrations/020_client_auth_enhancement.sql`** - Foundation for client registration
2. **`supabase/migrations/021_data_retention_system.sql`** - Deletion warnings system
3. **`supabase/migrations/022_advance_payment_system.sql`** - Payment fields + loyalty multiplier
4. **`src/types/database.ts`** - All type definitions (Staff aliases + new fields)
5. **`src/lib/subscription-features.ts`** - Feature gating logic
6. **`src/lib/staff/queries.ts`** - Staff abstraction layer
7. **`src/lib/staff/hooks.ts`** - React Query hooks for staff
8. **`src/lib/subscription.ts`** - Add canAddClient + rename to canAddStaffMember
9. **`src/lib/gamification/loyalty-calculator-server.ts`** - Apply multiplier + feature gate
10. **`src/app/api/clients/route.ts`** - Add plan check before creation
11. **`src/app/api/public/[slug]/book/route.ts`** - Handle deposit upload
12. **`src/app/(public)/reservar/[slug]/page.tsx`** - Add deposit step
13. **`src/components/reservar/DepositPaymentStep.tsx`** - Deposit UI
14. **`src/components/reservar/BookingSuccess.tsx`** - Registration modal
15. **`src/app/(dashboard)/citas/page.tsx`** - Pending deposits section
16. **`src/app/(dashboard)/configuracion/page.tsx`** - Advance payment settings
17. **`src/components/staff/staff-management.tsx`** - Main staff component (renamed)
18. **`src/app/api/cron/auto-noshow/route.ts`** - Auto no-show detection
19. **`supabase/functions/data-retention-cron/index.ts`** - Auto deletion system
20. **`vercel.json`** - Cron jobs configuration

### Additional Important Files (21-48)

21. `src/components/appointments/pending-deposit-card.tsx` (NEW)
22. `src/lib/email/templates/deposit-received.tsx` (NEW)
23. `src/lib/email/templates/deletion-warning.tsx` (NEW)
24. `src/lib/email/templates/no-show-notification.tsx` (NEW)
25. `src/components/loyalty/registration-incentive-modal.tsx` (NEW)
26. `src/components/dashboard/upgrade-banner.tsx` (NEW)
27. `src/components/reservar/StaffSelection.tsx` (RENAME from BarberSelection)
28. `src/components/onboarding/steps/staff.tsx` (RENAME from barber.tsx)
29. `src/components/dashboard/sidebar.tsx` (MODIFY - navigation labels)
30. `src/app/(dashboard)/barberos/page.tsx` (MODIFY - component names)
31. `docs/schema-naming-convention.md` (NEW)
32. `docs/staff-migration-guide.md` (NEW)
    33-40. API routes in `src/app/api/barbers/*` (MODIFY - add comments)

**Área 4: Client Referrals (NEW)** 41. `src/app/api/client-referrals/my-code/route.ts` (NEW) 42. `src/app/api/client-referrals/stats/route.ts` (NEW) 43. `src/app/api/client-referrals/list/route.ts` (NEW) 44. `src/components/client-referrals/client-referral-code-card.tsx` (NEW) 45. `src/components/client-referrals/client-referral-stats.tsx` (NEW) 46. `src/components/client-referrals/client-referrals-table.tsx` (NEW) 47. `src/components/client-referrals/rewards-info-banner.tsx` (NEW) 48. `src/app/(client-dashboard)/referidos/page.tsx` (NEW)

---

## Verificación End-to-End

### Test Plan por Área

**Área 1: Client Subscription**

1. Guest booking → No loyalty points awarded (Basic plan)
2. Pro plan business → Guest booking → Points awarded normally
3. Post-booking modal shows → Click "Crear cuenta" → Registration flow
4. Cron job runs → Deletion warnings sent after 30 days
5. Upgrade to Pro → Deletion warnings cancelled

**Área 2: Advance Payments**

1. Business enables advance payments in settings
2. Public booking shows deposit step with bonus incentive
3. Upload payment proof → Email sent to owner → File deleted from storage
4. Owner verifies deposit → Appointment confirmed with multiplier
5. Client no-show → Auto-marked after delay → Notification sent
6. Appointment completed → Bonus points awarded (1.5x or configured)

**Área 3: Rebranding**

1. No "barbero" visible in any UI
2. TypeScript compiles without errors
3. All API endpoints work (despite legacy table names)
4. Staff CRUD operations work
5. Public booking flow works
6. Gamification system works

**Área 4: Client Referrals**

1. Client sees referral code in dashboard
2. Copy button works (clipboard)
3. WhatsApp share opens with pre-filled message
4. Stats show correct numbers
5. Referral list shows names with privacy (initials only)
6. Empty state when no referrals
7. Feature gating: Basic plan shows "premium feature" message
8. Referral link works during booking flow

### Manual Testing Checklist

- [ ] Guest booking (no auth)
- [ ] Registered client booking (with loyalty)
- [ ] Basic plan limits enforced
- [ ] Pro plan unlimited access
- [ ] Deposit upload + verification workflow
- [ ] Auto no-show detection (test with past appointment)
- [ ] Cron jobs run successfully (check logs)
- [ ] Email notifications sent
- [ ] Spanish text correct everywhere
- [ ] TypeScript compiles
- [ ] Production build succeeds
- [ ] No console errors

### Performance Testing

- [ ] Booking page loads < 2s
- [ ] Feature gate checks add < 50ms latency
- [ ] Cron jobs complete < 30s
- [ ] Large deposit files (5MB) upload successfully
- [ ] Email delivery < 10s

---

## Deployment Strategy

### Phase 1: Database Migrations

```bash
# Run migrations in order
supabase migration up 020_client_auth_enhancement
supabase migration up 021_data_retention_system
supabase migration up 022_advance_payment_system

# Verify tables created
supabase db pull
```

### Phase 2: Backend Deployment

```bash
# Deploy code changes
git checkout -b feature/subscription-payments-rebranding
git add .
git commit -m "feat: client subscription + advance payments + rebranding"
git push origin feature/subscription-payments-rebranding

# Merge to main after review
git checkout main
git merge feature/subscription-payments-rebranding

# Deploy to Vercel
vercel deploy --prod
```

### Phase 3: Cron Jobs Setup

```bash
# Verify cron jobs configured in vercel.json
# Test cron endpoints manually first
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/cron/auto-noshow

curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/cron/data-retention
```

### Phase 4: Supabase Edge Functions

```bash
# Deploy edge functions
supabase functions deploy data-retention-cron

# Test edge function
supabase functions invoke data-retention-cron
```

### Phase 5: Monitor & Iterate

- Monitor Vercel logs for cron job execution
- Check Supabase logs for database operations
- Monitor email delivery rates
- Track user registration conversion rates
- Track advance payment adoption rates

---

## 🔄 Rollback Strategy

### Database Rollback

```sql
-- If migrations fail, rollback in reverse order:

-- Rollback 022 (Advance Payments)
ALTER TABLE appointments
DROP COLUMN IF EXISTS deposit_amount,
DROP COLUMN IF EXISTS deposit_paid,
DROP COLUMN IF EXISTS deposit_proof_url,
DROP COLUMN IF EXISTS deposit_verified_at,
DROP COLUMN IF EXISTS deposit_verified_by,
DROP COLUMN IF EXISTS points_multiplier;

ALTER TABLE businesses
DROP COLUMN IF EXISTS advance_payment_enabled,
DROP COLUMN IF EXISTS advance_payment_multiplier,
DROP COLUMN IF EXISTS no_show_delay_minutes;

-- Rollback 021 (Data Retention)
DROP TABLE IF EXISTS client_deletion_warnings;
ALTER TABLE clients
DROP COLUMN IF EXISTS deleted_at,
DROP COLUMN IF EXISTS deleted_reason;

-- Rollback 020 (Client Auth Enhancement)
ALTER TABLE clients
DROP COLUMN IF EXISTS user_id,
DROP COLUMN IF EXISTS last_activity_at;
DROP FUNCTION IF EXISTS update_client_activity();
DROP TRIGGER IF EXISTS on_appointment_update_activity ON appointments;
```

### Code Rollback

```bash
# Tag before deployment
git tag pre-v2-migration

# If issues arise, rollback:
git revert HEAD~N  # Revert N commits
# Or
git reset --hard pre-v2-migration
vercel deploy --prod

# Disable cron jobs immediately
# In Vercel dashboard: Settings > Cron Jobs > Disable
```

### Feature Flag Alternative

Si prefieres un rollout gradual, implementar feature flags:

```typescript
// src/lib/feature-flags.ts
export const FEATURES = {
  ADVANCE_PAYMENTS: process.env.NEXT_PUBLIC_FEATURE_ADVANCE_PAYMENTS === 'true',
  DATA_RETENTION: process.env.FEATURE_DATA_RETENTION === 'true',
  CLIENT_REGISTRATION: process.env.NEXT_PUBLIC_FEATURE_CLIENT_REGISTRATION === 'true',
}

// Usage:
if (FEATURES.ADVANCE_PAYMENTS) {
  // Show deposit step
}
```

---

## ⚠️ Known Limitations & Future Improvements

### Limitaciones Actuales

1. **Auto no-show solo para citas con depósito**
   - Citas sin depósito no se marcan automáticamente
   - Puede agregar configuración `auto_noshow_without_deposit` en el futuro

2. **Sin recordatorios pre-cita**
   - Los campos `reminder_sent_at` existen pero no se usan
   - Implementar recordatorios 24h antes reduciría más no-shows

3. **Sin pago parcial**
   - Cliente debe pagar monto completo
   - Futuro: permitir depósitos parciales (ej: 50%)

4. **Sin i18n**
   - Texto hardcoded en español
   - Futuro: extraer a archivos de traducción

5. **Sin verificación automática de SINPE**
   - Verificación es manual
   - Futuro: integrar con API bancaria si disponible

### Mejoras Futuras Sugeridas

- [ ] Recordatorios por WhatsApp/SMS 24h antes
- [ ] Verificación automática de pagos vía API bancaria
- [ ] Depósitos parciales configurables
- [ ] Notificaciones push (requiere PWA upgrade)
- [ ] Dashboard de analytics de no-shows
- [ ] Blacklist de clientes con múltiples no-shows

---

## Área 6: Staff Experience - Vista "Mi Día" (NUEVO)

**Objetivo:** Crear una vista ultra-simplificada para barberos/staff que muestre solo lo esencial del día actual, facilitando la adopción por personal no técnico.

**Problema que resuelve:**

> Barbero abre app → Ve dashboard completo → Se confunde → Cierra app → Vuelve a WhatsApp

**Solución:**

> Barbero abre app → Ve solo: "Próximo: Carlos, 2:30pm, Fade" → Usa la app

### 6.1 Database Changes

**No se requieren cambios de base de datos** - usa tablas existentes (appointments, clients, services).

### 6.2 API Endpoint

**New File:** `src/app/api/barber/today/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get barber info
  const { data: barber } = await supabase
    .from('barbers')
    .select('id, name, business_id')
    .eq('user_id', user.id)
    .single()

  if (!barber) {
    return NextResponse.json({ error: 'Not a barber' }, { status: 403 })
  }

  const today = new Date()
  const dayStart = startOfDay(today).toISOString()
  const dayEnd = endOfDay(today).toISOString()

  // Get today's appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select(
      `
      id,
      scheduled_at,
      status,
      client:clients(id, name, phone),
      service:services(id, name, duration_minutes, price)
    `
    )
    .eq('barber_id', barber.id)
    .gte('scheduled_at', dayStart)
    .lte('scheduled_at', dayEnd)
    .order('scheduled_at', { ascending: true })

  // Calculate totals
  const completed = appointments?.filter((a) => a.status === 'completed') || []
  const pending = appointments?.filter((a) => ['confirmed', 'pending'].includes(a.status)) || []

  const totalRevenue = completed.reduce((sum, a) => sum + (a.service?.price || 0), 0)
  const projectedRevenue = appointments?.reduce((sum, a) => sum + (a.service?.price || 0), 0) || 0

  // Find next appointment
  const now = new Date()
  const nextAppointment = pending.find((a) => new Date(a.scheduled_at) > now)

  return NextResponse.json({
    barber: { id: barber.id, name: barber.name },
    today: {
      date: today.toISOString(),
      totalAppointments: appointments?.length || 0,
      completed: completed.length,
      pending: pending.length,
      totalRevenue,
      projectedRevenue,
    },
    nextAppointment,
    appointments: appointments || [],
  })
}
```

### 6.3 Page Component

**New File:** `src/app/(dashboard)/mi-dia/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TodayView } from '@/components/barber/today-view'

export default async function MiDiaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if user is a barber
  const { data: barber } = await supabase
    .from('barbers')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!barber) {
    redirect('/dashboard') // Not a barber, go to owner dashboard
  }

  return <TodayView barberId={barber.id} barberName={barber.name} />
}
```

### 6.4 Today View Component

**New File:** `src/components/barber/today-view.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Clock,
  User,
  Phone,
  MessageCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react'

interface TodayViewProps {
  barberId: string
  barberName: string
}

interface Appointment {
  id: string
  scheduled_at: string
  status: string
  client: { id: string; name: string; phone: string }
  service: { id: string; name: string; duration_minutes: number; price: number }
}

interface TodayData {
  barber: { id: string; name: string }
  today: {
    date: string
    totalAppointments: number
    completed: number
    pending: number
    totalRevenue: number
    projectedRevenue: number
  }
  nextAppointment: Appointment | null
  appointments: Appointment[]
}

export function TodayView({ barberId, barberName }: TodayViewProps) {
  const [data, setData] = useState<TodayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/barber/today')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error('Error fetching today data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh every 2 minutes
    const interval = setInterval(fetchData, 120000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const markAsArrived = async (appointmentId: string) => {
    await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'in_progress' }),
    })
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const today = new Date()

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#1C1C1E] p-4 pb-20">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              👋 Hola, {barberName}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              {format(today, "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Next Appointment - Hero Card */}
      {data?.nextAppointment ? (
        <div className="mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-100 uppercase tracking-wide">
            Próximo Cliente
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Clock className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <p className="text-3xl font-bold">
                {format(new Date(data.nextAppointment.scheduled_at), 'h:mm a')}
              </p>
              <p className="text-lg font-semibold">{data.nextAppointment.client.name}</p>
              <p className="text-blue-100">
                {data.nextAppointment.service.name} • {data.nextAppointment.service.duration_minutes} min
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-3">
            {data.nextAppointment.client.phone && (
              <a
                href={`https://wa.me/${data.nextAppointment.client.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white/20 py-3 font-semibold"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
            )}
            <button
              onClick={() => markAsArrived(data.nextAppointment!.id)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-blue-600"
            >
              <CheckCircle className="h-5 w-5" />
              Llegó
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-3xl bg-zinc-100 dark:bg-zinc-800 p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto text-zinc-400" />
          <p className="mt-3 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
            No hay más citas hoy
          </p>
          <p className="text-zinc-500">¡Buen trabajo! 🎉</p>
        </div>
      )}

      {/* Today Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white dark:bg-zinc-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-zinc-400">Citas hoy</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {data?.today.completed}/{data?.today.totalAppointments}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-zinc-800 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-zinc-400">Ganado hoy</p>
          <p className="text-2xl font-bold text-emerald-600">
            ₡{(data?.today.totalRevenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Remaining Appointments */}
      {data?.appointments && data.appointments.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase text-zinc-400">
            Agenda de hoy ({data.today.pending} pendientes)
          </h2>
          <div className="space-y-2">
            {data.appointments
              .filter(a => ['confirmed', 'pending'].includes(a.status))
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 rounded-2xl bg-white dark:bg-zinc-800 p-4 shadow-sm"
                >
                  <div className="text-center">
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                      {format(new Date(appointment.scheduled_at), 'h:mm')}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {format(new Date(appointment.scheduled_at), 'a')}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 dark:text-white truncate">
                      {appointment.client.name}
                    </p>
                    <p className="text-sm text-zinc-500 truncate">
                      {appointment.service.name}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    ₡{appointment.service.price.toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Completed Today */}
      {data?.today.completed && data.today.completed > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase text-zinc-400">
            Completados hoy ({data.today.completed})
          </h2>
          <div className="space-y-2 opacity-60">
            {data.appointments
              .filter(a => a.status === 'completed')
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 rounded-2xl bg-white dark:bg-zinc-800 p-3"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {appointment.client.name} - {appointment.service.name}
                    </p>
                  </div>
                  <p className="text-sm text-emerald-600">
                    ₡{appointment.service.price.toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 6.5 Navigation Link

**Modify:** `src/components/dashboard/sidebar.tsx`

Agregar link a "Mi Día" para usuarios que son barberos.

```typescript
// Add to sidebar links (conditional for barbers)
{isBarber && (
  <SidebarLink
    href="/mi-dia"
    icon={<Calendar className="h-5 w-5" />}
    label="Mi Día"
  />
)}
```

### 6.6 Files Summary

| Archivo                                | Tipo   | LOC      |
| -------------------------------------- | ------ | -------- |
| `src/app/api/barber/today/route.ts`    | NEW    | ~70      |
| `src/app/(dashboard)/mi-dia/page.tsx`  | NEW    | ~30      |
| `src/components/barber/today-view.tsx` | NEW    | ~220     |
| `src/components/dashboard/sidebar.tsx` | MODIFY | ~10      |
| **Total**                              |        | **~330** |

### 6.7 Success Criteria

- ✅ Barbero ve vista simplificada al acceder a `/mi-dia`
- ✅ Próximo cliente destacado con botones de acción
- ✅ Lista de citas restantes del día
- ✅ Total ganado visible
- ✅ Auto-refresh cada 2 minutos
- ✅ Funciona bien en móvil (PWA)

### 6.8 Estimado

| Tarea               | Horas |
| ------------------- | ----- |
| API endpoint        | 1     |
| Page component      | 0.5   |
| TodayView component | 2     |
| Sidebar integration | 0.5   |
| Testing             | 1     |
| **Total**           | **5** |

---

## Resumen Final

### Estimados Totales (ACTUALIZADO v2.3)

| Área                                | Archivos | LOC        | Horas      |
| ----------------------------------- | -------- | ---------- | ---------- |
| 1. Client Subscription & Basic Plan | 22       | ~2,100     | 24-32      |
| 2. Advance Payments & No-Show       | 20       | ~2,200     | 18-22      |
| 3. Rebranding Barber → Staff        | 95       | ~2,400     | 22-30      |
| 4. Client Referrals (Backend)       | 11       | ~780       | 8-10       |
| 4B. Full Client Dashboard           | 8        | ~550       | 6-8        |
| 5. Web Push Notifications           | 14       | ~650       | 12-16      |
| 6. Staff Experience - Mi Día        | 4        | ~330       | 5          |
| **TOTAL**                           | **174**  | **~9,010** | **95-123** |

### Archivos Nuevos Agregados por Versión

**v2.0:**

- `src/lib/auth/link-client-to-user.ts` (NEW)
- `src/app/api/appointments/[id]/verify-deposit/route.ts` (NEW)
- `src/app/api/cron/cleanup-deposit-proofs/route.ts` (NEW)
- `src/lib/email/templates/deposit-rejected.tsx` (NEW)
- `src/lib/email/templates/no-show-client.tsx` (NEW)
- +14 archivos de rebranding adicionales

**v2.1 - Booking Flow + Referrals Dashboard:**

- `src/lib/gamification/referral-rewards.ts` (NEW)
- `src/app/api/client-referrals/*.ts` (3 NEW)
- `src/components/client-referrals/*.tsx` (4 NEW)
- `src/app/(client-dashboard)/referidos/page.tsx` (NEW)

**v2.2 - Client Dashboard + Web Push:**

- `src/app/(client-dashboard)/layout.tsx` (NEW)
- `src/components/client-dashboard/sidebar.tsx` (NEW)
- `src/app/(client-dashboard)/mi-cuenta/page.tsx` (NEW)
- `src/app/(client-dashboard)/mis-citas/page.tsx` (NEW)
- `src/app/(client-dashboard)/mis-puntos/page.tsx` (NEW)
- `src/components/client-dashboard/*.tsx` (5 NEW)
- `public/sw.js` (MODIFY - push handling)
- `src/app/api/push/*.ts` (2 NEW)
- `src/lib/push/send-notification.ts` (NEW)
- `src/components/push/push-permission-prompt.tsx` (NEW)
- `supabase/migrations/023_push_subscriptions.sql` (NEW)

**v2.3 (ACTUAL) - Staff Experience:**

- `src/app/api/barber/today/route.ts` (NEW)
- `src/app/(dashboard)/mi-dia/page.tsx` (NEW)
- `src/components/barber/today-view.tsx` (NEW)
- `src/components/dashboard/sidebar.tsx` (MODIFY - add Mi Día link)

### Timeline

- **Sprint 1 (Week 1):** Database migrations + Feature Gating
- **Sprint 2 (Week 2):** Advance Payments + Referrals Backend + **Staff Experience (Área 6)**
- **Sprint 3 (Week 3):** Client Dashboard + Web Push
- **Sprint 4 (Week 4):** Rebranding
- **Sprint 5-6 (Week 5-6):** Testing + Polish

**Total:** 5-6 semanas (95-123 horas)

> **Nota:** Área 6 (Staff Experience) es independiente y puede implementarse en cualquier momento. Se sugiere Sprint 2 por su bajo esfuerzo (5 horas) y alto impacto en adopción.

### Success Criteria

**Área 1 - Client Subscription:**

- ✅ Basic plan = SOLO reservas (sin gamificación, PWA, push)
- ✅ 30-day data retention para Basic plan
- ✅ Guest → Registered linking funciona

**Área 2 - Advance Payments:**

- ✅ Pagos anticipados con colones (₡)
- ✅ Bonus de puntos configurable (1.2x-3.0x)
- ✅ Auto no-show detection con notificación
- ✅ Comprobantes se limpian después de 7 días

**Área 3 - Rebranding:**

- ✅ Zero "barbero" visible en UI

**Área 4 - Client Referrals:**

- ✅ Booking flow detecta ?ref=CODE
- ✅ Rewards se distribuyen al completar primera cita
- ✅ Dashboard muestra código, stats, lista

**Área 4B - Client Dashboard:**

- ✅ Layout completo con sidebar
- ✅ Mi Cuenta, Mis Citas, Mis Puntos, Referidos funcionan

**Área 5 - Web Push:**

- ✅ Permiso de notificaciones funciona
- ✅ Push notifications se reciben como app nativa
- ✅ Recordatorio de cita 24h antes
- ✅ Feature gating: Básico no puede suscribirse

**Área 6 - Staff Experience:**

- ✅ Vista `/mi-dia` muestra solo citas de hoy
- ✅ Próximo cliente destacado con botones de acción
- ✅ WhatsApp y "Llegó" funcionan correctamente
- ✅ Auto-refresh cada 2 minutos
- ✅ Total ganado del día visible
- ✅ Funciona bien en móvil (PWA optimizado)

### Pre-Implementation Checklist

- [ ] Backup production database
- [ ] Tag git: `git tag pre-v2-migration`
- [ ] Set up `CRON_SECRET` in Vercel dashboard
- [ ] Generate VAPID keys: `npx web-push generate-vapid-keys`
- [ ] Add VAPID keys to Vercel env vars
- [ ] Create `appointment-deposits` storage bucket in Supabase
- [ ] Install web-push package: `npm install web-push`
- [ ] Verify email sending works (Resend/SendGrid)

---

## 📝 Document Management Strategy

### Current State

- **File Size:** 4,500+ lines (~136KB)
- **Structure:** Single unified plan
- **Status:** Active implementation (Área 1 in progress)

### Future Splitting Strategy

**When to split:** After each area is completed and tested

**Process:**

```bash
# 1. Extract completed area to separate spec
# Move detailed implementation to docs/specs/
cat IMPLEMENTATION_PLAN_V2.md | sed -n '/^## Área X/,/^## Área/p' > docs/specs/area-X-[name].md

# 2. Update main plan with reference
# Replace detailed section with summary + link

# 3. Archive when all areas complete
mv IMPLEMENTATION_PLAN_V2.md docs/archive/implementation-plan-v2-complete.md
```

**Benefits:**

- Keeps main plan focused on active/pending work
- Archives completed work for reference
- Reduces file size over time
- Maintains clear history

### Recommended File Structure (Post-Implementation)

```
docs/specs/
├── implementation-plan-v2-summary.md      # High-level overview
├── area-0-technical-debt.md               # ✅ Completed
├── area-1-subscriptions.md                # ✅ Completed
├── area-2-advance-payments.md             # ✅ Completed
├── area-3-rebranding.md                   # ✅ Completed
├── area-4-client-referrals.md             # ✅ Completed
├── area-4b-client-dashboard.md            # ✅ Completed
├── area-5-web-push.md                     # ✅ Completed
└── area-6-staff-experience.md             # ✅ Completed
```

---

**Plan creado:** 2026-02-02
**Actualizado:** 2026-02-02 (v2.4 - Added TOC & Document Management Strategy)
**Próximo paso:** Aprobar plan y comenzar implementación
