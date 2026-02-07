# Performance Optimization Checklist

Quick reference for implementing v2.5 and FASE 2 features.

---

## 🔴 CRITICAL FIXES (Must-Do Before Launch)

### 1. Fix Database Index Bug (5 minutes)

```sql
-- In migration 019b, change:
-- ❌ last_activity_at
-- ✅ last_visit_at

CREATE INDEX idx_clients_inactive
ON clients(business_id, last_visit_at)  -- Fixed!
WHERE last_visit_at < now() - interval '30 days';
```

---

### 2. Add Missing Calendar Indexes (10 minutes)

```sql
-- Create migration 019c_calendar_indexes.sql

-- For week/month range queries
CREATE INDEX idx_appointments_scheduled_range
ON appointments(business_id, scheduled_at)
WHERE status IN ('confirmed', 'pending');

-- For barber daily queries (Mi Día)
CREATE INDEX idx_appointments_barber_daily
ON appointments(barber_id, scheduled_at)
WHERE status IN ('confirmed', 'pending');
```

**Impact:** 10x faster calendar queries (200ms → 20ms)

---

### 3. Replace Mi Día Polling with WebSocket (2 hours)

```typescript
// ❌ REMOVE: Polling
useEffect(() => {
  const interval = setInterval(() => {
    refetchAppointments()
  }, 30000)
  return () => clearInterval(interval)
}, [])

// ✅ ADD: WebSocket
useEffect(() => {
  fetchTodayAppointments().then(setAppointments)

  const channel = supabase
    .channel(`barber-${barberId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `barber_id=eq.${barberId}`,
      },
      handleRealtimeUpdate
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [barberId])
```

**Impact:** 95% bandwidth reduction, <500ms update latency

---

### 4. Add RBAC Permission Cache (3 hours)

```typescript
// src/lib/permissions/check-permission.ts
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function checkPermission(
  userId: string,
  businessId: string,
  permission: string
): Promise<boolean> {
  const key = `perms:${userId}:${businessId}`

  // Try cache (5ms)
  const cached = await redis.get<Permissions>(key)
  if (cached) return hasPermission(cached, permission)

  // Fetch from DB (50ms)
  const perms = await fetchPermissions(userId, businessId)
  await redis.setex(key, 300, JSON.stringify(perms))

  return hasPermission(perms, permission)
}
```

**Impact:** 10x faster auth checks (50ms → 5ms)

---

## 🟡 HIGH PRIORITY OPTIMIZATIONS

### 5. Calendar: Single Range Query

```typescript
// ❌ WRONG: Multiple queries
for (const day of days) {
  await fetchAppointmentsForDay(day) // N queries!
}

// ✅ RIGHT: Single range query
const appointments = await supabase
  .from('appointments')
  .select('*, client:clients(*), service:services(*), barber:barbers(*)')
  .eq('business_id', businessId)
  .gte('scheduled_at', rangeStart)
  .lte('scheduled_at', rangeEnd)

// Group client-side
const grouped = groupByDay(appointments)
```

---

### 6. Calendar: React.memo Grid Cells

```typescript
export const WeekTimeSlot = memo(({ date, appointments, onClick }) => {
  return (
    <div onClick={() => onClick(date)}>
      {appointments.map(apt => <AppointmentPill key={apt.id} {...apt} />)}
    </div>
  )
}, (prev, next) => {
  return prev.appointments === next.appointments &&
         prev.date.getTime() === next.date.getTime()
})
```

---

### 7. Settings: Lazy Load Search

```typescript
// Don't load Fuse.js upfront
const SearchModal = lazy(() => import('./search-modal'))

export const SettingsSearch = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Search (⌘K)</button>
      {open && (
        <Suspense fallback={<Skeleton />}>
          <SearchModal onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
```

**Savings:** -6.8KB initial bundle

---

### 8. Business Types: Lazy Load Presets

```typescript
// ❌ WRONG: Bundle all presets
import { allPresets } from './presets'

// ✅ RIGHT: Dynamic import
const presets = {
  barberia: {
    name: 'Barbería',
    loadPreset: () => import('./presets/barberia'),
  },
}

// Load on selection
const preset = await presets[type].loadPreset()
```

**Savings:** -10KB initial bundle

---

## 🟢 NICE-TO-HAVE OPTIMIZATIONS

### 9. Month View: Virtualization (Mobile)

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

export const MonthDaySheet = ({ appointments }) => {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: appointments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5
  })

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      {virtualizer.getVirtualItems().map(row => (
        <AppointmentCard
          key={appointments[row.index].id}
          appointment={appointments[row.index]}
          style={{
            position: 'absolute',
            transform: `translateY(${row.start}px)`
          }}
        />
      ))}
    </div>
  )
}
```

---

### 10. Time Indicator: GPU Acceleration

```typescript
// Update once per minute, not every second
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date())
  }, 60000) // 60 seconds

  return () => clearInterval(interval)
}, [])

// Use CSS transform (GPU accelerated)
<div
  className="time-indicator"
  style={{
    transform: `translateY(${position}px)`,
    willChange: 'transform'
  }}
/>
```

---

## Performance Testing

### Load Test Template

```typescript
// tests/performance/load.spec.ts
import { test, expect } from '@playwright/test'

test('Calendar Week - 50 appointments load time', async ({ page }) => {
  await seedAppointments(50)

  const start = Date.now()
  await page.goto('/citas?view=week')
  await page.waitForSelector('[data-testid="week-grid"]')
  const loadTime = Date.now() - start

  expect(loadTime).toBeLessThan(2000) // 2s budget
})

test('Permission check p95 latency', async ({ request }) => {
  const times = []
  for (let i = 0; i < 100; i++) {
    const start = Date.now()
    await request.get('/api/appointments')
    times.push(Date.now() - start)
  }

  const p95 = calculatePercentile(times, 95)
  expect(p95).toBeLessThan(200) // 200ms budget
})
```

---

## Performance Budgets

| Metric                 | Budget         | How to Measure          |
| ---------------------- | -------------- | ----------------------- |
| Time to Interactive    | <3s            | Lighthouse              |
| First Contentful Paint | <1.5s          | Lighthouse              |
| Bundle Size            | <250KB gzipped | webpack-bundle-analyzer |
| API p95 Latency        | <200ms         | Load tests              |
| Calendar Load          | <2s            | E2E tests               |
| Permission Check       | <10ms          | Integration tests       |

---

## Monitoring Setup

```typescript
// src/lib/monitoring/performance.ts
export function trackMetric(name: string, value: number, tags?: Record<string, string>) {
  // Send to Sentry
  Sentry.metrics.distribution(name, value, { tags })

  // Log structured
  logger.info({ metric: name, value, ...tags })
}

// Usage:
trackMetric('calendar.week.load_time', loadTime, { appointments: 50 })
trackMetric('permission.cache_hit', 1, { cached: true })
```

---

## Pre-Launch Checklist

- [ ] Fix database index column name (last_visit_at)
- [ ] Add calendar range query indexes
- [ ] Replace Mi Día polling with WebSocket
- [ ] Implement RBAC permission cache
- [ ] Calendar uses single range query
- [ ] Settings search lazy loaded
- [ ] Business presets lazy loaded
- [ ] All load tests passing (<2s)
- [ ] Bundle size under 250KB gzipped
- [ ] Lighthouse score >90

---

## Quick Reference: Common Anti-Patterns

### ❌ DON'T

```typescript
// N+1 queries
for (const item of items) {
  await fetchRelated(item.id)
}

// Load everything upfront
import { allPresets } from './presets'

// Poll for updates
setInterval(() => refetch(), 30000)

// No memoization
export const Component = (props) => {
  /* re-renders on every parent update */
}

// Query DB for permissions every request
await db.query('SELECT * FROM roles WHERE...')
```

---

### ✅ DO

```typescript
// Single query with joins
const data = await supabase.from('items').select('*, related(*)')

// Lazy load
const Component = lazy(() => import('./Component'))

// WebSocket subscriptions
supabase.channel('updates').on('postgres_changes', handleUpdate)

// Memoize components
export const Component = memo((props) => {
  /* only re-renders when props change */
})

// Cache permission checks
const cached = await redis.get(key)
```

---

**Last Updated:** 2026-02-03
**Related:** PERFORMANCE_AUDIT_V2.5.md
