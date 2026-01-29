import { CheckCircle, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Service, Business } from '@/types'

interface BookingSuccessProps {
  service: Service | null
  date: Date | null
  time: string | null
  business: Business | null
}

export function BookingSuccess({ service, date, time, business }: BookingSuccessProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#F2F2F7] dark:bg-[#1C1C1E]">
      <div className="w-full max-w-md ios-card overflow-hidden ios-spring-in">
        {/* Success animation - iOS style */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center text-white">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h2 className="mt-5 text-[28px] font-bold">¡Cita Reservada!</h2>
          <p className="mt-1 text-[15px] text-emerald-100">Te esperamos</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Servicio
            </p>
            <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">
              {service?.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Fecha
              </p>
              <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">
                {date && format(date, "d 'de' MMM", { locale: es })}
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-100/80 p-4 dark:bg-zinc-800/80">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Hora
              </p>
              <p className="mt-1 text-[17px] font-semibold text-zinc-900 dark:text-white">{time}</p>
            </div>
          </div>
          {business?.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-5 py-4 text-[17px] font-semibold text-white ios-press"
            >
              <MessageCircle className="h-5 w-5" />
              Enviar mensaje por WhatsApp
            </a>
          )}
          <p className="text-center text-[13px] text-zinc-500 dark:text-zinc-400">
            Te enviaremos un recordatorio antes de tu cita.
          </p>
        </div>
      </div>
    </div>
  )
}
