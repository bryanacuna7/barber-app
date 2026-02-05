# Performance Budgets

**Created:** Session 110 (Pre-Implementation Requirements)
**Purpose:** Define performance targets for UI/UX redesign implementation

---

## 🎯 Core Web Vitals Targets

**These are MANDATORY targets for all 7 modules:**

| Metric                              | Target  | Threshold | Description                         |
| ----------------------------------- | ------- | --------- | ----------------------------------- |
| **LCP** (Largest Contentful Paint)  | < 2.5s  | < 4.0s    | Time to render main content         |
| **FID** (First Input Delay)         | < 100ms | < 300ms   | Time to respond to user interaction |
| **CLS** (Cumulative Layout Shift)   | < 0.1   | < 0.25    | Visual stability (no layout jumps)  |
| **INP** (Interaction to Next Paint) | < 200ms | < 500ms   | Responsiveness to all interactions  |
| **TTFB** (Time to First Byte)       | < 800ms | < 1800ms  | Server response time                |

**Targets:** "Good" performance rating
**Thresholds:** Maximum acceptable ("Needs Improvement" rating)

---

## 📦 JavaScript Bundle Size

### Total Bundle Budget

| Page Type         | Target | Maximum | Current Baseline |
| ----------------- | ------ | ------- | ---------------- |
| **Mi Día**        | 150 KB | 200 KB  | TBD              |
| **Servicios**     | 120 KB | 180 KB  | TBD              |
| **Clientes**      | 180 KB | 250 KB  | TBD (complex)    |
| **Reportes**      | 200 KB | 280 KB  | TBD (charts)     |
| **Configuración** | 100 KB | 150 KB  | TBD              |
| **Barberos**      | 150 KB | 200 KB  | TBD              |
| **Citas**         | 180 KB | 250 KB  | TBD (calendar)   |

**Measured:** Gzip-compressed JavaScript size

### Library Budget

| Library               | Size Budget | Rationale                               |
| --------------------- | ----------- | --------------------------------------- |
| React + Next.js       | Core (free) | Framework baseline                      |
| @tanstack/react-query | 12 KB       | State management (necessary)            |
| Framer Motion         | 45 KB       | Animations (used by demos)              |
| date-fns              | 8 KB        | Date utilities (tree-shakeable)         |
| Recharts              | 90 KB       | Charts (Reportes only)                  |
| Lucide React          | 2 KB        | Icons (tree-shakeable, only used icons) |

**Total Third-Party Budget:** ~150 KB (excluding framework)

---

## 🚀 Performance Optimization Strategies

### 1. Code Splitting

**Mandatory code splits:**

```typescript
// Lazy load demo routes
const MiDiaDemo = lazy(() => import('./demos/preview-b'))
const ServiciosDemo = lazy(() => import('./demos/preview-d'))
const ClientesDemo = lazy(() => import('./demos/preview-fusion'))
const ReportesDemo = lazy(() => import('./demos/preview-fusion'))
const ConfiguracionDemo = lazy(() => import('./demo-a'))
const BarberosDemo = lazy(() => import('./demos/preview-b'))
const CitasDemo = lazy(() => import('./demos/preview-b-fusion'))

// Lazy load charts (Reportes module)
const RechartsComponents = lazy(() => import('./components/charts'))
```

**Route-based splitting:** Next.js automatic

### 2. Image Optimization

| Asset Type    | Target Size | Format | Strategy                   |
| ------------- | ----------- | ------ | -------------------------- |
| Avatar images | < 50 KB     | WebP   | Next/Image with quality 85 |
| Hero images   | < 200 KB    | WebP   | Responsive srcset          |
| Icons (SVG)   | < 5 KB      | SVG    | Inline or sprite           |
| Logo          | < 20 KB     | SVG    | Inline for instant display |

**Mandatory:** Use Next.js `<Image>` component with:

- `loading="lazy"` for below-the-fold images
- `priority` only for LCP image
- `sizes` attribute for responsive images

### 3. Font Optimization

**Strategy:** Self-hosted fonts with `next/font`

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
})
```

**Budget:**

- Primary font: < 100 KB (WOFF2, Latin subset only)
- Secondary font: < 80 KB (if needed)

### 4. Database Query Optimization

**N+1 Query Prevention:**

✅ **Good (Single query with JOIN):**

```sql
SELECT appointments.*, clients.name, services.name, barbers.name
FROM appointments
JOIN clients ON appointments.client_id = clients.id
JOIN services ON appointments.service_id = services.id
JOIN barbers ON appointments.barber_id = barbers.id
WHERE business_id = $1
```

❌ **Bad (N+1 queries):**

```typescript
// Fetches appointments
const appointments = await getAppointments()
// Then N queries for each appointment
for (const appt of appointments) {
  const client = await getClient(appt.client_id) // ❌ N queries!
}
```

**Query Limits:**

- Default pagination: 50 items per page
- Maximum: 100 items per page
- Use cursor-based pagination for infinite scroll

### 5. Caching Strategy

**React Query Configuration:**

```typescript
{
  staleTime: 5 * 60 * 1000, // 5 min
  gcTime: 10 * 60 * 1000,   // 10 min
}
```

**Supabase Realtime:**

- Only subscribe to critical updates (appointments status changes)
- Unsubscribe when component unmounts

### 6. Render Optimization

**Mandatory optimizations:**

```typescript
// Memoize expensive calculations
const stats = useMemo(() => calculateStats(data), [data])

// Memoize callbacks
const handleClick = useCallback(() => {...}, [deps])

// Virtualize long lists (> 100 items)
import { VirtualList } from '@tanstack/react-virtual'
```

**Component Budget:**

- Max props per component: 10
- Max component depth: 5 levels
- Virtualize lists > 50 items

---

## 🔍 Monitoring & Enforcement

### Development Tools

**1. Next.js Bundle Analyzer**

```bash
npm run build:analyze
```

**Warning:** Alert if any page exceeds budget

**2. Lighthouse CI**

```bash
npx @lhci/cli autorun
```

**Fail build if:**

- LCP > 4.0s
- CLS > 0.25
- Performance score < 70

**3. React DevTools Profiler**

```typescript
<Profiler id="MiDiaPage" onRender={onRenderCallback}>
  <MiDiaPage />
</Profiler>
```

**Target:** < 16ms render time (60 FPS)

### Production Monitoring

**Tools to implement:**

1. **Core Web Vitals (RUM):**
   - Use `web-vitals` library
   - Send to analytics (Vercel Analytics or custom)

2. **Sentry Performance:**
   - Track slow transactions (> 3s)
   - Track slow DB queries (> 500ms)

3. **Custom Metrics:**
   - Time to Interactive (TTI)
   - Time to First Appointment Render (custom)

---

## ✅ Pre-Deployment Checklist

Before deploying any module to production:

- [ ] **Bundle size** within budget (check with analyzer)
- [ ] **Lighthouse score** ≥ 90 (mobile)
- [ ] **LCP** < 2.5s (test on 4G)
- [ ] **CLS** < 0.1 (no layout shifts)
- [ ] **No N+1 queries** (check Supabase logs)
- [ ] **React Query** cache configured correctly
- [ ] **Images** optimized (WebP, lazy loading)
- [ ] **Fonts** loaded with `font-display: swap`
- [ ] **Long lists** virtualized (> 50 items)
- [ ] **Animations** use GPU acceleration (`transform`, `opacity`)

---

## 📊 Measurement Plan

### Baseline (Before Implementation)

1. Measure current pages with Lighthouse
2. Document bundle sizes
3. Measure query performance

### During Implementation

1. Monitor bundle size on each PR
2. Run Lighthouse on feature branch deploys
3. Profile React components in development

### After Implementation

1. Compare new metrics vs baseline
2. Set up continuous monitoring
3. Create performance dashboard

---

## 🚨 What to Do If Budget Exceeded

### Bundle Size Exceeded

1. **Analyze:** `npm run build:analyze`
2. **Actions:**
   - Lazy load heavy components
   - Tree-shake unused library code
   - Consider lighter alternatives (e.g., `date-fns` → `dayjs`)
   - Split vendor bundles

### LCP Exceeded

1. **Identify LCP element:** Lighthouse report
2. **Actions:**
   - Preload critical resources
   - Optimize LCP image (size, format)
   - Server-side render above-the-fold content
   - Reduce render-blocking resources

### CLS Exceeded

1. **Find layout shifts:** Lighthouse report
2. **Actions:**
   - Reserve space for images (`width` + `height`)
   - Avoid inserting content above existing content
   - Use CSS containment for animations
   - Preload fonts to prevent FOIT

---

## 🎯 Success Criteria

**Definition of Done for Performance:**

- ✅ All Core Web Vitals in "Good" range
- ✅ Bundle size within budget
- ✅ Lighthouse score ≥ 90 (mobile)
- ✅ No N+1 queries in production
- ✅ Zero layout shifts (CLS = 0)
- ✅ 60 FPS animations (no jank)
- ✅ < 3s time to interactive on 4G

**Performance is not optional.** It's a blocking requirement for deployment.
