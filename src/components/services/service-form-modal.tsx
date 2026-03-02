'use client'

/**
 * ServiceFormModal
 *
 * Extracted from src/app/(dashboard)/servicios/page.tsx (lines 1277–1514).
 *
 * Usage:
 * ```tsx
 * <ServiceFormModal
 *   isOpen={showForm}
 *   onClose={resetForm}
 *   title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
 *   formData={formData}
 *   setFormData={setFormData}
 *   error={error}
 *   onSubmit={handleSubmit}
 *   isPending={createService.isPending || updateService.isPending}
 *   isEditing={!!editingService}
 *   onCategoryChange={handleCategoryChange}
 * />
 * ```
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scissors, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { animations } from '@/lib/design-system'
import {
  type ServiceCategory,
  type ServiceIconName,
  CATEGORY_LABELS,
  SERVICE_ICON_NAMES,
  SERVICE_ICON_LABELS,
  SERVICE_ICON_MAP,
  DEFAULT_ICON_BY_CATEGORY,
  parseDigits,
  formatWithThousands,
} from './service-types'

// ============================================================================
// Types
// ============================================================================

export interface ServiceFormData {
  name: string
  description: string
  category: ServiceCategory
  icon: ServiceIconName
  duration: number
  price: number
  business_id: string | null
}

export interface ServiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  formData: ServiceFormData
  setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>
  error: string
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  isEditing: boolean
  onCategoryChange: (category: ServiceCategory) => void
}

// ============================================================================
// Component
// ============================================================================

export function ServiceFormModal({
  isOpen,
  onClose,
  title,
  formData,
  setFormData,
  error,
  onSubmit,
  isPending,
  isEditing,
  onCategoryChange,
}: ServiceFormModalProps) {
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false)

  const SelectedFormIcon = SERVICE_ICON_MAP[formData.icon] || Scissors

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-red-50 p-4 text-base text-red-600 dark:bg-red-900/20 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}

        <Input
          label="Nombre del servicio"
          type="text"
          placeholder="Ej: Corte de cabello"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
        />

        <Input
          label="Descripción (opcional)"
          type="text"
          placeholder="Ej: Incluye lavado y peinado"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted">
            Categoría
          </label>
          <div
            role="radiogroup"
            aria-label="Seleccionar categoría"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((category) => {
              const isSelected = formData.category === category
              const CategoryIcon = SERVICE_ICON_MAP[DEFAULT_ICON_BY_CATEGORY[category]] || Scissors
              return (
                <button
                  key={category}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onCategoryChange(category)}
                  className={`flex h-12 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isSelected
                      ? 'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-950/40 dark:text-violet-300'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
                  }`}
                >
                  <CategoryIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{CATEGORY_LABELS[category]}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted">
            Ícono
          </label>
          {/* Mobile: collapsible picker */}
          <div className="sm:hidden space-y-2">
            <button
              type="button"
              aria-expanded={isIconPickerOpen}
              aria-controls="mobile-icon-picker"
              onClick={() => setIsIconPickerOpen((prev) => !prev)}
              className="flex h-12 w-full items-center justify-between rounded-[14px] border border-zinc-200 bg-white px-3 text-zinc-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                  <SelectedFormIcon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium">{SERVICE_ICON_LABELS[formData.icon]}</span>
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isIconPickerOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isIconPickerOpen && (
                <motion.div
                  id="mobile-icon-picker"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={animations.spring.snappy}
                  className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <div
                    role="radiogroup"
                    aria-label="Seleccionar ícono"
                    className="grid grid-cols-4 gap-2"
                  >
                    {SERVICE_ICON_NAMES.map((iconName) => {
                      const isSelected = formData.icon === iconName
                      const Icon = SERVICE_ICON_MAP[iconName]
                      return (
                        <button
                          key={iconName}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={SERVICE_ICON_LABELS[iconName]}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, icon: iconName }))
                            setIsIconPickerOpen(false)
                          }}
                          className={`flex h-16 flex-col items-center justify-center gap-1 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                            isSelected
                              ? 'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-950/40 dark:text-violet-300'
                              : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span className="text-[10px] font-medium leading-none">
                            {SERVICE_ICON_LABELS[iconName]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop: always-visible grid */}
          <div
            role="radiogroup"
            aria-label="Seleccionar ícono"
            className="hidden sm:grid grid-cols-4 gap-2"
          >
            {SERVICE_ICON_NAMES.map((iconName) => {
              const isSelected = formData.icon === iconName
              const Icon = SERVICE_ICON_MAP[iconName]
              return (
                <button
                  key={iconName}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={SERVICE_ICON_LABELS[iconName]}
                  onClick={() => setFormData((prev) => ({ ...prev, icon: iconName }))}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isSelected
                      ? 'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500 dark:bg-violet-950/40 dark:text-violet-300'
                      : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[10px] font-medium leading-none">
                    {SERVICE_ICON_LABELS[iconName]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted">
              Duración (min)
            </label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="next"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: Math.min(480, parseDigits(e.target.value)),
                }))
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-muted">
              Precio (CRC)
            </label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="done"
              value={formatWithThousands(formData.price)}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: parseDigits(e.target.value),
                }))
              }
              required
            />
          </div>
        </div>

        <div className="sticky bottom-0 -mx-5 mt-2 border-t border-zinc-200/80 bg-white/95 px-5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/95 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-0">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending} className="h-11 w-full sm:w-auto">
              <span className="sm:hidden">{isEditing ? 'Actualizar' : 'Crear'}</span>
              <span className="hidden sm:inline">
                {isEditing ? 'Actualizar' : 'Crear'} Servicio
              </span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
