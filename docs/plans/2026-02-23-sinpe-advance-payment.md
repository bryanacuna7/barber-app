# SINPE Advance Payment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow owners to offer optional SINPE advance payment with discount incentive; clients submit proof via WhatsApp or upload.

**Architecture:** New columns on businesses (config) and appointments (state). Post-booking banner in BookingSuccess component. Owner verification in dashboard. Follows exact patterns from cancellation policy feature (Feature 3 Part 1).

**Tech Stack:** Next.js 16 API routes, Supabase (PostgreSQL + Storage), React Email, Framer Motion, lucide-react

**Design doc:** `docs/plans/2026-02-23-sinpe-advance-payment-design.md`

---

### Task 1: Migration + Types

**Files:**

- Create: `supabase/migrations/037_advance_payment.sql`
- Modify: `src/types/api.ts` (after line 94, after CancelResponse)
- Modify: `src/types/index.ts` (add exports)
- Modify: `DATABASE_SCHEMA.md` (update businesses + appointments sections)

**Step 1: Write the migration**

```sql
-- =====================================================
-- MIGRATION 037: Advance Payment (SINPE)
-- =====================================================

-- 1. Business config columns
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS advance_payment_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS advance_payment_discount INT DEFAULT 10
    CHECK (advance_payment_discount BETWEEN 5 AND 50),
  ADD COLUMN IF NOT EXISTS advance_payment_deadline_hours INT DEFAULT 2
    CHECK (advance_payment_deadline_hours BETWEEN 0 AND 48),
  ADD COLUMN IF NOT EXISTS sinpe_phone TEXT,
  ADD COLUMN IF NOT EXISTS sinpe_holder_name TEXT;

-- 2. Appointment advance payment state
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS advance_payment_status TEXT DEFAULT 'none'
    CHECK (advance_payment_status IN ('none', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS proof_channel TEXT
    CHECK (proof_channel IN ('whatsapp', 'upload')),
  ADD COLUMN IF NOT EXISTS advance_payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS proof_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by_user_id UUID,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS base_price_snapshot DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS discount_pct_snapshot INT,
  ADD COLUMN IF NOT EXISTS discount_amount_snapshot DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS final_price_snapshot DECIMAL(10,2);

-- 3. Consistency constraints
ALTER TABLE appointments
  ADD CONSTRAINT chk_advance_none
    CHECK (advance_payment_status != 'none' OR (
      proof_channel IS NULL AND
      advance_payment_proof_url IS NULL AND
      proof_submitted_at IS NULL
    )),
  ADD CONSTRAINT chk_advance_verified
    CHECK (advance_payment_status != 'verified' OR (
      verified_by_user_id IS NOT NULL AND
      verified_at IS NOT NULL
    ));

-- 4. Index for dashboard queries (pending payments)
CREATE INDEX IF NOT EXISTS idx_appointments_advance_payment
  ON appointments(business_id, advance_payment_status)
  WHERE advance_payment_status != 'none';
```

**Step 2: Add TypeScript types**

In `src/types/api.ts` after line 94 (after `CancelResponse`), add:

```typescript
// === Advance Payment (SINPE) ===

export interface AdvancePaymentConfig {
  enabled: boolean
  discount: number // percentage 5-50
  deadline_hours: number // 0-48
  sinpe_phone: string
  sinpe_holder_name: string
}

export interface AdvancePaymentInfo {
  enabled: boolean
  discount: number
  deadline_hours: number
  sinpe_phone: string
  sinpe_holder_name: string
  service_price: number
  discount_amount: number
  final_price: number
}
```

In `src/types/index.ts`, add to exports:

```typescript
export type { AdvancePaymentConfig, AdvancePaymentInfo } from './api'
```

**Step 3: Update DATABASE_SCHEMA.md** with the new columns.

**Step 4: Commit**

```bash
git add supabase/migrations/037_advance_payment.sql src/types/api.ts src/types/index.ts DATABASE_SCHEMA.md
git commit -m "feat(advance-payment): migration 037 + types"
```

---

### Task 2: Settings API (GET/PUT)

**Files:**

- Create: `src/app/api/settings/advance-payment/route.ts`

**Pattern:** Copy exact structure from `src/app/api/settings/cancellation-policy/route.ts`

**Step 1: Create the settings API**

```typescript
/**
 * API Route: Advance Payment Settings
 * GET: Load advance payment config from business columns
 * PUT: Update advance payment config (validated)
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AdvancePaymentConfig } from '@/types'

const DEFAULT_CONFIG: AdvancePaymentConfig = {
  enabled: false,
  discount: 10,
  deadline_hours: 2,
  sinpe_phone: '',
  sinpe_holder_name: '',
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business, error: bizError } = (await supabase
      .from('businesses')
      .select(
        'id, advance_payment_enabled, advance_payment_discount, advance_payment_deadline_hours, sinpe_phone, sinpe_holder_name'
      )
      .eq('owner_id', user.id)
      .single()) as any

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({
      enabled: business.advance_payment_enabled ?? DEFAULT_CONFIG.enabled,
      discount: business.advance_payment_discount ?? DEFAULT_CONFIG.discount,
      deadline_hours: business.advance_payment_deadline_hours ?? DEFAULT_CONFIG.deadline_hours,
      sinpe_phone: business.sinpe_phone ?? DEFAULT_CONFIG.sinpe_phone,
      sinpe_holder_name: business.sinpe_holder_name ?? DEFAULT_CONFIG.sinpe_holder_name,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const body = await request.json()
    const { enabled, discount, deadline_hours, sinpe_phone, sinpe_holder_name } = body

    // Validate
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be boolean' }, { status: 400 })
    }
    if (typeof discount !== 'number' || discount < 5 || discount > 50) {
      return NextResponse.json({ error: 'discount must be 5-50' }, { status: 400 })
    }
    if (typeof deadline_hours !== 'number' || deadline_hours < 0 || deadline_hours > 48) {
      return NextResponse.json({ error: 'deadline_hours must be 0-48' }, { status: 400 })
    }
    if (
      enabled &&
      (!sinpe_phone || typeof sinpe_phone !== 'string' || sinpe_phone.trim().length < 8)
    ) {
      return NextResponse.json({ error: 'sinpe_phone required when enabled' }, { status: 400 })
    }
    if (
      enabled &&
      (!sinpe_holder_name ||
        typeof sinpe_holder_name !== 'string' ||
        sinpe_holder_name.trim().length < 2)
    ) {
      return NextResponse.json(
        { error: 'sinpe_holder_name required when enabled' },
        { status: 400 }
      )
    }

    const { error: updateError } = (await supabase
      .from('businesses')
      .update({
        advance_payment_enabled: enabled,
        advance_payment_discount: discount,
        advance_payment_deadline_hours: deadline_hours,
        sinpe_phone: sinpe_phone?.trim() || null,
        sinpe_holder_name: sinpe_holder_name?.trim() || null,
      } as any)
      .eq('id', business.id)) as any

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/settings/advance-payment/route.ts
git commit -m "feat(advance-payment): settings GET/PUT API"
```

---

### Task 3: Config UI Section (Configuracion > Pagos)

**Files:**

- Create: `src/components/settings/advance-payment-section.tsx`
- Modify: `src/app/(dashboard)/configuracion/pagos/page.tsx` (add import + render after CancellationPolicySection)

**Pattern:** Copy structure from `src/components/settings/cancellation-policy-section.tsx`

**Step 1: Create AdvancePaymentSection component**

Follow the exact same pattern as CancellationPolicySection:

- `useState` for config + saved state
- `isDirty` computed from diff
- `useEffect` to load from `/api/settings/advance-payment`
- `handleSave` with PUT
- `AnimatePresence` to show fields when enabled
- Fields: Toggle (enabled), SINPE phone input, holder name input, discount slider/input (5-50%), deadline hours input (0-48)
- Save button with `AnimatePresence` (only shows when dirty)
- Loading skeleton while fetching

Icons: `Smartphone` for the section header (SINPE = mobile payments)

**Step 2: Add to Pagos page**

In `src/app/(dashboard)/configuracion/pagos/page.tsx`:

- Import: `import { AdvancePaymentSection } from '@/components/settings/advance-payment-section'`
- After the CancellationPolicySection (line ~224), add another divider + section:

```tsx
{
  /* Divider */
}
;<div className="border-t border-zinc-200 dark:border-zinc-700" />

{
  /* Advance Payment */
}
;<FadeInUp delay={0.2}>
  <AdvancePaymentSection businessId={businessId} />
</FadeInUp>
```

**Step 3: Commit**

```bash
git add src/components/settings/advance-payment-section.tsx src/app/(dashboard)/configuracion/pagos/page.tsx
git commit -m "feat(advance-payment): config UI in Pagos page"
```

**Step 4: Visual verification** — Playwright screenshot of `/configuracion/pagos` page with the new section.

---

### Task 4: Public API — Get Advance Payment Info

**Files:**

- Create: `src/app/api/public/advance-payment/[slug]/route.ts`

**Purpose:** Public endpoint (no auth) for the booking success page to check if business offers advance payment and get SINPE details + calculated pricing.

**Step 1: Create the route**

```typescript
/**
 * GET /api/public/advance-payment/[slug]?service_id=xxx&price=yyy
 *
 * Public endpoint — returns advance payment info for booking success page.
 * No auth required (public booking page).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const price = Number(request.nextUrl.searchParams.get('price') || '0')

    if (!slug || price <= 0) {
      return NextResponse.json({ enabled: false })
    }

    const serviceClient = createServiceClient()

    const { data: business, error } = (await (serviceClient as any)
      .from('businesses')
      .select(
        'advance_payment_enabled, advance_payment_discount, advance_payment_deadline_hours, sinpe_phone, sinpe_holder_name'
      )
      .eq('slug', slug)
      .single()) as any

    if (error || !business || !business.advance_payment_enabled) {
      return NextResponse.json({ enabled: false })
    }

    const discount = business.advance_payment_discount ?? 10
    const discountAmount = Math.round((price * discount) / 100)
    const finalPrice = price - discountAmount

    return NextResponse.json({
      enabled: true,
      discount,
      deadline_hours: business.advance_payment_deadline_hours ?? 2,
      sinpe_phone: business.sinpe_phone,
      sinpe_holder_name: business.sinpe_holder_name,
      service_price: price,
      discount_amount: discountAmount,
      final_price: finalPrice,
    })
  } catch {
    return NextResponse.json({ enabled: false })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/public/advance-payment/[slug]/route.ts
git commit -m "feat(advance-payment): public info API"
```

---

### Task 5: Proof Submit API (Upload + WhatsApp)

**Files:**

- Create: `src/app/api/public/advance-payment/submit/route.ts`

**Purpose:** Token-auth endpoint. Handles both `upload` (multipart form with image) and `whatsapp` (JSON confirmation). Updates appointment state to `pending` with price snapshots.

**Step 1: Create the route**

Key logic:

- Rate limit: 10 req/min
- Validate tracking token (UUID regex → lookup appointment)
- Guard: status must be `pending` or `confirmed`, advance_payment_status must be `none` or `rejected`
- Guard: deadline check (if deadline_hours > 0)
- If `proof_channel = 'upload'`: parse multipart form, validate file (max 5MB, image/\* only), generate random filename `{business_id}/{appointment_id}/{uuid}.{ext}`, upload to `deposit-proofs` bucket, get signed URL
- If `proof_channel = 'whatsapp'`: no file, just mark as pending
- Calculate price snapshots: `base_price_snapshot`, `discount_pct_snapshot`, `discount_amount_snapshot`, `final_price_snapshot`
- Update appointment with all fields + `proof_submitted_at = now()`
- Fire notifications to owner (push + in-app, non-blocking)
- Return success

**Step 2: Commit**

```bash
git add src/app/api/public/advance-payment/submit/route.ts
git commit -m "feat(advance-payment): proof submit API (upload + whatsapp)"
```

---

### Task 6: Verify/Reject Payment API

**Files:**

- Create: `src/app/api/appointments/[id]/verify-payment/route.ts`

**Purpose:** Authenticated endpoint for owner/barber. POST with `{ action: 'verify' | 'reject' }`. Updates state machine.

**Step 1: Create the route**

Key logic:

- Auth required (owner or barber of the business)
- Guard: advance_payment_status must be `pending`
- If `action = 'verify'`: set `verified`, `verified_by_user_id`, `verified_at`
- If `action = 'reject'`: set `rejected`
- Fire notification to client (email + in-app, non-blocking)
- Return success

**Step 2: Commit**

```bash
git add src/app/api/appointments/[id]/verify-payment/route.ts
git commit -m "feat(advance-payment): verify/reject payment API"
```

---

### Task 7: Payment Proof Signed URL API

**Files:**

- Create: `src/app/api/appointments/[id]/payment-proof/route.ts`

**Purpose:** Authenticated. Returns a 1-hour signed URL for the proof image.

**Step 1: Create the route**

Key logic:

- Auth required
- Lookup appointment, verify business ownership
- If `advance_payment_proof_url` is null, return 404
- Create signed URL: `supabase.storage.from('deposit-proofs').createSignedUrl(path, 3600)`
- Return `{ url: signedUrl }`

**Step 2: Commit**

```bash
git add src/app/api/appointments/[id]/payment-proof/route.ts
git commit -m "feat(advance-payment): signed URL for payment proof"
```

---

### Task 8: BookingSuccess — Advance Payment Banner

**Files:**

- Modify: `src/components/reservar/BookingSuccess.tsx`

**Purpose:** After booking confirmation, show optional "Paga antes y ahorra X%" banner. Fetches advance payment info from public API.

**Step 1: Add advance payment state + fetch**

Add to BookingSuccess:

- `useState` for `advancePaymentInfo` (null | AdvancePaymentInfo)
- `useState` for `showAdvancePayment` (boolean, starts false)
- `useEffect` to fetch `/api/public/advance-payment/{slug}?price={service.price}`
- If enabled, show banner below the booking summary

**Step 2: Build the banner UI**

Insert after the "Recomendar a un amigo" button (around line 140) and before the loyalty CTA:

```tsx
{
  /* Advance Payment CTA */
}
{
  advancePaymentInfo?.enabled && !advancePaymentSubmitted && (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
      <p className="text-[15px] font-semibold text-blue-900 dark:text-blue-100">
        Paga antes y ahorra {advancePaymentInfo.discount}%
      </p>
      <p className="mt-1 text-[13px] text-blue-700 dark:text-blue-300">
        Precio con descuento: ₡{advancePaymentInfo.final_price.toLocaleString()}
        <span className="ml-2 line-through text-blue-400">
          ₡{advancePaymentInfo.service_price.toLocaleString()}
        </span>
      </p>
      <Button
        onClick={() => setShowAdvancePayment(true)}
        className="mt-3 w-full"
        variant="secondary"
      >
        <Smartphone className="h-4 w-4 mr-2" />
        Pagar por adelantado
      </Button>
    </div>
  )
}
```

When `showAdvancePayment = true`, render `<AdvancePaymentSubmit>` (Task 9).

**Step 3: Commit**

```bash
git add src/components/reservar/BookingSuccess.tsx
git commit -m "feat(advance-payment): booking success banner"
```

---

### Task 9: AdvancePaymentSubmit Component

**Files:**

- Create: `src/components/reservar/advance-payment-submit.tsx`

**Purpose:** The payment submission flow shown when client taps "Pagar por adelantado". Shows SINPE number, two options (WhatsApp / Upload), confirmation.

**Step 1: Create the component**

Props: `advancePaymentInfo`, `trackingToken`, `businessSlug`, `businessWhatsapp`, `clientName`, `appointmentDate`, `appointmentTime`, `onSuccess`

States: `step` ('info' | 'submitting' | 'success'), `channel` (null | 'whatsapp' | 'upload')

UI flow:

1. **Info screen**: Large SINPE number (copyable), holder name, amount with discount. Two buttons:
   - "Enviar por WhatsApp" → opens WhatsApp deep link with pre-filled message, then shows "Ya envie mi comprobante" button
   - "Subir comprobante" → file input (image only, max 5MB)
2. **Submitting**: Loading state while API call
3. **Success**: "Comprobante enviado - Pendiente de verificacion" message

SINPE copy button: `navigator.clipboard.writeText(sinpe_phone)` with toast "Numero copiado"

WhatsApp message template:

```
Hola, adjunto comprobante SINPE por mi cita:
- Fecha: {date}
- Hora: {time}
- Monto: ₡{final_price}
- Nombre: {clientName}
```

WhatsApp deep link: `https://wa.me/{businessWhatsapp}?text={encoded_message}`

**Step 2: Commit**

```bash
git add src/components/reservar/advance-payment-submit.tsx
git commit -m "feat(advance-payment): submit component (WhatsApp + upload)"
```

**Step 3: Visual verification** — Playwright screenshot of the full booking flow with advance payment.

---

### Task 10: Owner Dashboard — Payment Badge + Verification

**Files:**

- Modify: `src/components/barber/barber-appointment-card.tsx` (add badge)
- Create: `src/components/barber/advance-payment-verify.tsx` (verification modal)

**Step 1: Add badge to appointment card**

In `barber-appointment-card.tsx`, after the existing completion info badges (around line 320), add:

```tsx
{
  /* Advance Payment Badge */
}
{
  appointment.advance_payment_status === 'pending' && (
    <button
      onClick={() => setShowPaymentVerify(true)}
      className="flex items-center gap-2 py-2 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/30"
    >
      <Smartphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Pago pendiente</span>
    </button>
  )
}
{
  appointment.advance_payment_status === 'verified' && (
    <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
      <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
        Pago verificado ({appointment.discount_pct_snapshot}% off)
      </span>
    </div>
  )
}
```

**Step 2: Create verification modal**

`advance-payment-verify.tsx` — Modal (not Sheet, per design rules) that shows:

- If `proof_channel = 'upload'`: fetch signed URL from `/api/appointments/{id}/payment-proof`, display image
- If `proof_channel = 'whatsapp'`: "Comprobante enviado por WhatsApp"
- Price snapshot info: original price, discount, final price
- Two buttons: `[Verificar]` (green) and `[Rechazar]` (danger variant)
- Both call `POST /api/appointments/{id}/verify-payment` with `{ action: 'verify' | 'reject' }`

**Step 3: Commit**

```bash
git add src/components/barber/barber-appointment-card.tsx src/components/barber/advance-payment-verify.tsx
git commit -m "feat(advance-payment): owner badge + verification modal"
```

**Step 4: Visual verification** — Playwright screenshot of appointment card with payment badge.

---

### Task 11: Email Template — Payment Verified/Rejected

**Files:**

- Create: `src/lib/email/templates/advance-payment-verified.tsx`

**Pattern:** Follow `src/lib/email/templates/appointment-cancelled.tsx`

**Step 1: Create template**

Props: `businessName`, `clientName`, `amount`, `discount`, `verified` (boolean)

Two variants in one template:

- Verified: "Tu pago fue verificado. Descuento de X% aplicado."
- Rejected: "Tu comprobante no pudo ser verificado. Podes enviar otro o pagar en el local."

**Step 2: Commit**

```bash
git add src/lib/email/templates/advance-payment-verified.tsx
git commit -m "feat(advance-payment): email template for verification"
```

---

### Task 12: Supabase Storage Bucket + Cleanup

**Files:**

- Modify: `src/app/api/cron/appointment-reminders/route.ts` (add cleanup section)

**Step 1: Create storage bucket**

In Supabase Dashboard:

- Create bucket `deposit-proofs` (private)
- RLS: restrict to business owners viewing their own files

**Step 2: Add cleanup to daily cron**

In the existing cron route (`appointment-reminders`), add a section after reminders:

```typescript
// === Cleanup old payment proofs (30 days) ===
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

const { data: oldProofs } = await serviceClient
  .from('appointments')
  .select('id, advance_payment_proof_url, business_id')
  .in('advance_payment_status', ['verified', 'rejected'])
  .lt('verified_at', thirtyDaysAgo)
  .not('advance_payment_proof_url', 'is', null)

if (oldProofs?.length) {
  const paths = oldProofs
    .map((p) => {
      // Extract path from URL
      const url = new URL(p.advance_payment_proof_url)
      return url.pathname.split('/deposit-proofs/')[1]
    })
    .filter(Boolean)

  if (paths.length) {
    await serviceClient.storage.from('deposit-proofs').remove(paths)
    // Clear URLs from DB
    for (const proof of oldProofs) {
      await serviceClient
        .from('appointments')
        .update({ advance_payment_proof_url: null } as any)
        .eq('id', proof.id)
    }
  }
}
```

**Step 3: Commit**

```bash
git add src/app/api/cron/appointment-reminders/route.ts
git commit -m "feat(advance-payment): storage cleanup in daily cron"
```

---

### Task 13: Book API — Return Advance Payment Flag

**Files:**

- Modify: `src/app/api/public/[slug]/book/route.ts` (extend response)

**Step 1: Extend booking response**

In the book API, after creating the appointment, check if business has advance payment enabled. If so, include in response:

```typescript
// After appointment creation, add to response:
const advancePaymentEnabled = !!business.advance_payment_enabled

return NextResponse.json({
  // ... existing fields ...
  advance_payment_enabled: advancePaymentEnabled,
})
```

**Step 2: Update BookingSuccess** to receive this flag and skip the extra API call if `advance_payment_enabled = false`.

**Step 3: Commit**

```bash
git add src/app/api/public/[slug]/book/route.ts src/components/reservar/BookingSuccess.tsx
git commit -m "feat(advance-payment): book API returns advance payment flag"
```

---

### Task 14: Integration Testing + Visual Verification

**Steps:**

1. Execute migration 037 in Supabase Dashboard
2. Enable advance payment for test business (Bryan's) via config page
3. Create a test booking and verify:
   - Banner appears on success page
   - SINPE number is correct and copyable
   - WhatsApp flow works (deep link opens)
   - Upload flow works (image uploads)
   - Owner sees "Pago pendiente" badge
   - Verify/reject works
   - Email notifications fire
4. Playwright screenshots at 390px (mobile) and 1280px (desktop)
5. Test edge cases: deadline passed, disabled feature, double submit

**Step 5: Commit any fixes**

---

### Task 15: Release Prep

**Files:**

- Modify: `package.json` (bump version to 0.9.7)
- Modify: `CHANGELOG.md` (add 0.9.7 entry)
- Modify: `RELEASE_NOTES.md` (replace with 0.9.7)

**Step 1: Follow deploy checklist**

Per MEMORY.md Deploy Checklist:

1. Bump version
2. CHANGELOG entry
3. RELEASE_NOTES (user-facing, replaces previous)
4. Commit all 3 together

**Step 2: Squash merge + deploy**

```bash
git checkout main
git merge --squash feature/ui-ux-redesign
git commit -m "feat(v0.9.7): SINPE advance payment"
vercel --prod
git push origin main
```
