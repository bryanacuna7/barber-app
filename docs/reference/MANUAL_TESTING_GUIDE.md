# Manual Testing Guide - Modernized Pages

> **Phase 0 Week 7 - Quality Assurance**
>
> Step-by-step manual testing procedures for Mi Día and Analytics pages (v2) with React Query + Real-time + Error Boundaries.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Testing Checklist](#testing-checklist)
- [Mi Día Page Testing](#mi-día-page-testing)
- [Analytics Page Testing](#analytics-page-testing)
- [Real-time Testing](#real-time-testing)
- [Error Recovery Testing](#error-recovery-testing)
- [Performance Testing](#performance-testing)
- [Feature Flag Testing](#feature-flag-testing)
- [Cross-Browser Testing](#cross-browser-testing)
- [Known Issues](#known-issues)

---

## Overview

**Purpose:** Verify that modernized pages work correctly with:

- React Query caching
- WebSocket real-time updates
- Error boundaries and fallbacks
- Feature flags for rollback

**Pages to Test:**

1. Mi Día (Staff View) - `/mi-dia`
2. Analytics (Dashboard) - `/analiticas`

**Estimated Time:** 30-40 minutes per page

---

## Prerequisites

### 1. Environment Setup

**Check .env.local:**

```bash
# Feature flags must be enabled
NEXT_PUBLIC_FF_NEW_MI_DIA=true
NEXT_PUBLIC_FF_NEW_ANALYTICS=true

# Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Dev Server Running

```bash
npm run dev

# Verify: http://localhost:3000 should load
```

### 3. User Accounts Ready

You need access to **2 user accounts:**

**Account 1: Barber**

- Email: (your test barber)
- Can access: Mi Día, Analytics

**Account 2: Business Owner**

- Email: (your test owner)
- Can access: Analytics

### 4. Test Data

Ensure you have:

- [ ] At least 5 appointments (today's date)
- [ ] At least 3 completed appointments (for analytics)
- [ ] At least 2 clients
- [ ] Revenue data from past week

**Create test data if needed:**

```sql
-- Insert test appointments for today
INSERT INTO appointments (business_id, barber_id, client_id, service_id, scheduled_at, status)
VALUES
  ('your-business-id', 'barber-id', 'client-id', 'service-id', NOW() + INTERVAL '2 hours', 'pending'),
  ('your-business-id', 'barber-id', 'client-id', 'service-id', NOW() + INTERVAL '4 hours', 'confirmed');
```

### 5. Browser DevTools

Open DevTools (F12) and:

- [ ] Keep **Console** tab open (watch for errors)
- [ ] Open **Network** tab (verify WebSocket connection)
- [ ] Install **React Query DevTools** extension (optional)

---

## Testing Checklist

Use this checklist to track your testing progress:

### Mi Día Page

- [ ] Page loads without errors
- [ ] Today's appointments display correctly
- [ ] Stats cards show correct totals
- [ ] Timeline shows appointments in chronological order
- [ ] Real-time updates work (create new appointment)
- [ ] Real-time updates work (update appointment status)
- [ ] Error boundary fallback works (simulate error)
- [ ] Feature flag rollback works

### Analytics Page

- [ ] Page loads without errors
- [ ] KPI cards display correctly (revenue, appointments, clients, rating)
- [ ] Period selector works (week/month/year)
- [ ] Revenue chart loads and displays data
- [ ] Services chart loads correctly
- [ ] Barbers chart loads correctly
- [ ] Real-time updates work (complete appointment)
- [ ] Charts error boundary fallback works
- [ ] Feature flag rollback works

### Real-time Testing

- [ ] WebSocket connection established (Network tab shows "ws://")
- [ ] Appointment create → UI updates instantly
- [ ] Appointment update → UI updates instantly
- [ ] Appointment delete → UI updates instantly
- [ ] Fallback to polling works (disconnect network briefly)

### Error Recovery

- [ ] Network error → Retry button appears
- [ ] Component error → Fallback UI appears
- [ ] Retry button → Refetches data successfully
- [ ] Multiple errors → Each section isolated

---

## Mi Día Page Testing

### Test 1: Initial Load

**Steps:**

1. Login as **Barber** user
2. Navigate to `/mi-dia`
3. Wait for page to load

**Expected:**

- [ ] Loading skeleton appears briefly (< 2 seconds)
- [ ] Page loads with today's date
- [ ] Stats cards show:
  - Total appointments (number)
  - Pendientes (number)
  - Confirmadas (number)
  - Completadas (number)
- [ ] Timeline shows appointments for today
- [ ] Each appointment card shows:
  - Time
  - Client name
  - Service name
  - Status badge
- [ ] Console has no errors

**If Failed:**

- Check browser console for errors
- Verify barber account has `barbers` record in DB
- Check Supabase connection in Network tab

---

### Test 2: Stats Accuracy

**Steps:**

1. Count appointments manually in the timeline
2. Compare with stats cards

**Expected:**

- [ ] "Total" matches count of all appointments
- [ ] "Pendientes" matches orange badges
- [ ] "Confirmadas" matches green badges
- [ ] "Completadas" matches blue badges
- [ ] Cancelled/No-show not included in counts

**If Failed:**

- Check `useBarberDayAppointments` query logic
- Verify stats calculation in `src/hooks/queries/useAppointments.ts`

---

### Test 3: Timeline Chronological Order

**Steps:**

1. Look at appointment times in timeline
2. Verify they're sorted by `scheduled_at` ascending

**Expected:**

- [ ] 9:00 AM appointment appears before 10:00 AM
- [ ] Past appointments at top (if any)
- [ ] Future appointments below current time

**If Failed:**

- Check sort logic in query function
- Verify `ORDER BY scheduled_at ASC` in Supabase query

---

### Test 4: Real-time Create

**Steps:**

1. Open Mi Día page as Barber
2. Keep page open
3. Open **another browser tab** (or incognito)
4. Create a new appointment for today (use booking flow or admin panel)
5. Switch back to Mi Día tab

**Expected:**

- [ ] New appointment appears in timeline within **2 seconds**
- [ ] Stats cards update automatically
- [ ] No page refresh needed
- [ ] Console shows: `[Real-time] Appointment INSERT detected`

**If Failed:**

- Check Network tab for WebSocket connection (`ws://`)
- Verify `useRealtimeAppointments` is enabled
- Check Supabase Realtime is enabled for `appointments` table

---

### Test 5: Real-time Update

**Steps:**

1. Open Mi Día page as Barber
2. Keep page open
3. In another tab, update an appointment status:
   - Pending → Confirmed
   - Or: Confirmed → Completed
4. Switch back to Mi Día tab

**Expected:**

- [ ] Appointment status badge changes instantly
- [ ] Stats cards update (e.g., Pendientes -1, Confirmadas +1)
- [ ] No full page refresh
- [ ] Console shows: `[Real-time] Appointment UPDATE detected`

**If Failed:**

- Check real-time hook is subscribed (Console logs)
- Verify query invalidation happens (React Query DevTools)

---

### Test 6: Error Boundary - Timeline Crash

**Steps:**

1. Open Mi Día page
2. Open browser console
3. Manually cause an error:
   ```javascript
   // In console:
   localStorage.setItem('TEST_ERROR_TIMELINE', 'true')
   ```
4. Refresh page

**Expected:**

- [ ] Timeline section shows error fallback
- [ ] Header/stats section still works
- [ ] Error message: "No se pudo cargar el timeline"
- [ ] "Retry" button appears
- [ ] Click retry → Timeline loads correctly

**Clean up:**

```javascript
localStorage.removeItem('TEST_ERROR_TIMELINE')
```

---

### Test 7: Query Error - No Network

**Steps:**

1. Open Mi Día page
2. Open DevTools → Network tab
3. Set throttling to **"Offline"**
4. Refresh page

**Expected:**

- [ ] Loading skeleton appears
- [ ] After ~8 seconds, error screen appears
- [ ] Error message: "No se pudo conectar al servidor"
- [ ] Retry button appears

5. Set throttling back to **"Online"**
6. Click "Retry"
7. Page loads successfully

---

## Analytics Page Testing

### Test 1: Initial Load

**Steps:**

1. Login as **Business Owner** (or Barber)
2. Navigate to `/analiticas`
3. Wait for page to load

**Expected:**

- [ ] Loading skeleton appears briefly
- [ ] Page loads with "Semana" selected by default
- [ ] 4 KPI cards display:
  - Ingresos (revenue in CLP format: $150.000)
  - Citas (number)
  - Clientes (number)
  - Calificación (rating 0.0-5.0)
- [ ] Revenue chart displays (line or bar)
- [ ] Services chart displays (pie or bar)
- [ ] Barbers chart displays (if multiple barbers)
- [ ] Console has no errors

**If Failed:**

- Check user has business_owner or barber role
- Verify analytics API endpoints are accessible
- Check for 401/403 errors in Network tab

---

### Test 2: Period Selector

**Steps:**

1. Click "Mes" button
2. Wait for charts to update
3. Click "Año" button
4. Wait for charts to update
5. Click "Semana" button

**Expected:**

- [ ] Button becomes highlighted when selected
- [ ] Charts show loading skeleton briefly
- [ ] Data updates to reflect selected period
- [ ] KPI cards update with new numbers
- [ ] No console errors
- [ ] Network shows new API request with period parameter

**If Failed:**

- Check `setPeriod` state updates correctly
- Verify `useBusinessAnalytics(period)` refetches on change

---

### Test 3: Chart Lazy Loading

**Steps:**

1. Open Analytics page
2. Open Network tab → Filter by "JS"
3. Look for chart component requests

**Expected:**

- [ ] Charts load separately (not in initial bundle)
- [ ] Each chart has individual loading skeleton
- [ ] Charts appear after ~500ms
- [ ] No SSR errors (charts are client-only)

**If Failed:**

- Verify `dynamic()` imports are correct
- Check `ssr: false` in chart imports

---

### Test 4: Real-time Updates

**Steps:**

1. Open Analytics page (Week view)
2. Keep page open
3. In another tab, **complete an appointment** with revenue:
   - Find a confirmed appointment for today
   - Update status to `completed`
   - Ensure appointment has a service with price
4. Switch back to Analytics tab

**Expected:**

- [ ] Revenue KPI updates within **2 seconds**
- [ ] Appointments KPI increases by 1
- [ ] Revenue chart updates (if today is in view)
- [ ] No page refresh needed
- [ ] Console shows: `[Real-time] Appointment UPDATE detected`

**If Failed:**

- Check `useRealtimeAppointments` is enabled on Analytics page
- Verify analytics queries are invalidated on appointment change
- Check `queryKeys.analytics.all` invalidation in real-time hook

---

### Test 5: Charts Error Boundary

**Steps:**

1. Open Analytics page
2. Open browser console
3. Cause a chart error:
   ```javascript
   // In console:
   localStorage.setItem('TEST_ERROR_CHARTS', 'true')
   ```
4. Refresh page

**Expected:**

- [ ] KPI cards still display correctly
- [ ] Charts section shows error fallback
- [ ] Fallback displays basic stats (revenue, appointments, clients, rating)
- [ ] No icons or complex visualizations in fallback
- [ ] "Retry" button appears

5. Click retry
6. Charts load successfully

**Clean up:**

```javascript
localStorage.removeItem('TEST_ERROR_CHARTS')
```

---

### Test 6: Empty State

**Steps:**

1. Create a new test business (or use business with no data)
2. Login as owner
3. Navigate to Analytics

**Expected:**

- [ ] Page loads without errors
- [ ] KPI cards show "0" or "$0"
- [ ] Charts show "No data" message
- [ ] No console errors
- [ ] UI doesn't break with empty data

**If Failed:**

- Check null/undefined handling in chart components
- Verify empty state rendering in `AnalyticsErrorBoundary`

---

## Real-time Testing

### Test 1: WebSocket Connection

**Steps:**

1. Open Mi Día or Analytics page
2. Open DevTools → Network tab
3. Filter by "WS" (WebSocket)

**Expected:**

- [ ] See WebSocket connection: `wss://your-project.supabase.co/realtime/v1/websocket`
- [ ] Status: 101 Switching Protocols
- [ ] Connection stays open (green indicator)
- [ ] Console shows: `[Real-time] Connected with status: SUBSCRIBED`

**If Failed:**

- Check Supabase Realtime is enabled
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check browser doesn't block WebSocket

---

### Test 2: Graceful Degradation

**Steps:**

1. Open Mi Día page
2. Wait for WebSocket to connect
3. Open Network tab → Set throttling to "Offline" for 10 seconds
4. Set back to "Online"

**Expected:**

- [ ] Console shows: `[Real-time] Connection lost, attempting reconnect...`
- [ ] After 3 failed reconnects: `[Real-time] Max reconnections reached, switching to polling`
- [ ] Polling fallback starts (30s intervals)
- [ ] When online: WebSocket reconnects
- [ ] Polling stops

**If Failed:**

- Check reconnection logic in `use-realtime-appointments.ts`
- Verify fallback polling is implemented

---

### Test 3: Multiple Subscriptions

**Steps:**

1. Open **3 browser tabs**:
   - Tab 1: Mi Día
   - Tab 2: Analytics
   - Tab 3: Citas (Calendar)
2. Create a new appointment
3. Watch all 3 tabs

**Expected:**

- [ ] All 3 tabs update within 2 seconds
- [ ] Each tab invalidates its relevant queries
- [ ] No duplicate subscriptions (check Console)
- [ ] No memory leaks

**If Failed:**

- Check each page has its own `useRealtimeAppointments` instance
- Verify cleanup in `useEffect` return

---

## Error Recovery Testing

### Test 1: Network Timeout

**Steps:**

1. Open Mi Día page
2. DevTools → Network → Set throttling to "Slow 3G"
3. Refresh page
4. Wait 30 seconds

**Expected:**

- [ ] Query retries 3 times with exponential backoff
- [ ] Console shows: `Retry attempt 1 of 3... delay: 1000ms`
- [ ] After 3 retries: Error screen appears
- [ ] "Retry" button appears

5. Set throttling to "Online"
6. Click "Retry"
7. Page loads successfully

---

### Test 2: 401 Authentication Error

**Steps:**

1. Open Mi Día page
2. Open browser console
3. Clear Supabase session:
   ```javascript
   localStorage.clear()
   ```
4. Refresh page

**Expected:**

- [ ] Page redirects to `/login`
- [ ] No infinite retry loop
- [ ] Console shows: `[Auth] No user session, redirecting to login`

---

### Test 3: Component Crash

**Steps:**

1. Open Mi Día page
2. Cause a component crash:
   ```javascript
   // In console:
   document.querySelector('[data-testid="mi-dia-timeline"]').innerHTML = null
   ```
3. Trigger a re-render (e.g., click something)

**Expected:**

- [ ] Error boundary catches the error
- [ ] Fallback UI appears for crashed section
- [ ] Other sections still work
- [ ] Console error is logged
- [ ] Sentry captures error (if configured)

---

## Performance Testing

### Test 1: Initial Load Time

**Steps:**

1. Open DevTools → Performance tab
2. Click "Record"
3. Navigate to Mi Día page
4. Stop recording when page loads

**Expected:**

- [ ] First Contentful Paint (FCP): < 1.5s
- [ ] Largest Contentful Paint (LCP): < 2.5s
- [ ] Time to Interactive (TTI): < 3.5s
- [ ] No long tasks (> 50ms)

**If Failed:**

- Check bundle size is reasonable
- Verify lazy loading is working
- Consider code splitting

---

### Test 2: Bandwidth Usage

**Steps:**

1. Open DevTools → Network tab
2. Clear network log
3. Refresh Mi Día page
4. Record total transferred size
5. Wait 5 minutes (observe polling vs WebSocket)

**Expected:**

- [ ] Initial load: < 500 KB transferred
- [ ] After 5 minutes with WebSocket: **+0-50 KB** (only real-time changes)
- [ ] No polling requests in Network tab
- [ ] 95%+ bandwidth reduction vs old polling

**If Failed:**

- Check WebSocket is connected
- Verify polling is not running in parallel
- Check for unnecessary refetches

---

### Test 3: React Query Cache

**Steps:**

1. Open Mi Día page
2. Install React Query DevTools extension
3. Open DevTools → React Query tab
4. Look at cache entries

**Expected:**

- [ ] See query: `appointments.barberToday`
- [ ] Status: "success" (green)
- [ ] staleTime: 60000ms (1 minute)
- [ ] Data is cached

5. Navigate away and back
6. Data loads instantly from cache

**If Failed:**

- Check query key is correct
- Verify `staleTime` is set
- Check cache isn't being cleared prematurely

---

## Feature Flag Testing

### Test 1: Mi Día Rollback

**Steps:**

1. Open `.env.local`
2. Change:
   ```bash
   NEXT_PUBLIC_FF_NEW_MI_DIA=false
   ```
3. Restart dev server
4. Navigate to `/mi-dia`

**Expected:**

- [ ] Old version loads (page-old.tsx)
- [ ] No errors in console
- [ ] Features may look different (expected)

**Restore:**

```bash
NEXT_PUBLIC_FF_NEW_MI_DIA=true
```

---

### Test 2: Analytics Rollback

**Steps:**

1. Open `.env.local`
2. Change:
   ```bash
   NEXT_PUBLIC_FF_NEW_ANALYTICS=false
   ```
3. Restart dev server
4. Navigate to `/analiticas`

**Expected:**

- [ ] Old version loads
- [ ] No errors
- [ ] UI may differ from v2

**Restore:**

```bash
NEXT_PUBLIC_FF_NEW_ANALYTICS=true
```

---

## Cross-Browser Testing

Test in **3 browsers** (only major issues, not pixel-perfect):

### Chrome/Edge (Chromium)

- [ ] Mi Día loads
- [ ] Analytics loads
- [ ] Real-time works
- [ ] Charts render

### Firefox

- [ ] Mi Día loads
- [ ] Analytics loads
- [ ] Real-time works
- [ ] Charts render

### Safari

- [ ] Mi Día loads
- [ ] Analytics loads
- [ ] Real-time works
- [ ] Charts render
- [ ] WebSocket connection works (Safari can be picky)

---

## Known Issues

### 1. WebSocket Not Connecting in Safari

**Symptom:** Safari blocks WebSocket connection

**Workaround:**

- Ensure using HTTPS in production (wss:// instead of ws://)
- Check Safari → Preferences → Privacy → Uncheck "Prevent cross-site tracking" for localhost

---

### 2. Charts Not Rendering

**Symptom:** Charts show blank area

**Solution:**

- Clear browser cache
- Verify chart data is not empty
- Check for console errors in chart components

---

### 3. Real-time Delays

**Symptom:** Updates take > 5 seconds

**Causes:**

- Supabase Realtime not enabled for table
- RLS policies blocking subscription
- Network throttling active

**Solution:**

- Check Supabase Dashboard → Database → Realtime
- Verify RLS policies allow SELECT for authenticated users
- Disable throttling in DevTools

---

## Test Results Template

Use this template to record your test results:

```markdown
## Test Results - [Date]

**Tester:** [Your name]
**Environment:** [localhost / staging / production]
**Browser:** [Chrome 120 / Firefox 121 / Safari 17]

### Mi Día Page

- [x] Initial load: PASS
- [x] Stats accuracy: PASS
- [x] Timeline order: PASS
- [x] Real-time create: PASS
- [x] Real-time update: PASS
- [x] Error boundary: PASS
- [x] Query error: PASS

**Issues Found:** None

### Analytics Page

- [x] Initial load: PASS
- [x] Period selector: PASS
- [x] Chart loading: PASS
- [x] Real-time updates: PASS
- [x] Charts error boundary: PASS
- [x] Empty state: PASS

**Issues Found:** None

### Real-time

- [x] WebSocket connection: PASS
- [x] Graceful degradation: PASS
- [x] Multiple subscriptions: PASS

**Issues Found:** None

### Performance

- [x] Initial load < 2.5s: PASS (1.8s)
- [x] Bandwidth reduction: PASS (98% reduction)
- [x] Cache working: PASS

**Issues Found:** None

### Feature Flags

- [x] Mi Día rollback: PASS
- [x] Analytics rollback: PASS

**Issues Found:** None

### Overall Result: ✅ PASS

**Notes:**

- All tests passed successfully
- No critical issues found
- Ready for production
```

---

## Next Steps After Testing

### If All Tests Pass ✅

1. Update PROGRESS.md with test results
2. Deploy to staging environment
3. Monitor Sentry for errors (24-48h)
4. Deploy to production
5. Notify team of new features

### If Tests Fail ❌

1. Document specific failures
2. Create GitHub issues for each bug
3. Prioritize by severity (critical/high/medium/low)
4. Fix issues
5. Re-test
6. Repeat until all tests pass

---

## Resources

- [Integration Patterns Guide](./INTEGRATION_PATTERNS.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Error Boundaries README](../../src/components/error-boundaries/README.md)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)

---

**Last Updated:** Session 118 (Phase 0 Week 7)
**Status:** Ready for Testing
**Estimated Time:** 60-80 minutes for complete test suite
