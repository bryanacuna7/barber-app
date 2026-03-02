'use client'

import { AlertTriangle, Users, Check } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet'
import { segmentConfig } from '@/components/clients/segment-config'
import {
  DEFAULT_CLIENT_FILTERS,
  FREQUENCY_OPTIONS,
  SPEND_RANGE_OPTIONS,
  VISIT_RECENCY_OPTIONS,
  countActiveClientFilters,
  type ClientFilters,
  type ClientSegmentFilter,
} from '@/lib/utils/client-filters'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import type { ClientMetrics } from '@/hooks/queries/useClientMetrics'

interface ClientSegmentSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  filters: ClientFilters
  onFiltersChange: (filters: ClientFilters) => void
  metrics: ClientMetrics
}

export function ClientSegmentSheet({
  isOpen,
  onOpenChange,
  filters,
  onFiltersChange,
  metrics,
}: ClientSegmentSheetProps) {
  const activeFilters = countActiveClientFilters(filters)

  function updateFilters(partial: Partial<ClientFilters>) {
    onFiltersChange({ ...filters, ...partial })
    if (isMobileDevice()) haptics.selection()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" centered>
        <SheetClose onClose={() => onOpenChange(false)} />
        <SheetHeader>
          <SheetTitle>Filtros de Clientes</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Segmento
            </p>
            <div className="space-y-1">
              <button
                onClick={() => updateFilters({ segment: 'all' })}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[44px] transition-colors ${
                  filters.segment === 'all'
                    ? 'bg-zinc-100 dark:bg-zinc-800'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Users className="h-5 w-5 text-muted" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">Todos</p>
                  <p className="text-xs text-muted">{metrics.total} clientes</p>
                </div>
                {filters.segment === 'all' && (
                  <Check className="h-4 w-4 text-[var(--brand-primary)]" />
                )}
              </button>
              {(Object.keys(segmentConfig) as Array<keyof typeof segmentConfig>).map((segment) => {
                const config = segmentConfig[segment]
                const count = metrics.segments[segment]
                const Icon = config.icon
                return (
                  <button
                    key={segment}
                    onClick={() => updateFilters({ segment: segment as ClientSegmentFilter })}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[44px] transition-colors ${
                      filters.segment === segment
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
                    {filters.segment === segment && (
                      <Check className="h-4 w-4 text-[var(--brand-primary)]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Última visita
            </p>
            <div className="flex flex-wrap gap-2">
              {VISIT_RECENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ visitRecency: option.value })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    filters.visitRecency === option.value
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/12 text-foreground'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 text-muted'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Gasto total
            </p>
            <div className="flex flex-wrap gap-2">
              {SPEND_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ spendRange: option.value })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    filters.spendRange === option.value
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/12 text-foreground'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 text-muted'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Frecuencia
            </p>
            <div className="flex flex-wrap gap-2">
              {FREQUENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilters({ frequency: option.value })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    filters.frequency === option.value
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/12 text-foreground'
                      : 'border-zinc-200/80 dark:border-zinc-800/80 text-muted'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => updateFilters({ highRiskOnly: !filters.highRiskOnly })}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
              filters.highRiskOnly
                ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/12 text-foreground'
                : 'border-zinc-200/80 dark:border-zinc-800/80 text-muted'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Alto riesgo de pérdida</span>
            {filters.highRiskOnly && (
              <Check className="ml-auto h-4 w-4 text-[var(--brand-primary)]" />
            )}
          </button>

          {activeFilters > 0 && (
            <button
              onClick={() => onFiltersChange(DEFAULT_CLIENT_FILTERS)}
              className="w-full rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 px-4 py-3 text-sm font-medium text-muted hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
