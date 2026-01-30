'use client'

/**
 * Loyalty Program Preview
 * Shows how the loyalty program will look to clients
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Gift, Star, Users, Zap, AlertCircle } from 'lucide-react'
import type { LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'

interface Props {
  program: LoyaltyProgram | null
}

export function LoyaltyPreview({ program }: Props) {
  if (!program || !program.enabled) {
    return (
      <Card className="sticky top-6 border-border/50 bg-card/80 p-6 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Vista previa no disponible
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
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
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tus Puntos</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {program.programType === 'points' || program.programType === 'hybrid' ? '250' : '0'}
              </p>
            </div>
            <div className="rounded-lg bg-background/80 px-2 py-1">
              <p className="text-xs font-medium text-muted-foreground">Tier</p>
              <p className="text-sm font-bold">Bronze</p>
            </div>
          </div>

          {/* Progress to Reward */}
          {(program.programType === 'points' || program.programType === 'hybrid') &&
            program.pointsPerCurrencyUnit && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progreso a recompensa</span>
                  <span className="font-medium">250 / 500 pts</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background/50">
                  <div className="h-full w-1/2 rounded-full bg-primary" />
                </div>
              </div>
            )}

          {/* Visit Progress */}
          {(program.programType === 'visits' || program.programType === 'hybrid') &&
            program.freeServiceAfterVisits && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progreso a servicio gratis</span>
                  <span className="font-medium">5 / {program.freeServiceAfterVisits} visitas</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background/50">
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
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Tus Beneficios</p>

          {(program.programType === 'points' || program.programType === 'hybrid') &&
            program.pointsPerCurrencyUnit && (
              <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
                <div className="rounded bg-amber-500/10 p-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Acumula Puntos</p>
                  <p className="text-xs text-muted-foreground">
                    {program.pointsPerCurrencyUnit} punto por cada ₡{program.pointsPerCurrencyUnit}
                  </p>
                </div>
              </div>
            )}

          {(program.programType === 'visits' || program.programType === 'hybrid') &&
            program.freeServiceAfterVisits && (
              <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
                <div className="rounded bg-emerald-500/10 p-1.5">
                  <Gift className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Servicio Gratis</p>
                  <p className="text-xs text-muted-foreground">
                    Cada {program.freeServiceAfterVisits} visitas
                  </p>
                </div>
              </div>
            )}

          {(program.programType === 'referral' || program.programType === 'hybrid') &&
            program.referralRewardAmount && (
              <div className="flex items-center gap-2 rounded-lg bg-background/50 p-2">
                <div className="rounded bg-blue-500/10 p-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">Refiere Amigos</p>
                  <p className="text-xs text-muted-foreground">
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
              <div className="rounded bg-purple-500/10 p-1.5">
                <Zap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium">Descuentos</p>
                <p className="text-xs text-muted-foreground">
                  Hasta {program.discountPercentage}% off
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Referral Code Preview */}
        {(program.programType === 'referral' || program.programType === 'hybrid') && (
          <div className="rounded-lg border border-dashed border-border/50 bg-background/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Tu Código de Referido</p>
            <p className="mt-1 font-mono text-sm font-bold">BARBERSHOP_JUAN_A4B2</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Comparte con amigos para ganar recompensas
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-4">
        <p className="text-center text-xs text-muted-foreground">
          ✨ Los clientes verán esto en la página de reservas
        </p>
      </div>
    </Card>
  )
}
