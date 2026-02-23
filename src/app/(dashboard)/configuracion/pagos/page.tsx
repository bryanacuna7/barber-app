'use client'

import { useState, useEffect } from 'react'
import { Save, Banknote, Smartphone, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { useToast } from '@/components/ui/toast'
import { FadeInUp } from '@/components/ui/motion'
import { createClient } from '@/lib/supabase/client'
import { useBusiness } from '@/contexts/business-context'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { SettingsSubrouteHeader } from '@/components/settings/settings-subroute-header'
import { CancellationPolicySection } from '@/components/settings/cancellation-policy-section'

// =====================================================
// Payment Method Definitions
// =====================================================

type PaymentMethodKey = 'cash' | 'sinpe' | 'card'

const PAYMENT_METHOD_OPTIONS = [
  {
    key: 'cash' as PaymentMethodKey,
    label: 'Efectivo',
    description: 'Pago en efectivo al completar el servicio',
    icon: Banknote,
  },
  {
    key: 'sinpe' as PaymentMethodKey,
    label: 'SINPE Móvil',
    description: 'Transferencia SINPE desde el celular del cliente',
    icon: Smartphone,
  },
  {
    key: 'card' as PaymentMethodKey,
    label: 'Tarjeta',
    description: 'Pago con tarjeta de débito o crédito',
    icon: CreditCard,
  },
]

// =====================================================
// Page Component
// =====================================================

export default function PagosSettingsPage() {
  const { businessId } = useBusiness()
  const toast = useToast()
  const supabase = createClient()

  const [methods, setMethods] = useState<PaymentMethodKey[]>(['cash'])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // Load current payment methods
  useEffect(() => {
    async function load() {
      const { data, error } = (await supabase
        .from('businesses')
        .select('accepted_payment_methods')
        .eq('id', businessId)
        .single()) as { data: Record<string, unknown> | null; error: unknown }

      if (error || !data) {
        setLoadError(true)
        toast.error('No se pudo cargar la configuración de pagos')
        setLoading(false)
        return
      }

      if (Array.isArray(data.accepted_payment_methods)) {
        setMethods(data.accepted_payment_methods as PaymentMethodKey[])
      }
      setLoading(false)
    }
    load()
  }, [businessId, supabase, toast])

  const handleToggle = (key: PaymentMethodKey) => {
    setMethods((prev) => (prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]))
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('businesses')
      .update({ accepted_payment_methods: methods } as Record<string, unknown>)
      .eq('id', businessId)

    setSaving(false)

    if (error) {
      toast.error('Error al guardar métodos de pago')
      return
    }

    toast.success('Métodos de pago actualizados')
  }

  const activeCount = methods.length

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-8 w-8 rounded-full border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"
        />
      </div>
    )
  }

  // Load error state
  if (loadError) {
    return (
      <div className="min-h-screen pb-24 lg:pb-6">
        <FadeInUp>
          <SettingsSubrouteHeader
            title="Métodos de Pago"
            subtitle="Qué métodos de pago aceptas en tu negocio"
          />
        </FadeInUp>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[15px] text-red-600 dark:text-red-400 font-medium">
            No se pudo cargar la configuración
          </p>
          <p className="text-[13px] text-muted mt-1">Recarga la página e intenta de nuevo</p>
        </div>
      </div>
    )
  }

  return (
    <ComponentErrorBoundary
      fallbackTitle="Error en Métodos de Pago"
      fallbackDescription="Ocurrió un error al cargar la página de métodos de pago"
    >
      <div className="min-h-screen pb-24 lg:pb-6">
        {/* Header */}
        <FadeInUp>
          <SettingsSubrouteHeader
            title="Métodos de Pago"
            subtitle="Qué métodos de pago aceptas en tu negocio"
          />
        </FadeInUp>

        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Payment Method Toggles */}
          <FadeInUp delay={0.05}>
            <div>
              <h3 className="text-[15px] font-semibold text-muted uppercase tracking-wider mb-4">
                Métodos aceptados
              </h3>
              <div className="space-y-1">
                {PAYMENT_METHOD_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <div
                      key={option.key}
                      className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                            {option.label}
                          </p>
                          <p className="text-[13px] text-muted mt-0.5">{option.description}</p>
                        </div>
                      </div>
                      <IOSToggle
                        checked={methods.includes(option.key)}
                        onChange={() => handleToggle(option.key)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </FadeInUp>

          {/* Info note */}
          <FadeInUp delay={0.1}>
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
              <p className="text-[13px] text-muted">
                {activeCount === 0
                  ? 'Sin métodos activos: al completar una cita no se preguntará el método de pago.'
                  : activeCount === 1
                    ? 'Con 1 método activo: se seleccionará automáticamente al completar (2 taps).'
                    : `Con ${activeCount} métodos activos: el barbero elige al completar la cita.`}
              </p>
            </div>
          </FadeInUp>

          {/* Divider */}
          <div className="border-t border-zinc-200 dark:border-zinc-700" />

          {/* Cancellation Policy */}
          <FadeInUp delay={0.15}>
            <CancellationPolicySection businessId={businessId} />
          </FadeInUp>
        </div>

        {/* Sticky Save Button */}
        <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 lg:left-64 px-4 lg:px-8 z-30">
          <div className="max-w-3xl mx-auto">
            <Button
              type="button"
              onClick={handleSave}
              isLoading={saving}
              className="w-full h-12 text-[15px] font-semibold shadow-lg"
            >
              <Save className="h-5 w-5 mr-2" />
              Guardar Métodos de Pago
            </Button>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  )
}
