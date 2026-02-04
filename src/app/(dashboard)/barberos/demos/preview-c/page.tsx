'use client'

/**
 * Demo C: Leaderboard Command Center (Linear-Style)
 * Score: 8/10
 *
 * Features:
 * - Podium for top 3 performers
 * - Leaderboard table with rankings
 * - Trend indicators (↑↓ vs previous period)
 * - Recent activity feed inline
 * - Medal badges for top performers
 * - Period filters (Week/Month/All Time)
 * - Mobile-optimized podium and list
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Crown,
  Medal,
  UserRound,
  Calendar,
  DollarSign,
  Clock,
  Flame,
  Zap,
  Target,
  Activity,
} from 'lucide-react'
import {
  mockBarbers,
  formatCurrency,
  getRoleBadgeColor,
  getRoleLabel,
  type MockBarber,
} from '../mock-data'

type Period = 'week' | 'month' | 'alltime'

export default function PreviewC() {
  const [period, setPeriod] = useState<Period>('month')

  // Sort barbers by revenue
  const rankedBarbers = useMemo(() => {
    return [...mockBarbers]
      .filter((b) => b.is_active)
      .sort((a, b) => b.stats.revenue_this_month - a.stats.revenue_this_month)
  }, [])

  const topThree = rankedBarbers.slice(0, 3)
  const restOfBarbers = rankedBarbers.slice(3)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
                Demo C: Leaderboard Command Center
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Linear-style • Rankings competitivos con gamification
              </p>
            </div>
          </div>
        </motion.div>

        {/* Period Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Mostrando rendimiento del mes actual
          </p>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
            {[
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mes' },
              { value: 'alltime', label: 'Todo' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPeriod(value as Period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === value
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Podium - Top 3 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            Top Performers
          </h2>

          {/* Desktop Podium Layout */}
          <div className="hidden md:flex items-end justify-center gap-4">
            {/* 2nd Place */}
            {topThree[1] && <PodiumCard barber={topThree[1]} rank={2} height="h-48" />}

            {/* 1st Place */}
            {topThree[0] && <PodiumCard barber={topThree[0]} rank={1} height="h-64" />}

            {/* 3rd Place */}
            {topThree[2] && <PodiumCard barber={topThree[2]} rank={3} height="h-40" />}
          </div>

          {/* Mobile Podium Layout */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {topThree.map((barber, index) => (
              <PodiumCardMobile key={barber.id} barber={barber} rank={index + 1} />
            ))}
          </div>
        </motion.div>

        {/* Leaderboard Table */}
        {restOfBarbers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Resto del Equipo
              </h3>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {restOfBarbers.map((barber, index) => (
                <LeaderboardRow key={barber.id} barber={barber} rank={index + 4} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Podium Card (Desktop)
function PodiumCard({
  barber,
  rank,
  height,
}: {
  barber: MockBarber
  rank: number
  height: string
}) {
  const medalColors = {
    1: 'from-amber-400 to-yellow-500',
    2: 'from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700',
    3: 'from-amber-600 to-orange-700',
  }

  const medalIcons = {
    1: Crown,
    2: Medal,
    3: Medal,
  }

  const MedalIcon = medalIcons[rank as keyof typeof medalIcons]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`flex flex-col items-center ${rank === 1 ? 'w-64' : 'w-56'}`}
    >
      {/* Medal Badge */}
      <div
        className={`h-20 w-20 rounded-full bg-gradient-to-br ${
          medalColors[rank as keyof typeof medalColors]
        } flex items-center justify-center shadow-lg mb-4 relative`}
      >
        <MedalIcon className="h-10 w-10 text-white" />
        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center border-2 border-amber-400 text-sm font-bold text-amber-600">
          #{rank}
        </div>
      </div>

      {/* Card */}
      <div
        className={`w-full bg-gradient-to-br ${
          rank === 1
            ? 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-300 dark:border-amber-700'
            : 'from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-700'
        } rounded-2xl p-6 ${height} flex flex-col justify-between shadow-md`}
      >
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-3">
            <UserRound className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-bold text-zinc-900 dark:text-white text-center mb-1">
            {barber.name}
          </h3>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
              barber.role
            )}`}
          >
            {getRoleLabel(barber.role)}
          </span>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Ingresos</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              {formatCurrency(barber.stats.revenue_this_month)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Citas</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              {barber.stats.appointments_this_month}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Rating</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-zinc-900 dark:text-white">
                {barber.stats.client_rating}
              </span>
            </div>
          </div>

          {/* Trend */}
          {rank === 1 && (
            <div className="flex items-center gap-2 pt-3 border-t border-amber-200 dark:border-amber-800">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">
                +{barber.trends.revenue_change}% este mes
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Podium Card Mobile
function PodiumCardMobile({ barber, rank }: { barber: MockBarber; rank: number }) {
  const medalColors = {
    1: 'from-amber-400 to-yellow-500',
    2: 'from-zinc-300 to-zinc-400',
    3: 'from-amber-600 to-orange-700',
  }

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border ${
        rank === 1
          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700'
          : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
      }`}
    >
      {/* Medal */}
      <div
        className={`h-14 w-14 rounded-full bg-gradient-to-br ${
          medalColors[rank as keyof typeof medalColors]
        } flex items-center justify-center shadow-lg relative`}
      >
        <Trophy className="h-7 w-7 text-white" />
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-xs font-bold text-amber-600">
          #{rank}
        </div>
      </div>

      {/* Avatar */}
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
        <UserRound className="h-6 w-6 text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 dark:text-white truncate">{barber.name}</h3>
        <p className="text-sm text-zinc-500">{getRoleLabel(barber.role)}</p>
      </div>

      {/* Stats */}
      <div className="text-right">
        <p className="font-bold text-lg text-zinc-900 dark:text-white">
          {formatCurrency(barber.stats.revenue_this_month / 1000)}K
        </p>
        <p className="text-xs text-zinc-500">{barber.stats.appointments_this_month} citas</p>
      </div>
    </div>
  )
}

// Leaderboard Row
function LeaderboardRow({ barber, rank }: { barber: MockBarber; rank: number }) {
  const [showActivity, setShowActivity] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <span className="font-bold text-zinc-600 dark:text-zinc-400">#{rank}</span>
        </div>

        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
          <UserRound className="h-6 w-6 text-white" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-zinc-900 dark:text-white truncate">{barber.name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                barber.role
              )}`}
            >
              {getRoleLabel(barber.role)}
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(barber.stats.revenue_this_month)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{barber.stats.appointments_this_month} citas</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-zinc-900 dark:text-white">
                {barber.stats.client_rating}
              </span>
            </div>
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center gap-2">
          {barber.trends.trend_direction === 'up' ? (
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-600" />
          )}
          <span
            className={`font-semibold ${
              barber.trends.trend_direction === 'up' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {barber.trends.revenue_change > 0 ? '+' : ''}
            {barber.trends.revenue_change}%
          </span>
        </div>

        {/* Level Badge */}
        <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <span className="font-bold text-violet-700 dark:text-violet-300">
            {barber.gamification.level}
          </span>
        </div>

        {/* Quick Assign Button */}
        <button className="px-4 py-2 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300 rounded-xl text-sm font-medium transition-colors hidden lg:block">
          Asignar Cita
        </button>
      </div>

      {/* Recent Activity */}
      {barber.recent_activity.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setShowActivity(!showActivity)}
            className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <Activity className="h-4 w-4" />
            {showActivity ? 'Ocultar' : 'Ver'} actividad reciente
          </button>

          <AnimatePresence>
            {showActivity && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                {barber.recent_activity.slice(0, 3).map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3"
                  >
                    {activity.type === 'achievement' && (
                      <Award className="h-4 w-4 text-amber-600 mt-0.5" />
                    )}
                    {activity.type === 'review' && (
                      <Star className="h-4 w-4 text-amber-600 mt-0.5" />
                    )}
                    {activity.type === 'appointment' && (
                      <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-zinc-900 dark:text-white">{activity.description}</p>
                      <p className="text-xs text-zinc-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
