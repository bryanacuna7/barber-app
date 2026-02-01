'use client'

/**
 * Client Status Card
 * Displays client's loyalty status on public booking page
 *
 * Shows:
 * - Current points balance
 * - Progress to next reward
 * - Current tier
 * - Referral code with share button
 *
 * Usage:
 * - Embed in /reservar/[slug] page
 * - Only shows if client is logged in and has loyalty status
 */

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Gift, Users, Share2, QrCode, TrendingUp, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { ClientLoyaltyStatus, LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'
import { getPointsToNextTier } from '@/lib/gamification/loyalty-calculator'

interface Props {
  status: ClientLoyaltyStatus
  program: LoyaltyProgram
  businessName: string
}

const TIER_CONFIG = {
  bronze: {
    name: 'Bronze',
    color: 'bg-orange-600/20 text-orange-700 dark:text-orange-400',
    icon: '🥉',
  },
  silver: {
    name: 'Silver',
    color: 'bg-slate-400/20 text-slate-700 dark:text-slate-300',
    icon: '🥈',
  },
  gold: {
    name: 'Gold',
    color: 'bg-amber-500/20 text-amber-700 dark:text-amber-400',
    icon: '🥇',
  },
  platinum: {
    name: 'Platinum',
    color: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
    icon: '💎',
  },
}

export function ClientStatusCard({ status, program, businessName }: Props) {
  const toast = useToast()
  const tierConfig = TIER_CONFIG[status.currentTier]
  const { nextTier, pointsNeeded } = getPointsToNextTier(status.lifetimePoints)

  const handleShareReferral = async () => {
    const referralUrl = `${window.location.origin}/reservar/${program.businessId}?ref=${status.referralCode}`
    const shareText = `¡Te invito a ${businessName}! Usa mi código ${status.referralCode} y obtén recompensas especiales. ${referralUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Te invito a ${businessName}`,
          text: shareText,
          url: referralUrl,
        })
        toast.success('Compartido exitosamente')
      } catch (error) {
        // User cancelled or error
        console.error('Share error:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText)
      toast.success('Enlace copiado al portapapeles')
    }
  }

  const handleShowQR = () => {
    // In production, this would generate QR code
    toast.info('Funcionalidad de QR próximamente')
  }

  // Calculate progress percentage for rewards
  let progressPercentage = 0
  let progressText = ''
  const programType = program.programType as string

  if (programType === 'points') {
    const requiredPoints = 500 // Default threshold
    progressPercentage = Math.min((status.pointsBalance / requiredPoints) * 100, 100)
    progressText = `${status.pointsBalance} / ${requiredPoints} pts`
  } else if (programType === 'visits') {
    const requiredVisits = program.freeServiceAfterVisits || 10
    progressPercentage = Math.min((status.visitCount / requiredVisits) * 100, 100)
    progressText = `${status.visitCount} / ${requiredVisits} visitas`
  } else if (programType === 'hybrid') {
    // For hybrid, show points progress (primary metric)
    const requiredPoints = 500
    progressPercentage = Math.min((status.pointsBalance / requiredPoints) * 100, 100)
    progressText = `${status.pointsBalance} pts | ${status.visitCount} visitas`
  } else if (programType === 'referral') {
    // For referral-only programs - show referral code as main feature
    progressPercentage = 100 // Always show full since referral is sharing-based
    progressText = `Código: ${status.referralCode}`
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <h3 className="text-sm font-semibold sm:text-base">Tu Programa de Lealtad</h3>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
            Miembro desde{' '}
            {new Date(status.createdAt).toLocaleDateString('es-ES', {
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <Badge className={`${tierConfig.color} flex-shrink-0`} variant="outline">
          <span className="mr-1">{tierConfig.icon}</span>
          <span className="hidden sm:inline">{tierConfig.name}</span>
        </Badge>
      </div>

      {/* Points Display */}
      {(program.programType === 'points' || program.programType === 'hybrid') && (
        <div className="mt-4 sm:mt-6">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Puntos Disponibles
              </p>
              <div className="mt-1 flex items-baseline gap-1.5 sm:gap-2">
                <p className="text-3xl font-bold text-primary sm:text-4xl">
                  {status.pointsBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">pts</p>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[11px] text-muted-foreground sm:text-xs">Total acumulado</p>
              <p className="text-base font-semibold sm:text-lg">
                {status.lifetimePoints.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress to Reward */}
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Progreso a recompensa</span>
              <span className="font-medium">{progressText}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background/50 sm:h-2.5">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Visit Count Display */}
      {(program.programType === 'visits' || program.programType === 'hybrid') && (
        <div className="mt-4 sm:mt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                Visitas Acumuladas
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400 sm:text-3xl">
                {status.visitCount}
              </p>
            </div>
            <div className="flex-shrink-0 rounded-lg bg-emerald-500/10 p-2.5 sm:p-3">
              <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400 sm:h-6 sm:w-6" />
            </div>
          </div>

          {program.freeServiceAfterVisits && (
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Progreso a servicio gratis</span>
                <span className="font-medium">{progressText}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background/50 sm:h-2.5">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tier Progress */}
      {nextTier && (
        <div className="mt-4 rounded-lg border border-border/50 bg-background/50 p-3 sm:mt-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
            <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
              Siguiente tier
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold sm:text-sm">
              {TIER_CONFIG[nextTier].icon} {TIER_CONFIG[nextTier].name}
            </span>
            <span className="text-[11px] text-muted-foreground sm:text-xs">
              {pointsNeeded.toLocaleString()} pts más
            </span>
          </div>
        </div>
      )}

      {/* Referral Section */}
      {(program.programType === 'referral' || program.programType === 'hybrid') &&
        status.referralCode && (
          <div className="mt-4 space-y-2.5 border-t border-border/50 pt-4 sm:mt-6 sm:space-y-3 sm:pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
              <p className="text-xs font-medium sm:text-sm">Refiere Amigos y Gana Recompensas</p>
            </div>

            {/* Referral Code */}
            <div className="rounded-lg border border-dashed border-border bg-background/50 p-2.5 sm:p-3">
              <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                Tu Código de Referido
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="min-w-0 truncate font-mono text-base font-bold sm:text-lg">
                  {status.referralCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(status.referralCode)
                    toast.success('Código copiado')
                  }}
                  className="flex-shrink-0 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 active:bg-primary/30 sm:px-3 sm:text-xs"
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleShareReferral} variant="outline" size="sm" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
              <Button onClick={handleShowQR} variant="outline" size="sm" className="w-full">
                <QrCode className="mr-2 h-4 w-4" />
                Ver QR
              </Button>
            </div>

            {/* Reward Info */}
            {program.referralRewardAmount && (
              <div className="rounded-lg bg-primary/5 p-2.5 sm:p-3">
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  ✨ Tú y tu amigo recibirán{' '}
                  <span className="font-semibold text-foreground">
                    {program.referralRewardType === 'discount'
                      ? `${program.referralRewardAmount}% de descuento`
                      : program.referralRewardType === 'points'
                        ? `${program.referralRewardAmount} puntos`
                        : '1 servicio gratis'}
                  </span>{' '}
                  cuando complete su primera visita
                </p>
              </div>
            )}
          </div>
        )}

      {/* Recent Activity */}
      {status.lastPointsEarnedAt && (
        <div className="mt-4 border-t border-border/50 pt-3 sm:mt-6 sm:pt-4">
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            Última actividad:{' '}
            {new Date(status.lastPointsEarnedAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      )}
    </Card>
  )
}

/**
 * Skeleton loader for ClientStatusCard
 */
export function ClientStatusCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 sm:p-6">
      <div className="animate-pulse space-y-4 sm:space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-3 w-28 rounded bg-muted" />
          </div>
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>

        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-12 w-24 rounded bg-muted" />
          <div className="h-2.5 w-full rounded-full bg-muted" />
        </div>
      </div>
    </Card>
  )
}
