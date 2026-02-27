/**
 * Services Query Hooks
 * Module: Servicios (Simplified Hybrid + Sidebar)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'
import { adaptServices } from '@/lib/adapters/services'
import { SERVICE_CATEGORIES, type ServiceIconName } from '@/lib/services/icons'

type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export function useServices(businessId: string) {
  return useQuery({
    queryKey: queryKeys.services.list(businessId),
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('services')
        .select(
          'id, name, description, category, icon, duration_minutes, price, display_order, is_active, business_id'
        )
        .eq('business_id', businessId)
        .order('display_order', { ascending: true })

      if (error) throw error
      return adaptServices(data ?? [])
    },
    enabled: !!businessId,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (service: {
      name: string
      description: string
      duration: number
      price: number
      category: ServiceCategory
      icon?: ServiceIconName | null
      business_id: string
    }) => {
      const supabase = createClient()
      // Transform UI format (camelCase) to DB format (snake_case)
      const dbService = {
        name: service.name,
        description: service.description,
        category: service.category,
        icon: service.icon ?? null,
        duration_minutes: service.duration,
        price: service.price,
        business_id: service.business_id,
      }
      const { data, error } = await supabase
        .from('services')
        .insert(dbService)
        .select(
          'id, name, description, category, icon, duration_minutes, price, display_order, is_active, business_id'
        )
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateQueries.afterServiceChange(queryClient),
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: {
        name?: string
        description?: string
        duration?: number
        price?: number
        category?: ServiceCategory
        icon?: ServiceIconName | null
        business_id?: string
      }
    }) => {
      const supabase = createClient()
      // Transform UI format (camelCase) to DB format (snake_case)
      const dbUpdates: Record<string, string | number | null> = {}
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.duration !== undefined) dbUpdates.duration_minutes = updates.duration
      if (updates.price !== undefined) dbUpdates.price = updates.price
      if (updates.category !== undefined) dbUpdates.category = updates.category
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon
      if (updates.business_id !== undefined) dbUpdates.business_id = updates.business_id

      const { data, error } = await supabase
        .from('services')
        .update(dbUpdates)
        .eq('id', id)
        .select(
          'id, name, description, category, icon, duration_minutes, price, display_order, is_active, business_id'
        )
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => invalidateQueries.afterServiceChange(queryClient),
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => invalidateQueries.afterServiceChange(queryClient),
  })
}
