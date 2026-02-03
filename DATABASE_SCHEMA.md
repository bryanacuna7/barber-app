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
> **Last Updated:** 2026-02-03 (Session 72)
> **Last Verified Against:** All migrations 001-022

---

## Core Tables

### `businesses`

**Created in:** `001_initial_schema.sql`
**Modified in:** `003_branding.sql`, `004_admin.sql`

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
**Modified in:** `014_loyalty_system.sql`

```sql
- id                UUID PRIMARY KEY
- business_id       UUID REFERENCES businesses(id)
- created_at        TIMESTAMPTZ
- updated_at        TIMESTAMPTZ
- name              TEXT
- phone             TEXT
- email             TEXT
- notes             TEXT
- total_visits      INT
- total_spent       DECIMAL(10,2)
- last_visit_at     TIMESTAMPTZ
- user_id           UUID REFERENCES auth.users(id) (added in 014)
UNIQUE(business_id, phone)
```

**❌ DOES NOT HAVE:**

- `last_activity_at` (uses `last_visit_at` instead)

### `appointments`

**Created in:** `001_initial_schema.sql`
**Modified in:** `002_multi_barber.sql`

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
```

**❌ DOES NOT HAVE:**

- `deposit_paid` (not implemented yet)
- `deposit_verified_at` (not implemented yet)
- `deposit_amount` (not implemented yet)

### `barbers`

**Created in:** `002_multi_barber.sql`

```sql
- id            UUID PRIMARY KEY
- business_id   UUID REFERENCES businesses(id)
- created_at    TIMESTAMPTZ
- updated_at    TIMESTAMPTZ
- name          TEXT
- email         TEXT UNIQUE
- phone         TEXT
- role          TEXT CHECK (role IN ('owner', 'barber'))
- is_active     BOOLEAN
- avatar_url    TEXT
UNIQUE(business_id, email)
```

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

```sql
- id                            UUID PRIMARY KEY
- user_id                       UUID REFERENCES auth.users(id) UNIQUE
- created_at                    TIMESTAMPTZ
- updated_at                    TIMESTAMPTZ
- email_enabled                 BOOLEAN
- push_enabled                  BOOLEAN
- appointment_reminders         BOOLEAN
- appointment_confirmations     BOOLEAN
- marketing_emails              BOOLEAN
```

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

## Tables That DO NOT Exist

**These tables/features are planned but NOT implemented:**

### ❌ `push_subscriptions`

- Not created in any migration
- Related to Web Push Notifications (Área 5 - not started)

### ❌ `deposits` or deposit-related columns in appointments

- `appointments.deposit_paid` - does not exist
- `appointments.deposit_verified_at` - does not exist
- `appointments.deposit_amount` - does not exist
- Related to Advance Payments (Área 2 - not started)

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

## Update Protocol

**When creating new migrations:**

1. ✅ Read this file FIRST
2. ✅ Verify columns/tables exist
3. ✅ Create migration
4. ✅ Update this document
5. ✅ Commit both files together

**Never assume a column exists without checking this file.**
