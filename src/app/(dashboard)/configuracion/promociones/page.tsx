'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Pencil, Trash2, Save, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { IOSToggle } from '@/components/ui/ios-toggle'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { FadeInUp } from '@/components/ui/motion'
import { useBusiness } from '@/contexts/business-context'
import { useHeatmapAnalytics } from '@/hooks/queries/useAnalytics'
import { validatePromoRules } from '@/lib/promo-engine'
import { ComponentErrorBoundary } from '@/components/error-boundaries/ComponentErrorBoundary'
import { SettingsSubrouteHeader } from '@/components/settings/settings-subroute-header'
import type { PromoRule } from '@/types/promo'

// =====================================================
// Lazy-loaded heatmap (no SSR)
// =====================================================

const DemandHeatmap = dynamic(
  () => import('@/components/analytics/demand-heatmap').then((m) => m.DemandHeatmap),
  { ssr: false }
)

// =====================================================
// Constants
// =====================================================

const DAY_LABELS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_LABELS_ABBR = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

// JS DOW: 0=Sun…6=Sat
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

// =====================================================
// Helpers
// =====================================================

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`
}

function ruleSummary(rule: PromoRule): string {
  const days = rule.days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS_SHORT[d])
    .join(', ')
  const discount =
    rule.discount_type === 'percent' ? `-${rule.discount_value}%` : `-₡${rule.discount_value}`
  return `${days} · ${formatHour(rule.start_hour)}–${formatHour(rule.end_hour)} · ${discount}`
}

function makeEmptyRule(): PromoRule {
  return {
    id: crypto.randomUUID(),
    label: '',
    enabled: true,
    priority: 0,
    days: [1, 2, 3, 4, 5],
    start_hour: 14,
    end_hour: 17,
    discount_type: 'percent',
    discount_value: 15,
    service_ids: [],
  }
}

// =====================================================
// Heatmap Section Skeleton
// =====================================================

function HeatmapSkeleton() {
  return (
    <div className="animate-pulse rounded-xl p-4 sm:p-5">
      <div className="flex gap-0.5 mb-1.5 ml-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 h-3 bg-zinc-200 dark:bg-zinc-700 rounded" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, row) => (
        <div key={row} className="flex items-center gap-0.5 mb-0.5">
          <div className="w-8 h-6 bg-zinc-200 dark:bg-zinc-700 rounded mr-1.5" />
          {Array.from({ length: 7 }).map((_, col) => (
            <div key={col} className="flex-1 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-sm" />
          ))}
        </div>
      ))}
    </div>
  )
}

// =====================================================
// Rule Card
// =====================================================

interface RuleCardProps {
  rule: PromoRule
  onToggle: (id: string) => void
  onEdit: (rule: PromoRule) => void
  onDelete: (id: string) => void
}

function RuleCard({ rule, onToggle, onEdit, onDelete }: RuleCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3.5"
    >
      {/* Main row */}
      <div className="flex items-center gap-3">
        {/* Toggle */}
        <IOSToggle checked={rule.enabled} onChange={() => onToggle(rule.id)} size="sm" />

        {/* Label + summary */}
        <div className="flex-1 min-w-0">
          <p
            className="text-[15px] font-semibold text-zinc-900 dark:text-white truncate"
            title={rule.label}
          >
            {rule.label || <span className="text-muted italic">Sin nombre</span>}
          </p>
          <p className="text-[12px] text-muted mt-0.5 truncate">{ruleSummary(rule)}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(rule)}
            aria-label={`Editar regla ${rule.label}`}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete((v) => !v)}
            aria-label={`Eliminar regla ${rule.label}`}
            className="h-9 w-9 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inline delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 mt-3 flex items-center justify-between gap-3">
              <p className="text-[13px] text-muted">¿Eliminar esta regla?</p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfirmDelete(false)}
                  className="h-9"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    onDelete(rule.id)
                    setConfirmDelete(false)
                  }}
                  className="h-9"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// =====================================================
// Edit Modal
// =====================================================

interface EditModalProps {
  rule: PromoRule | null
  onClose: () => void
  onSave: (rule: PromoRule) => void
}

function EditModal({ rule, onClose, onSave }: EditModalProps) {
  // `key={rule.id}` on the call-site remounts this component whenever a
  // different rule is opened, so the lazy initializer below always runs fresh.
  const [draft, setDraft] = useState<PromoRule>(() => rule ?? makeEmptyRule())

  const toggleDay = (dow: number) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.includes(dow) ? prev.days.filter((d) => d !== dow) : [...prev.days, dow],
    }))
  }

  // A rule is "new" when it was created with makeEmptyRule() by the page —
  // we detect this by checking whether the rule exists in the saved list.
  // The parent passes the original rule object; if it has no persisted label
  // equivalent we fall back to checking the draft identity.
  const isNew = !rule || !rule.label

  return (
    <Modal
      isOpen={!!rule}
      onClose={onClose}
      title={isNew ? 'Nueva Regla' : 'Editar Regla'}
      size="md"
    >
      <div className="space-y-5">
        {/* Label */}
        <div>
          <label
            htmlFor="promo-label"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Nombre de la regla
          </label>
          <input
            id="promo-label"
            type="text"
            maxLength={60}
            value={draft.label}
            onChange={(e) => setDraft((p) => ({ ...p, label: e.target.value }))}
            placeholder="ej. Descuento tarde entre semana"
            className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 text-[15px] text-zinc-900 dark:text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
          />
          <p className="text-[11px] text-muted mt-1 text-right">{draft.label.length}/60</p>
        </div>

        {/* Days */}
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Días aplicables
          </p>
          <div className="flex gap-1.5">
            {ALL_DAYS.map((dow) => {
              const active = draft.days.includes(dow)
              return (
                <button
                  key={dow}
                  type="button"
                  onClick={() => toggleDay(dow)}
                  aria-pressed={active}
                  aria-label={DAY_LABELS_SHORT[dow]}
                  className={`flex-1 h-9 rounded-lg text-[12px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white ${
                    active
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-muted hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {DAY_LABELS_ABBR[dow]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Hour range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="promo-start-hour"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Hora inicio
            </label>
            <select
              id="promo-start-hour"
              value={draft.start_hour}
              onChange={(e) => setDraft((p) => ({ ...p, start_hour: Number(e.target.value) }))}
              className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 text-[15px] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white appearance-none"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="promo-end-hour"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
            >
              Hora fin
            </label>
            <select
              id="promo-end-hour"
              value={draft.end_hour}
              onChange={(e) => setDraft((p) => ({ ...p, end_hour: Number(e.target.value) }))}
              className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 text-[15px] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white appearance-none"
            >
              {Array.from({ length: 24 }, (_, h) => h + 1).map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Discount type */}
        <div>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Tipo de descuento
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'percent', label: '% Porcentaje' },
                { value: 'fixed', label: '₡ Monto fijo' },
              ] as const
            ).map((opt) => {
              const active = draft.discount_type === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDraft((p) => ({ ...p, discount_type: opt.value }))}
                  aria-pressed={active}
                  className={`h-11 rounded-xl text-[14px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white border ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Discount value */}
        <div>
          <label
            htmlFor="promo-discount-value"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            {draft.discount_type === 'percent' ? 'Porcentaje (%)' : 'Monto fijo (₡)'}
          </label>
          <input
            id="promo-discount-value"
            type="number"
            min={draft.discount_type === 'percent' ? 1 : 0}
            max={draft.discount_type === 'percent' ? 100 : undefined}
            value={draft.discount_value}
            onChange={(e) => setDraft((p) => ({ ...p, discount_value: Number(e.target.value) }))}
            className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 text-[15px] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
          />
        </div>

        {/* Priority */}
        <div>
          <label
            htmlFor="promo-priority"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Prioridad <span className="text-muted font-normal">(0 = más alta)</span>
          </label>
          <input
            id="promo-priority"
            type="number"
            min={0}
            value={draft.priority}
            onChange={(e) =>
              setDraft((p) => ({ ...p, priority: Math.max(0, Number(e.target.value)) }))
            }
            className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3.5 text-[15px] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition"
          />
        </div>

        {/* Modal footer buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="secondary" onClick={onClose} className="h-11">
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => onSave(draft)} className="h-11">
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// =====================================================
// Page Component
// =====================================================

export default function PromocionesSettingsPage() {
  useBusiness() // ensures we are inside a business context
  const toast = useToast()

  const [rules, setRules] = useState<PromoRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [editingRule, setEditingRule] = useState<PromoRule | null>(null)

  // Heatmap data
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapAnalytics()

  // --------------------------------------------------
  // Load rules
  // --------------------------------------------------
  const loadRules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings/promotional-slots')
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setRules(Array.isArray(data.rules) ? data.rules : [])
    } catch {
      toast.error('No se pudieron cargar las reglas de promoción')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadRules()
  }, [loadRules])

  // --------------------------------------------------
  // Rule mutations (local state only — marks dirty)
  // --------------------------------------------------
  const handleToggle = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
    setDirty(true)
  }

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
    setDirty(true)
  }

  const handleOpenEdit = (rule: PromoRule) => {
    setEditingRule(rule)
  }

  const handleOpenNew = () => {
    setEditingRule(makeEmptyRule())
  }

  const handleModalClose = () => {
    setEditingRule(null)
  }

  const handleModalSave = (draft: PromoRule) => {
    const { valid, errors } = validatePromoRules([draft])
    if (!valid) {
      toast.error(errors[0])
      return
    }

    setRules((prev) => {
      const exists = prev.some((r) => r.id === draft.id)
      if (exists) {
        return prev.map((r) => (r.id === draft.id ? draft : r))
      }
      return [...prev, draft]
    })
    setDirty(true)
    setEditingRule(null)
  }

  // --------------------------------------------------
  // Save all rules to API
  // --------------------------------------------------
  const handleSave = async () => {
    const { valid, errors, warnings } = validatePromoRules(rules)
    if (!valid) {
      toast.error(errors[0])
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/settings/promotional-slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body?.error ?? 'Error al guardar las reglas')
        return
      }

      const body = await res.json()
      if (body?.warnings?.length) {
        body.warnings.forEach((w: string) => toast.warning(w))
      } else if (warnings.length) {
        warnings.forEach((w) => toast.warning(w))
      }

      setDirty(false)
      toast.success('Reglas de promoción guardadas')
    } catch {
      toast.error('Error de conexión al guardar')
    } finally {
      setSaving(false)
    }
  }

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------
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

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <ComponentErrorBoundary
      fallbackTitle="Error en Promociones"
      fallbackDescription="Ocurrió un error al cargar la página de reglas de promoción"
    >
      <div className="min-h-screen pb-32 lg:pb-10">
        {/* Header */}
        <FadeInUp>
          <SettingsSubrouteHeader
            title="Promociones"
            subtitle="Descuentos automáticos por horario de baja demanda"
          />
        </FadeInUp>

        <div className="space-y-8 max-w-3xl mx-auto">
          {/* ── Section 1: Demand Heatmap ── */}
          <FadeInUp delay={0.04}>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="px-4 pt-4 pb-2 sm:px-5 sm:pt-5">
                <div className="flex items-center gap-2 mb-0.5">
                  <Tag className="h-4 w-4 text-orange-500 shrink-0" aria-hidden="true" />
                  <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                    Demanda por Horario
                  </h3>
                </div>
                <p className="text-[13px] text-muted">Últimos 90 días</p>
              </div>

              <ComponentErrorBoundary
                fallbackTitle="Error al cargar mapa de calor"
                fallbackDescription="No se pudo renderizar el mapa de demanda"
              >
                {heatmapLoading || !heatmapData ? (
                  <HeatmapSkeleton />
                ) : (
                  <DemandHeatmap
                    cells={heatmapData.cells}
                    maxCount={heatmapData.maxCount}
                    operatingHours={heatmapData.operatingHours}
                    promoRules={rules}
                    compact
                  />
                )}
              </ComponentErrorBoundary>
            </div>
          </FadeInUp>

          {/* ── Section 2: Rules Management ── */}
          <FadeInUp delay={0.08}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                    Reglas de Descuento
                  </h3>
                  <p className="text-[13px] text-muted mt-0.5">
                    {rules.length === 0
                      ? 'Sin reglas configuradas'
                      : `${rules.filter((r) => r.enabled).length} de ${rules.length} activas`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleOpenNew}
                  className="h-11 gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nueva regla</span>
                  <span className="sm:hidden">Nueva</span>
                </Button>
              </div>

              {/* Empty state */}
              {rules.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center mb-3">
                    <Tag className="h-6 w-6 text-orange-400" aria-hidden="true" />
                  </div>
                  <p className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300">
                    Sin reglas de promoción
                  </p>
                  <p className="text-[13px] text-muted mt-1 max-w-xs">
                    Crea una regla para ofrecer descuentos automáticos en horarios de baja demanda.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleOpenNew}
                    className="mt-5 h-11 gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    Crear primera regla
                  </Button>
                </motion.div>
              ) : (
                /* Rule cards list */
                <AnimatePresence mode="popLayout" initial={false}>
                  <div className="space-y-2">
                    {rules.map((rule) => (
                      <RuleCard
                        key={rule.id}
                        rule={rule}
                        onToggle={handleToggle}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </FadeInUp>
        </div>

        {/* ── Sticky Save Button (visible only when dirty) ── */}
        <AnimatePresence>
          {dirty && (
            <motion.div
              key="sticky-save"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-20 lg:bottom-6 left-0 right-0 lg:left-64 px-4 lg:px-8 z-30 pointer-events-none"
            >
              <div className="max-w-3xl mx-auto pointer-events-auto">
                <Button
                  type="button"
                  onClick={handleSave}
                  isLoading={saving}
                  className="w-full h-12 text-[15px] font-semibold shadow-lg"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Guardar cambios
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Edit / New Rule Modal ── */}
        {/* key={editingRule?.id} remounts EditModal for each rule so the
            useState initializer always runs with the correct rule data. */}
        <EditModal
          key={editingRule?.id ?? 'none'}
          rule={editingRule}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      </div>
    </ComponentErrorBoundary>
  )
}
