# Feature 3 Part 1: Client Cancel/Reschedule

**Date:** 2026-02-23
**Status:** Approved
**Approach:** Incremental (Part 1 of 2 — Part 2 is SINPE Deposits)

## Summary

Allow clients to cancel or reschedule their appointments from `/track/[token]` and `/mi-cuenta`. Owners opt-in via Configuracion > Pagos with configurable deadline hours.

## Decisions

| Decision            | Choice                                               | Rationale                     |
| ------------------- | ---------------------------------------------------- | ----------------------------- |
| Default behavior    | Opt-in (no button if owner hasn't enabled)           | Owners control the experience |
| Cancel deadline     | Owner-configurable hours (default 24h)               | Flexible per business         |
| Reschedule limit    | Max 2 per appointment                                | Prevents abuse                |
| Auth mechanism      | Tracking token (extended validity)                   | No login required for clients |
| Status guard        | Only `scheduled` status can be cancelled/rescheduled | Can't cancel in-progress      |
| Promo on reschedule | Recalculated for new time slot                       | Fair pricing                  |
| Rate limiting       | 5 req/min per IP on public endpoints                 | Anti-abuse                    |

## Database — Migration 036

### `businesses` table — new column

```sql
cancellation_policy JSONB DEFAULT '{"enabled": false, "deadline_hours": 24, "allow_reschedule": true}'
```

### `appointments` table — new columns

```sql
cancelled_by TEXT CHECK (cancelled_by IN ('owner', 'barber', 'client'))
cancelled_at TIMESTAMPTZ
reschedule_count INT DEFAULT 0
rescheduled_from UUID REFERENCES appointments(id)
```

### Token expiry extension

Update tracking token generation to set expiry = `scheduled_at + 1 hour` (currently 24h from creation). This ensures the cancel button works until 1h after the appointment time.

## API Endpoints

### `POST /api/public/cancel`

- **Input:** `{ token, reason? }`
- **Auth:** tracking token (no user auth)
- **Validates:**
  - Token valid and not expired
  - Appointment status = `scheduled`
  - Cancellation policy enabled for this business
  - Current time < `scheduled_at - deadline_hours`
- **Action:**
  - Update appointment: `status='cancelled', cancelled_by='client', cancelled_at=now()`
  - Free up the time slot (already happens since availability checks `status != 'cancelled'`)
- **Notifications:**
  - Push to business owner
  - Email to business owner (if preference enabled)
  - In-app notification
  - Confirmation email to client
- **Returns:** `{ success: true, refund_eligible: boolean }` (refund_eligible prepared for Part 2)

### `POST /api/public/reschedule`

- **Input:** `{ token, new_scheduled_at, new_barber_id? }`
- **Auth:** tracking token
- **Validates:**
  - Same as cancel + new slot available
  - `reschedule_count < 2`
  - New time is in the future
- **Action:**
  - Cancel original: `status='cancelled', cancelled_by='client'`
  - Create new appointment with same service/client data
  - Set `rescheduled_from = original.id` on new appointment
  - Increment `reschedule_count` on new appointment (carries over)
  - Generate new tracking token for new appointment
- **Notifications:**
  - Same as cancel but with "Cita reagendada" message
  - Include old and new time in notification
- **Returns:** New appointment data + new tracking token + new tracking URL

### `GET /api/public/cancel-policy/[slug]`

- **Returns:** `{ enabled, deadline_hours, allow_reschedule }`
- **Public, no auth.** Used by UI to show/hide buttons and deadline info.

## UI — Client Side

### `/track/[token]` page

Below the existing status card, add action buttons:

```
┌─────────────────────────────┐
│  Tu cita                    │
│  Corte + Barba              │
│  Lunes 24 Feb, 10:00 AM    │
│  con Carlos                 │
├─────────────────────────────┤
│  [Reagendar]  [Cancelar]    │  ← new
│                             │
│  Podes cancelar hasta 24h   │  ← deadline info
│  antes de tu cita           │
└─────────────────────────────┘
```

- Buttons only show if `cancellation_policy.enabled = true`
- "Reagendar" only shows if `allow_reschedule = true`
- If deadline passed → buttons disabled with "Ya no es posible cancelar/reagendar"
- Cancel → confirmation modal: "Estas seguro? Esta accion no se puede deshacer."
- Reschedule → expand inline date/time picker (reuse `DateTimeSelection` component)

### `/mi-cuenta` page

`LiveQueueCard` gains the same cancel/reschedule buttons for upcoming appointments with status `scheduled`.

## UI — Owner Side

### Configuracion > Pagos

New section at bottom:

```
Politica de cancelacion
───────────────────────
[Toggle] Permitir que clientes cancelen sus citas

  Anticipacion minima: [24] horas
  [Toggle] Permitir reagendamiento
```

### Dashboard notifications

When client cancels/reschedules:

- NotificationBell shows new notification
- Notification message: "Maria Garcia cancelo su cita de Corte (Lun 24 Feb, 10:00)"
- Or: "Maria Garcia reagendo su cita de Corte: Lun 24 → Mar 25, 14:00"

## Notifications Detail

| Event              | Owner Push                        | Owner Email    | Owner In-App | Client Email                          |
| ------------------ | --------------------------------- | -------------- | ------------ | ------------------------------------- |
| Client cancels     | "Maria cancelo Corte (Lun 10:00)" | Same + details | Same         | "Tu cita fue cancelada exitosamente"  |
| Client reschedules | "Maria reagendo Corte: Lun→Mar"   | Same + details | Same         | "Tu cita fue reagendada a [new time]" |

## Security

- Rate limiting: 5 req/min per IP on `/api/public/cancel` and `/api/public/reschedule`
- Token validation via `serviceClient` (bypasses RLS)
- No user auth required — token IS the auth
- Tracking token extended to `scheduled_at + 1h`
- Status guard prevents double-cancel

## Out of Scope (Part 2)

- SINPE deposit collection during booking
- Deposit refund logic on cancellation
- Per-business SINPE phone number config
- Owner deposit verification dashboard

## Files to Create

- `supabase/migrations/036_cancellation_policy.sql`
- `src/app/api/public/cancel/route.ts`
- `src/app/api/public/reschedule/route.ts`
- `src/app/api/public/cancel-policy/[slug]/route.ts`
- `src/components/track/cancel-reschedule-actions.tsx`
- `src/components/settings/cancellation-policy-section.tsx`

## Files to Modify

- `src/app/track/[token]/page.tsx` — add cancel/reschedule actions
- `src/app/(dashboard)/mi-cuenta/page.tsx` — add actions to LiveQueueCard
- `src/app/(dashboard)/configuracion/pagos/page.tsx` — add policy section
- `src/lib/notifications.ts` — add cancel/reschedule notification types
- `src/types/api.ts` — add CancellationPolicy type
- `DATABASE_SCHEMA.md` — update with new columns
