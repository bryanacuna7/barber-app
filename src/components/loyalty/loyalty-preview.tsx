'use client'

/**
 * Loyalty Program Preview
 * Shows how the loyalty program will look to clients
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift, Star, Users, Zap, AlertCircle, Sparkles } from 'lucide-react'
import type { LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'

interface Props {
  program: LoyaltyProgram | null
}

export function LoyaltyPreview({ program }: Props) {
  if (!program || !program.enabled) {
    return (
      <Card className="sticky top-6 border-border/50 bg-card/80 p-4 backdrop-blur-sm sm:p-6">
        <div className="flex flex-col items-center justify-center py-6 text-center sm:py-8">
          <AlertCircle className="h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" />
          <p className="mt-3 text-xs font-medium text-muted-foreground sm:mt-4 sm:text-sm">
            Vista previa no disponible
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
            Activa el programa para ver el preview
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="sticky top-6 border-border/50 bg-card/80 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-border/50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Vista Cliente</h3>
          <Badge variant="outline" className="text-xs">
            Preview
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Así se verá en la página pública</p>
      </div>

      {/* Preview Content */}
      <div className="space-y-4 p-4">
        {/* Program Type Badge */}
        <div className="flex items-center gap-2">
          {program.programType === 'points' && (
            <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Star className="h-3.5 w-3.5" />
              Sistema de Puntos
            </div>
          )}
          {program.programType === 'visits' && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Gift className="h-3.5 w-3.5" />
              Punch Card
            </div>
          )}
          {program.programType === 'referral' && (
            <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              <Users className="h-3.5 w-3.5" />
              Referidos
            </div>
          )}
          {program.programType === 'hybrid' && (
            <div className="flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400">
              <Zap className="h-3.5 w-3.5" />
              Programa Híbrido
            </div>
          )}
        </div>

        {/* Mock Client Status Card */}
        <div className="rounded-xl border border-border/50 bg-card/60 p-3.5 backdrop-blur-sm sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">Tus Puntos</p>
              <p className="mt-0.5 text-2xl font-bold text-primary sm:mt-1 sm:text-3xl">
                {program.programType === 'points' || program.programType === 'hybrid' ? '250' : '0'}
              </p>
            </div>
            <div className="flex-shrink-0 rounded-lg bg-background/80 px-2 py-1">
              <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">Tier</p>
              <p className="text-xs font-bold sm:text-sm">Bronze</p>
            </div>
          </div>

          {/* Progress to Reward */}
          {(program.programType === 'points' || program.programType === 'hybrid') &&
            program.pointsPerCurrencyUnit && (
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="text-muted-foreground">Progreso a recompensa</span>
                  <span className="font-medium">250 / 500 pts</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background/50 sm:mt-2 sm:h-2">
                  <div className="h-full w-1/2 rounded-full bg-primary" />
                </div>
              </div>
            )}

          {/* Visit Progress */}
          {(program.programType === 'visits' || program.programType === 'hybrid') &&
            program.freeServiceAfterVisits && (
              <div className="mt-3 sm:mt-4">
                <div className="flex items-center justify-between text-[11px] sm:text-xs">
                  <span className="text-muted-foreground">Progreso a servicio gratis</span>
                  <span className="font-medium">5 / {program.freeServiceAfterVisits} visitas</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background/50 sm:mt-2 sm:h-2">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${(5 / program.freeServiceAfterVisits) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
        </div>

        {/* Benefits List */}
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">Tus Beneficios</p>

          {(program.programType === 'points' || program.programType === 'hybrid') &&
            program.pointsPerCurrencyUnit && (
              <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
                <div className="flex-shrink-0 rounded bg-amber-500/10 p-1.5">
                  <Star className="h-3 w-3 text-amber-600 dark:text-amber-400 sm:h-3.5 sm:w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium sm:text-xs">Acumula Puntos</p>
                  <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                    {program.pointsPerCurrencyUnit} punto por cada ₡{program.pointsPerCurrencyUnit}
                  </p>
                </div>
              </div>
            )}

          {(program.programType === 'visits' || program.programType === 'hybrid') &&
            program.freeServiceAfterVisits && (
              <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
                <div className="flex-shrink-0 rounded bg-emerald-500/10 p-1.5">
                  <Gift className="h-3 w-3 text-emerald-600 dark:text-emerald-400 sm:h-3.5 sm:w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium sm:text-xs">Servicio Gratis</p>
                  <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                    Cada {program.freeServiceAfterVisits} visitas
                  </p>
                </div>
              </div>
            )}

          {(program.programType === 'referral' || program.programType === 'hybrid') &&
            program.referralRewardAmount && (
              <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
                <div className="flex-shrink-0 rounded bg-blue-500/10 p-1.5">
                  <Users className="h-3 w-3 text-blue-600 dark:text-blue-400 sm:h-3.5 sm:w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium sm:text-xs">Refiere Amigos</p>
                  <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                    {program.referralRewardType === 'discount'
                      ? `${program.referralRewardAmount}% descuento`
                      : program.referralRewardType === 'points'
                        ? `${program.referralRewardAmount} puntos`
                        : 'Servicio gratis'}
                  </p>
                </div>
              </div>
            )}

          {program.discountPercentage && (
            <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
              <div className="flex-shrink-0 rounded bg-purple-500/10 p-1.5">
                <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400 sm:h-3.5 sm:w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium sm:text-xs">Descuentos</p>
                <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                  Hasta {program.discountPercentage}% off
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Referral Code Preview */}
        {(program.programType === 'referral' || program.programType === 'hybrid') && (
          <div className="rounded-lg border border-dashed border-border/50 bg-background/30 p-2.5 sm:p-3">
            <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
              Tu Código de Referido
            </p>
            <p className="mt-1 truncate font-mono text-xs font-bold sm:text-sm">
              BARBERSHOP_JUAN_A4B2
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
              Comparte con amigos para ganar recompensas
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-3 sm:p-4">
        <p className="text-center text-[11px] text-muted-foreground sm:text-xs inline-flex w-full items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Los clientes verán esto en la página de reservas
        </p>
      </div>
    </Card>
  )
}
