'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, Clock, MousePointer2, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-black dark:to-blue-950/20">
      {/* Soft gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/2 h-[800px] w-[800px] rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/5" />
        <div className="absolute -right-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-500/5" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/5" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
        {/* Top Badge - Modern Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600/90 to-purple-600/90 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-sm"
        >
          <Zap className="h-4 w-4" />7 días gratis · Sin tarjeta
        </motion.div>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Copy */}
          <div className="flex flex-col justify-center">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl"
            >
              El calendario más{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                rápido e intuitivo
              </span>{' '}
              para barberías
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl"
            >
              Gestiona tu agenda en{' '}
              <span className="font-semibold text-zinc-900 dark:text-white">0.2 segundos</span> con
              drag & drop. Sincronización en tiempo real. Cero errores.
            </motion.p>

            {/* Key Features - Clean badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {[
                { icon: MousePointer2, text: '0.2s drag & drop' },
                { icon: Clock, text: 'Vista semanal clara' },
                { icon: Calendar, text: 'Real-time sync' },
              ].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.text}
                    className="flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 shadow-sm backdrop-blur-sm dark:bg-zinc-900/60"
                  >
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {feature.text}
                    </span>
                  </div>
                )
              })}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/40"
              >
                Empezar gratis
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-zinc-200 bg-white/80 px-8 py-4 text-base font-semibold text-zinc-900 backdrop-blur-sm transition-all hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-white dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                Ver cómo funciona
              </Link>
            </motion.div>

            {/* Social Proof - Modern Premium */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center gap-8"
            >
              {[
                { value: '150+', label: 'Barberías activas' },
                { value: '500+', label: 'Citas diarias' },
                { value: '0.2s', label: 'Tiempo de respuesta', highlight: true },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    className={`text-3xl font-bold ${
                      stat.highlight
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                        : 'text-zinc-900 dark:text-white'
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Product Demo Visual - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-blue-200/40 via-purple-200/30 to-pink-200/40 blur-3xl dark:from-blue-800/20 dark:via-purple-800/15 dark:to-pink-800/20" />

            {/* Glass Calendar Frame */}
            <div className="relative overflow-hidden rounded-3xl border border-zinc-200/50 bg-white/90 p-6 shadow-2xl backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-900/80">
              {/* Header */}
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-zinc-50 to-zinc-100 p-4 dark:from-zinc-800 dark:to-zinc-900">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">Lunes 3 Feb</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Vista del día</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    En vivo
                  </span>
                </div>
              </div>

              {/* Calendar Slots */}
              <div className="mt-4 space-y-2">
                {[
                  {
                    time: '09:00',
                    client: 'Carlos M.',
                    service: 'Corte + Barba',
                    color: 'from-blue-500 to-blue-600',
                    delay: 0.4,
                  },
                  {
                    time: '10:00',
                    client: null,
                    service: 'Disponible',
                    color: 'dashed',
                    delay: 0.5,
                  },
                  {
                    time: '11:00',
                    client: 'Andrea R.',
                    service: 'Fade Premium',
                    color: 'from-purple-500 to-purple-600',
                    delay: 0.6,
                  },
                  {
                    time: '12:00',
                    client: null,
                    service: 'Disponible',
                    color: 'dashed',
                    delay: 0.7,
                  },
                  {
                    time: '14:00',
                    client: 'Luis P.',
                    service: 'Color + Diseño',
                    color: 'from-orange-500 to-red-500',
                    delay: 0.8,
                  },
                ].map((slot) => (
                  <motion.div
                    key={slot.time}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: slot.delay }}
                    className="flex gap-3"
                  >
                    {/* Time */}
                    <div className="flex w-16 items-center justify-center rounded-xl bg-zinc-100 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <span className="text-sm">{slot.time}</span>
                    </div>

                    {/* Appointment Card */}
                    {slot.client ? (
                      <div
                        className={`group flex-1 cursor-move rounded-xl bg-gradient-to-r ${slot.color} p-4 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl`}
                      >
                        <p className="font-semibold text-white">{slot.client}</p>
                        <p className="mt-1 text-sm text-white/80">{slot.service}</p>
                      </div>
                    ) : (
                      <div className="flex-1 cursor-pointer rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-4 transition-all hover:border-zinc-400 hover:bg-zinc-100/50 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50">
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                          {slot.service}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Action Hint */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-3 text-center dark:from-blue-950/30 dark:to-purple-950/30"
              >
                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  ↑ Arrastra para reorganizar · Click para editar
                </p>
              </motion.div>
            </div>

            {/* Floating Speed Badge - Modern Premium */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -right-4 -top-4 rounded-2xl border border-red-200 bg-gradient-to-br from-red-500 to-red-600 px-5 py-3 shadow-2xl dark:border-red-800"
            >
              <p className="text-3xl font-bold text-white">0.2s</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/90">
                Drag & Drop
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
