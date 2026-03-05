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
import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useMediaQuery } from '@/hooks/useMediaQuery'
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
  const [showDescription, setShowDescription] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // ── Desktop form (full fields) ──────────────────────────────
  const desktopFormContent = (
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
          className="grid grid-cols-4 gap-2"
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
        <div role="radiogroup" aria-label="Seleccionar ícono" className="grid grid-cols-4 gap-2">
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
                    : 'border-zinc-200 bg-white text-muted hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
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

      <div className="grid grid-cols-2 gap-4">
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

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="h-11 w-auto">
          Cancelar
        </Button>
        <Button type="submit" isLoading={isPending} className="h-11 w-auto">
          {isEditing ? 'Actualizar' : 'Crear'} Servicio
        </Button>
      </div>
    </form>
  )

  if (isDesktop) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        {desktopFormContent}
      </Modal>
    )
  }

  // ── Mobile: compact sheet (no scroll needed) ────────────────
  const hasDescription = !!formData.description
  const showDescriptionField = showDescription || hasDescription || isEditing

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          setShowDescription(false)
        }
      }}
    >
      <SheetContent side="bottom">
        <SheetClose onClose={onClose} />
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <form id="service-form" onSubmit={onSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Name */}
          <Input
            type="text"
            placeholder="Nombre del servicio"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          {/* Description — expandable */}
          <AnimatePresence initial={false}>
            {showDescriptionField ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={animations.spring.snappy}
                className="overflow-hidden"
              >
                <Input
                  type="text"
                  placeholder="Descripción (opcional)"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </motion.div>
            ) : (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowDescription(true)}
                className="text-sm font-medium text-violet-600 dark:text-violet-400 -mt-1"
              >
                + Agregar descripción
              </motion.button>
            )}
          </AnimatePresence>

          {/* Category — horizontal pills */}
          <div
            role="radiogroup"
            aria-label="Seleccionar categoría"
            className="flex gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6"
          >
            {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((category) => {
              const isSelected = formData.category === category
              return (
                <button
                  key={category}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onCategoryChange(category)}
                  className={`h-9 px-3.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 ${
                    isSelected
                      ? 'bg-violet-600 text-white dark:bg-violet-500'
                      : 'bg-zinc-100/70 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              )
            })}
          </div>

          {/* Duration + Price — always side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duración (min)"
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
            <Input
              label="Precio (CRC)"
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
        </form>

        {/* Fixed bottom buttons */}
        <div className="-mx-6 border-t border-zinc-200/80 dark:border-zinc-800/80 px-6 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          <Button type="submit" form="service-form" isLoading={isPending} className="w-full h-11">
            {isEditing ? 'Actualizar Servicio' : 'Crear Servicio'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
