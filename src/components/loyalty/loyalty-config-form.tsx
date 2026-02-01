'use client'

/**
 * Loyalty Configuration Form
 * Apple-style configuration: Clear hierarchy, progressive disclosure, single path
 *
 * Features:
 * - Toggle enabled/disabled
 * - Program type selector (radio group)
 * - Adaptive form fields based on type
 * - Collapsible advanced options
 * - Live preview integration
 */

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Save, Star, Gift, Users, Layers3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import type { LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'
import { ProgramTypeSelector } from './program-type-selector'
import { CollapsibleSection } from './collapsible-section'
import { PreviewButtonMobile } from './preview-button-mobile'

interface Props {
  businessId: string
  initialProgram: LoyaltyProgram | null
}

export function LoyaltyConfigForm({ businessId, initialProgram }: Props) {
  const toast = useToast()
  const [enabled, setEnabled] = useState(initialProgram?.enabled ?? false)
  const [programType, setProgramType] = useState<string>(initialProgram?.programType || 'points')
  const [saving, setSaving] = useState(false)

  // Form state
  const [pointsPerCurrency, setPointsPerCurrency] = useState(
    initialProgram?.pointsPerCurrencyUnit?.toString() || '100'
  )
  const [pointsExpiry, setPointsExpiry] = useState(
    initialProgram?.pointsExpiryDays?.toString() || ''
  )
  const [freeServiceAfterVisits, setFreeServiceAfterVisits] = useState(
    initialProgram?.freeServiceAfterVisits?.toString() || '10'
  )
  const [discountAfterVisits, setDiscountAfterVisits] = useState(
    initialProgram?.discountAfterVisits?.toString() || ''
  )
  const [discountPercentage, setDiscountPercentage] = useState(
    initialProgram?.discountPercentage?.toString() || '20'
  )
  const [referralRewardType, setReferralRewardType] = useState(
    initialProgram?.referralRewardType || 'discount'
  )
  const [referralRewardAmount, setReferralRewardAmount] = useState(
    initialProgram?.referralRewardAmount?.toString() || '25'
  )
  const [refereeRewardAmount, setRefereeRewardAmount] = useState(
    initialProgram?.refereeRewardAmount?.toString() || '25'
  )

  // Build current config for preview (simplified, no debouncing for now)
  const currentConfig: LoyaltyProgram | null = enabled
    ? {
        id: initialProgram?.id || '',
        businessId,
        enabled,
        programType: programType as LoyaltyProgram['programType'],
        pointsPerCurrencyUnit: parseFloat(pointsPerCurrency) || null,
        pointsExpiryDays: pointsExpiry ? parseInt(pointsExpiry) : null,
        freeServiceAfterVisits: freeServiceAfterVisits ? parseInt(freeServiceAfterVisits) : null,
        discountAfterVisits: discountAfterVisits ? parseInt(discountAfterVisits) : null,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : null,
        referralRewardType: referralRewardType as LoyaltyProgram['referralRewardType'],
        referralRewardAmount: referralRewardAmount ? parseFloat(referralRewardAmount) : null,
        refereeRewardAmount: refereeRewardAmount ? parseFloat(refereeRewardAmount) : null,
        createdAt: initialProgram?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : null

  const handleSave = async () => {
    setSaving(true)

    try {
      const supabase = createClient()

      const payload: Record<string, unknown> = {
        business_id: businessId,
        enabled,
        program_type: programType,
      }

      // Add config based on program type
      if (programType === 'points' || programType === 'hybrid') {
        payload.points_per_currency_unit = parseFloat(pointsPerCurrency)
        if (pointsExpiry) {
          payload.points_expiry_days = parseInt(pointsExpiry)
        }
        if (discountPercentage) {
          payload.discount_percentage = parseFloat(discountPercentage)
        }
      }

      if (programType === 'visits' || programType === 'hybrid') {
        if (freeServiceAfterVisits) {
          payload.free_service_after_visits = parseInt(freeServiceAfterVisits)
        }
        if (discountAfterVisits) {
          payload.discount_after_visits = parseInt(discountAfterVisits)
          payload.discount_percentage = parseFloat(discountPercentage)
        }
      }

      if (programType === 'referral' || programType === 'hybrid') {
        payload.referral_reward_type = referralRewardType
        payload.referral_reward_amount = parseFloat(referralRewardAmount)
        payload.referee_reward_amount = parseFloat(refereeRewardAmount)
      }

      // Upsert loyalty program
      // Note: loyalty_programs table created in migration 014_loyalty_system.sql
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('loyalty_programs')
        .upsert(payload, { onConflict: 'business_id' })
        .select()
        .single()

      if (error) throw error

      toast.success('Configuración guardada')
    } catch (error) {
      console.error('Error saving loyalty configuration:', error)
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card variant="default">
      <div className="space-y-5 sm:space-y-6">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold text-zinc-900 dark:text-white">
              Configuración
            </h2>
            <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
              {enabled ? (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Programa activo
                </span>
              ) : (
                <span>○ Desactivado</span>
              )}
            </p>
          </div>
          <Switch id="enabled-toggle" checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {/* Program Type Selector */}
        <ProgramTypeSelector
          value={programType}
          onChange={setProgramType}
          options={[
            {
              value: 'points',
              label: 'Sistema de Puntos',
              description: '₡100 = 1 punto',
              icon: Star,
            },
            {
              value: 'visits',
              label: 'Punch Card',
              description: '10 visitas = gratis',
              icon: Gift,
            },
            {
              value: 'referral',
              label: 'Referidos',
              description: 'Ambos ganan reward',
              icon: Users,
            },
            {
              value: 'hybrid',
              label: 'Híbrido',
              description: 'Combina todo',
              icon: Layers3,
            },
          ]}
        />
        {/* Configuration Form - Adaptive based on type */}
        <div className="space-y-4">
          {/* Points Configuration */}
          {(programType === 'points' || programType === 'hybrid') && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="points-currency" className="text-sm font-medium">
                    Cada ₡X gastados = 1 punto
                  </Label>
                  <Input
                    id="points-currency"
                    type="number"
                    value={pointsPerCurrency}
                    onChange={(e) => setPointsPerCurrency(e.target.value)}
                    placeholder="100"
                    className="mt-2"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground italic">
                    Ejemplo: 500 puntos = {discountPercentage}% descuento
                  </p>
                </div>
                <div>
                  <Label htmlFor="discount-percentage" className="text-sm font-medium">
                    % de descuento al canjear
                  </Label>
                  <Input
                    id="discount-percentage"
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="20"
                    className="mt-2"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Descuento por canjear 500 pts
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Visits Configuration */}
          {(programType === 'visits' || programType === 'hybrid') && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="free-service-visits" className="text-sm font-medium">
                  Visitas para servicio gratis
                </Label>
                <Input
                  id="free-service-visits"
                  type="number"
                  value={freeServiceAfterVisits}
                  onChange={(e) => setFreeServiceAfterVisits(e.target.value)}
                  placeholder="10"
                  className="mt-2"
                />
                <p className="mt-1.5 text-xs text-muted-foreground italic">
                  Ejemplo: 10 visitas = 1 servicio gratis
                </p>
              </div>
            </div>
          )}

          {/* Referral Configuration */}
          {(programType === 'referral' || programType === 'hybrid') && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="referrer-reward" className="text-sm font-medium">
                    Recompensa quien refiere (%)
                  </Label>
                  <Input
                    id="referrer-reward"
                    type="number"
                    value={referralRewardAmount}
                    onChange={(e) => setReferralRewardAmount(e.target.value)}
                    placeholder="25"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="referee-reward" className="text-sm font-medium">
                    Recompensa el referido (%)
                  </Label>
                  <Input
                    id="referee-reward"
                    type="number"
                    value={refereeRewardAmount}
                    onChange={(e) => setRefereeRewardAmount(e.target.value)}
                    placeholder="25"
                    className="mt-2"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Ambos ganan recompensas al completar la primera visita
              </p>
            </div>
          )}

          {/* Advanced Options - Collapsible */}
          <div className="mt-6">
            <CollapsibleSection title="Opciones Avanzadas" defaultOpen={false}>
              <div className="space-y-4">
                {/* Points Expiry */}
                {(programType === 'points' || programType === 'hybrid') && (
                  <div>
                    <Label htmlFor="points-expiry" className="text-sm font-medium">
                      Días para que expiren puntos (opcional)
                    </Label>
                    <Input
                      id="points-expiry"
                      type="number"
                      value={pointsExpiry}
                      onChange={(e) => setPointsExpiry(e.target.value)}
                      placeholder="365"
                      className="mt-2"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Dejar vacío = puntos nunca expiran
                    </p>
                  </div>
                )}

                {/* Discount after visits (optional) */}
                {(programType === 'visits' || programType === 'hybrid') && (
                  <div>
                    <Label htmlFor="discount-visits" className="text-sm font-medium">
                      Visitas para descuento (opcional)
                    </Label>
                    <Input
                      id="discount-visits"
                      type="number"
                      value={discountAfterVisits}
                      onChange={(e) => setDiscountAfterVisits(e.target.value)}
                      placeholder="5"
                      className="mt-2"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Opcional: ofrecer descuento cada X visitas
                    </p>
                  </div>
                )}

                {/* Referral reward type */}
                {(programType === 'referral' || programType === 'hybrid') && (
                  <div>
                    <Label htmlFor="referral-type" className="text-sm font-medium">
                      Tipo de recompensa de referido
                    </Label>
                    <Select
                      value={referralRewardType}
                      onValueChange={(value) =>
                        setReferralRewardType(value as 'discount' | 'points' | 'free_service')
                      }
                    >
                      <SelectTrigger id="referral-type" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Descuento (%)</SelectItem>
                        <SelectItem value="points">Puntos</SelectItem>
                        <SelectItem value="free_service">Servicio Gratis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>
        </div>
        {/* End Configuration Form */}
        {/* Save Button */}
        <div className="flex justify-end border-t border-zinc-200 dark:border-zinc-700 pt-5">
          <Button
            onClick={handleSave}
            disabled={saving || !enabled}
            isLoading={saving}
            className="w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </div>

        {/* Preview Button - Mobile only */}
        <PreviewButtonMobile program={currentConfig} />
      </div>
      {/* End main container */}
    </Card>
  )
}
