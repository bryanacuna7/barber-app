'use client'

import { useState } from 'react'
import {
  KPICard,
  RevenueKPICard,
  BookingsKPICard,
  ClientsKPICard,
  ServicesKPICard,
  GradientHeader,
  MeshGradientBackground,
} from '@/components/design-system'
import {
  DollarSign,
  Calendar,
  Users,
  Package,
  TrendingUp,
  Activity,
  Clock,
  Star,
  Zap,
  Target,
} from 'lucide-react'

/**
 * KPICard Test Page
 *
 * Interactive test page for KPICard component extracted from 7 winning demos.
 * Demonstrates all 3 variants: default, hero, and compact.
 *
 * Test at: http://localhost:3000/test-kpi-card
 */

export default function TestKPICardPage() {
  const [variant, setVariant] = useState<'default' | 'hero' | 'compact'>('default')
  const [showTrend, setShowTrend] = useState(true)
  const [showSparkline, setShowSparkline] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)

  // Mock data
  const sparklineData = [3000, 3200, 3100, 3400, 3300, 3600, 3500, 3800, 3700, 4000]

  return (
    <div className="relative min-h-screen bg-white dark:bg-zinc-950">
      {/* Mesh Gradient Background */}
      <MeshGradientBackground variant="subtle" />

      {/* Content */}
      <div className="relative p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <GradientHeader element="h1" size="lg">
            KPICard Component Test
          </GradientHeader>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl">
            Unified KPI card component extracted from 7 winning UI/UX demos (9.3/10 quality).
            Supports 3 variants: default, hero, and compact. Found in Clientes, Analiticas,
            Servicios, Mi Día, and Barberos demos.
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Interactive Controls
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Variant Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Variant
              </label>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm"
              >
                <option value="default">Default</option>
                <option value="hero">Hero</option>
                <option value="compact">Compact</option>
              </select>
            </div>

            {/* Show Trend Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showTrend"
                checked={showTrend}
                onChange={(e) => setShowTrend(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="showTrend"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Show Trend
              </label>
            </div>

            {/* Show Sparkline Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showSparkline"
                checked={showSparkline}
                onChange={(e) => setShowSparkline(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="showSparkline"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Show Sparkline
              </label>
            </div>

            {/* Show Subtitle Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showSubtitle"
                checked={showSubtitle}
                onChange={(e) => setShowSubtitle(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="showSubtitle"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Show Subtitle
              </label>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Live Preview</h3>

          <div
            className={
              variant === 'hero'
                ? 'grid grid-cols-1 gap-6'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
            }
          >
            {variant === 'hero' ? (
              <div className="col-span-1">
                <KPICard
                  variant="hero"
                  label="Ingresos Totales"
                  value="$45,231"
                  icon={<DollarSign className="h-8 w-8" />}
                  gradient="from-violet-600 via-purple-600 to-blue-600"
                  trend={
                    showTrend
                      ? {
                          direction: 'up',
                          percentage: 12.5,
                          showBadge: true,
                        }
                      : undefined
                  }
                  subtitle={showSubtitle ? 'Últimos 30 días' : undefined}
                  sparkline={showSparkline ? sparklineData : undefined}
                />
              </div>
            ) : (
              <>
                <KPICard
                  variant={variant}
                  label="Ingresos Totales"
                  value="$45,231"
                  icon={<DollarSign className="h-6 w-6" />}
                  iconBackground="bg-green-500/10"
                  iconColor="text-green-600 dark:text-green-400"
                  trend={
                    showTrend
                      ? {
                          direction: 'up',
                          percentage: 12.5,
                        }
                      : undefined
                  }
                  subtitle={showSubtitle ? 'Últimos 30 días' : undefined}
                  sparkline={showSparkline ? sparklineData : undefined}
                />

                <KPICard
                  variant={variant}
                  label="Citas Hoy"
                  value={28}
                  icon={<Calendar className="h-6 w-6" />}
                  iconBackground="bg-blue-500/10"
                  iconColor="text-blue-600 dark:text-blue-400"
                  trend={
                    showTrend
                      ? {
                          direction: 'down',
                          percentage: 5.2,
                        }
                      : undefined
                  }
                  subtitle={showSubtitle ? 'vs 32 ayer' : undefined}
                />

                <KPICard
                  variant={variant}
                  label="Clientes Activos"
                  value="1,234"
                  icon={<Users className="h-6 w-6" />}
                  iconBackground="bg-purple-500/10"
                  iconColor="text-purple-600 dark:text-purple-400"
                  trend={
                    showTrend
                      ? {
                          direction: 'neutral',
                          percentage: 0,
                        }
                      : undefined
                  }
                  subtitle={showSubtitle ? 'Sin cambios' : undefined}
                />

                <KPICard
                  variant={variant}
                  label="Servicios Activos"
                  value={12}
                  icon={<Package className="h-6 w-6" />}
                  iconBackground="bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30"
                  iconColor="text-violet-600 dark:text-violet-400"
                  trend={
                    showTrend
                      ? {
                          direction: 'up',
                          percentage: 8.3,
                        }
                      : undefined
                  }
                  subtitle={showSubtitle ? '+1 este mes' : undefined}
                />
              </>
            )}
          </div>
        </div>

        {/* All Variants Showcase */}
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">All Variants</h3>

          <div className="space-y-8">
            {/* Default Variant */}
            <div>
              <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                Default Variant
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  (from Clientes Demo Fusion)
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <RevenueKPICard
                  label="Ingresos Totales"
                  value="$45,231"
                  icon={<DollarSign className="h-6 w-6" />}
                  trend={{ direction: 'up', percentage: 12.5 }}
                />
                <BookingsKPICard
                  label="Reservas"
                  value={342}
                  icon={<Calendar className="h-6 w-6" />}
                  trend={{ direction: 'up', percentage: 8.2 }}
                />
                <ClientsKPICard
                  label="Nuevos Clientes"
                  value={89}
                  icon={<Users className="h-6 w-6" />}
                  trend={{ direction: 'down', percentage: 2.1 }}
                  subtitle="Este mes"
                />
                <ServicesKPICard
                  label="Servicios Populares"
                  value={5}
                  icon={<Star className="h-6 w-6" />}
                  trend={{ direction: 'neutral', percentage: 0 }}
                />
              </div>
            </div>

            {/* Hero Variant */}
            <div>
              <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                Hero Variant
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  (from Analiticas Demo Fusion)
                </span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hero takes 2 columns */}
                <div className="md:col-span-2">
                  <KPICard
                    variant="hero"
                    label="Ingresos del Mes"
                    value="$45,231"
                    icon={<DollarSign className="h-8 w-8" />}
                    gradient="from-violet-600 via-purple-600 to-blue-600"
                    trend={{ direction: 'up', percentage: 12.5, showBadge: true }}
                    sparkline={sparklineData}
                    subtitle="vs $40,205 mes pasado"
                  />
                </div>

                {/* Secondary cards stack */}
                <div className="space-y-6">
                  <KPICard
                    variant="hero"
                    label="Citas"
                    value={342}
                    icon={<Calendar className="h-6 w-6" />}
                    gradient="from-emerald-500 to-green-600"
                    trend={{ direction: 'up', percentage: 8.2, showBadge: true }}
                    subtitle="+28 vs semana pasada"
                  />
                  <KPICard
                    variant="hero"
                    label="Clientes"
                    value="1,234"
                    icon={<Users className="h-6 w-6" />}
                    gradient="from-amber-500 to-orange-600"
                    trend={{ direction: 'up', percentage: 5.7, showBadge: true }}
                    subtitle="+67 este mes"
                  />
                </div>
              </div>
            </div>

            {/* Compact Variant */}
            <div>
              <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                Compact Variant
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  (from Servicios Demo D - Sidebar)
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard
                  variant="compact"
                  label="Servicios Activos"
                  value={12}
                  icon={<Package className="h-5 w-5" />}
                  iconBackground="bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30"
                  iconColor="text-violet-600 dark:text-violet-400"
                />
                <KPICard
                  variant="compact"
                  label="Citas Hoy"
                  value={28}
                  icon={<Clock className="h-5 w-5" />}
                  iconBackground="bg-blue-500/10"
                  iconColor="text-blue-600 dark:text-blue-400"
                  trend={{ direction: 'up', percentage: 12 }}
                />
                <KPICard
                  variant="compact"
                  label="Ocupación"
                  value="87%"
                  icon={<Activity className="h-5 w-5" />}
                  iconBackground="bg-green-500/10"
                  iconColor="text-green-600 dark:text-green-400"
                  subtitle="Capacidad utilizada"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Examples from Demos */}
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
            Real-World Examples from Winning Demos
          </h3>

          <div className="space-y-8">
            {/* Example 1: Clientes Dashboard (Demo Fusion) */}
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                Clientes Dashboard
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  (Demo Fusion - lines 621-722)
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <RevenueKPICard
                  label="Ingresos Totales"
                  value="$45,231"
                  icon={<DollarSign className="h-6 w-6" />}
                  trend={{ direction: 'up', percentage: 12.5 }}
                />
                <BookingsKPICard
                  label="Total Clientes"
                  value="1,234"
                  icon={<Users className="h-6 w-6" />}
                  trend={{ direction: 'up', percentage: 5.7 }}
                />
                <KPICard
                  label="Clientes Nuevos"
                  value={89}
                  icon={<TrendingUp className="h-6 w-6" />}
                  iconBackground="bg-purple-500/10"
                  iconColor="text-purple-600 dark:text-purple-400"
                  trend={{ direction: 'up', percentage: 15.3 }}
                  subtitle="Este mes"
                />
                <KPICard
                  label="Tasa Retención"
                  value="94%"
                  icon={<Target className="h-6 w-6" />}
                  iconBackground="bg-emerald-500/10"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  trend={{ direction: 'up', percentage: 2.1 }}
                />
              </div>
            </div>

            {/* Example 2: Analiticas Intelligence Report (Demo Fusion) */}
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                Analytics Intelligence Report
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  (Demo Fusion - Bento Grid Layout)
                </span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hero Card */}
                <div className="md:col-span-2 h-[280px]">
                  <KPICard
                    variant="hero"
                    label="Ingresos del Mes"
                    value="$45,231"
                    icon={<DollarSign className="h-8 w-8" />}
                    gradient="from-violet-600 via-purple-600 to-blue-600"
                    trend={{ direction: 'up', percentage: 12.5, showBadge: true }}
                    sparkline={sparklineData}
                    subtitle="Superaste el objetivo mensual"
                  />
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-4">
                  <KPICard
                    variant="hero"
                    label="Citas Completadas"
                    value={342}
                    icon={<Calendar className="h-6 w-6" />}
                    gradient="from-emerald-500 to-green-600"
                    trend={{ direction: 'up', percentage: 8.2, showBadge: true }}
                  />
                  <KPICard
                    variant="hero"
                    label="Satisfacción"
                    value="4.8"
                    icon={<Star className="h-6 w-6" />}
                    gradient="from-amber-500 to-orange-600"
                    trend={{ direction: 'up', percentage: 5.7, showBadge: true }}
                    subtitle="Promedio de 342 reseñas"
                  />
                </div>
              </div>
            </div>

            {/* Example 3: Servicios Sidebar (Demo D) */}
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <h4 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
                Servicios Sidebar Stats
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  (Demo D - Compact Sidebar)
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ServicesKPICard
                  variant="compact"
                  label="Servicios Activos"
                  value={12}
                  icon={<Package className="h-5 w-5" />}
                />
                <KPICard
                  variant="compact"
                  label="Promedio Duración"
                  value="45min"
                  icon={<Clock className="h-5 w-5" />}
                  iconBackground="bg-blue-500/10"
                  iconColor="text-blue-600 dark:text-blue-400"
                />
                <KPICard
                  variant="compact"
                  label="Precio Promedio"
                  value="$28"
                  icon={<DollarSign className="h-5 w-5" />}
                  iconBackground="bg-green-500/10"
                  iconColor="text-green-600 dark:text-green-400"
                />
                <KPICard
                  variant="compact"
                  label="Más Popular"
                  value="Corte"
                  icon={<Zap className="h-5 w-5" />}
                  iconBackground="bg-amber-500/10"
                  iconColor="text-amber-600 dark:text-amber-400"
                  subtitle="234 reservas"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Component Info */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Component Information
          </h3>
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <strong>File:</strong> src/components/design-system/KPICard.tsx
            </p>
            <p>
              <strong>Lines:</strong> 458 lines
            </p>
            <p>
              <strong>Variants:</strong> 3 (default, hero, compact)
            </p>
            <p>
              <strong>Pre-configured:</strong> Revenue, Bookings, Clients, Services
            </p>
            <p>
              <strong>Found in demos:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Clientes Demo Fusion (lines 621-722) - Default with trends</li>
              <li>Analiticas Demo Fusion (lines 188-242, 537-586) - Hero + Secondary</li>
              <li>Servicios Demo D (lines 468-540) - Compact sidebar</li>
              <li>Mi Día Demo B (lines 699-724) - Simple stat cards</li>
              <li>Barberos Demo B (lines 381-409) - Mini stats grid</li>
            </ul>
            <p>
              <strong>Features:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>3 variants with distinct use cases</li>
              <li>Trend indicators (up/down/neutral)</li>
              <li>Sparkline charts (hero variant)</li>
              <li>Gradient backgrounds (hero variant)</li>
              <li>Icon with colored backgrounds</li>
              <li>Subtitle and comparison support</li>
              <li>Hover animations (scale 1.02)</li>
              <li>Fully responsive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
