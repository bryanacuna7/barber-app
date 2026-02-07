/**
 * Settings Query Hooks
 * Module: Configuración (Bento Grid Luxury)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptBusinessSettings, adaptTeamMembers } from '@/lib/adapters/settings'

const SETTINGS_QUERY_MODERN =
  'id, name, slug, phone, whatsapp, address, timezone, operating_hours, booking_buffer_minutes, advance_booking_days, brand_primary_color, brand_logo_url, brand_favicon_url, logo_url, is_active'

const SETTINGS_QUERY_LEGACY =
  'id, name, slug, phone, whatsapp, address, timezone, operating_hours, booking_buffer_minutes, advance_booking_days, brand_primary_color, logo_url, is_active'

function isMissingColumnError(error: unknown): boolean {
  const message = (error as { message?: string } | null)?.message
  return typeof message === 'string' && message.includes('does not exist')
}

export function useBusinessSettings(businessId: string) {
  return useQuery({
    queryKey: queryKeys.settings.business(),
    queryFn: async () => {
      const supabase = createClient()
      const modernResult = await supabase
        .from('businesses')
        .select(SETTINGS_QUERY_MODERN)
        .eq('id', businessId)
        .single()

      if (!modernResult.error) {
        return adaptBusinessSettings(modernResult.data)
      }

      if (!isMissingColumnError(modernResult.error)) {
        throw modernResult.error
      }

      const legacyResult = await supabase
        .from('businesses')
        .select(SETTINGS_QUERY_LEGACY)
        .eq('id', businessId)
        .single()

      if (legacyResult.error) throw legacyResult.error
      return adaptBusinessSettings(legacyResult.data)
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
      const { error } = await supabase.from('businesses').update(updates).eq('id', id)
      if (error) throw error
      return { id }
    },
    onSuccess: () => invalidateQueries.afterBusinessSettingsChange(queryClient),
  })
}
