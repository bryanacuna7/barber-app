'use client'

import { Modal } from '@/components/ui/modal'
import { ComponentErrorBoundary } from '@/components/error-boundaries'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CreateClientModalProps {
  isOpen: boolean
  onClose: () => void
  formData: { name: string; phone: string; email: string; notes: string }
  setFormData: React.Dispatch<
    React.SetStateAction<{ name: string; phone: string; email: string; notes: string }>
  >
  error: string
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
}

export function CreateClientModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  error,
  onSubmit,
  isPending,
}: CreateClientModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Cliente">
      <ComponentErrorBoundary
        fallbackTitle="Error en formulario"
        fallbackDescription="No se pudo cargar el formulario de nuevo cliente"
        onReset={onClose}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Nombre completo"
            type="text"
            placeholder="Juan Pérez"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />

          <Input
            label="Teléfono"
            type="tel"
            placeholder="87175866"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            required
          />

          <Input
            label="Email (opcional)"
            type="email"
            placeholder="cliente@email.com"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Notas (opcional)</label>
            <textarea
              placeholder="Preferencias, alergias, etc..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isPending} className="flex-1">
              Guardar
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </ComponentErrorBoundary>
    </Modal>
  )
}
