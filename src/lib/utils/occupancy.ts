export interface OccupancyAppointment {
  scheduled_at: string
  started_at?: string | null
  duration_minutes?: number | null
  actual_duration_minutes?: number | null
  status?: string | null
  service?: {
    duration_minutes?: number | null
  } | null
}

export interface TimeWindow {
  start: Date
  end: Date
}

export type DayBlockId = 'morning' | 'midday' | 'afternoon'

export interface DayBlockDefinition {
  id: DayBlockId
  label: 'MAÑANA' | 'MEDIODÍA' | 'TARDE'
  startMinute: number
  endMinute: number
}

export interface OccupancyBlockMetrics extends DayBlockDefinition {
  blockMinutes: number
  occupiedMinutes: number
  rawOccupancyPercent: number
  occupancyPercent: number
  isOverbooked: boolean
  occupancyCount: number
}

const DEFAULT_OPEN_MINUTE = 7 * 60
const DEFAULT_CLOSE_MINUTE = 21 * 60
const MORNING_END_ANCHOR_MINUTE = 12 * 60
const MIDDAY_END_ANCHOR_MINUTE = 16 * 60

function parseTimeToMinuteOfDay(value: string | undefined): number | null {
  if (!value) return null
  const parts = value.trim().split(':')
  if (parts.length < 2) return null

  const hours = Number(parts[0])
  const minutes = Number(parts[1])
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null
  }

  return hours * 60 + minutes
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function toMinutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function getEffectiveDurationMinutes(appointment: OccupancyAppointment): number {
  if (
    appointment.status === 'completed' &&
    appointment.actual_duration_minutes != null &&
    appointment.actual_duration_minutes > 0
  ) {
    return appointment.actual_duration_minutes
  }

  if (appointment.duration_minutes != null && appointment.duration_minutes > 0) {
    return appointment.duration_minutes
  }

  if (appointment.service?.duration_minutes != null && appointment.service.duration_minutes > 0) {
    return appointment.service.duration_minutes
  }

  return 30
}

export function getEffectiveWindow(appointment: OccupancyAppointment): TimeWindow {
  const startCandidate = appointment.started_at ?? appointment.scheduled_at
  const start = new Date(startCandidate)
  const fallbackStart = Number.isFinite(start.getTime())
    ? start
    : new Date(appointment.scheduled_at)
  const durationMinutes = getEffectiveDurationMinutes(appointment)
  const end = new Date(fallbackStart.getTime() + durationMinutes * 60_000)

  return {
    start: fallbackStart,
    end,
  }
}

export function getOverlapMinutes(windowA: TimeWindow, windowB: TimeWindow): number {
  const overlapStart = Math.max(windowA.start.getTime(), windowB.start.getTime())
  const overlapEnd = Math.min(windowA.end.getTime(), windowB.end.getTime())

  if (overlapEnd <= overlapStart) {
    return 0
  }

  return (overlapEnd - overlapStart) / 60_000
}

export function computeDayBlocks(openTime?: string, closeTime?: string): DayBlockDefinition[] {
  let openMinute = parseTimeToMinuteOfDay(openTime) ?? DEFAULT_OPEN_MINUTE
  let closeMinute = parseTimeToMinuteOfDay(closeTime) ?? DEFAULT_CLOSE_MINUTE

  // Guard against invalid schedules. Keep UI stable with fallback business day.
  if (closeMinute - openMinute < 3) {
    openMinute = DEFAULT_OPEN_MINUTE
    closeMinute = DEFAULT_CLOSE_MINUTE
  }

  // Use natural time anchors to keep labels intuitive:
  // morning until ~12:00, midday until ~16:00, then afternoon.
  const midStart = clamp(MORNING_END_ANCHOR_MINUTE, openMinute + 1, closeMinute - 2)
  const aftStart = clamp(MIDDAY_END_ANCHOR_MINUTE, midStart + 1, closeMinute - 1)

  return [
    {
      id: 'morning',
      label: 'MAÑANA',
      startMinute: openMinute,
      endMinute: midStart,
    },
    {
      id: 'midday',
      label: 'MEDIODÍA',
      startMinute: midStart,
      endMinute: aftStart,
    },
    {
      id: 'afternoon',
      label: 'TARDE',
      startMinute: aftStart,
      endMinute: closeMinute,
    },
  ]
}

export function computeBlockOccupancy(
  blocks: DayBlockDefinition[],
  appointments: OccupancyAppointment[],
  dayDate: Date
): OccupancyBlockMetrics[] {
  const dayStart = new Date(dayDate)
  dayStart.setHours(0, 0, 0, 0)

  return blocks.map((block) => {
    const blockStart = new Date(dayStart.getTime() + block.startMinute * 60_000)
    const blockEnd = new Date(dayStart.getTime() + block.endMinute * 60_000)
    const blockWindow = { start: blockStart, end: blockEnd }

    let occupiedMinutes = 0
    let occupancyCount = 0

    appointments.forEach((appointment) => {
      const overlap = getOverlapMinutes(getEffectiveWindow(appointment), blockWindow)
      if (overlap > 0) {
        occupiedMinutes += overlap
        occupancyCount += 1
      }
    })

    const blockMinutes = Math.max(1, block.endMinute - block.startMinute)
    const rawOccupancyPercent = (occupiedMinutes / blockMinutes) * 100
    const occupancyPercent = Math.round(clamp(rawOccupancyPercent, 0, 100))
    const isOverbooked = rawOccupancyPercent > 100

    return {
      ...block,
      blockMinutes,
      occupiedMinutes,
      rawOccupancyPercent,
      occupancyPercent,
      isOverbooked,
      occupancyCount,
    }
  })
}
