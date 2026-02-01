'use client'

/**
 * Loyalty Upsell Banner
 * Shows loyalty program benefits to unauthenticated users during booking
 *
 * Features:
 * - Highlights what they're missing by not having an account
 * - Shows program benefits (points, discounts, tiers)
 * - CTA to create account or sign in
 * - Only shows if business has active loyalty program
 *
 * Usage:
 * - Display in booking flow for non-authenticated users
 * - Hide once user creates account/signs in
 */

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Star, Gift, TrendingUp, X } from 'lucide-react'
import { useState } from 'react'
import type { LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'

interface Props {
  program: LoyaltyProgram
  businessName: string
  estimatedPoints?: number // Points they would earn from this booking
  onCreateAccount?: () => void
  onSignIn?: () => void
  dismissible?: boolean
}

export function LoyaltyUpsellBanner({
  program,
  businessName,
  estimatedPoints = 0,
  onCreateAccount,
  onSignIn,
  dismissible = true,
}: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    // Store dismissal in localStorage for 7 days
    if (typeof window !== 'undefined') {
      const dismissUntil = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      localStorage.setItem(
        `loyalty_banner_dismissed_${program.businessId}`,
        dismissUntil.toString()
      )
    }
  }

  // Determine primary benefit based on program type
  let primaryBenefit = ''
  if (program.programType === 'points' || program.programType === 'hybrid') {
    primaryBenefit = `Gana ${program.pointsPerCurrencyUnit}x puntos por cada $1 gastado`
  } else if (program.programType === 'visits') {
    if (program.freeServiceAfterVisits) {
      primaryBenefit = `Servicio gratis cada ${program.freeServiceAfterVisits} visitas`
    } else if (program.discountAfterVisits) {
      primaryBenefit = `${program.discountPercentage}% descuento cada ${program.discountAfterVisits} visitas`
    }
  } else if (program.programType === 'referral') {
    primaryBenefit = 'Refiere amigos y gana recompensas especiales'
  }

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-5 shadow-lg">
      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Header with sparkle icon */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-full bg-primary/10 p-2.5">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <h3 className="text-base font-bold text-foreground sm:text-lg">
            ¡Únete al Programa de Lealtad!
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Gana puntos y recompensas en {businessName}
          </p>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {/* Benefit 1: Points/Visits */}
        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <p className="text-xs font-semibold text-foreground">Puntos Automáticos</p>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{primaryBenefit}</p>
        </div>

        {/* Benefit 2: Rewards */}
        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-semibold text-foreground">Recompensas Exclusivas</p>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Descuentos y servicios gratis especiales
          </p>
        </div>

        {/* Benefit 3: Tiers */}
        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <p className="text-xs font-semibold text-foreground">Sube de Nivel</p>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Avanza de Bronze a Platinum y desbloquea más beneficios
          </p>
        </div>
      </div>

      {/* Estimated Points for Current Booking */}
      {estimatedPoints > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
              ¡Podrías ganar <span className="font-bold">{estimatedPoints} puntos</span> con esta
              reserva!
            </p>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <Button
          onClick={onCreateAccount}
          className="flex-1 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          size="lg"
        >
          Crear Cuenta Gratis
        </Button>
        <Button
          onClick={onSignIn}
          variant="outline"
          className="flex-1 border-primary/30 font-semibold hover:bg-primary/5"
          size="lg"
        >
          Ya tengo cuenta
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Crea tu cuenta para empezar a acumular puntos y disfrutar de recompensas exclusivas
      </p>
    </Card>
  )
}
