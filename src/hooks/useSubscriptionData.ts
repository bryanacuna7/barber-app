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

export function useSubscriptionData() {
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [payments, setPayments] = useState<PaymentReport[]>([])
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateResponse | null>(null)
  const [usdBankAccount, setUsdBankAccount] = useState<UsdBankAccountValue | null>(null)
  const [whatsappConfig, setWhatsappConfig] = useState<SupportWhatsAppValue | null>(null)
  const [sinpeConfig, setSinpeConfig] = useState<SinpeDetailsValue | null>(null)
  const [loading, setLoading] = useState(true)

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
    if (cachedStatus) setSubscription(cachedStatus.data)
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
          ? fetch('/api/subscription/status')
          : Promise.resolve(null),
        !cachedPlans || cachedPlans.isStale
          ? fetch('/api/subscription/plans')
          : Promise.resolve(null),
        !cachedPayments || cachedPayments.isStale
          ? fetch('/api/subscription/payments')
          : Promise.resolve(null),
        !cachedExchange || cachedExchange.isStale
          ? fetch('/api/exchange-rate')
          : Promise.resolve(null),
        !cachedBank || cachedBank.isStale
          ? fetch('/api/settings?key=usd_bank_account')
          : Promise.resolve(null),
        !cachedWhatsapp || cachedWhatsapp.isStale
          ? fetch('/api/settings?key=support_whatsapp')
          : Promise.resolve(null),
        !cachedSinpe || cachedSinpe.isStale
          ? fetch('/api/settings?key=sinpe_details')
          : Promise.resolve(null),
      ]

      const [statusRes, plansRes, paymentsRes, exchangeRes, bankRes, whatsappRes, sinpeRes] =
        await Promise.all(fetches)

      if (statusRes?.ok) {
        const data = await statusRes.json()
        setSubscription(data)
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
