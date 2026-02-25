import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AchievementsView } from '@/components/gamification/achievements-view'

/**
 * Barber Achievements Page
 * Shows all available achievements and barber progress
 */
export default async function BarberAchievementsPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's business — try owner first, then barber
  let businessId: string | null = null
  let barberId: string | null = null

  const { data: ownedBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (ownedBusiness) {
    businessId = ownedBusiness.id
    // Owner may also be a barber
    const { data: barber } = await supabase
      .from('barbers')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .maybeSingle()
    barberId = barber?.id ?? null
  } else {
    // Check if user is a barber
    const { data: barberRecord } = await supabase
      .from('barbers')
      .select('id, business_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (barberRecord) {
      businessId = barberRecord.business_id
      barberId = barberRecord.id
    }
  }

  if (!businessId) {
    redirect('/dashboard')
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-1">
        <Link
          href="/barberos"
          className="flex items-center justify-center -ml-2 mt-1 h-10 w-10 rounded-xl text-zinc-500 dark:text-zinc-400 ios-press"
          aria-label="Volver a equipo"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Logros de Equipo
          </h1>
          <p className="text-[15px] text-zinc-600 dark:text-zinc-400">
            Desbloquea logros completando hitos y mejorando tu desempeño
          </p>
        </div>
      </div>

      {/* Achievements View */}
      <AchievementsView businessId={businessId} barberId={barberId} />
    </div>
  )
}
