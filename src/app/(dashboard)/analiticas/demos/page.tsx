'use client'

/**
 * Reportes/Analíticas Demos Navigation Hub
 * Module 7 of 7 - FINAL MODULE
 *
 * Allows comparison of 3 different analytics approaches:
 * - Demo A: Dashboard Intelligence (HubSpot-style) - 9.0/10
 * - Demo B: Visual Analytics Canvas (Notion-style) - 8.5/10
 * - Demo C: Executive Report (Linear-style) - 8.0/10
 */

import Link from 'next/link'
import {
  ArrowLeft,
  Sparkles,
  MousePointerClick,
  FileText,
  TrendingUp,
  LayoutGrid,
  Table,
  Eye,
  Zap,
  Target,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const demos = [
  {
    id: 'fusion',
    name: 'Demo Fusion: Intelligence Report',
    subtitle: 'A + C Combined',
    score: '9.5/10',
    path: '/analiticas/demos/preview-fusion',
    gradient: 'from-violet-600 via-purple-600 to-blue-600',
    features: [
      'Hero KPI + AI insights (from A)',
      'Professional tables sortable (from C)',
      'Export PDF/CSV/Print (from C)',
      'Comparison mode toggle (from C)',
      'Premium gradients + clean tables',
      'Inline sparklines en ambas tablas',
    ],
    bestFor: 'Best of both: Insights + Professional analysis',
    icon: <Sparkles className="w-6 h-6" />,
    badge: '⭐ RECOMMENDED',
  },
  {
    id: 'a',
    name: 'Demo A: Dashboard Intelligence',
    subtitle: 'HubSpot-style',
    score: '9.0/10',
    path: '/analiticas/demos/preview-a',
    gradient: 'from-violet-600 via-purple-600 to-blue-600',
    features: [
      'Hero KPI card con sparkline',
      'AI-powered insights automáticos',
      'Comparison badges (% vs anterior)',
      'Alert cards para anomalías',
      'Bento grid layout premium',
      'Gradient backgrounds + mesh',
    ],
    bestFor: 'Business storytelling, insights, recomendaciones',
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: 'b',
    name: 'Demo B: Visual Analytics Canvas',
    subtitle: 'Notion-style',
    score: '8.5/10',
    path: '/analiticas/demos/preview-b',
    gradient: 'from-emerald-600 to-teal-600',
    features: [
      'Masonry grid layout dinámico',
      'Interactive charts (click to drill-down)',
      'Chart type switcher (bar/line/pie)',
      'Filter sidebar con live preview',
      'Expandable cards con detalles',
      'Export buttons (CSV, PDF)',
    ],
    bestFor: 'Exploración interactiva, drill-down, flexibilidad',
    icon: <MousePointerClick className="w-6 h-6" />,
  },
  {
    id: 'c',
    name: 'Demo C: Executive Report',
    subtitle: 'Linear-style',
    score: '8.0/10',
    path: '/analiticas/demos/preview-c',
    gradient: 'from-zinc-700 to-zinc-900',
    features: [
      'Clean table-first view (sortable)',
      'Inline mini charts (sparklines)',
      'Export prominent (PDF, CSV, Print)',
      'Comparison mode (2 periods side-by-side)',
      'Professional print-ready layout',
      'Minimal colors, maximum clarity',
    ],
    bestFor: 'Reportes profesionales, export, claridad',
    icon: <FileText className="w-6 h-6" />,
  },
]

const comparison = [
  {
    aspect: 'Visual Design',
    a: '9/10 - Gradientes premium, mesh',
    b: '8/10 - Masonry grid, interactivo',
    c: '7/10 - Minimal, profesional',
  },
  {
    aspect: 'Business Intelligence',
    a: '9/10 - AI insights, alerts',
    b: '7/10 - Drill-down, filtros',
    c: '8/10 - Comparaciones, export',
  },
  {
    aspect: 'Interactividad',
    a: '7/10 - Hover states, expandir',
    b: '9/10 - Click to drill, expandir',
    c: '6/10 - Sort, comparar',
  },
  {
    aspect: 'Mobile UX',
    a: '8/10 - Bento grid responsive',
    b: '8/10 - Masonry adaptable',
    c: '7/10 - Tables scrollables',
  },
  {
    aspect: 'Export/Share',
    a: '6/10 - No implementado',
    b: '8/10 - CSV, PDF buttons',
    c: '9/10 - PDF, CSV, Print',
  },
]

export default function ReportesNavHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/analiticas">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Volver a Analíticas
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium mb-4">
            <Target className="w-4 h-4" />
            Módulo 7 de 7 - FINAL MODULE
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-white bg-clip-text text-transparent mb-4">
            Reportes/Analíticas Redesign
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
            3 enfoques diferentes para analytics de nivel awwwards
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Score actual: 6.5/10
            </span>
            <span>→</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Target: 9.0-9.5/10
            </span>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demos.map((demo) => (
            <Card
              key={demo.id}
              className={`p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 ${
                demo.id === 'fusion'
                  ? 'border-violet-300 dark:border-violet-800 ring-2 ring-violet-200 dark:ring-violet-900'
                  : 'border-transparent hover:border-violet-200 dark:hover:border-violet-900'
              }`}
            >
              {/* Header */}
              <div className="mb-6">
                {demo.badge && (
                  <div className="mb-3 inline-block px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold rounded-full">
                    {demo.badge}
                  </div>
                )}
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${demo.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}
                >
                  {demo.icon}
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  {demo.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{demo.subtitle}</p>
                  <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                    {demo.score}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-6">
                {demo.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Best For */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl mb-6">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Mejor para:
                </p>
                <p className="text-sm text-zinc-900 dark:text-white">{demo.bestFor}</p>
              </div>

              {/* CTA */}
              <Link href={demo.path}>
                <Button
                  className={`w-full bg-gradient-to-r ${demo.gradient} text-white shadow-lg hover:shadow-xl transition-all`}
                >
                  Ver Demo
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Comparison Matrix */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <Table className="w-6 h-6" />
            Matriz de Comparación
          </h2>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <th className="px-6 py-4 text-left text-sm font-bold text-zinc-900 dark:text-white">
                      Aspecto
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-violet-600 dark:text-violet-400">
                      Demo A
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      Demo B
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-zinc-600 dark:text-zinc-400">
                      Demo C
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {comparison.map((row, index) => (
                    <tr key={index} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                        {row.aspect}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                        {row.a}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                        {row.b}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                        {row.c}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recommendation */}
        <Card className="p-8 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 border-2 border-violet-200 dark:border-violet-900">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-violet-600 rounded-2xl text-white flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Recomendación ⭐
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 mb-4">
                <strong>Demo Fusion</strong> combina lo mejor de ambos mundos (score 9.5/10):
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400 font-bold">✅</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    <strong>Hero KPI + AI Insights</strong> del Demo A para storytelling premium
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400 font-bold">✅</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    <strong>Tablas profesionales + Export</strong> del Demo C para análisis
                    detallado
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-600 dark:text-violet-400 font-bold">✅</span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    <strong>Comparison mode</strong> para ver tendencias vs periodo anterior
                  </span>
                </li>
              </ul>
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-violet-200 dark:border-violet-800">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  <strong>💡 Por qué Fusion es la mejor opción:</strong>
                  <br />
                  Maximiza insights automáticos (AI) mientras mantiene la profesionalidad de tablas
                  exportables. Ideal para equipos que necesitan tanto análisis rápido como reportes
                  detallados.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Explora los 3 demos y selecciona tu favorito
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {demos.map((demo) => (
              <Link key={demo.id} href={demo.path}>
                <Button variant="outline" className="gap-2">
                  {demo.icon}
                  {demo.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="text-center pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
            <Target className="w-5 h-5" />
            UI/UX Redesign: 7/7 módulos completos 🎉
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
            Este es el módulo final. Después de seleccionar, estarás listo para la fase de
            implementación.
          </p>
        </div>
      </div>
    </div>
  )
}
