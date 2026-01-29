'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Calendar, Users, Scissors } from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const floatingAnimation = {
  y: [-10, 10],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: 'reverse' as const,
  },
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/4 h-96 w-96 rounded-full bg-blue-100/20 blur-3xl dark:bg-blue-950/20" />
        <div className="absolute -bottom-1/2 right-1/4 h-96 w-96 rounded-full bg-purple-100/20 blur-3xl dark:bg-purple-950/20" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          {/* Left Content */}
          <div>
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
                <Sparkles className="h-4 w-4" />
                Nuevo: 7 días de prueba gratis
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-8 text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl"
            >
              Tu barbería,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                más profesional
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl"
            >
              Gestiona citas, clientes y pagos en un solo lugar. Sistema profesional diseñado
              especialmente para barberías modernas.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/40"
              >
                Comenzar gratis
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-zinc-200 bg-white/80 px-8 py-4 text-base font-semibold text-zinc-900 backdrop-blur-sm transition-all hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-white dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                Ver demo en vivo
              </Link>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">500+</p>
                  <p className="text-xs">Citas diarias</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">150+</p>
                  <p className="text-xs">Barberías activas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Scissors className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">98%</p>
                  <p className="text-xs">Satisfacción</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Animated Dashboard Preview */}
          <motion.div variants={item} className="relative">
            <motion.div animate={floatingAnimation} className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-blue-200/70 via-purple-200/50 to-pink-200/70 blur-3xl dark:from-blue-800/40 dark:via-purple-800/30 dark:to-pink-800/40" />

              {/* Dashboard Mock */}
              <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white/90 p-6 shadow-2xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Dashboard
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      En vivo
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Citas hoy', value: '12', color: 'blue' },
                    { label: 'Ingresos', value: '₡128k', color: 'purple' },
                    { label: 'Clientes', value: '84', color: 'emerald' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={`rounded-2xl bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 p-4 text-center dark:from-${stat.color}-900/20 dark:to-${stat.color}-900/10`}
                    >
                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Appointments List */}
                <div className="mt-6 space-y-3">
                  {[
                    { time: '9:30', name: 'Carlos M.', service: 'Corte + Barba' },
                    { time: '11:00', name: 'Andrea R.', service: 'Fade' },
                    { time: '14:15', name: 'Luis P.', service: 'Color' },
                  ].map((apt, i) => (
                    <motion.div
                      key={`${apt.time}-${apt.name}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/60"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white">
                          {apt.time} · {apt.name}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{apt.service}</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
