import type { TodayAppointment } from '@/types/custom'
import { derivedStatus, isInProgress, isFinalized, type DerivedStatus } from './appointment-status'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppointmentAction = 'check_in' | 'complete' | 'no_show' | 'focus_mode'

export interface AppointmentZones {
  now: TodayAppointment | null
  requiresAction: TodayAppointment[]
  upcoming: TodayAppointment[]
  finalized: {
    completed: TodayAppointment[]
    incidents: TodayAppointment[]
  }
}

// ---------------------------------------------------------------------------
// computeDelays — migrated from mi-dia-timeline.tsx
// ---------------------------------------------------------------------------

/**
 * Calculate rolling delay for each appointment.
 * When an in-progress appointment exceeds its estimated duration,
 * the overflow cascades as "estimated delay" to all subsequent
 * non-finalized appointments.
 */
export function computeDelays(sorted: TodayAppointment[]): Map<string, number> {
  const delays = new Map<string, number>()
  let cumulativeDelay = 0

  for (const apt of sorted) {
    if (isFinalized(apt)) continue

    if (isInProgress(apt)) {
      const elapsed = (Date.now() - new Date(apt.started_at!).getTime()) / 60_000
      const overflow = Math.max(0, Math.round(elapsed - (apt.duration_minutes || 30)))
      cumulativeDelay = Math.max(cumulativeDelay, overflow)
      continue
    }

    if (cumulativeDelay > 0) {
      delays.set(apt.id, cumulativeDelay)
    }
  }

  return delays
}

// ---------------------------------------------------------------------------
// groupByZone
// ---------------------------------------------------------------------------

/**
 * Split today's appointments into priority zones.
 * - now: the single in-progress appointment
 * - requiresAction: appointments with delay > 0 that aren't finalized or in-progress
 * - upcoming: pending/confirmed (not started), sorted by time
 * - finalized.completed: status === 'completed'
 * - finalized.incidents: status === 'no_show' || 'cancelled'
 */
export function groupByZone(
  appointments: TodayAppointment[],
  delayMap: Map<string, number>
): AppointmentZones {
  const zones: AppointmentZones = {
    now: null,
    requiresAction: [],
    upcoming: [],
    finalized: { completed: [], incidents: [] },
  }

  for (const apt of appointments) {
    const status = derivedStatus(apt)

    if (status === 'in_progress') {
      zones.now = apt
      continue
    }

    if (status === 'completed') {
      zones.finalized.completed.push(apt)
      continue
    }

    if (status === 'no_show' || status === 'cancelled') {
      zones.finalized.incidents.push(apt)
      continue
    }

    // pending or confirmed (not started)
    const delay = delayMap.get(apt.id) ?? 0
    if (delay > 0) {
      zones.requiresAction.push(apt)
    } else {
      zones.upcoming.push(apt)
    }
  }

  // Sort upcoming by scheduled time
  zones.upcoming.sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )
  zones.requiresAction.sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )

  return zones
}

// ---------------------------------------------------------------------------
// getActionsByStatus
// ---------------------------------------------------------------------------

/**
 * Return allowed actions for an appointment based on its derived status.
 * Walk-in pending (source=walk_in, status=pending) can only check-in, NOT complete.
 */
export function getActionsByStatus(apt: TodayAppointment): AppointmentAction[] {
  const status = derivedStatus(apt)

  if (status === 'completed' || status === 'cancelled' || status === 'no_show') {
    return [] // read-only
  }

  if (status === 'in_progress') {
    // Client is already here — "no_show" makes no sense once service started
    return ['complete', 'focus_mode']
  }

  // pending or confirmed (not started)
  const isWalkInPending = apt.source === 'walk_in' && apt.status === 'pending'
  if (isWalkInPending) {
    return ['check_in', 'no_show']
  }

  return ['check_in', 'no_show']
}

// ---------------------------------------------------------------------------
// getStatusColor — accent color for status bar (3px)
// ---------------------------------------------------------------------------

export function getStatusAccentColor(status: DerivedStatus): string {
  switch (status) {
    case 'in_progress':
      return 'bg-blue-500'
    case 'confirmed':
      return 'bg-blue-400'
    case 'pending':
      return 'bg-amber-400'
    case 'completed':
      return 'bg-emerald-400'
    case 'no_show':
      return 'bg-red-400'
    case 'cancelled':
      return 'bg-zinc-400'
    default:
      return 'bg-zinc-300'
  }
}

// ---------------------------------------------------------------------------
// formatTime — shared time formatter for es-CR locale
// ---------------------------------------------------------------------------

const timeFormatter = new Intl.DateTimeFormat('es-CR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: 'America/Costa_Rica',
})

export function formatAppointmentTime(dateString: string): string {
  return timeFormatter.format(new Date(dateString))
}

export function formatTimeRange(scheduledAt: string, durationMinutes: number): string {
  const start = new Date(scheduledAt)
  const end = new Date(start.getTime() + durationMinutes * 60_000)
  return `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`
}
