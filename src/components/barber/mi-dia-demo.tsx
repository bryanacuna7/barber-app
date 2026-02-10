'use client'

/**
 * Mi Día Demo Component
 *
 * This file demonstrates all Mi Día components with mock data.
 * Useful for:
 * - Visual testing
 * - Component showcase
 * - Storybook integration
 * - Design review
 *
 * To use: Import and render in any page or Storybook story.
 */

import { useState } from 'react'
import { MiDiaHeader } from './mi-dia-header'
import { MiDiaTimeline } from './mi-dia-timeline'
import type { TodayAppointment } from '@/types/custom'

// Mock data
const mockAppointments: TodayAppointment[] = [
  {
    id: '1',
    scheduled_at: new Date(new Date().setHours(9, 0, 0)).toISOString(),
    duration_minutes: 30,
    price: 15000,
    status: 'pending',
    client_notes: 'Primera vez, quiere un corte moderno',
    internal_notes: 'Cliente nuevo',
    started_at: null,
    actual_duration_minutes: null,
    payment_method: null,
    client: {
      id: 'c1',
      name: 'Carlos Rodríguez',
      phone: '88887777',
      email: 'carlos@example.com',
    },
    service: {
      id: 's1',
      name: 'Corte de Cabello',
      duration_minutes: 30,
      price: 15000,
    },
  },
  {
    id: '2',
    scheduled_at: new Date(new Date().setHours(10, 30, 0)).toISOString(),
    duration_minutes: 45,
    price: 25000,
    status: 'confirmed',
    client_notes: null,
    internal_notes: 'Cliente regular, le gusta el fade',
    started_at: new Date(new Date().setHours(10, 15, 0)).toISOString(),
    actual_duration_minutes: null,
    payment_method: null,
    client: {
      id: 'c2',
      name: 'María González',
      phone: '77776666',
      email: null,
    },
    service: {
      id: 's2',
      name: 'Corte + Barba',
      duration_minutes: 45,
      price: 25000,
    },
  },
  {
    id: '3',
    scheduled_at: new Date(new Date().setHours(12, 0, 0)).toISOString(),
    duration_minutes: 30,
    price: 15000,
    status: 'completed',
    client_notes: null,
    internal_notes: null,
    started_at: null,
    actual_duration_minutes: 22,
    payment_method: 'cash' as const,
    client: {
      id: 'c3',
      name: 'José Martínez',
      phone: '66665555',
      email: 'jose@example.com',
    },
    service: {
      id: 's1',
      name: 'Corte de Cabello',
      duration_minutes: 30,
      price: 15000,
    },
  },
  {
    id: '4',
    scheduled_at: new Date(new Date().setHours(14, 0, 0)).toISOString(),
    duration_minutes: 60,
    price: 35000,
    status: 'pending',
    client_notes: 'Quiere cambio de look completo',
    internal_notes: 'Consulta de color',
    started_at: null,
    actual_duration_minutes: null,
    payment_method: null,
    client: {
      id: 'c4',
      name: 'Ana Sánchez',
      phone: '55554444',
      email: 'ana@example.com',
    },
    service: {
      id: 's3',
      name: 'Corte + Color',
      duration_minutes: 60,
      price: 35000,
    },
  },
  {
    id: '5',
    scheduled_at: new Date(new Date().setHours(15, 30, 0)).toISOString(),
    duration_minutes: 30,
    price: 15000,
    status: 'no_show',
    client_notes: null,
    internal_notes: 'No contestó llamada',
    started_at: null,
    actual_duration_minutes: null,
    payment_method: null,
    client: {
      id: 'c5',
      name: 'Pedro Ramírez',
      phone: '44443333',
      email: null,
    },
    service: {
      id: 's1',
      name: 'Corte de Cabello',
      duration_minutes: 30,
      price: 15000,
    },
  },
]

const mockStats = {
  total: 5,
  pending: 2,
  confirmed: 1,
  completed: 1,
  cancelled: 0,
  no_show: 1,
}

export function MiDiaDemo() {
  const [appointments, setAppointments] = useState(mockAppointments)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleCheckIn = (id: string) => {
    setLoadingId(id)
    // Simulate API call
    setTimeout(() => {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'confirmed' as const } : apt))
      )
      setLoadingId(null)
    }, 500)
  }

  const handleComplete = (id: string) => {
    setLoadingId(id)
    setTimeout(() => {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'completed' as const } : apt))
      )
      setLoadingId(null)
    }, 500)
  }

  const handleNoShow = (id: string) => {
    setLoadingId(id)
    setTimeout(() => {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'no_show' as const } : apt))
      )
      setLoadingId(null)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <MiDiaHeader
        barberName="Juan Pérez"
        date={new Date().toISOString()}
        stats={mockStats}
        lastUpdated={new Date()}
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Demo Mode:</strong> This is a demonstration with mock data. Click the action
            buttons to see the UI update in real-time.
          </p>
        </div>

        <MiDiaTimeline
          appointments={appointments}
          onCheckIn={handleCheckIn}
          onComplete={handleComplete}
          onNoShow={handleNoShow}
          loadingAppointmentId={loadingId}
        />
      </main>
    </div>
  )
}

// Empty state demo
export function MiDiaEmptyDemo() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <MiDiaHeader
        barberName="Juan Pérez"
        date={new Date().toISOString()}
        stats={{
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          no_show: 0,
        }}
        lastUpdated={new Date()}
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <MiDiaTimeline appointments={[]} />
      </main>
    </div>
  )
}
