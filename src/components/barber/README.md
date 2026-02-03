# Barber Components

Components for the staff/barber view, specifically the "Mi Día" feature.

## Components

### MiDiaHeader

Header component displaying summary stats and date information.

**Props:**

- `barberName: string` - Name of the barber
- `date: string` - ISO date string for today
- `stats: StatsObject` - Appointment statistics
- `lastUpdated: Date | null` - Last data refresh time
- `className?: string` - Optional CSS classes

**Features:**

- Animated stat cards
- Responsive grid layout
- Dark mode support
- Live update timestamp

**Usage:**

```tsx
<MiDiaHeader
  barberName="Juan Pérez"
  date="2026-02-03"
  stats={{
    total: 8,
    pending: 3,
    confirmed: 2,
    completed: 3,
    cancelled: 0,
    no_show: 0,
  }}
  lastUpdated={new Date()}
/>
```

### BarberAppointmentCard

Card displaying a single appointment with quick action buttons.

**Props:**

- `appointment: TodayAppointment` - Appointment data
- `onCheckIn?: (id: string) => void` - Check-in callback
- `onComplete?: (id: string) => void` - Complete callback
- `onNoShow?: (id: string) => void` - No-show callback
- `isLoading?: boolean` - Loading state
- `className?: string` - Optional CSS classes

**Features:**

- Status-based visual indicators
- Quick action buttons (44x44px tap targets)
- Optimistic UI updates
- Accessibility labels
- Phone number formatting and linking
- Currency formatting
- Notes display

**Status Rules:**

- Check-in: Only available for "pending" appointments
- Complete: Available for "pending" and "confirmed"
- No-show: Available for "pending" and "confirmed"

**Usage:**

```tsx
<BarberAppointmentCard
  appointment={appointment}
  onCheckIn={handleCheckIn}
  onComplete={handleComplete}
  onNoShow={handleNoShow}
  isLoading={loadingId === appointment.id}
/>
```

### MiDiaTimeline

Timeline layout for displaying all appointments in chronological order.

**Props:**

- `appointments: TodayAppointment[]` - Array of appointments
- `onCheckIn?: (id: string) => void` - Check-in callback
- `onComplete?: (id: string) => void` - Complete callback
- `onNoShow?: (id: string) => void` - No-show callback
- `loadingAppointmentId?: string | null` - ID of loading appointment
- `className?: string` - Optional CSS classes

**Features:**

- Visual timeline with status dots
- Current time indicator (8 AM - 8 PM)
- Empty state
- Animated entry/exit
- Chronological sorting
- Smooth layout transitions

**Usage:**

```tsx
<MiDiaTimeline
  appointments={appointments}
  onCheckIn={checkIn}
  onComplete={complete}
  onNoShow={noShow}
  loadingAppointmentId={loadingId}
/>
```

## Custom Hooks

### useBarberAppointments

Data fetching hook for today's appointments.

**Parameters:**

- `barberId: string` - Barber ID
- `enabled?: boolean` - Enable/disable fetching
- `autoRefresh?: boolean` - Auto-refresh every interval
- `refreshInterval?: number` - Interval in milliseconds (default: 30000)

**Returns:**

- `data: TodayAppointmentsResponse | null`
- `isLoading: boolean`
- `error: Error | null`
- `refetch: () => Promise<void>`
- `lastUpdated: Date | null`

**Usage:**

```tsx
const { data, isLoading, error, refetch, lastUpdated } = useBarberAppointments({
  barberId: '123',
  autoRefresh: true,
  refreshInterval: 30000,
})
```

### useAppointmentActions

Hook for appointment status update actions.

**Parameters:**

- `barberId: string` - Barber ID
- `onSuccess?: (action, appointment) => void` - Success callback
- `onError?: (action, error) => void` - Error callback

**Returns:**

- `checkIn: (id: string) => Promise<AppointmentStatusUpdateResponse | null>`
- `complete: (id: string) => Promise<AppointmentStatusUpdateResponse | null>`
- `noShow: (id: string) => Promise<AppointmentStatusUpdateResponse | null>`
- `isLoading: boolean`
- `error: Error | null`
- `loadingAppointmentId: string | null`

**Usage:**

```tsx
const { checkIn, complete, noShow, loadingAppointmentId } = useAppointmentActions({
  barberId: '123',
  onSuccess: (action, appointment) => {
    console.log(`${action} successful`, appointment)
    refetchAppointments()
  },
  onError: (action, error) => {
    console.error(`${action} failed`, error)
  },
})
```

## Page Implementation

### Mi Día Page

Located at: `src/app/(dashboard)/mi-dia/page.tsx`

**Features:**

- Auto-refresh every 30 seconds
- Manual refresh button
- Loading skeletons
- Error handling with retry
- Toast notifications
- Optimistic UI updates
- Pull-to-refresh ready

**TODO:**

- Implement auth integration to get barberId
- Add pull-to-refresh gesture (mobile)
- Add keyboard shortcuts
- Add offline support

## Accessibility Features

All components follow WCAG AA standards:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader announcements (aria-live)
- Minimum 44x44px touch targets
- Color contrast ratios met
- Error messages announced

## Performance Optimizations

- Framer Motion animations use GPU acceleration
- Optimistic UI updates for instant feedback
- Auto-refresh with configurable intervals
- Memoized callbacks to prevent re-renders
- Lazy loading ready (code splitting)

## Mobile-First Design

- Touch-friendly buttons (min 44x44px)
- Responsive grid layouts
- Swipe gestures ready
- Optimized for small screens
- Fast tap feedback with ripple effects

## Dark Mode

All components support dark mode with proper color schemes and contrast ratios.

## Testing

### Unit Tests (TODO)

```tsx
// Test appointment card rendering
test('renders appointment card with client info', () => {
  render(<BarberAppointmentCard appointment={mockAppointment} />)
  expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
})

// Test action buttons
test('check-in button calls handler', async () => {
  const onCheckIn = jest.fn()
  render(<BarberAppointmentCard appointment={mockAppointment} onCheckIn={onCheckIn} />)
  await userEvent.click(screen.getByLabelText('Marcar como confirmada'))
  expect(onCheckIn).toHaveBeenCalledWith(mockAppointment.id)
})
```

### E2E Tests (TODO)

```typescript
// Test Mi Día flow
test('barber can complete appointment', async ({ page }) => {
  await page.goto('/mi-dia')
  await page.click('text=Completar')
  await expect(page.locator('text=Cita completada')).toBeVisible()
})
```

## Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)
