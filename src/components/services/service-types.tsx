import { Scissors } from 'lucide-react'
import {
  DEFAULT_ICON_BY_CATEGORY,
  SERVICE_ICON_LABELS,
  SERVICE_ICON_NAMES,
  isServiceCategory,
  resolveServiceIcon,
  type ServiceCategory,
  type ServiceIconName,
} from '@/lib/services/icons'
import { SERVICE_ICON_MAP } from '@/lib/services/icon-components'

// ============================================================================
// Types
// ============================================================================

export type CategoryFilter = 'all' | ServiceCategory
export type SortField = 'name' | 'bookings' | 'price' | 'duration'
export type SortDirection = 'asc' | 'desc'

export interface MockService {
  id: string
  name: string
  description: string
  category: ServiceCategory
  duration_minutes: number
  price: number
  bookings_this_month: number
  bookings_last_month: number
  revenue_this_month: number
  avg_rating: number
  total_reviews: number
  barber_names: string[]
  iconName: ServiceIconName
  color: string
  is_active: boolean
}

// ============================================================================
// Constants
// ============================================================================

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  corte: 'Corte',
  barba: 'Barba',
  combo: 'Combo',
  facial: 'Facial',
}

// ============================================================================
// Mock Data (Demo D)
// ============================================================================

export const mockServices: MockService[] = [
  {
    id: '1',
    name: 'Corte Clásico',
    description: 'Corte tradicional con máquina y tijera',
    category: 'corte',
    duration_minutes: 30,
    price: 8000,
    bookings_this_month: 87,
    bookings_last_month: 79,
    revenue_this_month: 696000,
    avg_rating: 4.8,
    total_reviews: 234,
    barber_names: ['Juan', 'Carlos', 'Roberto'],
    iconName: 'Scissors',
    color: 'blue',
    is_active: true,
  },
  {
    id: '2',
    name: 'Corte Premium',
    description: 'Corte personalizado con asesoría de estilo',
    category: 'corte',
    duration_minutes: 45,
    price: 12000,
    bookings_this_month: 52,
    bookings_last_month: 48,
    revenue_this_month: 624000,
    avg_rating: 4.9,
    total_reviews: 156,
    barber_names: ['Juan', 'Roberto'],
    iconName: 'Layers',
    color: 'purple',
    is_active: true,
  },
  {
    id: '3',
    name: 'Fade Moderno',
    description: 'Degradado profesional con línea definida',
    category: 'corte',
    duration_minutes: 40,
    price: 10000,
    bookings_this_month: 64,
    bookings_last_month: 58,
    revenue_this_month: 640000,
    avg_rating: 4.7,
    total_reviews: 189,
    barber_names: ['Roberto', 'Carlos'],
    iconName: 'Scissors',
    color: 'amber',
    is_active: true,
  },
  {
    id: '4',
    name: 'Barba Completa',
    description: 'Perfilado y arreglo de barba profesional',
    category: 'barba',
    duration_minutes: 25,
    price: 6000,
    bookings_this_month: 45,
    bookings_last_month: 42,
    revenue_this_month: 270000,
    avg_rating: 4.6,
    total_reviews: 145,
    barber_names: ['Carlos', 'Miguel'],
    iconName: 'Slice',
    color: 'red',
    is_active: true,
  },
  {
    id: '5',
    name: 'Afeitado Clásico',
    description: 'Afeitado con navaja y toalla caliente',
    category: 'barba',
    duration_minutes: 30,
    price: 8000,
    bookings_this_month: 38,
    bookings_last_month: 35,
    revenue_this_month: 304000,
    avg_rating: 4.9,
    total_reviews: 98,
    barber_names: ['Carlos'],
    iconName: 'Slice',
    color: 'cyan',
    is_active: true,
  },
  {
    id: '6',
    name: 'Combo VIP',
    description: 'Corte + Barba + Tratamiento capilar',
    category: 'combo',
    duration_minutes: 60,
    price: 18000,
    bookings_this_month: 29,
    bookings_last_month: 25,
    revenue_this_month: 522000,
    avg_rating: 5.0,
    total_reviews: 67,
    barber_names: ['Juan', 'Roberto'],
    iconName: 'Crown',
    color: 'gold',
    is_active: true,
  },
  {
    id: '7',
    name: 'Combo Rápido',
    description: 'Corte + Barba express',
    category: 'combo',
    duration_minutes: 45,
    price: 14000,
    bookings_this_month: 41,
    bookings_last_month: 38,
    revenue_this_month: 574000,
    avg_rating: 4.7,
    total_reviews: 112,
    barber_names: ['Todos'],
    iconName: 'Gift',
    color: 'emerald',
    is_active: true,
  },
  {
    id: '8',
    name: 'Facial Hidratante',
    description: 'Limpieza facial + hidratación profunda',
    category: 'facial',
    duration_minutes: 50,
    price: 15000,
    bookings_this_month: 22,
    bookings_last_month: 19,
    revenue_this_month: 330000,
    avg_rating: 4.8,
    total_reviews: 54,
    barber_names: ['Miguel'],
    iconName: 'Smile',
    color: 'green',
    is_active: true,
  },
  {
    id: '9',
    name: 'Corte Niño',
    description: 'Corte especial para niños menores de 12 años',
    category: 'corte',
    duration_minutes: 20,
    price: 6000,
    bookings_this_month: 56,
    bookings_last_month: 52,
    revenue_this_month: 336000,
    avg_rating: 4.5,
    total_reviews: 178,
    barber_names: ['Juan', 'Miguel'],
    iconName: 'Baby',
    color: 'blue',
    is_active: true,
  },
  {
    id: '10',
    name: 'Cejas',
    description: 'Perfilado y arreglo de cejas',
    category: 'facial',
    duration_minutes: 15,
    price: 3000,
    bookings_this_month: 34,
    bookings_last_month: 31,
    revenue_this_month: 102000,
    avg_rating: 4.4,
    total_reviews: 89,
    barber_names: ['Miguel', 'Carlos'],
    iconName: 'Eye',
    color: 'zinc',
    is_active: true,
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

export function ServiceIcon({
  iconName,
  className,
}: {
  iconName: MockService['iconName']
  className: string
}) {
  const Icon = SERVICE_ICON_MAP[iconName] || Scissors
  return <Icon className={className} aria-hidden="true" />
}

export function getCategoryColor(category: ServiceCategory) {
  const colors: Record<
    ServiceCategory,
    { bg: string; text: string; ring: string; gradient: string }
  > = {
    corte: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      ring: 'ring-blue-500',
      gradient: 'from-blue-500 to-cyan-600',
    },
    barba: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      ring: 'ring-amber-500',
      gradient: 'from-amber-500 to-orange-600',
    },
    combo: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      ring: 'ring-purple-500',
      gradient: 'from-purple-500 to-pink-600',
    },
    facial: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      ring: 'ring-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
    },
  }
  return colors[category]
}

export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function inferCategory(name: string, description?: string): ServiceCategory {
  const haystack = `${name} ${description ?? ''}`.toLowerCase()
  if (haystack.includes('barba') || haystack.includes('afeitado')) return 'barba'
  if (haystack.includes('combo') || haystack.includes('+')) return 'combo'
  if (
    haystack.includes('facial') ||
    haystack.includes('ceja') ||
    haystack.includes('piel') ||
    haystack.includes('masaje')
  )
    return 'facial'
  return 'corte'
}

export function resolveCategory(
  category: string | null | undefined,
  name: string,
  description?: string
): ServiceCategory {
  if (isServiceCategory(category)) return category
  return inferCategory(name, description)
}

export function iconNameForCategory(category: ServiceCategory): ServiceIconName {
  return DEFAULT_ICON_BY_CATEGORY[category]
}

export function colorForCategory(category: ServiceCategory): string {
  if (category === 'barba') return 'amber'
  if (category === 'combo') return 'purple'
  if (category === 'facial') return 'emerald'
  return 'blue'
}

export function parseDigits(value: string): number {
  return Number((value || '').replace(/[^\d]/g, '') || '0')
}

export function formatWithThousands(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  return value.toLocaleString('en-US')
}

// Re-exports for convenience
export {
  DEFAULT_ICON_BY_CATEGORY,
  SERVICE_ICON_LABELS,
  SERVICE_ICON_NAMES,
  resolveServiceIcon,
  SERVICE_ICON_MAP,
}
export type { ServiceCategory, ServiceIconName }
