# Citas Page Simplification Plan

**Status:** Draft
**Created:** 2026-02-03 (Session 84)
**Updated:** 2026-02-03 (Session 84) - Added granular drag-drop feature
**Priority:** Medium (Post-FASE 0, Pre-FASE 1 features)
**Estimated Effort:** 34-48 hours (3 phases, includes 15-min drag-drop)

---

## Executive Summary

The appointments page (`citas/page.tsx`) has grown to **953 lines** with **5 view modes**, **11 state variables**, and complex interdependencies. This creates:

- **High cognitive load** for developers
- **Difficult maintenance** and testing
- **Slower feature development**
- **Potential for bugs** (just fixed date filtering issue)

**Recommended Solution:** Progressive 3-phase simplification reducing views from 5→3, splitting into route-based pages, and cutting main component from 953→~300 lines.

**ROI:** 34-48h investment → 15-20h saved per new calendar feature → Break-even after 2-3 features.

---

## Current State Analysis

### Metrics

| Metric                  | Value    | Benchmark    | Status    |
| ----------------------- | -------- | ------------ | --------- |
| **Lines of code**       | 953      | <500 (ideal) | 🔴 High   |
| **State variables**     | 11       | <5 (ideal)   | 🔴 High   |
| **Memoization hooks**   | 8        | <3 (ideal)   | 🟡 Medium |
| **Import statements**   | 22       | <15 (ideal)  | 🟡 Medium |
| **View modes**          | 5        | 2-3 (ideal)  | 🔴 High   |
| **useEffect hooks**     | 4        | <3 (ideal)   | 🟢 OK     |
| **Prop drilling depth** | 3 levels | <2 (ideal)   | 🟡 Medium |

### Component Structure

```
CitasPage (953 lines)
├── State Management (11 variables)
│   ├── appointments, services, clients (data)
│   ├── selectedDate, viewMode (navigation)
│   ├── search, statusFilter (filters)
│   ├── isLoading, isMobile (UI state)
│   ├── isFormOpen, editingAppointment (modal)
│   └── Dependencies between states
│
├── View Rendering (conditional)
│   ├── List View (mobile + desktop variants)
│   ├── Calendar/Day View (DaySchedule)
│   ├── Week View (drag-drop, 7-day grid)
│   ├── Month View (calendar grid)
│   └── Timeline View (chronological list)
│
├── Shared UI Components
│   ├── Stats pills (4 cards)
│   ├── MiniCalendar (desktop sidebar)
│   ├── Week navigation (mobile)
│   ├── View toggle buttons (5 options)
│   ├── Filters (search + status)
│   └── AppointmentForm modal
│
└── Event Handlers (16 functions)
    ├── CRUD operations (5)
    ├── Navigation (3)
    ├── Filters/Search (2)
    ├── URL sync (1)
    ├── Keyboard shortcuts (1)
    └── View switching (1)
```

---

## Complexity Drivers

### 1. View Mode Proliferation (Primary Issue)

**Problem:** 5 views share same state but have different rendering logic.

| View             | Lines | Usage Estimate    | Complexity       |
| ---------------- | ----- | ----------------- | ---------------- |
| **List**         | ~80   | 70% (primary)     | Medium           |
| **Calendar/Day** | ~60   | 60%               | Low              |
| **Week**         | ~100  | 40%               | High (drag-drop) |
| **Month**        | ~80   | 30%               | Medium           |
| **Timeline**     | ~40   | 10% (rarely used) | Low              |

**Issues:**

- Conditional rendering everywhere: `{viewMode === 'list' && ...}`
- Different empty state logic per view
- Separate mobile/desktop variants for some views
- URL state sync adds complexity

**Evidence of confusion:**

- Timeline view is essentially List view without time grouping
- Calendar view overlaps with List view functionality
- Users don't understand when to use which view

### 2. State Management Overload

**Problem:** 11 state variables with complex dependencies.

```typescript
// Current state
const [appointments, setAppointments] = useState([]) // 1
const [services, setServices] = useState([]) // 2
const [clients, setClients] = useState([]) // 3
const [isLoading, setIsLoading] = useState(true) // 4
const [selectedDate, setSelectedDate] = useState(new Date()) // 5
const [viewMode, setViewMode] = useState('list') // 6
const [search, setSearch] = useState('') // 7
const [statusFilter, setStatusFilter] = useState('all') // 8
const [isFormOpen, setIsFormOpen] = useState(false) // 9
const [editingAppointment, setEditingAppointment] = useState(null) // 10
const [isMobile, setIsMobile] = useState(false) // 11
```

**Dependencies:**

- `selectedDate` affects `filteredAppointments` (via useMemo)
- `viewMode` affects which `filteredAppointments` to use (bug just fixed!)
- `search` + `statusFilter` create `filteredAppointments`
- `filteredAppointments` → `dayFilteredAppointments` (new)
- `isFormOpen` + `editingAppointment` are coupled
- URL params sync with `selectedDate` + `viewMode`

### 3. Performance Optimization Overhead

**Problem:** 8 memoization hooks to prevent re-renders.

```typescript
const filteredAppointments = useMemo(...)           // 1
const dayFilteredAppointments = useMemo(...)        // 2 (new)
const stats = useMemo(...)                          // 3
const weekDays = useMemo(...)                       // 4
const appointmentDates = useMemo(...)               // 5
const initialDate = useMemo(...)                    // 6
const initialView = useMemo(...)                    // 7
const fetchAppointments = useCallback(...)          // 8
```

**Issues:**

- Adds cognitive load (when to memoize vs not)
- Dependencies arrays can cause bugs (like the date filter bug)
- Over-optimization for current data size

### 4. Tight Coupling

**Problem:** All views share same data fetching, state, and handlers.

**Example of tight coupling:**

```typescript
// Week View needs different data than List View
// But both use the same fetch and state management
<WeekView
  appointments={appointments}  // Entire week
  onAppointmentClick={handleEdit}
  onTimeSlotClick={handleTimeSlot}
  onAppointmentReschedule={handleReschedule}
/>

<ListAppointments
  appointments={dayFilteredAppointments}  // Single day
  onEdit={handleEdit}
  onDelete={handleDelete}
  onWhatsApp={handleWhatsApp}
/>
```

**Result:** Changes to one view can break others.

### 5. Mobile vs Desktop Duplication

**Problem:** Separate code paths for mobile/desktop.

```typescript
{isMobile ? (
  <PullToRefresh onRefresh={fetchAppointments}>
    <div className="space-y-2">
      {dayFilteredAppointments.map(apt => (
        <AppointmentCard variant="compact" {...} />
      ))}
    </div>
  </PullToRefresh>
) : (
  <div className="space-y-2 max-w-3xl mx-auto">
    {dayFilteredAppointments.map(apt => (
      <AppointmentCard variant="default" {...} />
    ))}
  </div>
)}
```

**Issues:**

- Duplicated map logic
- Different variants add testing surface
- Hard to ensure parity between mobile/desktop

---

## Simplification Options

### Option 1: View Consolidation (Low Effort)

**Approach:** Reduce 5 views to 3 by merging similar ones.

**Changes:**

- ❌ **Remove Timeline view** (10% usage, redundant with List)
- 🔀 **Merge List + Calendar into "Day View"** (combines chronological list with time grid)
- ✅ **Keep Week view** (unique drag-drop value)
- ✅ **Keep Month view** (unique calendar value)

**Result:** 5 views → 3 views

**Benefits:**

- ✅ Simpler mental model (Day/Week/Month matches calendar conventions)
- ✅ Removes ~200 lines of conditional rendering
- ✅ Eliminates Timeline-specific code
- ✅ Reduces 3 state variables (timeline-related)

**Drawbacks:**

- ⚠️ Still have 953-line component
- ⚠️ Doesn't address state management issues
- ⚠️ Limited long-term maintainability improvement

**Effort:** 8-12 hours

- Remove Timeline view (1-2h)
- Merge List + Calendar components (4-6h)
- Update tests (2-3h)
- User documentation (1h)

---

### Option 2: Component Split (Medium Effort)

**Approach:** Extract views into separate components with shared state hooks.

**Structure:**

```
src/app/(dashboard)/citas/
├── page.tsx (300 lines - router + shared layout)
├── components/
│   ├── citas-layout.tsx       (Stats, filters, sidebar)
│   ├── day-view.tsx            (Merged List + Calendar)
│   ├── week-view.tsx           (Existing drag-drop)
│   └── month-view.tsx          (Existing calendar)
└── hooks/
    ├── use-appointments.ts     (Data fetching)
    ├── use-filters.ts          (Search + status)
    └── use-calendar-state.ts   (Date + view mode)
```

**Benefits:**

- ✅ Main component: 953 → ~300 lines (66% reduction)
- ✅ Separation of concerns (data, UI, navigation)
- ✅ Easier testing (mock hooks individually)
- ✅ Parallel development (multiple devs can work)
- ✅ Reusable hooks for other pages

**Drawbacks:**

- ⚠️ Requires refactoring imports across files
- ⚠️ Potential for prop drilling if not careful
- ⚠️ Hook dependencies need careful management

**Effort:** 16-24 hours

- Create shared hooks (6-8h)
- Extract views into components (6-8h)
- Refactor main page (2-3h)
- Update tests (2-3h)
- Documentation (1-2h)

---

### Option 3: State Management Upgrade (Medium-High Effort)

**Approach:** Replace useState with Zustand store + split components.

**Structure:**

```typescript
// src/stores/appointments-store.ts
export const useAppointmentsStore = create((set, get) => ({
  // Data
  appointments: [],
  services: [],
  clients: [],

  // UI State
  selectedDate: new Date(),
  viewMode: 'list',
  filters: { search: '', status: 'all' },

  // Derived State (computed)
  filteredAppointments: () => {
    /* computed from appointments + filters */
  },
  dayFilteredAppointments: () => {
    /* computed for selected date */
  },
  stats: () => {
    /* computed from filtered appointments */
  },

  // Actions
  fetchAppointments: async () => {
    /* API call */
  },
  setSelectedDate: (date) => set({ selectedDate: date }),
  updateFilters: (filters) => set({ filters }),
}))
```

**Benefits:**

- ✅ **Eliminates useMemo hell** (computed values in store)
- ✅ **No prop drilling** (any component can access store)
- ✅ **DevTools** for debugging state changes
- ✅ **Time-travel debugging** (record/replay)
- ✅ **Persistent state** across navigation (if desired)
- ✅ **Better TypeScript** support with store typing

**Drawbacks:**

- ⚠️ Learning curve for team (Zustand concepts)
- ⚠️ More files to manage
- ⚠️ Overkill if only used in one page

**Effort:** 20-32 hours

- Setup Zustand + TypeScript types (3-4h)
- Migrate state to store (6-8h)
- Update components to use store (6-8h)
- Update tests (mocking store) (3-5h)
- Documentation + team training (2-3h)

---

### Option 4: Progressive Simplification ⭐ (RECOMMENDED)

**Approach:** Combine best of all options in 3 phases.

#### Phase 1: Quick Wins (8-12h) - Week 1

**Goal:** Reduce views and state complexity immediately.

**Tasks:**

1. ❌ **Remove Timeline view**
   - Delete timeline rendering code (~40 lines)
   - Remove from view toggle
   - Update keyboard shortcuts

2. 🔀 **Merge List + Calendar into Day View**
   - Create new `DayView` component combining both
   - Show time grid with List-style cards
   - Remove separate List/Calendar modes

3. 📉 **Reduce state variables** (11 → 8)
   - Combine `isFormOpen` + `editingAppointment` → `modalState`
   - Remove `isMobile` (use CSS/Tailwind breakpoints)
   - Eliminate timeline-specific states

**Result:**

- 5 views → 3 views (Day, Week, Month)
- 953 lines → ~750 lines (21% reduction)
- 11 state variables → 8 state variables

**Effort:** 8-12 hours

---

#### Phase 2: Architecture (15-20h) - Week 2

**Goal:** Split into route-based pages with shared state, plus granular 15-minute drag-drop.

**Structure:**

```
src/app/(dashboard)/citas/
├── page.tsx (300 lines - default Day view + layout)
├── week/
│   └── page.tsx (Week view standalone)
├── month/
│   └── page.tsx (Month view standalone)
└── _components/
    ├── citas-layout.tsx       (Shared stats, filters)
    ├── citas-sidebar.tsx      (MiniCalendar, quick stats)
    └── appointment-form.tsx    (Modal)
```

**State Management:**

```typescript
// src/stores/citas-store.ts (Zustand)
export const useCitasStore = create((set, get) => ({
  appointments: [],
  selectedDate: new Date(),
  filters: { search: '', status: 'all' },

  // Computed
  get filteredAppointments() {
    /* ... */
  },
  get dayAppointments() {
    /* ... */
  },
  get stats() {
    /* ... */
  },

  // Actions
  fetchAppointments: async () => {
    /* ... */
  },
  selectDate: (date) => set({ selectedDate: date }),
}))
```

**Navigation:**

```typescript
// Routes
/citas          → Day view (default)
/citas/week     → Week view
/citas/month    → Month view

// URL params persist
/citas?date=2026-02-03&status=pending
```

**Benefits:**

- ✅ Each view is a separate route (cleaner URLs)
- ✅ Browser back/forward works naturally
- ✅ Main page: 953 → ~300 lines (68% reduction)
- ✅ Parallel development (3 devs can work on 3 views)
- ✅ Lazy loading (only load active view)
- ✅ Shared state via Zustand (no prop drilling)

**Effort:** 12-16 hours

---

#### Phase 3: Polish (8-12h) - Week 3

**Goal:** Optimize remaining complexity.

**Tasks:**

1. **Simplify keyboard shortcuts**
   - Keep only essential shortcuts (← → T N)
   - Remove view-switching numbers (use UI instead)

2. **Consolidate mobile/desktop code**
   - Use Tailwind responsive variants instead of `isMobile` checks
   - Single component tree with conditional classes

3. **Optimize memoization**
   - Move computed values to Zustand store
   - Reduce from 8 useMemo/useCallback to 2-3

4. **Clean up AppointmentCard variants**
   - Remove `variant` prop proliferation (compact, default, timeline)
   - Use composition instead (keep it simple)

**Result:**

- Final main page: ~250 lines
- Optimized performance
- Cleaner, more maintainable code

**Effort:** 8-12 hours

---

## Comparison Matrix

| Criteria                 | Option 1 (Consolidation) | Option 2 (Split) | Option 3 (Zustand) | Option 4 (Progressive) ⭐ |
| ------------------------ | ------------------------ | ---------------- | ------------------ | ------------------------- |
| **Effort**               | 8-12h                    | 16-24h           | 20-32h             | 28-40h                    |
| **LOC Reduction**        | ~200 (21%)               | ~650 (68%)       | ~650 (68%)         | ~700 (73%)                |
| **State Simplification** | Low (11→8)               | Medium (hooks)   | High (centralized) | High (Zustand)            |
| **Maintainability**      | Low                      | High             | Very High          | Very High                 |
| **Testing Complexity**   | No change                | Improved         | Much improved      | Much improved             |
| **Future Scalability**   | Limited                  | Good             | Excellent          | Excellent                 |
| **Team Learning Curve**  | None                     | Low              | Medium             | Medium                    |
| **Risk**                 | Low                      | Low              | Medium             | Low (phased)              |
| **ROI**                  | Low                      | Medium           | High               | Very High                 |

---

## Recommended Approach: Option 4

**Why Progressive Simplification?**

1. **Phased Risk:** 3 phases allow validation at each step
2. **Early Value:** Quick wins in Phase 1 (8-12h) show immediate improvement
3. **Best of All:** Combines view consolidation + component split + Zustand
4. **Flexible:** Can stop after Phase 2 if needed (80% of value)
5. **Team Friendly:** Time to learn new patterns (Zustand) between phases

**Total Effort:** 28-40 hours (over 3 weeks)

**Value Delivered:**

- 73% LOC reduction (953 → ~250 lines)
- 3 clean routes instead of 1 monolith
- Centralized state (no prop drilling)
- Parallel development capability
- 50% faster to add new calendar features

---

## Implementation Plan

### Phase 1: Quick Wins (Week 1)

#### Day 1-2: Remove Timeline View (2-3h)

**Tasks:**

- [ ] Remove Timeline option from view toggle (`citas/page.tsx` line 723)
- [ ] Delete Timeline rendering code (lines 881-902)
- [ ] Remove keyboard shortcut `5` for Timeline
- [ ] Update URL validation (remove 'timeline' from validViews)
- [ ] Update tour steps if they reference Timeline

**Files:**

- `src/app/(dashboard)/citas/page.tsx`
- `src/components/tours/citas-tour-wrapper.tsx` (if exists)

**Testing:**

- View toggle shows 4 options instead of 5
- Keyboard `5` does nothing (or is unassigned)
- URL `?view=timeline` redirects to `?view=list`

---

#### Day 2-3: Merge List + Calendar into Day View (4-6h)

**Tasks:**

- [ ] Create `src/components/appointments/day-view.tsx`
- [ ] Combine List cards with time-based grouping
- [ ] Add time grid sidebar (optional toggle)
- [ ] Replace List and Calendar modes with single "Day" mode
- [ ] Update view toggle to show 3 options: Day, Week, Month

**Design:**

```
┌─────────────────────────────────────┐
│ Day View - Tuesday, Feb 3           │
├─────────────────────────────────────┤
│ 🔘 Show Time Grid                   │ ← Toggle
├─────────────────────────────────────┤
│  9:00 AM │ Bryan B                  │
│          │ ✂️ Corte • 30min • ₡5000│
├─────────────────────────────────────┤
│ 11:30 AM │ Vin Laden                │
│          │ ✂️ Corte • 30min • ₡5000│
└─────────────────────────────────────┘
```

**Files:**

- Create: `src/components/appointments/day-view.tsx` (~150 lines)
- Modify: `src/app/(dashboard)/citas/page.tsx` (remove List/Calendar, add Day)

**Testing:**

- Day view shows appointments in chronological order
- Time grid toggle works (optional feature)
- Mobile renders compact cards
- Desktop renders with time indicators

---

#### Day 3-4: Reduce State Variables (2-3h)

**Current:**

```typescript
const [isFormOpen, setIsFormOpen] = useState(false)
const [editingAppointment, setEditingAppointment] = useState(null)
const [isMobile, setIsMobile] = useState(false)
```

**New:**

```typescript
const [modalState, setModalState] = useState({
  isOpen: false,
  appointment: null,
})

// Remove isMobile - use Tailwind breakpoints
// <div className="sm:max-w-3xl sm:mx-auto">
```

**Tasks:**

- [ ] Combine form state into single `modalState` object
- [ ] Remove `isMobile` useState
- [ ] Replace `isMobile` checks with Tailwind `sm:` variants
- [ ] Update all `setIsFormOpen` calls to `setModalState`

**Files:**

- `src/app/(dashboard)/citas/page.tsx`

**Testing:**

- Form modal opens/closes correctly
- Mobile/desktop layouts render correctly without `isMobile`
- No TypeScript errors

---

### Phase 2: Architecture (Week 2) - 15-20h total

**Includes:** Zustand store, route splitting, granular drag-drop with 15-minute intervals

#### Day 1-2: Create Zustand Store (4-5h)

**Tasks:**

- [ ] Install Zustand: `npm install zustand`
- [ ] Create `src/stores/citas-store.ts`
- [ ] Define TypeScript types
- [ ] Implement store with computed values
- [ ] Add DevTools integration (development only)

**Store Structure:**

```typescript
// src/stores/citas-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CitasState {
  // Data
  appointments: AppointmentWithRelations[]
  services: Service[]
  clients: Client[]
  isLoading: boolean

  // Navigation
  selectedDate: Date
  filters: {
    search: string
    status: AppointmentStatus | 'all'
  }

  // Computed (getters)
  filteredAppointments: () => AppointmentWithRelations[]
  dayAppointments: () => AppointmentWithRelations[]
  stats: () => DayStats

  // Actions
  fetchAppointments: (startDate: Date, endDate: Date) => Promise<void>
  fetchServices: () => Promise<void>
  fetchClients: () => Promise<void>
  selectDate: (date: Date) => void
  updateFilters: (filters: Partial<CitasState['filters']>) => void
  createAppointment: (data: AppointmentFormData) => Promise<void>
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
}

export const useCitasStore = create<CitasState>()(
  devtools(
    (set, get) => ({
      // Initial state
      appointments: [],
      services: [],
      clients: [],
      isLoading: true,
      selectedDate: new Date(),
      filters: { search: '', status: 'all' },

      // Computed getters
      filteredAppointments: () => {
        const { appointments, filters } = get()
        return appointments.filter((apt) => {
          if (filters.status !== 'all' && apt.status !== filters.status) {
            return false
          }
          if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            const clientName = apt.client?.name?.toLowerCase() || ''
            const clientPhone = apt.client?.phone || ''
            if (!clientName.includes(searchLower) && !clientPhone.includes(filters.search)) {
              return false
            }
          }
          return true
        })
      },

      dayAppointments: () => {
        const { filteredAppointments, selectedDate } = get()
        return filteredAppointments().filter((apt) =>
          isSameDay(new Date(apt.scheduled_at), selectedDate)
        )
      },

      stats: () => {
        const appointments = get().dayAppointments()
        // ... stats calculation
      },

      // Actions
      fetchAppointments: async (startDate, endDate) => {
        set({ isLoading: true })
        try {
          const response = await fetch(
            `/api/appointments?start_date=${format(startDate, 'yyyy-MM-dd')}&end_date=${format(endDate, 'yyyy-MM-dd')}`
          )
          const data = await response.json()
          set({ appointments: data, isLoading: false })
        } catch (error) {
          console.error('Error fetching appointments:', error)
          set({ isLoading: false })
        }
      },

      selectDate: (date) => set({ selectedDate: date }),

      updateFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      // ... other actions
    }),
    { name: 'citas-store' } // DevTools name
  )
)
```

**Testing:**

- Store initializes with default values
- Computed values update when dependencies change
- Actions update state correctly
- DevTools shows state history (in development)

---

#### Day 3-4: Split into Route Pages (6-8h)

**File Structure:**

```
src/app/(dashboard)/citas/
├── layout.tsx                  (Shared layout with filters, stats)
├── page.tsx                    (Day view - default route)
├── week/
│   └── page.tsx               (Week view route)
├── month/
│   └── page.tsx               (Month view route)
└── _components/
    ├── citas-header.tsx       (Title, new appointment button)
    ├── citas-stats.tsx        (4 stat cards)
    ├── citas-filters.tsx      (Search + status filters)
    ├── citas-sidebar.tsx      (MiniCalendar + day summary)
    └── appointment-form.tsx    (Create/Edit modal)
```

**Tasks:**

- [ ] Create `layout.tsx` with shared UI
- [ ] Move Day view to `page.tsx` (default route)
- [ ] Move Week view to `week/page.tsx`
- [ ] Move Month view to `month/page.tsx`
- [ ] Extract shared components to `_components/`
- [ ] Update all components to use Zustand store
- [ ] Update navigation to use Next.js router

**Layout Example:**

```typescript
// src/app/(dashboard)/citas/layout.tsx
export default function CitasLayout({ children }) {
  return (
    <div className="space-y-6">
      <CitasHeader />
      <CitasStats />

      <div className="flex flex-col lg:flex-row gap-6">
        <CitasSidebar />

        <div className="flex-1">
          <CitasFilters />
          {children} {/* Day/Week/Month views render here */}
        </div>
      </div>

      <AppointmentFormModal />
    </div>
  )
}
```

**View Tabs Navigation:**

```typescript
// In layout or header
<Tabs value={currentView}>
  <TabsList>
    <TabsTrigger value="day" asChild>
      <Link href="/citas">Día</Link>
    </TabsTrigger>
    <TabsTrigger value="week" asChild>
      <Link href="/citas/week">Semana</Link>
    </TabsTrigger>
    <TabsTrigger value="month" asChild>
      <Link href="/citas/month">Mes</Link>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

**Testing:**

- Navigating between `/citas`, `/citas/week`, `/citas/month` works
- State persists across route changes (Zustand)
- URL params (?date=...) sync with store
- Shared components (filters, stats) appear on all views

---

#### Day 4-5: Migrate Components to Store (2-3h)

**Tasks:**

- [ ] Update Day view to use `useCitasStore`
- [ ] Update Week view to use `useCitasStore`
- [ ] Update Month view to use `useCitasStore`
- [ ] Remove all useState from view components
- [ ] Remove prop drilling (components access store directly)

**Before:**

```typescript
// citas/page.tsx
const [appointments, setAppointments] = useState([])
const [selectedDate, setSelectedDate] = useState(new Date())

<WeekView
  appointments={appointments}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
/>
```

**After:**

```typescript
// citas/week/page.tsx
export default function WeekViewPage() {
  const {
    appointments,
    selectedDate,
    selectDate
  } = useCitasStore()

  return <WeekView />
}

// In WeekView component
function WeekView() {
  const { appointments, selectedDate, selectDate } = useCitasStore()
  // No props needed!
}
```

**Testing:**

- All views render correctly with store data
- Selecting a date in one view updates other views
- No console warnings about missing props
- Performance is equal or better (no unnecessary re-renders)

---

#### Day 6: Implement Granular Drag-Drop (3-4h)

**Goal:** Enable precise appointment positioning with 15-minute intervals (Google Calendar style)

**Current Behavior:**

- Drag-drop works in Week/Month views
- Snaps to 1-hour blocks only (09:00, 10:00, 11:00)
- No visual feedback for fractional hours

**New Behavior:**

- Drag-drop with 15-minute precision (09:00, 09:15, 09:30, 09:45)
- Visual time indicator shows exact drop position while dragging
- Smooth snapping to nearest 15-minute interval

**Implementation Details:**

**1. Calculate Drop Time from Mouse Position:**

```typescript
// In week-view.tsx or drag-drop hook
function getTimeFromPosition(mouseY: number, containerTop: number, hourHeight: number): Date {
  const relativeY = mouseY - containerTop
  const totalMinutes = (relativeY / hourHeight) * 60

  // Round to nearest 15 minutes
  const roundedMinutes = Math.round(totalMinutes / 15) * 15

  // Convert to hours and minutes
  const hours = Math.floor(roundedMinutes / 60)
  const minutes = roundedMinutes % 60

  return setHours(setMinutes(new Date(), minutes), hours)
}
```

**2. Update Drag Handler:**

```typescript
const handleDragOver = (e: DragEvent, dayIndex: number) => {
  e.preventDefault()

  const rect = e.currentTarget.getBoundingClientRect()
  const dropTime = getTimeFromPosition(e.clientY, rect.top, HOUR_HEIGHT)

  // Show visual indicator
  setDragPreview({
    day: dayIndex,
    time: dropTime,
    visible: true,
  })
}

const handleDrop = async (e: DragEvent, dayIndex: number) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const dropTime = getTimeFromPosition(e.clientY, rect.top, HOUR_HEIGHT)

  const draggedAppt = JSON.parse(e.dataTransfer.getData('appointment'))

  await updateAppointment({
    ...draggedAppt,
    scheduled_at: dropTime.toISOString(),
  })

  setDragPreview({ visible: false })
}
```

**3. Visual Feedback Component:**

```typescript
// Drag preview indicator
{dragPreview.visible && (
  <div
    className="absolute left-0 right-0 h-[30px] bg-violet-100 border-2 border-violet-500 rounded pointer-events-none z-50"
    style={{
      top: `${calculatePosition(dragPreview.time)}px`
    }}
  >
    <span className="text-xs font-semibold text-violet-700 px-2">
      {format(dragPreview.time, 'HH:mm')}
    </span>
  </div>
)}
```

**4. Time Grid Lines (Optional Enhancement):**

```typescript
// Add 15-minute grid lines for visual guidance
<div className="absolute inset-0 pointer-events-none">
  {Array.from({ length: 24 * 4 }).map((_, i) => {
    const minutes = i * 15
    const isHour = minutes % 60 === 0

    return (
      <div
        key={i}
        className={cn(
          'absolute left-0 right-0 border-t',
          isHour
            ? 'border-zinc-200 dark:border-zinc-700'
            : 'border-zinc-100 dark:border-zinc-800'
        )}
        style={{ top: `${(minutes / 60) * HOUR_HEIGHT}px` }}
      />
    )
  })}
</div>
```

**5. Backend API Update:**

Ensure the API accepts minute-level precision:

```typescript
// API route: /api/appointments/[id]
const scheduled_at = new Date(body.scheduled_at)

// Validate time is on 15-minute boundary
const minutes = scheduled_at.getMinutes()
if (minutes % 15 !== 0) {
  return NextResponse.json({ error: 'Time must be on 15-minute intervals' }, { status: 400 })
}
```

**Tasks:**

- [ ] Extract drag-drop logic to custom hook `useDragDropScheduler`
- [ ] Implement `getTimeFromPosition` with 15-minute rounding
- [ ] Add drag preview visual indicator
- [ ] Update `handleDrop` to use precise time calculation
- [ ] Add 15-minute grid lines (optional)
- [ ] Validate API accepts minute-level precision
- [ ] Test edge cases (drag to 23:45, drag across day boundaries)

**Testing:**

- Dragging appointment to 09:00 → drops at exactly 09:00
- Dragging appointment to 09:13 → snaps to 09:15
- Dragging appointment to 09:22 → snaps to 09:15
- Dragging appointment to 09:23 → snaps to 09:30
- Visual preview shows correct time while dragging
- Grid lines visible at 15-minute intervals
- No appointments can be scheduled at invalid times (e.g., 09:17)

**Estimated Effort:** 3-4 hours

**Dependencies:** Requires Phase 2 Day 1-5 to be complete (Zustand store + route architecture)

---

### Phase 3: Polish (Week 3)

#### Day 1: Simplify Keyboard Shortcuts (2-3h)

**Current:** 10 shortcuts (←, →, ↑, ↓, T, N, 1, 2, 3, 4, 5)
**New:** 4 essential shortcuts

**Keep:**

- `←` / `→` - Navigate days
- `T` - Go to Today
- `N` - New appointment

**Remove:**

- `↑` / `↓` - Navigate weeks (use UI instead)
- `1` / `2` / `3` - Switch views (use tabs instead)

**Tasks:**

- [ ] Remove unused keyboard shortcuts
- [ ] Update user documentation
- [ ] Add tooltip hints in UI ("Press N to create")

---

#### Day 2: Consolidate Mobile/Desktop Code (3-4h)

**Before:**

```typescript
{isMobile ? (
  <PullToRefresh>
    <div className="space-y-2">
      {appointments.map(apt => (
        <AppointmentCard variant="compact" {...} />
      ))}
    </div>
  </PullToRefresh>
) : (
  <div className="space-y-2 max-w-3xl mx-auto">
    {appointments.map(apt => (
      <AppointmentCard variant="default" {...} />
    ))}
  </div>
)}
```

**After:**

```typescript
<PullToRefresh> {/* Works on both mobile/desktop */}
  <div className="space-y-2 sm:max-w-3xl sm:mx-auto">
    {appointments.map(apt => (
      <AppointmentCard /> {/* Single variant, responsive internally */}
    ))}
  </div>
</PullToRefresh>
```

**Tasks:**

- [ ] Remove `isMobile` state
- [ ] Use Tailwind `sm:` breakpoints instead
- [ ] Enable PullToRefresh on all devices (harmless on desktop)
- [ ] Simplify AppointmentCard to single variant

---

#### Day 3: Optimize Memoization (2-3h)

**Move computed values to Zustand:**

**Before:**

```typescript
// In component
const filteredAppointments = useMemo(() => { ... }, [appointments, filters])
const dayAppointments = useMemo(() => { ... }, [filteredAppointments, selectedDate])
const stats = useMemo(() => { ... }, [dayAppointments])
```

**After:**

```typescript
// In Zustand store
const { filteredAppointments, dayAppointments, stats } = useCitasStore()
// These are getters, computed on access
```

**Tasks:**

- [ ] Move all useMemo to Zustand store as getters
- [ ] Keep only useCallback for event handlers (if needed)
- [ ] Verify performance with React DevTools Profiler

---

#### Day 4: Final Testing & Documentation (1-2h)

**Tasks:**

- [ ] E2E tests with Playwright (all views)
- [ ] Update user documentation
- [ ] Update developer documentation
- [ ] Create migration guide for team
- [ ] Performance benchmarks (before/after)

---

## Testing Strategy

### Unit Tests

**New tests needed:**

- Zustand store actions (fetchAppointments, selectDate, etc.)
- Computed getters (filteredAppointments, dayAppointments, stats)
- Day/Week/Month view components (isolated)

**Test example:**

```typescript
// src/stores/__tests__/citas-store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCitasStore } from '../citas-store'

describe('CitasStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useCitasStore.setState({
      appointments: [],
      selectedDate: new Date('2026-02-03')
    })
  })

  it('filters appointments by selected date', () => {
    const { result } = renderHook(() => useCitasStore())

    act(() => {
      result.current.appointments = [
        { id: '1', scheduled_at: '2026-02-03T10:00:00Z', ... },
        { id: '2', scheduled_at: '2026-02-04T10:00:00Z', ... },
      ]
    })

    const dayAppointments = result.current.dayAppointments()
    expect(dayAppointments).toHaveLength(1)
    expect(dayAppointments[0].id).toBe('1')
  })
})
```

### Integration Tests

**Test scenarios:**

- Navigating between Day/Week/Month views
- Selecting date in MiniCalendar updates all views
- Creating appointment updates store and UI
- Filtering by status/search works across views

### E2E Tests (Playwright)

**Test flows:**

- User visits `/citas` → sees Day view
- User clicks "Semana" tab → navigates to `/citas/week`
- User clicks date in calendar → sees filtered appointments
- User creates new appointment → appears in correct view

---

## Risk Mitigation

| Risk                              | Impact | Likelihood | Mitigation                                         |
| --------------------------------- | ------ | ---------- | -------------------------------------------------- |
| **Breaking existing features**    | High   | Medium     | Phased rollout, feature flags, comprehensive tests |
| **Team learning curve (Zustand)** | Medium | High       | Documentation, pair programming, training session  |
| **Performance regression**        | Medium | Low        | Benchmarks before/after, React DevTools profiling  |
| **URL routing issues**            | Medium | Medium     | Thorough E2E tests for navigation                  |
| **State sync bugs**               | High   | Medium     | Zustand DevTools for debugging, extensive tests    |

---

## Success Metrics

### Code Metrics

| Metric              | Before | After | Target  |
| ------------------- | ------ | ----- | ------- |
| Main component LOC  | 953    | ~250  | <300 ✅ |
| State variables     | 11     | ~5    | <5 ✅   |
| Memoization hooks   | 8      | 2-3   | <3 ✅   |
| View modes          | 5      | 3     | 2-3 ✅  |
| Prop drilling depth | 3      | 0     | <2 ✅   |

### Developer Experience

- **Time to add new calendar feature:** 8h → 4-5h (40% faster)
- **Onboarding time:** 2 days → 1 day (50% faster)
- **Bug fix time:** 2h → 1h (50% faster)
- **Test coverage:** 40% → 80%

### User Experience

- **Page load time:** Same or better (lazy loading)
- **Navigation clarity:** Improved (clear routes)
- **Feature discoverability:** Improved (3 views vs 5)

---

## Integration with IMPLEMENTATION_ROADMAP_FINAL.md

### Recommended Timeline: **FASE 1, Week 4-6**

**Why Week 4?**

- After FASE 0 (Critical Fixes, TypeScript) is complete ✅
- Before new calendar features (Área 1) begin
- Reduces technical debt before building on it

**Fit in Roadmap:**

```
FASE 1: v2.5 Technical Excellence (Weeks 2-11)
├── Área 0: Critical Fixes (COMPLETE) ✅
├── Week 4-6: Citas Page Simplification ⭐ NEW
│   ├── Phase 1: Quick Wins (Week 4)
│   ├── Phase 2: Architecture (Week 5)
│   └── Phase 3: Polish (Week 6)
├── Área 1: Calendar & Booking (Weeks 7-11)
│   ├── P1: Calendar Views (24-31h) → EASIER after simplification
│   ├── P2: Booking Flow (18-25h)
│   └── ...
```

**Impact on remaining roadmap:**

- **Calendar features (Área 1):** 15-20% faster due to cleaner architecture
- **Booking improvements (Área 1):** Easier to integrate with new store
- **Future features:** Zustand store enables shared state across pages

**Estimated Time Savings:**

- **Immediate:** 15-20h saved in Área 1 (Calendar features)
- **Long-term:** 5-10h saved per major feature (over FASE 1-2)
- **Total savings:** ~40-60h over full roadmap

**ROI Calculation:**

- **Investment:** 28-40h (Citas simplification)
- **Savings:** 40-60h (over roadmap)
- **Net gain:** 0-20h + improved maintainability

---

## Alternative: Defer to v2.6

If FASE 1 timeline is tight, this work can be deferred to v2.6 as a "Refactoring Sprint" after core features are delivered. However, doing it **now** prevents accumulating more technical debt and makes future work faster.

**Pros of deferring:**

- Focus on user-facing features first
- More time to plan and design

**Cons of deferring:**

- New features built on complex foundation
- Technical debt compounds
- Higher chance of bugs in new calendar features

**Recommendation:** Do it now (Week 4-6) while codebase is still manageable.

---

## Next Steps

1. **Review this plan** with team
2. **Get user approval** for Option 4 (Progressive Simplification)
3. **Schedule Week 4-6** in roadmap
4. **Assign developers:** 1 dev full-time or 2 devs part-time
5. **Begin Phase 1** when FASE 0 is complete

---

## Questions to Answer Before Starting

1. **Team Capacity:** Do we have 1 dedicated developer for 3 weeks?
2. **Zustand Approval:** Is the team comfortable learning Zustand?
3. **User Impact:** Can we deploy incrementally or need feature flag?
4. **Testing Coverage:** Should we aim for 80% coverage or lower?
5. **Documentation:** Who will create training materials for team?

---

**Document Status:** Ready for review
**Next Action:** Schedule review meeting with team
**Owner:** TBD
**Timeline:** Weeks 4-6 of FASE 1 (post-FASE 0 completion)
