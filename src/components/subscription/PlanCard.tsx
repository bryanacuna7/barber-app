import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { SubscriptionPlan, ExchangeRateResponse } from '@/types/database'

export function PlanCard({
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
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{plan.display_name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-zinc-900 dark:text-white">
            ${plan.price_usd}
          </span>
          <span className="text-zinc-500">/mes</span>
        </div>
        {priceCRC && (
          <div className="mt-1 text-sm text-muted">≈ ₡{priceCRC.toLocaleString('es-CR')} CRC</div>
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
