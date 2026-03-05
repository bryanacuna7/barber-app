'use client'

import { Banknote, CreditCard, Smartphone } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Modal } from '@/components/ui/modal'
import { useIsMobile } from '@/hooks/use-is-mobile'

export type PaymentMethod = 'cash' | 'sinpe' | 'card'

interface PaymentOption {
  value: PaymentMethod
  label: string
}

interface PaymentMethodPickerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: PaymentOption[]
  onSelect: (method: PaymentMethod) => void
}

const PAYMENT_ICONS: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  sinpe: Smartphone,
  card: CreditCard,
}

/**
 * Centered payment picker used across Mi Día flows.
 * Mobile: bottom Sheet. Desktop: centered Modal.
 */
export function PaymentMethodPickerSheet({
  open,
  onOpenChange,
  options,
  onSelect,
}: PaymentMethodPickerSheetProps) {
  const isMobile = useIsMobile(1024)

  const pickerBody = (
    <div className={isMobile ? 'p-5 sm:p-6' : ''}>
      {isMobile && (
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      )}
      <h2
        className={
          isMobile
            ? 'text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white'
            : 'text-center text-lg font-bold tracking-tight text-zinc-900 dark:text-white'
        }
      >
        ¿Cómo pagó el cliente?
      </h2>

      <div className="mt-5 space-y-2.5">
        {options.map(({ value, label }) => {
          const Icon = PAYMENT_ICONS[value]
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className="group flex w-full items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900 px-4 py-3.5 text-left transition-colors hover:bg-white hover:border-zinc-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-600"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                <Icon className="h-4.5 w-4.5 text-zinc-700 dark:text-zinc-300" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold text-zinc-900 dark:text-white">{label}</span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="mt-3 w-full py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
      >
        Cancelar
      </button>
    </div>
  )

  // Desktop: centered Modal
  if (!isMobile) {
    return (
      <Modal
        isOpen={open}
        onClose={() => onOpenChange(false)}
        title="Método de pago"
        size="sm"
        contentFill={false}
      >
        {pickerBody}
      </Modal>
    )
  }

  // Mobile: bottom Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        centered
        className="w-[calc(100%-1.25rem)] max-w-sm sm:max-w-md p-0 gap-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[0_22px_64px_rgba(15,23,42,0.26)]"
      >
        {pickerBody}
      </SheetContent>
    </Sheet>
  )
}
