import type { TodayAppointment } from '@/types/custom'

/**
 * Derived status that includes 'in_progress' — a virtual state
 * not stored in the DB but computed from confirmed + started_at.
 */
export type DerivedStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

/**
 * Compute the derived status of an appointment.
 * `in_progress` = confirmed + started_at is set.
 */
export function derivedStatus(apt: TodayAppointment): DerivedStatus {
  if (apt.status === 'confirmed' && apt.started_at) return 'in_progress'
  return apt.status
}

export function isInProgress(apt: TodayAppointment): boolean {
  return apt.status === 'confirmed' && apt.started_at !== null
}

export function isFinalized(apt: TodayAppointment): boolean {
  return apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show'
}
