export const SERVICE_CATEGORIES = ['corte', 'barba', 'combo', 'facial'] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export const SERVICE_ICON_NAMES = [
  'Scissors',
  'Slice',
  'Layers',
  'Smile',
  'Baby',
  'Eye',
  'WandSparkles',
  'Hand',
  'Crown',
  'Gift',
  'Palette',
  'Droplets',
] as const

export type ServiceIconName = (typeof SERVICE_ICON_NAMES)[number]

export const SERVICE_ICON_LABELS: Record<ServiceIconName, string> = {
  Scissors: 'Tijeras',
  Slice: 'Afeitado',
  Layers: 'Combo',
  Smile: 'Facial',
  Baby: 'Niños',
  Eye: 'Cejas',
  WandSparkles: 'Diseño',
  Hand: 'Masaje',
  Crown: 'Premium',
  Gift: 'Regalo',
  Palette: 'Color',
  Droplets: 'Toalla',
}

export const DEFAULT_ICON_BY_CATEGORY: Record<ServiceCategory, ServiceIconName> = {
  corte: 'Scissors',
  barba: 'Slice',
  combo: 'Layers',
  facial: 'Smile',
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
  if (
    haystack.includes('barba') ||
    haystack.includes('beard') ||
    haystack.includes('afeitado') ||
    haystack.includes('shave')
  )
    return 'Slice'
  if (haystack.includes('niño') || haystack.includes('kids') || haystack.includes('infantil'))
    return 'Baby'
  if (haystack.includes('ceja')) return 'Eye'
  if (haystack.includes('diseño') || haystack.includes('styling')) return 'WandSparkles'
  if (haystack.includes('masaje') || haystack.includes('massage')) return 'Hand'
  if (haystack.includes('premium') || haystack.includes('vip')) return 'Crown'
  if (haystack.includes('combo') || haystack.includes('+') || haystack.includes('paquete'))
    return 'Layers'
  if (haystack.includes('facial') || haystack.includes('skin') || haystack.includes('piel'))
    return 'Smile'
  if (haystack.includes('tinte') || haystack.includes('color') || haystack.includes('dye'))
    return 'Palette'
  if (haystack.includes('toalla') || haystack.includes('towel') || haystack.includes('vapor'))
    return 'Droplets'
  if (haystack.includes('regalo') || haystack.includes('gift')) return 'Gift'
  if (haystack.includes('corte') || haystack.includes('haircut')) return 'Scissors'

  const resolved = isServiceCategory(category) ? category : 'corte'
  return DEFAULT_ICON_BY_CATEGORY[resolved]
}
