# Security Code Examples: FASE 2

**Secure Implementation Patterns**
**For:** Implementation v2.5 - FASE 2
**Last Updated:** 2026-02-03

---

## 🔴 CRITICAL: RBAC Security (Priority 3)

### 1. Role Hierarchy Enforcement

```typescript
// src/lib/permissions/role-hierarchy.ts
export const ROLE_HIERARCHY = {
  owner: 100,
  manager: 80,
  receptionist: 60,
  staff: 40,
  limited_staff: 20,
  accountant: 10,
} as const

export type RoleName = keyof typeof ROLE_HIERARCHY

export function getRoleLevel(roleName: RoleName): number {
  return ROLE_HIERARCHY[roleName] || 0
}

export function canAssignRole(actorRole: RoleName, targetRole: RoleName): boolean {
  const actorLevel = getRoleLevel(actorRole)
  const targetLevel = getRoleLevel(targetRole)

  // Actor cannot assign roles >= their own level
  return targetLevel < actorLevel
}
```

### 2. Secure Role Assignment API

```typescript
// src/app/api/barbers/[id]/assign-role/route.ts
import { withAuthAndRateLimit } from '@/lib/api/middleware'
import { canAssignRole, getRoleLevel } from '@/lib/permissions/role-hierarchy'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const AssignRoleSchema = z.object({
  roleId: z.string().uuid(),
})

export const PATCH = withAuthAndRateLimit(
  async (request, { params }, { user, business, supabase }) => {
    try {
      // 1. Validate input
      const body = await request.json()
      const { roleId } = AssignRoleSchema.parse(body)
      const targetBarberId = params.id

      // 2. Verify target barber exists and belongs to this business
      const { data: targetBarber, error: barberError } = await supabase
        .from('barbers')
        .select('id, business_id, role:roles(id, name)')
        .eq('id', targetBarberId)
        .single()

      if (barberError || !targetBarber) {
        return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
      }

      if (targetBarber.business_id !== business.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      // 3. Get actor's role (the person making the request)
      const { data: actorBarber } = await supabase
        .from('barbers')
        .select('role:roles(name)')
        .eq('user_id', user.id)
        .eq('business_id', business.id)
        .single()

      if (!actorBarber) {
        return NextResponse.json({ error: 'You are not a staff member' }, { status: 403 })
      }

      // 4. Get new role details
      const { data: newRole, error: roleError } = await supabase
        .from('roles')
        .select('id, name, display_name')
        .eq('id', roleId)
        .eq('business_id', business.id)
        .single()

      if (roleError || !newRole) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }

      // 5. CRITICAL: Verify role hierarchy
      if (!canAssignRole(actorBarber.role.name, newRole.name)) {
        logger.warn(
          {
            actorId: user.id,
            actorRole: actorBarber.role.name,
            targetRole: newRole.name,
            targetBarberId,
          },
          'Privilege escalation attempt blocked'
        )

        return NextResponse.json(
          {
            error: 'Cannot assign role equal or higher than your own',
            details: {
              yourRole: actorBarber.role.name,
              attemptedRole: newRole.name,
            },
          },
          { status: 403 }
        )
      }

      // 6. Check if actor has staff:write permission
      const hasPermission = await checkPermission(supabase, user.id, business.id, 'staff:write')

      if (!hasPermission) {
        return NextResponse.json({ error: 'Missing permission: staff:write' }, { status: 403 })
      }

      // 7. Store old role for audit log
      const oldRoleId = targetBarber.role?.id

      // 8. Assign new role
      const { error: updateError } = await supabase
        .from('barbers')
        .update({ role_id: roleId })
        .eq('id', targetBarberId)

      if (updateError) {
        logger.error({ error: updateError }, 'Failed to assign role')
        return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
      }

      // 9. CRITICAL: Create audit log
      await supabase.from('audit_logs').insert({
        business_id: business.id,
        actor_id: user.id,
        action: 'role_assigned',
        resource_type: 'barber',
        resource_id: targetBarberId,
        old_value: { role_id: oldRoleId },
        new_value: { role_id: roleId },
        ip_address: getClientIP(request),
        user_agent: request.headers.get('user-agent'),
      })

      logger.info(
        {
          actorId: user.id,
          targetBarberId,
          oldRoleId,
          newRoleId: roleId,
        },
        'Role assigned successfully'
      )

      return NextResponse.json({
        success: true,
        message: `Role updated to ${newRole.display_name}`,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request', details: error.errors },
          { status: 400 }
        )
      }

      logger.error({ error }, 'Role assignment error')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  },
  { interval: 60 * 1000, maxRequests: 10 } // Rate limit: 10 role changes per minute
)
```

### 3. Permission Override Security

```typescript
// src/app/api/barbers/[id]/permission-overrides/route.ts
import { withAuthAndRateLimit } from '@/lib/api/middleware'
import { getEffectivePermissions } from '@/lib/permissions/check-permission'
import { z } from 'zod'

const PermissionOverrideSchema = z.object({
  overrides: z
    .record(z.boolean())
    .refine(
      (overrides) => Object.keys(overrides).length <= 50,
      'Cannot override more than 50 permissions'
    ),
})

export const PATCH = withAuthAndRateLimit(
  async (request, { params }, { user, business, supabase }) => {
    const body = await request.json()
    const { overrides } = PermissionOverrideSchema.parse(body)
    const targetBarberId = params.id

    // 1. Get actor's effective permissions (role + overrides)
    const actorPermissions = await getEffectivePermissions(supabase, user.id, business.id)

    // 2. CRITICAL: Validate each override
    for (const [permission, enabled] of Object.entries(overrides)) {
      if (enabled && !actorPermissions.includes(permission)) {
        logger.warn(
          {
            actorId: user.id,
            attemptedPermission: permission,
          },
          'Permission escalation attempt blocked'
        )

        return NextResponse.json(
          {
            error: `Cannot grant permission '${permission}' you don't have`,
            yourPermissions: actorPermissions,
          },
          { status: 403 }
        )
      }
    }

    // 3. CRITICAL: Never allow wildcard overrides
    const hasWildcard = Object.keys(overrides).some(
      (perm) => perm.includes('*') || perm === 'admin'
    )

    if (hasWildcard) {
      return NextResponse.json(
        { error: 'Wildcard permissions cannot be granted via overrides' },
        { status: 403 }
      )
    }

    // 4. Get current overrides for audit log
    const { data: currentBarber } = await supabase
      .from('barbers')
      .select('permission_overrides')
      .eq('id', targetBarberId)
      .single()

    // 5. Apply overrides
    const { error } = await supabase
      .from('barbers')
      .update({ permission_overrides: overrides })
      .eq('id', targetBarberId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    // 6. CRITICAL: Audit log
    await supabase.from('audit_logs').insert({
      business_id: business.id,
      actor_id: user.id,
      action: 'permission_overrides_updated',
      resource_type: 'barber',
      resource_id: targetBarberId,
      old_value: currentBarber?.permission_overrides || {},
      new_value: overrides,
      ip_address: getClientIP(request),
    })

    return NextResponse.json({ success: true })
  },
  { interval: 60 * 1000, maxRequests: 10 }
)
```

### 4. RLS Policy for Role Assignment

```sql
-- supabase/migrations/025b_rbac_security.sql

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Only owners can create custom roles
CREATE POLICY "Business owners can manage roles"
  ON roles FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Restrict role assignment in barbers table
ALTER TABLE barbers DROP POLICY IF EXISTS "Business owner manages barbers";

CREATE POLICY "Owner can manage all barbers"
  ON barbers FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage non-owner barbers"
  ON barbers FOR UPDATE
  USING (
    -- Manager is from same business
    EXISTS (
      SELECT 1 FROM barbers actor
      WHERE actor.user_id = auth.uid()
      AND actor.business_id = barbers.business_id
      AND actor.role_id IN (
        SELECT id FROM roles
        WHERE business_id = barbers.business_id
        AND name IN ('manager', 'owner')
      )
    )
    -- Target barber is NOT owner
    AND barbers.role_id NOT IN (
      SELECT id FROM roles
      WHERE business_id = barbers.business_id
      AND name = 'owner'
    )
  );

-- Prevent self-escalation
CREATE POLICY "Cannot modify own role"
  ON barbers FOR UPDATE
  USING (user_id != auth.uid());
```

---

## 🟠 Calendar API Security (Priority 1)

### Secure Calendar Range Query

```typescript
// src/app/api/appointments/calendar/route.ts
import { withAuthAndRateLimit } from '@/lib/api/middleware'
import { differenceInDays, parseISO } from 'date-fns'
import { z } from 'zod'

const CalendarQuerySchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  view: z.enum(['day', 'week', 'month']).optional(),
})

// Maximum date ranges by view type
const MAX_DATE_RANGE = {
  day: 1,
  week: 7,
  month: 31,
  default: 90,
}

export const GET = withAuthAndRateLimit(
  async (request, context, { business, supabase }) => {
    try {
      const { searchParams } = new URL(request.url)

      // 1. Validate query parameters
      const queryParams = {
        start: searchParams.get('start'),
        end: searchParams.get('end'),
        view: searchParams.get('view') || 'week',
      }

      const { start, end, view } = CalendarQuerySchema.parse(queryParams)

      // 2. CRITICAL: Validate date range
      const startDate = parseISO(start)
      const endDate = parseISO(end)
      const daysDiff = differenceInDays(endDate, startDate)

      const maxRange = MAX_DATE_RANGE[view] || MAX_DATE_RANGE.default

      if (daysDiff > maxRange) {
        return NextResponse.json(
          {
            error: 'Date range too large',
            maxDays: maxRange,
            requestedDays: daysDiff,
          },
          { status: 400 }
        )
      }

      if (daysDiff < 0) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
      }

      // 3. CRITICAL: Always filter by business_id from auth
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id,
          scheduled_at,
          duration_minutes,
          status,
          price,
          client:clients(id, name, phone),
          barber:barbers(id, name),
          service:services(id, name)
        `
        )
        .eq('business_id', business.id) // ✅ CRITICAL: Enforced from JWT
        .gte('scheduled_at', start)
        .lte('scheduled_at', end)
        .order('scheduled_at', { ascending: true })

      if (error) {
        logger.error({ error, businessId: business.id }, 'Calendar query failed')
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
      }

      return NextResponse.json({
        appointments: data,
        dateRange: { start, end, view },
        total: data.length,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid query parameters', details: error.errors },
          { status: 400 }
        )
      }

      logger.error({ error }, 'Calendar API error')
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  },
  {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  }
)
```

---

## 🟡 Settings Search Security (Priority 2)

### Sanitized Search Index

```typescript
// src/lib/settings/search.ts
import Fuse from 'fuse.js'

// CRITICAL: Exclude sensitive fields from search
const EXCLUDED_FROM_SEARCH = [
  'sinpe_phone',
  'bank_account_number',
  'bank_account_owner',
  'api_keys',
  'webhook_secret',
  'stripe_secret_key',
  'stripe_publishable_key',
  'supabase_service_role_key',
  'resend_api_key',
  'upstash_redis_token',
  'sentry_dsn',
  'google_client_secret',
] as const

interface SearchableField {
  key: string
  label: string
  value: string
  category: string
  url: string
}

export function buildSearchIndex(settings: Record<string, any>): SearchableField[] {
  const searchableFields: SearchableField[] = []

  for (const [key, value] of Object.entries(settings)) {
    // Skip excluded fields
    if (EXCLUDED_FROM_SEARCH.includes(key as any)) {
      continue
    }

    // Skip null/undefined
    if (value == null) {
      continue
    }

    // Sanitize value for search
    const sanitizedValue =
      typeof value === 'string'
        ? value.substring(0, 100) // Truncate long values
        : String(value)

    searchableFields.push({
      key,
      label: formatLabel(key),
      value: sanitizedValue,
      category: getCategoryForKey(key),
      url: getUrlForKey(key),
    })
  }

  return searchableFields
}

// Initialize Fuse.js with safe options
export function createSearchEngine(fields: SearchableField[]) {
  return new Fuse(fields, {
    keys: ['label', 'key'],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    // Don't search in values (could expose partial secrets)
    keys: ['label', 'key'],
  })
}
```

### CSRF Protection for Settings

```typescript
// src/lib/csrf.ts
import { randomBytes } from 'crypto'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function generateCSRFToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')

  // Store in Redis with 1-hour TTL
  await redis.set(`csrf:${userId}`, token, { ex: 3600 })

  return token
}

export async function verifyCSRFToken(userId: string, token: string): Promise<boolean> {
  const storedToken = await redis.get(`csrf:${userId}`)

  if (!storedToken || storedToken !== token) {
    return false
  }

  return true
}

// Middleware
export function withCSRF<T>(handler: AuthHandler<T>) {
  return withAuth(async (request, context, auth) => {
    // Only verify CSRF for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const csrfToken = request.headers.get('X-CSRF-Token')

      if (!csrfToken) {
        return NextResponse.json({ error: 'Missing CSRF token' }, { status: 403 })
      }

      const isValid = await verifyCSRFToken(auth.user.id, csrfToken)

      if (!isValid) {
        logger.warn({ userId: auth.user.id }, 'Invalid CSRF token')
        return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
      }
    }

    return handler(request, context, auth)
  })
}
```

---

## 🔵 Business Type Validation (Priority 4)

### Preset Validation

```typescript
// src/lib/business-types/validation.ts
import { z } from 'zod'

// CRITICAL: Whitelist of allowed business types
export const ALLOWED_BUSINESS_TYPES = [
  'barberia',
  'peluqueria',
  'salon',
  'estetica',
  'maquillaje',
  'salon_unas',
  'estilista',
  'clinica',
  'consultorio',
  'odontologia',
  'psicologia',
  'fisioterapia',
  'medicina_alternativa',
  'gimnasio',
  'crossfit',
  'pilates',
  'personal_trainer',
  'entrenamiento_funcional',
  'danza',
  'centro_deportivo',
  'clases',
  'tutoria',
  'otro',
] as const

export type BusinessType = (typeof ALLOWED_BUSINESS_TYPES)[number]

// Validate preset structure
export const PresetServiceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  duration_minutes: z.number().int().min(5).max(480),
  price: z.number().min(0).max(999999),
})

export const BusinessPresetSchema = z.object({
  staff_term: z.string().min(1).max(50),
  staff_term_es: z.string().min(1).max(50),
  default_services: z.array(PresetServiceSchema).max(50),
  operating_hours: z.record(
    z
      .object({
        open: z.string().regex(/^\d{2}:\d{2}$/),
        close: z.string().regex(/^\d{2}:\d{2}$/),
      })
      .optional()
  ),
  booking_buffer_minutes: z.number().int().min(0).max(60),
  advance_booking_days: z.number().int().min(1).max(365),
})

export function validateBusinessType(type: string): BusinessType {
  if (!ALLOWED_BUSINESS_TYPES.includes(type as BusinessType)) {
    throw new Error(`Invalid business type: ${type}`)
  }
  return type as BusinessType
}

export function validatePreset(preset: unknown) {
  return BusinessPresetSchema.parse(preset)
}
```

### Secure Preset Application

```typescript
// src/app/api/business/apply-preset/route.ts
import { withAuth } from '@/lib/api/middleware'
import { validateBusinessType, validatePreset } from '@/lib/business-types/validation'
import { BUSINESS_TYPE_PRESETS } from '@/lib/business-types/presets'

export const POST = withAuth(async (request, context, { business, supabase }) => {
  try {
    const { businessType } = await request.json()

    // 1. CRITICAL: Validate business type (whitelist only)
    const validatedType = validateBusinessType(businessType)

    // 2. CRITICAL: Get preset from server-defined list (never from client)
    const preset = BUSINESS_TYPE_PRESETS[validatedType]

    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
    }

    // 3. CRITICAL: Validate preset structure
    const validatedPreset = validatePreset(preset)

    // 4. Apply preset (wrapped in transaction)
    const { error } = await supabase.rpc('apply_business_preset', {
      p_business_id: business.id,
      p_business_type: validatedType,
      p_staff_term: validatedPreset.staff_term,
      p_staff_term_es: validatedPreset.staff_term_es,
      p_default_services: validatedPreset.default_services,
      p_operating_hours: validatedPreset.operating_hours,
      p_booking_buffer: validatedPreset.booking_buffer_minutes,
      p_advance_days: validatedPreset.advance_booking_days,
    })

    if (error) {
      logger.error({ error, businessId: business.id }, 'Failed to apply preset')
      return NextResponse.json({ error: 'Failed to apply preset' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      businessType: validatedType,
      servicesCreated: validatedPreset.default_services.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preset data', details: error.errors },
        { status: 400 }
      )
    }

    logger.error({ error }, 'Preset application error')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
```

### Server-Only Preset File

```typescript
// src/lib/business-types/presets.ts

// CRITICAL: Prevent client-side import
if (typeof window !== 'undefined') {
  throw new Error('Business presets can only be imported server-side')
}

export const BUSINESS_TYPE_PRESETS = {
  barberia: {
    staff_term: 'barber',
    staff_term_es: 'barbero',
    default_services: [
      { name: 'Corte de Cabello', duration_minutes: 30, price: 5000 },
      { name: 'Barba', duration_minutes: 15, price: 3000 },
      { name: 'Corte + Barba', duration_minutes: 45, price: 7500 },
    ],
    operating_hours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      // ...
    },
    booking_buffer_minutes: 5,
    advance_booking_days: 30,
  },
  // ... rest of 22 presets
} as const
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-03
**Next Review:** After implementation of Priority 3
