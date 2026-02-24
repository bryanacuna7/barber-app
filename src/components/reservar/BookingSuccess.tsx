'use client'

import { useState, useEffect } from 'react'
import { CalendarPlus, CheckCircle, MessageCircle, Share2, Smartphone } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AnimatePresence } from 'framer-motion'
import type { Service, Business, AdvancePaymentInfo } from '@/types'
import type { BookingPricing } from '@/types/api'
import { Button } from '@/components/ui/button'
import { ClientAccountModal } from '@/components/loyalty/client-account-modal'
import { AdvancePaymentSubmit } from '@/components/reservar/advance-payment-submit'
import { PushNudgeBanner } from '@/components/client/push-nudge-banner'
import { createClient } from '@/lib/supabase/client'

interface BookingSuccessProps {
  service: Service | null
  date: Date | null
  time: string | null
  business: Business | null
  clientId: string | null
  claimToken: string | null
  clientEmail: string
  trackingToken: string | null
  barberName?: string | null
  pricing?: BookingPricing | null
}

export function BookingSuccess({
  service,
  date,
  time,
  business,
  clientId,
  claimToken,
  clientEmail,
  trackingToken,
  barberName,
  pricing,
}: BookingSuccessProps) {
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false)
  const [hasLoyaltyProgram, setHasLoyaltyProgram] = useState(false)
  const [advancePaymentInfo, setAdvancePaymentInfo] = useState<AdvancePaymentInfo | null>(null)
  const [showAdvancePayment, setShowAdvancePayment] = useState(false)
  const [advancePaymentSubmitted, setAdvancePaymentSubmitted] = useState(false)

  // Haptic feedback on success — Apple-style celebration tap
  useEffect(() => {
    if ('vibrate' in navigator) {
      // Double-tap pattern: short-pause-short (like iOS success)
      navigator.vibrate([10, 50, 10])
    }
  }, [])

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

  useEffect(() => {
    async function checkAdvancePayment() {
      if (!business?.slug || !service?.price) return
      try {
        const res = await fetch(
          `/api/public/advance-payment/${business.slug}?price=${service.price}`
        )
        if (res.ok) {
          const data = await res.json()
          if (data.enabled) setAdvancePaymentInfo(data)
        }
      } catch {}
    }
    checkAdvancePayment()
  }, [business?.slug, service?.price])

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
            {pricing && (
              <p className="mt-1 text-[15px] text-zinc-600 dark:text-zinc-400">
                {pricing.discount_applied ? (
                  <>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ₡{pricing.final_price.toLocaleString()}
                    </span>
                    <span className="ml-2 line-through text-zinc-400">
                      ₡{pricing.original_price.toLocaleString()}
                    </span>
                    {pricing.discount_label && (
                      <span className="ml-2 text-[12px] text-emerald-600 dark:text-emerald-400">
                        {pricing.discount_label}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="font-semibold">₡{pricing.final_price.toLocaleString()}</span>
                )}
              </p>
            )}
          </div>
          {barberName && (
            <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Profesional
              </p>
              <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">
                {barberName}
              </p>
            </div>
          )}
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
          {/* Push notification nudge — best moment to ask */}
          <PushNudgeBanner variant="booking" />

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

          {/* Advance Payment CTA */}
          <AnimatePresence>
            {advancePaymentInfo && !advancePaymentSubmitted && !showAdvancePayment && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                <p className="text-[15px] font-semibold text-blue-900 dark:text-blue-100">
                  Paga antes y ahorra {advancePaymentInfo.discount}%
                </p>
                <p className="mt-1 text-[13px] text-blue-700 dark:text-blue-300">
                  Precio con descuento: ₡{advancePaymentInfo.final_price.toLocaleString()}
                  <span className="ml-2 line-through text-blue-400">
                    ₡{advancePaymentInfo.service_price.toLocaleString()}
                  </span>
                </p>
                <Button
                  onClick={() => setShowAdvancePayment(true)}
                  className="mt-3 w-full h-11"
                  variant="secondary"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Pagar por adelantado
                </Button>
              </div>
            )}
          </AnimatePresence>

          {/* Advance Payment Submit Flow */}
          {showAdvancePayment && advancePaymentInfo && trackingToken && (
            <AdvancePaymentSubmit
              advancePaymentInfo={advancePaymentInfo}
              trackingToken={trackingToken}
              businessWhatsapp={business?.whatsapp || null}
              clientName=""
              appointmentDate={date ? format(date, "d 'de' MMMM", { locale: es }) : ''}
              appointmentTime={time || ''}
              onSuccess={() => {
                setAdvancePaymentSubmitted(true)
                setShowAdvancePayment(false)
              }}
              onCancel={() => setShowAdvancePayment(false)}
            />
          )}

          {/* Success state */}
          {advancePaymentSubmitted && (
            <div className="rounded-2xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
              <p className="text-[15px] font-semibold text-emerald-700 dark:text-emerald-300">
                Comprobante enviado
              </p>
              <p className="mt-1 text-[13px] text-muted">
                Pendiente de verificación por el negocio
              </p>
            </div>
          )}

          {/* Manual loyalty CTA (prevents success screen interruption) */}
          {hasLoyaltyProgram && (
            <button
              onClick={() => setShowLoyaltyModal(true)}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-4 text-[16px] font-semibold text-violet-600 ios-press dark:text-violet-300"
            >
              Activar beneficios de lealtad
            </button>
          )}

          {/* Post-booking navigation */}
          {date && time && service && (
            <button
              onClick={() => {
                const start = new Date(date)
                const [h, m] = time.split(':').map(Number)
                start.setHours(h, m, 0)
                const end = new Date(start.getTime() + (service.duration_minutes || 30) * 60000)
                const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.name + ' - ' + (business?.name || ''))}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent('Reserva en ' + (business?.name || ''))}`
                window.open(url, '_blank')
              }}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-zinc-200/80 px-5 py-4 text-[17px] font-semibold text-zinc-700 ios-press dark:bg-zinc-700 dark:text-zinc-200"
            >
              <CalendarPlus className="h-5 w-5" />
              Agregar al Calendario
            </button>
          )}

          <a
            href={`/reservar/${business?.slug}`}
            className="flex items-center justify-center rounded-2xl px-5 py-4 text-[15px] font-medium text-muted ios-press"
          >
            Volver a reservar
          </a>

          <p className="text-center text-[13px] text-muted">
            Recibirás un recordatorio antes de tu cita
          </p>
        </div>
      </div>

      {/* Loyalty Account Modal */}
      {hasLoyaltyProgram && claimToken && business && (
        <ClientAccountModal
          isOpen={showLoyaltyModal}
          onClose={() => setShowLoyaltyModal(false)}
          businessName={business.name}
          businessId={business.id}
          claimToken={claimToken}
          prefillEmail={clientEmail}
        />
      )}
    </div>
  )
}
