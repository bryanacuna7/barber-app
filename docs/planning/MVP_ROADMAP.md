# MVP Roadmap - Minimum Viable Product

**Project:** BarberShop Pro → Salon Booking Platform
**Version:** MVP 1.0
**Date:** 2026-02-03
**Goal:** Launch-ready platform with core features
**Total Estimated:** 98-128 hours (5-6 weeks @ 20h/week)

---

## 🎯 MVP DEFINITION

**What makes this MVP viable:**

- ✅ Core booking system (already built)
- ✅ Security vulnerabilities fixed (production-ready)
- ✅ Subscription system (revenue model)
- ✅ TypeScript strict mode (maintainable codebase)
- ✅ Essential tests (80% critical paths)
- ✅ Basic calendar views (92% complete - Session 84)

**What's NOT in MVP (Post-MVP):**

- ❌ Advanced calendar features (Week/Month refinement)
- ❌ Appointment reminders (automation)
- ❌ Advance payments (SINPE deposits)
- ❌ Push notifications
- ❌ Referral system
- ❌ RBAC (role-based access control)
- ❌ Business types (multi-vertical)
- ❌ Retention features (CRM, rebooking)
- ❌ Rebranding (barber → staff)
- ❌ UX refinement polish

---

## 📊 MVP TIME BREAKDOWN

| Phase                      | Hours   | Weeks @ 20h/wk | Status      |
| -------------------------- | ------- | -------------- | ----------- |
| **FASE 0: Critical Fixes** | 12.5h   | 0.5 weeks      | In Progress |
| **Área 6: Security**       | 22h     | 1 week         | Blocked     |
| **Área 1: Subscriptions**  | 14-18h  | 0.75-1 week    | Not Started |
| **Sprint 5: MVP Testing**  | 40-50h  | 2-2.5 weeks    | Not Started |
| **Buffer (15%)**           | 10-20h  | 0.5-1 week     | -           |
| **TOTAL**                  | 98-128h | 5-6 weeks      | -           |

**Conservative @ 20h/week:** 5-6 weeks
**Aggressive @ 30h/week:** 3-4 weeks

---

## 🗓️ MVP PHASE-BY-PHASE

### FASE 0: Critical Fixes (Week 1) - 12.5h

**Status:** BLOCKER - Must complete before all other work

#### Database Index Bug (5 min) ⚠️ CRITICAL

- [ ] Fix `last_activity_at` → `last_visit_at` in migration 019b
  - Without this, inactive clients query FAILS
  - Location: [supabase/migrations/019b_client_insights_indexes.sql](../../supabase/migrations/019b_client_insights_indexes.sql)

#### Performance Critical Fixes (4.5h)

- [ ] Calendar N+1 queries → single range query (2h)
  - Current: Queries appointments for each staff member separately
  - Fix: Single query with date range + business_id filter
  - File: [src/app/citas/page.tsx](../../src/app/citas/page.tsx)
- [ ] Mi Día polling → WebSocket (2h)
  - Current: Poll every 30s for status updates
  - Fix: Real-time WebSocket connection
  - ROI: Reduces server load by 95%

#### Complete Área 0 TypeScript (8h)

- [ ] Fix remaining 15 TypeScript strict mode errors (6-8h)
  - Most are in: `src/app/citas/`, `src/components/`
  - Run: `npm run type-check` to see all errors
- [ ] ESLint auto-fix console.log removal (1h)
  - Run: `npm run lint -- --fix`
  - Manual review for intentional logs

**Deliverable:** ✅ Build passes without `SKIP_TYPE_CHECK`, critical perf fixed

---

### Área 6: Security Fixes (Week 2) - 22h

**Status:** 90% complete, BLOCKED by security vulnerabilities

#### IDOR Vulnerability #1 (4h)

- [ ] Add barber identity validation in `/api/barbers/[id]/appointments/today`
  - Current: Any authenticated user can access any barber's appointments
  - Fix: Verify `session.user.id === barberId` OR user has `read_all_appointments` permission
  - File: [src/app/api/barbers/[id]/appointments/today/route.ts](../../src/app/api/barbers/[id]/appointments/today/route.ts)

#### IDOR Vulnerability #2 (4h)

- [ ] Make barberId validation MANDATORY in status update endpoints
  - Endpoints: `/api/appointments/[id]/start`, `/api/appointments/[id]/complete`
  - Current: Optional validation (can be bypassed)
  - Fix: Move validation to RLS policy level

#### Race Condition in Client Stats (4h)

- [ ] Create atomic `increment_client_stats()` DB function
  - Current: Read → increment → write (race condition)
  - Fix: Single atomic SQL function
  - Example:
    ```sql
    CREATE OR REPLACE FUNCTION increment_client_stats(
      client_id UUID,
      total_change INT,
      spent_change DECIMAL
    ) RETURNS void AS $$
    BEGIN
      UPDATE clients
      SET
        total_appointments = total_appointments + total_change,
        total_spent = total_spent + spent_change,
        updated_at = NOW()
      WHERE id = client_id;
    END;
    $$ LANGUAGE plpgsql;
    ```

#### Rate Limiting (4h)

- [ ] Add rate limiting to status update endpoints
  - Limit: 10 requests/min per user
  - Library: `@upstash/ratelimit` (Redis-based)
  - Endpoints: All `/api/appointments/[id]/*` routes

#### Auth Integration (4h)

- [ ] Replace `BARBER_ID_PLACEHOLDER` with real auth
  - Search codebase: `grep -r "BARBER_ID_PLACEHOLDER" src/`
  - Replace with: `const barberId = session.user.id`
  - Verify: No hardcoded IDs remain

#### Security Tests (2h)

- [ ] Execute all 8 security test cases
  - Test 1: IDOR attempt (different user's appointments)
  - Test 2: Race condition (concurrent stat updates)
  - Test 3: Rate limiting (11+ requests in 1 minute)
  - Test 4: Auth bypass (no session token)
  - Test 5: SQL injection (malicious input)
  - Test 6: XSS (script tags in client name)
  - Test 7: CSRF (cross-site request)
  - Test 8: Authorization (staff accessing admin routes)

**Deliverable:** ✅ Mi Día production-ready, 0 critical vulnerabilities

---

### Área 1: Simplified Subscriptions (Week 3) - 14-18h

**Decision:** No auto-deletion, no client limits (anti-growth removed)

#### Database Migration (3-4h)

- [ ] Create subscriptions tables

  ```sql
  CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- 'basic' or 'pro'
    price_usd DECIMAL(10,2) NOT NULL,
    price_crc DECIMAL(10,2) NOT NULL,
    billing_period TEXT NOT NULL, -- 'monthly' or 'annual'
    features JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE business_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status TEXT NOT NULL, -- 'active', 'past_due', 'canceled'
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    grace_period_ends DATE, -- NULL if active
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] Seed subscription plans (Basic $19/mo, Pro $49/mo)
- [ ] Add indexes for performance

#### Feature Gating System (4-5h)

- [ ] Create `hasFeature()` helper function

  ```typescript
  // src/lib/subscriptions.ts
  export async function hasFeature(businessId: string, feature: string): Promise<boolean> {
    const subscription = await getBusinessSubscription(businessId)
    if (!subscription) return false

    // Grace period handling
    if (subscription.status === 'past_due') {
      const gracePeriodActive = new Date() < new Date(subscription.grace_period_ends)
      if (!gracePeriodActive) return false
    }

    return subscription.plan.features[feature] === true
  }
  ```

- [ ] Define feature flags:
  ```typescript
  const FEATURES = {
    basic: {
      multi_staff: false,
      advanced_reports: false,
      custom_branding: false,
      api_access: false,
      priority_support: false,
    },
    pro: {
      multi_staff: true,
      advanced_reports: true,
      custom_branding: true,
      api_access: true,
      priority_support: true,
    },
  }
  ```

#### Grace Period Handling (3-4h)

- [ ] Cron job: `/api/cron/check-subscriptions`
  - Run daily
  - Find subscriptions with `current_period_end` < today
  - Set status to `past_due` if payment not received
  - Set `grace_period_ends` to +7 days
  - Send email notification
- [ ] UI: Show grace period banner
  - "Your subscription payment is overdue. You have X days remaining to update payment."
  - Action: "Update Payment Method"

#### Payment Reporting (2-3h)

- [ ] Admin page: `/dashboard/subscription`
  - Current plan details
  - Billing history
  - Payment method (credit card last 4 digits)
  - Upgrade/downgrade button
- [ ] Payment success webhook
  - Stripe webhook: `invoice.paid`
  - Update subscription status to `active`
  - Reset grace period

#### Testing (2-3h)

- [ ] Unit tests for `hasFeature()`
- [ ] Integration test: Grace period expiration
- [ ] E2E test: Feature gate blocks access (Basic plan tries to access Pro feature)

**Deliverable:** ✅ Two-tier subscription system without anti-growth limits

---

### Sprint 5: MVP Testing (Weeks 4-5) - 40-50h

**Scope:** Focus on CRITICAL paths only (not 80% full coverage)

#### Critical Path Tests (20-25h)

**Priority 1: Booking Flow (10-12h)**

- [ ] E2E test: Full booking flow
  - Select service → Select staff → Select time → Submit → Confirm
  - Verify appointment appears in calendar
  - Verify email sent
- [ ] E2E test: Cancel appointment
- [ ] E2E test: Reschedule appointment
- [ ] Unit test: Calendar time slot logic
  - Available slots calculation
  - Overlap detection
  - Buffer time handling

**Priority 2: Authentication (6-8h)**

- [ ] E2E test: Sign up flow
- [ ] E2E test: Login flow
- [ ] E2E test: Password reset
- [ ] Integration test: Session management
- [ ] Integration test: RLS policies (basic)

**Priority 3: Mi Día (4-5h)**

- [ ] E2E test: Mark appointment "Started"
- [ ] E2E test: Mark appointment "Completed"
- [ ] Integration test: Client stats update (atomic)
- [ ] Integration test: Rate limiting

#### Security Testing (8-10h)

- [ ] IDOR vulnerability tests (4h)
  - Test accessing other user's data
  - Test modifying other user's appointments
- [ ] Auth bypass tests (2h)
  - Test API routes without session
  - Test invalid JWT tokens
- [ ] Input validation tests (2-3h)
  - SQL injection attempts
  - XSS attempts
  - CSRF attempts

#### Performance Testing (4-6h)

- [ ] Calendar N+1 query fix verification (1h)
  - Before: 10+ queries per page load
  - After: 1-2 queries per page load
- [ ] Mi Día WebSocket latency (1h)
  - Target: <100ms update time
- [ ] Feature gate performance (2h)
  - Target: <50ms per check
  - Load test: 100 concurrent users

#### Test Infrastructure (8-10h)

- [ ] Setup test database seeding (3-4h)
  - Seed script for test data
  - Reset script for clean slate
- [ ] Mock external APIs (3-4h)
  - Mock Resend (email)
  - Mock Supabase Storage
- [ ] CI/CD setup (2-3h)
  - GitHub Actions workflow
  - Run tests on PR
  - Block merge if tests fail

**Deliverable:** ✅ Critical paths tested (80% confidence for MVP launch)

**Coverage Targets (Realistic for MVP):**

- Critical booking flow: 90%
- Security vulnerabilities: 100% (all 8 tests passing)
- Authentication: 80%
- Mi Día: 80%
- Other features: 40% (E2E covers most)

---

## 🚨 MVP LAUNCH CHECKLIST

### Before Launch - MANDATORY

- [ ] FASE 0 completed (all critical fixes)
- [ ] Área 6 completed (0 security vulnerabilities)
- [ ] Área 1 completed (subscription system working)
- [ ] Sprint 5 completed (critical tests passing)
- [ ] Database index bug fixed
- [ ] TypeScript errors: 0
- [ ] ESLint errors: 0

### Production Requirements

- [ ] Environment variables configured (.env.production)
- [ ] Database migrations applied to production
- [ ] Supabase RLS policies deployed
- [ ] Domain configured (SSL certificate)
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics setup (Google Analytics or Plausible)

### Post-Launch Monitoring (First 48h)

- [ ] Monitor error rates (target: <1%)
- [ ] Monitor API response times (target: <200ms p95)
- [ ] Monitor user signups (funnel analysis)
- [ ] Monitor booking completion rate (target: >85%)
- [ ] Check security logs (no suspicious activity)

---

## 📋 WHAT'S NOT IN MVP

All features below are moved to [POST_MVP_ROADMAP.md](./POST_MVP_ROADMAP.md):

### Deferred Features (Organized by Priority)

**High Priority (Launch in Month 2):**

- Appointment Reminders (4-6h) - Reduces no-shows by 30%
- Calendar Week/Month Views Refinement (remaining 8%)
- Settings Menu Refactor (18-23h) - Better UX

**Medium Priority (Launch in Months 3-4):**

- Área 2: Advance Payments (12-16h)
- Área 5: Push Notifications (12-16h)
- Área 4: Referrals (8-10h)
- RBAC System (22-30h)
- Business Types + Kash (24-29h)

**Low Priority (Launch in Months 5-6):**

- Citas Page Simplification (34-48h) - Code quality
- FASE 2.5: Retention Features (30-44h)
- FASE 3: Rebranding (40-60h)
- FASE 4: UX Refinement (12-16h)

**Total Deferred:** 387-504h (organized and tracked separately)

---

## 💡 MVP SUCCESS CRITERIA

### Technical

- ✅ TypeScript: 0 errors
- ✅ Security: 0 critical vulnerabilities
- ✅ Performance: Calendar loads <2s
- ✅ Tests: 80% critical path coverage

### Business

- ✅ Booking flow works end-to-end
- ✅ Payment collection via subscriptions
- ✅ Admin dashboard functional
- ✅ Mobile responsive

### User Experience

- ✅ User can book appointment in <60s
- ✅ Staff can manage appointments easily
- ✅ Admin can configure business settings
- ✅ No blocking bugs in core flows

---

## 🎯 POST-MVP ROADMAP

See [POST_MVP_ROADMAP.md](./POST_MVP_ROADMAP.md) for:

- Full feature breakdown (387-504h remaining)
- Priority tiers (High/Medium/Low)
- Week-by-week execution plan
- ROI analysis per feature
- Dependencies and sequencing

---

## 📞 NEXT STEPS

### This Week (IMMEDIATE)

1. ✅ Review MVP scope
2. ✅ Approve MVP definition
3. [ ] Fix database index bug (5 minutes) ⚠️ START NOW
4. [ ] Begin FASE 0 critical fixes

### Week 2

1. [ ] Complete FASE 0 (TypeScript + Performance)
2. [ ] Begin Área 6 security fixes
3. [ ] Setup test infrastructure

### Week 3

1. [ ] Complete Área 6 security
2. [ ] Begin Área 1 subscriptions

### Weeks 4-5

1. [ ] Complete subscriptions
2. [ ] Execute Sprint 5 MVP testing
3. [ ] Prepare for production deploy

### Week 6 (MVP LAUNCH)

1. [ ] Deploy to production
2. [ ] Monitor first 48h
3. [ ] Plan Post-MVP Phase 1

---

**STATUS:** ✅ MVP Scope Defined
**TOTAL TIME:** 98-128 hours (5-6 weeks)
**LAUNCH TARGET:** 6 weeks from start
**POST-MVP:** 387-504 hours remaining (organized separately)

**Let's ship the MVP! 🚀**
