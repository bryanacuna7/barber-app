import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "d 'de' MMMM, yyyy", { locale: es })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'h:mm a', { locale: es })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "d 'de' MMMM, h:mm a", { locale: es })
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export function formatCurrency(amount: number): string {
  return `₡${Math.round(amount).toLocaleString('en-US')}`
}

export function formatCurrencyCompactMillions(amount: number): string {
  if (Math.abs(amount) < 1000000) {
    return formatCurrency(amount)
  }

  const millions = amount / 1000000
  return `₡${millions.toFixed(1)}M`
}

export function formatCurrencyCompact(amount: number): string {
  return formatCurrencyCompactMillions(amount)
}

/**
 * Compact currency for mobile displays (e.g., "₡45,000" → "₡45 mil").
 * Returns null if the value is not a ₡ currency string or doesn't need compacting.
 */
export function compactCurrencyForMobile(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed.startsWith('₡')) return null
  if (/[kKmM]|mil/.test(trimmed)) return trimmed

  const numericPart = trimmed.replace(/[^\d-]/g, '')
  if (!numericPart) return null

  const amount = Number(numericPart)
  if (!Number.isFinite(amount)) return null
  if (Math.abs(amount) < 1_000) return trimmed

  const compact = new Intl.NumberFormat('es-CR', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(amount)

  return `₡${compact}`
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
  }
  return phone
}
