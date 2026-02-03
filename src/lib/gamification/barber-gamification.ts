/**
 * Barber Gamification System - Business Logic
 *
 * Handles achievements, challenges, leaderboards, and stats for barbers
 * Phase 2 of Gamification System
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export type AchievementCategory = 'revenue' | 'appointments' | 'clients' | 'streak' | 'special'
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary'
export type ChallengeType = 'revenue' | 'appointments' | 'clients' | 'team_total'

export interface BarberStats {
  id: string
  barber_id: string
  business_id: string
  total_appointments: number
  total_revenue: number
  total_clients: number
  avg_rating: number
  current_streak_days: number
  best_streak_days: number
  last_appointment_date: string | null
  revenue_rank: number | null
  appointments_rank: number | null
  clients_rank: number | null
}

export interface Achievement {
  id: string
  key: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  unlock_conditions: {
    type: string
    threshold: number
  }
  tier: AchievementTier
  display_order: number
  is_active: boolean
}

export interface EarnedAchievement {
  id: string
  barber_id: string
  achievement_id: string
  earned_at: string
  progress?: Record<string, unknown>
  achievement?: Achievement // joined data
}

export interface Challenge {
  id: string
  business_id: string
  name: string
  description: string
  challenge_type: ChallengeType
  target_value: number
  target_metric: string
  reward_description: string | null
  reward_amount: number | null
  starts_at: string
  ends_at: string
  is_active: boolean
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  barber_id: string
  current_value: number
  target_value: number
  completed_at: string | null
  rank: number | null
  barber?: {
    id: string
    name: string
    photo_url: string | null
  }
}

export interface LeaderboardEntry {
  barber_id: string
  name: string
  photo_url: string | null
  total_revenue: number
  total_appointments: number
  total_clients: number
  avg_rating: number
  rank: number
}

// ============================================
// ACHIEVEMENT HELPERS
// ============================================

/**
 * Get achievement progress for a barber
 */
export function getAchievementProgress(
  achievement: Achievement,
  stats: BarberStats
): { progress: number; isCompleted: boolean } {
  const { type, threshold } = achievement.unlock_conditions

  let current = 0

  switch (type) {
    case 'revenue':
      current = stats.total_revenue
      break
    case 'appointments':
      current = stats.total_appointments
      break
    case 'clients':
      current = stats.total_clients
      break
    case 'streak':
      current = stats.current_streak_days
      break
    default:
      current = 0
  }

  const progress = Math.min((current / threshold) * 100, 100)
  const isCompleted = current >= threshold

  return { progress, isCompleted }
}

/**
 * Group achievements by category
 */
export function groupAchievementsByCategory<
  T extends { category: AchievementCategory | string; display_order?: number },
>(achievements: T[]): Record<AchievementCategory, T[]> {
  const grouped: Record<AchievementCategory, T[]> = {
    revenue: [],
    appointments: [],
    clients: [],
    streak: [],
    special: [],
  }

  achievements.forEach((achievement) => {
    const category = achievement.category as AchievementCategory
    grouped[category].push(achievement)
  })

  // Sort each category by display_order if available
  Object.keys(grouped).forEach((category) => {
    grouped[category as AchievementCategory].sort((a, b) => {
      const aOrder = 'display_order' in a ? (a.display_order ?? 0) : 0
      const bOrder = 'display_order' in b ? (b.display_order ?? 0) : 0
      return aOrder - bOrder
    })
  })

  return grouped
}

/**
 * Get tier color for styling
 */
export function getTierColor(tier: AchievementTier): string {
  switch (tier) {
    case 'bronze':
      return 'text-orange-600 dark:text-orange-400'
    case 'silver':
      return 'text-zinc-400 dark:text-zinc-300'
    case 'gold':
      return 'text-amber-500 dark:text-amber-400'
    case 'platinum':
      return 'text-blue-500 dark:text-blue-400'
    case 'legendary':
      return 'text-purple-600 dark:text-purple-400'
    default:
      return 'text-zinc-500'
  }
}

/**
 * Get tier badge background
 */
export function getTierBadgeClass(tier: AchievementTier): string {
  switch (tier) {
    case 'bronze':
      return 'bg-gradient-to-br from-orange-400 to-orange-600'
    case 'silver':
      return 'bg-gradient-to-br from-zinc-300 to-zinc-500'
    case 'gold':
      return 'bg-gradient-to-br from-amber-400 to-amber-600'
    case 'platinum':
      return 'bg-gradient-to-br from-blue-400 to-blue-600'
    case 'legendary':
      return 'bg-gradient-to-br from-purple-500 to-pink-600'
    default:
      return 'bg-zinc-400'
  }
}

// ============================================
// LEADERBOARD HELPERS
// ============================================

/**
 * Calculate leaderboard rankings
 */
export function calculateRankings(
  stats: BarberStats[],
  metric: 'revenue' | 'appointments' | 'clients'
): LeaderboardEntry[] {
  // Sort by metric descending
  const sorted = [...stats].sort((a, b) => {
    const aValue =
      metric === 'revenue'
        ? a.total_revenue
        : metric === 'appointments'
          ? a.total_appointments
          : a.total_clients
    const bValue =
      metric === 'revenue'
        ? b.total_revenue
        : metric === 'appointments'
          ? b.total_appointments
          : b.total_clients
    return bValue - aValue
  })

  // Assign ranks
  return sorted.map((stat, index) => ({
    barber_id: stat.barber_id,
    name: '', // To be joined from barbers table
    photo_url: null,
    total_revenue: stat.total_revenue,
    total_appointments: stat.total_appointments,
    total_clients: stat.total_clients,
    avg_rating: stat.avg_rating,
    rank: index + 1,
  }))
}

/**
 * Get rank display with medal
 */
export function getRankDisplay(rank: number): { emoji: string; color: string } {
  switch (rank) {
    case 1:
      return { emoji: '🥇', color: 'text-amber-500' }
    case 2:
      return { emoji: '🥈', color: 'text-zinc-400' }
    case 3:
      return { emoji: '🥉', color: 'text-orange-600' }
    default:
      return { emoji: `#${rank}`, color: 'text-zinc-500' }
  }
}

// ============================================
// CHALLENGE HELPERS
// ============================================

/**
 * Calculate challenge progress percentage
 */
export function getChallengeProgress(participant: ChallengeParticipant): number {
  return Math.min((participant.current_value / participant.target_value) * 100, 100)
}

/**
 * Check if challenge is active
 */
export function isChallengeActive(challenge: Challenge): boolean {
  const now = new Date()
  const starts = new Date(challenge.starts_at)
  const ends = new Date(challenge.ends_at)
  return challenge.is_active && now >= starts && now <= ends
}

/**
 * Get time remaining in challenge
 */
export function getChallengeTimeRemaining(challenge: Challenge): {
  days: number
  hours: number
  isEnded: boolean
} {
  const now = new Date()
  const ends = new Date(challenge.ends_at)
  const diff = ends.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, isEnded: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  return { days, hours, isEnded: false }
}

/**
 * Get challenge type display name
 */
export function getChallengeTypeDisplay(type: ChallengeType): { label: string; icon: string } {
  switch (type) {
    case 'revenue':
      return { label: 'Ingresos', icon: '💰' }
    case 'appointments':
      return { label: 'Citas', icon: '📅' }
    case 'clients':
      return { label: 'Clientes', icon: '👥' }
    case 'team_total':
      return { label: 'Equipo', icon: '🏆' }
    default:
      return { label: 'Desafío', icon: '🎯' }
  }
}

// ============================================
// STATS FORMATTING
// ============================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `₡${amount.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Format large numbers (e.g., 1.2k, 5M)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

/**
 * Get streak emoji based on length
 */
export function getStreakEmoji(days: number): string {
  if (days >= 30) return '🔥🔥🔥'
  if (days >= 14) return '🔥🔥'
  if (days >= 7) return '🔥'
  return '📅'
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate challenge dates
 */
export function validateChallengeDates(
  startsAt: Date,
  endsAt: Date
): { valid: boolean; error?: string } {
  const now = new Date()

  if (startsAt >= endsAt) {
    return { valid: false, error: 'La fecha de inicio debe ser antes de la fecha de fin' }
  }

  if (endsAt <= now) {
    return { valid: false, error: 'La fecha de fin debe ser en el futuro' }
  }

  const minDuration = 24 * 60 * 60 * 1000 // 1 day
  if (endsAt.getTime() - startsAt.getTime() < minDuration) {
    return { valid: false, error: 'El desafío debe durar al menos 1 día' }
  }

  return { valid: true }
}

/**
 * Validate challenge target value
 */
export function validateChallengeTarget(
  value: number,
  type: ChallengeType
): { valid: boolean; error?: string } {
  if (value <= 0) {
    return { valid: false, error: 'El objetivo debe ser mayor a 0' }
  }

  // Type-specific validation
  if (type === 'appointments' || type === 'clients') {
    if (!Number.isInteger(value)) {
      return { valid: false, error: 'El objetivo debe ser un número entero' }
    }
  }

  return { valid: true }
}
