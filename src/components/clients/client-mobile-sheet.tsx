'use client'

import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { formatCurrencyCompact } from '@/lib/utils'
import type { Client } from '@/types'

interface ClientMobileSheetProps {
  client: Client | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientMobileSheet({ client, isOpen, onOpenChange }: ClientMobileSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="lg:hidden rounded-t-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 pb-safe"
      >
        <SheetClose onClose={() => onOpenChange(false)} />
        {client && (
          <>
            <SheetHeader>
              <SheetTitle className="text-foreground text-lg font-semibold">
                {client.name}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {/* Contact info */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-xl font-bold text-white">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-base text-foreground">{client.name}</p>
                  {client.phone && <p className="text-sm text-muted">{client.phone}</p>}
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
                  <p className="text-xs text-muted mb-1">Gastado</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrencyCompact(Number(client.total_spent || 0))}
                  </p>
                </div>
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
                  <p className="text-xs text-muted mb-1">Visitas</p>
                  <p className="text-lg font-bold text-foreground">{client.total_visits || 0}</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-3">
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    Llamar
                  </a>
                )}
                <Button
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 flex items-center justify-center gap-2 h-12"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
