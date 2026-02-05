/**
 * Error Boundaries
 *
 * Component-level error boundaries for isolating failures.
 * Each boundary has a specific fallback UI appropriate for its context.
 *
 * Usage:
 * ```tsx
 * import { CalendarErrorBoundary } from '@/components/error-boundaries'
 *
 * <CalendarErrorBoundary appointments={appointments}>
 *   <ComplexCalendar />
 * </CalendarErrorBoundary>
 * ```
 */

export { ComponentErrorBoundary, withComponentErrorBoundary } from './ComponentErrorBoundary'
export { CalendarErrorBoundary } from './CalendarErrorBoundary'
export { AnalyticsErrorBoundary } from './AnalyticsErrorBoundary'
export { ClientProfileErrorBoundary } from './ClientProfileErrorBoundary'
