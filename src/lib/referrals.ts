/**
 * Utilities para el sistema de referencias
 * Manejo de cookies para persistir códigos de referido durante el signup
 */

const REFERRAL_CODE_COOKIE = 'barbershop_referral_code'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 días

/**
 * Guarda el código de referido en una cookie
 * Se llama cuando el usuario llega a /register?ref=CODIGO
 */
export function saveReferralCode(code: string): void {
  if (typeof document === 'undefined') return // Server-side safety

  document.cookie = `${REFERRAL_CODE_COOKIE}=${code}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

/**
 * Lee el código de referido de la cookie
 * Se llama cuando el usuario completa el signup para trackear la conversión
 */
export function getReferralCode(): string | null {
  if (typeof document === 'undefined') return null // Server-side safety

  const cookies = document.cookie.split(';')
  const referralCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${REFERRAL_CODE_COOKIE}=`)
  )

  if (!referralCookie) return null

  return referralCookie.split('=')[1]
}

/**
 * Elimina el código de referido de la cookie
 * Se llama después de trackear exitosamente la conversión
 */
export function clearReferralCode(): void {
  if (typeof document === 'undefined') return // Server-side safety

  document.cookie = `${REFERRAL_CODE_COOKIE}=; path=/; max-age=0`
}

/**
 * Trackea una conversión de referido
 * Se llama después de que el usuario completa el signup exitosamente
 */
export async function trackReferralConversion(
  referralCode: string,
  newBusinessId: string,
  status: 'pending' | 'trial' | 'active' | 'churned' = 'pending'
): Promise<boolean> {
  try {
    const response = await fetch('/api/referrals/track-conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralCode,
        referredBusinessId: newBusinessId,
        status,
      }),
    })

    if (!response.ok) {
      console.error('Failed to track referral conversion:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Error tracking referral conversion:', error)
    return false
  }
}
