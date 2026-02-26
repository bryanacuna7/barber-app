const LEGACY_BRAND_NAMES = new Set(['barbershop pro', 'barber shop pro'])

function normalizeCandidate(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function normalizeDisplayBusinessName(name: string | null | undefined) {
  const trimmed = name?.trim()

  if (!trimmed) {
    return 'BarberApp'
  }

  if (LEGACY_BRAND_NAMES.has(normalizeCandidate(trimmed))) {
    return 'BarberApp'
  }

  return trimmed
}
