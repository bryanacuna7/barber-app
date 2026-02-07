# UX Refinement Checklist (Fase 2.5)

**Based on:** Design Audit (Dieter Rams' 10 Principles)
**Duration:** 12-16 hours
**When:** After Fase 2, before production launch
**Goal:** Apply "less but better" philosophy

---

## Quick Wins (Before Fase 2 Starts)

### 1. Simplify Calendar Views (2-3h) ⚡ CRITICAL

- [ ] Remove Timeline view (merge into Lista)
- [ ] Change to 2 primary views: Calendario + Lista
- [ ] Calendario has sub-toggle: Día/Semana/Mes
- [ ] Add smart defaults: Week (owners), Day (staff)
- [ ] Add "Mi Día" shortcut for staff

**Files:**

- `src/app/(dashboard)/citas/page.tsx`
- `src/components/appointments/view-toggle.tsx` (new)

---

### 2. Replace Booking Modal with Inline Panel (3-4h) ⚡ CRITICAL

- [ ] Design slide-in panel (50% width, slides from right)
- [ ] Single-screen form (not wizard)
- [ ] Fields: Service, Barber, Client, Date/Time, Optional: Deposit
- [ ] Pre-fill time from clicked calendar slot
- [ ] Keep calendar visible while booking

**Files:**

- `src/components/appointments/booking-panel.tsx` (new)
- `src/components/appointments/inline-form.tsx` (new)

---

### 3. Document Micro-Interactions (1-2h)

- [ ] Create MICRO_INTERACTIONS.md
- [ ] Specify button states (hover, active, disabled)
- [ ] Specify loading states (spinner vs skeleton)
- [ ] Specify success/error animations
- [ ] Specify empty states
- [ ] Specify keyboard focus indicators

**File:**

- `docs/reference/MICRO_INTERACTIONS.md` (new)

---

## Fase 2.5: Full UX Refinement Sprint

### Task 1: Progressive Disclosure (4-5h)

#### Settings Forms

- [ ] Business profile: Show 5 fields, hide 8 under "Advanced"
- [ ] Operating hours: Show basic schedule, hide per-day overrides
- [ ] Booking config: Show 3 key settings, hide 7 advanced
- [ ] Payment settings: Show active methods, hide historical data

#### Appointment Form

- [ ] Show: Service, Barber, Client, Date/Time (required)
- [ ] Hide: Notes, Deposit, Reminder prefs, Client tags (optional)
- [ ] Add "More options" expander

#### Client Profile

- [ ] Show: Name, Phone, Last visit, Upcoming appointment, Quick actions
- [ ] Hide: Visit count, revenue, no-show rate, referral stats
- [ ] Add "View full history" link

---

### Task 2: Smart Defaults (3-4h)

- [ ] Calendar view: Week (owners), Day (staff)
- [ ] Operating hours: Mon-Fri 9am-6pm
- [ ] Booking window: 30 days
- [ ] Buffer time: 5 minutes
- [ ] Cancellation policy: 24 hours
- [ ] Reminder timing: 24h before
- [ ] No-show grace period: 15 minutes
- [ ] Deposit percentage: 20%

**Implementation:**

```typescript
// src/lib/defaults/business-defaults.ts
export const BUSINESS_DEFAULTS = {
  operatingHours: {
    monday: { open: '09:00', close: '18:00', enabled: true },
    tuesday: { open: '09:00', close: '18:00', enabled: true },
    wednesday: { open: '09:00', close: '18:00', enabled: true },
    thursday: { open: '09:00', close: '18:00', enabled: true },
    friday: { open: '09:00', close: '18:00', enabled: true },
    saturday: { open: '09:00', close: '14:00', enabled: false },
    sunday: { enabled: false },
  },
  bookingWindow: 30, // days
  bufferTime: 5, // minutes
  cancellationHours: 24,
  reminderHours: 24,
  noShowGraceMinutes: 15,
  depositPercentage: 20,
}
```

---

### Task 3: Empty States (2-3h)

Design empty states for:

- [ ] No appointments (calendar)
- [ ] No clients
- [ ] No staff members
- [ ] No services defined
- [ ] No referrals yet
- [ ] No payment history
- [ ] Search with no results

**Template:**

```tsx
// src/components/empty-states/empty-state.tsx
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-muted-foreground">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
```

---

### Task 4: Keyboard Navigation (3-4h)

#### Calendar

- [ ] Arrow keys: Navigate between days/time slots
- [ ] Enter: Open clicked slot for booking
- [ ] Space: Quick-book (if slot is empty)
- [ ] Escape: Close modals/panels
- [ ] Tab: Navigate interactive elements
- [ ] Shift+Tab: Navigate backwards

#### Search (Cmd+K)

- [ ] Cmd+K: Open command palette
- [ ] Escape: Close search
- [ ] Arrow up/down: Navigate results
- [ ] Enter: Select result
- [ ] Tab: Navigate between sections

#### Forms

- [ ] Tab: Next field
- [ ] Shift+Tab: Previous field
- [ ] Enter: Submit form (if valid)
- [ ] Escape: Cancel/close form

#### Help

- [ ] Shift+?: Open keyboard shortcuts modal

**Implementation:**

```tsx
// src/hooks/use-keyboard-shortcuts.ts
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K: Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearch()
      }

      // Shift+?: Help
      if (e.shiftKey && e.key === '?') {
        e.preventDefault()
        openHelp()
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        closeAllModals()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
```

---

## Design System Additions

### Typography (Add to globals.css)

```css
:root {
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.25rem; /* 20px */
  --text-xl: 1.5rem; /* 24px */
  --text-2xl: 1.875rem; /* 30px */
  --text-3xl: 2.25rem; /* 36px */

  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing (Add to globals.css)

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-12: 3rem; /* 48px */
}
```

### Motion (Add to globals.css)

```css
:root {
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;

  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);

  --transition-fast: var(--duration-fast) var(--ease-out);
  --transition-base: var(--duration-base) var(--ease-in-out);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Settings Reorganization

### Current (7 categories - confusing)

```
🏢 Negocio
📅 Reservaciones
✂️ Equipo
💳 Pagos y Facturación
🔔 Notificaciones
🔗 Integraciones (PRO)
⚙️ Avanzado
```

### Recommended (5 categories - clear)

```
1. 🏢 Mi Negocio
   - Perfil del negocio
   - Ubicación
   - Horario de atención
   - Link público de reservas

2. 📅 Citas
   - Ventana de reserva
   - Buffer time
   - Política de cancelación
   - Confirmación automática

3. 👥 Mi Equipo
   - Barberos/Staff
   - Roles y permisos
   - Horarios individuales
   - Invitar colaborador

4. 💰 Finanzas
   - Suscripción actual
   - Métodos de pago
   - Configuración de anticipos
   - Historial de pagos
   - Integraciones (PRO) - Kash, bank accounts

5. 🔴 Peligro
   - Exportar datos
   - Eliminar negocio
   - Zona de peligro
```

---

## Accessibility Checklist

### Color Contrast

- [ ] All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- [ ] Interactive elements have 3:1 contrast with background
- [ ] Test with Chrome DevTools contrast checker

### Focus Indicators

- [ ] All interactive elements have visible focus ring
- [ ] Focus ring is 2px solid, high contrast color
- [ ] Focus trap in modals (can't tab out)

### Screen Readers

- [ ] All images have alt text
- [ ] All form inputs have labels (not placeholder-only)
- [ ] aria-live regions for dynamic content
- [ ] Semantic HTML (nav, main, aside, article)

### Touch Targets

- [ ] All buttons/links are minimum 44x44px
- [ ] Spacing between touch targets ≥8px
- [ ] Test on real mobile device

### Keyboard Navigation

- [ ] All functionality available via keyboard
- [ ] Logical tab order (top to bottom, left to right)
- [ ] Skip links for screen readers ("Skip to main content")

---

## Testing Checklist

### Before/After Metrics

Test these metrics before and after UX refinement:

- [ ] Time to create appointment (target: <30 seconds)
- [ ] Time to find setting (target: <10 seconds)
- [ ] Calendar view switches per session (target: <3)
- [ ] Modal abandonment rate (target: <15%)
- [ ] Search usage (target: >30% of settings visits)
- [ ] Keyboard shortcut adoption (target: >10% of users)

### User Testing Script

Recruit 5 users (2 staff, 3 owners) and ask them to:

1. Create an appointment for tomorrow at 2pm
2. Change the business operating hours
3. Find where to configure appointment reminders
4. View all appointments for next week
5. Cancel an upcoming appointment

**Measure:**

- Task completion rate (target: >90%)
- Average time per task
- Number of clicks/wrong turns
- User satisfaction (1-10 scale, target: >8)

---

## File Checklist

### New Files to Create

- [ ] `src/components/appointments/booking-panel.tsx`
- [ ] `src/components/appointments/inline-form.tsx`
- [ ] `src/components/appointments/view-toggle.tsx`
- [ ] `src/components/empty-states/empty-state.tsx`
- [ ] `src/lib/defaults/business-defaults.ts`
- [ ] `src/hooks/use-keyboard-shortcuts.ts`
- [ ] `docs/reference/MICRO_INTERACTIONS.md`

### Files to Modify

- [ ] `src/app/(dashboard)/citas/page.tsx`
- [ ] `src/app/(dashboard)/configuracion/layout.tsx`
- [ ] `src/app/globals.css` (design tokens)
- [ ] All settings category pages (progressive disclosure)

---

## Success Criteria

Fase 2.5 is complete when:

- [x] Calendar views reduced from 5 to 3
- [x] Booking uses inline panel (not modal)
- [x] All empty states designed
- [x] Keyboard navigation implemented
- [x] Progressive disclosure applied to 10+ forms
- [x] Smart defaults set for 8+ configs
- [x] Design tokens added to globals.css
- [x] User testing completed (5 users)
- [x] Metrics improved: -30% task time, +25% satisfaction

---

## Timeline

| Week              | Tasks                   | Hours      |
| ----------------- | ----------------------- | ---------- |
| **Before Fase 2** | Quick Wins (1-3)        | 5-7h       |
| **After Fase 2**  | Full Sprint (Tasks 1-4) | 12-16h     |
| **Total**         |                         | **17-23h** |

---

## Notes

- This is OPTIONAL but highly recommended
- Can be done incrementally (1-2 tasks per week)
- Will significantly improve user satisfaction
- Reduces support burden
- Makes product feel premium

**Dieter Rams quote:**

> "Less, but better. Because it concentrates on the essential aspects, and the products are not burdened with non-essentials."

Apply this philosophy throughout implementation.
