import { useState } from 'react'
import { Scissors, ChevronLeft, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { computeDiscountedPrice } from '@/lib/promo-engine'
import type { Service } from '@/types'
import type { SlotDiscount } from '@/types/api'

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
            label="Email (opcional)"
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
            className="w-full rounded-2xl border-0 bg-zinc-100/80 px-4 py-4 text-[17px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:bg-zinc-100 dark:bg-zinc-800/80 dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-white/20 dark:focus:bg-zinc-800 transition-all duration-200 resize-none"
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
