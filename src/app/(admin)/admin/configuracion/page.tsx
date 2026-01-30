'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign,
  Save,
  Loader2,
  Building2,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Phone,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type {
  ExchangeRateValue,
  UsdBankAccountValue,
  SupportWhatsAppValue,
  SinpeDetailsValue,
} from '@/types/database'

interface SystemSetting {
  id: string
  key: string
  value: ExchangeRateValue | UsdBankAccountValue | SupportWhatsAppValue | SinpeDetailsValue
  updated_at: string
}

export default function AdminConfiguracion() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateValue>({
    usd_to_crc: 510,
    last_updated: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // USD bank account state
  const [bankAccount, setBankAccount] = useState<UsdBankAccountValue>({
    enabled: false,
    bank_name: '',
    account_number: '',
    account_holder: '',
    notes: '',
  })

  // WhatsApp support state
  const [whatsapp, setWhatsapp] = useState<SupportWhatsAppValue>({
    number: '50688888888',
    display_number: '8888-8888',
    message_template: '',
  })

  // SINPE Móvil details state
  const [sinpe, setSinpe] = useState<SinpeDetailsValue>({
    phone_number: '8888-8888',
    account_name: 'BarberShop Pro',
    notes: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()

      // Parse settings
      data.settings?.forEach((setting: SystemSetting) => {
        if (setting.key === 'exchange_rate') {
          setExchangeRate(setting.value as ExchangeRateValue)
        } else if (setting.key === 'usd_bank_account') {
          setBankAccount(setting.value as UsdBankAccountValue)
        } else if (setting.key === 'support_whatsapp') {
          setWhatsapp(setting.value as SupportWhatsAppValue)
        } else if (setting.key === 'sinpe_details') {
          setSinpe(setting.value as SinpeDetailsValue)
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  async function saveExchangeRate() {
    setSaving('exchange_rate')
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'exchange_rate',
          value: exchangeRate,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      const updated = await response.json()
      setExchangeRate(updated.value as ExchangeRateValue)
      setSuccess('Tipo de cambio actualizado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving')
    } finally {
      setSaving(null)
    }
  }

  async function saveBankAccount() {
    setSaving('usd_bank_account')
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'usd_bank_account',
          value: bankAccount,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      const updated = await response.json()
      setBankAccount(updated.value as UsdBankAccountValue)
      setSuccess('Cuenta bancaria actualizada correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving')
    } finally {
      setSaving(null)
    }
  }

  async function saveWhatsApp() {
    setSaving('support_whatsapp')
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'support_whatsapp',
          value: whatsapp,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      const updated = await response.json()
      setWhatsapp(updated.value as SupportWhatsAppValue)
      setSuccess('WhatsApp actualizado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving')
    } finally {
      setSaving(null)
    }
  }

  async function saveSinpe() {
    setSaving('sinpe_details')
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'sinpe_details',
          value: sinpe,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      const updated = await response.json()
      setSinpe(updated.value as SinpeDetailsValue)
      setSuccess('SINPE Móvil actualizado correctamente')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Configuración</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Configuración global de la plataforma
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      {/* Exchange Rate Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Tipo de Cambio USD/CRC</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Para mostrar precios en colones a clientes costarricenses
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                1 USD = CRC
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-zinc-500">₡</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={exchangeRate.usd_to_crc}
                  onChange={(e) =>
                    setExchangeRate({
                      ...exchangeRate,
                      usd_to_crc: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-lg font-semibold dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Última actualización: {exchangeRate.last_updated}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Notas (opcional)
              </label>
              <input
                type="text"
                value={exchangeRate.notes || ''}
                onChange={(e) =>
                  setExchangeRate({
                    ...exchangeRate,
                    notes: e.target.value,
                  })
                }
                placeholder="Ej: Tipo de cambio del BCCR"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Vista previa de precios:
            </p>
            <div className="mt-2 grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Plan Básico ($12)</span>
                <span className="font-semibold">
                  ₡{(12 * exchangeRate.usd_to_crc).toLocaleString('es-CR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Plan Pro ($29)</span>
                <span className="font-semibold">
                  ₡{(29 * exchangeRate.usd_to_crc).toLocaleString('es-CR')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveExchangeRate} disabled={saving === 'exchange_rate'}>
              {saving === 'exchange_rate' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Tipo de Cambio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* USD Bank Account Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Cuenta Bancaria en Dólares</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Opción de pago alternativa para clientes
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bankAccount.enabled}
                onChange={(e) =>
                  setBankAccount({
                    ...bankAccount,
                    enabled: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded border-zinc-300 dark:border-zinc-600"
              />
              <span className="font-medium">Habilitar opción de depósito en dólares</span>
            </label>
          </div>

          <div
            className={`grid gap-4 sm:grid-cols-2 ${!bankAccount.enabled && 'opacity-50 pointer-events-none'}`}
          >
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nombre del Banco
              </label>
              <input
                type="text"
                value={bankAccount.bank_name}
                onChange={(e) =>
                  setBankAccount({
                    ...bankAccount,
                    bank_name: e.target.value,
                  })
                }
                placeholder="Ej: Banco Nacional de Costa Rica"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Titular de la Cuenta
              </label>
              <input
                type="text"
                value={bankAccount.account_holder}
                onChange={(e) =>
                  setBankAccount({
                    ...bankAccount,
                    account_holder: e.target.value,
                  })
                }
                placeholder="Ej: BarberShop Pro S.A."
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Número de Cuenta / IBAN
              </label>
              <input
                type="text"
                value={bankAccount.account_number}
                onChange={(e) =>
                  setBankAccount({
                    ...bankAccount,
                    account_number: e.target.value,
                  })
                }
                placeholder="Ej: CR00 0000 0000 0000 0000 00"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Notas adicionales (opcional)
              </label>
              <textarea
                value={bankAccount.notes || ''}
                onChange={(e) =>
                  setBankAccount({
                    ...bankAccount,
                    notes: e.target.value,
                  })
                }
                placeholder="Instrucciones adicionales para el depósito..."
                rows={2}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveBankAccount} disabled={saving === 'usd_bank_account'}>
              {saving === 'usd_bank_account' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Cuenta Bancaria
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Support Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg">WhatsApp de Soporte</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Número para reportar pagos y soporte
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Número completo (con código de país)
              </label>
              <input
                type="text"
                value={whatsapp.number}
                onChange={(e) =>
                  setWhatsapp({
                    ...whatsapp,
                    number: e.target.value.replace(/\D/g, ''),
                  })
                }
                placeholder="Ej: 50688888888"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-800"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Sin guiones ni espacios. Ejemplo: 50688888888
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Número para mostrar
              </label>
              <input
                type="text"
                value={whatsapp.display_number}
                onChange={(e) =>
                  setWhatsapp({
                    ...whatsapp,
                    display_number: e.target.value,
                  })
                }
                placeholder="Ej: 8888-8888"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              />
              <p className="mt-1 text-xs text-zinc-500">Formato legible para mostrar a usuarios</p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Vista previa del enlace:
            </p>
            <a
              href={`https://wa.me/${whatsapp.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-sm text-green-600 hover:underline dark:text-green-400"
            >
              wa.me/{whatsapp.number}
            </a>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveWhatsApp} disabled={saving === 'support_whatsapp'}>
              {saving === 'support_whatsapp' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SINPE Móvil Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Datos SINPE Móvil</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Información para recibir pagos por SINPE
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Número SINPE Móvil
              </label>
              <input
                type="text"
                value={sinpe.phone_number}
                onChange={(e) =>
                  setSinpe({
                    ...sinpe,
                    phone_number: e.target.value,
                  })
                }
                placeholder="Ej: 8888-8888"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nombre de la cuenta
              </label>
              <input
                type="text"
                value={sinpe.account_name}
                onChange={(e) =>
                  setSinpe({
                    ...sinpe,
                    account_name: e.target.value,
                  })
                }
                placeholder="Ej: BarberShop Pro"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Notas (opcional)
              </label>
              <textarea
                value={sinpe.notes || ''}
                onChange={(e) =>
                  setSinpe({
                    ...sinpe,
                    notes: e.target.value,
                  })
                }
                placeholder="Instrucciones adicionales para el pago..."
                rows={2}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveSinpe} disabled={saving === 'sinpe_details'}>
              {saving === 'sinpe_details' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar SINPE Móvil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
