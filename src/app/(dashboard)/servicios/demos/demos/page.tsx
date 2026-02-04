'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Grid3x3,
  Table2,
  Check,
  X,
  TrendingUp,
  Package,
  Users,
  Search,
  Filter,
  Command,
  Star,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ServiciosDemosHub() {
  const demos = [
    {
      id: 'd',
      name: 'Simplified Hybrid ⭐ NEW',
      subtitle: 'A+C Combined',
      description:
        'CRUD-first with balanced insights. Combines table view + mini KPIs + inline chart. Simple and practical.',
      path: '/servicios/demos/preview-d',
      score: 9.2,
      icon: Table2,
      gradient: 'from-violet-500 to-purple-600',
      bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
      strengths: [
        'Only 3 KPI cards (not overwhelming)',
        'Mini bar chart inline (top 5 services)',
        'Clean table view with 7 columns',
        'Actions always visible (no hover needed)',
        'Category filters + search',
        'Sortable columns with clear indicators',
      ],
      bestFor: 'Most users - balanced between simplicity and useful insights',
      features: {
        businessIntelligence: true,
        charts: true,
        categoryFilters: true,
        search: true,
        sortable: true,
        bulkActions: false,
        staffContext: true,
        visualHierarchy: false,
        analytics: true,
      },
    },
    {
      id: 'a',
      name: 'Dashboard Intelligence',
      subtitle: 'HubSpot-style',
      description:
        'Business intelligence first. KPIs, charts, and revenue insights prominently displayed.',
      path: '/servicios/demos/preview-a',
      score: 9.0,
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
      strengths: [
        'Revenue & bookings KPIs at top',
        'Service popularity charts',
        'Revenue trend over time',
        'Category distribution pie chart',
        'Analytics on every service card',
        'Business-focused insights',
      ],
      bestFor: 'Owners who want to track business performance and identify top services',
      features: {
        businessIntelligence: true,
        charts: true,
        categoryFilters: true,
        search: false,
        sortable: false,
        bulkActions: false,
        staffContext: true,
        visualHierarchy: true,
        analytics: true,
      },
    },
    {
      id: 'b',
      name: 'Visual Service Catalog',
      subtitle: 'Shopify-style',
      description:
        'Rich visual cards with prominent analytics. E-commerce-inspired gallery layout.',
      path: '/servicios/demos/preview-b',
      score: 8.5,
      icon: Grid3x3,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
      strengths: [
        'Large service cards with custom icons',
        'Color-coded by category',
        'Inline analytics (bookings, revenue, rating)',
        'Popularity progress bars',
        'Staff avatars prominently displayed',
        'Search + sort functionality',
      ],
      bestFor: 'Visual thinkers who want quick insights at a glance',
      features: {
        businessIntelligence: false,
        charts: false,
        categoryFilters: true,
        search: true,
        sortable: true,
        bulkActions: false,
        staffContext: true,
        visualHierarchy: true,
        analytics: true,
      },
    },
    {
      id: 'c',
      name: 'Operational Command Center',
      subtitle: 'Linear-style',
      description: 'Dense table view with sortable columns. Power-user focused with bulk actions.',
      path: '/servicios/demos/preview-c',
      score: 8.0,
      icon: Table2,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
      strengths: [
        'All info in one table (11 columns)',
        'Sortable columns (click to toggle)',
        'Bulk selection with checkboxes',
        'Bulk edit/delete actions',
        'Search + category filters',
        'Keyboard shortcuts',
      ],
      bestFor: 'Power users who manage many services and need efficiency',
      features: {
        businessIntelligence: false,
        charts: false,
        categoryFilters: true,
        search: true,
        sortable: true,
        bulkActions: true,
        staffContext: true,
        visualHierarchy: false,
        analytics: true,
      },
    },
  ]

  const featureLabels = {
    businessIntelligence: 'Business Intelligence',
    charts: 'Charts & Graphs',
    categoryFilters: 'Category Filters',
    search: 'Search',
    sortable: 'Sortable Columns',
    bulkActions: 'Bulk Actions',
    staffContext: 'Staff Assignment',
    visualHierarchy: 'Visual Hierarchy',
    analytics: 'Service Analytics',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-[40px] font-bold tracking-tight text-zinc-900 dark:text-white">
            Servicios Module - UI/UX Redesign
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            Explora 3 enfoques diferentes para gestionar el catálogo de servicios
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Module 5 of 7 - Phase 2: Demo Options
          </p>
        </motion.div>

        {/* Problem Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/30 dark:bg-amber-900/10"
        >
          <h2 className="mb-3 text-lg font-semibold text-amber-900 dark:text-amber-400">
            📊 Current State: 6.5/10 Score
          </h2>
          <div className="grid gap-2 text-sm text-amber-800 dark:text-amber-300 sm:grid-cols-2">
            <div>
              <p className="font-medium">❌ Missing:</p>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>Business intelligence dashboard</li>
                <li>Service categorization & filters</li>
                <li>Service analytics (bookings, revenue)</li>
                <li>Staff assignment visibility</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">❌ Also Missing:</p>
              <ul className="ml-4 mt-1 list-disc space-y-1">
                <li>Pricing intelligence (combos, upsell)</li>
                <li>Custom icons per service</li>
                <li>Status management (pause/archive)</li>
                <li>Smart duration & price suggestions</li>
              </ul>
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
            Ver análisis completo:{' '}
            <Link href="/SERVICIOS_AWWWARDS_ANALYSIS.md" className="underline">
              SERVICIOS_AWWWARDS_ANALYSIS.md
            </Link>
          </p>
        </motion.div>

        {/* Demo Cards */}
        <div className="mb-12 space-y-8">
          {demos.map((demo, idx) => (
            <motion.div
              key={demo.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
            >
              <Link href={demo.path}>
                <div
                  className={`group relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br ${demo.bgGradient} p-8 shadow-lg transition-all hover:shadow-2xl dark:border-zinc-800`}
                >
                  {/* Score Badge */}
                  <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm dark:bg-zinc-900/90">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                      {demo.score}/10
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div
                      className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${demo.gradient} shadow-lg`}
                    >
                      <demo.icon className="h-10 w-10 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                          Demo {demo.id.toUpperCase()}: {demo.name}
                        </h2>
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          {demo.subtitle}
                        </p>
                      </div>

                      <p className="mb-4 text-zinc-700 dark:text-zinc-300">{demo.description}</p>

                      {/* Strengths Grid */}
                      <div className="mb-4 grid gap-2 sm:grid-cols-2">
                        {demo.strengths.map((strength, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                            <span className="text-zinc-700 dark:text-zinc-300">{strength}</span>
                          </div>
                        ))}
                      </div>

                      {/* Best For */}
                      <div className="mb-4 rounded-xl bg-white/60 p-3 dark:bg-zinc-900/40">
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          MEJOR PARA:
                        </p>
                        <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                          {demo.bestFor}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <Button
                        className={`bg-gradient-to-r ${demo.gradient} text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
                      >
                        Ver Demo Completo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Matriz de Comparación
          </h2>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                      Demo A
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                      Demo B
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                      Demo C
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {Object.entries(featureLabels).map(([key, label]) => (
                    <tr key={key} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-6 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                        {label}
                      </td>
                      {demos.map((demo) => (
                        <td key={demo.id} className="px-6 py-3 text-center">
                          {demo.features[key as keyof typeof demo.features] ? (
                            <Check className="mx-auto h-5 w-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-zinc-300 dark:text-zinc-700" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Decision Guide */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl border border-blue-200 bg-blue-50 p-8 dark:border-blue-900/30 dark:bg-blue-900/10"
        >
          <h2 className="mb-4 text-2xl font-bold text-blue-900 dark:text-blue-400">
            🤔 ¿Cuál elegir?
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300">
                  ¿Quieres optimizar revenue y ver métricas de negocio?
                </p>
                <p className="mt-1 text-sm text-blue-800 dark:text-blue-400">
                  → <strong>Demo A: Dashboard Intelligence</strong> - KPIs y charts arriba
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Grid3x3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300">
                  ¿Prefieres visual hierarchy con cards grandes?
                </p>
                <p className="mt-1 text-sm text-blue-800 dark:text-blue-400">
                  → <strong>Demo B: Visual Catalog</strong> - Rich cards con analytics inline
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Command className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300">
                  ¿Gestionas muchos servicios y necesitas eficiencia?
                </p>
                <p className="mt-1 text-sm text-blue-800 dark:text-blue-400">
                  → <strong>Demo C: Command Center</strong> - Table view con bulk actions
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <Link
            href="/servicios"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            ← Volver a Servicios actual
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
