import { Scissors, Clock, ChevronRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Service } from '@/types'

// Service color palette
const SERVICE_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
]

interface ServiceSelectionProps {
  services: Service[]
  noBarbers: boolean
  onSelectService: (service: Service) => void
}

export function ServiceSelection({ services, noBarbers, onSelectService }: ServiceSelectionProps) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="px-1">
        <h2 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
          Elige servicio
        </h2>
        <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
          Selecciona el servicio que deseas reservar
        </p>
      </div>
      {noBarbers && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          Esta barbería aún no tiene barberos configurados. Contacta al negocio para reservar.
        </div>
      )}

      {services.length === 0 ? (
        <div className="ios-card p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <Scissors className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="mt-4 text-[15px] text-zinc-500">No hay servicios disponibles.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service, index) => {
            const colorClass = SERVICE_COLORS[index % SERVICE_COLORS.length]
            return (
              <button
                key={service.id}
                onClick={() => onSelectService(service)}
                disabled={noBarbers}
                className={cn(
                  'ios-card w-full flex items-center gap-4 p-4 text-left ios-press',
                  noBarbers && 'opacity-60 cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl',
                    colorClass
                  )}
                >
                  <Scissors className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[17px] font-semibold text-zinc-900 dark:text-white truncate">
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-zinc-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[20px] font-bold text-zinc-900 dark:text-white">
                    {formatCurrency(Number(service.price))}
                  </p>
                  <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
