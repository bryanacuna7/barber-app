# Client Cancel/Reschedule Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow clients to cancel or reschedule appointments from `/track/[token]` and `/mi-cuenta`, with owner-configurable cancellation policy.

**Architecture:** Public API endpoints authenticated via tracking token (no user login). Cancellation policy stored as JSONB on businesses table. Notifications via existing push/email/in-app system.

**Tech Stack:** Next.js API routes, Supabase (PostgreSQL + serviceClient), Framer Motion, existing notification helpers.

**Design Doc:** `docs/plans/2026-02-23-client-cancel-reschedule-design.md`

---

### Task 1: Migration — cancellation_policy + appointment columns

**Files:**

- Create: `supabase/migrations/036_cancellation_policy.sql`
- Modify: `DATABASE_SCHEMA.md` — add new columns documentation

**Step 1: Write migration**

```sql
-- =====================================================
-- MIGRATION 036: Cancellation Policy + Cancel Metadata
-- =====================================================
-- Purpose:
-- - Add cancellation_policy JSONB to businesses
-- - Add cancel metadata columns to appointments
-- - Extend tracking token expiry formula

-- 1. Business cancellation policy config
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS cancellation_policy JSONB
  DEFAULT '{"enabled": false, "deadline_hours": 24, "allow_reschedule": true}';

-- 2. Appointment cancel metadata
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT
  CHECK (cancelled_by IN ('owner', 'barber', 'client'));

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS reschedule_count INT DEFAULT 0;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS rescheduled_from UUID REFERENCES appointments(id);

-- 3. Index for rescheduled_from lookups
CREATE INDEX IF NOT EXISTS idx_appointments_rescheduled_from
  ON appointments(rescheduled_from)
  WHERE rescheduled_from IS NOT NULL;
```

**Step 2: Update DATABASE_SCHEMA.md**

Add under `businesses` table:

```
-- cancellation_policy     JSONB DEFAULT '{"enabled":false,"deadline_hours":24,"allow_reschedule":true}'
```

Add under `appointments` table:

```
-- cancelled_by            TEXT CHECK (cancelled_by IN ('owner', 'barber', 'client'))
-- cancelled_at            TIMESTAMPTZ
-- reschedule_count        INT DEFAULT 0
-- rescheduled_from        UUID REFERENCES appointments(id)
```

**Step 3: Guide user to execute migration in Supabase Dashboard**

**Step 4: Commit**

```bash
git add supabase/migrations/036_cancellation_policy.sql DATABASE_SCHEMA.md
git commit -m "feat(feature-3): migration 036 — cancellation policy + cancel metadata"
```

---

### Task 2: Types — CancellationPolicy + API types

**Files:**

- Modify: `src/types/api.ts` — add CancellationPolicy and cancel/reschedule types
- Modify: `src/types/index.ts` — re-export

**Step 1: Add types to `src/types/api.ts`**

```ts
// Cancellation Policy (stored in businesses.cancellation_policy)
export interface CancellationPolicy {
  enabled: boolean
  deadline_hours: number
  allow_reschedule: boolean
}

// Cancel request/response
export interface CancelRequest {
  token: string
  reason?: string
}

export interface CancelResponse {
  success: boolean
  message: string
  refund_eligible: boolean // prepared for Part 2 (SINPE deposits)
}

// Reschedule request/response
export interface RescheduleRequest {
  token: string
  new_scheduled_at: string
  new_barber_id?: string
}

export interface RescheduleResponse {
  success: boolean
  message: string
  appointment_id: string
  tracking_token: string
  tracking_url: string
  scheduled_at: string
  discount?: SlotDiscount | null
}
```

**Step 2: Re-export from `src/types/index.ts`**

Add to the `./api` re-exports:

```ts
;(CancellationPolicy, CancelRequest, CancelResponse, RescheduleRequest, RescheduleResponse)
```

**Step 3: Commit**

```bash
git add src/types/api.ts src/types/index.ts
git commit -m "feat(feature-3): cancellation policy + cancel/reschedule types"
```

---

### Task 3: Cancel Policy API — GET/PUT

**Files:**

- Create: `src/app/api/public/cancel-policy/[slug]/route.ts` — public GET
- Create: `src/app/api/settings/cancellation-policy/route.ts` — authenticated GET/PUT

**Step 1: Create public cancel-policy endpoint**

Pattern: similar to `src/app/api/public/[slug]/route.ts`

```ts
// GET /api/public/cancel-policy/[slug]
// Public, no auth. Returns cancellation policy for the business.
// Uses serviceClient since this is a public endpoint.
```

- Lookup business by slug
- Return `cancellation_policy` JSONB (with defaults if null)
- Rate limit: `RateLimitPresets.moderate`

**Step 2: Create settings endpoint for owners**

Pattern: follow `src/app/api/settings/promotional-slots/route.ts` exactly.

- GET: read `cancellation_policy` from authenticated user's business
- PUT: validate and update the JSONB column
- Validation: `deadline_hours` must be 1-168 (1h to 7 days), booleans must be booleans

**Step 3: Commit**

```bash
git add src/app/api/public/cancel-policy/ src/app/api/settings/cancellation-policy/
git commit -m "feat(feature-3): cancellation policy API endpoints"
```

---

### Task 4: Cancel API — POST /api/public/cancel

**Files:**

- Create: `src/app/api/public/cancel/route.ts`
- Reference: `src/app/api/public/queue/route.ts` (token validation pattern)
- Reference: `src/lib/notifications.ts` (`createNotification`)
- Reference: `src/lib/push/sender.ts` (`sendPushToBusinessOwner`)
- Reference: `src/lib/email/sender.ts` (`sendNotificationEmail`)

**Step 1: Create cancel endpoint**

```ts
// POST /api/public/cancel
// Auth: tracking token (no user auth)
// Body: { token: string, reason?: string }
```

Implementation checklist:

1. Rate limit: 5 req/min per IP (custom config, stricter than moderate)
2. Validate UUID format (regex from queue route)
3. Lookup appointment by `tracking_token` using `serviceClient`
4. Guard: status must be `'scheduled'`
5. Guard: not already cancelled
6. Lookup business `cancellation_policy`
7. Guard: policy `enabled === true`
8. Guard: current time < `scheduled_at - deadline_hours`
9. Update appointment: `status='cancelled', cancelled_by='client', cancelled_at=now()`
10. Fire notifications (non-blocking with `.catch()`):
    - `createNotification()` — in-app for owner
    - `sendPushToBusinessOwner()` — push notification
    - `sendNotificationEmail()` — email to owner (type: `'appointment_cancelled'`)
    - Email confirmation to client (if email exists)
11. Return `{ success: true, message: 'Cita cancelada exitosamente', refund_eligible: false }`

**Step 2: Add `appointment_cancelled` to email preference map**

In `src/lib/email/sender.ts`, add to `EMAIL_PREFERENCE_MAP`:

```ts
appointment_cancelled: 'email_new_appointment', // reuse same preference toggle
```

**Step 3: Commit**

```bash
git add src/app/api/public/cancel/ src/lib/email/sender.ts
git commit -m "feat(feature-3): public cancel API with notifications"
```

---

### Task 5: Reschedule API — POST /api/public/reschedule

**Files:**

- Create: `src/app/api/public/reschedule/route.ts`
- Reference: `src/app/api/public/[slug]/book/route.ts` (booking creation pattern)
- Reference: `src/app/api/public/[slug]/availability/route.ts` (slot validation)

**Step 1: Create reschedule endpoint**

```ts
// POST /api/public/reschedule
// Auth: tracking token
// Body: { token: string, new_scheduled_at: string, new_barber_id?: string }
```

Implementation checklist:

1. Rate limit: 5 req/min per IP
2. Validate token → get original appointment (same as cancel)
3. Guard: status = `'scheduled'`, policy enabled, policy `allow_reschedule = true`
4. Guard: `reschedule_count < 2`
5. Guard: deadline not passed
6. Validate new slot is available (call availability logic or direct DB check)
7. Cancel original: `status='cancelled', cancelled_by='client', cancelled_at=now()`
8. Create new appointment copying: `service_id, barber_id (or new), client_name, client_phone, client_email, business_id, notes`
9. Set on new: `rescheduled_from=original.id, reschedule_count=original.reschedule_count+1`
10. Calculate tracking token expiry for new appointment
11. If promo slot → recalculate discount with `evaluatePromo()` from `src/lib/promo-engine.ts`
12. Fire notifications (non-blocking):
    - In-app: "Maria reagendo su cita: [old time] → [new time]"
    - Push to owner
    - Email to owner
    - Confirmation email to client with new tracking link
13. Return new appointment data + tracking token + URL

**Step 2: Commit**

```bash
git add src/app/api/public/reschedule/
git commit -m "feat(feature-3): public reschedule API with slot validation"
```

---

### Task 6: UI — CancelRescheduleActions component

**Files:**

- Create: `src/components/track/cancel-reschedule-actions.tsx`
- Reference: `src/components/reservar/DateTimeSelection.tsx` (date/time picker for reschedule)
- Reference: `src/components/ui/button.tsx` (Button component)
- Reference: `src/components/ui/modal.tsx` (Modal for confirmation)

**Step 1: Create the shared actions component**

Props:

```ts
interface CancelRescheduleActionsProps {
  token: string
  scheduledAt: string
  policy: CancellationPolicy
  serviceName: string
  barberName: string
  businessSlug: string
  onCancelled?: () => void
  onRescheduled?: (newTrackingToken: string) => void
}
```

States:

- Default: show "Cancelar" and "Reagendar" buttons
- Cancel flow: Modal confirmation → loading → success/error
- Reschedule flow: Expand inline DateTimeSelection → confirm → loading → success redirect
- Deadline passed: buttons disabled with text "Ya no es posible cancelar"
- Policy disabled: component renders nothing

UI rules from MEMORY.md:

- `<Button>` component (NOT raw `<button>`)
- `h-11` (44px touch targets)
- `<Modal>` for cancel confirmation
- `whileTap` for mobile, `isLoading` prop
- `variant="danger"` for cancel button

**Step 2: Commit**

```bash
git add src/components/track/cancel-reschedule-actions.tsx
git commit -m "feat(feature-3): CancelRescheduleActions shared component"
```

---

### Task 7: UI — Integrate into /track/[token]

**Files:**

- Modify: `src/app/track/[token]/page.tsx`
- Reference: `src/app/api/public/queue/route.ts` (response shape)

**Step 1: Fetch cancel policy alongside queue data**

In the track page, after resolving the business slug from the queue response, fetch `GET /api/public/cancel-policy/[slug]`.

**Step 2: Add CancelRescheduleActions below status card**

Only render when:

- `trackingState === 'valid'`
- Phase is `'countdown'` or `'live-queue'` (NOT `'your-turn'`)
- Appointment status is `'scheduled'`

On cancel success → set `trackingState = 'cancelled'`
On reschedule success → redirect to new `/track/[newToken]`

**Step 3: Playwright screenshot to verify**

**Step 4: Commit**

```bash
git add src/app/track/
git commit -m "feat(feature-3): cancel/reschedule actions in tracking page"
```

---

### Task 8: UI — Integrate into /mi-cuenta

**Files:**

- Modify: `src/components/client/live-queue-card.tsx` or `src/app/(client)/mi-cuenta/page.tsx`

**Step 1: Add cancel/reschedule to LiveQueueCard**

The `LiveQueueCard` receives `appointment` which has the tracking token. Add `CancelRescheduleActions` below the existing card content when:

- Phase is `'countdown'` or `'live-queue'`
- Appointment status is `'scheduled'`

Need to fetch policy using the `businessId` prop → resolve slug → fetch cancel policy.

**Step 2: Playwright screenshot to verify**

**Step 3: Commit**

```bash
git add src/components/client/ src/app/\(client\)/mi-cuenta/
git commit -m "feat(feature-3): cancel/reschedule in mi-cuenta LiveQueueCard"
```

---

### Task 9: UI — Owner config (Configuracion > Pagos)

**Files:**

- Create: `src/components/settings/cancellation-policy-section.tsx`
- Modify: `src/app/(dashboard)/configuracion/pagos/page.tsx`

**Step 1: Create CancellationPolicySection component**

Pattern: follow existing `pagos/page.tsx` style (IOSToggle + inputs + save button).

UI:

```
Politica de cancelacion
───────────────────────
[Toggle] Permitir que clientes cancelen sus citas

  Anticipacion minima: [24] horas    ← number input, 1-168
  [Toggle] Permitir reagendamiento
```

- Reads/writes via `GET/PUT /api/settings/cancellation-policy`
- Shows save button with `isLoading` state
- Uses existing `IOSToggle` component
- Number input for deadline hours with min/max validation

**Step 2: Add section to pagos page**

Import and render `CancellationPolicySection` below the payment methods section, separated by a divider.

**Step 3: Playwright screenshot to verify**

**Step 4: Commit**

```bash
git add src/components/settings/cancellation-policy-section.tsx src/app/\(dashboard\)/configuracion/pagos/
git commit -m "feat(feature-3): cancellation policy config in Configuracion > Pagos"
```

---

### Task 10: Notifications — cancel/reschedule events

**Files:**

- Modify: `src/lib/notifications.ts` — add styles for cancel/reschedule
- Modify: `src/lib/email/sender.ts` — ensure preference map covers cancellation

**Step 1: Add notification styles**

In `getNotificationStyle()`, the `appointment_cancelled` type already exists but verify it has proper icon/color. Add a `appointment_rescheduled` type if needed, or reuse `appointment_cancelled` with different message.

**Step 2: Verify email template**

The cancel/reschedule API routes will send emails inline (similar to how booking sends confirmation). Use simple text-based email, not a complex template.

**Step 3: Commit**

```bash
git add src/lib/notifications.ts src/lib/email/sender.ts
git commit -m "feat(feature-3): notification styles for cancel/reschedule events"
```

---

### Task 11: Security hardening + RLS migration 035

**Files:**

- Apply: `supabase/migrations/035_secure_referral_conversions_rls.sql` (already written)
- Verify rate limiting works on new endpoints

**Step 1: Guide user to execute migration 035 in Supabase**

**Step 2: Verify rate limiting on cancel/reschedule endpoints**

Test with curl:

```bash
for i in {1..6}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/public/cancel -H "Content-Type: application/json" -d '{"token":"fake"}'; done
# First 5 should return 400/404, 6th should return 429
```

**Step 3: Commit any adjustments**

---

### Task 12: Final integration test + commit

**Step 1: Full flow test via Playwright**

1. Navigate to a booking page, create a test booking
2. Navigate to `/track/[token]`
3. Verify cancel/reschedule buttons appear (if policy enabled)
4. Test cancel flow → verify cancelled state
5. Screenshot final state

**Step 2: Verify owner dashboard shows notification**

Login as test owner → check notification bell

**Step 3: Final commit if needed**

```bash
git commit -m "feat(feature-3): client cancel/reschedule — complete implementation"
```
