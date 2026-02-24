'use client'

import { motion } from 'framer-motion'
import {
  MousePointer2,
  Zap,
  Clock,
  Users,
  Bell,
  BarChart3,
  Calendar,
  TrendingUp,
  Smartphone,
  Shield,
  CreditCard,
  MessageSquare,
} from 'lucide-react'

// Core features - focus on speed and UX
const coreFeatures = [
  {
    icon: MousePointer2,
    title: 'Drag & Drop Ultra-Rápido',
    metric: '0.2s',
    description: 'Reorganiza citas arrastrando. Respuesta instantánea, sin lag.',
    color: 'blue',
  },
  {
    icon: Zap,
    title: 'Real-Time Sync',
    metric: '<1s',
    description: 'Cambios sincronizados en todos los dispositivos al instante.',
    color: 'purple',
  },
  {
    icon: Clock,
    title: 'Vista Semanal Inteligente',
    metric: '1 vistazo',
    description: 'Toda tu semana visible. No clicks innecesarios.',
    color: 'emerald',
  },
  {
    icon: Users,
    title: 'Búsqueda Instantánea',
    metric: '<0.1s',
    description: 'Encuentra cualquier cliente o cita escribiendo. Fuzzy search incluido.',
    color: 'orange',
  },
  {
    icon: Bell,
    title: 'Recordatorios Automáticos',
    metric: '80%↓',
    description: 'Notificaciones inteligentes que reducen no-shows.',
    color: 'red',
  },
  {
    icon: BarChart3,
    title: 'Analytics Real-Time',
    metric: 'Live',
    description: 'KPIs actualizados en tiempo real. Decisiones basadas en datos.',
    color: 'cyan',
  },
]

// Additional features
const additionalFeatures = [
  {
    icon: Calendar,
    title: 'Gestión de Citas',
    description: 'Vista diaria, semanal y mensual. Drag & drop para reorganizar.',
  },
  {
    icon: Smartphone,
    title: '100% Responsive',
    description: 'Funciona perfecto en móvil, tablet y desktop.',
  },
  {
    icon: Shield,
    title: 'Datos Seguros',
    description: 'Respaldos automáticos y encriptación. Tu información protegida.',
  },
  {
    icon: CreditCard,
    title: 'Pagos Simples',
    description: 'SINPE Móvil integrado. Reporta pagos fácilmente.',
  },
  {
    icon: TrendingUp,
    title: 'Reportes Detallados',
    description: 'Exporta reportes de ventas, citas y clientes.',
  },
  {
    icon: MessageSquare,
    title: 'Soporte en Español',
    description: 'Equipo local disponible por WhatsApp y chat.',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Por qué somos{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              los más rápidos
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Optimizado para velocidad. Cada milisegundo cuenta para tu negocio.
          </p>
        </motion.div>

        {/* Core Features Grid - Glassmorphism Cards with 3D Tilt */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
                }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5,
                  z: 50,
                  transition: { duration: 0.3 },
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className={`group relative overflow-hidden rounded-3xl border border-${feature.color}-200/50 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-shadow hover:shadow-2xl dark:border-${feature.color}-800/50 dark:bg-zinc-900/80`}
              >
                {/* Gradient overlay on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-50/0 to-${feature.color}-100/0 opacity-0 transition-opacity group-hover:from-${feature.color}-50/50 group-hover:to-${feature.color}-100/50 group-hover:opacity-100 dark:group-hover:from-${feature.color}-950/20 dark:group-hover:to-${feature.color}-950/10`}
                />

                <div className="relative">
                  {/* Icon + Metric */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`rounded-2xl bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 p-3 shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div
                      className={`rounded-xl bg-${feature.color}-100 px-3 py-1 dark:bg-${feature.color}-900/30`}
                    >
                      <p
                        className={`text-sm font-bold text-${feature.color}-700 dark:text-${feature.color}-300`}
                      >
                        {feature.metric}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Features - Compact Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {additionalFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{
                  scale: 1.02,
                  y: -4,
                  transition: { duration: 0.2 },
                }}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
              >
                <div className="flex-shrink-0">
                  <div className="rounded-xl bg-zinc-200 p-2 dark:bg-zinc-800">
                    <Icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white">{feature.title}</h4>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Before/After Comparison - Modern Premium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-20 overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-purple-50 p-8 dark:border-zinc-800 dark:from-blue-950/20 dark:to-purple-950/20 sm:p-12"
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-white">
            ¿Por qué BarberApp?
          </h3>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <p className="font-semibold text-zinc-600 dark:text-zinc-400">Otros sistemas</p>
                <span className="text-2xl">😰</span>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  '3+ horas/día gestionando WhatsApp',
                  '30% de no-shows',
                  'Doble-reservas frecuentes',
                  'UI lenta y confusa',
                  'Sin datos para decidir',
                ].map((item, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="font-bold text-red-500">✕</span>
                    <span>{item}</span>
                  </motion.p>
                ))}
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <p className="font-semibold text-zinc-600 dark:text-zinc-400">BarberApp</p>
                <span className="text-2xl">🚀</span>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  'Todo automatizado · Cero WhatsApp',
                  '5% de no-shows (recordatorios auto)',
                  'Real-time sync · Nunca duplicados',
                  'UI ultra-rápida (0.2s response)',
                  'Analytics live · Decisiones basadas en data',
                ].map((item, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400"
                  >
                    <span className="font-bold">✓</span>
                    <span>{item}</span>
                  </motion.p>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.0 }}
                className="mt-6 border-t border-zinc-200 pt-6 text-center dark:border-zinc-800"
              >
                <motion.a
                  href="/register"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                >
                  Prueba gratis 7 días
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
