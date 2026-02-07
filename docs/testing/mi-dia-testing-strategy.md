# Mi Día Feature - Comprehensive Testing Strategy

## Executive Summary

**Feature:** Mi Día (Barber's Daily View)
**Status:** Implementation Complete - Testing Phase
**Critical:** 3 Security vulnerabilities must be tested before production deployment
**Performance Target:** <1s load time on mobile
**Coverage Goal:** 80%+ across all layers

---

## 1. Test Pyramid Structure

```
                    E2E Tests (10%)
                  ├─ 8 critical flows
                  └─ Mobile viewport focus

              Integration Tests (20%)
            ├─ API endpoint flows
            ├─ Database interactions
            └─ Full feature workflows

          Unit Tests (70%)
        ├─ Hooks logic (20%)
        ├─ Components (30%)
        ├─ API routes (15%)
        └─ Utilities (5%)
```

---

## 2. Security Tests (CRITICAL - BLOCKING)

### 2.1 IDOR Vulnerability Tests

**Priority:** P0 (MUST PASS BEFORE DEPLOY)

#### Test Case: SEC-001 - Barber cannot access other barber's appointments

```
GIVEN barber A with ID "barber-a-123"
AND barber B with ID "barber-b-456"
AND both barbers belong to different businesses
WHEN barber A tries to access GET /api/barbers/barber-b-456/appointments/today
THEN response should be 404 Not Found
AND no appointment data should be leaked
```

#### Test Case: SEC-002 - Business isolation in GET endpoint

```
GIVEN business A with barber "barber-a-123"
AND business B with barber "barber-b-456"
WHEN business A owner authenticates
AND tries to access GET /api/barbers/barber-b-456/appointments/today
THEN response should be 404 Not Found
AND error message should not reveal existence of barber-b-456
```

#### Test Case: SEC-003 - Status update IDOR protection

```
GIVEN appointment "apt-123" belonging to barber A
WHEN barber B tries to PATCH /api/appointments/apt-123/check-in with barberId=barber-b-id
THEN response should be 401 Unauthorized
AND appointment status should remain unchanged
AND error message should be "Esta cita no pertenece a este barbero"
```

#### Test Case: SEC-004 - Cross-business appointment manipulation

```
GIVEN appointment "apt-123" belonging to business A
WHEN business B owner authenticates
AND tries to PATCH /api/appointments/apt-123/complete
THEN response should be 404 Not Found
AND appointment should remain unchanged
```

### 2.2 Authentication Tests

#### Test Case: SEC-005 - Unauthenticated access blocked

```
GIVEN no authentication token
WHEN accessing any Mi Día endpoint
THEN response should be 401 Unauthorized
AND no data should be returned
```

#### Test Case: SEC-006 - Invalid token rejected

```
GIVEN expired or malformed JWT token
WHEN accessing Mi Día endpoints
THEN response should be 401 Unauthorized
```

### 2.3 Rate Limiting Tests (if implemented)

#### Test Case: SEC-007 - Rate limit on status updates

```
GIVEN barber makes 100 rapid status update requests
THEN after N requests, should return 429 Too Many Requests
AND requests should be throttled
```

---

## 3. Unit Tests (70% of test suite)

### 3.1 Custom Hooks Tests

#### useBarberAppointments Hook

- **File:** `src/hooks/__tests__/use-barber-appointments.test.ts`
- **Coverage Target:** 90%+

**Test Cases:**

1. Fetches appointments on mount when enabled
2. Does not fetch when enabled=false
3. Handles fetch errors gracefully
4. Updates lastUpdated timestamp on successful fetch
5. Implements auto-refresh when autoRefresh=true
6. Clears interval on unmount
7. Manual refetch updates data
8. Handles concurrent refetch calls
9. Returns correct loading states
10. Parses API response correctly

#### useAppointmentActions Hook

- **File:** `src/hooks/__tests__/use-appointment-actions.test.ts`
- **Coverage Target:** 90%+

**Test Cases:**

1. checkIn calls correct endpoint with barberId
2. complete calls correct endpoint
3. noShow calls correct endpoint
4. Sets loadingAppointmentId during action
5. Clears loadingAppointmentId after completion
6. Calls onSuccess callback with correct action type
7. Calls onError callback on failure
8. Handles network errors gracefully
9. Handles 400/401/404 responses correctly
10. Returns null on error

### 3.2 Component Tests

#### MiDiaPage Component

- **File:** `src/app/(dashboard)/mi-dia/__tests__/page.test.tsx`
- **Coverage Target:** 85%+

**Test Cases:**

1. Shows loading skeleton on initial load
2. Shows error state when fetch fails
3. Renders appointments when loaded
4. Shows "Actualizar" button
5. Triggers refetch on button click
6. Shows spinning icon during refresh
7. Calls checkIn when appointment action triggered
8. Shows success toast on successful action
9. Shows error toast on failed action
10. Refetches data after successful action
11. Handles empty appointments list
12. TODO barber auth integration (skip test)

#### MiDiaHeader Component

- **File:** `src/components/barber/__tests__/mi-dia-header.test.tsx`

**Test Cases:**

1. Renders barber name correctly
2. Formats date correctly
3. Displays all stat badges
4. Shows correct stat values
5. Shows "Última actualización" time
6. Updates when props change

#### MiDiaTimeline Component

- **File:** `src/components/barber/__tests__/mi-dia-timeline.test.tsx`

**Test Cases:**

1. Renders appointment cards in order
2. Shows "No hay citas" when empty
3. Calls onCheckIn with correct appointmentId
4. Disables actions when loadingAppointmentId matches
5. Shows different UI for each status (pending, confirmed, completed, no_show)

### 3.3 API Route Tests

#### GET /api/barbers/[id]/appointments/today

- **File:** `src/app/api/barbers/[id]/appointments/today/__tests__/route.test.ts`
- **Coverage Target:** 95%+

**Test Cases:**

1. Returns 401 when not authenticated
2. Returns 404 when barber not found
3. Returns 404 when barber belongs to different business
4. Returns appointments for today only
5. Excludes appointments from yesterday
6. Excludes appointments from tomorrow
7. Orders appointments by scheduled_at ascending
8. Includes client info in response
9. Includes service info in response
10. Calculates stats correctly (all statuses)
11. Handles zero appointments correctly
12. Handles database errors gracefully
13. Returns correct TypeScript types

#### PATCH /api/appointments/[id]/check-in

- **File:** `src/app/api/appointments/[id]/check-in/__tests__/route.test.ts`

**Test Cases:**

1. Returns 401 when not authenticated
2. Returns 404 when appointment not found
3. Returns 401 when barber doesn't own appointment
4. Returns 400 when appointment not in pending status
5. Updates status to confirmed
6. Returns updated appointment data
7. Accepts request without barberId in body
8. Validates barberId if provided

#### PATCH /api/appointments/[id]/complete

- **File:** `src/app/api/appointments/[id]/complete/__tests__/route.test.ts`

**Test Cases:**

1. Returns 401 when not authenticated
2. Returns 404 when appointment not found
3. Returns 401 when barber doesn't own appointment
4. Returns 400 when appointment already completed
5. Updates status to completed
6. Updates client total_visits +1
7. Updates client total_spent by appointment price
8. Updates client last_visit_at timestamp
9. Handles missing client_id gracefully
10. Triggers barber_stats update (via DB trigger)

#### PATCH /api/appointments/[id]/no-show

- **File:** `src/app/api/appointments/[id]/no-show/__tests__/route.test.ts`

**Test Cases:**

1. Returns 401 when not authenticated
2. Returns 404 when appointment not found
3. Returns 401 when barber doesn't own appointment
4. Returns 400 when appointment cancelled
5. Updates status to no_show
6. Does NOT update client stats
7. Returns updated appointment data

---

## 4. Integration Tests (20% of test suite)

### 4.1 Full Flow Tests

#### INT-001: Complete Appointment Workflow

```
1. Authenticate as business owner
2. GET /api/barbers/[id]/appointments/today
3. Find pending appointment
4. PATCH /api/appointments/[id]/check-in
5. Verify status changed to confirmed
6. PATCH /api/appointments/[id]/complete
7. Verify status changed to completed
8. Verify client stats updated
9. Verify barber stats updated (DB trigger)
10. GET appointments again to confirm changes persisted
```

#### INT-002: Error Recovery Flow

```
1. Attempt invalid status transition (complete → check-in)
2. Verify error response
3. Verify original status preserved
4. Verify no side effects occurred
```

#### INT-003: Business Isolation

```
1. Create test data for business A and B
2. Authenticate as business A
3. Try to access business B barber appointments
4. Verify 404 response
5. Verify no data leaked
```

### 4.2 Database Integration Tests

#### INT-004: Date Range Filtering

```
GIVEN appointments at:
  - Yesterday 10:00
  - Today 09:00
  - Today 14:00
  - Today 18:00
  - Tomorrow 10:00
WHEN fetching today's appointments
THEN only today's 3 appointments returned
AND ordered by time ascending
```

#### INT-005: Client Stats Update on Complete

```
GIVEN client with total_visits=5, total_spent=100
AND appointment with price=50
WHEN marking appointment as completed
THEN client.total_visits = 6
AND client.total_spent = 150
AND client.last_visit_at = now()
```

---

## 5. E2E Tests (10% of test suite)

### 5.1 Critical User Flows (Playwright)

#### E2E-001: View Today's Appointments

```typescript
test('Barber views today appointments', async ({ page }) => {
  // Login as barber
  // Navigate to /mi-dia
  // Verify appointments loaded
  // Verify stats displayed
  // Take screenshot for visual regression
})
```

#### E2E-002: Check-in Flow

```typescript
test('Barber checks in pending appointment', async ({ page }) => {
  // Navigate to Mi Día
  // Find pending appointment card
  // Click "Check-in" button
  // Verify success toast appears
  // Verify appointment badge changes to "Confirmada"
  // Verify stats updated
})
```

#### E2E-003: Complete Flow

```typescript
test('Barber completes confirmed appointment', async ({ page }) => {
  // Navigate to Mi Día
  // Find confirmed appointment
  // Click "Completar" button
  // Verify success toast
  // Verify badge changes to "Completada"
  // Verify stats updated
})
```

#### E2E-004: No-Show Flow

```typescript
test('Barber marks no-show', async ({ page }) => {
  // Navigate to Mi Día
  // Find appointment
  // Click "No asistió" button
  // Verify confirmation dialog (if exists)
  // Verify status updates
})
```

#### E2E-005: Pull-to-Refresh

```typescript
test('Manual refresh updates data', async ({ page }) => {
  // Navigate to Mi Día
  // Click "Actualizar" button
  // Verify loading spinner appears
  // Verify appointments reload
  // Verify "Última actualización" timestamp updates
})
```

#### E2E-006: Auto-Refresh

```typescript
test('Auto-refresh after 30 seconds', async ({ page }) => {
  // Navigate to Mi Día
  // Wait 30 seconds
  // Verify API call made
  // Verify data updated
})
```

#### E2E-007: Mobile Viewport

```typescript
test('Mi Día works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
  // Navigate to Mi Día
  // Verify responsive layout
  // Verify touch interactions work
  // Take screenshot
})
```

#### E2E-008: Error Handling

```typescript
test('Shows error state on network failure', async ({ page }) => {
  // Mock network failure
  // Navigate to Mi Día
  // Verify error message displayed
  // Verify "Reintentar" button appears
  // Click retry
  // Verify recovery
})
```

---

## 6. Performance Tests

### 6.1 Load Time Targets

**Mobile (3G connection):**

- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.0s

**Desktop (4G connection):**

- First Contentful Paint: <0.8s
- Largest Contentful Paint: <1.2s
- Time to Interactive: <1.5s

### 6.2 Performance Test Cases

#### PERF-001: Initial Page Load

```
GIVEN user on mobile device with 3G connection
WHEN navigating to /mi-dia
THEN page should load in <1s
AND display skeleton within 100ms
```

#### PERF-002: Auto-Refresh Performance

```
GIVEN Mi Día page open for 5 minutes (10 auto-refreshes)
WHEN monitoring memory usage
THEN no memory leaks detected
AND memory increase <10MB
```

#### PERF-003: Re-render Performance

```
GIVEN appointments list with 20 items
WHEN updating one appointment status
THEN only affected appointment card should re-render
AND update should complete in <100ms
```

#### PERF-004: Bundle Size

```
GIVEN Mi Día page JavaScript bundle
THEN bundle size should be <150KB gzipped
AND no unnecessary dependencies included
```

---

## 7. Test Infrastructure

### 7.1 Test Environment Setup

**Required:**

- Supabase test database
- Test authentication tokens
- Seed data for consistent tests
- Mock Supabase client for unit tests
- MSW for API mocking in component tests

### 7.2 Test Data Setup

```typescript
// Test fixture structure
{
  businesses: [
    { id: 'business-a', name: 'Business A' },
    { id: 'business-b', name: 'Business B' }
  ],
  barbers: [
    { id: 'barber-a-1', business_id: 'business-a', name: 'Barber A1' },
    { id: 'barber-b-1', business_id: 'business-b', name: 'Barber B1' }
  ],
  appointments: [
    { id: 'apt-1', barber_id: 'barber-a-1', status: 'pending', ... },
    { id: 'apt-2', barber_id: 'barber-a-1', status: 'confirmed', ... }
  ]
}
```

---

## 8. CI/CD Integration

### 8.1 Pre-Commit Hooks

- Run unit tests for changed files
- Run linting and type checking

### 8.2 PR Checks (Required)

1. All unit tests pass
2. All integration tests pass
3. Security tests pass (CRITICAL)
4. Coverage >80%
5. No TypeScript errors
6. Linting passes

### 8.3 Pre-Deploy Checks (Production)

1. All tests pass (unit + integration + E2E)
2. Performance benchmarks met
3. Security scan passes
4. Manual QA approval

---

## 9. Test Execution Plan

### Phase 1: Security Tests (Week 1, Days 1-2)

- [ ] Implement SEC-001 to SEC-007
- [ ] Run security tests
- [ ] Fix any vulnerabilities found
- [ ] Re-test until all pass

### Phase 2: Unit Tests (Week 1, Days 3-5)

- [ ] Implement hook tests
- [ ] Implement component tests
- [ ] Implement API route tests
- [ ] Achieve 80%+ coverage

### Phase 3: Integration Tests (Week 2, Days 1-2)

- [ ] Implement INT-001 to INT-005
- [ ] Test with real database
- [ ] Test business isolation

### Phase 4: E2E Tests (Week 2, Days 3-4)

- [ ] Implement E2E-001 to E2E-008
- [ ] Test on multiple browsers
- [ ] Test on mobile viewports

### Phase 5: Performance Tests (Week 2, Day 5)

- [ ] Run Lighthouse audits
- [ ] Profile memory usage
- [ ] Optimize if needed

### Phase 6: Final Validation (Week 3, Day 1)

- [ ] Run full test suite
- [ ] Manual QA testing
- [ ] Stakeholder review
- [ ] Production deploy

---

## 10. Coverage Targets

| Layer         | Target  | Critical Path |
| ------------- | ------- | ------------- |
| API Routes    | 95%     | 100%          |
| Custom Hooks  | 90%     | 95%           |
| Components    | 85%     | 90%           |
| Utils/Helpers | 90%     | 95%           |
| **Overall**   | **80%** | **90%**       |

**Critical Path:** Security-related code, status update logic, client stats updates

---

## 11. Test Maintenance

### Monthly

- Review and update test data fixtures
- Update snapshots if UI changed intentionally
- Review flaky tests and fix

### Per Feature Update

- Add tests for new functionality
- Update existing tests if behavior changed
- Maintain coverage targets

---

## Next Steps

1. **Review this strategy** with team
2. **Set up test infrastructure** (MSW, fixtures, Supabase test DB)
3. **Start with Security Tests** (highest priority)
4. **Implement tests in phases** (see execution plan)
5. **Block production deployment** until all critical tests pass

---

**Document Version:** 1.0
**Last Updated:** 2026-02-03
**Owner:** Test Engineering Team
**Status:** Ready for Implementation
