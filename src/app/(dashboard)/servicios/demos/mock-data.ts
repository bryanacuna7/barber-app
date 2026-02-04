// Mock data for Servicios demos
// This data is NOT connected to the real database - it's for UI exploration only

export type ServiceCategory = 'corte' | 'barba' | 'combo' | 'facial' | 'styling'
export type ServiceStatus = 'active' | 'paused' | 'archived'

export interface MockService {
  id: string
  name: string
  description: string
  category: ServiceCategory
  duration_minutes: number
  price: number
  status: ServiceStatus
  // Analytics (would come from appointments table in real app)
  bookings_this_month: number
  bookings_last_month: number
  revenue_this_month: number
  avg_rating: number
  total_reviews: number
  actual_avg_duration: number // Real avg vs estimated
  // Staff (would come from barber_services join table)
  barber_ids: string[]
  barber_names: string[]
  // Visual (Lucide icon name instead of emoji)
  iconName:
    | 'Scissors'
    | 'Sparkles'
    | 'Zap'
    | 'Users'
    | 'Wind'
    | 'Waves'
    | 'Flame'
    | 'Star'
    | 'Gift'
    | 'Crown'
    | 'CircleDot'
    | 'Sparkle'
  color: string
  gradient: string
}

export interface MockBarber {
  id: string
  name: string
  avatar: string
  specialty: string
}

// Mock barbers
export const mockBarbers: MockBarber[] = [
  { id: '1', name: 'Juan Pérez', avatar: '👨‍🦱', specialty: 'Cortes clásicos' },
  { id: '2', name: 'Carlos Rodríguez', avatar: '👨‍🦰', specialty: 'Barba y afeitado' },
  { id: '3', name: 'Roberto Sánchez', avatar: '👨‍🦲', specialty: 'Cortes modernos' },
  { id: '4', name: 'Miguel Torres', avatar: '🧔', specialty: 'Faciales y spa' },
]

// Mock services (12 services across 4 categories)
export const mockServices: MockService[] = [
  // CORTE CATEGORY (5 services)
  {
    id: '1',
    name: 'Corte Clásico',
    description: 'Corte tradicional con máquina y tijera, incluye lavado y peinado',
    category: 'corte',
    duration_minutes: 30,
    price: 8000,
    status: 'active',
    bookings_this_month: 87,
    bookings_last_month: 79,
    revenue_this_month: 696000,
    avg_rating: 4.8,
    total_reviews: 234,
    actual_avg_duration: 28,
    barber_ids: ['1', '2', '3'],
    barber_names: ['Juan Pérez', 'Carlos Rodríguez', 'Roberto Sánchez'],
    iconName: 'Scissors',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: '2',
    name: 'Corte Premium',
    description: 'Corte personalizado con asesoría de estilo, lavado premium, masaje capilar',
    category: 'corte',
    duration_minutes: 45,
    price: 12000,
    status: 'active',
    bookings_this_month: 52,
    bookings_last_month: 48,
    revenue_this_month: 624000,
    avg_rating: 4.9,
    total_reviews: 156,
    actual_avg_duration: 43,
    barber_ids: ['1', '3'],
    barber_names: ['Juan Pérez', 'Roberto Sánchez'],
    iconName: 'Sparkles',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: '3',
    name: 'Corte Fade',
    description: 'Degradado moderno (low, mid o high fade) con diseño de líneas',
    category: 'corte',
    duration_minutes: 40,
    price: 10000,
    status: 'active',
    bookings_this_month: 64,
    bookings_last_month: 71,
    revenue_this_month: 640000,
    avg_rating: 4.7,
    total_reviews: 189,
    actual_avg_duration: 38,
    barber_ids: ['3'],
    barber_names: ['Roberto Sánchez'],
    iconName: 'Flame',
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    id: '4',
    name: 'Corte Niño',
    description: 'Corte infantil (menores de 12 años) con paciencia y experiencia',
    category: 'corte',
    duration_minutes: 25,
    price: 6000,
    status: 'active',
    bookings_this_month: 38,
    bookings_last_month: 42,
    revenue_this_month: 228000,
    avg_rating: 4.9,
    total_reviews: 98,
    actual_avg_duration: 22,
    barber_ids: ['1', '2'],
    barber_names: ['Juan Pérez', 'Carlos Rodríguez'],
    iconName: 'Users',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: '5',
    name: 'Rapado Completo',
    description: 'Rapado a máquina (calibre 0-3) rápido y limpio',
    category: 'corte',
    duration_minutes: 15,
    price: 5000,
    status: 'active',
    bookings_this_month: 29,
    bookings_last_month: 31,
    revenue_this_month: 145000,
    avg_rating: 4.6,
    total_reviews: 67,
    actual_avg_duration: 14,
    barber_ids: ['1', '2', '3'],
    barber_names: ['Juan Pérez', 'Carlos Rodríguez', 'Roberto Sánchez'],
    iconName: 'Zap',
    color: 'gray',
    gradient: 'from-gray-500 to-zinc-600',
  },

  // BARBA CATEGORY (3 services)
  {
    id: '6',
    name: 'Arreglo de Barba',
    description: 'Perfilado y recorte de barba con navaja, incluye aceite hidratante',
    category: 'barba',
    duration_minutes: 20,
    price: 5000,
    status: 'active',
    bookings_this_month: 71,
    bookings_last_month: 68,
    revenue_this_month: 355000,
    avg_rating: 4.8,
    total_reviews: 178,
    actual_avg_duration: 19,
    barber_ids: ['2', '4'],
    barber_names: ['Carlos Rodríguez', 'Miguel Torres'],
    iconName: 'Wind',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: '7',
    name: 'Afeitado Clásico',
    description: 'Afeitado completo con navaja, toalla caliente, y tratamiento post-afeitado',
    category: 'barba',
    duration_minutes: 30,
    price: 8000,
    status: 'active',
    bookings_this_month: 34,
    bookings_last_month: 29,
    revenue_this_month: 272000,
    avg_rating: 4.9,
    total_reviews: 89,
    actual_avg_duration: 32,
    barber_ids: ['2'],
    barber_names: ['Carlos Rodríguez'],
    iconName: 'Waves',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    id: '8',
    name: 'Diseño de Barba',
    description: 'Diseño artístico de barba con líneas y estilos personalizados',
    category: 'barba',
    duration_minutes: 35,
    price: 9000,
    status: 'active',
    bookings_this_month: 22,
    bookings_last_month: 19,
    revenue_this_month: 198000,
    avg_rating: 4.7,
    total_reviews: 54,
    actual_avg_duration: 33,
    barber_ids: ['2', '3'],
    barber_names: ['Carlos Rodríguez', 'Roberto Sánchez'],
    iconName: 'Sparkle',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
  },

  // COMBO CATEGORY (2 services)
  {
    id: '9',
    name: 'Combo Corte + Barba',
    description: 'Corte clásico + arreglo de barba - ahorra ₡2,000',
    category: 'combo',
    duration_minutes: 50,
    price: 11000, // Regular: 8000 + 5000 = 13000
    status: 'active',
    bookings_this_month: 43,
    bookings_last_month: 38,
    revenue_this_month: 473000,
    avg_rating: 4.9,
    total_reviews: 112,
    actual_avg_duration: 47,
    barber_ids: ['1', '2'],
    barber_names: ['Juan Pérez', 'Carlos Rodríguez'],
    iconName: 'Gift',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: '10',
    name: 'Combo Premium Total',
    description: 'Corte premium + afeitado clásico + facial - experiencia completa',
    category: 'combo',
    duration_minutes: 90,
    price: 25000, // Regular: 12000 + 8000 + 7000 = 27000
    status: 'active',
    bookings_this_month: 14,
    bookings_last_month: 11,
    revenue_this_month: 350000,
    avg_rating: 5.0,
    total_reviews: 42,
    actual_avg_duration: 88,
    barber_ids: ['2', '4'],
    barber_names: ['Carlos Rodríguez', 'Miguel Torres'],
    iconName: 'Crown',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
  },

  // FACIAL CATEGORY (2 services)
  {
    id: '11',
    name: 'Facial Express',
    description: 'Limpieza facial rápida con mascarilla purificante',
    category: 'facial',
    duration_minutes: 25,
    price: 7000,
    status: 'active',
    bookings_this_month: 18,
    bookings_last_month: 16,
    revenue_this_month: 126000,
    avg_rating: 4.6,
    total_reviews: 38,
    actual_avg_duration: 24,
    barber_ids: ['4'],
    barber_names: ['Miguel Torres'],
    iconName: 'CircleDot',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: '12',
    name: 'Masaje de Cejas',
    description: 'Perfilado y arreglo profesional de cejas',
    category: 'facial',
    duration_minutes: 15,
    price: 4000,
    status: 'paused', // Example of paused service
    bookings_this_month: 8,
    bookings_last_month: 12,
    revenue_this_month: 32000,
    avg_rating: 4.5,
    total_reviews: 21,
    actual_avg_duration: 13,
    barber_ids: ['4'],
    barber_names: ['Miguel Torres'],
    iconName: 'Star',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
  },
]

// Helper functions
export const getCategoryLabel = (category: ServiceCategory): string => {
  const labels: Record<ServiceCategory, string> = {
    corte: 'Corte',
    barba: 'Barba',
    combo: 'Combo',
    facial: 'Facial',
    styling: 'Styling',
  }
  return labels[category]
}

export const getCategoryColor = (category: ServiceCategory) => {
  const colors: Record<ServiceCategory, { bg: string; text: string; border: string }> = {
    corte: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    barba: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
    },
    combo: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    facial: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    styling: {
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
    },
  }
  return colors[category]
}

export const getStatusBadge = (status: ServiceStatus) => {
  const badges: Record<ServiceStatus, { label: string; color: string }> = {
    active: {
      label: 'Activo',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    paused: {
      label: 'Pausado',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    archived: {
      label: 'Archivado',
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    },
  }
  return badges[status]
}

// Calculate totals
export const getTotalRevenue = () => mockServices.reduce((sum, s) => sum + s.revenue_this_month, 0)
export const getTotalBookings = () =>
  mockServices.reduce((sum, s) => sum + s.bookings_this_month, 0)
export const getAveragePrice = () =>
  mockServices.reduce((sum, s) => sum + s.price, 0) / mockServices.length
export const getTopService = () => {
  return mockServices.reduce((top, service) =>
    service.revenue_this_month > top.revenue_this_month ? service : top
  )
}

// Get services by category
export const getServicesByCategory = (category: ServiceCategory) => {
  return mockServices.filter((s) => s.category === category)
}

// Get active services only
export const getActiveServices = () => {
  return mockServices.filter((s) => s.status === 'active')
}

// Calculate growth percentage
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return 100
  return Math.round(((current - previous) / previous) * 100)
}
