/**
 * Phone normalization & validation (Costa Rica format)
 *
 * Used by book route for client resolution and gradual migration
 * of legacy phone formats (e.g., "8888-1234" → "88881234").
 */

/** Strip all non-digit characters */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/** Validate normalized phone is exactly 8 digits (Costa Rica format) */
export function isValidCRPhone(normalized: string): boolean {
  return /^\d{8}$/.test(normalized)
}
