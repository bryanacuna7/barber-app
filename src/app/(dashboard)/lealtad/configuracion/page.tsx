/**
 * Loyalty Configuration Page
 * Business owners configure their loyalty program here
 *
 * Features:
 * - Toggle enabled/disabled
 * - Quick Start: 4 preset templates
 * - Custom Mode: Modify any parameter
 * - Live preview of client-facing UI
 */

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Gift, Sparkles, Users, TrendingUp } from 'lucide-react'
import { LoyaltyConfigForm } from '@/components/loyalty/loyalty-config-form'
import { LoyaltyPreview } from '@/components/loyalty/loyalty-preview'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Configuración de Lealtad | BarberShop Pro',
  description: 'Configura tu programa de lealtad para recompensar a tus clientes',
}

async function getLoyaltyProgram(businessId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('business_id', businessId)
    .single()

  return data
}

async function getLoyaltyStats(businessId: string) {
  const supabase = await createClient()

  // Total enrolled clients
  const { count: enrolledCount } = await supabase
    .from('client_loyalty_status')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)

  // Total points awarded
  const { data: totalPointsData } = await supabase
    .from('client_loyalty_status')
    .select('lifetime_points')
    .eq('business_id', businessId)

  const totalPoints =
    totalPointsData?.reduce((sum, row) => sum + (row.lifetime_points || 0), 0) || 0

  // Total rewards redeemed
  const { count: rewardsCount } = await supabase
    .from('loyalty_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .in('transaction_type', ['redeemed_discount', 'redeemed_free_service'])

  return {
    enrolledClients: enrolledCount || 0,
    totalPointsAwarded: totalPoints,
    totalRewardsRedeemed: rewardsCount || 0,
  }
}

export default async function LoyaltyConfigPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!business) redirect('/onboarding')

  // Get loyalty program (if exists)
  const program = await getLoyaltyProgram(business.id)

  // Get stats (if program exists)
  const stats = program ? await getLoyaltyStats(business.id) : null

  return (
    <div className="min-h-screen bg-background p-4 pb-24 md:p-6">
      {/* Header */}
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programa de Lealtad</h1>
          <p className="text-sm text-muted-foreground">
            Configura recompensas para tus clientes más fieles
          </p>
        </div>

        {/* Stats Cards (if program exists) */}
        {program && stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/50 bg-card/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2.5">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Clientes Inscritos</p>
                  <p className="text-2xl font-bold">{stats.enrolledClients}</p>
                </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-500/10 p-2.5">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Puntos Otorgados</p>
                  <p className="text-2xl font-bold">{stats.totalPointsAwarded.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/10 p-2.5">
                  <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recompensas Canjeadas</p>
                  <p className="text-2xl font-bold">{stats.totalRewardsRedeemed}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Form (2/3 width) */}
          <div className="lg:col-span-2">
            <Suspense fallback={<ConfigFormSkeleton />}>
              <LoyaltyConfigForm businessId={business.id} initialProgram={program} />
            </Suspense>
          </div>

          {/* Live Preview (1/3 width) */}
          <div className="lg:col-span-1">
            <Suspense fallback={<PreviewSkeleton />}>
              <LoyaltyPreview program={program} />
            </Suspense>
          </div>
        </div>

        {/* Info Banner */}
        {!program && (
          <Card className="border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-5 w-5 text-primary" />
              <div className="flex-1">
                <h3 className="font-medium">¿Por qué activar un programa de lealtad?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Los programas de lealtad aumentan la retención de clientes en un 30% promedio.
                  Clientes leales reservan 2.5x más frecuente que clientes ocasionales.
                </p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Incrementa frecuencia de visitas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Fomenta referidos orgánicos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Diferenciación vs competencia
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

function ConfigFormSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80 p-6 backdrop-blur-sm">
      <div className="animate-pulse space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-muted" />
          <div className="h-4 w-96 rounded bg-muted" />
        </div>
        <div className="h-12 w-full rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
          <div className="h-32 rounded bg-muted" />
        </div>
      </div>
    </Card>
  )
}

function PreviewSkeleton() {
  return (
    <Card className="sticky top-6 border-border/50 bg-card/80 p-6 backdrop-blur-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-24 rounded bg-muted" />
        <div className="h-48 rounded-xl bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      </div>
    </Card>
  )
}
