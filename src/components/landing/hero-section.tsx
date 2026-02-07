'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, Clock, MousePointer2 } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-white dark:bg-black">
      {/* Brutalist Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-24">
        {/* Top Badge - Brutalist Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 border-4 border-black bg-yellow-400 px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider dark:border-white dark:bg-yellow-500"
        >
          <span className="h-2 w-2 animate-pulse bg-red-600" />7 días gratis · Sin tarjeta
        </motion.div>

        <div className="mt-12 grid gap-16 lg:grid-cols-2 lg:gap-8">
          {/* Left: Copy */}
          <div className="flex flex-col justify-center">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="font-mono text-5xl font-black uppercase leading-[1.1] tracking-tight text-black dark:text-white sm:text-6xl lg:text-7xl"
            >
              El calendario más{' '}
              <span className="relative inline-block">
                <span className="relative z-10">rápido</span>
                <span className="absolute bottom-2 left-0 h-4 w-full bg-yellow-400 dark:bg-yellow-500" />
              </span>{' '}
              para barberías
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 space-y-4 font-mono text-lg font-bold text-black dark:text-white"
            >
              <div className="flex items-start gap-3">
                <MousePointer2 className="mt-1 h-6 w-6 flex-shrink-0" />
                <p>Arrastra y suelta citas en 0.2 segundos</p>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-1 h-6 w-6 flex-shrink-0" />
                <p>Visualiza tu semana completa de un vistazo</p>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-6 w-6 flex-shrink-0" />
                <p>Real-time sync · Nunca más citas duplicadas</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex cursor-pointer items-center justify-center gap-3 border-4 border-black bg-black px-8 py-5 font-mono text-lg font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
              >
                Empezar gratis
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex cursor-pointer items-center justify-center gap-3 border-4 border-black bg-white px-8 py-5 font-mono text-lg font-bold uppercase tracking-wider text-black transition-all hover:bg-black hover:text-white dark:border-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Ver demo
              </Link>
            </motion.div>

            {/* Social Proof - Brutalist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center gap-8 border-t-4 border-black pt-8 dark:border-white"
            >
              <div>
                <p className="font-mono text-4xl font-black text-black dark:text-white">150+</p>
                <p className="mt-1 font-mono text-sm font-bold uppercase text-black/70 dark:text-white/70">
                  Barberías
                </p>
              </div>
              <div>
                <p className="font-mono text-4xl font-black text-black dark:text-white">500+</p>
                <p className="mt-1 font-mono text-sm font-bold uppercase text-black/70 dark:text-white/70">
                  Citas/día
                </p>
              </div>
              <div>
                <p className="font-mono text-4xl font-black text-black dark:text-white">2.3s</p>
                <p className="mt-1 font-mono text-sm font-bold uppercase text-black/70 dark:text-white/70">
                  Agendar cita
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: Product Demo Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {/* Brutalist Frame */}
            <div className="relative border-8 border-black bg-zinc-50 p-4 dark:border-white dark:bg-zinc-900">
              {/* Calendar Demo - Simplified Visual */}
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-4 border-black bg-white p-3 dark:border-white dark:bg-zinc-950">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Lunes 3 Feb
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-600">
                    ● En vivo
                  </span>
                </div>

                {/* Time Slots with Appointments */}
                <div className="space-y-2">
                  {/* 9:00 - Occupied */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex gap-2"
                  >
                    <div className="w-16 border-2 border-black bg-white p-2 font-mono text-xs font-bold dark:border-white dark:bg-zinc-950">
                      09:00
                    </div>
                    <div className="flex-1 border-4 border-black bg-blue-400 p-3 dark:border-white">
                      <p className="font-mono text-sm font-bold text-black">Carlos M.</p>
                      <p className="font-mono text-xs text-black/70">Corte + Barba</p>
                    </div>
                  </motion.div>

                  {/* 10:00 - Empty */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-2"
                  >
                    <div className="w-16 border-2 border-black bg-white p-2 font-mono text-xs font-bold dark:border-white dark:bg-zinc-950">
                      10:00
                    </div>
                    <div className="flex-1 cursor-pointer border-4 border-dashed border-black/30 bg-white p-3 transition-all hover:border-black hover:bg-yellow-50 dark:border-white/30 dark:bg-zinc-950 dark:hover:border-white dark:hover:bg-zinc-900">
                      <p className="font-mono text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                        Disponible
                      </p>
                    </div>
                  </motion.div>

                  {/* 11:00 - Occupied */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-2"
                  >
                    <div className="w-16 border-2 border-black bg-white p-2 font-mono text-xs font-bold dark:border-white dark:bg-zinc-950">
                      11:00
                    </div>
                    <div className="flex-1 border-4 border-black bg-yellow-400 p-3 dark:border-white">
                      <p className="font-mono text-sm font-bold text-black">Andrea R.</p>
                      <p className="font-mono text-xs text-black/70">Fade Premium</p>
                    </div>
                  </motion.div>

                  {/* 12:00 - Empty */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-2"
                  >
                    <div className="w-16 border-2 border-black bg-white p-2 font-mono text-xs font-bold dark:border-white dark:bg-zinc-950">
                      12:00
                    </div>
                    <div className="flex-1 cursor-pointer border-4 border-dashed border-black/30 bg-white p-3 transition-all hover:border-black hover:bg-yellow-50 dark:border-white/30 dark:bg-zinc-950 dark:hover:border-white dark:hover:bg-zinc-900">
                      <p className="font-mono text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
                        Disponible
                      </p>
                    </div>
                  </motion.div>

                  {/* 14:00 - Occupied */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-2"
                  >
                    <div className="w-16 border-2 border-black bg-white p-2 font-mono text-xs font-bold dark:border-white dark:bg-zinc-950">
                      14:00
                    </div>
                    <div className="flex-1 border-4 border-black bg-red-500 p-3 dark:border-white">
                      <p className="font-mono text-sm font-bold text-white">Luis P.</p>
                      <p className="font-mono text-xs text-white/80">Color + Diseño</p>
                    </div>
                  </motion.div>
                </div>

                {/* Action Hint - Brutalist */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-4 border-4 border-black bg-yellow-400 p-3 text-center dark:border-white dark:bg-yellow-500"
                >
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-black">
                    ↑ Arrastra para reorganizar · Click para editar
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Floating Speed Badge - Brutalist */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -right-4 -top-4 border-4 border-black bg-red-600 px-4 py-3 dark:border-white"
            >
              <p className="font-mono text-2xl font-black text-white">0.2s</p>
              <p className="font-mono text-xs font-bold uppercase text-white">Drag & Drop</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
