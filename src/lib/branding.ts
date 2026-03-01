export function normalizeDisplayBusinessName(name: string | null | undefined) {
  const trimmed = name?.trim()

  if (!trimmed) {
    return 'BarberApp'
  }

  return trimmed
}
