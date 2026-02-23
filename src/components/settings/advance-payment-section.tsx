'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Save, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { useToast } from '@/components/ui/toast'
import type { AdvancePaymentConfig } from '@/types/api'

// =====================================================
// Types
// =====================================================

interface AdvancePaymentSectionProps {
  businessId: string
}

// =====================================================
// Default values
// =====================================================

const DEFAULT_CONFIG: AdvancePaymentConfig = {
  enabled: false,
  discount: 10,
  deadline_hours: 24,
  sinpe_phone: '',
  sinpe_holder_name: '',
}

// =====================================================
// Component
// =====================================================

// businessId is accepted for future direct-query usage; the API route resolves
// the business from the session cookie, so no client-side forwarding is needed.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdvancePaymentSection({ businessId }: AdvancePaymentSectionProps) {
  const toast = useToast()

  const [config, setConfig] = useState<AdvancePaymentConfig>(DEFAULT_CONFIG)
  const [saved, setSaved] = useState<AdvancePaymentConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dirty check — only show Save when something changed
  const isDirty =
    config.enabled !== saved.enabled ||
    config.discount !== saved.discount ||
    config.deadline_hours !== saved.deadline_hours ||
    config.sinpe_phone !== saved.sinpe_phone ||
    config.sinpe_holder_name !== saved.sinpe_holder_name

  // Load config on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/advance-payment')
        if (!res.ok) {
          toast.error('No se pudo cargar la configuración de pago anticipado')
          setLoading(false)
          return
        }
        const data: AdvancePaymentConfig = await res.json()
        setConfig(data)
        setSaved(data)
      } catch {
        toast.error('No se pudo cargar la configuración de pago anticipado')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings/advance-payment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!res.ok) {
        toast.error('Error al guardar la configuración de pago anticipado')
        return
      }

      setSaved(config)
      toast.success('Configuración de pago anticipado actualizada')
    } catch {
      toast.error('Error al guardar la configuración de pago anticipado')
    } finally {
      setSaving(false)
    }
  }, [config, toast])

  // =====================================================
  // Loading skeleton
  // =====================================================

  if (loading) {
    return (
      <div>
        <h3 className="text-[15px] font-semibold text-muted uppercase tracking-wider mb-4">
          Pago Anticipado SINPE
        </h3>
        <div className="space-y-1">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-3 w-56 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                </div>
              </div>
              <div className="w-[51px] h-[31px] rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // =====================================================
  // Render
  // =====================================================

  return (
    <div>
      <h3 className="text-[15px] font-semibold text-muted uppercase tracking-wider mb-4">
        Pago Anticipado SINPE
      </h3>

      <div className="space-y-1">
        {/* Toggle: enable advance payment */}
        <div className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                Activar pago anticipado
              </p>
              <p className="text-[13px] text-muted mt-0.5">
                Ofrece descuento a clientes que pagan antes
              </p>
            </div>
          </div>
          <IOSToggle
            checked={config.enabled}
            onChange={(val) => setConfig((prev) => ({ ...prev, enabled: val }))}
          />
        </div>

        {/* Conditional fields: shown only when enabled */}
        <AnimatePresence initial={false}>
          {config.enabled && (
            <motion.div
              key="advance-payment-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="pl-12 space-y-1">
                {/* SINPE Phone */}
                <div className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                      Número SINPE
                    </p>
                    <p className="text-[13px] text-muted mt-0.5">
                      Número al que los clientes enviarán el pago
                    </p>
                  </div>
                  <input
                    type="text"
                    value={config.sinpe_phone}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, sinpe_phone: e.target.value }))
                    }
                    placeholder="8888-8888"
                    aria-label="Número SINPE"
                    className="w-28 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center text-[15px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
                  />
                </div>

                {/* Holder Name */}
                <div className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                      Nombre del titular
                    </p>
                    <p className="text-[13px] text-muted mt-0.5">Nombre asociado al número SINPE</p>
                  </div>
                  <input
                    type="text"
                    value={config.sinpe_holder_name}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, sinpe_holder_name: e.target.value }))
                    }
                    placeholder="Nombre del titular"
                    aria-label="Nombre del titular SINPE"
                    className="w-36 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center text-[15px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
                  />
                </div>

                {/* Discount percentage */}
                <div className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                      Descuento (%)
                    </p>
                    <p className="text-[13px] text-muted mt-0.5">
                      Porcentaje de descuento por pago anticipado
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={config.discount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val) && val >= 5 && val <= 50) {
                          setConfig((prev) => ({ ...prev, discount: val }))
                        }
                      }}
                      aria-label="Porcentaje de descuento"
                      className="w-16 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center text-[16px] font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
                    />
                    <span className="text-[14px] text-muted whitespace-nowrap">%</span>
                  </div>
                </div>

                {/* Deadline hours */}
                <div className="flex items-center justify-between py-3.5 px-1">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                      Plazo límite (horas antes)
                    </p>
                    <p className="text-[13px] text-muted mt-0.5">0 = sin límite</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={48}
                      value={config.deadline_hours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val) && val >= 0 && val <= 48) {
                          setConfig((prev) => ({ ...prev, deadline_hours: val }))
                        }
                      }}
                      aria-label="Plazo límite en horas"
                      className="w-16 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center text-[16px] font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
                    />
                    <span className="text-[14px] text-muted whitespace-nowrap">horas</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info note */}
      <div className="mt-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
        <p className="text-[13px] text-muted">
          {config.enabled
            ? `Los clientes reciben un ${config.discount}% de descuento al pagar por SINPE antes de la cita.${config.deadline_hours > 0 ? ` Plazo: ${config.deadline_hours}h antes.` : ' Sin límite de tiempo.'}`
            : 'Con el pago anticipado desactivado, los clientes pagan normalmente en el local.'}
        </p>
      </div>

      {/* Save button — inline, only visible when dirty */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="mt-4"
          >
            <Button
              type="button"
              onClick={handleSave}
              isLoading={saving}
              className="w-full h-11 text-[15px] font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar pago anticipado
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
