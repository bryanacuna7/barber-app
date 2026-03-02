import { useState, useEffect, useCallback } from 'react'
import { getStaleCache, setCache, CACHE_TTL } from '@/lib/cache'
import type {
  SubscriptionStatusResponse,
  SubscriptionPlan,
  PaymentReport,
  ExchangeRateResponse,
  UsdBankAccountValue,
  SupportWhatsAppValue,
  SinpeDetailsValue,
} from '@/types/database'

const STATUS_REFRESH_INTERVAL_MS = 5 * 60 * 1000
const DAYS_RECALC_INTERVAL_MS = 60 * 1000

function calculateDaysRemaining(endDate: string | null): number | null {
  if (!endDate) return null

  const end = new Date(endDate)
  if (Number.isNaN(end.getTime())) return null

  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}

function withLiveDaysRemaining(
  subscription: SubscriptionStatusResponse
): SubscriptionStatusResponse {
  let daysRemaining = subscription.days_remaining

  if (subscription.status === 'trial') {
    daysRemaining = calculateDaysRemaining(subscription.trial_ends_at)
  } else if (subscription.status === 'active') {
    daysRemaining = calculateDaysRemaining(subscription.current_period_end)
  }

  if (
    daysRemaining === subscription.days_remaining &&
    (subscription.status !== 'trial' || subscription.trial_days_left === daysRemaining)
  ) {
    return subscription
  }

  return {
    ...subscription,
    days_remaining: daysRemaining,
    trial_days_left: subscription.status === 'trial' ? daysRemaining : subscription.trial_days_left,
  }
}

// Cache keys for each data source
const CK = {
  status: 'sub_status',
  plans: 'sub_plans',
  payments: 'sub_payments',
  exchange: 'exchange_rate',
  bank: 'setting_bank',
  whatsapp: 'setting_whatsapp',
  sinpe: 'setting_sinpe',
} as const

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export function useSubscriptionData() {
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [payments, setPayments] = useState<PaymentReport[]>([])
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateResponse | null>(null)
  const [usdBankAccount, setUsdBankAccount] = useState<UsdBankAccountValue | null>(null)
  const [whatsappConfig, setWhatsappConfig] = useState<SupportWhatsAppValue | null>(null)
  const [sinpeConfig, setSinpeConfig] = useState<SinpeDetailsValue | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatusOnly = useCallback(async () => {
    const statusRes = await fetchWithTimeout('/api/subscription/status')
    if (!statusRes?.ok) return

    const data = (await statusRes.json()) as SubscriptionStatusResponse
    setSubscription(withLiveDaysRemaining(data))
    setCache(CK.status, data, CACHE_TTL.SHORT)
  }, [])

  const fetchData = useCallback(async () => {
    // Stale-while-revalidate: hydrate from cache immediately
    const cachedStatus = getStaleCache<SubscriptionStatusResponse>(CK.status)
    const cachedPlans = getStaleCache<SubscriptionPlan[]>(CK.plans)
    const cachedPayments = getStaleCache<PaymentReport[]>(CK.payments)
    const cachedExchange = getStaleCache<ExchangeRateResponse>(CK.exchange)
    const cachedBank = getStaleCache<UsdBankAccountValue>(CK.bank)
    const cachedWhatsapp = getStaleCache<SupportWhatsAppValue>(CK.whatsapp)
    const cachedSinpe = getStaleCache<SinpeDetailsValue>(CK.sinpe)

    // Hydrate state from cache
    if (cachedStatus) setSubscription(withLiveDaysRemaining(cachedStatus.data))
    if (cachedPlans) setPlans(cachedPlans.data)
    if (cachedPayments) setPayments(cachedPayments.data)
    if (cachedExchange) setExchangeRate(cachedExchange.data)
    if (cachedBank) setUsdBankAccount(cachedBank.data)
    if (cachedWhatsapp) setWhatsappConfig(cachedWhatsapp.data)
    if (cachedSinpe) setSinpeConfig(cachedSinpe.data)

    // If all caches are fresh, skip network entirely
    const allFresh =
      cachedStatus &&
      !cachedStatus.isStale &&
      cachedPlans &&
      !cachedPlans.isStale &&
      cachedPayments &&
      !cachedPayments.isStale &&
      cachedExchange &&
      !cachedExchange.isStale &&
      cachedBank &&
      !cachedBank.isStale &&
      cachedWhatsapp &&
      !cachedWhatsapp.isStale &&
      cachedSinpe &&
      !cachedSinpe.isStale

    if (allFresh) {
      setLoading(false)
      return
    }

    try {
      // Only fetch stale/missing data
      const fetches: Promise<Response | null>[] = [
        !cachedStatus || cachedStatus.isStale
          ? fetchWithTimeout('/api/subscription/status')
          : Promise.resolve(null),
        !cachedPlans || cachedPlans.isStale
          ? fetchWithTimeout('/api/subscription/plans')
          : Promise.resolve(null),
        !cachedPayments || cachedPayments.isStale
          ? fetchWithTimeout('/api/subscription/payments')
          : Promise.resolve(null),
        !cachedExchange || cachedExchange.isStale
          ? fetchWithTimeout('/api/exchange-rate')
          : Promise.resolve(null),
        !cachedBank || cachedBank.isStale
          ? fetchWithTimeout('/api/settings?key=usd_bank_account')
          : Promise.resolve(null),
        !cachedWhatsapp || cachedWhatsapp.isStale
          ? fetchWithTimeout('/api/settings?key=support_whatsapp')
          : Promise.resolve(null),
        !cachedSinpe || cachedSinpe.isStale
          ? fetchWithTimeout('/api/settings?key=sinpe_details')
          : Promise.resolve(null),
      ]

      const [statusRes, plansRes, paymentsRes, exchangeRes, bankRes, whatsappRes, sinpeRes] =
        await Promise.all(fetches)

      if (statusRes?.ok) {
        const data = (await statusRes.json()) as SubscriptionStatusResponse
        setSubscription(withLiveDaysRemaining(data))
        setCache(CK.status, data, CACHE_TTL.SHORT)
      }
      if (plansRes?.ok) {
        const data = await plansRes.json()
        setPlans(data)
        setCache(CK.plans, data, CACHE_TTL.MEDIUM)
      }
      if (paymentsRes?.ok) {
        const data = await paymentsRes.json()
        setPayments(data)
        setCache(CK.payments, data, CACHE_TTL.SHORT)
      }
      if (exchangeRes?.ok) {
        const data = await exchangeRes.json()
        setExchangeRate(data)
        setCache(CK.exchange, data, CACHE_TTL.MEDIUM)
      }
      if (bankRes?.ok) {
        const data = await bankRes.json()
        if (data.value) {
          setUsdBankAccount(data.value as UsdBankAccountValue)
          setCache(CK.bank, data.value, CACHE_TTL.LONG)
        }
      }
      if (whatsappRes?.ok) {
        const data = await whatsappRes.json()
        if (data.value) {
          setWhatsappConfig(data.value as SupportWhatsAppValue)
          setCache(CK.whatsapp, data.value, CACHE_TTL.LONG)
        }
      }
      if (sinpeRes?.ok) {
        const data = await sinpeRes.json()
        if (data.value) {
          setSinpeConfig(data.value as SinpeDetailsValue)
          setCache(CK.sinpe, data.value, CACHE_TTL.LONG)
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

  useEffect(() => {
    const recalcInterval = window.setInterval(() => {
      setSubscription((current) => (current ? withLiveDaysRemaining(current) : current))
    }, DAYS_RECALC_INTERVAL_MS)

    return () => window.clearInterval(recalcInterval)
  }, [])

  useEffect(() => {
    const statusRefreshInterval = window.setInterval(() => {
      void fetchStatusOnly()
    }, STATUS_REFRESH_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return

      setSubscription((current) => (current ? withLiveDaysRemaining(current) : current))
      void fetchStatusOnly()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(statusRefreshInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchStatusOnly])

  return {
    subscription,
    plans,
    payments,
    exchangeRate,
    usdBankAccount,
    whatsappConfig,
    sinpeConfig,
    loading,
    refetch: fetchData,
  }
}
