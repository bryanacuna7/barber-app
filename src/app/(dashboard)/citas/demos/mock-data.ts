import type { Appointment } from '@/types/custom'

/**
 * Mock data para Citas demos
 * Appointments spread throughout a full day for realistic visualization
 */

// Extended type for mock data with populated relations
type AppointmentWithRelations = Omit<
  Appointment,
  'client_id' | 'service_id' | 'barber_id' | 'confirmation_sent_at' | 'reminder_sent_at'
> & {
  client: {
    id: string
    name: string
    phone: string
  }
  service: {
    id: string
    name: string
  }
  barber: {
    id: string
    name: string
  }
  confirmation_sent_at?: string
  reminder_sent_at?: string
}

const today = new Date()
const formatTime = (hours: number, minutes: number = 0) => {
  const date = new Date(today)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export const mockCitasData: AppointmentWithRelations[] = [
  // Completadas (morning)
  {
    id: 'apt-c1',
    scheduled_at: formatTime(8, 0),
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
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: null,
    internal_notes: 'Cliente regular, prefiere degradado medio',
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-c2',
    scheduled_at: formatTime(9, 15),
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
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: 'Primera vez, quiere algo moderno',
    internal_notes: null,
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // GAP: 10:00am - 10:30am (30 min)
  {
    id: 'apt-c3',
    scheduled_at: formatTime(10, 30),
    duration_minutes: 45,
    price: 15000,
    status: 'confirmed',
    client: {
      id: 'client-3',
      name: 'Alejandro Mora',
      phone: '66665555',
    },
    service: {
      id: 'service-3',
      name: 'Corte + Barba Premium',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: null,
    internal_notes: 'VIP - atención especial',
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-c4',
    scheduled_at: formatTime(11, 30),
    duration_minutes: 30,
    price: 10000,
    status: 'pending',
    client: {
      id: 'client-4',
      name: 'Fernando Castillo',
      phone: '55554444',
    },
    service: {
      id: 'service-4',
      name: 'Arreglo de Barba',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: null,
    internal_notes: 'Nuevo cliente',
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // GAP: 12:00pm - 1:00pm (lunch break)
  {
    id: 'apt-c5',
    scheduled_at: formatTime(13, 0),
    duration_minutes: 45,
    price: 12000,
    status: 'confirmed',
    client: {
      id: 'client-5',
      name: 'Miguel Ángel Vargas',
      phone: '44443333',
    },
    service: {
      id: 'service-5',
      name: 'Corte Fade + Diseño',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: 'Quiere diseño de líneas en el lateral',
    internal_notes: null,
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-c6',
    scheduled_at: formatTime(14, 0),
    duration_minutes: 30,
    price: 8000,
    status: 'confirmed',
    client: {
      id: 'client-6',
      name: 'José Pablo Solís',
      phone: '33332222',
    },
    service: {
      id: 'service-6',
      name: 'Corte Express',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: null,
    internal_notes: null,
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-c7',
    scheduled_at: formatTime(14, 45),
    duration_minutes: 45,
    price: 12000,
    status: 'confirmed',
    client: {
      id: 'client-7',
      name: 'Luis Eduardo Jiménez',
      phone: '22221111',
    },
    service: {
      id: 'service-7',
      name: 'Corte Clásico',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: null,
    internal_notes: null,
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // GAP: 3:30pm - 4:00pm (30 min)
  {
    id: 'apt-c8',
    scheduled_at: formatTime(16, 0),
    duration_minutes: 60,
    price: 18000,
    status: 'confirmed',
    client: {
      id: 'client-8',
      name: 'Andrés Villalobos',
      phone: '99998888',
    },
    service: {
      id: 'service-8',
      name: 'Corte + Barba + Cejas',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: 'Evento importante mañana',
    internal_notes: 'VIP client',
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-c9',
    scheduled_at: formatTime(17, 15),
    duration_minutes: 30,
    price: 10000,
    status: 'pending',
    client: {
      id: 'client-9',
      name: 'Carlos Rojas',
      phone: '66667777',
    },
    service: {
      id: 'service-9',
      name: 'Arreglo de Barba',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: null,
    internal_notes: 'Llamar para confirmar',
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt-c10',
    scheduled_at: formatTime(18, 0),
    duration_minutes: 45,
    price: 12000,
    status: 'pending',
    client: {
      id: 'client-10',
      name: 'Pablo Jiménez',
      phone: '55556666',
    },
    service: {
      id: 'service-10',
      name: 'Corte Clásico + Barba',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: null,
    internal_notes: 'Último del día',
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Earlier appointment (no-show)
  {
    id: 'apt-c11',
    scheduled_at: formatTime(7, 30),
    duration_minutes: 30,
    price: 8000,
    status: 'no_show',
    client: {
      id: 'client-11',
      name: 'Ricardo Salazar',
      phone: '11119999',
    },
    service: {
      id: 'service-11',
      name: 'Corte Express',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: null,
    internal_notes: 'No contestó llamada de confirmación',
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Cancelled
  {
    id: 'apt-c12',
    scheduled_at: formatTime(15, 45),
    duration_minutes: 30,
    price: 10000,
    status: 'cancelled',
    client: {
      id: 'client-12',
      name: 'Esteban Cordero',
      phone: '77778888',
    },
    service: {
      id: 'service-12',
      name: 'Arreglo de Barba',
    },
    barber: {
      id: 'barber-1',
      name: 'Carlos Méndez',
    },
    client_notes: null,
    internal_notes: 'Canceló por emergencia',
    business_id: 'business-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Stats calculation
export const mockCitasStats = {
  total: mockCitasData.length,
  pending: mockCitasData.filter((a) => a.status === 'pending').length,
  confirmed: mockCitasData.filter((a) => a.status === 'confirmed').length,
  completed: mockCitasData.filter((a) => a.status === 'completed').length,
  cancelled: mockCitasData.filter((a) => a.status === 'cancelled').length,
  no_show: mockCitasData.filter((a) => a.status === 'no_show').length,
  totalRevenue: mockCitasData
    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
    .reduce((sum, a) => sum + a.price, 0),
  projectedRevenue: mockCitasData
    .filter((a) => ['pending', 'confirmed', 'completed'].includes(a.status))
    .reduce((sum, a) => sum + a.price, 0),
}
