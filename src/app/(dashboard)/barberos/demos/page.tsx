'use client'

/**
 * Barberos Module - Demos Navigation Hub
 *
 * Comparison and navigation for 3 demo options:
 * - Demo A: Performance Dashboard (HubSpot-style, 9/10)
 * - Demo B: Visual CRM Canvas (Notion-style, 8.5/10)
 * - Demo C: Leaderboard Command Center (Linear-style, 8/10)
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  LayoutGrid,
  Table2,
  Trophy,
  TrendingUp,
  Gauge,
  Search,
  Award,
  Calendar,
  Sparkles,
  Target,
  ChevronRight,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react'

const demos = [
  {
    id: 'preview-a',
    title: 'Demo A: Performance Dashboard',
    subtitle: 'HubSpot-style',
    score: '9/10',
    description:
      'Dashboard enfocado en business intelligence con KPI cards, datos enriquecidos, sparklines y métricas de performance.',
    icon: LayoutGrid,
    gradient: 'from-violet-500 to-purple-600',
    features: [
      { label: 'Team KPI cards (4 métricas)', included: true },
      { label: 'Business data inline (citas, ingresos, rating)', included: true },
      { label: 'Mini sparklines de tendencias', included: true },
      { label: 'Achievement badges inline', included: true },
      { label: 'Occupancy bars', included: true },
      { label: 'Search por nombre/email', included: true },
      { label: 'View toggle (Cards/Table)', included: true },
      { label: 'Quick actions (hover desktop, visible mobile)', included: true },
      { label: 'Múltiples vistas', included: false },
      { label: 'Leaderboard rankings', included: false },
    ],
    strengths: [
      'Información densa y útil para decisiones de negocio',
      'Dashboard KPIs dan contexto de equipo',
      'Performance metrics destacadas',
      'Mobile-optimized con grid responsive',
    ],
    bestFor: 'Owners que necesitan datos de negocio al instante para tomar decisiones rápidas.',
    estimatedImplementation: '50-65h',
  },
  {
    id: 'preview-b',
    title: 'Demo B: Visual CRM Canvas',
    subtitle: 'Notion-style',
    score: '8.5/10',
    description:
      'Vistas flexibles tipo Notion con Cards, Table, Leaderboard y Calendar. Performance rings, tags y layouts ricos.',
    icon: Table2,
    gradient: 'from-blue-500 to-cyan-600',
    features: [
      { label: '4 View modes (Cards, Table, Leaderboard, Calendar)', included: true },
      { label: 'Performance rings alrededor de avatar', included: true },
      { label: 'Tags visuales (Top Performer, Streak)', included: true },
      { label: 'Sortable table con 6 columnas', included: true },
      { label: 'Progress bars to next level', included: true },
      { label: 'Leaderboard con medallas top 3', included: true },
      { label: 'Calendar view con appointments', included: true },
      { label: 'Mobile bottom nav para vistas', included: true },
      { label: 'Team KPI dashboard', included: false },
      { label: 'Inline activity feed', included: false },
    ],
    strengths: [
      'Máxima flexibilidad con 4 vistas diferentes',
      'Visualizaciones ricas (rings, progress bars)',
      'Leaderboard integrado con rankings',
      'Calendar view útil para planificar',
    ],
    bestFor: 'Equipos que necesitan ver información desde múltiples perspectivas (CRM flexible).',
    estimatedImplementation: '55-72h',
  },
  {
    id: 'preview-c',
    title: 'Demo C: Leaderboard Command Center',
    subtitle: 'Linear-style',
    score: '8/10',
    description:
      'Enfoque en rankings competitivos con podio visual top 3, trend indicators y activity feed inline.',
    icon: Trophy,
    gradient: 'from-amber-500 to-orange-600',
    features: [
      { label: 'Podio visual top 3 performers', included: true },
      { label: 'Medal badges (oro, plata, bronce)', included: true },
      { label: 'Rank badges para todos (#1, #2, etc.)', included: true },
      { label: 'Trend indicators (↑↓ vs mes anterior)', included: true },
      { label: 'Recent activity feed colapsable', included: true },
      { label: 'Period filters (Semana/Mes/Todo)', included: true },
      { label: 'Quick assign button por barber', included: true },
      { label: 'Mobile podio cards horizontal', included: true },
      { label: 'Team KPI dashboard', included: false },
      { label: 'Múltiples view modes', included: false },
    ],
    strengths: [
      'Gamification competitiva muy visual',
      'Podio destaca top performers claramente',
      'Trend indicators muestran crecimiento',
      'Activity feed da contexto de trabajo reciente',
    ],
    bestFor: 'Equipos motivados por competencia sana y reconocimiento público.',
    estimatedImplementation: '45-58h',
  },
]

export default function BarberosHub() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
            Barberos Module - 3 Demos
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Explora 3 enfoques de diseño awwwards-level para transformar la gestión de equipo desde
            directorio estático a command center con business intelligence.
          </p>

          {/* Back to Analysis */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Ver análisis crítico completo (BARBEROS_AWWWARDS_ANALYSIS.md)
          </Link>
        </motion.div>

        {/* Quick Comparison Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            Comparación Rápida
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="pb-4 pr-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Característica
                  </th>
                  {demos.map((demo) => (
                    <th
                      key={demo.id}
                      className="pb-4 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center"
                    >
                      {demo.title.replace('Demo ', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <tr>
                  <td className="py-3 pr-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Awwwards Score
                  </td>
                  {demos.map((demo) => (
                    <td
                      key={demo.id}
                      className="py-3 px-4 text-center font-bold text-lg text-zinc-900 dark:text-white"
                    >
                      {demo.score}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Business Intelligence
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-5 w-5 text-amber-600 mx-auto">~</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-5 w-5 text-amber-600 mx-auto">~</div>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Múltiples Vistas
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-5 w-5 text-amber-600 mx-auto">~</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <XCircle className="h-5 w-5 text-zinc-300 dark:text-zinc-700 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Gamification Competitiva
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="h-5 w-5 text-amber-600 mx-auto">~</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Mobile Optimized
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-sm text-zinc-600 dark:text-zinc-400">
                    Esfuerzo Implementación
                  </td>
                  {demos.map((demo) => (
                    <td
                      key={demo.id}
                      className="py-3 px-4 text-center text-sm font-semibold text-zinc-900 dark:text-white"
                    >
                      {demo.estimatedImplementation}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {demos.map((demo, index) => {
            const Icon = demo.icon
            return (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link href={`/barberos/demos/${demo.id}`}>
                  <div className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                    {/* Header with gradient */}
                    <div
                      className={`bg-gradient-to-br ${demo.gradient} p-6 text-white relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30" />
                      <div className="relative">
                        <Icon className="h-10 w-10 mb-4" />
                        <h3 className="text-xl font-bold mb-1">{demo.title}</h3>
                        <p className="text-sm text-white/80 mb-3">{demo.subtitle}</p>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-sm font-semibold">Score: {demo.score}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5">
                        {demo.description}
                      </p>

                      {/* Best For */}
                      <div className="mb-5 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          ✨ Ideal para:
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{demo.bestFor}</p>
                      </div>

                      {/* Key Features (limited) */}
                      <div className="mb-5 space-y-2">
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                          Características destacadas:
                        </p>
                        {demo.features
                          .filter((f) => f.included)
                          .slice(0, 4)
                          .map((feature, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                {feature.label}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* CTA */}
                      <div className="mt-auto pt-5 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-sm font-semibold text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                          <span>Ver Demo Completo</span>
                          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-zinc-500 dark:text-zinc-400 space-y-2"
        >
          <p>🎨 Todos los demos son completamente funcionales con mock data y mobile-responsive.</p>
          <p>
            📊 Revisa el análisis completo en{' '}
            <Link href="/" className="text-violet-600 dark:text-violet-400 hover:underline">
              BARBEROS_AWWWARDS_ANALYSIS.md
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
