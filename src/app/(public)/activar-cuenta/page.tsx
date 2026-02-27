'use client'

/**
 * /activar-cuenta?claim=UUID
 *
 * Public page (no auth required) — email fallback for account creation.
 * When a client clicks "Crear mi cuenta" from the confirmation email,
 * they land here. Fetches claim info and renders the InlineRegistrationCard.
 *
 * States:
 * - Loading: fetching claim info
 * - Error: token missing, invalid, or expired → friendly error with CTAs
 * - Ready: renders registration form
 * - Success: redirects to /mi-cuenta
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, CalendarPlus, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InlineRegistrationCard } from '@/components/reservar/inline-registration-card'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface ClaimInfo {
  email: string | null
  clientName: string | null
  businessName: string | null
  businessId: string
  businessSlug: string | null
}

function ActivarCuentaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const claimToken = searchParams.get('claim')

  const [state, setState] = useState<'loading' | 'error' | 'ready' | 'success'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null)

  useEffect(() => {
    async function fetchClaimInfo() {
      if (!claimToken || !UUID_REGEX.test(claimToken)) {
        setErrorMessage('El enlace no es válido. Verifica que copiaste la URL completa.')
        setState('error')
        return
      }

      try {
        const res = await fetch(`/api/public/claim-info?token=${claimToken}`)

        if (!res.ok) {
          setErrorMessage('Este enlace ha expirado o ya fue utilizado.')
          setState('error')
          return
        }

        const data: ClaimInfo = await res.json()
        setClaimInfo(data)
        setState('ready')
      } catch {
        setErrorMessage('Error al verificar el enlace. Intenta de nuevo.')
        setState('error')
      }
    }

    fetchClaimInfo()
  }, [claimToken])

  const handleAccountCreated = () => {
    setState('success')
    // Redirect to client dashboard after brief success animation
    setTimeout(() => {
      router.push('/mi-cuenta')
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#F2F2F7] dark:bg-[#1C1C1E]">
      <div className="w-full max-w-md">
        {/* Loading */}
        {state === 'loading' && (
          <div className="ios-card p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
            <p className="mt-4 text-[15px] text-zinc-500 dark:text-zinc-400">
              Verificando enlace...
            </p>
          </div>
        )}

        {/* Error — friendly page with CTAs, not a redirect */}
        {state === 'error' && (
          <div className="ios-card p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="mt-5 text-[22px] font-bold text-zinc-900 dark:text-white">
              Enlace no disponible
            </h2>
            <p className="mt-2 text-[15px] text-zinc-500 dark:text-zinc-400">{errorMessage}</p>

            <div className="mt-6 space-y-3">
              <Link href="/login">
                <Button variant="primary" className="w-full h-11 gap-2">
                  <LogIn className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" className="w-full h-11 gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Reservar cita
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Ready — registration form */}
        {state === 'ready' && claimInfo && claimToken && (
          <div className="space-y-4">
            {/* Business context header */}
            <div className="ios-card px-6 py-5 text-center">
              <h1 className="text-[22px] font-bold text-zinc-900 dark:text-white">
                Crea tu cuenta
              </h1>
              {claimInfo.businessName && (
                <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
                  en {claimInfo.businessName}
                </p>
              )}
            </div>

            <InlineRegistrationCard
              claimToken={claimToken}
              prefillEmail={claimInfo.email || ''}
              businessName={claimInfo.businessName || ''}
              businessId={claimInfo.businessId}
              onAccountCreated={handleAccountCreated}
            />
          </div>
        )}

        {/* Success — brief confirmation before redirect */}
        {state === 'success' && (
          <div className="ios-card p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-5 text-[22px] font-bold text-zinc-900 dark:text-white">
              ¡Cuenta creada!
            </h2>
            <p className="mt-2 text-[15px] text-zinc-500 dark:text-zinc-400">
              Redirigiendo a tus citas...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ActivarCuentaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#F2F2F7] dark:bg-[#1C1C1E]">
          <div className="ios-card p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
          </div>
        </div>
      }
    >
      <ActivarCuentaContent />
    </Suspense>
  )
}
