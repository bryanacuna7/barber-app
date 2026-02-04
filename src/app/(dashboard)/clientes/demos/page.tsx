'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BarChart3,
  LayoutGrid,
  Activity,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Crown,
  Zap,
  Sparkles,
} from 'lucide-react'

const demos = [
  {
    id: 'fusion',
    title: 'Hybrid Fusion (A+B+C)',
    subtitle: 'Best of All • Complete CRM Experience',
    score: '9.5/10',
    effort: '28-36h',
    roi: '⭐⭐⭐⭐⭐⭐',
    icon: Sparkles,
    color: 'from-purple-500 via-pink-500 to-orange-500',
    features: [
      'Dashboard con charts + AI insights (A)',
      'View switcher: Dashboard/Cards/Table/Calendar (B)',
      'Master-detail layout con profile panel (C)',
      'Smart notifications banner (C)',
      'Search bar por nombre/phone/email (NEW)',
      'Loyalty rings + Spending tiers (B)',
      'Activity timeline + Relationship strength (C)',
    ],
    pros: [
      'Combina lo mejor de las 3 demos',
      'Máxima flexibilidad',
      'Score más alto (9.5/10)',
      'Experience completa',
    ],
    cons: ['Mayor complejidad', 'Más tiempo de implementación'],
    url: '/clientes/demos/preview-fusion',
  },
  {
    id: 'a',
    title: 'Dashboard-First Intelligence',
    subtitle: 'HubSpot-style • AI-powered insights',
    score: '9.0/10',
    effort: '16-22h',
    roi: '⭐⭐⭐⭐⭐',
    icon: BarChart3,
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Charts grandes: Revenue, Segments, Visit Frequency',
      'AI Insights: Churn risk, Win-back, Upsell candidates',
      'Smart actions: Bulk WhatsApp, automated follow-ups',
      'KPI cards con trends (+12.5%, -3.2%)',
      'Client list secundaria (abajo)',
    ],
    pros: [
      'Máxima business intelligence',
      'Data visualization profesional',
      'Insights accionables',
      'Dashboard-centric (charts first)',
    ],
    cons: ['Más complejo', 'Requiere datos para charts'],
    url: '/clientes/demos/preview-a',
  },
  {
    id: 'b',
    title: 'Visual CRM Canvas',
    subtitle: 'Notion-style • Multiple views',
    score: '8.5/10',
    effort: '18-24h',
    roi: '⭐⭐⭐⭐',
    icon: LayoutGrid,
    color: 'from-purple-500 to-pink-500',
    features: [
      'View switcher: Cards, Table, Calendar, Stats',
      'Rich client cards: Loyalty progress rings, spending tiers',
      'Calendar heatmap: Visualización de visitas por día',
      'Drag-to-segment: Visual indication (hover)',
      'Multiple perspectives: Same data, different views',
    ],
    pros: [
      'Flexibilidad de vistas',
      'Visual richness (rings, badges, tiers)',
      'User choice (pick your view)',
      'Calendar heatmap innovador',
    ],
    cons: ['View switching puede confundir', 'Menos insights AI'],
    url: '/clientes/demos/preview-b',
  },
  {
    id: 'c',
    title: 'Relationship Depth',
    subtitle: 'Linear-style • Activity timeline',
    score: '8.75/10',
    effort: '20-26h',
    roi: '⭐⭐⭐⭐',
    icon: Activity,
    color: 'from-green-500 to-emerald-500',
    features: [
      'Activity feed: Timeline de interacciones (visits, messages, notes)',
      'Relationship strength: Visual bars (4 levels)',
      'Smart notifications: Acción requerida (top banner)',
      'Rich client profiles: Engagement score, churn risk, next visit prediction',
      'Master-detail layout: List + full profile',
    ],
    pros: [
      'Enfoque en relaciones',
      'Timeline completo de historia',
      'Smart notifications proactivas',
      'Depth over breadth',
    ],
    cons: ['Menos data viz', 'Requiere click para ver detalle'],
    url: '/clientes/demos/preview-c',
  },
]

const comparisonMatrix = [
  {
    feature: 'Data Visualization',
    fusion: '⭐⭐⭐⭐⭐',
    a: '⭐⭐⭐⭐⭐',
    b: '⭐⭐⭐',
    c: '⭐⭐',
  },
  {
    feature: 'AI Insights',
    fusion: '⭐⭐⭐⭐⭐',
    a: '⭐⭐⭐⭐⭐',
    b: '⭐⭐',
    c: '⭐⭐⭐⭐',
  },
  {
    feature: 'Visual Richness',
    fusion: '⭐⭐⭐⭐⭐',
    a: '⭐⭐⭐',
    b: '⭐⭐⭐⭐⭐',
    c: '⭐⭐⭐⭐',
  },
  {
    feature: 'Flexibility (Views)',
    fusion: '⭐⭐⭐⭐⭐',
    a: '⭐⭐',
    b: '⭐⭐⭐⭐⭐',
    c: '⭐⭐⭐',
  },
  {
    feature: 'Relationship Depth',
    fusion: '⭐⭐⭐⭐⭐',
    a: '⭐⭐',
    b: '⭐⭐⭐',
    c: '⭐⭐⭐⭐⭐',
  },
  {
    feature: 'Quick Scan (Dashboard)',
    fusion: '⭐⭐⭐⭐⭐',
    a: '⭐⭐⭐⭐⭐',
    b: '⭐⭐⭐⭐',
    c: '⭐⭐⭐',
  },
  {
    feature: 'Business Intelligence',
    fusion: '⭐⭐⭐⭐⭐',
    a: '⭐⭐⭐⭐⭐',
    b: '⭐⭐⭐',
    c: '⭐⭐⭐',
  },
  {
    feature: 'Search',
    fusion: '⭐⭐⭐⭐⭐',
    a: '❌',
    b: '❌',
    c: '❌',
  },
  {
    feature: 'Awwwards Score',
    fusion: '9.5/10',
    a: '9.0/10',
    b: '8.5/10',
    c: '8.75/10',
  },
]

export default function ClientesDemosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 mb-4"
          >
            <Zap className="h-4 w-4" />
            Module 4: Clientes Redesign
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white"
          >
            3 Opciones de Rediseño
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-zinc-600 dark:text-zinc-400"
          >
            Compara y elige el diseño que mejor se adapte a tu visión
          </motion.p>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {demos.map((demo, index) => {
            const Icon = demo.icon
            return (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-lg border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all"
              >
                {/* Gradient Header */}
                <div
                  className={`h-32 bg-gradient-to-br ${demo.color} flex items-center justify-center`}
                >
                  <Icon className="h-12 w-12 text-white" />
                </div>

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      Demo {demo.id.toUpperCase()}: {demo.title}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">{demo.subtitle}</p>
                  </div>

                  {/* Score & Effort */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {demo.score}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Esfuerzo</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {demo.effort}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">ROI</p>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {demo.roi}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                      Features:
                    </p>
                    <ul className="space-y-1.5">
                      {demo.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pros */}
                  <div>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
                      Pros:
                    </p>
                    <ul className="space-y-1">
                      {demo.pros.map((pro, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div>
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">
                      Cons:
                    </p>
                    <ul className="space-y-1">
                      {demo.cons.map((con, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          <div className="h-1 w-1 rounded-full bg-orange-500 shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <Link
                    href={demo.url}
                    className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${demo.color} px-4 py-3 text-sm font-medium text-white hover:shadow-lg transition-all group-hover:scale-[1.02]`}
                  >
                    Ver Demo {demo.id.toUpperCase()}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Comparison Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-lg border border-zinc-200 dark:border-zinc-800"
        >
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            Matriz de Comparación
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Feature
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                    Fusion ⭐
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Demo A
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Demo B
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                    Demo C
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonMatrix.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                      {row.fusion}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
                      {row.a}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
                      {row.b}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
                      {row.c}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 p-6 border-2 border-purple-300 dark:border-purple-700"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-3 shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                🏆 Recomendación del Equipo
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                Basado en tu feedback (quieres lo mejor de las 3 opciones), recomendamos:
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-4 py-2 text-sm font-bold text-white">
                    Demo Fusion: Hybrid (A+B+C)
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    • 9.5/10 • Complete CRM Experience
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  ✨ Dashboard + Charts (A) • View Switcher (B) • Master-Detail (C) • Search Bar
                  (NEW)
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back to Analysis */}
        <div className="text-center">
          <Link
            href="/clientes"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ← Volver al módulo original
          </Link>
        </div>
      </div>
    </div>
  )
}
