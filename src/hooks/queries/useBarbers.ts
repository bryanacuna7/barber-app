/**
 * Barbers Query Hooks
 * Module: Barberos (Visual CRM Canvas)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptBarbers } from '@/lib/adapters/barbers'

export function useBarbers(businessId: string) {
  return useQuery({
    queryKey: queryKeys.barbers.list(businessId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('business_id', businessId)
        .order('name', { ascending: true })

      if (error) throw error
      return adaptBarbers(data || [])
    },
    enabled: !!businessId,
  })
}

export function useUpdateBarber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('barbers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateQueries.afterBarberChange(queryClient),
  })
}
