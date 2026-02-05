/**
 * Services Query Hooks
 * Module: Servicios (Simplified Hybrid + Sidebar)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptServices } from '@/lib/adapters/services'

export function useServices(businessId: string) {
  return useQuery({
    queryKey: queryKeys.services.list(businessId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true })

      if (error) throw error
      return adaptServices(data || [])
    },
    enabled: !!businessId,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (service: any) => {
      const { data, error } = await supabase.from('services').insert(service).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateQueries.afterServiceChange(queryClient),
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateQueries.afterServiceChange(queryClient),
  })
}
