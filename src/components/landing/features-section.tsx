'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Bell, BarChart3, Smartphone, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Agenda inteligente',
    description:
      'Tus clientes reservan en linea 24/7. Sin llamadas, sin WhatsApp. Tu solo ves las citas llegar.',
    color: 'blue',
    colorClasses: {
      icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    },
  },
  {
    icon: Bell,
    title: 'Cero no-shows',
    description:
      'Recordatorios automaticos por email reducen los no-shows hasta un 80%. Menos sillas vacias, mas ingresos.',
    color: 'purple',
    colorClasses: {
      icon: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    },
  },
  {
    icon: BarChart3,
    title: 'Datos que importan',
    description:
      'Ve cuanto facturas, que servicios venden mas y quienes son tus mejores clientes. Decide con datos, no intuicion.',
    color: 'emerald',
    colorClasses: {
      icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    },
  },
  {
    icon: Smartphone,
    title: 'Funciona en todo',
    description:
      'Celular, tablet o computadora. Tu y tu equipo manejan todo desde cualquier dispositivo en tiempo real.',
    color: 'orange',
    colorClasses: {
      icon: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    },
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-t border-zinc-200/60 bg-white py-20 dark:border-zinc-800/60 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Todo lo que necesitas,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              nada que no
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Sin complicaciones. Configura en 5 minutos y empieza a recibir reservas hoy.
          </p>
        </motion.div>

        {/* Feature Cards - 2x2 Grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
                className="group rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-6 transition-all hover:border-zinc-300 hover:bg-white hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <div className={`inline-flex rounded-xl p-2.5 ${feature.colorClasses.icon}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Before/After - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-zinc-50 to-white dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
        >
          <div className="grid sm:grid-cols-2">
            {/* Before */}
            <div className="border-b border-zinc-200/80 p-6 sm:border-b-0 sm:border-r dark:border-zinc-800">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Sin BarberApp
              </p>
              <div className="mt-4 space-y-2.5">
                {[
                  '3+ horas/dia en WhatsApp',
                  '30% de citas perdidas',
                  'Doble-reservas frecuentes',
                  'Sin datos para decidir',
                ].map((item, i) => (
                  <p
                    key={i}
                    className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500"
                  >
                    <span className="text-red-400">✕</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Con BarberApp
              </p>
              <div className="mt-4 space-y-2.5">
                {[
                  'Todo automatizado, cero WhatsApp',
                  'Solo 5% de no-shows',
                  'Sincronizacion en tiempo real',
                  'Analytics en vivo',
                ].map((item, i) => (
                  <p
                    key={i}
                    className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="text-emerald-500">✓</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Link
            href="/register"
            className="group inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Empieza tu prueba gratis de 7 dias
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
