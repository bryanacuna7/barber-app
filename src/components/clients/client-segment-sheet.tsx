'use client'

import { Users, Check } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { segmentConfig } from '@/components/clients/segment-config'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import type { ClientMetrics } from '@/hooks/queries/useClientMetrics'

type ClientSegment = 'all' | 'vip' | 'frequent' | 'new' | 'inactive'

interface ClientSegmentSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedSegment: ClientSegment
  onSegmentChange: (segment: ClientSegment) => void
  metrics: ClientMetrics
}

export function ClientSegmentSheet({
  isOpen,
  onOpenChange,
  selectedSegment,
  onSegmentChange,
  metrics,
}: ClientSegmentSheetProps) {
  function selectSegment(segment: ClientSegment) {
    onSegmentChange(segment)
    onOpenChange(false)
    if (isMobileDevice()) haptics.selection()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" centered>
        <SheetClose onClose={() => onOpenChange(false)} />
        <SheetHeader>
          <SheetTitle>Filtrar por Segmento</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-1">
          {/* "Todos" option */}
          <button
            onClick={() => selectSegment('all')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[44px] transition-colors ${
              selectedSegment === 'all'
                ? 'bg-zinc-100 dark:bg-zinc-800'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Users className="h-5 w-5 text-muted" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">Todos</p>
              <p className="text-xs text-muted">{metrics.total} clientes</p>
            </div>
            {selectedSegment === 'all' && <Check className="h-4 w-4 text-[var(--brand-primary)]" />}
          </button>
          {/* Segment options */}
          {(Object.keys(segmentConfig) as Array<keyof typeof segmentConfig>).map((segment) => {
            const config = segmentConfig[segment]
            const count = metrics.segments[segment]
            const Icon = config.icon
            return (
              <button
                key={segment}
                onClick={() => selectSegment(segment)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[44px] transition-colors ${
                  selectedSegment === segment
                    ? 'bg-zinc-100 dark:bg-zinc-800'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="h-5 w-5 text-muted" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{config.label}</p>
                  <p className="text-xs text-muted">
                    {config.description} ({count})
                  </p>
                </div>
                {selectedSegment === segment && (
                  <Check className="h-4 w-4 text-[var(--brand-primary)]" />
                )}
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
