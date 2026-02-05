# Page Migration Guide

> **Phase 0 Week 7 - Migration Planning**
>
> Step-by-step guide for migrating remaining dashboard pages to the modern React Query + Real-time + Error Boundaries pattern.

---

## Table of Contents

- [Overview](#overview)
- [Migration Priority](#migration-priority)
- [Page-Specific Plans](#page-specific-plans)
- [Estimated Timeline](#estimated-timeline)
- [Risk Assessment](#risk-assessment)
- [Success Metrics](#success-metrics)

---

## Overview

**Completed:** 2/7 pages (Mi Día ✅, Analytics ✅)

**Remaining:** 5 pages to migrate

**Proven Pattern:**

- React Query for caching
- WebSocket real-time with graceful degradation
- Multi-level error boundaries
- Feature flag for safe rollout

**Average Time:** 4 hours per page (proven with 2 pilots)

---

## Migration Priority

### Priority Matrix

| Page          | Priority | Complexity | Est. Time | Impact    | Why Priority?                       |
| ------------- | -------- | ---------- | --------- | --------- | ----------------------------------- |
| Citas         | 🔴 HIGH  | High       | 8-10h     | Very High | Core booking flow, complex calendar |
| Clientes      | 🔴 HIGH  | Medium     | 6-8h      | High      | Critical for daily operations       |
| Servicios     | 🟡 MED   | Low        | 4-6h      | Medium    | Admin management, less frequent     |
| Barberos      | 🟡 MED   | Low        | 4-6h      | Medium    | Admin management, stable            |
| Configuración | 🟢 LOW   | Low        | 3-4h      | Low       | Infrequent access, already stable   |

**Recommended Order:**

1. **Clientes** (Week 1) - High priority, medium complexity = good next step
2. **Citas** (Week 2) - Highest impact but complex = needs more planning
3. **Servicios** (Week 3) - Quick win, build momentum
4. **Barberos** (Week 4) - Similar to Servicios
5. **Configuración** (Week 5) - Low priority, finish Phase 1

---

## Page-Specific Plans

### 1. Clientes (Clients) - HIGH PRIORITY

**File:** `src/app/(dashboard)/clientes/page.tsx`

**Current State:**

- Manual data fetching with `useEffect`
- No real-time updates
- No error boundaries
- Master-detail view with client profile editor

**Migration Plan:**

#### Step 1: Create React Query Hooks (2-3h)

**Create:** `src/hooks/queries/useClients.ts`

```typescript
// Hook 1: List all clients
export function useClients(businessId: string | null) {
  return useQuery({
    queryKey: queryKeys.clients.list(businessId!),
    queryFn: () => fetchClients(businessId!),
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000, // 2 minutes (clients change less frequently)
  })
}

// Hook 2: Single client detail
export function useClient(clientId: string | null) {
  return useQuery({
    queryKey: queryKeys.clients.detail(clientId!),
    queryFn: () => fetchClient(clientId!),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes (detail view)
  })
}

// Hook 3: Client stats (visits, spending, etc.)
export function useClientStats(clientId: string | null) {
  return useQuery({
    queryKey: queryKeys.clients.stats(clientId!),
    queryFn: () => fetchClientStats(clientId!),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  })
}
```

**Add Query Keys:**

Edit `src/lib/react-query/config.ts`:

```typescript
clients: {
  all: ['clients'] as const,
  list: (businessId: string) => [...queryKeys.clients.all, 'list', businessId] as const,
  detail: (id: string) => [...queryKeys.clients.all, 'detail', id] as const,
  stats: (id: string) => [...queryKeys.clients.all, 'stats', id] as const,
}
```

#### Step 2: Integrate Real-time (1h)

**Use existing hook:** `useRealtimeClients`

```typescript
import { useRealtimeClients } from '@/hooks/use-realtime-clients'

function ClientesPage() {
  const { data: clients } = useClients(businessId)

  // Auto-invalidates queries when clients table changes
  useRealtimeClients({ businessId, enabled: !!businessId })

  // That's it! UI updates automatically when:
  // - New client books from public page
  // - Client info is updated
  // - Client is deleted
}
```

#### Step 3: Add Error Boundaries (1-2h)

**3-Level Protection:**

```typescript
<ComponentErrorBoundary> {/* Level 1: Full page */}
  <ComponentErrorBoundary fallbackTitle="Client list unavailable"> {/* Level 2: List */}
    <ClientListTable clients={clients} />
  </ComponentErrorBoundary>

  <ClientProfileErrorBoundary> {/* Level 3: Profile editor */}
    <ClientProfileEditor client={selectedClient} />
  </ClientProfileErrorBoundary>
</ComponentErrorBoundary>
```

**Use:** `ClientProfileErrorBoundary` (already exists) with read-only fallback

#### Step 4: Feature Flag & Testing (1-2h)

**Add flag:**

```bash
NEXT_PUBLIC_FF_NEW_CLIENTES=true
```

**Test scenarios:**

- [ ] List loads with all clients
- [ ] Select client → profile loads
- [ ] Edit client → saves correctly
- [ ] New booking from public page → appears instantly
- [ ] Delete client → removed from list instantly
- [ ] Network error → graceful fallback

**Estimated Time:** 6-8h

**Risk:** Medium (complex master-detail pattern)

---

### 2. Citas (Calendar) - HIGH PRIORITY

**File:** `src/app/(dashboard)/citas/page.tsx`

**Current State:**

- 953 lines (most complex component)
- 5 calendar views (Day, Week, Month, List, Timeline)
- Manual data fetching with `useEffect`
- No error boundaries
- Multiple state management patterns

**Migration Plan:**

#### Step 1: Create React Query Hooks (3-4h)

**Create:** `src/hooks/queries/useCalendar.ts`

```typescript
// Hook 1: Appointments for date range (all views)
export function useCalendarAppointments(
  businessId: string | null,
  startDate: Date,
  endDate: Date,
  view: CalendarView
) {
  return useQuery({
    queryKey: queryKeys.appointments.calendar(businessId!, startDate, endDate, view),
    queryFn: () => fetchCalendarAppointments(businessId!, startDate, endDate),
    enabled: !!businessId && !!startDate && !!endDate,
    staleTime: 1 * 60 * 1000, // 1 minute (real-time updates)
  })
}

// Hook 2: Available time slots (for quick booking)
export function useAvailableSlots(barberId: string | null, date: Date) {
  return useQuery({
    queryKey: queryKeys.appointments.slots(barberId!, date),
    queryFn: () => fetchAvailableSlots(barberId!, date),
    enabled: !!barberId && !!date,
    staleTime: 30 * 1000, // 30 seconds (high volatility)
  })
}
```

**Add Query Keys:**

```typescript
appointments: {
  all: ['appointments'] as const,
  calendar: (businessId: string, start: Date, end: Date, view: string) =>
    [...queryKeys.appointments.all, 'calendar', businessId, start.toISOString(), end.toISOString(), view] as const,
  slots: (barberId: string, date: Date) =>
    [...queryKeys.appointments.all, 'slots', barberId, date.toISOString()] as const,
}
```

#### Step 2: Integrate Real-time (1h)

**Use existing hook:** `useRealtimeAppointments`

```typescript
import { useRealtimeAppointments } from '@/hooks/use-realtime-appointments'

function CitasPage() {
  const [view, setView] = useState<CalendarView>('week')
  const [dateRange, setDateRange] = useState({ start: Date, end: Date })

  const { data: appointments } = useCalendarAppointments(
    businessId,
    dateRange.start,
    dateRange.end,
    view
  )

  // Auto-invalidates calendar queries on any appointment change
  useRealtimeAppointments({ businessId, enabled: !!businessId })
}
```

#### Step 3: Add Error Boundaries (2-3h)

**Use CalendarErrorBoundary:**

```typescript
<ComponentErrorBoundary> {/* Level 1: Full page */}
  <CalendarErrorBoundary> {/* Level 2: Calendar view */}
    <CalendarComponent
      view={view}
      appointments={appointments}
    />
  </CalendarErrorBoundary>

  <ComponentErrorBoundary fallbackTitle="Booking form unavailable"> {/* Level 3: Forms */}
    <QuickBookingForm />
  </ComponentErrorBoundary>
</ComponentErrorBoundary>
```

**CalendarErrorBoundary fallback:** Simple list view of appointments (already implemented)

#### Step 4: Refactor Calendar Component (2-3h)

**Challenge:** 953 lines in single component

**Approach:**

1. Extract each view to separate component:
   - `CalendarDayView.tsx` (150-200 lines)
   - `CalendarWeekView.tsx` (200-250 lines)
   - `CalendarMonthView.tsx` (150-200 lines)
   - `CalendarListView.tsx` (100-150 lines)
   - `CalendarTimelineView.tsx` (150-200 lines)

2. Create `CalendarViewSwitcher.tsx` to route between views

3. Share common logic via custom hooks:
   - `useCalendarNavigation()` - prev/next/today
   - `useCalendarSelection()` - selected date/time
   - `useAppointmentDrag()` - drag-and-drop logic

**Benefit:** Each view wrapped independently in error boundaries

#### Step 5: Feature Flag & Testing (1-2h)

**Add flag:**

```bash
NEXT_PUBLIC_FF_NEW_CALENDAR=true
```

**Test scenarios:**

- [ ] All 5 views load correctly
- [ ] Navigate between dates (prev/next/today)
- [ ] Create appointment → appears instantly
- [ ] Drag appointment → updates instantly
- [ ] Cancel appointment → removed instantly
- [ ] View switch → maintains state
- [ ] Error in one view → other views still work

**Estimated Time:** 8-10h

**Risk:** High (complex component, needs refactoring)

**Recommendation:** Consider splitting into 2 phases:

- **Phase 1 (6h):** Data integration (React Query + Real-time)
- **Phase 2 (4h):** Component refactoring

---

### 3. Servicios (Services) - MEDIUM PRIORITY

**File:** `src/app/(dashboard)/servicios/page.tsx`

**Current State:**

- Simple CRUD operations
- Table with services list
- Modal for add/edit
- No real-time (admin-only, low volatility)

**Migration Plan:**

#### Step 1: Create React Query Hooks (2-3h)

**Create:** `src/hooks/queries/useServices.ts`

```typescript
// Hook 1: List all services
export function useServices(businessId: string | null) {
  return useQuery({
    queryKey: queryKeys.services.list(businessId!),
    queryFn: () => fetchServices(businessId!),
    enabled: !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes (low volatility)
  })
}

// Hook 2: Service categories (for filters)
export function useServiceCategories(businessId: string | null) {
  return useQuery({
    queryKey: queryKeys.services.categories(businessId!),
    queryFn: () => fetchServiceCategories(businessId!),
    enabled: !!businessId,
    staleTime: 30 * 60 * 1000, // 30 minutes (very stable)
  })
}

// Mutation: Add/Edit/Delete service
export function useServiceMutations() {
  const queryClient = useQueryClient()

  return {
    add: useMutation({
      mutationFn: addService,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.services.all })
      },
    }),
    update: useMutation({
      mutationFn: updateService,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.services.all })
      },
    }),
    delete: useMutation({
      mutationFn: deleteService,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.services.all })
      },
    }),
  }
}
```

#### Step 2: Real-time (Optional, 30min)

**Decision:** Real-time NOT critical for services (admin-only, low volatility)

**Alternative:** Manual invalidation on mutations (already in hooks above)

**If needed:** Create `useRealtimeServices` following same pattern

#### Step 3: Error Boundaries (1h)

```typescript
<ComponentErrorBoundary>
  <ComponentErrorBoundary fallbackTitle="Services list unavailable">
    <ServicesTable services={services} />
  </ComponentErrorBoundary>

  <ComponentErrorBoundary fallbackTitle="Form unavailable">
    <ServiceModal service={selectedService} />
  </ComponentErrorBoundary>
</ComponentErrorBoundary>
```

#### Step 4: Feature Flag & Testing (1h)

**Estimated Time:** 4-6h

**Risk:** Low (simple CRUD, no complex interactions)

---

### 4. Barberos (Barbers) - MEDIUM PRIORITY

**File:** `src/app/(dashboard)/barberos/page.tsx`

**Current State:**

- Similar to Servicios (CRUD operations)
- Table with barbers list
- Profile view with stats
- No real-time needed

**Migration Plan:**

#### Simplified Approach (3-4h)

**Pattern:** Almost identical to Servicios

1. **React Query Hooks (2h):**
   - `useBarbers(businessId)` - List all barbers
   - `useBarberStats(barberId)` - Performance stats
   - `useBarberMutations()` - Add/Edit/Delete

2. **Error Boundaries (1h):**
   - List-level boundary
   - Profile-level boundary
   - Form-level boundary

3. **Testing (1h):**
   - CRUD operations
   - Stats calculations
   - Invite flow (if applicable)

**Estimated Time:** 4-6h

**Risk:** Low (similar to Servicios)

---

### 5. Configuración (Settings) - LOW PRIORITY

**File:** `src/app/(dashboard)/configuracion/page.tsx`

**Current State:**

- Already modernized with iOS-style cards (Session 106)
- Multiple sections (business, appearance, notifications)
- Modal sheets for editors
- Low access frequency

**Migration Plan:**

#### Minimal Changes (3-4h)

**Focus:** Only add React Query for data fetching (no real-time needed)

1. **React Query Hooks (2h):**
   - `useBusinessSettings(businessId)` - Business info
   - `useAppearanceSettings(businessId)` - Theme/branding
   - `useNotificationSettings(userId)` - Notification prefs
   - `useSettingsMutations()` - Save changes

2. **Error Boundaries (1h):**
   - Section-level boundaries (business, appearance, notifications)
   - Form validation boundaries

3. **Testing (1h):**
   - Save business info
   - Update theme
   - Toggle notifications

**Real-time:** Not needed (user-specific settings, immediate updates via mutations)

**Estimated Time:** 3-4h

**Risk:** Very Low (already stable, low traffic)

---

## Estimated Timeline

### Phase 1 (Weeks 1-2): High Priority

| Week | Page     | Hours | Cumulative |
| ---- | -------- | ----- | ---------- |
| 1    | Clientes | 6-8h  | 6-8h       |
| 2    | Citas    | 8-10h | 14-18h     |

**Total:** 14-18h (2 weeks @ 7-9h/week)

### Phase 2 (Weeks 3-4): Medium Priority

| Week | Page      | Hours | Cumulative |
| ---- | --------- | ----- | ---------- |
| 3    | Servicios | 4-6h  | 18-24h     |
| 4    | Barberos  | 4-6h  | 22-30h     |

**Total:** 8-12h (2 weeks @ 4-6h/week)

### Phase 3 (Week 5): Low Priority

| Week | Page          | Hours | Cumulative |
| ---- | ------------- | ----- | ---------- |
| 5    | Configuración | 3-4h  | 25-34h     |

**Total:** 3-4h (1 week @ 3-4h)

### Grand Total

**Time:** 25-34 hours over 5 weeks

**Weekly Average:** 5-7 hours

**Completion Date:** Week 13 (assuming 20h/week work rate, with other tasks)

---

## Risk Assessment

### High Risk

**Citas (Calendar):**

- 953 lines of complex logic
- 5 different views with shared state
- Critical for daily operations
- High user visibility

**Mitigation:**

- Split into 2 phases (data + refactor)
- Extensive testing before rollout
- Feature flag with easy rollback
- Consider beta testing with single barber first

### Medium Risk

**Clientes (Clients):**

- Master-detail pattern complexity
- Real-time updates critical for booking flow
- Edit forms with validation

**Mitigation:**

- Reuse proven `ClientProfileErrorBoundary`
- Test with demo data first
- Monitor Sentry for errors

### Low Risk

**Servicios, Barberos, Configuración:**

- Simple CRUD operations
- Low access frequency
- Admin-only (limited users)
- No critical business logic

**Mitigation:** Standard testing, feature flags

---

## Success Metrics

### Per-Page Metrics

After migrating each page, verify:

- [ ] **Bandwidth Reduction:** 90%+ vs previous implementation
- [ ] **Error Rate:** < 0.1% (Sentry tracking)
- [ ] **User-Perceived Performance:** Lighthouse Score 90+
- [ ] **Cache Hit Rate:** > 80% (React Query DevTools)
- [ ] **Real-time Latency:** < 500ms for updates
- [ ] **Feature Flag Works:** Instant rollback tested

### Overall Success Criteria

After completing all migrations:

- [ ] 7/7 pages modernized
- [ ] Consistent patterns across all pages
- [ ] 95%+ bandwidth reduction (average)
- [ ] No increase in error rate
- [ ] Improved user satisfaction (survey/feedback)
- [ ] Developer velocity increased (easier to add features)

---

## Next Actions

### Immediate (This Week)

- [ ] Review this migration guide with team
- [ ] Prioritize: Start with Clientes or Citas?
- [ ] Set up monitoring (bandwidth, errors)
- [ ] Create migration tracking board (Notion/Linear)

### Week 1

- [ ] Begin Clientes migration (6-8h)
- [ ] Daily testing and iteration
- [ ] Monitor Sentry for errors
- [ ] Document any deviations from plan

### Week 2

- [ ] Complete Clientes, deploy to production
- [ ] Begin Citas Phase 1 (data integration)
- [ ] Plan Citas Phase 2 (refactoring)

---

## Resources

- [Integration Patterns Guide](./INTEGRATION_PATTERNS.md) - Full pattern documentation
- [Error Boundaries README](../../src/components/error-boundaries/README.md) - Error handling guide
- [React Query Config](../../src/lib/react-query/config.ts) - Query configuration
- [PROGRESS.md](../../PROGRESS.md) - Track completion status

---

**Last Updated:** Session 118 (Phase 0 Week 7)
**Status:** Planning Complete, Ready for Phase 1
**Next:** Start Clientes migration (Week 1)
