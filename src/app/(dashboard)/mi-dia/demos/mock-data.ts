import type { TodayAppointmentsResponse } from '@/types/custom'

/**
 * Mock data for Mi Día demos
 * Allows previewing without authentication
 */
export const mockMiDiaData: TodayAppointmentsResponse = {
  barber: {
    id: 'mock-barber-1',
    name: 'Carlos Méndez',
  },
  date: new Date().toISOString().split('T')[0],
  stats: {
    total: 8,
    pending: 2,
    confirmed: 3,
    completed: 2,
    cancelled: 0,
    no_show: 1,
  },
  appointments: [
    {
      id: 'apt-1',
      scheduled_at: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
      duration_minutes: 45,
      price: 12000,
      status: 'completed',
      client: {
        id: 'client-1',
        name: 'Roberto González',
        phone: '88887777',
      },
      service: {
        id: 'service-1',
        name: 'Corte Clásico + Barba',
      },
      client_notes: null,
      internal_notes: 'Cliente regular, prefiere degradado medio',
    },
    {
      id: 'apt-2',
      scheduled_at: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
      duration_minutes: 30,
      price: 8000,
      status: 'completed',
      client: {
        id: 'client-2',
        name: 'Diego Ramírez',
        phone: '77776666',
      },
      service: {
        id: 'service-2',
        name: 'Corte Express',
      },
      client_notes: 'Primera vez, quiere algo moderno',
      internal_notes: null,
    },
    {
      id: 'apt-3',
      scheduled_at: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
      duration_minutes: 60,
      price: 15000,
      status: 'pending',
      client: {
        id: 'client-3',
        name: 'Alejandro Mora',
        phone: '66665555',
      },
      service: {
        id: 'service-3',
        name: 'Corte + Barba Premium',
      },
      client_notes: null,
      internal_notes: 'VIP - atención especial',
    },
    {
      id: 'apt-4',
      scheduled_at: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
      duration_minutes: 45,
      price: 12000,
      status: 'confirmed',
      client: {
        id: 'client-4',
        name: 'Fernando Castillo',
        phone: '55554444',
      },
      service: {
        id: 'service-4',
        name: 'Corte Fade + Diseño',
      },
      client_notes: 'Quiere diseño de líneas en el lateral',
      internal_notes: null,
    },
    {
      id: 'apt-5',
      scheduled_at: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(),
      duration_minutes: 30,
      price: 10000,
      status: 'confirmed',
      client: {
        id: 'client-5',
        name: 'Miguel Ángel Vargas',
        phone: '44443333',
      },
      service: {
        id: 'service-5',
        name: 'Arreglo de Barba',
      },
      client_notes: null,
      internal_notes: null,
    },
    {
      id: 'apt-6',
      scheduled_at: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
      duration_minutes: 45,
      price: 12000,
      status: 'confirmed',
      client: {
        id: 'client-6',
        name: 'José Pablo Solís',
        phone: '33332222',
      },
      service: {
        id: 'service-6',
        name: 'Corte + Barba',
      },
      client_notes: null,
      internal_notes: 'Última cita antes del evento',
    },
    {
      id: 'apt-7',
      scheduled_at: new Date(new Date().setHours(16, 45, 0, 0)).toISOString(),
      duration_minutes: 30,
      price: 8000,
      status: 'pending',
      client: {
        id: 'client-7',
        name: 'Luis Eduardo Jiménez',
        phone: '22221111',
      },
      service: {
        id: 'service-7',
        name: 'Corte Niño',
      },
      client_notes: 'Niño de 8 años, un poco inquieto',
      internal_notes: null,
    },
    {
      id: 'apt-8',
      scheduled_at: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      duration_minutes: 45,
      price: 12000,
      status: 'no_show',
      client: {
        id: 'client-8',
        name: 'Ricardo Salazar',
        phone: '11119999',
      },
      service: {
        id: 'service-8',
        name: 'Corte Clásico',
      },
      client_notes: null,
      internal_notes: 'No contestó llamada de confirmación',
    },
  ],
}
