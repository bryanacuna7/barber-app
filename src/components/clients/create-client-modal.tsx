'use client'

import { X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ComponentErrorBoundary } from '@/components/error-boundaries'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-is-mobile'

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
  const isMobile = useIsMobile(1024)

  // ── Mobile form body: borderless inputs, single Guardar CTA (matches citas) ──
  const mobileFormBody = (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Nombre completo</label>
        <input
          type="text"
          placeholder="Juan Pérez"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
          className="h-11 w-full rounded-xl bg-zinc-100 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Teléfono</label>
        <input
          type="tel"
          placeholder="87175866"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          required
          className="h-11 w-full rounded-xl bg-zinc-100 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Email (opcional)</label>
        <input
          type="email"
          placeholder="cliente@email.com"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          className="h-11 w-full rounded-xl bg-zinc-100 px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">Notas (opcional)</label>
        <textarea
          placeholder="Preferencias, alergias, etc..."
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          className="w-full resize-none rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white"
          rows={3}
        />
      </div>

      <div className="mt-2 pt-1">
        <Button type="submit" isLoading={isPending} className="h-11 w-full">
          Guardar
        </Button>
      </div>
    </form>
  )

  // ── Desktop form body: Input components with borders, Cancelar + Guardar ──
  const desktopFormBody = (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
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
          className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onClose} className="h-11 text-muted">
          Cancelar
        </Button>
        <Button type="submit" isLoading={isPending} className="h-11">
          Guardar
        </Button>
      </div>
    </form>
  )

  return (
    <ComponentErrorBoundary
      fallbackTitle="Error en formulario"
      fallbackDescription="No se pudo cargar el formulario de nuevo cliente"
      onReset={onClose}
    >
      {/* Desktop: centered Modal */}
      {!isMobile && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Nuevo Cliente"
          description="Agrega datos de contacto y notas para seguimiento"
        >
          {desktopFormBody}
        </Modal>
      )}

      {/* Mobile: bottom Sheet (matches citas pattern) */}
      {isMobile && (
        <Sheet
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) onClose()
          }}
        >
          <SheetContent
            side="bottom"
            className="!gap-0 !p-0 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex-shrink-0 pt-2 pb-1">
              <div className="mx-auto h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="text-lg font-semibold text-foreground">Nuevo Cliente</h2>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors active:scale-95 hover:text-zinc-200 focus:outline-none"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] [-webkit-overflow-scrolling:touch]">
              {mobileFormBody}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </ComponentErrorBoundary>
  )
}
