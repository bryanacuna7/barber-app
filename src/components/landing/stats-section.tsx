'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, DollarSign, CheckCircle } from 'lucide-react'

const stats = [
  {
    icon: TrendingUp,
    value: '35%',
    label: 'Aumento en reservas',
    description: 'Promedio en los primeros 3 meses',
    color: 'blue',
  },
  {
    icon: Clock,
    value: '4h',
    label: 'Tiempo ahorrado',
    description: 'Por semana en gestión manual',
    color: 'purple',
  },
  {
    icon: DollarSign,
    value: '₡450k',
    label: 'Ingresos adicionales',
    description: 'Promedio mensual por menos no-shows',
    color: 'emerald',
  },
  {
    icon: CheckCircle,
    value: '98%',
    label: 'Satisfacción',
    description: 'De barberías que nos recomiendan',
    color: 'orange',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
}

export function StatsSection() {
  return (
    <section className="border-y border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Resultados reales,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              barberías felices
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Únete a las barberías que ya transformaron su negocio con BarberShop Pro
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={item}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/60 p-8 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

                <div className="relative">
                  <div
                    className={`inline-flex items-center justify-center rounded-xl bg-${stat.color}-100 p-3 dark:bg-${stat.color}-900/30`}
                  >
                    <Icon
                      className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                    />
                  </div>

                  <p className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-base font-semibold text-zinc-900 dark:text-white">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500 dark:text-zinc-400">
          {['Datos 100% seguros', 'Soporte en español', 'Actualización constante'].map(
            (badge, i) => (
              <motion.div
                key={badge}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <motion.svg
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200 }}
                  className="h-5 w-5 text-emerald-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </motion.svg>
                <span>{badge}</span>
              </motion.div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
