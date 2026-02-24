'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Clock, Sparkles, AlertTriangle, CreditCard, ChevronRight } from 'lucide-react'
import { getStaleCache, setCache, CACHE_TTL } from '@/lib/cache'
import type { SubscriptionStatusResponse } from '@/types/database'

const CACHE_KEY = 'sub_status'

interface TrialBannerProps {
  variant?: 'full' | 'compact'
}

export function TrialBanner({ variant = 'full' }: TrialBannerProps) {
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Stale-while-revalidate: show cached data instantly, refresh in background
    const cached = getStaleCache<SubscriptionStatusResponse>(CACHE_KEY)
    if (cached) {
      setSubscription(cached.data)
      setLoading(false)
      if (!cached.isStale) return // fresh cache — skip network
    }
    fetchSubscription()
  }, [])

  async function fetchSubscription() {
    try {
      const res = await fetch('/api/subscription/status')
      if (res.ok) {
        const data = await res.json()
        setSubscription(data)
        setCache(CACHE_KEY, data, CACHE_TTL.SHORT)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || dismissed) return null
  if (!subscription) return null

  // Don't show banner for active subscriptions with Pro plan (unless expiring soon)
  const isActiveProNotExpiring =
    subscription.status === 'active' &&
    subscription.plan.name === 'pro' &&
    (subscription.days_remaining === null || subscription.days_remaining > 7)

  if (isActiveProNotExpiring) {
    return null
  }

  // Determine urgency
  const isExpired = subscription.status === 'expired'
  const isTrialExpiringSoon =
    subscription.status === 'trial' &&
    subscription.days_remaining !== null &&
    subscription.days_remaining <= 3
  const isActiveExpiringSoon =
    subscription.status === 'active' &&
    subscription.days_remaining !== null &&
    subscription.days_remaining <= 7
  const isUrgent = isExpired || isTrialExpiringSoon || isActiveExpiringSoon

  // For non-urgent basic plan, show compact version
  const isBasicNonUrgent =
    !isUrgent &&
    (subscription.plan.name === 'basic' ||
      (subscription.status === 'trial' &&
        subscription.days_remaining &&
        subscription.days_remaining > 3))

  // Compact mode for non-urgent states
  if (variant === 'compact' || (isBasicNonUrgent && !isUrgent)) {
    return (
      <Link
        href="/suscripcion"
        className="mb-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-200/60 bg-white/70 px-3.5 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:bg-zinc-50/90 dark:border-zinc-800/80 dark:bg-black/25 dark:hover:bg-black/35"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100/80 dark:bg-white/10">
            <Sparkles className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              {subscription.status === 'trial'
                ? `Trial Pro: ${subscription.days_remaining} días restantes`
                : `Plan ${subscription.plan.display_name}`}
            </span>
            <span className="ml-2 text-xs text-muted">
              {subscription.plan.name === 'basic' ? 'Actualiza a Pro' : 'Ver detalles'}
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
      </Link>
    )
  }

  // Urgent: Expired or about to expire
  if (isUrgent) {
    const urgencyColor = isExpired ? 'red' : 'amber'

    return (
      <div
        className={`relative mb-3 mt-1 rounded-2xl p-3 ${
          urgencyColor === 'red'
            ? 'bg-red-50 dark:bg-red-950/50'
            : 'bg-amber-50 dark:bg-amber-950/50'
        }`}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-2 p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-start gap-2.5 pr-7">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              urgencyColor === 'red'
                ? 'bg-red-100 dark:bg-red-900/50'
                : 'bg-amber-100 dark:bg-amber-900/50'
            }`}
          >
            <AlertTriangle
              className={`h-4 w-4 ${
                urgencyColor === 'red'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-[15px] font-semibold ${
                urgencyColor === 'red'
                  ? 'text-red-900 dark:text-red-100'
                  : 'text-amber-900 dark:text-amber-100'
              }`}
            >
              {isExpired
                ? 'Suscripción expirada'
                : isTrialExpiringSoon
                  ? `Prueba termina en ${subscription.days_remaining} ${subscription.days_remaining === 1 ? 'día' : 'días'}`
                  : `Vence en ${subscription.days_remaining} días`}
            </h3>
            <p
              className={`mt-0.5 text-[13px] ${
                urgencyColor === 'red'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-amber-700 dark:text-amber-300'
              }`}
            >
              {isExpired
                ? 'Reporta tu pago para reactivar.'
                : 'Reporta tu pago ahora para mantener el acceso.'}
            </p>

            <div className="mt-2">
              <Link
                href="/suscripcion"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  urgencyColor === 'red'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Reportar Pago
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Trial banner (non-urgent)
  if (subscription.status === 'trial') {
    const daysLeft = subscription.days_remaining || 0

    return (
      <div className="relative mb-3 mt-1 rounded-2xl border border-blue-200/80 bg-blue-50/95 p-4 shadow-sm dark:border-blue-800/70 dark:bg-blue-950/50">
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Estás en período de prueba Pro
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Te quedan {daysLeft} días para disfrutar de todas las funciones Pro.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/suscripcion"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Clock className="h-4 w-4" />
                Ver planes
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Basic plan banner (non-urgent)
  if (subscription.plan.name === 'basic') {
    return (
      <div className="relative mb-3 mt-1 rounded-2xl border border-zinc-200/70 bg-zinc-50/95 p-4 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/75">
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800">
            <Sparkles className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Estás en el plan Básico</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Actualiza a Pro para desbloquear miembros del equipo y servicios ilimitados, personalización de
              marca y más.
            </p>

            <div className="mt-3">
              <Link
                href="/suscripcion"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                <Sparkles className="h-4 w-4" />
                Actualizar a Pro
              </Link>
            </div>
          </div>
        </div>

        {/* Usage limits */}
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <UsageItem
            label="Equipo"
            current={subscription.usage.barbers.current}
            max={subscription.usage.barbers.max}
          />
          <UsageItem
            label="Servicios"
            current={subscription.usage.services.current}
            max={subscription.usage.services.max}
          />
          <UsageItem
            label="Clientes"
            current={subscription.usage.clients.current}
            max={subscription.usage.clients.max}
          />
        </div>
      </div>
    )
  }

  return null
}

function UsageItem({
  label,
  current,
  max,
}: {
  label: string
  current: number
  max: number | null
}) {
  const isAtLimit = max !== null && current >= max
  const percentage = max !== null ? Math.min((current / max) * 100, 100) : 0

  return (
    <div className="text-center">
      <div className="text-xs text-muted">{label}</div>
      <div
        className={`text-sm font-semibold ${
          isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'
        }`}
      >
        {current}/{max || '∞'}
      </div>
      {max !== null && (
        <div className="mt-1 h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className={`h-1 rounded-full transition-all ${
              isAtLimit ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}
