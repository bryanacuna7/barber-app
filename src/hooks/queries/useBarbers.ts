/**
 * Barbers Query Hooks
 * Module: Barberos (Visual CRM Canvas)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptBarbers } from '@/lib/adapters/barbers'

export function useBarbers(businessId: string) {
  return useQuery({
    queryKey: queryKeys.barbers.list(businessId),
    queryFn: async () => {
      const supabase = createClient()
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

export function useCreateBarber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (barber: {
      name: string
      email: string // Required by Supabase schema
      phone?: string
      user_id?: string
      business_id: string
      is_active?: boolean
    }) => {
      const supabase = createClient()
      const { data, error } = await supabase.from('barbers').insert(barber).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateQueries.afterBarberChange(queryClient),
  })
}

export function useUpdateBarber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const supabase = createClient()
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

export function useDeleteBarber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('barbers').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateQueries.afterBarberChange(queryClient),
  })
}

export function useBarberById(barberId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.barbers.detail(barberId || ''),
    queryFn: async () => {
      if (!barberId) throw new Error('No barber ID provided')
      const supabase = createClient()
      const { data, error } = await supabase.from('barbers').select('*').eq('id', barberId).single()

      if (error) throw error
      return data
    },
    enabled: !!barberId,
  })
}
