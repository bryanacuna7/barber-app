'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  AlertCircle,
  Loader2,
  Users,
  Scissors,
  UserCheck,
  Palette,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
} from 'lucide-react'
import type { SubscriptionPlan } from '@/types/database'
import { useSubscriptionData } from '@/hooks/useSubscriptionData'
import { StatusBadge } from '@/components/subscription/StatusBadge'
import { UsageCard } from '@/components/subscription/UsageCard'
import { PlanCard } from '@/components/subscription/PlanCard'
import { PaymentFormModal } from '@/components/subscription/PaymentFormModal'
import { PaymentHistoryItem } from '@/components/subscription/PaymentHistoryItem'
import { ChangePlanModal } from '@/components/subscription/ChangePlanModal'

export default function SuscripcionPage() {
  const {
    subscription,
    plans,
    payments,
    exchangeRate,
    usdBankAccount,
    whatsappConfig,
    sinpeConfig,
    loading,
    refetch,
  } = useSubscriptionData()

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [changingPlan, setChangingPlan] = useState(false)

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
  const isExpiringSoon =
    isActive && subscription?.days_remaining !== null && subscription.days_remaining <= 7
  const isInGracePeriod =
    isActive && subscription?.days_remaining !== null && subscription.days_remaining < 0

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
          refetch()
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
  const otherPlan = plans.find((p) => p.name !== currentPlan?.name)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Suscripción</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">Gestiona tu plan y métodos de pago</p>
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
              <AlertCircle
                className={`h-5 w-5 mt-0.5 ${isExpired ? 'text-red-500' : 'text-amber-500'}`}
              />
              <div>
                <p
                  className={`font-semibold ${
                    isExpired
                      ? 'text-red-900 dark:text-red-100'
                      : 'text-amber-900 dark:text-amber-100'
                  }`}
                >
                  {isExpired
                    ? 'Tu suscripción ha expirado'
                    : isInGracePeriod
                      ? 'Tu suscripción está vencida'
                      : `Tu suscripción vence en ${subscription.days_remaining} días`}
                </p>
                <p
                  className={`text-sm ${
                    isExpired
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-amber-700 dark:text-amber-300'
                  }`}
                >
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
                const renewPlan = plans.find((p) => p.name === 'pro') || currentPlan
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
                    {new Date(subscription.current_period_end).toLocaleDateString('es-CR')}
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
                setSelectedPlan(currentPlan || plans.find((p) => p.name === 'pro') || null)
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
            <UsageCard icon={Palette} label="Branding" enabled={subscription.can_use_branding} />
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
            refetch()
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
