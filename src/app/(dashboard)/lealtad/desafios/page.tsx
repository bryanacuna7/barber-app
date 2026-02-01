import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChallengesView } from '@/components/gamification/challenges-view'

/**
 * Barber Challenges Page
 * Shows active challenges and competitions
 */
export default async function BarberChallengesPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    redirect('/dashboard')
  }

  // Get barber (if user is a barber)
  const { data: barber } = await supabase
    .from('barbers')
    .select('id')
    .eq('user_id', user.id)
    .eq('business_id', business.id)
    .single()

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          🎯 Desafíos Activos
        </h1>
        <p className="text-[15px] text-zinc-600 dark:text-zinc-400">
          Compite con tus compañeros y gana recompensas
        </p>
      </div>

      {/* Challenges View */}
      <ChallengesView businessId={business.id} barberId={barber?.id} />
    </div>
  )
}
