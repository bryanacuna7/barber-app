import { Scissors, ChevronLeft, Clock, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'
import { computeDiscountedPrice } from '@/lib/promo-engine'
import type { Service } from '@/types'
import type { EnrichedTimeSlot } from '@/types/api'

interface DateTimeSelectionProps {
  service: Service
  availableDates: Date[]
  selectedDate: Date | null
  selectedTime: EnrichedTimeSlot | null
  slots: EnrichedTimeSlot[]
  loadingSlots: boolean
  barberCount: number
  onSelectDate: (date: Date) => void
  onSelectTime: (slot: EnrichedTimeSlot) => void
  onBack: () => void
}

export function DateTimeSelection({
  service,
  availableDates,
  selectedDate,
  selectedTime,
  slots,
  loadingSlots,
  barberCount,
  onSelectDate,
  onSelectTime,
  onBack,
}: DateTimeSelectionProps) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
      <button
        onClick={onBack}
        data-testid="back-button"
        className="inline-flex items-center gap-1 text-[15px] font-medium text-blue-500 ios-press"
      >
        <ChevronLeft className="h-5 w-5 -ml-1" />
        {barberCount > 1 ? 'Barbero' : 'Servicios'}
      </button>

      {/* Selected Service */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            <Scissors className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-zinc-900 dark:text-white">{service.name}</p>
            {selectedTime?.discount ? (
              <p className="text-sm">
                <span className="text-zinc-400 line-through">
                  {formatCurrency(Number(service.price))}
                </span>{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(
                    computeDiscountedPrice(Number(service.price), selectedTime.discount)
                  )}
                </span>
                <span className="text-zinc-500"> · {service.duration_minutes} min</span>
              </p>
            ) : (
              <p className="text-sm text-zinc-500">
                {service.duration_minutes} min · {formatCurrency(Number(service.price))}
              </p>
            )}
          </div>
          {selectedTime?.discount && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Tag className="h-3 w-3" />
              {selectedTime.discount.type === 'percent'
                ? `-${selectedTime.discount.value}%`
                : `-${formatCurrency(selectedTime.discount.value)}`}
            </span>
          )}
        </CardContent>
      </Card>

      {/* Date Selection - Horizontal Scroll */}
      <div data-testid="date-picker">
        <h3 className="mb-4 px-1 text-[13px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Selecciona el día
        </h3>
        <div className="relative -mx-4 sm:mx-0">
          {/* Scroll fade indicators */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#F2F2F7] dark:from-[#1C1C1E] to-transparent z-10" />

          <div className="flex gap-2.5 overflow-x-auto pb-3 px-4 sm:px-0 snap-x snap-mandatory">
            {availableDates.map((date) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString()
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => onSelectDate(date)}
                  data-testid="date-cell"
                  data-date={format(date, 'yyyy-MM-dd')}
                  className={cn(
                    'relative flex min-w-[68px] flex-col items-center rounded-2xl px-3 py-3 transition-all ios-press flex-shrink-0 snap-start',
                    isSelected
                      ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-900/30 dark:bg-white dark:text-zinc-900 dark:shadow-white/20'
                      : 'bg-white dark:bg-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-700/80',
                    isToday && 'mt-2'
                  )}
                >
                  {isToday && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm whitespace-nowrap">
                      Hoy
                    </span>
                  )}
                  <span
                    className={cn(
                      'text-[11px] font-semibold uppercase tracking-wide',
                      isSelected ? 'opacity-80' : 'text-zinc-400 dark:text-zinc-500'
                    )}
                  >
                    {format(date, 'EEE', { locale: es })}
                  </span>
                  <span className="mt-1 text-[28px] font-bold leading-none">
                    {format(date, 'd')}
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 text-[11px] font-medium uppercase',
                      isSelected ? 'opacity-70' : 'text-zinc-400 dark:text-zinc-500'
                    )}
                  >
                    {format(date, 'MMM', { locale: es })}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Time Selection - iOS Grid */}
      {selectedDate && (
        <div>
          <h3 className="mb-4 px-1 text-[13px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Selecciona la hora
          </h3>
          {loadingSlots ? (
            <div className="flex justify-center py-12" data-testid="slots-loading">
              <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
            </div>
          ) : slots.length === 0 ? (
            <div className="ios-card p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                <Clock className="h-7 w-7 text-zinc-400" />
              </div>
              <p className="mt-4 text-[15px] text-zinc-500">
                No hay horarios disponibles para este día.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {slots.map((slot) => {
                const hasDiscount = slot.available && slot.discount
                const isSelected = selectedTime?.datetime === slot.datetime

                return (
                  <button
                    key={slot.datetime}
                    onClick={() => slot.available && onSelectTime(slot)}
                    disabled={!slot.available}
                    data-testid="time-slot"
                    className={cn(
                      'relative rounded-2xl py-4 text-[15px] font-semibold transition-all',
                      !slot.available
                        ? 'cursor-not-allowed bg-zinc-100 text-zinc-400 line-through dark:bg-zinc-800/50 dark:text-zinc-600'
                        : isSelected
                          ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-900/30 dark:bg-white dark:text-zinc-900'
                          : hasDiscount
                            ? 'bg-emerald-50 text-zinc-900 ring-1 ring-emerald-200 ios-press dark:bg-emerald-900/20 dark:text-white dark:ring-emerald-800'
                            : 'bg-white text-zinc-900 ios-press dark:bg-zinc-800 dark:text-white'
                    )}
                  >
                    {slot.time}
                    {hasDiscount && (
                      <span
                        className={cn(
                          'absolute -top-1.5 -right-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow-sm',
                          isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-500 text-white'
                        )}
                      >
                        {slot.discount!.type === 'percent'
                          ? `-${slot.discount!.value}%`
                          : `-₡${slot.discount!.value}`}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
