'use client'

import { motion } from 'framer-motion'
import {
  Calendar,
  Users,
  Palette,
  Bell,
  TrendingUp,
  Smartphone,
  Shield,
  Zap,
  Clock,
  BarChart3,
  MessageSquare,
  CreditCard,
} from 'lucide-react'

const features = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description: 'Calendario visual con vista diaria, semanal y mensual. Drag & drop para reorganizar citas.',
    color: 'blue',
  },
  {
    icon: Users,
    title: 'Gestión de Clientes',
    description: 'Historial completo, notas privadas, frecuencia de visitas y análisis de comportamiento.',
    color: 'purple',
  },
  {
    icon: Palette,
    title: 'Branding Personalizado',
    description: 'Logo, colores y página de reservas con tu marca. Sorprende a tus clientes.',
    color: 'pink',
  },
  {
    icon: Bell,
    title: 'Recordatorios Automáticos',
    description: 'Notificaciones por email y en la app. Reduce no-shows hasta un 80%.',
    color: 'orange',
  },
  {
    icon: TrendingUp,
    title: 'Analytics en Tiempo Real',
    description: 'KPIs, gráficos de ingresos, servicios más vendidos y rendimiento de barberos.',
    color: 'emerald',
  },
  {
    icon: Smartphone,
    title: '100% Responsive',
    description: 'Funciona perfecto en móvil, tablet y desktop. Lleva tu negocio en el bolsillo.',
    color: 'cyan',
  },
  {
    icon: Shield,
    title: 'Datos Seguros',
    description: 'Respaldos automáticos, encriptación y cumplimiento GDPR. Tu información protegida.',
    color: 'red',
  },
  {
    icon: Zap,
    title: 'Configuración en Minutos',
    description: 'Wizard de onboarding que te guía paso a paso. Empieza a agendar en menos de 10 minutos.',
    color: 'yellow',
  },
  {
    icon: Clock,
    title: 'Horarios Flexibles',
    description: 'Configura horarios por día, bloquea vacaciones y días festivos fácilmente.',
    color: 'indigo',
  },
  {
    icon: BarChart3,
    title: 'Reportes Detallados',
    description: 'Exporta reportes de ventas, citas y clientes para tu contador.',
    color: 'teal',
  },
  {
    icon: MessageSquare,
    title: 'Soporte en Español',
    description: 'Equipo local disponible por WhatsApp, email y chat en vivo.',
    color: 'violet',
  },
  {
    icon: CreditCard,
    title: 'Pagos Simples',
    description: 'SINPE Móvil integrado. Reporta pagos con comprobante o WhatsApp.',
    color: 'lime',
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
  show: { opacity: 1, y: 0 },
}

export function FeaturesSection() {
  return (
    <section className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Todo lo que necesitas,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              en una sola plataforma
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Diseñado específicamente para barberías modernas. Sin características innecesarias.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ scale: 1.05 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
              >
                {/* Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 opacity-0 transition-opacity group-hover:from-blue-50/50 group-hover:via-purple-50/50 group-hover:to-pink-50/50 group-hover:opacity-100 dark:group-hover:from-blue-950/20 dark:group-hover:via-purple-950/20 dark:group-hover:to-pink-950/20" />

                <div className="relative">
                  <div className={`inline-flex items-center justify-center rounded-xl bg-${feature.color}-100 p-3 dark:bg-${feature.color}-900/30`}>
                    <Icon className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>

                  <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-blue-50 to-purple-50 p-8 dark:border-zinc-800 dark:from-blue-950/20 dark:to-purple-950/20 sm:p-12"
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                ¿Por qué BarberShop Pro?
              </h3>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
                No es solo un calendario. Es un sistema completo diseñado para resolver los problemas
                reales de barberías:
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Elimina el caos de mensajes de WhatsApp',
                  'Reduce tiempo perdido en confirmaciones',
                  'Aumenta ingresos con más citas por día',
                  'Mejora experiencia del cliente',
                  'Toma decisiones basadas en datos',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <svg
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-zinc-700 dark:text-zinc-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-blue-200/50 via-purple-200/50 to-pink-200/50 blur-2xl dark:from-blue-800/30 dark:via-purple-800/30 dark:to-pink-800/30" />
              <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Antes de BarberShop Pro
                    </span>
                    <span className="text-2xl">😰</span>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <p>❌ 3+ horas/día gestionando WhatsApp</p>
                    <p>❌ 30% de no-shows</p>
                    <p>❌ Doble-reservas y conflictos</p>
                    <p>❌ Sin datos para decidir</p>
                  </div>

                  <div className="my-4 border-t border-zinc-200 dark:border-zinc-800" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      Con BarberShop Pro
                    </span>
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div className="space-y-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <p>✅ Todo automatizado</p>
                    <p>✅ 5% de no-shows</p>
                    <p>✅ Agenda perfecta 24/7</p>
                    <p>✅ Decisiones basadas en datos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
