import { Scissors, ChevronLeft, ChevronRight, UserRound } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Service, Barber } from '@/types'

interface BarberSelectionProps {
  service: Service
  barbers: Barber[]
  onSelectBarber: (barber: Barber) => void
  onBack: () => void
}

export function BarberSelection({
  service,
  barbers,
  onSelectBarber,
  onBack,
}: BarberSelectionProps) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[15px] font-medium text-blue-500 ios-press"
      >
        <ChevronLeft className="h-5 w-5 -ml-1" />
        Servicios
      </button>

      {/* Selected Service */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            <Scissors className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-zinc-900 dark:text-white">{service.name}</p>
            <p className="text-sm text-zinc-500">
              {service.duration_minutes} min · {formatCurrency(Number(service.price))}
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Elige tu barbero</h2>
        <p className="mt-1 text-zinc-500">Selecciona quién te atenderá</p>
      </div>

      <div className="space-y-3">
        {barbers.map((barber) => (
          <button
            key={barber.id}
            onClick={() => onSelectBarber(barber)}
            className="ios-card w-full flex items-center gap-4 p-4 text-left ios-press"
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 overflow-hidden">
              {barber.photo_url ? (
                <img
                  src={barber.photo_url}
                  alt={barber.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <UserRound className="h-8 w-8 text-zinc-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-semibold text-zinc-900 dark:text-white">
                {barber.name}
              </p>
              {barber.bio && (
                <p className="mt-0.5 text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {barber.bio}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
          </button>
        ))}
      </div>
    </div>
  )
}
