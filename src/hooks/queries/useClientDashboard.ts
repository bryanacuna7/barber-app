import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// =====================================================
// Upcoming appointment (next confirmed/pending)
// =====================================================

/** Upcoming appointment type — includes fields added by migration 025 */
export interface ClientUpcomingAppointment {
  id: string
  scheduled_at: string
  duration_minutes: number | null
  price: number | null
  status: string
  client_notes: string | null
  started_at: string | null
  actual_duration_minutes: number | null
  service: { id: string; name: string } | null
  barber: { id: string; name: string; phone: string | null } | null
}

export function useClientUpcoming(clientId: string) {
  return useQuery({
    queryKey: ['client-upcoming', clientId],
    queryFn: async () => {
      const supabase = createClient()
      // started_at, actual_duration_minutes from migration 025 — not in generated types yet
      const { data, error } = await (
        supabase
          .from('appointments')
          .select(
            'id, scheduled_at, duration_minutes, price, status, client_notes, started_at, actual_duration_minutes, service:services!appointments_service_id_fkey(id, name), barber:barbers!appointments_barber_id_fkey(id, name, phone)'
          ) as any
      )
        .eq('client_id', clientId)
        .in('status', ['pending', 'confirmed'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return (data ?? null) as ClientUpcomingAppointment | null
    },
    enabled: !!clientId,
    refetchInterval: 60_000,
  })
}

// =====================================================
// Appointment history (past appointments)
// =====================================================

export function useClientHistory(clientId: string, limit = 20) {
  return useQuery({
    queryKey: ['client-history', clientId, limit],
    queryFn: async () => {
      const supabase = createClient()
      // payment_method, actual_duration_minutes from migration 025 — not in generated types yet
      const { data, error } = await (
        supabase
          .from('appointments')
          .select(
            'id, scheduled_at, duration_minutes, price, status, payment_method, actual_duration_minutes, service:services!appointments_service_id_fkey(id, name), barber:barbers!appointments_barber_id_fkey(id, name)'
          ) as any
      )
        .eq('client_id', clientId)
        .in('status', ['completed', 'cancelled', 'no_show'])
        .order('scheduled_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data ?? []) as Array<{
        id: string
        scheduled_at: string
        duration_minutes: number | null
        price: number | null
        status: string
        payment_method: string | null
        actual_duration_minutes: number | null
        service: { id: string; name: string } | null
        barber: { id: string; name: string } | null
      }>
    },
    enabled: !!clientId,
  })
}

// =====================================================
// Client loyalty status
// =====================================================

export function useClientLoyalty(clientId: string, businessId: string) {
  return useQuery({
    queryKey: ['client-loyalty', clientId, businessId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('client_loyalty_status')
        .select('points_balance, lifetime_points, current_tier, visit_count, referral_code')
        .eq('client_id', clientId)
        .eq('business_id', businessId)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!clientId && !!businessId,
  })
}

// =====================================================
// Update client profile (name, email)
// =====================================================

export function useUpdateClientProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      clientId,
      name,
      email,
    }: {
      clientId: string
      name: string
      email: string | null
    }) => {
      const supabase = createClient()
      // Uses SECURITY DEFINER RPC — only name/email can be updated (migration 030)
      // RPC not in generated types yet — bypass with `as any`
      const { error } = await (supabase.rpc as any)('update_client_profile', {
        p_client_id: clientId,
        p_name: name,
        p_email: email,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['client-history'] })
    },
  })
}
