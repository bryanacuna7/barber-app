import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Sparkles, Upload, MessageCircle, AlertCircle, CreditCard, Loader2 } from 'lucide-react'
import type {
  SubscriptionPlan,
  ExchangeRateResponse,
  UsdBankAccountValue,
  SupportWhatsAppValue,
  SinpeDetailsValue,
} from '@/types/database'

export function PaymentFormModal({
  plan,
  exchangeRate,
  usdBankAccount,
  whatsappConfig,
  sinpeConfig,
  onClose,
  onSuccess,
}: {
  plan: SubscriptionPlan
  exchangeRate?: ExchangeRateResponse | null
  usdBankAccount?: UsdBankAccountValue | null
  whatsappConfig?: SupportWhatsAppValue | null
  sinpeConfig?: SinpeDetailsValue | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'sinpe' | 'usd'>('sinpe')

  const priceCRC = exchangeRate ? Math.round(plan.price_usd * exchangeRate.usd_to_crc) : null

  // Use configured WhatsApp number or fallback to default
  const whatsappNumber = whatsappConfig?.number || '50688888888'
  const whatsappMessage = encodeURIComponent(
    `Hola! Quiero reportar mi pago para el plan ${plan.display_name} ($${plan.price_usd}/mes${priceCRC ? ` / ₡${priceCRC.toLocaleString('es-CR')}` : ''}). Adjunto mi comprobante de ${paymentMethod === 'sinpe' ? 'SINPE Móvil' : 'transferencia en dólares'}.`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  // SINPE details from config or defaults
  const sinpePhone = sinpeConfig?.phone_number || '8888-8888'
  const sinpeName = sinpeConfig?.account_name || 'BarberShop Pro'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('plan_id', plan.id)
      formData.append('amount', plan.price_usd.toString())
      if (file) {
        formData.append('proof', file)
      }
      if (notes) {
        formData.append('notes', notes)
      }

      const res = await fetch('/api/subscription/report-payment', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al reportar pago')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-zinc-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Reportar Pago</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <div>
              <div className="font-semibold text-zinc-900 dark:text-white">
                Plan {plan.display_name}
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${plan.price_usd}/mes
              </div>
              {priceCRC && (
                <div className="text-sm text-blue-500 dark:text-blue-400">
                  ≈ ₡{priceCRC.toLocaleString('es-CR')} CRC
                  <span className="ml-1 text-xs text-zinc-500">
                    (TC: ₡{exchangeRate?.usd_to_crc})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Método de pago
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('sinpe')}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                paymentMethod === 'sinpe'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
              }`}
            >
              SINPE Móvil (CRC)
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('usd')}
              disabled={!usdBankAccount?.enabled}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                paymentMethod === 'usd'
                  ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                  : !usdBankAccount?.enabled
                    ? 'cursor-not-allowed border-zinc-200 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
              }`}
            >
              Depósito USD
              {!usdBankAccount?.enabled && <span className="ml-1 text-xs">(Próximamente)</span>}
            </button>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
          {paymentMethod === 'sinpe' ? (
            <>
              <h3 className="mb-2 font-medium text-zinc-900 dark:text-white">
                Datos para SINPE Móvil
              </h3>
              <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  <span className="font-medium">Número:</span> {sinpePhone}
                </p>
                <p>
                  <span className="font-medium">Nombre:</span> {sinpeName}
                </p>
                <p>
                  <span className="font-medium">Monto:</span>{' '}
                  {priceCRC ? (
                    <>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        ₡{priceCRC.toLocaleString('es-CR')}
                      </span>
                      <span className="ml-1 text-zinc-500">(${plan.price_usd} USD)</span>
                    </>
                  ) : (
                    `$${plan.price_usd} USD`
                  )}
                </p>
              </div>
              {exchangeRate && (
                <p className="mt-2 text-xs text-zinc-500">
                  Tipo de cambio: ₡{exchangeRate.usd_to_crc} por dólar
                  <br />
                  Actualizado: {exchangeRate.last_updated}
                </p>
              )}
            </>
          ) : usdBankAccount?.enabled ? (
            <>
              <h3 className="mb-2 font-medium text-zinc-900 dark:text-white">
                Datos para Depósito en Dólares
              </h3>
              <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <p>
                  <span className="font-medium">Banco:</span> {usdBankAccount.bank_name}
                </p>
                <p>
                  <span className="font-medium">Titular:</span> {usdBankAccount.account_holder}
                </p>
                <p>
                  <span className="font-medium">Cuenta:</span>{' '}
                  <span className="font-mono">{usdBankAccount.account_number}</span>
                </p>
                <p>
                  <span className="font-medium">Monto:</span>{' '}
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    ${plan.price_usd} USD
                  </span>
                </p>
              </div>
              {usdBankAccount.notes && (
                <p className="mt-2 text-xs text-zinc-500">{usdBankAccount.notes}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500">
              La opción de depósito en dólares estará disponible próximamente.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Comprobante de pago
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-blue-500 dark:hover:bg-zinc-700">
              <Upload className="mb-2 h-8 w-8 text-zinc-400" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {file ? file.name : 'Subir imagen del comprobante'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional..."
              rows={2}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {submitting ? 'Enviando...' : 'Reportar Pago'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">o</span>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-500 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
          </a>
        </form>
      </motion.div>
    </div>
  )
}
