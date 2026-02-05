/**
 * Clients Query Hooks
 * Module: Clientes (Dashboard + Canvas + Depth Fusion)
 */

import { useQuery, useMutation, useQueryClient } from '@tantml:function_calls>'
import { supabase } from '@/lib/supabase'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptClients } from '@/lib/adapters/clients'

export function useClients(businessId: string) {
  return useQuery({
    queryKey: queryKeys.clients.list(businessId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('business_id', businessId)
        .order('total_spent', { ascending: false })

      if (error) throw error
      return adaptClients(data || [])
    },
    enabled: !!businessId,
  })
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: queryKeys.clients.detail(clientId),
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', clientId).single()
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateQueries.afterClientChange(queryClient),
  })
}
