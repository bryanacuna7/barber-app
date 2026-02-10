/**
 * WhatsApp Deep Link Generator
 *
 * Generates wa.me links for 1-tap WhatsApp messaging from appointment cards.
 * Uses deep links ($0) instead of WhatsApp Business API (paid).
 *
 * Costa Rica phone format: 8 digits, country code +506
 */

const CR_COUNTRY_CODE = '506'

/**
 * Normalize a Costa Rican phone number to international format (no +)
 * Handles: "88887777", "8888-7777", "+50688887777", "506 8888 7777"
 */
function normalizePhone(phone: string): string | null {
  // Strip everything except digits
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 8) {
    return `${CR_COUNTRY_CODE}${digits}`
  }
  if (digits.length === 11 && digits.startsWith(CR_COUNTRY_CODE)) {
    return digits
  }
  if (digits.length >= 10) {
    // Already has country code or is international
    return digits
  }

  return null
}

/**
 * Build a WhatsApp deep link
 * Returns null if phone is invalid
 */
export function buildWhatsAppLink(phone: string, message?: string): string | null {
  const normalized = normalizePhone(phone)
  if (!normalized) return null

  const base = `https://wa.me/${normalized}`
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`
  }
  return base
}

// ---------------------------------------------------------------------------
// Message Templates (Costa Rican Spanish)
// ---------------------------------------------------------------------------

interface ConfirmationParams {
  clientName: string
  date: string
  time: string
  serviceName: string
  businessName: string
}

export function messageConfirmation({
  clientName,
  date,
  time,
  serviceName,
  businessName,
}: ConfirmationParams): string {
  return (
    `Hola ${clientName}! Tu cita está confirmada:\n\n` +
    `${serviceName}\n` +
    `${date} a las ${time}\n\n` +
    `Te esperamos! - ${businessName}`
  )
}

interface ReminderParams {
  clientName: string
  time: string
  barberName: string
  businessName: string
}

export function messageReminder({
  clientName,
  time,
  barberName,
  businessName,
}: ReminderParams): string {
  return (
    `Hola ${clientName}! Recordatorio: tenés cita hoy a las ${time} con ${barberName}.\n\n` +
    `Te esperamos! - ${businessName}`
  )
}

interface ArriveEarlyParams {
  clientName: string
  barberName: string
  businessName: string
  trackingUrl?: string
}

export function messageArriveEarly({
  clientName,
  barberName,
  businessName,
  trackingUrl,
}: ArriveEarlyParams): string {
  let msg =
    `Hola ${clientName}! ${barberName} ya está disponible. ` + `Podés llegar antes si querés!\n\n`
  if (trackingUrl) {
    msg += `Seguí tu turno en vivo: ${trackingUrl}\n\n`
  }
  msg += `- ${businessName}`
  return msg
}

/**
 * Build a "Llegá Antes" WhatsApp link for the next client
 */
export function buildArriveEarlyLink(phone: string, params: ArriveEarlyParams): string | null {
  return buildWhatsAppLink(phone, messageArriveEarly(params))
}
