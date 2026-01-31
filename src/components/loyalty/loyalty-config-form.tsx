'use client'

/**
 * Loyalty Configuration Form
 * Allows business owners to configure their loyalty program
 *
 * Features:
 * - Toggle enabled/disabled
 * - 4 preset templates (mobile-optimized)
 * - Custom configuration mode
 * - Real-time validation
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
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
import {
  Gift,
  Star,
  Zap,
  Users,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Footprints,
  UserPlus,
  Layers3,
} from 'lucide-react'
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
    example: 'Simple y efectivo',
    badge: 'Recomendado',
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
    description: '₡100 gastados = 1 punto',
    example: '500 pts = 20% descuento',
    badge: 'Popular',
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
    description: '5 visitas + puntos extra',
    example: '1 pto/₡50 + 20% off',
    badge: 'Avanzado',
    color: 'purple',
    config: {
      program_type: 'hybrid' as const,
      free_service_after_visits: 5,
      points_per_currency_unit: 50,
      discount_percentage: 20,
    },
  },
  {
    id: 'referral',
    name: 'Referidos Focus',
    icon: Users,
    description: 'Crece con tus clientes',
    example: 'Ambos ganan 25% off',
    badge: 'Crecimiento',
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
      const { error } = await (supabase as any).from('loyalty_programs').upsert(payload, {
        onConflict: 'business_id',
      })

      if (error) throw error

      toast.success('Configuración guardada')
    } catch (error) {
      console.error('Failed to save loyalty program:', error)
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="w-full space-y-3 overflow-x-hidden p-3 sm:space-y-4 sm:p-5 lg:space-y-6 lg:p-6">
        {/* Header with Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold lg:text-lg">Configuración</h2>
            <p className="truncate text-xs lg:text-sm">
              {enabled ? (
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Programa activo - los clientes acumularán puntos
                </span>
              ) : (
                <span className="font-medium text-zinc-500 dark:text-zinc-400">
                  ○ Programa desactivado - actívalo para comenzar
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-3">
            <Label
              htmlFor="enabled-toggle"
              className="hidden text-sm font-semibold sm:inline-block"
            >
              {enabled ? (
                <span className="text-emerald-600 dark:text-emerald-400">Activado</span>
              ) : (
                <span className="text-zinc-500">Desactivado</span>
              )}
            </Label>
            <Switch id="enabled-toggle" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        {/* Preset Templates - Horizontal scroll on mobile, grid on desktop */}
        <div className="w-full">
          <Label className="mb-2.5 block text-sm font-medium sm:mb-3 lg:mb-4 lg:text-base">
            Quick Start
          </Label>
          {/* Mobile: Horizontal scroll */}
          <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 scrollbar-hide sm:hidden">
            {PRESETS.map((preset) => {
              const Icon = preset.icon
              const isSelected = selectedPreset === preset.id

              return (
                <motion.button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: PRESETS.findIndex((p) => p.id === preset.id) * 0.1 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group relative flex min-w-[240px] max-w-[240px] flex-shrink-0 flex-col gap-2 overflow-hidden rounded-xl p-3 text-left transition-all ${
                    isSelected
                      ? preset.color === 'emerald'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25'
                        : preset.color === 'amber'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25'
                          : preset.color === 'purple'
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25'
                            : 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25'
                      : 'border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm hover:shadow-md'
                  }`}
                >
                  {/* Gradient overlay for depth when selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  )}

                  {/* Header */}
                  <div className="relative flex items-start gap-2">
                    <div
                      className={`rounded-lg p-1.5 ${
                        isSelected
                          ? 'bg-white/20 ring-2 ring-white/20'
                          : preset.color === 'emerald'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50'
                            : preset.color === 'amber'
                              ? 'bg-amber-100 dark:bg-amber-950/50'
                              : preset.color === 'purple'
                                ? 'bg-purple-100 dark:bg-purple-950/50'
                                : 'bg-blue-100 dark:bg-blue-950/50'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isSelected
                            ? 'text-white'
                            : preset.color === 'emerald'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : preset.color === 'amber'
                                ? 'text-amber-600 dark:text-amber-400'
                                : preset.color === 'purple'
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : 'text-blue-600 dark:text-blue-400'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-foreground'}`}
                      >
                        {preset.name}
                      </h3>
                      <span
                        className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : preset.badge === 'Recomendado'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                              : preset.badge === 'Popular'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                : preset.badge === 'Avanzado'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                        }`}
                      >
                        {preset.badge}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-white" />}
                  </div>

                  {/* Description */}
                  <div className="relative space-y-0.5">
                    <p
                      className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-foreground/90'}`}
                    >
                      {preset.description}
                    </p>
                    <p
                      className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}
                    >
                      {preset.example}
                    </p>
                  </div>

                  {/* Decorative circle when selected */}
                  {isSelected && (
                    <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10" />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden grid-cols-2 gap-3 sm:grid sm:gap-4 xl:grid-cols-4 xl:gap-5">
            {PRESETS.map((preset) => {
              const Icon = preset.icon
              const isSelected = selectedPreset === preset.id

              return (
                <motion.button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: PRESETS.findIndex((p) => p.id === preset.id) * 0.1 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl p-4 text-left transition-all lg:p-5 ${
                    isSelected
                      ? preset.color === 'emerald'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20'
                        : preset.color === 'amber'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20'
                          : preset.color === 'purple'
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20'
                            : 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/20'
                      : 'border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm hover:shadow-lg'
                  }`}
                >
                  {/* Gradient overlay for depth when selected */}
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10" />
                    </>
                  )}

                  {/* Header with Icon and Badge */}
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-xl p-2.5 shadow-sm lg:p-3 ${
                          isSelected
                            ? 'bg-white/20 ring-4 ring-white/10'
                            : preset.color === 'emerald'
                              ? 'bg-emerald-100 dark:bg-emerald-950/50'
                              : preset.color === 'amber'
                                ? 'bg-amber-100 dark:bg-amber-950/50'
                                : preset.color === 'purple'
                                  ? 'bg-purple-100 dark:bg-purple-950/50'
                                  : 'bg-blue-100 dark:bg-blue-950/50'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 lg:h-6 lg:w-6 ${
                            isSelected
                              ? 'text-white'
                              : preset.color === 'emerald'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : preset.color === 'amber'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : preset.color === 'purple'
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-blue-600 dark:text-blue-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-sm font-semibold lg:text-base ${isSelected ? 'text-white' : 'text-foreground'}`}
                        >
                          {preset.name}
                        </h3>
                      </div>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-white lg:h-6 lg:w-6" />
                    ) : (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide lg:text-[11px] ${
                          preset.badge === 'Recomendado'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : preset.badge === 'Popular'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                              : preset.badge === 'Avanzado'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                        }`}
                      >
                        {preset.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="relative space-y-1.5">
                    <p
                      className={`text-sm font-medium lg:text-[15px] ${isSelected ? 'text-white' : 'text-foreground/90'}`}
                    >
                      {preset.description}
                    </p>
                    <p
                      className={`text-xs lg:text-sm ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}
                    >
                      {preset.example}
                    </p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Custom Configuration Tabs */}
        <div>
          <Label className="mb-2 block text-sm font-medium sm:mb-3 lg:mb-4 lg:text-base">
            Personalizar
          </Label>
          <Tabs value={programType} onValueChange={setProgramType}>
            <TabsList className="grid w-full grid-cols-2 gap-1.5 bg-transparent p-0 sm:grid-cols-4 sm:gap-2.5">
              <TabsTrigger
                value="points"
                className="flex-col gap-0.5 border border-border/50 bg-card/80 py-2 backdrop-blur-sm data-[state=active]:border-amber-400 data-[state=active]:bg-amber-50 data-[state=active]:ring-1 data-[state=active]:ring-amber-200/50 dark:data-[state=active]:border-amber-600 dark:data-[state=active]:bg-amber-950/30 dark:data-[state=active]:ring-amber-900/50 sm:flex-row sm:gap-2 sm:py-2.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 sm:h-4 sm:w-4" />
                <span className="text-[10px] font-semibold sm:text-xs lg:text-sm">Puntos</span>
              </TabsTrigger>
              <TabsTrigger
                value="visits"
                className="flex-col gap-0.5 border border-border/50 bg-card/80 py-2 backdrop-blur-sm data-[state=active]:border-emerald-400 data-[state=active]:bg-emerald-50 data-[state=active]:ring-1 data-[state=active]:ring-emerald-200/50 dark:data-[state=active]:border-emerald-600 dark:data-[state=active]:bg-emerald-950/30 dark:data-[state=active]:ring-emerald-900/50 sm:flex-row sm:gap-2 sm:py-2.5"
              >
                <Footprints className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 sm:h-4 sm:w-4" />
                <span className="text-[10px] font-semibold sm:text-xs lg:text-sm">Visitas</span>
              </TabsTrigger>
              <TabsTrigger
                value="referral"
                className="flex-col gap-0.5 border border-border/50 bg-card/80 py-2 backdrop-blur-sm data-[state=active]:border-blue-400 data-[state=active]:bg-blue-50 data-[state=active]:ring-1 data-[state=active]:ring-blue-200/50 dark:data-[state=active]:border-blue-600 dark:data-[state=active]:bg-blue-950/30 dark:data-[state=active]:ring-blue-900/50 sm:flex-row sm:gap-2 sm:py-2.5"
              >
                <UserPlus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 sm:h-4 sm:w-4" />
                <span className="text-[10px] font-semibold sm:text-xs lg:text-sm">Referidos</span>
              </TabsTrigger>
              <TabsTrigger
                value="hybrid"
                className="flex-col gap-0.5 border border-border/50 bg-card/80 py-2 backdrop-blur-sm data-[state=active]:border-purple-400 data-[state=active]:bg-purple-50 data-[state=active]:ring-1 data-[state=active]:ring-purple-200/50 dark:data-[state=active]:border-purple-600 dark:data-[state=active]:bg-purple-950/30 dark:data-[state=active]:ring-purple-900/50 sm:flex-row sm:gap-2 sm:py-2.5"
              >
                <Layers3 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 sm:h-4 sm:w-4" />
                <span className="text-[10px] font-semibold sm:text-xs lg:text-sm">Híbrido</span>
              </TabsTrigger>
            </TabsList>

            {/* Points Config */}
            <TabsContent
              value="points"
              className="mt-3 space-y-3 sm:mt-4 sm:space-y-4 lg:space-y-5"
            >
              {/* Visual Example Box - Compact on mobile */}
              <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/20 sm:rounded-xl sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-1.5 sm:p-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300 sm:text-sm">
                      Cómo funciona
                    </h4>
                    <div className="space-y-1 text-[11px] text-amber-800 dark:text-amber-400 sm:space-y-1.5 sm:text-xs lg:text-sm">
                      <p className="font-medium">📊 ₡{pointsPerCurrency || '100'} = 1 punto</p>
                      <p className="font-medium">
                        🎁 500 pts = {discountPercentage || '20'}% descuento
                      </p>
                      <p className="hidden text-[11px] italic text-amber-700 dark:text-amber-500 sm:block lg:text-xs">
                        Ejemplo: Cliente gasta ₡
                        {(parseFloat(pointsPerCurrency || '100') * 500).toLocaleString()} → obtiene
                        500 pts → puede canjear {discountPercentage || '20'}% off
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="points-currency" className="text-sm font-medium lg:text-[15px]">
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
                  <p className="mt-1.5 text-xs text-muted-foreground lg:text-sm">
                    Ejemplo: ₡100 = mientras más bajo, más rápido acumulan
                  </p>
                </div>
                <div>
                  <Label
                    htmlFor="discount-percentage"
                    className="text-sm font-medium lg:text-[15px]"
                  >
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
                  <p className="mt-1.5 text-xs text-muted-foreground lg:text-sm">
                    Ejemplo: 20% = descuento típico por canjear 500 puntos
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="points-expiry" className="text-sm font-medium lg:text-[15px]">
                  Días para expirar (opcional)
                </Label>
                <Input
                  id="points-expiry"
                  type="number"
                  value={pointsExpiry}
                  onChange={(e) => setPointsExpiry(e.target.value)}
                  placeholder="365"
                  className="mt-2"
                />
                <p className="mt-1.5 text-xs text-muted-foreground lg:text-sm">
                  Dejar vacío = puntos nunca expiran
                </p>
              </div>
            </TabsContent>

            {/* Visits Config */}
            <TabsContent value="visits" className="mt-4 space-y-3 lg:space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
                <div>
                  <Label htmlFor="free-service-visits" className="text-xs lg:text-sm">
                    Visitas para gratis
                  </Label>
                  <Input
                    id="free-service-visits"
                    type="number"
                    value={freeServiceAfterVisits}
                    onChange={(e) => setFreeServiceAfterVisits(e.target.value)}
                    placeholder="10"
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground lg:text-xs">
                    Visitas para servicio gratis
                  </p>
                </div>
                <div>
                  <Label htmlFor="discount-visits" className="text-xs lg:text-sm">
                    Visitas para descuento
                  </Label>
                  <Input
                    id="discount-visits"
                    type="number"
                    value={discountAfterVisits}
                    onChange={(e) => setDiscountAfterVisits(e.target.value)}
                    placeholder="5"
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground lg:text-xs">
                    Opcional: visitas para % off
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Referral Config */}
            <TabsContent value="referral" className="mt-4 space-y-3 lg:space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
                <div>
                  <Label htmlFor="referrer-reward" className="text-xs lg:text-sm">
                    Quien refiere
                  </Label>
                  <Input
                    id="referrer-reward"
                    type="number"
                    value={referralRewardAmount}
                    onChange={(e) => setReferralRewardAmount(e.target.value)}
                    placeholder="25"
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground lg:text-xs">
                    Recompensa para quien refiere
                  </p>
                </div>
                <div>
                  <Label htmlFor="referee-reward" className="text-xs lg:text-sm">
                    El referido
                  </Label>
                  <Input
                    id="referee-reward"
                    type="number"
                    value={refereeRewardAmount}
                    onChange={(e) => setRefereeRewardAmount(e.target.value)}
                    placeholder="25"
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground lg:text-xs">
                    Ambos ganan al completar visita
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="referral-type" className="text-xs lg:text-sm">
                  Tipo de recompensa
                </Label>
                <Select
                  value={referralRewardType}
                  onValueChange={(value) =>
                    setReferralRewardType(value as 'discount' | 'points' | 'free_service')
                  }
                >
                  <SelectTrigger id="referral-type" className="mt-1.5">
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
            <TabsContent value="hybrid" className="mt-4 space-y-4 lg:space-y-5">
              <div className="rounded-lg border border-border/50 bg-primary/5 p-3 lg:p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary lg:h-5 lg:w-5" />
                  <div>
                    <p className="text-xs font-medium lg:text-sm">Modo Híbrido</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground lg:text-xs">
                      Combina puntos + visitas + referidos
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Example Box for Points */}
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                      Cómo funciona el sistema de puntos
                    </h4>
                    <div className="space-y-1.5 text-xs text-amber-800 dark:text-amber-400 lg:text-sm">
                      <p className="font-medium">
                        📊 Cliente gasta{' '}
                        <span className="rounded bg-amber-200 px-1.5 py-0.5 font-bold dark:bg-amber-900">
                          ₡{pointsPerCurrency || '100'}
                        </span>{' '}
                        = gana{' '}
                        <span className="rounded bg-amber-200 px-1.5 py-0.5 font-bold dark:bg-amber-900">
                          1 punto
                        </span>
                      </p>
                      <p className="font-medium">
                        🎁 Con{' '}
                        <span className="rounded bg-amber-200 px-1.5 py-0.5 font-bold dark:bg-amber-900">
                          500 puntos
                        </span>{' '}
                        puede canjear{' '}
                        <span className="rounded bg-amber-200 px-1.5 py-0.5 font-bold dark:bg-amber-900">
                          {discountPercentage || '20'}% descuento
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium lg:text-[15px]">Puntos</Label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="hybrid-points-currency"
                        className="text-xs text-muted-foreground"
                      >
                        Cada ₡X gastados = 1 punto
                      </Label>
                      <Input
                        id="hybrid-points-currency"
                        type="number"
                        value={pointsPerCurrency}
                        onChange={(e) => setPointsPerCurrency(e.target.value)}
                        placeholder="100"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="hybrid-discount-percentage"
                        className="text-xs text-muted-foreground"
                      >
                        % de descuento al canjear
                      </Label>
                      <Input
                        id="hybrid-discount-percentage"
                        type="number"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        placeholder="20"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium lg:text-[15px]">Visitas</Label>
                  <div className="mt-2">
                    <Label htmlFor="hybrid-free-visits" className="text-xs text-muted-foreground">
                      Número de visitas para servicio gratis
                    </Label>
                    <Input
                      id="hybrid-free-visits"
                      type="number"
                      value={freeServiceAfterVisits}
                      onChange={(e) => setFreeServiceAfterVisits(e.target.value)}
                      placeholder="10"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium lg:text-[15px]">Referidos</Label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="hybrid-referrer" className="text-xs text-muted-foreground">
                        Recompensa para quien refiere (%)
                      </Label>
                      <Input
                        id="hybrid-referrer"
                        type="number"
                        value={referralRewardAmount}
                        onChange={(e) => setReferralRewardAmount(e.target.value)}
                        placeholder="25"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hybrid-referee" className="text-xs text-muted-foreground">
                        Recompensa para el referido (%)
                      </Label>
                      <Input
                        id="hybrid-referee"
                        type="number"
                        value={refereeRewardAmount}
                        onChange={(e) => setRefereeRewardAmount(e.target.value)}
                        placeholder="25"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Save Button - Match configuracion style */}
        <div className="border-t border-border/50 pt-4 lg:flex lg:justify-end lg:pt-6">
          <Button
            onClick={handleSave}
            disabled={saving || !enabled}
            isLoading={saving}
            className="h-12 w-full px-8 gap-2 text-[15px] font-semibold lg:w-auto"
          >
            <Save className="h-5 w-5" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </Card>
  )
}
