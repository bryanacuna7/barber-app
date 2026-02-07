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
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyCompactMillions(amount: number): string {
  if (Math.abs(amount) < 1000000) {
    return formatCurrency(amount)
  }

  const millions = amount / 1000000
  const decimals = Math.abs(millions) >= 10 ? 0 : 1
  const compact = millions.toFixed(decimals).replace(/\.0$/, '')

  return `₡${compact}M`
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000) {
    return `₡${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 100000) {
    return `₡${Math.round(amount / 1000)}k`
  }
  if (amount >= 10000) {
    return `₡${(amount / 1000).toFixed(1)}k`
  }
  return `₡${amount.toLocaleString('es-CR')}`
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
  }
  return phone
}
