'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Copy,
  Share2,
  Users,
  UserCheck,
  Trophy,
  TrendingUp,
  Check,
  Lock,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { BadgeVariant } from '@/types'

// Mock data para preview
const mockData = {
  referralCode: 'BARBER_PRO_2026_X7K9',
  signupUrl: 'https://barbershoppro.com/signup?ref=BARBER_PRO_2026_X7K9',
  qrCodeUrl:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // placeholder
  stats: {
    totalReferrals: 12,
    successfulReferrals: 8,
    currentMilestone: 2,
    conversionRate: 66.7,
    nextMilestone: {
      number: 3,
      remaining: 2,
      reward: '2 meses gratis del Plan Pro',
      referrals_required: 5,
    },
  },
  milestones: [
    {
      id: '1',
      milestone_number: 1,
      referrals_required: 1,
      reward_description: '20% descuento próximo mes (Ahorras ~$6)',
      badge_name: 'First Partner',
      badge_icon: '🥉',
      tier: 'bronze',
    },
    {
      id: '2',
      milestone_number: 2,
      referrals_required: 3,
      reward_description: '1 mes gratis del Plan Pro (Ahorras $29)',
      badge_name: 'Growth Partner',
      badge_icon: '🥈',
      tier: 'silver',
    },
    {
      id: '3',
      milestone_number: 3,
      referrals_required: 5,
      reward_description: '2 meses gratis del Plan Pro (Ahorras $58)',
      badge_name: 'Network Builder',
      badge_icon: '🥇',
      tier: 'gold',
    },
    {
      id: '4',
      milestone_number: 4,
      referrals_required: 10,
      reward_description: '4 meses gratis del Plan Pro (Ahorras $116)',
      badge_name: 'Super Connector',
      badge_icon: '💎',
      tier: 'platinum',
    },
    {
      id: '5',
      milestone_number: 5,
      referrals_required: 20,
      reward_description: '1 año gratis del Plan Pro (Ahorras $348)',
      badge_name: 'Network King',
      badge_icon: '⭐',
      tier: 'legendary',
    },
  ],
  earnedBadges: [
    {
      id: '1',
      claimed_at: '2026-01-15',
      milestone: {
        badge_icon: '🥉',
        badge_name: 'First Partner',
      },
    },
    {
      id: '2',
      claimed_at: '2026-01-28',
      milestone: {
        badge_icon: '🥈',
        badge_name: 'Growth Partner',
      },
    },
  ],
  conversions: [
    {
      id: '1',
      referred_business: { name: 'Barbería El Clásico' },
      status: 'active',
      created_at: '2026-01-15',
      converted_at: '2026-01-20',
    },
    {
      id: '2',
      referred_business: { name: 'The Gentleman Barber' },
      status: 'active',
      created_at: '2026-01-18',
      converted_at: '2026-01-25',
    },
    {
      id: '3',
      referred_business: { name: 'Barber Studio Premium' },
      status: 'active',
      created_at: '2026-01-22',
      converted_at: '2026-01-30',
    },
    {
      id: '4',
      referred_business: { name: 'Urban Cuts' },
      status: 'trial',
      created_at: '2026-01-29',
      converted_at: null,
    },
    {
      id: '5',
      referred_business: { name: 'La Barbería Moderna' },
      status: 'pending',
      created_at: '2026-02-01',
      converted_at: null,
    },
  ],
}

export default function ReferenciasPreviewPage() {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const copyCode = () => {
    navigator.clipboard.writeText(mockData.referralCode)
    setCopied('code')
    toast.success('¡Código copiado al portapapeles!')
    setTimeout(() => setCopied(null), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(mockData.signupUrl)
    setCopied('link')
    toast.success('¡Link de registro copiado!')
    setTimeout(() => setCopied(null), 2000)
  }

  const shareViaWhatsApp = () => {
    const message = `🚀 ¡Prueba BarberShop Pro GRATIS por 7 días!\n\nRegistra tu barbería con mi código de referido y ambos obtenemos beneficios:\n\n${mockData.signupUrl}\n\n✂️ Sistema completo de gestión para barberías`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const getTierColor = (tier: string) => {
    const colors = {
      bronze:
        'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700',
      silver: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600',
      gold: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700',
      platinum:
        'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/20 dark:border-purple-700',
      legendary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    }
    return colors[tier as keyof typeof colors] || colors.bronze
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        variant: 'secondary' as const,
        label: 'Pendiente',
        color: 'bg-gray-100 text-gray-700',
      },
      trial: { variant: 'outline' as const, label: 'Prueba', color: 'bg-blue-50 text-blue-700' },
      active: {
        variant: 'default' as const,
        label: 'Activo',
        color: 'bg-green-100 text-green-700',
      },
      churned: {
        variant: 'destructive' as const,
        label: 'Cancelado',
        color: 'bg-red-100 text-red-700',
      },
    }
    const config = variants[status as keyof typeof variants]
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    )
  }

  const statsCards = [
    {
      title: 'Total Referidos',
      value: mockData.stats.totalReferrals,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Referidos Activos',
      value: mockData.stats.successfulReferrals,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Milestone Actual',
      value: `${mockData.stats.currentMilestone}/5`,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Tasa de Conversión',
      value: `${mockData.stats.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  const currentReferrals = mockData.stats.successfulReferrals
  const progress = mockData.stats.nextMilestone
    ? (currentReferrals / mockData.stats.nextMilestone.referrals_required) * 100
    : 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Preview Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                🚀 Sistema de Referencias - PREVIEW
              </h1>
              <p className="text-blue-100">
                Vista previa del dashboard de referencias para business owners
              </p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">Demo Mode</Badge>
          </div>
        </div>

        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Sistema de Referencias
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Refiere otros negocios y gana recompensas increíbles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {card.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${card.bgColor}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referral Code Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 space-y-4 h-full">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-zinc-100">
                  Tu Código de Referido
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Comparte este código o link
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 shadow-lg">
                  <div className="w-48 h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 rounded flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📱</div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">QR Code</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Code */}
              <div className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 rounded-lg p-4 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Código:</p>
                <p className="text-lg md:text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100 break-all">
                  {mockData.referralCode}
                </p>
              </div>

              {/* Link de Registro */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-1 font-medium">
                  Link de registro:
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-blue-600 dark:text-blue-400 truncate flex-1 font-mono">
                    {mockData.signupUrl}
                  </p>
                  <ExternalLink className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={copyCode}
                  className="w-full"
                  variant="outline"
                  disabled={copied === 'code'}
                >
                  {copied === 'code' ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Código Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Código
                    </>
                  )}
                </Button>
                <Button
                  onClick={copyLink}
                  className="w-full"
                  variant="outline"
                  disabled={copied === 'link'}
                >
                  {copied === 'link' ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Link Copiado
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Copiar Link de Registro
                    </>
                  )}
                </Button>
                <Button
                  onClick={shareViaWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Compartir por WhatsApp
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Milestone Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 space-y-6 h-full">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
                  Progreso de Milestones
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {currentReferrals} referidos exitosos • Milestone{' '}
                  {mockData.stats.currentMilestone}
                  /5
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Progreso al siguiente milestone
                  </span>
                  {mockData.stats.nextMilestone && (
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {mockData.stats.nextMilestone.remaining} más para desbloquear
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Progress value={progress} className="h-3" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow-lg">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                {mockData.stats.nextMilestone && (
                  <p className="text-xs text-center text-zinc-600 dark:text-zinc-400 italic">
                    Próxima recompensa: {mockData.stats.nextMilestone.reward}
                  </p>
                )}
              </div>

              {/* Milestones Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {mockData.milestones.map((milestone, index) => {
                  const isUnlocked = currentReferrals >= milestone.referrals_required
                  const isCurrent =
                    !isUnlocked &&
                    (index === 0 ||
                      currentReferrals >= mockData.milestones[index - 1].referrals_required)

                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Card
                        className={`p-4 text-center transition-all hover:scale-105 ${
                          isUnlocked
                            ? `${getTierColor(milestone.tier)} border-2 shadow-lg`
                            : 'bg-zinc-50 dark:bg-zinc-800 opacity-50 border border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <div className="text-3xl mb-2">
                          {isUnlocked ? (
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                              <Check className="h-6 w-6 text-white" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded-full">
                              <Lock className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                            </div>
                          )}
                        </div>
                        <div className="text-2xl mb-1">{milestone.badge_icon}</div>
                        <div className="text-xs font-semibold mb-1 text-zinc-900 dark:text-zinc-100">
                          {milestone.badge_name}
                        </div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                          {milestone.referrals_required} referidos
                        </div>
                        <div className="text-[10px] leading-tight text-zinc-700 dark:text-zinc-300">
                          {milestone.reward_description.split('(')[0]}
                        </div>
                        {isCurrent && (
                          <Badge
                            className="mt-2 text-[10px] py-0.5"
                            variant={'secondary' as BadgeVariant}
                          >
                            Próximo
                          </Badge>
                        )}
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Badges Showcase */}
        {mockData.earnedBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                🏆 Badges Desbloqueados
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mockData.earnedBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, type: 'spring' }}
                    className="text-center"
                  >
                    <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-900 rounded-lg p-6 mb-2 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="text-5xl mb-2">{badge.milestone.badge_icon}</div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {badge.milestone.badge_name}
                      </div>
                    </div>
                    <Badge variant={'secondary' as BadgeVariant} className="text-xs">
                      {new Date(badge.claimed_at).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Conversions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
              Historial de Conversiones
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Negocio Referido
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Estado
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Fecha de Registro
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Fecha de Conversión
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.conversions.map((conversion, index) => (
                    <motion.tr
                      key={conversion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {conversion.referred_business?.name || 'Pendiente de confirmación'}
                      </td>
                      <td className="py-3 px-4 text-sm">{getStatusBadge(conversion.status)}</td>
                      <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(conversion.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {conversion.converted_at
                          ? new Date(conversion.converted_at).toLocaleDateString('es-ES')
                          : '-'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 italic">
          💡 Este es un preview con datos de ejemplo. En la versión real, mostrará datos reales de
          tu negocio.
        </div>
      </div>
    </div>
  )
}
