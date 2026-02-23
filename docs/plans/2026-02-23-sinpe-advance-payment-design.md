# SINPE Advance Payment — Design Document

**Date:** 2026-02-23
**Status:** Approved
**Version:** v2 (with audit/security review feedback)

---

## Goal

Allow barbershop owners to offer an optional discount to clients who pay in advance via SINPE. The client sends proof of payment (via WhatsApp or in-app upload), and the owner verifies it. If the client doesn't pay in advance, the appointment proceeds at the regular price.

## Key Decisions

- **Optional for the client** — advance payment is an incentive, not a requirement
- **Comprobante obligatorio** — proof of payment required (photo of SINPE confirmation)
- **Two channels** — WhatsApp deep link or in-app file upload, client chooses
- **Discount incentive** — configurable percentage (5-50%) off service price
- **Configurable deadline** — owner sets how many hours before the appointment advance payment is accepted
- **Price snapshots** — freeze pricing at payment time to prevent inconsistencies

---

## 1. Client Flow

```
Book appointment normally (existing 5-step flow)
  |
  v
Confirmation screen (existing)
  + New banner: "Paga antes y ahorra X%"
  |
  v
Advance Payment Screen (new step, optional)
  - SINPE number (large, copyable)
  - Account holder name
  - Amount with discount applied
  - Two buttons:
    [Enviar por WhatsApp] -> Deep link with pre-filled message
    [Subir comprobante]   -> File input (image upload)
  |
  v
If WhatsApp chosen:
  - Opens WhatsApp with pre-filled message
  - Returns to app -> "Ya envie mi comprobante" button
  - ONLY then status changes to 'pending'
  |
If Upload chosen:
  - Client selects/captures image
  - Upload to Supabase Storage
  - Status changes to 'pending'
  |
  v
Status: "Comprobante enviado - Pendiente de verificacion"
  |
If client doesn't want to pay:
  - Simply closes/skips -> appointment stays at normal price
  - advance_payment_status remains 'none'
```

### Deadline Behavior

- Configurable: 0-48 hours before appointment (default 2h)
- `deadline_hours = 0`: no limit (can pay up until appointment time)
- Past deadline: banner changes to "El plazo para pago anticipado termino"
- No advance payment option shown if deadline has passed

---

## 2. Owner Flow

### Dashboard (Mi Dia / Citas)

```
Appointment card badges:
  - "Pago pendiente" (yellow) — comprobante received, awaiting verification
  - "Pago verificado" (green) — owner approved, discount applied
  - No badge — no advance payment attempted (normal appointment)

Tap on "Pago pendiente" badge:
  If proof_channel = 'upload':
    - Shows proof image (via signed URL)
    - [Verificar] [Rechazar] buttons
  If proof_channel = 'whatsapp':
    - Shows "Comprobante enviado por WhatsApp"
    - [Marcar como pagado] button (confirms amount)
```

### Configuration (Configuracion > Pagos)

New section below existing cancellation policy:

```
Pago Anticipado SINPE
  - Toggle: Enable/disable (default: off)
  - Campo: Numero SINPE del negocio
  - Campo: Nombre del titular
  - Input: Descuento (5-50%, default 10%)
  - Input: Plazo limite (0-48 horas antes, default 2h)
```

---

## 3. Database Schema

### Migration 037: advance_payment

```sql
-- businesses: advance payment configuration
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS advance_payment_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS advance_payment_discount INT DEFAULT 10
    CHECK (advance_payment_discount BETWEEN 5 AND 50),
  ADD COLUMN IF NOT EXISTS advance_payment_deadline_hours INT DEFAULT 2
    CHECK (advance_payment_deadline_hours BETWEEN 0 AND 48),
  ADD COLUMN IF NOT EXISTS sinpe_phone TEXT,
  ADD COLUMN IF NOT EXISTS sinpe_holder_name TEXT;

-- appointments: per-appointment advance payment state
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS advance_payment_status TEXT DEFAULT 'none'
    CHECK (advance_payment_status IN ('none', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS proof_channel TEXT
    CHECK (proof_channel IN ('whatsapp', 'upload')),
  ADD COLUMN IF NOT EXISTS advance_payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS proof_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by_user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS base_price_snapshot DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS discount_pct_snapshot INT,
  ADD COLUMN IF NOT EXISTS discount_amount_snapshot DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS final_price_snapshot DECIMAL(10,2);

-- Consistency constraints
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

-- Index for owner dashboard queries
CREATE INDEX IF NOT EXISTS idx_appointments_advance_payment
  ON appointments(business_id, advance_payment_status)
  WHERE advance_payment_status != 'none';
```

---

## 4. State Machine

```
           submit proof
  none ──────────────────> pending
                              |
                   ┌──────────┼──────────┐
                   |  verify  |  reject  |
                   v          |          v
              verified        |      rejected
              (final)         |          |
                              |  resubmit|
                              <──────────┘
```

### Valid Transitions

| From     | To       | Trigger                    |
| -------- | -------- | -------------------------- |
| none     | pending  | Client submits proof       |
| pending  | verified | Owner approves             |
| pending  | rejected | Owner rejects              |
| rejected | pending  | Client resubmits new proof |

### Invalid Transitions

- `verified -> *` (final state, no changes)
- `none -> verified` (can't verify without proof)
- `none -> rejected` (nothing to reject)

---

## 5. File Security (Supabase Storage)

- **Bucket:** `deposit-proofs` (private, RLS by business_id)
- **Max size:** 5MB
- **Allowed types:** image/jpeg, image/png, image/webp, image/heic
- **File naming:** `{business_id}/{appointment_id}/{uuid}.{ext}` (random, no user input in path)
- **Access:** Signed URLs only (1 hour expiry)
- **RLS:** Only business owner/barbers can view proofs for their business
- **Auto-cleanup:** 30 days after verification/rejection via daily cron

---

## 6. WhatsApp Flow (Standardized)

### Pre-filled Message Template

```
Hola, adjunto comprobante SINPE por mi cita:
- Fecha: {date}
- Hora: {time}
- Monto: {amount}
- Nombre: {client_name}
```

### Flow Control

1. Client taps "Enviar por WhatsApp"
2. WhatsApp opens with pre-filled message (client attaches screenshot)
3. Client returns to app
4. Client taps "Ya envie mi comprobante" -> status becomes `pending`, `proof_channel = 'whatsapp'`
5. If client doesn't confirm, status stays `none` (no phantom pending)

---

## 7. Notifications

| Event            | Recipient | Channels       | Message                                                     |
| ---------------- | --------- | -------------- | ----------------------------------------------------------- |
| Proof submitted  | Owner     | Push + in-app  | "{client} envio comprobante de pago para cita del {date}"   |
| Payment verified | Client    | Email + in-app | "Tu pago fue verificado. Descuento de X% aplicado."         |
| Payment rejected | Client    | Email + in-app | "Tu comprobante no pudo ser verificado. Podes enviar otro." |

---

## 8. Edge Cases

| Scenario                        | Behavior                                                           |
| ------------------------------- | ------------------------------------------------------------------ |
| Client cancels with advance pay | Owner sees "tenia pago anticipado" note. Refund is manual/external |
| Client reschedules              | Advance payment carries over to new appointment                    |
| Owner disables feature          | Existing pending/verified appointments unaffected                  |
| Deadline passes                 | Banner changes, upload/whatsapp buttons disabled                   |
| Double submission               | Replace previous proof (update, don't create new)                  |
| No-show with advance payment    | Same as normal no-show. Advance payment already collected          |
| Price changes after payment     | Snapshots protect original deal. Client pays frozen price          |

---

## 9. API Endpoints

| Method | Path                                    | Purpose                           |
| ------ | --------------------------------------- | --------------------------------- |
| GET    | `/api/public/advance-payment/[slug]`    | Get SINPE details + discount info |
| POST   | `/api/public/advance-payment/submit`    | Submit proof (upload or whatsapp) |
| GET    | `/api/settings/advance-payment`         | Owner: get config                 |
| PUT    | `/api/settings/advance-payment`         | Owner: update config              |
| POST   | `/api/appointments/[id]/verify-payment` | Owner: verify/reject payment      |
| GET    | `/api/appointments/[id]/payment-proof`  | Owner: get signed URL for proof   |

---

## 10. Components

| Component                   | Location                   | Purpose                     |
| --------------------------- | -------------------------- | --------------------------- |
| AdvancePaymentBanner        | `src/components/reservar/` | Post-booking CTA            |
| AdvancePaymentSubmit        | `src/components/reservar/` | Upload/WhatsApp submit flow |
| AdvancePaymentBadge         | `src/components/barber/`   | Badge on appointment cards  |
| AdvancePaymentVerify        | `src/components/barber/`   | Owner verify/reject modal   |
| AdvancePaymentConfigSection | `src/components/settings/` | Config UI in Pagos page     |
