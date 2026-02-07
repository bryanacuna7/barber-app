'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, MessageCircle, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Service, Business } from '@/types'
import { ClientAccountModal } from '@/components/loyalty/client-account-modal'
import { createClient } from '@/lib/supabase/client'

interface BookingSuccessProps {
  service: Service | null
  date: Date | null
  time: string | null
  business: Business | null
  clientId: string | null
  clientEmail: string
}

export function BookingSuccess({
  service,
  date,
  time,
  business,
  clientId,
  clientEmail,
}: BookingSuccessProps) {
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false)
  const [hasLoyaltyProgram, setHasLoyaltyProgram] = useState(false)

  // Check if business has active loyalty program
  useEffect(() => {
    async function checkLoyaltyProgram() {
      if (!business?.id || !clientId) return

      try {
        const supabase = createClient()

        // Check if there's a loyalty program for this business
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('loyalty_programs')
          .select('id')
          .eq('business_id', business.id)
          .eq('enabled', true)
          .single()

        if (!error && data) {
          setHasLoyaltyProgram(true)
        }
      } catch (error) {
        console.error('Error checking loyalty program:', error)
      }
    }

    checkLoyaltyProgram()
  }, [business?.id, clientId])
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#F2F2F7] dark:bg-[#1C1C1E]">
      <div
        data-testid="booking-success"
        className="w-full max-w-md ios-card overflow-hidden ios-spring-in"
      >
        {/* Success animation - iOS style */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center text-white">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h2 data-testid="confirmation-message" className="mt-5 text-[28px] font-bold">
            ¡Cita Reservada!
          </h2>
          <p className="mt-1 text-[15px] text-emerald-100">Te esperamos</p>
        </div>
        <div data-testid="booking-summary" className="p-6 space-y-4">
          <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Servicio
            </p>
            <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">
              {service?.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Fecha
              </p>
              <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">
                {date && format(date, "d 'de' MMM", { locale: es })}
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Hora
              </p>
              <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">{time}</p>
            </div>
          </div>
          {business?.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-5 py-4 text-[17px] font-semibold text-white ios-press"
            >
              <MessageCircle className="h-5 w-5" />
              Enviar mensaje por WhatsApp
            </a>
          )}

          {/* Share button for viral growth */}
          <button
            onClick={() => {
              const url =
                typeof window !== 'undefined'
                  ? window.location.origin + `/reservar/${business?.slug}`
                  : ''
              const text = `¡Acabo de reservar en ${business?.name}! Reserva tu cita también 💈`

              if (navigator.share) {
                navigator
                  .share({ title: business?.name || 'Reserva tu cita', text, url })
                  .catch(() => {
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(`${text}\n👉 ${url}`)}`,
                      '_blank'
                    )
                  })
              } else {
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(`${text}\n👉 ${url}`)}`,
                  '_blank'
                )
              }
            }}
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-200/80 px-5 py-4 text-[17px] font-semibold text-zinc-700 ios-press dark:bg-zinc-700 dark:text-zinc-200"
          >
            <Share2 className="h-5 w-5" />
            Recomendar a un amigo
          </button>

          {/* Manual loyalty CTA (prevents success screen interruption) */}
          {hasLoyaltyProgram && (
            <button
              onClick={() => setShowLoyaltyModal(true)}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-4 text-[16px] font-semibold text-violet-600 ios-press dark:text-violet-300"
            >
              Activar beneficios de lealtad
            </button>
          )}

          <p className="text-center text-[13px] text-muted">
            Te enviaremos un recordatorio antes de tu cita.
          </p>
        </div>
      </div>

      {/* Loyalty Account Modal */}
      {hasLoyaltyProgram && clientId && business && (
        <ClientAccountModal
          isOpen={showLoyaltyModal}
          onClose={() => setShowLoyaltyModal(false)}
          businessName={business.name}
          businessId={business.id}
          clientId={clientId}
          prefillEmail={clientEmail}
        />
      )}
    </div>
  )
}
