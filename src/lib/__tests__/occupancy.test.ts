import { describe, expect, it } from 'vitest'
import {
  computeBlockOccupancy,
  computeDayBlocks,
  getEffectiveDurationMinutes,
  getOverlapMinutes,
} from '@/lib/utils/occupancy'

describe('occupancy utils', () => {
  it('uses actual_duration_minutes for completed appointments', () => {
    expect(
      getEffectiveDurationMinutes({
        scheduled_at: '2026-03-02T10:00:00',
        duration_minutes: 30,
        status: 'completed',
        actual_duration_minutes: 45,
      })
    ).toBe(45)
  })

  it('falls back from appointment duration to service duration to default 30', () => {
    expect(
      getEffectiveDurationMinutes({
        scheduled_at: '2026-03-02T10:00:00',
        duration_minutes: 35,
      })
    ).toBe(35)

    expect(
      getEffectiveDurationMinutes({
        scheduled_at: '2026-03-02T10:00:00',
        service: { duration_minutes: 40 },
      })
    ).toBe(40)

    expect(
      getEffectiveDurationMinutes({
        scheduled_at: '2026-03-02T10:00:00',
      })
    ).toBe(30)
  })

  it('computes overlap minutes correctly for a cross-block appointment', () => {
    const overlap = getOverlapMinutes(
      {
        start: new Date('2026-03-02T11:45:00'),
        end: new Date('2026-03-02T12:45:00'),
      },
      {
        start: new Date('2026-03-02T12:00:00'),
        end: new Date('2026-03-02T13:00:00'),
      }
    )

    expect(overlap).toBe(45)
  })

  it('creates day blocks using minute precision from business schedule', () => {
    const blocks = computeDayBlocks('09:30', '18:15')

    expect(blocks[0].startMinute).toBe(9 * 60 + 30)
    expect(blocks[0].endMinute).toBe(12 * 60)
    expect(blocks[1].startMinute).toBe(12 * 60)
    expect(blocks[1].endMinute).toBe(16 * 60)
    expect(blocks[2].startMinute).toBe(16 * 60)
    expect(blocks[2].endMinute).toBe(18 * 60 + 15)
  })

  it('accepts HH:mm:ss business schedule values', () => {
    const blocks = computeDayBlocks('09:30:00', '23:00:00')

    expect(blocks[0].startMinute).toBe(9 * 60 + 30)
    expect(blocks[2].endMinute).toBe(23 * 60)
  })

  it('splits occupied minutes across blocks and caps visible percent to 100 with overbook flag', () => {
    const dayDate = new Date('2026-03-02T00:00:00')
    const blocks = [
      { id: 'morning' as const, label: 'MAÑANA' as const, startMinute: 9 * 60, endMinute: 12 * 60 },
      {
        id: 'midday' as const,
        label: 'MEDIODÍA' as const,
        startMinute: 12 * 60,
        endMinute: 15 * 60,
      },
      {
        id: 'afternoon' as const,
        label: 'TARDE' as const,
        startMinute: 15 * 60,
        endMinute: 18 * 60,
      },
    ]

    const metrics = computeBlockOccupancy(
      blocks,
      [
        {
          scheduled_at: '2026-03-02T11:45:00',
          duration_minutes: 60,
          status: 'confirmed',
        },
        {
          scheduled_at: '2026-03-02T10:00:00',
          duration_minutes: 150,
          status: 'no_show',
        },
        {
          scheduled_at: '2026-03-02T10:30:00',
          duration_minutes: 150,
          status: 'confirmed',
        },
      ],
      dayDate
    )

    const morning = metrics[0]
    const midday = metrics[1]

    // 10:00-12:00 (120) + 10:30-12:00 (90) + 11:45-12:00 (15) => 225 min in morning block (180 min)
    expect(morning.occupiedMinutes).toBe(225)
    expect(morning.rawOccupancyPercent).toBeCloseTo(125, 1)
    expect(morning.occupancyPercent).toBe(100)
    expect(morning.isOverbooked).toBe(true)

    // 12:00-12:30 (30) + 12:00-13:00 (60) + 12:00-12:45 (45) => 135 min
    expect(midday.occupiedMinutes).toBe(135)
  })
})
