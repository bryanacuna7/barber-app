'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertTriangle,
  Target,
  MessageCircle,
  ArrowRight,
  Crown,
  Star,
  UserPlus,
  User,
  ChevronRight,
  Sparkles,
  Calendar,
  ArrowUpRight,
} from 'lucide-react'
import {
  mockClients,
  mockStats,
  mockRevenueData,
  mockVisitFrequency,
  type MockClient,
} from '../mock-data'
import { formatCurrency } from '@/lib/utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const segmentConfig = {
  vip: {
    label: 'VIP',
    color: '#F59E0B',
    icon: Crown,
  },
  frequent: {
    label: 'Frecuente',
    color: '#3B82F6',
    icon: Star,
  },
  new: {
    label: 'Nuevo',
    color: '#22C55E',
    icon: UserPlus,
  },
  inactive: {
    label: 'Inactivo',
    color: '#6B7280',
    icon: User,
  },
}

export default function PreviewAPage() {
  const [selectedInsight, setSelectedInsight] = useState<'churn' | 'winback' | 'upsell' | null>(
    'churn'
  )

  // Calculate insights
  const churnRiskClients = mockClients
    .filter((c) => (c.churn_risk || 0) >= 50)
    .sort((a, b) => (b.churn_risk || 0) - (a.churn_risk || 0))
    .slice(0, 8)

  const winbackClients = mockClients
    .filter((c) => c.segment === 'inactive' && c.total_visits >= 3)
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 12)

  const upsellCandidates = mockClients
    .filter((c) => c.segment === 'frequent' && c.total_visits >= 3)
    .sort((a, b) => b.total_visits - a.total_visits)
    .slice(0, 5)

  // Segment pie data
  const segmentPieData = [
    { name: 'VIP', value: mockStats.segments.vip, color: '#F59E0B' },
    { name: 'Frecuente', value: mockStats.segments.frequent, color: '#3B82F6' },
    { name: 'Nuevo', value: mockStats.segments.new, color: '#22C55E' },
    { name: 'Inactivo', value: mockStats.segments.inactive, color: '#6B7280' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Dashboard Clientes
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Demo A: Dashboard-First Intelligence (HubSpot-style)
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium shadow-lg">
            <Sparkles className="h-4 w-4" />
            AI Insights On
          </div>
        </div>

        {/* KPI Cards Row - With Trends */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Ingresos Totales
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(mockStats.totalRevenue)}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-400">+12.5%</span>
                  <span className="text-zinc-500">vs mes anterior</span>
                </div>
              </div>
              <div className="rounded-xl bg-green-500/10 p-3">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </motion.div>

          {/* Active Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Clientes Activos
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {mockStats.activeClients}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-blue-600 dark:text-blue-400">+8</span>
                  <span className="text-zinc-500">este mes</span>
                </div>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          {/* Churn Risk */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Riesgo Alto</p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {mockStats.churnRisk.high}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    Acción requerida
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-orange-500/10 p-3">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </motion.div>

          {/* Avg Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Valor Promedio
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(mockStats.avgValue)}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="font-semibold text-red-600 dark:text-red-400">-3.2%</span>
                  <span className="text-zinc-500">vs mes anterior</span>
                </div>
              </div>
              <div className="rounded-xl bg-purple-500/10 p-3">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend - 2 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Tendencia de Ingresos
              </h3>
              <p className="text-sm text-zinc-500">Últimos 6 meses</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Segment Distribution - 1 column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Distribución</h3>
              <p className="text-sm text-zinc-500">Por segmento</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={segmentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {segmentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {segmentPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visit Frequency - Full width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-3 rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Frecuencia de Visitas
              </h3>
              <p className="text-sm text-zinc-500">Distribución de días entre visitas</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mockVisitFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="range" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {mockVisitFrequency.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* AI Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-1"
        >
          <div className="rounded-xl bg-white dark:bg-zinc-900 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Insights Inteligentes
                </h3>
                <p className="text-sm text-zinc-500">Acciones recomendadas por IA</p>
              </div>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Churn Risk */}
              <button
                onClick={() => setSelectedInsight('churn')}
                className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all ${
                  selectedInsight === 'churn'
                    ? 'bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-500'
                    : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        Riesgo de Pérdida
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {churnRiskClients.length}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">clientes en riesgo alto</p>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-zinc-400 transition-transform ${
                      selectedInsight === 'churn' ? 'rotate-90 text-orange-500' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Win-back */}
              <button
                onClick={() => setSelectedInsight('winback')}
                className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all ${
                  selectedInsight === 'winback'
                    ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                    : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        Recuperación
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {winbackClients.length}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">inactivos recuperables</p>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-zinc-400 transition-transform ${
                      selectedInsight === 'winback' ? 'rotate-90 text-blue-500' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Upsell */}
              <button
                onClick={() => setSelectedInsight('upsell')}
                className={`group relative overflow-hidden rounded-xl p-4 text-left transition-all ${
                  selectedInsight === 'upsell'
                    ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500'
                    : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        Upsell VIP
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {upsellCandidates.length}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">candidatos a VIP</p>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-zinc-400 transition-transform ${
                      selectedInsight === 'upsell' ? 'rotate-90 text-green-500' : ''
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Detailed View */}
            {selectedInsight && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                {selectedInsight === 'churn' && (
                  <>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-zinc-900 dark:text-white">
                        Clientes en Riesgo Alto (&gt;50%)
                      </h4>
                      <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        Enviar WhatsApp a todos
                      </button>
                    </div>
                    <div className="space-y-2">
                      {churnRiskClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-sm font-semibold text-orange-700 dark:text-orange-300">
                              {client.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-white">
                                {client.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Última visita hace{' '}
                                {Math.floor(
                                  (new Date().getTime() -
                                    new Date(client.last_visit_at).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )}{' '}
                                días
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                {client.churn_risk}% riesgo
                              </p>
                              <p className="text-xs text-zinc-500">{client.total_visits} visitas</p>
                            </div>
                            <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selectedInsight === 'winback' && (
                  <>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-zinc-900 dark:text-white">
                        Oportunidades de Recuperación
                      </h4>
                      <button className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        Campaña Win-Back
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {winbackClients.slice(0, 8).map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-sm font-semibold text-blue-700 dark:text-blue-300">
                              {client.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-white text-sm">
                                {client.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {formatCurrency(client.total_spent)} gastados
                              </p>
                            </div>
                          </div>
                          <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {selectedInsight === 'upsell' && (
                  <>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-zinc-900 dark:text-white">
                        Candidatos a Programa VIP
                      </h4>
                      <button className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors">
                        <Crown className="h-4 w-4" />
                        Ofrecer VIP
                      </button>
                    </div>
                    <div className="space-y-2">
                      {upsellCandidates.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-sm font-semibold text-green-700 dark:text-green-300">
                              {client.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-white">
                                {client.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {client.total_visits} visitas • Cada{' '}
                                {client.avg_days_between_visits} días
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {client.loyalty_progress}% lealtad
                              </p>
                              <p className="text-xs text-zinc-500">
                                {formatCurrency(client.total_spent)}
                              </p>
                            </div>
                            <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
                              <Crown className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Client List - Secondary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-zinc-200 dark:border-zinc-800"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Todos los Clientes
              </h3>
              <p className="text-sm text-zinc-500">{mockStats.totalClients} registrados</p>
            </div>
            <button className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
              Ver lista completa
            </button>
          </div>
          <div className="space-y-2">
            {mockClients.slice(0, 5).map((client) => {
              const Icon = segmentConfig[client.segment].icon
              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                        {client.name.charAt(0)}
                      </div>
                      {client.segment === 'vip' && (
                        <div className="absolute -top-1 -right-1 rounded-full bg-amber-500 p-0.5">
                          <Crown className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">{client.name}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Icon className="h-3 w-3" />
                        {segmentConfig[client.segment].label}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {formatCurrency(client.total_spent)}
                    </p>
                    <p className="text-xs text-zinc-500">{client.total_visits} visitas</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
