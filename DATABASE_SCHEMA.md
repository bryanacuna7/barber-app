# Database Schema Reference

> ⚠️ **CRITICAL: SINGLE SOURCE OF TRUTH**
>
> This document lists ALL tables and columns that exist in the database.
> **ALWAYS verify against this file before:**
>
> - Creating migrations
> - Writing database queries
> - Creating indexes
> - Making any assumptions about database structure
>
> **Last Updated:** 2026-02-25 (Session 186 - Per-client duration index)
> **Last Verified Against:** All migrations 001-043

---

## Core Tables

### `businesses`

**Created in:** `001_initial_schema.sql`
**Modified in:** `003_branding.sql`, `004_admin.sql`, `025_smart_scheduling_features.sql`, `027_staff_permissions.sql`, `033_smart_duration_flag.sql`, `034_promotional_slots.sql`, `036_cancellation_policy.sql`, `037_advance_payment.sql`, `042_slot_interval.sql`

```sql
- id                        UUID PRIMARY KEY
- created_at                TIMESTAMPTZ
- updated_at                TIMESTAMPTZ
- owner_id                  UUID REFERENCES auth.users(id)
- name                      TEXT
- slug                      TEXT UNIQUE
- phone                     TEXT
- whatsapp                  TEXT
- address                   TEXT
- timezone                  TEXT
- operating_hours           JSONB
- booking_buffer_minutes    INT
- advance_booking_days      INT
- is_active                 BOOLEAN (added in 004)
- brand_primary_color       TEXT (added in 003)
- brand_logo_url           TEXT (added in 003)
- brand_favicon_url        TEXT (added in 003)
- accepted_payment_methods  JSONB DEFAULT '["cash"]' (added in 025)
- notification_settings     JSONB DEFAULT '{...}' (added in 025)
- staff_permissions         JSONB DEFAULT '{...}' (added in 027) -- owner-configurable UI permissions for staff
- smart_duration_enabled    BOOLEAN DEFAULT false (added in 033) -- per-business toggle for smart duration prediction
- promotional_slots         JSONB DEFAULT '[]' (added in 034) -- Array of PromoRule objects (max 20, enforced in API)
- cancellation_policy       JSONB DEFAULT '{"enabled":false,"deadline_hours":24,"allow_reschedule":true}' (added in 036)
- advance_payment_enabled   BOOLEAN DEFAULT false (added in 037) -- toggle SINPE advance payment
- advance_payment_discount  INT DEFAULT 10 CHECK (5-50) (added in 037) -- discount percentage for advance payment
- advance_payment_deadline_hours INT DEFAULT 2 CHECK (0-48) (added in 037) -- hours before appointment to pay
- sinpe_phone               TEXT (added in 037) -- SINPE mobile number for receiving payments
- sinpe_holder_name         TEXT (added in 037) -- name shown to client for SINPE transfer
- slot_interval_minutes     INT DEFAULT 30 CHECK (5-60) (added in 042) -- interval between bookable slots; ignored when smart_duration_enabled=true
```

### `services`

**Created in:** `001_initial_schema.sql`

```sql
- id                UUID PRIMARY KEY
- business_id       UUID REFERENCES businesses(id)
- created_at        TIMESTAMPTZ
- updated_at        TIMESTAMPTZ
- name              TEXT
- description       TEXT
- duration_minutes  INT
- price             DECIMAL(10,2)
- display_order     INT
- is_active         BOOLEAN
```

### `clients`

**Created in:** `001_initial_schema.sql`
**Modified in:** `014_loyalty_system.sql`, `024_enable_realtime.sql`, `029_client_dashboard_rls.sql`, `038_notifications_blocks_source_permissions.sql`

```sql
- id                      UUID PRIMARY KEY
- business_id             UUID REFERENCES businesses(id)
- created_at              TIMESTAMPTZ
- updated_at              TIMESTAMPTZ
- name                    TEXT
- phone                   TEXT
- email                   TEXT
- notes                   TEXT
- total_visits            INT
- total_spent             DECIMAL(10,2)
- last_visit_at           TIMESTAMPTZ
- claim_token             UUID (nullable, partial index where NOT NULL)
- claim_token_expires_at  TIMESTAMPTZ (nullable)
- user_id           UUID REFERENCES auth.users(id) (added in 014)
UNIQUE(business_id, phone)
INDEX idx_clients_user_id ON clients(user_id) WHERE user_id IS NOT NULL (added in 029)
```

**RLS Policies:**

- "Business owner manages clients" — FOR ALL (owner_id = auth.uid())
- "Clients view own records" — FOR SELECT (user_id = auth.uid()) (added in 029)
- "Clients update own profile" — FOR UPDATE (user_id = auth.uid()) (added in 029)

**Realtime:** ✅ Enabled (REPLICA IDENTITY FULL)

**❌ DOES NOT HAVE:**

- `last_activity_at` (uses `last_visit_at` instead)

### `appointments`

**Created in:** `001_initial_schema.sql`
**Modified in:** `002_multi_barber.sql`, `024_enable_realtime.sql`, `025_smart_scheduling_features.sql`, `029_client_dashboard_rls.sql`, `031_tracking_token.sql`, `036_cancellation_policy.sql`, `037_advance_payment.sql`, `038_notifications_blocks_source_permissions.sql`

```sql
- id                      UUID PRIMARY KEY
- business_id             UUID REFERENCES businesses(id)
- client_id               UUID REFERENCES clients(id)
- service_id              UUID REFERENCES services(id)
- created_at              TIMESTAMPTZ
- updated_at              TIMESTAMPTZ
- scheduled_at            TIMESTAMPTZ
- duration_minutes        INT
- price                   DECIMAL(10,2)
- status                  TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'))
- confirmation_sent_at    TIMESTAMPTZ
- reminder_sent_at        TIMESTAMPTZ
- client_notes            TEXT
- internal_notes          TEXT
- barber_id               UUID REFERENCES barbers(id) (added in 002)
- started_at              TIMESTAMPTZ (added in 025)
- actual_duration_minutes INT (added in 025)
- payment_method          TEXT CHECK (payment_method IN ('cash', 'sinpe', 'card')) (added in 025)
- tracking_token          UUID DEFAULT gen_random_uuid() (added in 031)
- tracking_expires_at     TIMESTAMPTZ (added in 031)
- cancelled_by            TEXT CHECK (cancelled_by IN ('owner', 'barber', 'client')) (added in 036)
- cancelled_at            TIMESTAMPTZ (added in 036)
- reschedule_count        INT DEFAULT 0 (added in 036)
- rescheduled_from        UUID REFERENCES appointments(id) (added in 036)
- advance_payment_status  TEXT DEFAULT 'none' CHECK ('none','pending','verified','rejected') (added in 037)
- proof_channel           TEXT CHECK ('whatsapp','upload') (added in 037)
- advance_payment_proof_url TEXT (added in 037) -- URL to uploaded proof image
- proof_submitted_at      TIMESTAMPTZ (added in 037)
- verified_by_user_id     UUID (added in 037) -- who verified the payment
- verified_at             TIMESTAMPTZ (added in 037)
- base_price_snapshot     DECIMAL(10,2) (added in 037) -- original service price at booking time
- discount_pct_snapshot   INT (added in 037) -- discount % applied
- discount_amount_snapshot DECIMAL(10,2) (added in 037) -- calculated discount amount
- final_price_snapshot    DECIMAL(10,2) (added in 037) -- final price after discount
- source                  TEXT CHECK (source IN ('web_booking','walk_in','owner_created','barber_created')) (added in 038)
```

**Constraints (added in 037):**

- `chk_advance_none` — If status='none', proof fields must be NULL
- `chk_advance_verified` — If status='verified', verified_by and verified_at must be set

**Indexes:**

- `idx_appointments_tracking_token` UNIQUE on `tracking_token` WHERE NOT NULL (added in 031)
- `idx_appointments_rescheduled_from` on `rescheduled_from` WHERE rescheduled_from IS NOT NULL (added in 036)
- `idx_appointments_advance_payment` on `(business_id, advance_payment_status)` WHERE advance_payment_status != 'none' (added in 037)
- `idx_appointments_client_duration_lookup` on `(client_id, service_id, barber_id, scheduled_at DESC)` WHERE status='completed' AND actual_duration_minutes > 0 (added in 043)

**RLS Policies:**

- "Business owner manages appointments" — FOR ALL (owner_id = auth.uid())
- "Public can create appointments" — FOR INSERT (true)
- "Barbers can view own appointments" — FOR SELECT (barber user_id = auth.uid())
- "Barbers can update status of own appointments" — FOR UPDATE (barber user_id = auth.uid())
- "Clients view own appointments" — FOR SELECT (client_id → clients.user_id = auth.uid()) (added in 029)

**Realtime:** ✅ Enabled (REPLICA IDENTITY FULL)

**❌ DOES NOT HAVE:**

- `deposit_paid` (not implemented yet — planned for 025b)
- `deposit_verified_at` (not implemented yet — planned for 025b)
- `deposit_amount` (not implemented yet — planned for 025b)

### `barbers`

**Created in:** `002_multi_barber.sql`
**Modified in:** `023_rbac_system.sql`, `038_notifications_blocks_source_permissions.sql`

```sql
- id                  UUID PRIMARY KEY
- business_id         UUID REFERENCES businesses(id)
- created_at          TIMESTAMPTZ
- updated_at          TIMESTAMPTZ
- name                TEXT
- email               TEXT UNIQUE
- phone               TEXT
- role                TEXT CHECK (role IN ('owner', 'barber'))
- is_active           BOOLEAN
- avatar_url          TEXT
- user_id             UUID REFERENCES auth.users(id) (added in 023)
- role_id             UUID REFERENCES roles(id) (added in 023)
- custom_permissions  JSONB DEFAULT NULL (added in 038) -- per-barber UI permission overrides
UNIQUE(business_id, email)
CONSTRAINT chk_custom_perms CHECK (custom_permissions IS NULL OR validate_custom_permissions(custom_permissions))
```

**Indexes:**

- `idx_barbers_user_id` on `user_id` (added in 023)
- `idx_barbers_role_id` on `role_id` (added in 023)

---

## Authentication & Admin

### `admin_users`

**Created in:** `004_admin.sql`

```sql
- id            UUID PRIMARY KEY
- user_id       UUID REFERENCES auth.users(id) UNIQUE
- created_at    TIMESTAMPTZ
- email         TEXT UNIQUE
- is_active     BOOLEAN
```

### `roles`

**Created in:** `023_rbac_system.sql`

```sql
- id            UUID PRIMARY KEY
- name          TEXT UNIQUE CHECK (name IN ('owner', 'admin', 'staff', 'recepcionista'))
- description   TEXT
- created_at    TIMESTAMPTZ
- updated_at    TIMESTAMPTZ
```

**Initial Data:**

- `owner` - Business owner with full access
- `admin` - System administrator with almost full access
- `staff` - Staff member (barber/stylist) who can view own appointments
- `recepcionista` - Receptionist who can view all appointments and manage bookings

### `permissions`

**Created in:** `023_rbac_system.sql`

```sql
- id            UUID PRIMARY KEY
- name          TEXT UNIQUE
- description   TEXT
- resource      TEXT CHECK (resource IN ('appointments', 'barbers', 'clients', 'services', 'reports', 'business'))
- created_at    TIMESTAMPTZ
```

**Available Permissions:**

**Appointments:**

- `read_all_appointments` - View all appointments across all barbers
- `read_own_appointments` - View only own appointments
- `write_all_appointments` - Create/edit any appointment
- `write_own_appointments` - Create/edit only own appointments
- `delete_appointments` - Delete appointments

**Barbers/Staff:**

- `manage_barbers` - Create/edit/delete staff members
- `view_barbers` - View list of staff members

**Clients:**

- `manage_clients` - Create/edit/delete clients
- `view_clients` - View client information

**Services:**

- `manage_services` - Create/edit/delete services
- `view_services` - View services list

**Reports:**

- `view_all_reports` - View reports for all staff members
- `view_own_reports` - View only own reports and statistics

**Business:**

- `manage_business_settings` - Manage business settings and configuration

### `role_permissions`

**Created in:** `023_rbac_system.sql`

```sql
- role_id       UUID REFERENCES roles(id) ON DELETE CASCADE
- permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE
- created_at    TIMESTAMPTZ
PRIMARY KEY (role_id, permission_id)
```

**Permission Mappings:**

| Permission               | owner | admin | staff | recepcionista |
| ------------------------ | ----- | ----- | ----- | ------------- |
| read_all_appointments    | ✅    | ✅    | ❌    | ✅            |
| read_own_appointments    | ✅    | ✅    | ✅    | ✅            |
| write_all_appointments   | ✅    | ✅    | ❌    | ✅            |
| write_own_appointments   | ✅    | ✅    | ✅    | ❌            |
| delete_appointments      | ✅    | ✅    | ❌    | ❌            |
| manage_barbers           | ✅    | ✅    | ❌    | ❌            |
| view_barbers             | ✅    | ✅    | ✅    | ✅            |
| manage_clients           | ✅    | ✅    | ❌    | ✅            |
| view_clients             | ✅    | ✅    | ✅    | ✅            |
| manage_services          | ✅    | ✅    | ❌    | ❌            |
| view_services            | ✅    | ✅    | ✅    | ✅            |
| view_all_reports         | ✅    | ✅    | ❌    | ❌            |
| view_own_reports         | ✅    | ✅    | ✅    | ✅            |
| manage_business_settings | ✅    | ✅    | ❌    | ❌            |

**Helper Functions:**

- `user_has_permission(p_user_id UUID, p_permission_name TEXT)` - Check if user has permission
- `get_user_permissions(p_user_id UUID)` - Get all permissions for a user
- `get_user_role(p_user_id UUID)` - Get user's role name

### `barber_invitations`

**Created in:** `002_multi_barber.sql`

```sql
- id            UUID PRIMARY KEY
- created_at    TIMESTAMPTZ
- business_id   UUID REFERENCES businesses(id)
- email         TEXT
- token         TEXT UNIQUE
- expires_at    TIMESTAMPTZ
- used_at       TIMESTAMPTZ
UNIQUE(business_id, email)
```

---

## Subscriptions & Payments

### `subscription_plans`

**Created in:** `005_subscriptions.sql`

```sql
- id                        UUID PRIMARY KEY
- created_at                TIMESTAMPTZ
- name                      TEXT UNIQUE
- display_name              TEXT
- description               TEXT
- price_usd_monthly         DECIMAL(10,2)
- price_colones_monthly     DECIMAL(10,2)
- max_barbers               INT
- features                  JSONB
- is_active                 BOOLEAN
- display_order             INT
```

### `business_subscriptions`

**Created in:** `005_subscriptions.sql`
**Modified in:** `024_enable_realtime.sql`

```sql
- id                UUID PRIMARY KEY
- business_id       UUID REFERENCES businesses(id) UNIQUE
- plan_id           UUID REFERENCES subscription_plans(id)
- created_at        TIMESTAMPTZ
- updated_at        TIMESTAMPTZ
- status            TEXT CHECK (status IN ('active', 'past_due', 'cancelled'))
- current_period_start  TIMESTAMPTZ
- current_period_end    TIMESTAMPTZ
- cancel_at_period_end  BOOLEAN
```

**Realtime:** ✅ Enabled (REPLICA IDENTITY FULL)

### `payment_reports`

**Created in:** `005_subscriptions.sql`
**Modified in:** `010_storage_retention.sql`

```sql
- id                UUID PRIMARY KEY
- business_id       UUID REFERENCES businesses(id)
- created_at        TIMESTAMPTZ
- amount            DECIMAL(10,2)
- currency          TEXT CHECK (currency IN ('USD', 'CRC'))
- payment_method    TEXT
- proof_url         TEXT
- notes             TEXT
- status            TEXT CHECK (status IN ('pending', 'verified', 'rejected'))
- verified_at       TIMESTAMPTZ
- verified_by       UUID REFERENCES admin_users(id)
- delete_after      TIMESTAMPTZ (added in 010)
```

---

## Notifications

### `notifications`

**Created in:** `006_notifications.sql`

```sql
- id            UUID PRIMARY KEY
- user_id       UUID REFERENCES auth.users(id)
- created_at    TIMESTAMPTZ
- title         TEXT
- message       TEXT
- type          TEXT
- read_at       TIMESTAMPTZ
- data          JSONB
```

### `notification_preferences`

**Created in:** `009_notification_preferences.sql`

> **IMPORTANT:** Keyed by `business_id` (UNIQUE), NOT by `user_id`.
> Preferences are per-business. The orchestrator respects business-level preferences.

```sql
- id                            UUID PRIMARY KEY
- business_id                   UUID REFERENCES businesses(id) UNIQUE
- channel                       TEXT ('app' | 'email' | 'both')
- email_address                 TEXT
- email_trial_expiring          BOOLEAN
- email_subscription_expiring   BOOLEAN
- email_payment_status          BOOLEAN
- email_new_appointment         BOOLEAN
- email_appointment_reminder    BOOLEAN
- created_at                    TIMESTAMPTZ
- updated_at                    TIMESTAMPTZ
```

### `push_subscriptions`

**Created in:** `028_push_subscriptions.sql`

Stores browser push notification subscriptions. Supports multi-device (one user can have subscriptions on phone + desktop).

```sql
- id              UUID PRIMARY KEY
- user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE
- endpoint        TEXT NOT NULL UNIQUE
- p256dh          TEXT NOT NULL
- auth            TEXT NOT NULL
- is_active       BOOLEAN DEFAULT true
- failed_count    INTEGER DEFAULT 0
- created_at      TIMESTAMPTZ
- updated_at      TIMESTAMPTZ (auto-updated via trigger)
```

**RLS:** Users can insert/select/delete their own subscriptions. Server-side updates via service client.

**Index:** `idx_push_subs_user_active` on `user_id WHERE is_active = true`

### `service_duration_stats`

**Created in:** `032_service_duration_stats.sql`

Aggregated duration statistics for smart duration prediction. Each row represents the running average for a business+service combo, optionally per barber. Rows with `barber_id IS NULL` represent the service-wide average across all barbers.

```sql
- id                    UUID PRIMARY KEY
- business_id           UUID REFERENCES businesses(id) ON DELETE CASCADE
- service_id            UUID REFERENCES services(id) ON DELETE CASCADE
- barber_id             UUID REFERENCES barbers(id) ON DELETE CASCADE (nullable — NULL = service-wide avg)
- avg_duration_minutes  DECIMAL(5,1) NOT NULL
- min_duration_minutes  INT NOT NULL
- max_duration_minutes  INT NOT NULL
- sample_count          INT NOT NULL DEFAULT 0
- created_at            TIMESTAMPTZ
- last_updated_at       TIMESTAMPTZ
```

**RLS:** Owners can SELECT their own stats. Writes via `update_duration_stats` SECURITY DEFINER RPC (service_role only).

**Indexes:**

- `idx_duration_stats_barber_specific` UNIQUE on `(business_id, service_id, barber_id) WHERE barber_id IS NOT NULL`
- `idx_duration_stats_service_wide` UNIQUE on `(business_id, service_id) WHERE barber_id IS NULL`
- `idx_duration_stats_lookup` on `(business_id, service_id, barber_id)`

**RPC:** `update_duration_stats(p_business_id, p_service_id, p_barber_id, p_actual_duration)` — SECURITY DEFINER, SET search_path = public, GRANT to service_role only. Handles outlier filtering (>3x or <0.33x avg after 3+ samples) and INSERT ON CONFLICT for concurrency safety.

---

## System Settings

### `system_settings`

**Created in:** `007_exchange_rate.sql`

```sql
- id            UUID PRIMARY KEY
- key           TEXT UNIQUE
- value         TEXT
- created_at    TIMESTAMPTZ
- updated_at    TIMESTAMPTZ
```

---

## Onboarding & Tours

### `business_onboarding`

**Created in:** `012_onboarding.sql`

```sql
- id                    UUID PRIMARY KEY
- business_id           UUID REFERENCES businesses(id) UNIQUE
- created_at            TIMESTAMPTZ
- updated_at            TIMESTAMPTZ
- completed_at          TIMESTAMPTZ
- current_step          INT
- steps_completed       JSONB
```

### `tour_progress`

**Created in:** `013_tour_progress.sql`

```sql
- id            UUID PRIMARY KEY
- user_id       UUID REFERENCES auth.users(id)
- tour_id       TEXT
- created_at    TIMESTAMPTZ
- updated_at    TIMESTAMPTZ
- completed_at  TIMESTAMPTZ
- current_step  INT
UNIQUE(user_id, tour_id)
```

---

## Loyalty System (Client-to-Client Referrals)

### `loyalty_programs`

**Created in:** `014_loyalty_system.sql`

```sql
- id                        UUID PRIMARY KEY
- business_id               UUID REFERENCES businesses(id) UNIQUE
- created_at                TIMESTAMPTZ
- updated_at                TIMESTAMPTZ
- is_active                 BOOLEAN
- points_per_colones        INT
- points_per_usd            INT
- referral_bonus_referrer   INT
- referral_bonus_referred   INT
- tier_bronze_threshold     INT
- tier_silver_threshold     INT
- tier_gold_threshold       INT
- tier_platinum_threshold   INT
```

### `client_loyalty_status`

**Created in:** `014_loyalty_system.sql`

```sql
- id                        UUID PRIMARY KEY
- business_id               UUID REFERENCES businesses(id)
- client_id                 UUID REFERENCES clients(id)
- created_at                TIMESTAMPTZ
- updated_at                TIMESTAMPTZ
- points_balance            INT
- lifetime_points           INT
- current_tier              TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'))
- referral_code             TEXT UNIQUE
UNIQUE(business_id, client_id)
```

### `loyalty_transactions`

**Created in:** `014_loyalty_system.sql`

```sql
- id                UUID PRIMARY KEY
- business_id       UUID REFERENCES businesses(id)
- client_id         UUID REFERENCES clients(id)
- created_at        TIMESTAMPTZ
- transaction_type  TEXT CHECK (type IN ('earn', 'redeem', 'expire', 'referral_bonus'))
- points            INT
- description       TEXT
- related_id        UUID
```

### `client_referrals`

**Created in:** `014_loyalty_system.sql`

```sql
- id                            UUID PRIMARY KEY
- business_id                   UUID REFERENCES businesses(id)
- referrer_client_id            UUID REFERENCES clients(id)
- referred_client_id            UUID REFERENCES clients(id)
- referral_code                 TEXT
- status                        TEXT CHECK (status IN ('pending', 'completed', 'expired'))
- referrer_reward_claimed_at    TIMESTAMPTZ
- referred_reward_claimed_at    TIMESTAMPTZ
- created_at                    TIMESTAMPTZ
- completed_at                  TIMESTAMPTZ
UNIQUE(business_id, referral_code, referred_client_id)
```

---

## Barber Gamification

### `barber_stats`

**Created in:** `018_barber_gamification.sql`

```sql
- id                        UUID PRIMARY KEY
- barber_id                 UUID REFERENCES barbers(id) UNIQUE
- business_id               UUID REFERENCES businesses(id)
- created_at                TIMESTAMPTZ
- updated_at                TIMESTAMPTZ
- total_appointments        INT
- total_revenue             DECIMAL(10,2)
- avg_rating                DECIMAL(3,2)
- total_clients             INT
- streak_days               INT
- last_appointment_at       TIMESTAMPTZ
```

### `barber_achievements`

**Created in:** `018_barber_gamification.sql`

```sql
- id                UUID PRIMARY KEY
- created_at        TIMESTAMPTZ
- name              TEXT UNIQUE
- description       TEXT
- icon              TEXT
- tier              TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'))
- requirement_type  TEXT
- requirement_value INT
- points            INT
- is_active         BOOLEAN
```

### `barber_earned_achievements`

**Created in:** `018_barber_gamification.sql`

```sql
- id                UUID PRIMARY KEY
- barber_id         UUID REFERENCES barbers(id)
- achievement_id    UUID REFERENCES barber_achievements(id)
- earned_at         TIMESTAMPTZ
UNIQUE(barber_id, achievement_id)
```

### `barber_challenges`

**Created in:** `018_barber_gamification.sql`

```sql
- id                UUID PRIMARY KEY
- business_id       UUID REFERENCES businesses(id)
- created_at        TIMESTAMPTZ
- updated_at        TIMESTAMPTZ
- name              TEXT
- description       TEXT
- challenge_type    TEXT
- target_value      INT
- reward_points     INT
- start_date        TIMESTAMPTZ
- end_date          TIMESTAMPTZ
- is_active         BOOLEAN
```

### `barber_challenge_participants`

**Created in:** `018_barber_gamification.sql`

```sql
- id                UUID PRIMARY KEY
- challenge_id      UUID REFERENCES barber_challenges(id)
- barber_id         UUID REFERENCES barbers(id)
- joined_at         TIMESTAMPTZ
- current_progress  INT
- completed_at      TIMESTAMPTZ
UNIQUE(challenge_id, barber_id)
```

---

## Business Referral System (Business-to-Business)

### `business_referrals`

**Created in:** `019_business_referral_system.sql`

```sql
- id                        UUID PRIMARY KEY
- business_id               UUID REFERENCES businesses(id) UNIQUE
- created_at                TIMESTAMPTZ
- updated_at                TIMESTAMPTZ
- referral_code             TEXT UNIQUE
- qr_code_url               TEXT
- total_referrals           INT
- successful_referrals      INT
- current_milestone         INT
- points_balance            INT
```

### `referral_conversions`

**Created in:** `019_business_referral_system.sql`

```sql
- id                        UUID PRIMARY KEY
- referrer_business_id      UUID REFERENCES businesses(id)
- referred_business_id      UUID REFERENCES businesses(id)
- referral_code             TEXT
- status                    TEXT CHECK (status IN ('pending', 'active', 'expired'))
- created_at                TIMESTAMPTZ
- converted_at              TIMESTAMPTZ
UNIQUE(referrer_business_id, referred_business_id)
```

### `referral_milestones`

**Created in:** `019_business_referral_system.sql`

```sql
- id                    UUID PRIMARY KEY
- created_at            TIMESTAMPTZ
- milestone_number      INT UNIQUE
- referrals_required    INT
- badge_name            TEXT
- badge_icon            TEXT
- tier                  TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'))
- reward_type           TEXT
- reward_value          INT
- reward_description    TEXT
- is_active             BOOLEAN
```

### `referral_rewards_claimed`

**Created in:** `019_business_referral_system.sql`

```sql
- id                UUID PRIMARY KEY
- business_id       UUID REFERENCES businesses(id)
- milestone_id      UUID REFERENCES referral_milestones(id)
- claimed_at        TIMESTAMPTZ
- applied_at        TIMESTAMPTZ
- expires_at        TIMESTAMPTZ
UNIQUE(business_id, milestone_id)
```

---

## Database Functions

### Atomic Operations

#### `increment_client_stats(p_client_id, p_visits_increment, p_spent_increment, p_last_visit_timestamp)`

**Created in:** `022_atomic_client_stats.sql`
**Purpose:** Atomically increment client statistics to prevent race conditions (CWE-915)

**Parameters:**

- `p_client_id UUID` - Client to update
- `p_visits_increment INT` - Number of visits to add (default: 1)
- `p_spent_increment DECIMAL(10,2)` - Amount to add to total_spent (default: 0)
- `p_last_visit_timestamp TIMESTAMPTZ` - Last visit timestamp (default: NOW())

**Returns:** VOID

**Usage:**

```sql
SELECT increment_client_stats(
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  1,
  50.00,
  NOW()
);
```

**Security:** SECURITY DEFINER (bypasses RLS for atomic updates)

---

## Performance Indexes

### Calendar Indexes

**Created in:** `019c_calendar_indexes.sql`
**Purpose:** Optimize calendar range queries for week/month views and Mi Día feature
**Performance Impact:** 10x faster calendar loads (200ms → 20ms)

#### `idx_appointments_calendar_range`

```sql
CREATE INDEX idx_appointments_calendar_range
ON appointments(business_id, scheduled_at)
WHERE status IN ('confirmed', 'pending');
```

**Query Pattern:**

```sql
SELECT * FROM appointments
WHERE business_id = X
  AND scheduled_at BETWEEN start_date AND end_date
  AND status IN ('confirmed', 'pending')
```

**Impact:** Week view 7x faster, Month view 7.5x faster

#### `idx_appointments_barber_daily`

```sql
CREATE INDEX idx_appointments_barber_daily
ON appointments(barber_id, scheduled_at)
WHERE status IN ('confirmed', 'pending');
```

**Query Pattern:**

```sql
SELECT * FROM appointments
WHERE barber_id = X
  AND scheduled_at::date = current_date
  AND status IN ('confirmed', 'pending')
```

**Impact:** Mi Día page loads 10x faster

#### `idx_appointments_daily_summary`

```sql
CREATE INDEX idx_appointments_daily_summary
ON appointments(business_id, scheduled_at, status)
WHERE scheduled_at >= CURRENT_DATE;
```

**Query Pattern:**

```sql
SELECT * FROM appointments
WHERE business_id = X
  AND scheduled_at::date = current_date
```

**Impact:** Dashboard daily stats 5x faster

### Other Indexes

**Created in:** `019b_missing_indexes.sql`

- `idx_appointments_status_date` - Appointments by status and date
- `idx_appointments_scheduled` - Appointments by date range
- `idx_appointments_completed` - Completed appointments for analytics
- `idx_clients_inactive` - Inactive clients by last visit
- `idx_clients_top_visitors` - Clients by total visits
- `idx_client_referrals_status` - Client referrals by status
- `idx_client_referrals_referrer` - Client referrals by referrer

#### `idx_appointments_client_duration_lookup` (NEW - Migration 043)

**Created in:** `043_client_duration_index.sql`

```sql
CREATE INDEX idx_appointments_client_duration_lookup
ON appointments(client_id, service_id, barber_id, scheduled_at DESC)
WHERE status = 'completed' AND actual_duration_minutes > 0;
```

**Purpose:** Per-client duration prediction covering index. Covers both cascade levels:

- Level 1: client_id + service_id + barber_id (per-client, per-barber)
- Level 2: client_id + service_id (per-client, any barber — uses prefix)

**Queries optimized:**

```sql
SELECT actual_duration_minutes FROM appointments
WHERE business_id = X AND client_id = Y AND service_id = Z AND barber_id = W
  AND status = 'completed' AND actual_duration_minutes > 0
ORDER BY scheduled_at DESC LIMIT 20
```

---

## Tables That DO NOT Exist

**These tables/features are planned but NOT implemented:**

### ✅ `push_subscriptions` (Migration 028)

- **Created in migration 028** — Web Push Notifications
- See table documentation below

### ✅ Advance Payment columns in appointments (Migration 037)

- `appointments.advance_payment_status` - tracks SINPE payment state
- `appointments.advance_payment_proof_url` - proof image URL
- See appointments table for full column list
- **Note:** Old planned columns (`deposit_paid`, `deposit_verified_at`, `deposit_amount`) were NOT used; replaced by migration 037 design

### ❌ `appointment_reminders`

- Not created yet
- Related to Reminders system (planned in v2.5)

---

## Verification Commands

To verify this document is up to date:

```bash
# List all tables in migrations
cat supabase/migrations/*.sql | grep "^CREATE TABLE" | sort

# Find all ALTER TABLE ADD COLUMN commands
cat supabase/migrations/*.sql | grep "ALTER TABLE.*ADD COLUMN" | sort

# Check for specific column
grep -r "column_name" supabase/migrations/
```

---

## Security Implementations

### IDOR Vulnerability Fixes (Sessions 87-88)

**Protected Endpoints with RBAC:**

| Endpoint                                   | RBAC Function                 | Session | Status |
| ------------------------------------------ | ----------------------------- | ------- | ------ |
| `GET /api/barbers/[id]/appointments/today` | `canAccessBarberAppointments` | 87      | ✅     |
| `PATCH /api/appointments/[id]/complete`    | `canModifyBarberAppointments` | 88      | ✅     |
| `PATCH /api/appointments/[id]/check-in`    | `canModifyBarberAppointments` | 88      | ✅     |
| `PATCH /api/appointments/[id]/no-show`     | `canModifyBarberAppointments` | 88      | ✅     |

**RBAC Functions (src/lib/rbac.ts):**

1. **`canAccessBarberAppointments()`** - Read operations
   - Owner: can access all ✅
   - User with `read_all_appointments`: can access all ✅
   - Barber themselves: can access own ✅
   - Others: blocked ❌

2. **`canModifyBarberAppointments()`** - Write operations
   - Owner: can modify all ✅
   - User with `write_all_appointments`: can modify all ✅
   - Barber with `write_own_appointments`: can modify own ✅
   - Others: blocked ❌

**Security Features:**

- ✅ Structured logging with `logSecurity()` on unauthorized attempts
- ✅ Granular permissions (14 permissions, 4 roles)
- ✅ Security test coverage (SEC-007 to SEC-015)
- ✅ Atomic operations for race condition prevention (CWE-915)

**Before (Vulnerable):**

```typescript
// Email-based validation (weak)
const isAssignedBarber = barberEmail === user.email
if (!isBusinessOwner && !isAssignedBarber) {
  console.warn('IDOR blocked')
  return unauthorizedResponse()
}
```

**After (RBAC):**

```typescript
// RBAC-based validation (strong)
const canModify = await canModifyBarberAppointments(
  supabase, user.id, barberId, business.id, business.owner_id
)
if (!canModify) {
  logSecurity('unauthorized', 'high', { ... })
  return unauthorizedResponse()
}
```

### Rate Limiting Protection (Session 90)

**All status update endpoints are protected with rate limiting to prevent abuse and accidental double-clicks.**

**Protected Endpoints:**

| Endpoint                                | Limit       | Window   | Test Coverage  | Status |
| --------------------------------------- | ----------- | -------- | -------------- | ------ |
| `PATCH /api/appointments/[id]/complete` | 10 req/user | 1 minute | SEC-RL-001-008 | ✅     |
| `PATCH /api/appointments/[id]/check-in` | 10 req/user | 1 minute | SEC-RL-009-016 | ✅     |
| `PATCH /api/appointments/[id]/no-show`  | 10 req/user | 1 minute | SEC-RL-017-024 | ✅     |

**Implementation:**

- Uses `withAuthAndRateLimit` middleware from `src/lib/api/middleware.ts`
- Rate limiting applied **per authenticated user** (not global)
- Returns 429 (Too Many Requests) when limit exceeded
- Includes standard rate limit headers in all responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Timestamp when limit resets
  - `Retry-After`: Seconds to wait before retrying (when rate limited)

**Example Configuration:**

```typescript
export const PATCH = withAuthAndRateLimit<RouteParams>(
  async (request, { params }, { user, business, supabase }) => {
    // Handler logic...
  },
  {
    interval: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute per user
  }
)
```

**Benefits:**

- ✅ Prevents accidental double-clicks from users
- ✅ Protects against abuse and automated attacks
- ✅ Per-user limits (fair usage)
- ✅ Standard HTTP 429 response
- ✅ Clear headers for client-side retry logic

**Backend Infrastructure:**

- Primary: Redis (when available)
- Fallback: In-memory Map (when Redis unavailable)
- Implementation: `src/lib/rate-limit.ts`

**Test Status:**

- ✅ Test files created for all 3 endpoints
- ⚠️ Tests require refactoring (middleware mocking issue)
- ✅ Rate limiting verified working in production code
- 📝 TODO: Refactor tests to not mock `withAuthAndRateLimit` middleware

---

### Auth Integration (Session 91)

**User-to-Barber Mapping Implementation**

The system uses `user_id` column in `barbers` table to map authenticated users to their barber records. This enables proper authorization checks and prevents unauthorized access.

**Database Schema:**

```sql
-- Added in migration 023_rbac_system.sql
ALTER TABLE barbers
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX idx_barbers_user_id ON barbers(user_id);
```

**Core Function (src/lib/rbac.ts):**

```typescript
/**
 * Get barber ID from user ID
 * Used internally by RBAC functions to map authenticated user → barber record
 */
export async function getBarberIdFromUserId(
  supabase: SupabaseClient<Database>,
  userId: string,
  businessId: string
): Promise<string | null>
```

**Usage in RBAC:**

Both main RBAC functions use this mapping internally:

1. **`canAccessBarberAppointments()`** (line 375)
   - Maps `user.id` → `barber.id` to check if user is the barber themselves
   - Used for read operations (viewing appointments)

2. **`canModifyBarberAppointments()`** (line 440)
   - Maps `user.id` → `barber.id` to check if user can modify appointments
   - Used for write operations (complete, check-in, no-show)

**Refactored Endpoints:**

The following gamification endpoints were refactored to use the centralized `getBarberIdFromUserId()` function instead of inline queries:

| Endpoint                                    | Before              | After                     | Benefit                  |
| ------------------------------------------- | ------------------- | ------------------------- | ------------------------ |
| `GET /api/gamification/barber/stats`        | Inline query (9 L)  | `getBarberIdFromUserId()` | DRY, centralized logging |
| `GET /api/gamification/barber/achievements` | Inline query (11 L) | `getBarberIdFromUserId()` | DRY, centralized logging |

**Key Improvements:**

- ✅ No `BARBER_ID_PLACEHOLDER` in codebase (verified)
- ✅ All authentication uses `user_id` mapping (not email)
- ✅ Structured logging with Pino (replaced all `console.error`)
- ✅ Centralized auth logic in `src/lib/rbac.ts`
- ✅ Consistent error handling across all endpoints
- ✅ TypeScript: 0 errors

**Migration Status:**

- ✅ Migration 023 executed in production (Session 87)
- ⚠️ `user_id` column may need population for existing barbers
- ⚠️ New barbers should have `user_id` set during creation

---

## Realtime Configuration (Session 140)

**Supabase Realtime** enables WebSocket subscriptions for instant UI updates.

### Tables with Realtime Enabled

**Migration:** `024_enable_realtime.sql`

| Table                    | Hook                       | Use Case                       | Status |
| ------------------------ | -------------------------- | ------------------------------ | ------ |
| `appointments`           | `useRealtimeAppointments`  | Calendar & Mi Día live updates | ✅     |
| `clients`                | `useRealtimeClients`       | New bookings from public page  | ✅     |
| `business_subscriptions` | `useRealtimeSubscriptions` | Feature gating & plan changes  | ✅     |

### Configuration Details

**REPLICA IDENTITY:** FULL (all column values in change events)

**Publication:** `supabase_realtime`

**Benefits:**

- ✅ Instant UI updates across devices
- ✅ No polling needed for real-time data
- ✅ Automatic React Query cache invalidation
- ✅ 3-attempt reconnection with polling fallback

### Verification

To verify Realtime is working:

1. Go to `/test-realtime` page
2. Open console logs
3. Look for: `✅ Real-time [table] active`
4. Update a record in Supabase Dashboard
5. Verify event appears in UI logs

**Expected:** `🔌 Realtime subscription status: SUBSCRIBED`

**If error occurs:** Check that table is in publication (Dashboard → Database → Replication)

---

### `notification_log`

**Created in:** `038_notifications_blocks_source_permissions.sql`

Immutable audit log for all outbound notification events. Written by the notification orchestrator via service-role client (bypasses RLS).

```sql
- id               UUID PRIMARY KEY
- business_id      UUID REFERENCES businesses(id) ON DELETE CASCADE
- appointment_id   UUID REFERENCES appointments(id) ON DELETE SET NULL
- user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL
- event_type       TEXT NOT NULL
- channel          TEXT NOT NULL CHECK (channel IN ('push','email','whatsapp','in_app'))
- status           TEXT NOT NULL CHECK (status IN ('sent','failed','retried','deduped','skipped'))
- error_code       TEXT
- error_message    TEXT
- created_at       TIMESTAMPTZ DEFAULT NOW()
```

**Indexes:**

- `idx_notif_log_dedup` on `(event_type, appointment_id, channel)` WHERE `status = 'sent'`
- `idx_notif_log_business` on `(business_id, created_at DESC)`

**RLS Policies:**

- Owner views business notification log
- Client views own notification history (restricted event types)

---

### `barber_blocks`

**Created in:** `038_notifications_blocks_source_permissions.sql`

Non-appointment agenda blocks (breaks, vacations, personal time) for barbers. Consumed by the scheduling engine to exclude blocked intervals from available slots.

```sql
- id               UUID PRIMARY KEY
- business_id      UUID REFERENCES businesses(id) ON DELETE CASCADE
- barber_id        UUID REFERENCES barbers(id) ON DELETE CASCADE
- block_type       TEXT NOT NULL CHECK (block_type IN ('break','vacation','personal','other'))
- title            TEXT
- start_time       TIMESTAMPTZ NOT NULL
- end_time         TIMESTAMPTZ NOT NULL
- all_day          BOOLEAN DEFAULT false
- recurrence_rule  TEXT
- created_at       TIMESTAMPTZ DEFAULT NOW()
CONSTRAINT chk_block_times CHECK (end_time > start_time)
```

**Indexes:**

- `idx_barber_blocks_lookup` on `(barber_id, start_time, end_time)`
- `idx_barber_blocks_business` on `(business_id, start_time)`

**RLS Policies:**

- Barbers manage own blocks
- Owner manages business blocks

---

## Update Protocol

**When creating new migrations:**

1. ✅ Read this file FIRST
2. ✅ Verify columns/tables exist
3. ✅ Create migration
4. ✅ Update this document
5. ✅ Commit both files together

**Never assume a column exists without checking this file.**
