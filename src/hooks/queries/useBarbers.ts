/**
 * Barbers Query Hooks
 * Module: Barberos (Visual CRM Canvas)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptBarbers } from '@/lib/adapters/barbers'

const BARBER_SELECT =
  'id, name, email, user_id, business_id, is_active, bio, photo_url, display_order, created_at, updated_at'

export function useBarbers(businessId: string) {
  return useQuery({
    queryKey: queryKeys.barbers.list(businessId),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('barbers')
        .select(BARBER_SELECT)
        .eq('business_id', businessId)
        .order('name', { ascending: true })

      if (error) throw error
      return adaptBarbers((data as any) || [])
    },
    enabled: !!businessId,
  })
}

export function useCreateBarber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (barber: {
      name: string
      email: string
      user_id?: string
      business_id: string
      is_active?: boolean
    }) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('barbers')
        .insert(barber)
        .select(BARBER_SELECT)
        .single()
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
        .select(BARBER_SELECT)
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

export function useInviteBarber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const res = await fetch('/api/barbers/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Error al invitar barbero')
      }
      return json
    },
    onSuccess: () => invalidateQueries.afterBarberChange(queryClient),
  })
}

export function usePendingInvitations(businessId: string) {
  return useQuery({
    queryKey: [...queryKeys.barbers.list(businessId), 'invitations'],
    queryFn: async () => {
      const res = await fetch('/api/barbers/invitations')
      if (!res.ok) throw new Error('Failed to fetch invitations')
      return res.json()
    },
    enabled: !!businessId,
  })
}

export function useBarberById(barberId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.barbers.detail(barberId || ''),
    queryFn: async () => {
      if (!barberId) throw new Error('No barber ID provided')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('barbers')
        .select(BARBER_SELECT)
        .eq('id', barberId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!barberId,
  })
}
