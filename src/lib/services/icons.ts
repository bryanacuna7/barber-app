export const SERVICE_CATEGORIES = ['corte', 'barba', 'combo', 'facial'] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export const SERVICE_ICON_NAMES = [
  'Zap',
  'Flame',
  'Crown',
  'Sparkles',
  'Waves',
  'Wind',
  'Users',
  'CircleDot',
  'Scissors',
  'Gift',
  'Star',
  'Sparkle',
] as const

export type ServiceIconName = (typeof SERVICE_ICON_NAMES)[number]

export const SERVICE_ICON_LABELS: Record<ServiceIconName, string> = {
  Zap: 'Rayo',
  Flame: 'Fuego',
  Crown: 'Corona',
  Sparkles: 'Brillos',
  Waves: 'Ondas',
  Wind: 'Viento',
  Users: 'Usuarios',
  CircleDot: 'Punto',
  Scissors: 'Tijeras',
  Gift: 'Regalo',
  Star: 'Estrella',
  Sparkle: 'Destello',
}

export const DEFAULT_ICON_BY_CATEGORY: Record<ServiceCategory, ServiceIconName> = {
  corte: 'Zap',
  barba: 'Flame',
  combo: 'Crown',
  facial: 'Sparkles',
}

export function isServiceCategory(value: string | null | undefined): value is ServiceCategory {
  return typeof value === 'string' && SERVICE_CATEGORIES.includes(value as ServiceCategory)
}

export function isServiceIconName(value: string | null | undefined): value is ServiceIconName {
  return typeof value === 'string' && SERVICE_ICON_NAMES.includes(value as ServiceIconName)
}

/**
 * Resolve icon for a service using a canonical fallback chain:
 * 1. Persisted DB icon (if valid)
 * 2. Name/description keyword heuristic
 * 3. Category default
 */
export function resolveServiceIcon(
  icon: string | null | undefined,
  category: string | null | undefined,
  name: string,
  description?: string | null
): ServiceIconName {
  if (isServiceIconName(icon)) return icon

  const haystack = `${name} ${description ?? ''}`.toLowerCase()
  if (haystack.includes('barba') || haystack.includes('beard')) return 'Flame'
  if (haystack.includes('afeitado') || haystack.includes('shave')) return 'Scissors'
  if (haystack.includes('niño') || haystack.includes('kids')) return 'Users'
  if (haystack.includes('diseño')) return 'Wind'
  if (haystack.includes('ceja')) return 'CircleDot'
  if (haystack.includes('masaje')) return 'Waves'
  if (haystack.includes('premium')) return 'Star'
  if (haystack.includes('combo') || haystack.includes('+') || haystack.includes('paquete')) {
    return 'Crown'
  }
  if (haystack.includes('facial') || haystack.includes('skin') || haystack.includes('piel')) {
    return 'Sparkles'
  }
  if (haystack.includes('corte') || haystack.includes('haircut')) return 'Zap'

  const resolved = isServiceCategory(category) ? category : 'corte'
  return DEFAULT_ICON_BY_CATEGORY[resolved]
}
