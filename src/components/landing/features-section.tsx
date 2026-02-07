'use client'

import { motion } from 'framer-motion'
import { MousePointer2, Zap, Clock, Users, Bell, BarChart3 } from 'lucide-react'

// Focus on speed and UX - the differentiator
const coreFeatures = [
  {
    icon: MousePointer2,
    title: 'Drag & Drop Ultra-Rápido',
    metric: '0.2s',
    description: 'Reorganiza citas arrastrando. Respuesta instantánea, sin lag.',
    impact: '10x más rápido que otros sistemas',
  },
  {
    icon: Zap,
    title: 'Real-Time Sync',
    metric: '<1s',
    description: 'Cambios sincronizados en todos los dispositivos al instante.',
    impact: 'Nunca más citas duplicadas',
  },
  {
    icon: Clock,
    title: 'Vista Semanal Inteligente',
    metric: '1 vistazo',
    description: 'Toda tu semana visible. No clicks innecesarios.',
    impact: 'Ahorra 30min/día vs calendarios tradicionales',
  },
  {
    icon: Users,
    title: 'Búsqueda Instantánea',
    metric: '<0.1s',
    description: 'Encuentra cualquier cliente o cita escribiendo. Fuzzy search incluido.',
    impact: 'Sin scroll infinito',
  },
  {
    icon: Bell,
    title: 'Recordatorios Automáticos',
    metric: '80% menos',
    description: 'Notificaciones inteligentes que reducen no-shows.',
    impact: 'No-shows',
  },
  {
    icon: BarChart3,
    title: 'Analytics Real-Time',
    metric: 'Live',
    description: 'KPIs actualizados en tiempo real. Decisiones basadas en datos.',
    impact: 'Sin esperar reportes',
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t-8 border-black bg-white py-20 dark:border-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header - Brutalist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-mono text-4xl font-black uppercase tracking-tight text-black dark:text-white sm:text-5xl">
            ¿Por qué somos los{' '}
            <span className="relative inline-block">
              <span className="relative z-10">más rápidos</span>
              <span className="absolute bottom-2 left-0 h-4 w-full bg-blue-400" />
            </span>
            ?
          </h2>
          <p className="mt-4 font-mono text-lg font-bold text-black/70 dark:text-white/70">
            Optimizado para velocidad. Cada milisegundo cuenta.
          </p>
        </motion.div>

        {/* Core Features Grid - Brutalist Cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer border-4 border-black bg-white p-6 transition-all hover:bg-yellow-50 dark:border-white dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                {/* Icon + Metric */}
                <div className="flex items-start justify-between">
                  <div className="border-4 border-black bg-blue-400 p-3 dark:border-white">
                    <Icon className="h-8 w-8 text-black dark:text-white" />
                  </div>
                  <div className="border-2 border-black bg-yellow-400 px-3 py-1 dark:border-white dark:bg-yellow-500">
                    <p className="font-mono text-sm font-black uppercase text-black">
                      {feature.metric}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <h3 className="mt-6 font-mono text-xl font-black uppercase text-black dark:text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-3 font-mono text-sm font-bold leading-relaxed text-black/80 dark:text-white/80">
                  {feature.description}
                </p>

                {/* Impact Badge */}
                <div className="mt-4 border-t-4 border-black pt-4 dark:border-white">
                  <p className="font-mono text-xs font-black uppercase tracking-wider text-black/60 dark:text-white/60">
                    → {feature.impact}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Before/After Comparison - Brutalist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 border-8 border-black bg-zinc-50 p-8 dark:border-white dark:bg-zinc-900 sm:p-12"
        >
          <h3 className="mb-8 text-center font-mono text-2xl font-black uppercase text-black dark:text-white">
            Antes vs Después
          </h3>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Before */}
            <div className="border-4 border-black bg-white p-6 dark:border-white dark:bg-zinc-950">
              <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-4 dark:border-white">
                <p className="font-mono text-sm font-black uppercase tracking-wider">
                  Otros sistemas
                </p>
                <span className="text-3xl">😰</span>
              </div>
              <div className="space-y-3 font-mono text-sm font-bold">
                <p className="flex items-start gap-2">
                  <span className="text-red-600">✕</span>
                  <span>3+ horas/día gestionando WhatsApp</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-600">✕</span>
                  <span>30% de no-shows</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-600">✕</span>
                  <span>Doble-reservas frecuentes</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-600">✕</span>
                  <span>UI lenta y confusa</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-red-600">✕</span>
                  <span>Sin datos para decidir</span>
                </p>
              </div>
            </div>

            {/* After */}
            <div className="border-4 border-black bg-white p-6 dark:border-white dark:bg-zinc-950">
              <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-4 dark:border-white">
                <p className="font-mono text-sm font-black uppercase tracking-wider">
                  BarberShop Pro
                </p>
                <span className="text-3xl">🚀</span>
              </div>
              <div className="space-y-3 font-mono text-sm font-bold">
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Todo automatizado · Cero WhatsApp</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>5% de no-shows (recordatorios auto)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Real-time sync · Nunca duplicados</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>UI ultra-rápida (0.2s response)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Analytics live · Decisiones basadas en data</span>
                </p>
              </div>

              {/* CTA inside After box */}
              <div className="mt-6 border-t-4 border-black pt-6 text-center dark:border-white">
                <a
                  href="/register"
                  className="inline-block cursor-pointer border-4 border-black bg-black px-6 py-3 font-mono text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-yellow-400 hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-yellow-400"
                >
                  Prueba gratis 7 días
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
