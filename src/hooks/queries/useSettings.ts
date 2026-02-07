/**
 * Settings Query Hooks
 * Module: Configuración (Bento Grid Luxury)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptBusinessSettings, adaptTeamMembers } from '@/lib/adapters/settings'

export function useBusinessSettings(businessId: string) {
  return useQuery({
    queryKey: queryKeys.settings.business(),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('businesses')
        .select(
          'id, name, slug, phone, whatsapp, address, timezone, operating_hours, booking_buffer_minutes, advance_booking_days, brand_primary_color, brand_logo_url, brand_favicon_url, is_active'
        )
        .eq('id', businessId)
        .single()
      if (error) throw error
      return adaptBusinessSettings(data)
    },
    enabled: !!businessId,
  })
}

export function useTeamMembers(businessId: string) {
  return useQuery({
    queryKey: queryKeys.settings.team(),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('barbers')
        .select('id, name, email, phone, role, is_active, avatar_url, user_id')
        .eq('business_id', businessId)
      if (error) throw error
      return adaptTeamMembers(data || [])
    },
    enabled: !!businessId,
  })
}

export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id)
        .select(
          'id, name, slug, phone, whatsapp, address, timezone, operating_hours, booking_buffer_minutes, advance_booking_days, brand_primary_color, brand_logo_url, brand_favicon_url, is_active'
        )
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateQueries.afterBusinessSettingsChange(queryClient),
  })
}
