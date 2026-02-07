# Security Checklist: FASE 2 Implementation

**Quick Reference for Developers**
**Source:** SECURITY_THREAT_MODEL_V2.5.md
**Last Updated:** 2026-02-03

---

## 🔴 CRITICAL - Must Complete Before Any Deployment

### RBAC System (Priority 3)

#### Role Assignment Security

- [ ] Implement `ROLE_HIERARCHY` constant with numeric levels
- [ ] Add `assignRole()` function with hierarchy validation
- [ ] Verify actor cannot assign roles >= their own level
- [ ] Add `checkPermission()` call before role assignment
- [ ] Test: Manager cannot assign Owner role

#### Database Security

- [ ] Add RLS policy: "Staff can only be assigned lower-level roles"
- [ ] Verify policy blocks owner role assignment by non-owners
- [ ] Test: RLS policy prevents privilege escalation at DB level

#### Audit Logging

- [ ] Create `audit_logs` table (migration 026)
- [ ] Log ALL role assignments (actor, target, old/new role, IP, timestamp)
- [ ] Log ALL permission override changes
- [ ] Add audit log viewer in admin panel

#### Permission Overrides

- [ ] Add `updatePermissionOverrides()` with validation
- [ ] Verify actor has permission before granting it to others
- [ ] Prevent granting wildcard permissions (\*) via overrides
- [ ] Test: Manager cannot grant themselves admin permissions

**Estimated Time:** +8 hours to Priority 3 (12-16h → 20-26h)

---

## 🟠 HIGH PRIORITY - Fix During Implementation

### Calendar API (Priority 1)

- [ ] Use `withAuth()` middleware for ALL calendar endpoints
- [ ] Verify `business.id` filter in ALL date range queries
- [ ] Add date range validation (max 90 days per query)
- [ ] Add rate limiting: `withAuthAndRateLimit(..., { interval: 60000, maxRequests: 30 })`
- [ ] Integration test: Business A cannot see Business B appointments

**Code Template:**

```typescript
export const GET = withAuthAndRateLimit(
  async (request, context, { business, supabase }) => {
    const { start, end } = getDateParams(request)

    // Validate date range
    if (daysBetween(start, end) > 90) {
      return errorResponse('Date range too large (max 90 days)', 400)
    }

    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', business.id) // ✅ CRITICAL
      .gte('scheduled_at', start)
      .lte('scheduled_at', end)

    return NextResponse.json(data)
  },
  { interval: 60 * 1000, maxRequests: 30 }
)
```

**Estimated Time:** +1 hour

---

### Settings Menu (Priority 2)

#### Search Security

- [ ] Create `EXCLUDED_FROM_SEARCH` constant (API keys, secrets, payment info)
- [ ] Filter sensitive fields from search index
- [ ] Sanitize search results (truncate values to 50 chars)
- [ ] Rate limit search: `RateLimitPresets.lenient` (100 req/min)

#### Form Security

- [ ] Add CSRF token generation (`generateCSRFToken()`)
- [ ] Add `withCSRF()` middleware for state-changing operations
- [ ] Verify CSRF token on POST/PUT/PATCH/DELETE
- [ ] Add audit log for critical settings changes

**Code Template:**

```typescript
const EXCLUDED_FROM_SEARCH = [
  'sinpe_phone',
  'bank_account',
  'api_keys',
  'webhook_secret',
  'stripe_secret_key',
]

function buildSearchIndex(settings: Settings) {
  return Object.entries(settings)
    .filter(([key]) => !EXCLUDED_FROM_SEARCH.includes(key))
    .map(([key, value]) => ({
      key,
      searchable: typeof value === 'string' ? value.substring(0, 50) : String(value),
    }))
}
```

**Estimated Time:** +4 hours

---

### Business Types (Priority 4)

#### Preset Injection Prevention

- [ ] Create `ALLOWED_BUSINESS_TYPES` whitelist (22 types)
- [ ] Reject any businessType not in whitelist
- [ ] Create `BusinessPresetSchema` with Zod
- [ ] Add `validatePreset()` function
- [ ] Only use server-defined presets (never accept from client)
- [ ] Add server-only import guard in presets.ts

**Code Template:**

```typescript
const ALLOWED_BUSINESS_TYPES = [
  'barberia',
  'peluqueria',
  'salon',
  'clinica',
  // ... rest of 22 types
] as const

export async function POST(request: Request) {
  const { businessType } = await request.json()

  if (!ALLOWED_BUSINESS_TYPES.includes(businessType)) {
    return NextResponse.json({ error: 'Invalid business type' }, { status: 400 })
  }

  const preset = BUSINESS_TYPE_PRESETS[businessType]
  const validated = BusinessPresetSchema.parse(preset)

  await applyBusinessPreset(businessId, validated)
}
```

**Estimated Time:** +3 hours

---

## 🟡 MEDIUM PRIORITY - Complete Before Production

### File Upload Validation

- [ ] Add empty file check (`file.size === 0`)
- [ ] Block zip files (zip bomb risk)
- [ ] Sanitize file names (`path.basename()`)
- [ ] Add image dimension limits (max 4096x4096)
- [ ] Use `sharp` library for image metadata validation

### WhatsApp Links

- [ ] Use hashed phone IDs instead of actual numbers in URLs
- [ ] Create `/api/whatsapp/[hash]/resolve` endpoint
- [ ] Store phone hash mapping server-side only
- [ ] Add rate limiting on resolver endpoint

### Rate Limiting Coverage

- [ ] Calendar week/month views: 30 req/min
- [ ] Settings search: 100 req/min
- [ ] Role assignment: 10 req/min
- [ ] Payment method updates: 5 req/15min

---

## 🧪 Security Testing Checklist

### RBAC Tests (Priority 3)

```typescript
✅ Manager cannot assign Owner role to anyone
✅ Manager cannot assign Manager role to themselves
✅ Staff cannot modify any roles
✅ Permission overrides cannot exceed actor's permissions
✅ All role changes logged in audit_logs
✅ RLS policy blocks unauthorized role assignments
```

### Calendar Tests (Priority 1)

```typescript
✅ Business A cannot see Business B appointments
✅ Date range limited to 90 days
✅ Rate limiting triggers after 30 requests/minute
✅ RLS policy enforces business_id filtering
```

### Settings Tests (Priority 2)

```typescript
✅ API keys excluded from search results
✅ CSRF token required for settings updates
✅ Sensitive changes logged in audit trail
```

### Business Types Tests (Priority 4)

```typescript
✅ Invalid business types rejected
✅ Custom presets rejected
✅ Preset validation catches malicious data
```

---

## 📊 Security Metrics Dashboard

**Track these during FASE 2:**

### Must Be Zero

- [ ] CRITICAL vulnerabilities (CVSS 9.0+): **0**
- [ ] HIGH vulnerabilities (CVSS 7.0-8.9): **0**
- [ ] Unprotected role assignments: **0**
- [ ] Cross-tenant data leaks: **0**

### Must Be 100%

- [ ] RLS policies on new tables: **100%**
- [ ] Rate limiting on public endpoints: **100%**
- [ ] Audit logging on sensitive operations: **100%**
- [ ] Input validation on user data: **100%**

### Target Coverage

- [ ] Security test coverage: **≥ 80%**
- [ ] Integration test coverage (auth): **≥ 90%**
- [ ] E2E test coverage (critical paths): **≥ 70%**

---

## 🚨 Deployment Gate

**FASE 2 - Priority 3 (RBAC) CANNOT DEPLOY until:**

1. ✅ All CRITICAL checklist items completed
2. ✅ Role hierarchy tests passing (6/6)
3. ✅ Audit logging functional
4. ✅ RLS policies active and tested
5. ✅ Security review approved

**Other Priorities (1, 2, 4) can deploy independently.**

---

## 📞 Quick Reference

**Found a security issue?**

| Severity         | Action                | Example               |
| ---------------- | --------------------- | --------------------- |
| CRITICAL (9.0+)  | STOP, fix immediately | Privilege escalation  |
| HIGH (7.0-8.9)   | Fix before deployment | Cross-tenant leak     |
| MEDIUM (4.0-6.9) | Fix in same PR        | Missing rate limit    |
| LOW (0.1-3.9)    | Track in backlog      | Verbose error message |

**Documents:**

- Full threat model: `/docs/reference/SECURITY_THREAT_MODEL_V2.5.md`
- Implementation plan: `/docs/planning/implementation-v2.5.md`
- Database schema: `/DATABASE_SCHEMA.md`

---

**Checklist Version:** 1.0
**Last Updated:** 2026-02-03
**Next Review:** After Priority 3 implementation
