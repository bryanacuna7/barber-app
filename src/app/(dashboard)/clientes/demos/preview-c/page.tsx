'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  Star,
  UserPlus,
  User,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Scissors,
  Bell,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  DollarSign,
  Heart,
  Zap,
  X,
  ChevronRight,
} from 'lucide-react'
import { mockClients, type MockClient } from '../mock-data'
import { formatCurrency } from '@/lib/utils'
import { format, formatDistanceToNow, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

const segmentConfig = {
  vip: { label: 'VIP', color: '#F59E0B', icon: Crown },
  frequent: { label: 'Frecuente', color: '#3B82F6', icon: Star },
  new: { label: 'Nuevo', color: '#22C55E', icon: UserPlus },
  inactive: { label: 'Inactivo', color: '#6B7280', icon: User },
}

// Relationship strength indicator
function RelationshipStrength({ score }: { score: number }) {
  const bars = Math.ceil(score / 25)
  return (
    <div className="flex items-center gap-1">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`h-4 w-1 rounded-full ${
            i < bars
              ? score >= 75
                ? 'bg-green-500'
                : score >= 50
                  ? 'bg-blue-500'
                  : score >= 25
                    ? 'bg-orange-500'
                    : 'bg-red-500'
              : 'bg-zinc-200 dark:bg-zinc-700'
          }`}
        />
      ))}
    </div>
  )
}

// Activity timeline item
function ActivityItem({
  type,
  date,
  details,
}: {
  type: 'visit' | 'message' | 'note'
  date: Date
  details: string
}) {
  const icons = {
    visit: { icon: Scissors, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    message: {
      icon: MessageCircle,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    note: { icon: Bell, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  }
  const Icon = icons[type].icon
  return (
    <div className="flex gap-3">
      <div className={`rounded-full ${icons[type].bg} p-2 shrink-0`}>
        <Icon className={`h-4 w-4 ${icons[type].color}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-zinc-900 dark:text-white">{details}</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {formatDistanceToNow(date, { addSuffix: true, locale: es })}
        </p>
      </div>
    </div>
  )
}

export default function PreviewCPage() {
  const [selectedClient, setSelectedClient] = useState<MockClient | null>(null)
  const [showNotifications, setShowNotifications] = useState(true)

  // Generate smart notifications
  const notifications = mockClients
    .filter((c) => {
      const daysSinceVisit = Math.floor(
        (new Date().getTime() - new Date(c.last_visit_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      return (
        (c.segment === 'vip' && daysSinceVisit > 21) ||
        (c.segment === 'frequent' && daysSinceVisit > 30) ||
        (c.segment === 'inactive' && daysSinceVisit > 45 && c.total_visits >= 3)
      )
    })
    .slice(0, 5)

  // Mock activity timeline for selected client
  const generateTimeline = (client: MockClient) => {
    const timeline = []
    const lastVisit = new Date(client.last_visit_at)
    timeline.push({
      type: 'visit' as const,
      date: lastVisit,
      details: `Servicio: ${client.favorite_service || 'Corte Regular'} - ${formatCurrency(8000)}`,
    })
    if (client.total_visits >= 2) {
      timeline.push({
        type: 'visit' as const,
        date: subDays(lastVisit, client.avg_days_between_visits || 14),
        details: `Servicio: ${client.favorite_service || 'Corte Simple'} - ${formatCurrency(7500)}`,
      })
    }
    if (client.notes) {
      timeline.push({
        type: 'note' as const,
        date: subDays(lastVisit, 60),
        details: `Nota agregada: "${client.notes}"`,
      })
    }
    if (client.referrals && client.referrals > 0) {
      timeline.push({
        type: 'message' as const,
        date: subDays(lastVisit, 90),
        details: `Refirió ${client.referrals} ${client.referrals === 1 ? 'cliente' : 'clientes'}`,
      })
    }
    return timeline
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Relationship CRM
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Demo C: Relationship Depth (Linear-style)</p>
          </div>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl bg-white dark:bg-zinc-900 p-3 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            {notifications.length > 0 && (
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {notifications.length}
              </div>
            )}
          </button>
        </div>

        {/* Smart Notifications */}
        <AnimatePresence>
          {showNotifications && notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      Acciones Sugeridas
                    </h3>
                    <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                      {notifications.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {notifications.map((client) => {
                    const daysSinceVisit = Math.floor(
                      (new Date().getTime() - new Date(client.last_visit_at).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                    return (
                      <div
                        key={client.id}
                        className="flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 text-sm font-semibold text-orange-700 dark:text-orange-300">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              {client.name}
                            </p>
                            <p className="text-xs text-zinc-500">
                              Sin visitas por {daysSinceVisit} días •{' '}
                              {client.segment === 'vip'
                                ? 'Cliente VIP'
                                : client.total_visits >= 3
                                  ? 'Alta recuperación'
                                  : 'Seguimiento'}
                            </p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          Enviar recordatorio
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Layout: List + Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Clientes ({mockClients.length})
              </h3>
              <div className="flex gap-2">
                {[
                  { key: 'vip', icon: Crown, color: 'text-amber-500' },
                  { key: 'frequent', icon: Star, color: 'text-blue-500' },
                  { key: 'new', icon: UserPlus, color: 'text-green-500' },
                ].map(({ key, icon: Icon, color }) => (
                  <button
                    key={key}
                    className="rounded-lg bg-white dark:bg-zinc-900 p-2 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Icon className={`h-4 w-4 ${color}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {mockClients.slice(0, 30).map((client) => {
                const config = segmentConfig[client.segment]
                const Icon = config.icon
                const isSelected = selectedClient?.id === client.id
                return (
                  <motion.button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`group w-full text-left rounded-xl border-2 p-3 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                          {client.name.charAt(0)}
                        </div>
                        {client.segment === 'vip' && (
                          <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-500 p-0.5">
                            <Crown className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-zinc-900 dark:text-white truncate text-sm">
                            {client.name}
                          </p>
                          <RelationshipStrength score={client.loyalty_progress || 0} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Icon className="h-3 w-3" style={{ color: config.color }} />
                          <span className="text-xs text-zinc-500">{config.label}</span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-500">
                            {client.total_visits} visitas
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 text-zinc-400 transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Client Detail Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedClient ? (
                <motion.div
                  key={selectedClient.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Profile Header */}
                  <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-2xl font-bold text-zinc-600 dark:text-zinc-300">
                            {selectedClient.name.charAt(0)}
                          </div>
                          {selectedClient.segment === 'vip' && (
                            <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-1.5">
                              <Crown className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                            {selectedClient.name}
                          </h2>
                          <div className="flex items-center gap-3 mt-1">
                            <div
                              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: `${segmentConfig[selectedClient.segment].color}15`,
                                color: segmentConfig[selectedClient.segment].color,
                              }}
                            >
                              {segmentConfig[selectedClient.segment].label}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-zinc-500">
                              <RelationshipStrength score={selectedClient.loyalty_progress || 0} />
                              <span className="ml-1">
                                {selectedClient.loyalty_progress || 0}% engagement
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                          <Phone className="h-5 w-5" />
                        </button>
                        <button className="rounded-lg bg-green-500 p-2 text-white hover:bg-green-600 transition-colors">
                          <MessageCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3">
                        <Phone className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-900 dark:text-white">
                          {selectedClient.phone}
                        </span>
                      </div>
                      {selectedClient.email && (
                        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-3">
                          <Mail className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm text-zinc-900 dark:text-white truncate">
                            {selectedClient.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Scissors className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            Visitas
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                          {selectedClient.total_visits}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <p className="text-xs font-medium text-green-600 dark:text-green-400">
                            Gastado
                          </p>
                        </div>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          {formatCurrency(selectedClient.total_spent)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                            Frecuencia
                          </p>
                        </div>
                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                          {selectedClient.avg_days_between_visits || 'N/A'}d
                        </p>
                      </div>
                      <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                            Lealtad
                          </p>
                        </div>
                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                          {selectedClient.loyalty_progress || 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Historial de Actividad
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {generateTimeline(selectedClient).map((item, i) => (
                        <ActivityItem key={i} {...item} />
                      ))}
                    </div>
                  </div>

                  {/* Insights & Predictions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Next Visit Prediction */}
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-zinc-900 dark:text-white">
                          Próxima Visita Estimada
                        </h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedClient.avg_days_between_visits
                          ? `En ${Math.max(0, selectedClient.avg_days_between_visits - Math.floor((new Date().getTime() - new Date(selectedClient.last_visit_at).getTime()) / (1000 * 60 * 60 * 24)))} días`
                          : 'Datos insuficientes'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Basado en promedio de {selectedClient.avg_days_between_visits || 0} días
                      </p>
                    </div>

                    {/* Churn Risk */}
                    <div
                      className={`rounded-xl p-4 border ${
                        (selectedClient.churn_risk || 0) >= 50
                          ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800'
                          : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap
                          className={`h-5 w-5 ${
                            (selectedClient.churn_risk || 0) >= 50
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        />
                        <h4 className="font-semibold text-zinc-900 dark:text-white">
                          Riesgo de Pérdida
                        </h4>
                      </div>
                      <p
                        className={`text-2xl font-bold ${
                          (selectedClient.churn_risk || 0) >= 50
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {selectedClient.churn_risk || 0}%
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {(selectedClient.churn_risk || 0) >= 50
                          ? 'Acción inmediata recomendada'
                          : 'Cliente satisfecho y leal'}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedClient.notes && (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                        Notas
                      </h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        {selectedClient.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full min-h-[400px] rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="text-center">
                    <User className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                    <p className="mt-4 text-zinc-500">
                      Selecciona un cliente para ver su perfil completo
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
