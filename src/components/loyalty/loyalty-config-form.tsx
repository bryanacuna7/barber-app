'use client'

/**
 * Loyalty Configuration Form
 * Allows business owners to configure their loyalty program
 *
 * Features:
 * - Toggle enabled/disabled
 * - 4 preset templates
 * - Custom configuration mode
 * - Real-time validation
 */

import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Gift, Star, Zap, Users, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { LoyaltyProgram } from '@/lib/gamification/loyalty-calculator'

interface Props {
  businessId: string
  initialProgram: LoyaltyProgram | null
}

const PRESETS = [
  {
    id: 'punch_card',
    name: 'Punch Card Clásico',
    icon: Gift,
    description: '10 visitas = 1 servicio gratis',
    color: 'emerald',
    config: {
      program_type: 'visits' as const,
      free_service_after_visits: 10,
    },
  },
  {
    id: 'points',
    name: 'Sistema de Puntos',
    icon: Star,
    description: '1 punto por ₡100. 500 pts = 20% descuento',
    color: 'amber',
    config: {
      program_type: 'points' as const,
      points_per_currency_unit: 100,
      discount_percentage: 20,
    },
  },
  {
    id: 'vip',
    name: 'VIP Acelerado',
    icon: Zap,
    description: '5 visitas = VIP tier + puntos extra',
    color: 'purple',
    config: {
      program_type: 'hybrid' as const,
      free_service_after_visits: 5,
      points_per_currency_unit: 50,
    },
  },
  {
    id: 'referral',
    name: 'Referidos Focus',
    icon: Users,
    description: 'Refiere amigo = ambos 25% off',
    color: 'blue',
    config: {
      program_type: 'referral' as const,
      referral_reward_type: 'discount' as const,
      referral_reward_amount: 25,
      referee_reward_amount: 25,
    },
  },
]

export function LoyaltyConfigForm({ businessId, initialProgram }: Props) {
  const [enabled, setEnabled] = useState(initialProgram?.enabled ?? false)
  const [programType, setProgramType] = useState<string>(initialProgram?.programType || 'points')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
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

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId)
    if (!preset) return

    setSelectedPreset(presetId)
    setProgramType(preset.config.program_type)

    // Apply preset values
    if ('points_per_currency_unit' in preset.config) {
      setPointsPerCurrency(preset.config.points_per_currency_unit.toString())
    }
    if ('free_service_after_visits' in preset.config) {
      setFreeServiceAfterVisits(preset.config.free_service_after_visits.toString())
    }
    if ('discount_percentage' in preset.config) {
      setDiscountPercentage(preset.config.discount_percentage.toString())
    }
    if ('referral_reward_type' in preset.config) {
      setReferralRewardType(preset.config.referral_reward_type)
    }
    if ('referral_reward_amount' in preset.config) {
      setReferralRewardAmount(preset.config.referral_reward_amount.toString())
    }
    if ('referee_reward_amount' in preset.config) {
      setRefereeRewardAmount(preset.config.referee_reward_amount.toString())
    }

    toast.success(`Preset "${preset.name}" aplicado`)
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const supabase = createClient()

      const payload: any = {
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
      const { error } = await supabase.from('loyalty_programs').upsert(payload, {
        onConflict: 'business_id',
      })

      if (error) throw error

      toast.success('Configuración guardada exitosamente! 🎉')
    } catch (error) {
      console.error('Failed to save loyalty program:', error)
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-border/50 bg-card/80 p-6 backdrop-blur-sm">
      <div className="space-y-6">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Configuración</h2>
            <p className="text-sm text-muted-foreground">
              {enabled
                ? 'Programa activo - los clientes acumularán puntos'
                : 'Programa desactivado'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="enabled-toggle" className="text-sm font-medium">
              {enabled ? 'Activado' : 'Desactivado'}
            </Label>
            <Switch id="enabled-toggle" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        {/* Preset Templates */}
        <div>
          <Label className="mb-3 block">Quick Start - Templates</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {PRESETS.map((preset) => {
              const Icon = preset.icon
              const isSelected = selectedPreset === preset.id

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={`group relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 bg-background/50 hover:border-border hover:bg-accent/50'
                  }`}
                >
                  <div
                    className={`rounded-lg p-2 ${
                      preset.color === 'emerald'
                        ? 'bg-emerald-500/10'
                        : preset.color === 'amber'
                          ? 'bg-amber-500/10'
                          : preset.color === 'purple'
                            ? 'bg-purple-500/10'
                            : 'bg-blue-500/10'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        preset.color === 'emerald'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : preset.color === 'amber'
                            ? 'text-amber-600 dark:text-amber-400'
                            : preset.color === 'purple'
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-blue-600 dark:text-blue-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{preset.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{preset.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Configuration Tabs */}
        <div>
          <Label className="mb-3 block">Configuración Personalizada</Label>
          <Tabs value={programType} onValueChange={setProgramType}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="points">Puntos</TabsTrigger>
              <TabsTrigger value="visits">Visitas</TabsTrigger>
              <TabsTrigger value="referral">Referidos</TabsTrigger>
              <TabsTrigger value="hybrid">Híbrido</TabsTrigger>
            </TabsList>

            {/* Points Config */}
            <TabsContent value="points" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="points-currency">Puntos por unidad de moneda</Label>
                  <Input
                    id="points-currency"
                    type="number"
                    value={pointsPerCurrency}
                    onChange={(e) => setPointsPerCurrency(e.target.value)}
                    placeholder="100"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ej: 1 punto por cada ₡100 gastados
                  </p>
                </div>
                <div>
                  <Label htmlFor="discount-percentage">% de descuento (con puntos)</Label>
                  <Input
                    id="discount-percentage"
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ej: 20% de descuento al canjear
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="points-expiry">Días de expiración (opcional)</Label>
                <Input
                  id="points-expiry"
                  type="number"
                  value={pointsExpiry}
                  onChange={(e) => setPointsExpiry(e.target.value)}
                  placeholder="365"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Dejar vacío = puntos nunca expiran
                </p>
              </div>
            </TabsContent>

            {/* Visits Config */}
            <TabsContent value="visits" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="free-service-visits">Visitas para servicio gratis</Label>
                  <Input
                    id="free-service-visits"
                    type="number"
                    value={freeServiceAfterVisits}
                    onChange={(e) => setFreeServiceAfterVisits(e.target.value)}
                    placeholder="10"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ej: 10 visitas = 1 servicio gratis
                  </p>
                </div>
                <div>
                  <Label htmlFor="discount-visits">Visitas para descuento (opcional)</Label>
                  <Input
                    id="discount-visits"
                    type="number"
                    value={discountAfterVisits}
                    onChange={(e) => setDiscountAfterVisits(e.target.value)}
                    placeholder="5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ej: 5 visitas = descuento especial
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Referral Config */}
            <TabsContent value="referral" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="referrer-reward">Recompensa para quien refiere</Label>
                  <Input
                    id="referrer-reward"
                    type="number"
                    value={referralRewardAmount}
                    onChange={(e) => setReferralRewardAmount(e.target.value)}
                    placeholder="25"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ej: 25 puntos o 25% descuento
                  </p>
                </div>
                <div>
                  <Label htmlFor="referee-reward">Recompensa para el referido</Label>
                  <Input
                    id="referee-reward"
                    type="number"
                    value={refereeRewardAmount}
                    onChange={(e) => setRefereeRewardAmount(e.target.value)}
                    placeholder="25"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ambos ganan cuando el referido completa su primera visita
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="referral-type">Tipo de recompensa</Label>
                <Select value={referralRewardType} onValueChange={setReferralRewardType}>
                  <SelectTrigger id="referral-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Descuento (%)</SelectItem>
                    <SelectItem value="points">Puntos</SelectItem>
                    <SelectItem value="free_service">Servicio Gratis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Hybrid Config */}
            <TabsContent value="hybrid" className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-primary/5 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Modo Híbrido</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Combina puntos + visitas + referidos. Configura cada sección según tus
                      necesidades.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Puntos</Label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={pointsPerCurrency}
                      onChange={(e) => setPointsPerCurrency(e.target.value)}
                      placeholder="Puntos por ₡"
                    />
                    <Input
                      type="number"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      placeholder="% Descuento"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Visitas</Label>
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={freeServiceAfterVisits}
                      onChange={(e) => setFreeServiceAfterVisits(e.target.value)}
                      placeholder="Visitas para servicio gratis"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Referidos</Label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      value={referralRewardAmount}
                      onChange={(e) => setReferralRewardAmount(e.target.value)}
                      placeholder="Recompensa referidor"
                    />
                    <Input
                      type="number"
                      value={refereeRewardAmount}
                      onChange={(e) => setRefereeRewardAmount(e.target.value)}
                      placeholder="Recompensa referido"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 border-t border-border/50 pt-6">
          <Button onClick={handleSave} disabled={saving || !enabled} className="flex-1" size="lg">
            {saving ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
