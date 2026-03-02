import { useState } from 'react'
import { Scissors, ChevronLeft, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { computeDiscountedPrice } from '@/lib/promo-engine'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types'
import type { SlotDiscount } from '@/types/api'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="#EA4335"
      />
    </svg>
  )
}

interface ClientInfoFormProps {
  service: Service
  date: Date
  time: string
  clientName: string
  clientPhone: string
  clientEmail: string
  notes: string
  submitting: boolean
  error: string
  discount?: SlotDiscount | null
  slug?: string
  isAuthenticated?: boolean
  bookingState?: Record<string, unknown>
  onChangeName: (value: string) => void
  onChangePhone: (value: string) => void
  onChangeEmail: (value: string) => void
  onChangeNotes: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

function validateFields(name: string, phone: string, email: string) {
  const errors: { name?: string; phone?: string; email?: string } = {}
  if (!name.trim() || name.trim().length < 2) {
    errors.name = 'Ingresa tu nombre completo'
  }
  if (!phone.trim()) {
    errors.phone = 'El teléfono es requerido'
  } else if (!/^\d{8}$/.test(phone.replace(/\D/g, ''))) {
    errors.phone = 'El teléfono debe tener 8 dígitos'
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Ingresa un email válido'
  }
  return errors
}

export function ClientInfoForm({
  service,
  date,
  time,
  clientName,
  clientPhone,
  clientEmail,
  notes,
  submitting,
  error,
  discount,
  slug,
  isAuthenticated,
  bookingState,
  onChangeName,
  onChangePhone,
  onChangeEmail,
  onChangeNotes,
  onSubmit,
  onBack,
}: ClientInfoFormProps) {
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    phone?: string
    email?: string
  }>({})
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)

    // Save booking state to sessionStorage so it can be restored after auth
    if (bookingState && slug) {
      sessionStorage.setItem(`booking_${slug}`, JSON.stringify(bookingState))
    }

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/reservar/${slug}`)}`

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    if (oauthError) {
      setIsGoogleLoading(false)
    }
  }

  const originalPrice = Number(service.price)
  const displayPrice = discount ? computeDiscountedPrice(originalPrice, discount) : originalPrice

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateFields(clientName, clientPhone, clientEmail)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    onSubmit(e)
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
      <button
        data-testid="back-button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[15px] font-medium text-blue-500 ios-press"
      >
        <ChevronLeft className="h-5 w-5 -ml-1" />
        Horario
      </button>

      {/* Booking Summary - iOS Card */}
      <div data-testid="booking-summary" className="ios-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 text-violet-600 dark:from-violet-900/40 dark:to-violet-800/40 dark:text-violet-400">
            <Scissors className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-semibold text-zinc-900 dark:text-white truncate">
              {service.name}
            </p>
            <p className="text-[15px] text-muted">
              {format(date, "EEEE d 'de' MMMM", { locale: es })} · {time}
            </p>
            {discount && (
              <div className="mt-1 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
                  {discount.label}
                  {' · '}
                  <span className="line-through text-zinc-400">
                    {formatCurrency(originalPrice)}
                  </span>{' '}
                  {formatCurrency(displayPrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form data-testid="client-info-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="px-1">
          <h3 className="text-[20px] font-bold text-zinc-900 dark:text-white">Tus datos</h3>
          <p className="mt-1 text-[15px] text-muted">Para enviarte confirmación y recordatorios</p>
        </div>

        {!isAuthenticated && slug && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-[15px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
            >
              {isGoogleLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              Continuar con Google
            </button>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              <span className="text-[13px] font-medium text-zinc-400 dark:text-zinc-500">
                o llena manualmente
              </span>
              <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            </div>
          </>
        )}

        {error && (
          <div
            data-testid="booking-error"
            className="rounded-2xl bg-red-50 p-4 text-[15px] font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div>
          <Input
            name="name"
            label="Nombre completo"
            type="text"
            placeholder="Tu nombre"
            value={clientName}
            onChange={(e) => {
              onChangeName(e.target.value)
              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
            }}
          />
          {fieldErrors.name && (
            <p className="mt-1.5 text-[13px] font-medium text-red-500">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <Input
            name="phone"
            label="Teléfono"
            type="tel"
            placeholder="8 dígitos (ej: 87175866)"
            value={clientPhone}
            onChange={(e) => {
              onChangePhone(e.target.value)
              if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }))
            }}
          />
          {fieldErrors.phone && (
            <p className="mt-1.5 text-[13px] font-medium text-red-500">{fieldErrors.phone}</p>
          )}
        </div>

        <div>
          <Input
            name="email"
            label="Correo (opcional)"
            type="email"
            placeholder="tu@email.com"
            value={clientEmail}
            onChange={(e) => {
              onChangeEmail(e.target.value)
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
            }}
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-[13px] font-medium text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-semibold uppercase tracking-wide text-muted">
            Notas (opcional)
          </label>
          <textarea
            name="notes"
            placeholder="Alguna petición especial o preferencia..."
            value={notes}
            onChange={(e) => onChangeNotes(e.target.value)}
            className="w-full rounded-2xl border-0 bg-zinc-100/80 px-4 py-4 text-[17px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:bg-zinc-100 dark:bg-zinc-800/80 dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-white/20 dark:focus:bg-zinc-800 transition-[background-color,box-shadow] duration-200 resize-none"
            rows={3}
          />
        </div>

        {/* Submit Button with Safe Area */}
        <div className="pt-4 ios-safe-bottom">
          <Button
            data-testid="submit-booking"
            type="submit"
            className="w-full"
            size="lg"
            isLoading={submitting}
          >
            Confirmar Reservación · {formatCurrency(displayPrice)}
          </Button>
        </div>
      </form>
    </div>
  )
}
