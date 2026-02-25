'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check, Calendar, Users, BarChart3 } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-b from-white via-white to-zinc-50/80 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/80">
      {/* Subtle gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-blue-100/40 blur-3xl dark:bg-blue-900/10" />
        <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-purple-100/30 blur-3xl dark:bg-purple-900/10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-16 sm:pt-32 lg:pt-36">
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center lg:justify-start"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            <Check className="h-3.5 w-3.5" />7 dias gratis · Sin tarjeta de credito
          </div>
        </motion.div>

        <div className="mt-8 grid items-center gap-16 lg:grid-cols-2">
          {/* Left: Copy + CTAs */}
          <div className="text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl font-bold leading-[1.1] tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl"
            >
              Tu barberia,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                siempre llena
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 lg:mx-0"
            >
              Olvida el WhatsApp y las agendas de papel. BarberApp llena tu calendario con reservas
              automaticas, recordatorios y pagos — todo en un solo lugar.
            </motion.p>

            {/* Quick benefits */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400 lg:justify-start"
            >
              {['Reservas en linea 24/7', 'Recordatorios automaticos', 'Cero doble-reservas'].map(
                (benefit) => (
                  <span key={benefit} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    {benefit}
                  </span>
                )
              )}
            </motion.div>

            {/* CTAs - Very Clear */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="/register"
                className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/20 transition-all hover:shadow-2xl hover:shadow-blue-500/35 sm:w-auto"
              >
                Registrar mi barberia
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-8 py-4 text-base font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 sm:w-auto"
              >
                Ya tengo cuenta
              </Link>
            </motion.div>

            {/* Social Proof - Inline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-10 flex items-center justify-center gap-6 lg:justify-start"
            >
              <div className="flex -space-x-2">
                {['CR', 'AM', 'DC', 'LM'].map((initials, i) => (
                  <div
                    key={initials}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-purple-500 text-[10px] font-bold text-white dark:border-zinc-900"
                    style={{ zIndex: 4 - i }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-white">150+</span> barberias
                activas en Costa Rica
              </div>
            </motion.div>
          </div>

          {/* Right: Product Preview - Simplified & Clean */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            {/* Glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-100/60 via-purple-100/40 to-pink-100/60 blur-2xl dark:from-blue-900/15 dark:via-purple-900/10 dark:to-pink-900/15" />

            {/* App Preview Card */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-2xl dark:border-zinc-800/70 dark:bg-zinc-900">
              {/* App Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Mi dia - Lunes 3 Feb
                  </span>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  En vivo
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-px bg-zinc-100 dark:bg-zinc-800">
                {[
                  { icon: Calendar, label: 'Citas hoy', value: '8' },
                  { icon: Users, label: 'Clientes', value: '245' },
                  { icon: BarChart3, label: 'Ingresos', value: '₡85k' },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="bg-white px-4 py-3 dark:bg-zinc-900">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                          {stat.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Appointment Cards */}
              <div className="space-y-2 p-4">
                {[
                  {
                    time: '09:00',
                    client: 'Carlos M.',
                    service: 'Corte + Barba',
                    status: 'confirmed',
                    color: 'bg-blue-500',
                  },
                  {
                    time: '10:00',
                    client: 'Andrea R.',
                    service: 'Fade Premium',
                    status: 'confirmed',
                    color: 'bg-purple-500',
                  },
                  {
                    time: '11:30',
                    client: 'Luis P.',
                    service: 'Color + Diseno',
                    status: 'pending',
                    color: 'bg-amber-500',
                  },
                ].map((appt, i) => (
                  <motion.div
                    key={appt.time}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <div className={`h-10 w-1 rounded-full ${appt.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                          {appt.client}
                        </span>
                        <span className="text-xs text-zinc-500">{appt.time}</span>
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {appt.service}
                      </span>
                    </div>
                    <div
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        appt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {appt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </div>
                  </motion.div>
                ))}

                {/* Empty slot */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.4 }}
                  className="flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 p-3 dark:border-zinc-700"
                >
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    12:00 — Disponible · Click para agendar
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
