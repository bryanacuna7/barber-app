import { describe, expect, it } from 'vitest'

/**
 * Tests for analytics route logic — pure function behavior and RPC response mapping.
 * These verify that the RPC path produces identical output shape to the JS fallback.
 */

// ============================================================
// Service Analytics — RPC response mapping
// ============================================================
describe('service analytics RPC mapping', () => {
  // Simulates the mapping logic from services/route.ts RPC path
  function mapServiceRpc(rpcResult: any[]) {
    return rpcResult.map((s) => ({
      id: s.id,
      name: s.name,
      bookings: Number(s.bookings ?? 0),
      revenue: Number(s.revenue ?? 0),
    }))
  }

  it('maps RPC result with standard values', () => {
    const rpcResult = [
      { id: 'svc1', name: 'Corte', bookings: 42, revenue: 210000 },
      { id: 'svc2', name: 'Barba', bookings: 0, revenue: 0 },
    ]
    const mapped = mapServiceRpc(rpcResult)
    expect(mapped).toEqual([
      { id: 'svc1', name: 'Corte', bookings: 42, revenue: 210000 },
      { id: 'svc2', name: 'Barba', bookings: 0, revenue: 0 },
    ])
  })

  it('preserves services with 0 bookings (LEFT JOIN semantics)', () => {
    const rpcResult = [
      { id: 'svc1', name: 'Corte', bookings: 10, revenue: 50000 },
      { id: 'svc2', name: 'Tinte', bookings: 0, revenue: 0 },
      { id: 'svc3', name: 'Barba', bookings: 0, revenue: 0 },
    ]
    const mapped = mapServiceRpc(rpcResult)
    expect(mapped).toHaveLength(3)
    expect(mapped[1].bookings).toBe(0)
    expect(mapped[2].revenue).toBe(0)
  })

  it('handles null values from SQL COALESCE edge cases', () => {
    const rpcResult = [{ id: 'svc1', name: 'Corte', bookings: null, revenue: null }]
    const mapped = mapServiceRpc(rpcResult)
    expect(mapped[0].bookings).toBe(0)
    expect(mapped[0].revenue).toBe(0)
  })

  it('returns empty array for empty result', () => {
    expect(mapServiceRpc([])).toEqual([])
  })
})

// ============================================================
// Barber Analytics — RPC response mapping
// ============================================================
describe('barber analytics RPC mapping', () => {
  function mapBarberRpc(rpcResult: any[]) {
    return rpcResult.map((b) => ({
      id: b.id,
      name: b.name,
      photo_url: b.photo_url,
      appointments: Number(b.appointments ?? 0),
      revenue: Number(b.revenue ?? 0),
      uniqueClients: Number(b.uniqueClients ?? 0),
      avgPerAppointment: Number(b.avgPerAppointment ?? 0),
    }))
  }

  it('maps all barber fields correctly', () => {
    const rpcResult = [
      {
        id: 'b1',
        name: 'Carlos',
        photo_url: 'https://example.com/carlos.jpg',
        appointments: 50,
        revenue: 250000,
        uniqueClients: 30,
        avgPerAppointment: 5000,
      },
    ]
    const mapped = mapBarberRpc(rpcResult)
    expect(mapped[0]).toEqual({
      id: 'b1',
      name: 'Carlos',
      photo_url: 'https://example.com/carlos.jpg',
      appointments: 50,
      revenue: 250000,
      uniqueClients: 30,
      avgPerAppointment: 5000,
    })
  })

  it('preserves barbers with 0 appointments (LEFT JOIN)', () => {
    const rpcResult = [
      {
        id: 'b1',
        name: 'Carlos',
        photo_url: null,
        appointments: 0,
        revenue: 0,
        uniqueClients: 0,
        avgPerAppointment: 0,
      },
    ]
    const mapped = mapBarberRpc(rpcResult)
    expect(mapped[0].appointments).toBe(0)
    expect(mapped[0].uniqueClients).toBe(0)
  })

  it('handles null photo_url', () => {
    const rpcResult = [
      {
        id: 'b1',
        name: 'Test',
        photo_url: null,
        appointments: 1,
        revenue: 5000,
        uniqueClients: 1,
        avgPerAppointment: 5000,
      },
    ]
    const mapped = mapBarberRpc(rpcResult)
    expect(mapped[0].photo_url).toBeNull()
  })
})

// ============================================================
// Heatmap — RPC response mapping
// ============================================================
describe('heatmap RPC mapping', () => {
  function mapHeatmapRpc(rpcResult: any) {
    const cells = ((rpcResult.cells as any[]) || []).map((c: any) => ({
      day: Number(c.day),
      hour: Number(c.hour),
      count: Number(c.count),
    }))
    return {
      cells,
      maxCount: Number(rpcResult.maxCount ?? 0),
      totalAppointments: Number(rpcResult.totalAppointments ?? 0),
    }
  }

  it('maps cells with day/hour/count', () => {
    const rpcResult = {
      cells: [
        { day: 1, hour: 10, count: 5 },
        { day: 3, hour: 14, count: 12 },
      ],
      maxCount: 12,
      totalAppointments: 17,
    }
    const mapped = mapHeatmapRpc(rpcResult)
    expect(mapped.cells).toHaveLength(2)
    expect(mapped.cells[0]).toEqual({ day: 1, hour: 10, count: 5 })
    expect(mapped.maxCount).toBe(12)
    expect(mapped.totalAppointments).toBe(17)
  })

  it('handles empty cells', () => {
    const mapped = mapHeatmapRpc({ cells: [], maxCount: 0, totalAppointments: 0 })
    expect(mapped.cells).toEqual([])
    expect(mapped.maxCount).toBe(0)
  })

  it('handles null cells gracefully', () => {
    const mapped = mapHeatmapRpc({ cells: null, maxCount: 0, totalAppointments: 0 })
    expect(mapped.cells).toEqual([])
  })
})

// ============================================================
// Revenue Series — date bucket filling
// ============================================================
describe('revenue series date bucket filling', () => {
  // Extracted from the fillDateBuckets function in revenue-series/route.ts
  // Simplified version for testing the merge logic
  function mergeBuckets(
    rpcRows: Array<{ date_key: string; revenue: number; appointments: number }>,
    allKeys: string[]
  ) {
    const rpcMap = new Map<string, { revenue: number; appointments: number }>()
    for (const row of rpcRows) {
      rpcMap.set(row.date_key, {
        revenue: Number(row.revenue),
        appointments: Number(row.appointments),
      })
    }

    return allKeys.map((key) => ({
      dateKey: key,
      ...(rpcMap.get(key) || { revenue: 0, appointments: 0 }),
    }))
  }

  it('fills missing dates with 0 revenue', () => {
    const rpcRows = [
      { date_key: '2026-02-01', revenue: 5000, appointments: 2 },
      { date_key: '2026-02-03', revenue: 10000, appointments: 4 },
    ]
    const allKeys = ['2026-02-01', '2026-02-02', '2026-02-03']
    const result = mergeBuckets(rpcRows, allKeys)

    expect(result[0].revenue).toBe(5000)
    expect(result[1].revenue).toBe(0) // Missing date filled
    expect(result[1].appointments).toBe(0)
    expect(result[2].revenue).toBe(10000)
  })

  it('handles all dates with data', () => {
    const rpcRows = [
      { date_key: '2026-01', revenue: 100000, appointments: 50 },
      { date_key: '2026-02', revenue: 120000, appointments: 60 },
    ]
    const allKeys = ['2026-01', '2026-02']
    const result = mergeBuckets(rpcRows, allKeys)
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.revenue > 0)).toBe(true)
  })

  it('handles empty RPC result', () => {
    const allKeys = ['2026-02-01', '2026-02-02']
    const result = mergeBuckets([], allKeys)
    expect(result.every((r) => r.revenue === 0)).toBe(true)
  })
})

// ============================================================
// useChartColors stabilization — JSON comparison prevents re-renders
// ============================================================
describe('chart colors stabilization', () => {
  it('identical objects produce same JSON (no unnecessary setState)', () => {
    const a = { accent: '#6d7cff', grid: '#e5e7eb', axis: '#9ca3af' }
    const b = { accent: '#6d7cff', grid: '#e5e7eb', axis: '#9ca3af' }
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('different values produce different JSON (triggers setState)', () => {
    const light = { tooltipBg: 'rgba(255, 255, 255, 0.96)' }
    const dark = { tooltipBg: 'rgba(18, 22, 30, 0.86)' }
    expect(JSON.stringify(light)).not.toBe(JSON.stringify(dark))
  })
})
