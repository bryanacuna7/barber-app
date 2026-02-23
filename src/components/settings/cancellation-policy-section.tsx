'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Save, CalendarX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { useToast } from '@/components/ui/toast'
import type { CancellationPolicy } from '@/types'

// =====================================================
// Types
// =====================================================

interface CancellationPolicySectionProps {
  businessId: string
}

// =====================================================
// Default values
// =====================================================

const DEFAULT_POLICY: CancellationPolicy = {
  enabled: false,
  deadline_hours: 24,
  allow_reschedule: false,
}

// =====================================================
// Component
// =====================================================

// businessId is accepted for future direct-query usage; the API route resolves
// the business from the session cookie, so no client-side forwarding is needed.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CancellationPolicySection({ businessId }: CancellationPolicySectionProps) {
  const toast = useToast()

  const [policy, setPolicy] = useState<CancellationPolicy>(DEFAULT_POLICY)
  const [saved, setSaved] = useState<CancellationPolicy>(DEFAULT_POLICY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dirty check — only show Save when something changed
  const isDirty =
    policy.enabled !== saved.enabled ||
    policy.deadline_hours !== saved.deadline_hours ||
    policy.allow_reschedule !== saved.allow_reschedule

  // Load policy on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings/cancellation-policy')
        if (!res.ok) {
          toast.error('No se pudo cargar la política de cancelación')
          setLoading(false)
          return
        }
        const data: CancellationPolicy = await res.json()
        setPolicy(data)
        setSaved(data)
      } catch {
        toast.error('No se pudo cargar la política de cancelación')
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
      const res = await fetch('/api/settings/cancellation-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      })

      if (!res.ok) {
        toast.error('Error al guardar la política de cancelación')
        return
      }

      setSaved(policy)
      toast.success('Política de cancelación actualizada')
    } catch {
      toast.error('Error al guardar la política de cancelación')
    } finally {
      setSaving(false)
    }
  }, [policy, toast])

  // =====================================================
  // Loading skeleton
  // =====================================================

  if (loading) {
    return (
      <div>
        <h3 className="text-[15px] font-semibold text-muted uppercase tracking-wider mb-4">
          Política de cancelación
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
        Política de cancelación
      </h3>

      <div className="space-y-1">
        {/* Toggle: allow clients to cancel */}
        <div className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/30">
              <CalendarX className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                Permitir cancelaciones
              </p>
              <p className="text-[13px] text-muted mt-0.5">
                Los clientes pueden cancelar sus citas desde el enlace de confirmación
              </p>
            </div>
          </div>
          <IOSToggle
            checked={policy.enabled}
            onChange={(val) => setPolicy((prev) => ({ ...prev, enabled: val }))}
          />
        </div>

        {/* Conditional fields: shown only when enabled */}
        <AnimatePresence initial={false}>
          {policy.enabled && (
            <motion.div
              key="cancellation-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="pl-12 space-y-1">
                {/* Deadline hours input */}
                <div className="flex items-center justify-between py-3.5 px-1 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                      Anticipación mínima
                    </p>
                    <p className="text-[13px] text-muted mt-0.5">
                      Horas antes de la cita para poder cancelar
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={168}
                      value={policy.deadline_hours}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        if (!isNaN(val) && val >= 1 && val <= 168) {
                          setPolicy((prev) => ({ ...prev, deadline_hours: val }))
                        }
                      }}
                      aria-label="Horas de anticipación mínima"
                      className="w-16 h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center text-[16px] font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
                    />
                    <span className="text-[14px] text-muted whitespace-nowrap">horas</span>
                  </div>
                </div>

                {/* Allow reschedule toggle */}
                <div className="flex items-center justify-between py-3.5 px-1">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[16px] font-medium text-zinc-900 dark:text-white">
                      Permitir reagendamiento
                    </p>
                    <p className="text-[13px] text-muted mt-0.5">
                      Los clientes pueden elegir una nueva hora al cancelar
                    </p>
                  </div>
                  <IOSToggle
                    checked={policy.allow_reschedule}
                    onChange={(val) => setPolicy((prev) => ({ ...prev, allow_reschedule: val }))}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info note */}
      <div className="mt-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
        <p className="text-[13px] text-muted">
          {policy.enabled
            ? `Los clientes pueden cancelar hasta ${policy.deadline_hours}h antes de la cita.${policy.allow_reschedule ? ' Se les ofrecerá reagendar.' : ''}`
            : 'Con las cancelaciones desactivadas, los clientes deben contactarte directamente para cancelar.'}
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
              Guardar política de cancelación
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
