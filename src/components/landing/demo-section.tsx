'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, BarChart3, Layout, Play } from 'lucide-react'

const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Layout,
    title: 'Vista general en tiempo real',
    description: 'Todas tus métricas importantes en un solo lugar',
  },
  {
    id: 'calendar',
    label: 'Calendario',
    icon: Calendar,
    title: 'Agenda visual e intuitiva',
    description: 'Arrastra y suelta citas, vista diaria/semanal/mensual',
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: Users,
    title: 'Base de datos completa',
    description: 'Historial, notas privadas y análisis de comportamiento',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    title: 'Reportes detallados',
    description: 'Ingresos, servicios top, rendimiento de barberos',
  },
]

export function DemoSection() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const activeTabData = tabs.find((tab) => tab.id === activeTab)

  return (
    <section id="demo" className="scroll-mt-20 bg-gradient-to-br from-zinc-900 to-black py-20 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Mira cómo funciona{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              en acción
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Interfaz diseñada para que puedas enfocarte en lo importante: tu negocio
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-zinc-900 shadow-lg'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </motion.button>
            )
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-12"
          >
            {/* Tab Title */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">{activeTabData?.title}</h3>
              <p className="mt-2 text-zinc-400">{activeTabData?.description}</p>
            </div>

            {/* Demo Window */}
            <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-2 shadow-2xl backdrop-blur-sm">
              {/* Browser Bar */}
              <div className="flex items-center gap-2 rounded-t-2xl bg-zinc-800 px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="ml-4 flex-1 rounded-lg bg-zinc-900 px-4 py-1 text-sm text-zinc-500">
                  barbershop.pro/dashboard
                </div>
              </div>

              {/* Content */}
              <div className="relative aspect-video overflow-hidden rounded-b-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
                {activeTab === 'dashboard' && <DashboardPreview />}
                {activeTab === 'calendar' && <CalendarPreview />}
                {activeTab === 'clients' && <ClientsPreview />}
                {activeTab === 'analytics' && <AnalyticsPreview />}

                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-2xl backdrop-blur-sm"
                  >
                    <Play className="ml-1 h-8 w-8 fill-zinc-900 text-zinc-900" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <a
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/40"
              >
                Prueba gratis por 7 días
              </a>
              <p className="mt-3 text-sm text-zinc-500">
                No se requiere tarjeta de crédito
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function DashboardPreview() {
  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-3 gap-4">
        {['Citas hoy: 12', 'Ingresos: ₡128k', 'Clientes: 84'].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl bg-white p-4 text-center shadow dark:bg-zinc-800"
          >
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{stat}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="h-12 rounded-lg bg-white shadow dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  )
}

function CalendarPreview() {
  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 21 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
            className="aspect-square rounded-lg bg-white shadow dark:bg-zinc-800"
          />
        ))}
      </div>
    </div>
  )
}

function ClientsPreview() {
  return (
    <div className="h-full p-6">
      <div className="mb-4 h-10 w-full rounded-lg bg-white shadow dark:bg-zinc-800" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 rounded-lg bg-white p-3 shadow dark:bg-zinc-800"
          >
            <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 flex-1 rounded bg-zinc-200 dark:bg-zinc-700" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsPreview() {
  return (
    <div className="h-full p-6">
      <div className="flex h-full flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 rounded-lg bg-white p-4 shadow dark:bg-zinc-800"
        >
          <div className="flex h-full items-end justify-around gap-2">
            {[60, 80, 50, 90, 70, 85, 95].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-purple-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
