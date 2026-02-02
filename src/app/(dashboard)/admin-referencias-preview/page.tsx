'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  UserCheck,
  Trophy,
  TrendingUp,
  DollarSign,
  Target,
  Award,
  Crown,
  AlertCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Mock data para super admin
const adminMockData = {
  globalStats: {
    totalBusinessesInProgram: 47,
    totalReferrals: 156,
    successfulConversions: 89,
    conversionRate: 57.1,
    totalRewardsCost: 2847, // USD
    totalRevenue: 12780, // USD from converted referrals
    roi: 348, // % ROI
    activeThisMonth: 23,
  },
  topReferrers: [
    {
      id: '1',
      businessName: 'Barbería El Clásico',
      owner: 'Carlos Méndez',
      totalReferrals: 23,
      successfulReferrals: 18,
      currentMilestone: 5,
      rewardsEarned: '$348',
      badge: '⭐ Network King',
    },
    {
      id: '2',
      businessName: 'The Gentleman Barber',
      owner: 'Luis Fernández',
      totalReferrals: 18,
      successfulReferrals: 15,
      currentMilestone: 4,
      rewardsEarned: '$232',
      badge: '💎 Super Connector',
    },
    {
      id: '3',
      businessName: 'Barber Studio Premium',
      owner: 'Jorge Ramírez',
      totalReferrals: 14,
      successfulReferrals: 12,
      currentMilestone: 4,
      rewardsEarned: '$232',
      badge: '💎 Super Connector',
    },
    {
      id: '4',
      businessName: 'Urban Cuts',
      owner: 'Miguel Torres',
      totalReferrals: 11,
      successfulReferrals: 9,
      currentMilestone: 3,
      rewardsEarned: '$116',
      badge: '🥇 Network Builder',
    },
    {
      id: '5',
      businessName: 'La Barbería Moderna',
      owner: 'Roberto Silva',
      totalReferrals: 9,
      successfulReferrals: 7,
      currentMilestone: 3,
      rewardsEarned: '$87',
      badge: '🥇 Network Builder',
    },
  ],
  milestoneDistribution: {
    milestone1: 12, // businesses at milestone 1
    milestone2: 15,
    milestone3: 11,
    milestone4: 6,
    milestone5: 3,
  },
  recentConversions: [
    {
      id: '1',
      referrerBusiness: 'Barbería El Clásico',
      referredBusiness: 'New Style Barbershop',
      date: '2026-02-01',
      status: 'active',
      value: '$29/mes',
    },
    {
      id: '2',
      referrerBusiness: 'The Gentleman Barber',
      referredBusiness: 'Classic Cuts',
      date: '2026-01-31',
      status: 'trial',
      value: '$29/mes',
    },
    {
      id: '3',
      referrerBusiness: 'Urban Cuts',
      referredBusiness: 'Fade Masters',
      date: '2026-01-30',
      status: 'active',
      value: '$29/mes',
    },
  ],
  programHealth: {
    averageReferralsPerBusiness: 3.3,
    topPerformerReferrals: 23,
    medianConversionTime: 5, // days
    churnRateOfReferrals: 8.5, // %
  },
}

export default function AdminReferenciasPreviewPage() {
  const stats = adminMockData.globalStats
  const health = adminMockData.programHealth

  const globalStatsCards = [
    {
      title: 'Negocios en Programa',
      value: stats.totalBusinessesInProgram,
      subtitle: `${stats.activeThisMonth} activos este mes`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Referencias Totales',
      value: stats.totalReferrals,
      subtitle: `${stats.successfulConversions} convertidas`,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Tasa de Conversión',
      value: `${stats.conversionRate}%`,
      subtitle: 'Global del programa',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'ROI del Programa',
      value: `${stats.roi}%`,
      subtitle: `$${stats.totalRevenue} revenue vs $${stats.totalRewardsCost} costo`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ]

  const healthMetrics = [
    {
      label: 'Promedio Referidos/Negocio',
      value: health.averageReferralsPerBusiness,
      status: 'good',
    },
    {
      label: 'Top Performer',
      value: `${health.topPerformerReferrals} referidos`,
      status: 'excellent',
    },
    {
      label: 'Tiempo de Conversión',
      value: `${health.medianConversionTime} días`,
      status: 'good',
    },
    {
      label: 'Churn de Referidos',
      value: `${health.churnRateOfReferrals}%`,
      status: health.churnRateOfReferrals < 10 ? 'good' : 'warning',
    },
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      good: 'bg-blue-100 text-blue-700 border-blue-300',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      danger: 'bg-red-100 text-red-700 border-red-300',
    }
    return colors[status as keyof typeof colors] || colors.good
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-8 w-8" />
                <h1 className="text-2xl md:text-3xl font-bold">
                  Super Admin - Sistema de Referencias
                </h1>
              </div>
              <p className="text-indigo-100">Vista global del programa de referencias del SaaS</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">Admin View</Badge>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {globalStatsCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl ${card.bgColor}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">{card.subtitle}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Program Health Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Salud del Programa
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {healthMetrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`p-4 rounded-lg border-2 ${getStatusColor(metric.status)}`}
                >
                  <p className="text-xs font-medium mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Main Grid: Leaderboard + Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Referrers Leaderboard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    🏆 Top Referidores
                  </h3>
                </div>
                <Button variant="outline" size="sm">
                  Ver Todos
                </Button>
              </div>

              <div className="space-y-3">
                {adminMockData.topReferrers.map((business, index) => (
                  <motion.div
                    key={business.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {/* Rank */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : index === 1
                            ? 'bg-gray-100 text-gray-700'
                            : index === 2
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Business Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {business.businessName}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{business.owner}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {business.successfulReferrals}/{business.totalReferrals}
                      </p>
                      <p className="text-xs text-zinc-500">convertidos</p>
                    </div>

                    {/* Badge */}
                    <div className="text-center min-w-[120px]">
                      <Badge className="text-xs">{business.badge}</Badge>
                      <p className="text-xs text-zinc-500 mt-1">{business.rewardsEarned}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Milestone Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                Distribución de Milestones
              </h3>

              <div className="space-y-4">
                {[
                  {
                    level: 1,
                    icon: '🥉',
                    name: 'First Partner',
                    count: adminMockData.milestoneDistribution.milestone1,
                  },
                  {
                    level: 2,
                    icon: '🥈',
                    name: 'Growth Partner',
                    count: adminMockData.milestoneDistribution.milestone2,
                  },
                  {
                    level: 3,
                    icon: '🥇',
                    name: 'Network Builder',
                    count: adminMockData.milestoneDistribution.milestone3,
                  },
                  {
                    level: 4,
                    icon: '💎',
                    name: 'Super Connector',
                    count: adminMockData.milestoneDistribution.milestone4,
                  },
                  {
                    level: 5,
                    icon: '⭐',
                    name: 'Network King',
                    count: adminMockData.milestoneDistribution.milestone5,
                  },
                ].map((milestone) => (
                  <div key={milestone.level} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{milestone.icon}</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {milestone.name}
                        </span>
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {milestone.count}
                      </span>
                    </div>
                    <Progress
                      value={(milestone.count / stats.totalBusinessesInProgram) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Total en programa</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {stats.totalBusinessesInProgram}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Conversions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Conversiones Recientes
              </h3>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Referidor
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Negocio Referido
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Estado
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {adminMockData.recentConversions.map((conversion) => (
                    <tr
                      key={conversion.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-zinc-900 dark:text-zinc-100">
                        {conversion.referrerBusiness}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {conversion.referredBusiness}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(conversion.date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant={conversion.status === 'active' ? 'default' : 'secondary'}>
                          {conversion.status === 'active' ? 'Activo' : 'Trial'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-green-600">
                        {conversion.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Insights & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  💡 Insights del Programa
                </h3>
                <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✅</span>
                    <span>
                      <strong>ROI excelente:</strong> Por cada $1 invertido en recompensas, generas
                      $4.48 en revenue.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">📊</span>
                    <span>
                      <strong>Top 5 referidores</strong> representan el 45% de todas las
                      conversiones. Considera un programa especial para ellos.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">⚡</span>
                    <span>
                      <strong>Oportunidad:</strong> 15 negocios están a 1-2 referidos del siguiente
                      milestone. Envía recordatorio!
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
