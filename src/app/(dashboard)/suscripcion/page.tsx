'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Check,
  X,
  Sparkles,
  Clock,
  Upload,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  Scissors,
  UserCheck,
  Palette,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Building2,
} from 'lucide-react'
import type {
  SubscriptionStatusResponse,
  SubscriptionPlan,
  PaymentReport,
  ExchangeRateResponse,
  UsdBankAccountValue,
  SupportWhatsAppValue,
  SinpeDetailsValue,
} from '@/types/database'

export default function SuscripcionPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [payments, setPayments] = useState<PaymentReport[]>([])
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateResponse | null>(null)
  const [usdBankAccount, setUsdBankAccount] = useState<UsdBankAccountValue | null>(null)
  const [whatsappConfig, setWhatsappConfig] = useState<SupportWhatsAppValue | null>(null)
  const [sinpeConfig, setSinpeConfig] = useState<SinpeDetailsValue | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [changingPlan, setChangingPlan] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, plansRes, paymentsRes, exchangeRes, bankRes, whatsappRes, sinpeRes] = await Promise.all([
        fetch('/api/subscription/status'),
        fetch('/api/subscription/plans'),
        fetch('/api/subscription/payments'),
        fetch('/api/exchange-rate'),
        fetch('/api/settings?key=usd_bank_account'),
        fetch('/api/settings?key=support_whatsapp'),
        fetch('/api/settings?key=sinpe_details'),
      ])

      if (statusRes.ok) {
        setSubscription(await statusRes.json())
      }
      if (plansRes.ok) {
        setPlans(await plansRes.json())
      }
      if (paymentsRes.ok) {
        setPayments(await paymentsRes.json())
      }
      if (exchangeRes.ok) {
        setExchangeRate(await exchangeRes.json())
      }
      if (bankRes.ok) {
        const data = await bankRes.json()
        if (data.value) {
          setUsdBankAccount(data.value as UsdBankAccountValue)
        }
      }
      if (whatsappRes.ok) {
        const data = await whatsappRes.json()
        if (data.value) {
          setWhatsappConfig(data.value as SupportWhatsAppValue)
        }
      }
      if (sinpeRes.ok) {
        const data = await sinpeRes.json()
        if (data.value) {
          setSinpeConfig(data.value as SinpeDetailsValue)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  const currentPlan = subscription?.plan
  const isTrialing = subscription?.status === 'trial'
  const isExpired = subscription?.status === 'expired'
  const isActive = subscription?.status === 'active'

  // Check if subscription is about to expire (within 7 days) or in grace period
  const isExpiringSoon = isActive && subscription?.days_remaining !== null && subscription.days_remaining <= 7
  const isInGracePeriod = isActive && subscription?.days_remaining !== null && subscription.days_remaining < 0

  // Handle plan change (downgrade)
  const handleChangePlan = async (newPlan: SubscriptionPlan) => {
    if (!currentPlan) return

    const isDowngrade = newPlan.price_usd < currentPlan.price_usd

    if (isDowngrade) {
      setChangingPlan(true)
      try {
        const res = await fetch('/api/subscription/change-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan_id: newPlan.id }),
        })

        if (res.ok) {
          fetchData()
          setShowChangePlanModal(false)
        }
      } catch (error) {
        console.error('Error changing plan:', error)
      } finally {
        setChangingPlan(false)
      }
    } else {
      // Upgrade requires payment
      setSelectedPlan(newPlan)
      setShowPaymentForm(true)
      setShowChangePlanModal(false)
    }
  }

  // Get the other plan (for switching)
  const otherPlan = plans.find(p => p.name !== currentPlan?.name)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Suscripción
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Gestiona tu plan y métodos de pago
        </p>
      </div>

      {/* Urgent Action Banner */}
      {(isExpired || isExpiringSoon || isInGracePeriod) && subscription && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 ${
            isExpired
              ? 'bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900'
              : isInGracePeriod
                ? 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
                : 'bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-5 w-5 mt-0.5 ${
                isExpired ? 'text-red-500' : 'text-amber-500'
              }`} />
              <div>
                <p className={`font-semibold ${
                  isExpired ? 'text-red-900 dark:text-red-100' : 'text-amber-900 dark:text-amber-100'
                }`}>
                  {isExpired
                    ? 'Tu suscripción ha expirado'
                    : isInGracePeriod
                      ? 'Tu suscripción está vencida'
                      : `Tu suscripción vence en ${subscription.days_remaining} días`}
                </p>
                <p className={`text-sm ${
                  isExpired ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'
                }`}>
                  {isExpired
                    ? 'Estás en el plan Básico con funciones limitadas'
                    : isInGracePeriod
                      ? 'Tienes 3 días de gracia antes de bajar al plan Básico'
                      : 'Renueva ahora para no perder tus funciones Pro'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Pre-select current plan or Pro for renewal
                const renewPlan = plans.find(p => p.name === 'pro') || currentPlan
                if (renewPlan) {
                  setSelectedPlan(renewPlan)
                  setShowPaymentForm(true)
                }
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                isExpired
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              {isExpired ? 'Reactivar Ahora' : 'Renovar Ahora'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Current Plan Status */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Plan {currentPlan?.display_name}
                </h2>
                <StatusBadge status={subscription.status} />
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {isTrialing && subscription.days_remaining !== null && (
                  <>Te quedan {subscription.days_remaining} días de prueba</>
                )}
                {isActive && subscription.current_period_end && (
                  <>
                    Próxima renovación:{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString(
                      'es-CR'
                    )}
                  </>
                )}
                {isExpired && <>Tu prueba ha terminado</>}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                ${currentPlan?.price_usd}
              </div>
              <div className="text-sm text-zinc-500">/ mes</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap gap-3">
            {/* Reportar Pago - always visible */}
            <button
              onClick={() => {
                setSelectedPlan(currentPlan || plans.find(p => p.name === 'pro') || null)
                setShowPaymentForm(true)
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <CreditCard className="h-4 w-4" />
              Reportar Pago
            </button>

            {/* Cambiar Plan button */}
            {otherPlan && (
              <button
                onClick={() => {
                  setSelectedPlan(otherPlan)
                  if (otherPlan.price_usd > (currentPlan?.price_usd || 0)) {
                    // Upgrade - go to payment
                    setShowPaymentForm(true)
                  } else {
                    // Downgrade - show confirmation
                    setShowChangePlanModal(true)
                  }
                }}
                className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {otherPlan.price_usd > (currentPlan?.price_usd || 0) ? (
                  <ArrowUpCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownCircle className="h-4 w-4 text-amber-500" />
                )}
                Cambiar a {otherPlan.display_name}
              </button>
            )}
          </div>

          {/* Usage Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <UsageCard
              icon={Users}
              label="Barberos"
              current={subscription.usage.barbers.current}
              max={subscription.usage.barbers.max}
            />
            <UsageCard
              icon={Scissors}
              label="Servicios"
              current={subscription.usage.services.current}
              max={subscription.usage.services.max}
            />
            <UsageCard
              icon={UserCheck}
              label="Clientes"
              current={subscription.usage.clients.current}
              max={subscription.usage.clients.max}
            />
            <UsageCard
              icon={Palette}
              label="Branding"
              enabled={subscription.can_use_branding}
            />
          </div>
        </motion.div>
      )}

      {/* Plans Comparison */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          Planes disponibles
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => {
            const isCurrent = currentPlan?.name === plan.name
            const isUpgrade = (currentPlan?.price_usd || 0) < plan.price_usd

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isCurrent}
                isRecommended={plan.name === 'pro' && !isCurrent}
                currentPlanPrice={currentPlan?.price_usd}
                exchangeRate={exchangeRate}
                onSelect={() => {
                  if (isUpgrade) {
                    setSelectedPlan(plan)
                    setShowPaymentForm(true)
                  } else {
                    // For downgrade, show confirmation
                    setSelectedPlan(plan)
                    setShowChangePlanModal(true)
                  }
                }}
                disabled={false}
              />
            )
          })}
        </div>
      </div>

      {/* Payment Form Modal */}
      {showPaymentForm && selectedPlan && (
        <PaymentFormModal
          plan={selectedPlan}
          exchangeRate={exchangeRate}
          usdBankAccount={usdBankAccount}
          whatsappConfig={whatsappConfig}
          sinpeConfig={sinpeConfig}
          onClose={() => {
            setShowPaymentForm(false)
            setSelectedPlan(null)
          }}
          onSuccess={() => {
            setShowPaymentForm(false)
            setSelectedPlan(null)
            fetchData()
          }}
        />
      )}

      {/* Change Plan Modal */}
      {showChangePlanModal && selectedPlan && currentPlan && (
        <ChangePlanModal
          currentPlan={currentPlan}
          newPlan={selectedPlan}
          onClose={() => {
            setShowChangePlanModal(false)
            setSelectedPlan(null)
          }}
          onConfirm={() => handleChangePlan(selectedPlan)}
          onUpgrade={() => {
            setShowPaymentForm(true)
            setShowChangePlanModal(false)
          }}
          isChanging={changingPlan}
        />
      )}

      {/* Payment History */}
      {payments.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            Historial de pagos
          </h2>
          <div className="space-y-3">
            {payments.map((payment) => (
              <PaymentHistoryItem key={payment.id} payment={payment} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    expired:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const labels = {
    trial: 'Prueba',
    active: 'Activo',
    expired: 'Expirado',
    cancelled: 'Cancelado',
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles] || styles.expired}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}

function UsageCard({
  icon: Icon,
  label,
  current,
  max,
  enabled,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  current?: number
  max?: number | null
  enabled?: boolean
}) {
  const isUnlimited = max === null || max === undefined
  const isAtLimit = max != null && current !== undefined && current >= max
  const percentage =
    max != null && current !== undefined
      ? Math.min((current / max) * 100, 100)
      : 0

  // For branding card (enabled prop)
  if (enabled !== undefined) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <Icon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {label}
        </div>
        <div
          className={`mt-1 font-semibold ${enabled ? 'text-green-600 dark:text-green-400' : 'text-zinc-400 dark:text-zinc-500'}`}
        >
          {enabled ? 'Habilitado' : 'No disponible'}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <Icon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {label}
      </div>
      <div
        className={`mt-1 font-semibold ${
          isAtLimit
            ? 'text-red-600 dark:text-red-400'
            : 'text-zinc-900 dark:text-white'
        }`}
      >
        {current}/{isUnlimited ? '∞' : max}
      </div>
      {!isUnlimited && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isAtLimit ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}

function PlanCard({
  plan,
  isCurrentPlan,
  isRecommended,
  onSelect,
  disabled,
  currentPlanPrice,
  exchangeRate,
}: {
  plan: SubscriptionPlan
  isCurrentPlan: boolean
  isRecommended: boolean
  onSelect: () => void
  disabled: boolean
  currentPlanPrice?: number
  exchangeRate?: ExchangeRateResponse | null
}) {
  const priceCRC = exchangeRate ? Math.round(plan.price_usd * exchangeRate.usd_to_crc) : null
  const features = [
    {
      label: `${plan.max_barbers || 'Ilimitados'} barberos`,
      included: true,
    },
    {
      label: `${plan.max_services || 'Ilimitados'} servicios`,
      included: true,
    },
    {
      label: `${plan.max_clients || 'Ilimitados'} clientes`,
      included: true,
    },
    {
      label: 'Personalización de marca',
      included: plan.has_branding,
    },
  ]

  const isUpgrade = currentPlanPrice !== undefined && plan.price_usd > currentPlanPrice
  const isDowngrade = currentPlanPrice !== undefined && plan.price_usd < currentPlanPrice

  const getButtonLabel = () => {
    if (isCurrentPlan) return 'Plan actual'
    if (isUpgrade) return 'Mejorar plan'
    if (isDowngrade) return 'Cambiar a este plan'
    return 'Seleccionar'
  }

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`relative rounded-2xl border p-6 transition-shadow ${
        isRecommended
          ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
      } ${isCurrentPlan ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950' : ''}`}
    >
      {isRecommended && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
            Recomendado
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-white dark:bg-zinc-600">
            Tu plan
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {plan.display_name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-zinc-900 dark:text-white">
            ${plan.price_usd}
          </span>
          <span className="text-zinc-500">/mes</span>
        </div>
        {priceCRC && (
          <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            ≈ ₡{priceCRC.toLocaleString('es-CR')} CRC
          </div>
        )}
      </div>

      <ul className="mb-6 space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            {feature.included ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
            )}
            <span
              className={
                feature.included
                  ? 'text-zinc-700 dark:text-zinc-300'
                  : 'text-zinc-400 dark:text-zinc-500'
              }
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={disabled || isCurrentPlan}
        className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          disabled || isCurrentPlan
            ? 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
            : isUpgrade
              ? 'bg-green-600 text-white hover:bg-green-700'
              : isDowngrade
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : isRecommended
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
        }`}
      >
        {getButtonLabel()}
      </button>
    </motion.div>
  )
}

function PaymentFormModal({
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
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Reportar Pago
          </h2>
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
              {!usdBankAccount?.enabled && (
                <span className="ml-1 text-xs">(Próximamente)</span>
              )}
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
              <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">
                o
              </span>
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

function PaymentHistoryItem({ payment }: { payment: PaymentReport }) {
  const statusStyles = {
    pending:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    approved:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  const statusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  }

  const StatusIcon =
    payment.status === 'approved'
      ? CheckCircle
      : payment.status === 'rejected'
        ? AlertCircle
        : Clock

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <StatusIcon
          className={`h-5 w-5 ${
            payment.status === 'approved'
              ? 'text-green-500'
              : payment.status === 'rejected'
                ? 'text-red-500'
                : 'text-amber-500'
          }`}
        />
        <div>
          <div className="font-medium text-zinc-900 dark:text-white">
            ${payment.amount_usd}
          </div>
          <div className="text-sm text-zinc-500">
            {new Date(payment.created_at).toLocaleDateString('es-CR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[payment.status]}`}
      >
        {statusLabels[payment.status]}
      </span>
    </div>
  )
}

function ChangePlanModal({
  currentPlan,
  newPlan,
  onClose,
  onConfirm,
  onUpgrade,
  isChanging,
}: {
  currentPlan: SubscriptionPlan
  newPlan: SubscriptionPlan
  onClose: () => void
  onConfirm: () => void
  onUpgrade: () => void
  isChanging: boolean
}) {
  const isUpgrade = newPlan.price_usd > currentPlan.price_usd
  const isDowngrade = newPlan.price_usd < currentPlan.price_usd

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-zinc-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {isUpgrade ? 'Mejorar Plan' : 'Cambiar Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan comparison */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-sm text-zinc-500">Actual</div>
            <div className="font-semibold text-zinc-900 dark:text-white">
              {currentPlan.display_name}
            </div>
            <div className="text-lg font-bold text-zinc-600 dark:text-zinc-400">
              ${currentPlan.price_usd}/mes
            </div>
          </div>

          <div className="text-2xl text-zinc-400">→</div>

          <div className="text-center">
            <div className="text-sm text-zinc-500">Nuevo</div>
            <div className={`font-semibold ${isUpgrade ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {newPlan.display_name}
            </div>
            <div className={`text-lg font-bold ${isUpgrade ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              ${newPlan.price_usd}/mes
            </div>
          </div>
        </div>

        {/* Info message */}
        <div className={`mb-6 rounded-lg p-4 ${
          isUpgrade
            ? 'bg-green-50 dark:bg-green-950/30'
            : 'bg-amber-50 dark:bg-amber-950/30'
        }`}>
          {isUpgrade ? (
            <div className="flex items-start gap-3">
              <ArrowUpCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Upgrade a {newPlan.display_name}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Obtendrás barberos, servicios y clientes ilimitados, más personalización de marca.
                  El cambio se aplicará después de confirmar tu pago.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <ArrowDownCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Downgrade a {newPlan.display_name}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Tendrás límites de {newPlan.max_barbers} barberos, {newPlan.max_services} servicios y {newPlan.max_clients} clientes.
                  El cambio se aplicará inmediatamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={isUpgrade ? onUpgrade : onConfirm}
            disabled={isChanging}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              isUpgrade
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isChanging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isUpgrade ? (
              <>
                <CreditCard className="h-4 w-4" />
                Continuar con pago
              </>
            ) : (
              'Confirmar cambio'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
