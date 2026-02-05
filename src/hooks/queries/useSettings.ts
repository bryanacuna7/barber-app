/**
 * Settings Query Hooks
 * Module: Configuración (Bento Grid Luxury)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptBusinessSettings, adaptTeamMembers } from '@/lib/adapters/settings'

export function useBusinessSettings(businessId: string) {
  return useQuery({
    queryKey: queryKeys.settings.business(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
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
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
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
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateQueries.afterBusinessSettingsChange(queryClient),
  })
}
