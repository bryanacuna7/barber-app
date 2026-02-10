# Post-MVP Roadmap - Feature Expansion

**Project:** BarberApp → Salon Booking Platform
**Version:** Post-MVP (Phases 2-4)
**Date:** 2026-02-03
**Total Estimated:** 387-504 hours (19-25 weeks @ 20h/week)
**Prerequisite:** MVP launched and stable

---

## 📝 OVERVIEW

This document contains ALL features deferred from the MVP. Nothing is lost - it's organized by priority and ROI.

**Total Features Deferred:** 17 major features across 4 priority tiers

**Key Principle:** Ship MVP first (5-6 weeks), then iterate based on user feedback.

---

## 🔥 UX/UI QUICK WINS (NEW - Session 105 Audit)

**Date Added:** 2026-02-04
**Source:** Comprehensive UX/UI audit with UI/UX Pro Max
**Overall UX Score:** 7.8/10 → Target: 9+/10

### Quick Wins Package (12h total) - HIGHEST PRIORITY

**ROI:** 40% UX improvement with minimal effort

**Why This First:**

- Addresses 3 critical user-facing issues
- Quick implementation (1-2 weeks)
- High impact on user satisfaction
- Fixes accessibility violations (WCAG compliance)
- Enables faster feature development (cleaner codebase)

---

#### QW1. Settings Search + Progressive Disclosure (6h)

**Problem:** 825-line settings monolith, users can't find settings

**Implementation:**

**Part 1: Search Bar (3h)**

- [ ] Add Fuse.js fuzzy search (1.5h)
  - Index all settings by: title, description, keywords
- [ ] Cmd+K / Ctrl+K shortcut (1h)
  - Modal overlay with search input
  - Live results as you type
- [ ] Click → navigate to setting + highlight (30min)

**Part 2: Progressive Disclosure (3h)**

- [ ] Hide 60% of advanced settings by default (2h)
  - Show only 8 most-used settings per category
  - "Show advanced" toggle per section
- [ ] Smart defaults to reduce configuration burden (1h)

**Deliverable:** ✅ Users can find settings 10x faster

---

#### QW2. Navigation Accessibility Fixes (2h)

**Problem:** Missing focus rings, no skip links, incomplete aria-labels

**Critical Violations:**

- ❌ Keyboard users can't see focus state
- ❌ No "Skip to content" link (WCAG violation)
- ❌ More button not labeled for screen readers

**Fixes:**

```tsx
// bottom-nav.tsx - Add focus rings
<Link
  className={cn(
    /* existing */,
    'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
  )}
  aria-label={item.name}
>

// More button
<button
  aria-label="More options"
  aria-haspopup="true"
>
```

**Checklist:**

- [ ] Add focus-visible rings to all nav items (30min)
- [ ] Add skip link component (30min)
- [ ] Add aria-labels to icon-only buttons (30min)
- [ ] Test with keyboard navigation (30min)

**Deliverable:** ✅ WCAG 2.1 AA compliant navigation

---

#### QW3. Calendar View Merge (4h)

**Problem:** 5 views confuses users, 953 lines hard to maintain

**Implementation:**

- [ ] Merge List + Calendar → Unified Day view (2h)
  - Keep hourly grid (Calendar)
  - Add list mode toggle
  - Same data, different presentation
- [ ] Reduce state variables 11 → 9 (1h)
- [ ] Update view toggle UI (1h)
  - 5 buttons → 4 buttons
  - New labels: "Day", "Week", "Month", "Timeline"

**Result:**

- 5 views → 4 views
- 953 lines → ~850 lines (11% reduction)
- Simpler mental model for users

**Deliverable:** ✅ Simplified calendar UX

---

### Quick Wins Summary

| Task                         | Hours   | Impact                 | Priority    |
| ---------------------------- | ------- | ---------------------- | ----------- |
| Settings Search + Disclosure | 6h      | HIGH                   | 🔴 Critical |
| Navigation Accessibility     | 2h      | HIGH                   | 🔴 Critical |
| Calendar View Merge          | 4h      | MEDIUM                 | 🟡 High     |
| **TOTAL**                    | **12h** | **40% UX improvement** | ✅ Do First |

**After Quick Wins → Proceed to Tier 1 full refactors**

---

## 🎯 PRIORITY TIERS

### Tier 1: High Priority (Launch Month 2) - 56-83h

**Criteria:** High ROI, user-requested, competitive necessity

1. **Appointment Reminders** (4-6h) - ROI: 30-50% reduction in no-shows
2. **Calendar Views Refinement** (8-10h) - Complete Week/Month mobile views (remaining 8%)
3. **Settings Menu Refactor** (18-23h) - Apple/Linear quality UX
4. **Citas Page Simplification** (26-44h) - Code maintainability (saves 15-20h per future calendar feature)

---

### Tier 2: Medium Priority (Months 3-4) - 78-105h

**Criteria:** Revenue-generating, competitive parity, moderate complexity

5. **Área 2: Advance Payments** (12-16h) - SINPE deposit verification system
6. **Área 5: Push Notifications** (12-16h) - Browser push for appointments
7. **Área 4: Client Referrals** (8-10h) - Referral tracking + rewards
8. **RBAC System** (22-30h) - Role-based access control (Owner, Manager, Staff)
9. **Business Types + Kash** (24-29h) - Multi-vertical support + Kash payments

---

### Tier 3: Low Priority (Months 5-6) - 110-162h

**Criteria:** Market expansion, advanced features, nice-to-have

10. **FASE 2.5: Retention Features** (30-44h)
    - CRM Lite (10-14h)
    - Rebooking Automation (8-12h)
    - WhatsApp Smart Links (4-6h)
    - Variable Service Durations (8-12h)
11. **Extended Testing & QA** (43-55h) - From 80% to full coverage
12. **UX Refinement Sprint** (12-16h) - Dieter Rams polish

---

### Tier 4: Strategic (Months 7-9) - 143-199h

**Criteria:** Long-term positioning, major refactoring, optional

13. **FASE 3: Complete Rebranding** (40-60h) - barber → staff migration
14. **Performance Optimizations** (15-20h) - Redis caching, CDN, optimizations
15. **Security Hardening Phase 2** (16-19h) - Advanced threats
16. **Accessibility Compliance** (12-16h) - WCAG AA certification
17. **API & Integrations** (60-84h) - Public API, Zapier, webhooks

---

## 📋 DETAILED BREAKDOWN

### TIER 1: HIGH PRIORITY (Month 2)

---

#### 1. Appointment Reminders (Week 1) - 4-6h

**ROI:** Reduces no-shows by 30-50% (critical for client satisfaction)

**Why High Priority:**

- Immediate business impact
- Quick to build
- User expectation (competitors have this)

**Implementation:**

- [ ] Database migration (1h)
  ```sql
  ALTER TABLE appointments ADD COLUMN reminder_sent_at TIMESTAMP;
  ALTER TABLE appointments ADD COLUMN reminder_channel TEXT; -- 'email', 'push', 'sms'
  ```
- [ ] Cron job implementation (2-3h)
  - `/api/cron/send-reminders`
  - Logic: Find appointments 24h ahead
  - Filter: Only send if `reminder_sent_at` is NULL
  - Mark: Set `reminder_sent_at` after sending
- [ ] Email template (1h)
  - Subject: "Recordatorio: Tu cita mañana a las {time}"
  - Content: Appointment details + cancellation link
  - CTA: "Confirmar Asistencia" button (optional)
- [ ] Add to vercel.json (30min)
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/send-reminders",
        "schedule": "0 9 * * *"
      }
    ]
  }
  ```

**Testing:**

- [ ] Integration test: Cron finds correct appointments
- [ ] E2E test: Email sent 24h before appointment
- [ ] Edge case: Timezone handling

**Deliverable:** ✅ Automated email reminders 24h before appointments

---

#### 2. Calendar Views Refinement (Week 1) - 8-10h

**Status:** 92% complete (Session 84), only mobile views remaining

**Why High Priority:**

- Desktop Week/Month views done
- Mobile views needed for field staff
- Small effort, high user value

**Remaining Work:**

**Week View Mobile (4-5h):**

- [ ] Day tabs with swipeable navigation (2-3h)
  - Bottom carousel: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  - Swipe left/right to change day
  - Current day highlighted
- [ ] Bottom sheet for appointment details (2h)
  - Tap appointment → slide up details
  - Actions: Edit, Cancel, View Client

**Month View Mobile (4-5h):**

- [ ] Dots instead of pills (2-3h)
  - 1 appointment = 1 dot
  - 3+ appointments = "3 dots + number"
  - Color-coded by status
- [ ] Bottom sheet with day details (2h)
  - Tap date → show all appointments for that day
  - Swipeable between dates
  - Pull to refresh

**Testing:**

- [ ] E2E test: Mobile Week view navigation
- [ ] E2E test: Mobile Month view tap interactions
- [ ] Responsive test: Tablet views

**Deliverable:** ✅ Full calendar system (5 views, mobile + desktop)

---

#### 3. Settings Menu Refactor (Weeks 2-3) - 18-23h

> ⚠️ **PREREQUISITE:** Complete QW1 (Settings Search) first for quick impact
>
> **Alternative:** If time-constrained, QW1 alone provides 60% of the value in 33% of the time (6h vs 18-23h)

**Why High Priority:**

- Current: 825-line monolith (hard to maintain)
- User feedback: "Can't find settings"
- Competitive: Apple/Linear quality expected
- **Audit Finding:** No search, no progressive disclosure (Session 105)

**Implementation:**

**Phase 1: Foundation (4-5h)**

- [ ] Sidebar layout structure (2h)
  - Left sidebar: Category list
  - Right panel: Settings content
  - Breadcrumb navigation
- [ ] Mobile card grid (2-3h)
  - 7 category cards
  - Icon + title + description
  - Tap → full-screen settings page

**Phase 2: Migrate Settings (6-8h)**

- [ ] Extract 7 category pages from monolith (6-8h)
  1. **Negocio** (business details, hours, location)
  2. **Reservaciones** (booking rules, buffers, cancellation policy)
  3. **Equipo** (staff management, permissions)
  4. **Pagos** (SINPE config, subscription management)
  5. **Notificaciones** (email templates, push settings)
  6. **Integraciones** (future: Zapier, webhooks)
  7. **Avanzado** (danger zone: delete business, export data)
- [ ] Create reusable SettingsSection component (included in 6-8h)
  ```tsx
  <SettingsSection title="Business Hours" description="When clients can book">
    <HoursEditor />
  </SettingsSection>
  ```

**Phase 3: Search Functionality (3-4h)**

- [ ] Fuse.js fuzzy search integration (2h)
  - Index all settings by: title, description, keywords
  - Search UI: Cmd+K / Ctrl+K shortcut
- [ ] Search results UI (1-2h)
  - Show matching settings
  - Click → navigate to setting + highlight
- [ ] Security: Input sanitization (XSS prevention)

**Phase 4: Progressive Disclosure (2-3h)**

- [ ] Hide 80% of advanced settings by default (2-3h)
  - Show only most-used 8 settings per category
  - "Show advanced" toggle
  - Smart defaults to reduce configuration burden

**Phase 5: Security (4h) ⚠️ CRITICAL**

- [ ] CSRF protection for all settings forms (2h)
- [ ] Server-side validation for all inputs (1h)
- [ ] Rate limiting on save endpoints (30min)
- [ ] Audit log for sensitive changes (1h)
  - Track: Payment config changes
  - Track: Business hours changes
  - Track: Staff permission changes

**Testing:**

- [ ] E2E test: Search finds settings
- [ ] E2E test: Save settings (all 7 categories)
- [ ] Security test: CSRF attack blocked

**Deliverable:** ✅ World-class settings menu (Apple/Linear quality)

---

#### 4. Citas Page Simplification (Weeks 3-5) - 26-44h

> ⚠️ **PREREQUISITE:** Complete QW3 (Calendar View Merge) first for quick impact
>
> **Alternative:** If time-constrained, QW3 alone provides 25% of the value in 15% of the time (4h vs 26-44h)

**Why High Priority:**

- ROI: Saves 15-20h per future calendar feature
- Code quality: 953 lines → ~300 lines (67% reduction)
- Maintainability: 5 views → 3 views (simpler)
- DX: Adds granular drag-drop (15-min intervals)
- **Audit Finding:** 953 lines, 5 views confuses users (Session 105)

**Full Plan:** See [CITAS_PAGE_SIMPLIFICATION.md](./CITAS_PAGE_SIMPLIFICATION.md) (42 pages)

**Quick Summary:**

**Phase 1: Quick Wins (8-12h) - Week 3**

- [ ] Merge List + Calendar views into unified Day view (3-4h)
- [ ] Merge Calendar + Timeline into Day view variants (2-3h)
- [ ] Reduce state variables from 11 → 7 (2-3h)
- [ ] Mobile/Desktop consolidation (1-2h)

**Result:** 5 views → 3 views, 953 lines → ~750 lines

**Phase 2: Architecture (15-20h) - Week 4**

- [ ] Create Zustand store for shared state (4-5h)
- [ ] Split into route-based pages (6-8h)
  - `/citas` → Day view (default)
  - `/citas/week` → Week view route
  - `/citas/month` → Month view route
- [ ] **NEW: Granular Drag-Drop (3-4h)**
  - 15-minute time slot intervals (Google Calendar parity)
  - Visual time indicator during drag
  - Backend minute-level precision
- [ ] Migrate components to use store (2-3h)

**Result:** 750 lines → ~450 lines, clean architecture

**Phase 3: Polish (8-12h) - Week 5**

- [ ] Simplify keyboard shortcuts (2-3h)
- [ ] Optimize memoization (2-3h)
- [ ] Final testing + documentation (4-6h)

**Result:** ~300-350 lines main component, maintainable, fast

**Deliverables:**

- ✅ 67% code reduction (953 → ~300 lines)
- ✅ 15-minute drag-drop precision
- ✅ Route-based architecture (scalable)
- ✅ Zustand store (no prop drilling)
- ✅ 15-20h faster development for future features

---

### TIER 2: MEDIUM PRIORITY (Months 3-4)

---

#### 5. Área 2: Advance Payments (Weeks 1-2) - 12-16h

**ROI:** Reduces no-shows by 60-80% (for no-show-prone clients)

**Implementation:**

**Backend: Deposit Verification Flow (4-5h)**

- [ ] Database migration (1h)
  ```sql
  ALTER TABLE appointments ADD COLUMN deposit_required BOOLEAN DEFAULT FALSE;
  ALTER TABLE appointments ADD COLUMN deposit_paid BOOLEAN DEFAULT FALSE;
  ALTER TABLE appointments ADD COLUMN deposit_proof_url TEXT;
  ALTER TABLE appointments ADD COLUMN deposit_verified_at TIMESTAMP;
  ```
- [ ] API: Upload proof endpoint (2h)
  - `/api/appointments/[id]/deposit/upload`
  - Supabase Storage integration
  - Generate signed URL
- [ ] API: Admin verification endpoint (1-2h)
  - `/api/appointments/[id]/deposit/verify`
  - Set `deposit_paid = true` OR reject
  - Send email notification

**Frontend: Upload Proof UI (4-5h)**

- [ ] Public booking page: Deposit info (1h)
  - Show SINPE number
  - "Deposit ₡5,000 required" message
  - Upload button after booking
- [ ] Upload modal (2h)
  - Drag-drop image upload
  - Preview before submit
  - Success confirmation
- [ ] Admin dashboard: Verification queue (1-2h)
  - List of pending deposits
  - View proof image
  - Approve/Reject buttons

**Cron Job: Auto No-Show Detection (2-3h)**

- [ ] `/api/cron/detect-no-shows` (1-2h)
  - Find appointments: past + `deposit_paid = false`
  - Mark as no-show
  - Update client stats
- [ ] Schedule in vercel.json (30min)
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/detect-no-shows",
        "schedule": "0 * * * *"
      }
    ]
  }
  ```

**Email: Rejection Notifications (2-3h)**

- [ ] Template: Deposit rejected email (1h)
- [ ] Template: No-show notification email (1-2h)

**Testing:**

- [ ] E2E test: Full deposit workflow
- [ ] Integration test: Auto no-show detection
- [ ] Edge case: Deposit uploaded after no-show

**Deliverable:** ✅ SINPE deposit system with verification dashboard

---

#### 6. Área 5: Web Push Notifications (Weeks 3-4) - 12-16h

**ROI:** Increases engagement by 40-60%

**Implementation:**

**VAPID Keys Setup (1-2h)**

- [ ] Generate VAPID keys (30min)
  ```bash
  npx web-push generate-vapid-keys
  ```
- [ ] Store in environment variables (30min)
  ```
  NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
  VAPID_PRIVATE_KEY=...
  ```

**Service Worker Registration (4-5h)**

- [ ] Create service worker file (2h)
  - File: `public/sw.js`
  - Listen for push events
  - Show notification with custom data
  - Handle notification click (navigate to appointment)
- [ ] Register service worker (1-2h)
  - In `_app.tsx` or layout
  - Request notification permission
  - Subscribe to push service
- [ ] Handle subscription (1h)
  - Send subscription to backend
  - Store in database

**Push Subscription Management (3-4h)**

- [ ] Database migration (30min)
  ```sql
  CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] API: Subscribe endpoint (1-2h)
  - `/api/push/subscribe`
  - Store subscription
- [ ] API: Unsubscribe endpoint (1h)
  - `/api/push/unsubscribe`
- [ ] Admin UI: Notification preferences (1h)
  - Toggle: Enable/disable push
  - Categories: Appointments, Reminders, Promotions

**Notification Sending API (4-5h)**

- [ ] Library integration (1h)
  - Install: `web-push` npm package
- [ ] Send notification helper (2-3h)
  ```typescript
  async function sendPushNotification(
    userId: string,
    notification: {
      title: string
      body: string
      icon?: string
      data?: any
    }
  ) {
    const subscriptions = await getUserSubscriptions(userId)
    for (const sub of subscriptions) {
      await webpush.sendNotification(sub, JSON.stringify(notification))
    }
  }
  ```
- [ ] Integrate with appointment reminders (1-2h)
  - In `/api/cron/send-reminders`
  - Send email + push notification

**Testing:**

- [ ] E2E test: Subscribe to notifications
- [ ] E2E test: Receive notification
- [ ] Edge case: Expired subscription

**Deliverable:** ✅ Browser push notifications for appointments

---

#### 7. Área 4: Client Referrals (Week 5) - 8-10h

**ROI:** 15-25% of new clients from referrals (organic growth)

**Implementation:**

**Referral Tracking Database (2-3h)**

- [ ] Database migration (1-2h)

  ```sql
  CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    reward_earned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  ALTER TABLE clients ADD COLUMN referral_code TEXT UNIQUE;
  ```

- [ ] Generate referral codes (1h)
  - Function: `generateReferralCode()` (8 characters, alphanumeric)
  - Assign to all existing clients

**Unique Referral Codes (2-3h)**

- [ ] API: Get referral code (1h)
  - `/api/clients/me/referral-code`
  - Return code + shareable link
- [ ] API: Apply referral code (1-2h)
  - `/api/referrals/apply`
  - Validate code
  - Link referrer and referred
  - Award reward if conditions met

**Rewards System (2-3h)**

- [ ] Define reward tiers (30min)
  ```typescript
  const REWARDS = {
    referrer: {
      bonus_credits: 500, // ₡500 credit
      minimum_appointments: 1, // Referred must complete 1 appointment
    },
    referred: {
      discount: 0.1, // 10% off first appointment
    },
  }
  ```
- [ ] API: Award rewards (1-2h)
  - Trigger: Referred completes first appointment
  - Action: Add credits to referrer account
  - Email: Notify both parties
- [ ] Frontend: Credits display (1h)
  - Show credits in profile
  - Apply credits at checkout

**Dashboard for Tracking (2-3h)**

- [ ] Admin page: `/dashboard/referrals` (2-3h)
  - Leaderboard: Top referrers
  - Stats: Total referrals, conversion rate
  - Filters: Date range, referrer

**Testing:**

- [ ] Integration test: Apply referral code
- [ ] Integration test: Award rewards
- [ ] E2E test: Full referral flow

**Deliverable:** ✅ Client-to-client referral program

---

#### 8. RBAC System (Weeks 6-8) - 22-30h

**ROI:** Essential for businesses with >5 staff (60% of target market)

**Implementation:**

**Phase 1: Database + RLS Policies (10-12h)**

- [ ] Create `roles` table (2h)
  ```sql
  CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    permissions JSONB NOT NULL,
    is_system_role BOOLEAN DEFAULT FALSE,
    business_id UUID REFERENCES businesses(id),
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] Seed 6 system roles (2h)
  - Owner (all permissions)
  - Manager (read/write most)
  - Staff (read/write own)
  - Receptionist (read all, write bookings)
  - Limited Staff (read own only)
  - Accountant (read reports only)
- [ ] Add role columns to barbers (1h)
  ```sql
  ALTER TABLE barbers ADD COLUMN role_id UUID REFERENCES roles(id);
  ALTER TABLE barbers ADD COLUMN permission_overrides JSONB;
  ```
- [ ] Create 50+ RLS policies (5-7h)
  - Appointments (read_all, read_own, create, update, delete)
  - Clients (read, create, update, delete, export)
  - Staff (read, create, update, delete, assign_role)
  - Finance (read_reports, read_all_reports)
  - Services, Settings, Reports

**Phase 2: Backend Logic (8-10h)**

- [ ] Permission checking library (3-4h)

  ```typescript
  async function hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await getUser(userId)
    const role = await getRole(user.role_id)

    // Check permission overrides first
    if (user.permission_overrides?.[permission] !== undefined) {
      return user.permission_overrides[permission]
    }

    // Check role permissions
    return role.permissions[permission] === true
  }
  ```

- [ ] Wildcard support for Owner (1h)
  - Owner role: `{ "*": true }`
- [ ] Permission override logic (1-2h)
  - Allow/deny specific permissions per user
- [ ] Middleware: `withPermission()` wrapper (1-2h)
  ```typescript
  export function withPermission(permission: string) {
    return async (req, res) => {
      const allowed = await hasPermission(req.user.id, permission)
      if (!allowed) {
        return res.status(403).json({ error: 'Forbidden' })
      }
      // Continue...
    }
  }
  ```
- [ ] **Security: Role hierarchy enforcement (2-3h)** ⚠️ CRITICAL
  - Manager CANNOT assign Owner role
  - Staff CANNOT modify their own permissions
  - Permission escalation audit log

**Phase 3: Frontend UI (6-8h)**

- [ ] Role management page (3-4h)
  - List roles
  - Create custom role
  - Edit role permissions (checkboxes)
- [ ] Role selector component (1-2h)
  - Dropdown with role descriptions
  - Show inherited permissions
- [ ] Permission override modal (2h)
  - Per-user permission toggles
  - Visual diff from role defaults
- [ ] Permission guard component (1h)
  ```tsx
  <RequirePermission permission="appointments.delete">
    <DeleteButton />
  </RequirePermission>
  ```

**Phase 4: Testing (2-3h)**

- [ ] Unit tests for permission checking (1h)
- [ ] E2E tests for role assignment (1h)
- [ ] Security tests for privilege escalation (1h)

**Deliverable:** ✅ Enterprise-grade RBAC system with 6 predefined roles

---

#### 9. Business Types + Kash (Weeks 9-10) - 24-29h

**ROI:** Expands market from 1 vertical (barbershops) to 22 verticals

**⚠️ DEPENDENCY:** Requires Área 3 (barber → staff migration) to be completed first

**Implementation:**

**Part 1: Business Type System (12-15h)**

- [ ] Database migration (1h)
  ```sql
  ALTER TABLE businesses ADD COLUMN business_type TEXT;
  ALTER TABLE businesses ADD COLUMN staff_term TEXT DEFAULT 'Barber';
  ALTER TABLE businesses ADD COLUMN staff_term_es TEXT DEFAULT 'Barbero';
  ```
- [ ] Curated business types definitions (2-3h)
  - **Beauty & Personal Care (7 types)**
    - Barbershop, Hair Salon, Nail Salon, Spa, Tattoo Studio, Massage Therapy, Lash Extensions
  - **Health & Wellness (6 types)**
    - Dentist, Chiropractor, Physical Therapy, Acupuncture, Nutritionist, Mental Health
  - **Fitness & Sports (7 types)**
    - Personal Training, Yoga Studio, Pilates, CrossFit, Martial Arts, Dance Studio, Sports Coaching
  - **Education (2 types)**
    - Tutoring, Music Lessons
- [ ] Default presets per type (4-5h)
  - Staff term overrides (e.g., "Trainer" for gym, "Therapist" for spa)
  - Default services with typical durations/prices
  - Operating hours templates
  - Booking buffer defaults
- [ ] Onboarding: Business type selection step (3-4h)
  - Step 1: Select industry
  - Step 2: Select specific business type
  - Step 3: Preview presets
  - Step 4: Customize (optional)
- [ ] **Security: Preset validation (3h)** ⚠️ NEW
  - Zod schema validation
  - Whitelist business types (prevent injection)
  - Sanitize user-provided preset data

**Part 2: Kash Payment Integration (8-10h)**

- [ ] Database migration (1h)

  ```sql
  ALTER TABLE system_settings ADD COLUMN kash_details JSONB;
  -- Example: { "phone": "88887777", "account_name": "Salon Pro" }

  ALTER TABLE payment_reports ADD COLUMN payment_method TEXT; -- 'sinpe', 'kash', 'cash', 'card'
  ```

- [ ] Kash configuration UI (3-4h)
  - Admin settings page
  - Phone number field (validation: 8 digits)
  - Kash account name
  - Enable/disable toggle
  - Preview: How clients see Kash info
- [ ] Update payment forms (2-3h)
  - Public booking page: Add Kash option
  - Radio buttons: SINPE vs Kash
  - Show Kash instructions if selected
  - Upload proof (same as SINPE flow)
- [ ] Payment reporting (2-3h)
  - Track Kash vs SINPE vs other
  - Admin dashboard: Payment breakdown chart
  - Filters: Date range, payment method

**Part 3: Testing (4h)**

- [ ] E2E test: Onboarding with different business types
- [ ] E2E test: Kash payment reporting
- [ ] Security test: Preset injection attempts

**Deliverable:** ✅ 22+ business verticals supported, Kash payment method

---

### TIER 3: LOW PRIORITY (Months 5-6)

---

#### 10. FASE 2.5: Retention Features (Weeks 1-4) - 30-44h

**ROI:** +25-40% client retention (long-term revenue)

**10.1: CRM Lite (Week 1) - 10-14h**

**Database (2-3h):**

- [ ] Migration: Add to `clients` table
  ```sql
  ALTER TABLE clients ADD COLUMN birthday DATE;
  ALTER TABLE clients ADD COLUMN tags TEXT[];
  ALTER TABLE clients ADD COLUMN preferences JSONB;
  ALTER TABLE clients ADD COLUMN notes JSONB[];
  -- notes format: [{ text: "...", created_at: "...", created_by: "..." }]
  ```
- [ ] Indexes for birthday campaigns
  ```sql
  CREATE INDEX idx_clients_birthday ON clients(birthday);
  ```

**Backend (3-4h):**

- [ ] CRUD APIs for tags (1-2h)
  - `/api/clients/[id]/tags` (GET, POST, DELETE)
- [ ] Notes API with timestamps (1h)
  - `/api/clients/[id]/notes` (GET, POST)
- [ ] Preferences API (1h)
  - `/api/clients/[id]/preferences` (GET, PUT)
  - Structured data: preferred staff, service preferences, special requests
- [ ] Birthday query endpoint (1h)
  - `/api/clients/birthdays?month=2`
  - For birthday campaigns

**Frontend (5-7h):**

- [ ] Client profile page enhancements (3-4h)
  - Birthday picker component
  - Tag selector (autocomplete, add new tags)
  - Preferences form (checkboxes + text inputs)
  - Notes timeline (chronological display)
- [ ] Quick-add tags from appointment view (1-2h)
  - During/after appointment: "Add tag" button
  - Common tags: VIP, Sensitive scalp, Allergic to X
- [ ] Birthday reminder dashboard (1-2h)
  - Admin page: Upcoming birthdays (next 30 days)
  - Bulk action: Send birthday emails

**Deliverable:** ✅ Rich client profiles with tags, birthday, preferences, notes

---

**10.2: Rebooking Automation (Week 2) - 8-12h**

**Database (1h):**

- [ ] Migration: Add `rebooking_email_sent_at` to appointments

**Cron Job (3-4h):**

- [ ] `/api/cron/send-rebooking-reminders`
  - Logic: Find completed appointments 7 days ago
  - Filter: Only send if client hasn't rebooked
  - Tracking: Mark emails sent
- [ ] Schedule in vercel.json

**Email Template (2-3h):**

- [ ] "Time for your next appointment!" email
  - Include preferred staff member
  - Deep link to booking page with staff pre-selected
  - One-click "Book Now" button
  - Personalization: Last service, custom message

**Frontend (2-3h):**

- [ ] Admin toggle: Enable/disable rebooking emails
- [ ] Configure: Days after appointment (default 7)
- [ ] Analytics: Rebooking conversion rate
  - Track: Emails sent, links clicked, bookings made

**Testing (2h):**

- [ ] Integration test: Cron job logic
- [ ] E2E test: Email sent after 7 days

**Deliverable:** ✅ Automated rebooking email campaign

---

**10.3: WhatsApp Smart Links (Week 3) - 4-6h**

**Backend (2-3h):**

- [ ] Generate WhatsApp click-to-chat URLs (1-2h)
  ```
  https://wa.me/50688887777?text=Hola!%20Quiero%20reservar...
  ```
- [ ] Template messages for different contexts (1h)
  - General booking inquiry
  - Specific service inquiry
  - Rescheduling request
  - Cancellation request

**Frontend (2-3h):**

- [ ] Add WhatsApp button to public booking page (1h)
  - Floating button: "Reservar por WhatsApp"
  - Generates pre-filled message
- [ ] Add to client confirmation emails (30min)
  - "Questions? WhatsApp us" link
- [ ] Add to appointment reminders (30min)
- [ ] Mobile: Deep link to WhatsApp app (1h)
  - Detect mobile device
  - Use `whatsapp://` scheme

**Deliverable:** ✅ WhatsApp integration for client communication

---

**10.4: Variable Service Durations (Week 4) - 8-12h**

**Database (2-3h):**

- [ ] Migration: Refactor `services` table

  ```sql
  -- Before: Single duration/price
  -- ALTER TABLE services DROP COLUMN duration_minutes;
  -- ALTER TABLE services DROP COLUMN price;

  -- After: Multiple options
  ALTER TABLE services ADD COLUMN duration_options JSONB;
  -- Example: [
  --   { duration: 20, price: 12, label: "Básico" },
  --   { duration: 30, price: 15, label: "Premium", default: true },
  --   { duration: 45, price: 25, label: "Deluxe" }
  -- ]
  ```

- [ ] Data migration script (1h)
  - Convert existing single duration/price to array

**Backend (3-4h):**

- [ ] Service API: Support duration options (1-2h)
  - `/api/services/[id]` - Return duration_options array
- [ ] Booking API: Accept selected duration (1-2h)
  - Validate: Ensure selected duration exists
  - Store: Save selected duration_option_index
- [ ] Calendar logic: Handle variable durations (1h)
  - Available slots calculation with different durations

**Frontend (3-5h):**

- [ ] Service creation: Multiple duration/price pairs (2-3h)
  - Add/remove duration options
  - Set default option (radio button)
  - Validation: At least 1 option required
- [ ] Booking flow: Duration selector (1-2h)
  - Radio buttons with prices
  - Highlight default option
  - Update total price dynamically

**Deliverable:** ✅ Services with multiple pricing tiers

---

#### 11. Extended Testing & QA (Weeks 5-7) - 43-55h

**Goal:** Increase coverage from 80% (MVP) to full coverage

**Remaining Test Areas:**

**API Routes (16-20h):**

- [ ] Full coverage for 59 API routes
  - Currently: 30/59 routes tested (MVP covered critical ones)
  - Add: 29 remaining routes
  - Edge cases: Invalid inputs, boundary conditions

**Cron Jobs Integration Tests (10-12h):**

- [ ] Auto no-show detection with timezone handling
- [ ] Data retention with edge cases
- [ ] Reminder sending with multiple channels
- [ ] Rebooking reminders with filters

**Payment Flow E2E Tests (8-10h):**

- [ ] Complete deposit workflow (Playwright)
- [ ] Rejection and retry flows
- [ ] No-show detection end-to-end
- [ ] Kash payment flow

**Feature Gating Tests (4-5h):**

- [ ] Verify Basic vs Pro restrictions
- [ ] Grace period edge cases
- [ ] Subscription expiration handling

**CI/CD Enhancements (5-8h):**

- [ ] Playwright in CI (debug flaky tests)
- [ ] Coverage reporting (Codecov integration)
- [ ] Performance regression tests (Lighthouse CI)

**Deliverable:** ✅ 90%+ code coverage, all features tested

---

#### 12. UX Refinement Sprint (Week 8) - 12-16h

**Goal:** Apply Dieter Rams principles for production polish

**Simplify Calendar Views (2-3h):**

- [ ] Reduce 5 views → 3 primary views
  - Day (detailed hour grid)
  - Week (7-day overview)
  - Month (calendar view)
  - List/Timeline as secondary modes
- [ ] Hide Timeline view behind "More views" menu

**Progressive Disclosure (4-5h):**

- [ ] Settings: Show only 8 most-used settings by default
- [ ] "Show advanced" toggles for rarely-used options
- [ ] Booking flow: Fewer fields per step

**Empty States (2-3h):**

- [ ] Design 7 empty states:
  - No appointments (suggest creating one)
  - No clients (import or add first client)
  - No services (quick setup wizard)
  - No staff (invite team member)
  - No notifications (enable push)
  - No reports (need more data)
  - No referrals (share link to start)

**Keyboard Navigation (3-4h):**

- [ ] Calendar: Arrow keys to navigate dates
- [ ] Settings: Tab order optimization
- [ ] Modals: Escape to close, Enter to submit
- [ ] Search: Cmd+K / Ctrl+K shortcuts

**Micro-interactions (1-2h):**

- [ ] Button hover states (subtle shadow)
- [ ] Success animations (checkmark fade-in)
- [ ] Loading states (skeleton screens)
- [ ] Error shake animations

**Deliverable:** ✅ Polished UX matching Apple/Linear quality standards

---

### TIER 4: STRATEGIC (Months 7-9)

---

#### 13. FASE 3: Complete Rebranding (Weeks 1-3) - 40-60h

**Decision:** Full migration (NOT hybrid approach)

**Why this takes 40-60h:**

- Rename core entity across ~13,817 TypeScript files
- Update 59 API routes
- Migrate database table
- Update all UI text
- Maintain backward compatibility with views

**Week 1: Database Migration (14-18h)**

- [ ] Create new `staff` table (identical schema to `barbers`) (4-5h)
- [ ] Create migration script to copy data (3-4h)
- [ ] Create database views for backward compatibility (2-3h)
  ```sql
  CREATE VIEW barbers AS SELECT * FROM staff;
  ```
- [ ] Update foreign keys progressively (3-4h)
- [ ] Add indexes to new table (1h)
- [ ] Test migration in staging (1-2h)

**Week 2: Codebase Migration (26-42h)**

- [ ] Update TypeScript types (4-6h)
  - `database.ts`: barbers → staff
  - All import statements
- [ ] Update API routes (12-18h)
  - `/api/barbers/*` → `/api/staff/*`
  - Create redirects for backward compatibility
- [ ] Update frontend components (8-12h)
  - All UI text: "Barbero" → "Profesional"
  - English: "Barber" → "Staff Member"
  - Form labels, buttons, headers
- [ ] Update documentation (2-3h)
  - DATABASE_SCHEMA.md
  - API documentation
  - README files

**Week 3: Testing & Verification (8-10h)**

- [ ] Regression testing (all features still work) (4-5h)
- [ ] Database integrity checks (1-2h)
- [ ] Performance verification (views don't slow queries) (1-2h)
- [ ] Type checking passes (1h)

**Deliverable:** ✅ Clean codebase with "staff" terminology, no semantic mismatch

---

#### 14. Performance Optimizations (Weeks 4-5) - 15-20h

**Goal:** Optimize beyond critical fixes (from MVP)

**Database Optimizations (6-8h):**

- [ ] Add Redis caching layer (4-5h)
  - Cache frequently-accessed data: services, staff list, business settings
  - Cache TTL: 5 minutes
  - Invalidate on update
- [ ] Optimize complex queries (2-3h)
  - Dashboard stats queries (currently 3-5s)
  - Client search with filters (currently slow with >1000 clients)
  - Report generation queries

**Frontend Optimizations (5-7h):**

- [ ] Code splitting (2-3h)
  - Split admin routes from public routes
  - Lazy load heavy components (calendar, charts)
- [ ] Image optimization (1-2h)
  - Next.js Image component everywhere
  - Serve WebP format
  - Lazy load images below fold
- [ ] Bundle size reduction (2-3h)
  - Analyze with `npm run build -- --analyze`
  - Remove unused dependencies
  - Tree-shake libraries

**CDN & Caching (4-5h):**

- [ ] Setup Cloudflare CDN (2-3h)
  - Cache static assets (images, CSS, JS)
  - Cache API responses (GET only, short TTL)
- [ ] Implement service worker caching (2h)
  - Cache API responses for offline access
  - Cache pages for instant navigation

**Deliverable:** ✅ Performance targets exceeded

**Targets:**

- Time to Interactive: <2s (was <3s)
- First Contentful Paint: <1s (was <1.5s)
- Bundle size: <200KB gzipped (was <250KB)
- API response time: <150ms p95 (was <200ms)

---

#### 15. Security Hardening Phase 2 (Week 6) - 16-19h

**Goal:** Advanced security beyond MVP critical fixes

**Advanced Threat Protection (6-8h):**

- [ ] Implement CSP (Content Security Policy) (2-3h)
  - Prevent XSS attacks
  - Whitelist trusted domains
- [ ] Add CORS configuration (1-2h)
  - Restrict API access to known origins
- [ ] Implement request signing (3-4h)
  - Sign API requests to prevent tampering
  - Verify signature on server

**Audit Logging (5-6h):**

- [ ] Create audit_logs table (1h)
  ```sql
  CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```
- [ ] Log critical actions (3-4h)
  - Staff changes (create, update, delete, role change)
  - Payment config changes
  - Business settings changes
  - Client data exports
- [ ] Admin UI: Audit log viewer (1-2h)

**Penetration Testing (5-6h):**

- [ ] Hire external security auditor OR use automated tools (3-4h)
  - OWASP ZAP automated scan
  - Burp Suite manual testing
- [ ] Fix vulnerabilities found (2-3h)

**Deliverable:** ✅ Advanced security posture (beyond industry standard)

---

#### 16. Accessibility Compliance (Week 7) - 12-16h

**Goal:** WCAG AA certification

**Semantic HTML (3-4h):**

- [ ] Audit all components for proper HTML5 tags (2-3h)
  - Use `<button>` not `<div onClick>`
  - Use `<nav>`, `<main>`, `<aside>`, `<header>`, `<footer>`
  - Use `<label>` for all inputs
- [ ] Fix violations (1h)

**Keyboard Navigation (4-5h):**

- [ ] Ensure all interactive elements are keyboard-accessible (2-3h)
  - Tab order makes sense
  - Focus visible (outline)
  - No keyboard traps
- [ ] Skip links for navigation (1h)
  - "Skip to main content" link
- [ ] Test with keyboard only (no mouse) (1-2h)

**Screen Reader Support (3-4h):**

- [ ] Add ARIA labels where needed (2-3h)
  - `aria-label` for icon buttons
  - `aria-describedby` for form hints
  - `aria-live` for dynamic content
- [ ] Test with screen reader (NVDA or VoiceOver) (1h)

**Color Contrast (2-3h):**

- [ ] Audit color contrast ratios (1-2h)
  - Minimum: 4.5:1 for normal text
  - Minimum: 3:1 for large text
- [ ] Fix violations (1h)

**Deliverable:** ✅ WCAG AA compliant

---

#### 17. API & Integrations (Weeks 8-12) - 60-84h

**Goal:** Public API for third-party integrations

**Public API (30-40h):**

- [ ] API versioning strategy (2-3h)
  - Prefix: `/api/v1/*`
- [ ] API key authentication (4-5h)
  - Generate API keys for businesses
  - Store hashed keys
  - Rate limiting per key
- [ ] RESTful endpoints (15-20h)
  - Appointments CRUD
  - Clients CRUD
  - Services read-only
  - Staff read-only
  - Webhooks (appointment created, completed, canceled)
- [ ] OpenAPI documentation (5-7h)
  - Auto-generate from code (Swagger)
  - Interactive API explorer
- [ ] Rate limiting (2-3h)
  - 100 requests/minute per API key
- [ ] Testing (2-3h)

**Zapier Integration (15-20h):**

- [ ] Create Zapier app (8-10h)
  - Triggers: New appointment, appointment completed
  - Actions: Create appointment, create client
- [ ] Submit to Zapier directory (2-3h)
- [ ] Documentation (3-4h)
- [ ] Testing (2-3h)

**Webhooks System (15-24h):**

- [ ] Database: webhook_subscriptions table (1-2h)
- [ ] Webhook delivery system (6-8h)
  - Queue webhook events
  - Retry failed deliveries (exponential backoff)
  - Delivery logs
- [ ] Admin UI: Manage webhooks (4-6h)
  - Add/edit/delete webhook subscriptions
  - View delivery logs
  - Test webhook
- [ ] Security: Webhook signing (2-3h)
  - HMAC signature verification
- [ ] Testing (2-3h)

**Deliverable:** ✅ Public API + Zapier integration + Webhooks

---

## 📊 POST-MVP SUMMARY

### Total Investment

**With UX/UI Quick Wins:**

- **Quick Wins:** 12h (1-2 weeks)
- **Tier 1-4 Features:** 387-504h
- **Total Hours:** 399-516h
- **Weeks @ 20h/week:** 20-26 weeks (5-6.5 months)
- **Cost @ $75/hr:** $29,925-$38,700

**Without Quick Wins (original):**

- **Hours:** 387-504h
- **Weeks @ 20h/week:** 19-25 weeks (5-6 months)
- **Cost @ $75/hr:** $29,025-$37,800

### Returns (12 months post-MVP)

1. **Tier 1 features (+56-83h):**
   - No-show reduction: +$20K-$40K revenue
   - Settings UX: -30% support tickets (100-200h saved)
   - Code quality: 15-20h saved per future feature

2. **Tier 2 features (+78-105h):**
   - Referrals: +15% organic growth
   - RBAC: Unlocks enterprise market (60% of TAM)
   - Multi-vertical: 22x market expansion

3. **Tier 3 features (+110-162h):**
   - CRM + Rebooking: +30% retention (+$60K-$120K revenue)
   - UX polish: +15% conversion rate

4. **Tier 4 features (+143-199h):**
   - API: B2B revenue stream (+$10K-$50K MRR)
   - Security: Compliance certification (enterprise requirement)

**Total Value Generated:** $150K-$300K additional annual revenue

**ROI:** 5x-10x return on investment

---

## 🗓️ SUGGESTED EXECUTION ORDER

### Week 1-2: UX/UI Quick Wins (NEW - HIGHEST PRIORITY)

**Week 1 (12h):**

- QW1: Settings Search + Progressive Disclosure (6h)
- QW2: Navigation Accessibility (2h)
- QW3: Calendar View Merge (4h)

**Result:** 40% UX improvement, foundation for Tier 1

---

### Month 2 (Tier 1 - High Priority)

**Week 1:**

- Appointment Reminders (4-6h)
- Calendar Views Refinement (8-10h)

**Weeks 2-3:**

- Settings Menu Refactor (18-23h)

**Weeks 3-5:**

- Citas Page Simplification (26-44h)

**Total:** 56-83h

---

### Months 3-4 (Tier 2 - Medium Priority)

**Weeks 1-2:**

- Área 2: Advance Payments (12-16h)

**Weeks 3-4:**

- Área 5: Push Notifications (12-16h)

**Week 5:**

- Área 4: Referrals (8-10h)

**Weeks 6-8:**

- RBAC System (22-30h)

**Weeks 9-10:**

- Business Types + Kash (24-29h)

**Total:** 78-105h

---

### Months 5-6 (Tier 3 - Low Priority)

**Weeks 1-4:**

- FASE 2.5: Retention Features (30-44h)

**Weeks 5-7:**

- Extended Testing & QA (43-55h)

**Week 8:**

- UX Refinement Sprint (12-16h)

**Total:** 85-115h

---

### Months 7-9 (Tier 4 - Strategic)

**Weeks 1-3:**

- FASE 3: Rebranding (40-60h)

**Weeks 4-5:**

- Performance Optimizations (15-20h)

**Week 6:**

- Security Hardening Phase 2 (16-19h)

**Week 7:**

- Accessibility Compliance (12-16h)

**Weeks 8-12:**

- API & Integrations (60-84h)

**Total:** 143-199h

---

## 🚨 DEPENDENCIES & SEQUENCING

### Critical Dependencies

1. **Área 3 (Rebranding) BEFORE Business Types**
   - Business Types requires "staff" terminology
   - Don't build on "barber" if we'll migrate later

2. **Settings Menu BEFORE RBAC**
   - RBAC needs settings UI for role management
   - Build foundation first

3. **MVP Testing BEFORE Tier 1**
   - Ensure stable base before adding features
   - Don't build on broken foundation

### Optional Sequencing

- **Appointment Reminders can be parallel to Calendar Refinement**
- **Advance Payments can be parallel to Push Notifications**
- **CRM Lite can be parallel to Extended Testing**

---

## 💡 FEATURE PRIORITIZATION FRAMEWORK

### How to decide what to build next:

**Score each feature on 3 dimensions (1-10):**

1. **User Impact** (How much users need/want this)
2. **Business Value** (Revenue or retention impact)
3. **Implementation Cost** (10 = cheap, 1 = expensive)

**Formula:** `Priority Score = (User Impact + Business Value) / Implementation Cost`

**Example:**

- **Appointment Reminders:** (9 + 9) / 1 = **18** (HIGH)
- **Rebranding:** (3 + 4) / 8 = **0.875** (LOW)
- **RBAC:** (7 + 9) / 6 = **2.67** (MEDIUM)

**Use this framework to adjust priorities based on user feedback post-MVP.**

---

## 📞 NEXT STEPS

1. ✅ Launch MVP first (5-6 weeks)
2. ✅ Gather user feedback (2 weeks)
3. ✅ Re-prioritize Post-MVP features based on feedback
4. ✅ Start with Tier 1 (High Priority)
5. ✅ Iterate based on metrics

---

**STATUS:** ✅ Post-MVP Roadmap Organized
**TOTAL FEATURES:** 17 major features
**TOTAL TIME:** 387-504 hours
**ORGANIZED BY:** Priority, ROI, Dependencies

**Nothing is lost - everything is organized! 📋**
