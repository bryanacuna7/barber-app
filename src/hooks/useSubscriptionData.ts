import { useState, useEffect, useCallback } from 'react'
import type {
  SubscriptionStatusResponse,
  SubscriptionPlan,
  PaymentReport,
  ExchangeRateResponse,
  UsdBankAccountValue,
  SupportWhatsAppValue,
  SinpeDetailsValue,
} from '@/types/database'

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
    try {
      const [statusRes, plansRes, paymentsRes, exchangeRes, bankRes, whatsappRes, sinpeRes] =
        await Promise.all([
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
