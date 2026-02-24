/**
 * Barber Blocks Query Hooks
 * Module: Bloqueos de Equipo (breaks, vacation, personal time)
 *
 * Table: barber_blocks (migration 038)
 * Note: Uses `as any` casts because barber_blocks is not yet in generated Supabase types.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys, invalidateQueries } from '@/lib/react-query/config'

const BLOCK_SELECT =
  'id, business_id, barber_id, block_type, title, start_time, end_time, all_day, recurrence_rule, created_at'

export type BlockType = 'break' | 'vacation' | 'personal' | 'other'

export interface BarberBlock {
  id: string
  business_id: string
  barber_id: string
  block_type: BlockType
  title: string | null
  start_time: string
  end_time: string
  all_day: boolean
  recurrence_rule: string | null
  created_at: string
}

export interface CreateBlockInput {
  business_id: string
  barber_id: string
  block_type: BlockType
  title?: string | null
  start_time: string
  end_time: string
  all_day?: boolean
  recurrence_rule?: string | null
}

export interface UpdateBlockInput {
  block_type?: BlockType
  title?: string | null
  start_time?: string
  end_time?: string
  all_day?: boolean
  recurrence_rule?: string | null
}

/** Minimum past tolerance: blocks can start up to 5 minutes ago */
const PAST_TOLERANCE_MS = 5 * 60 * 1000

/**
 * List barber blocks for a business.
 * Optionally filter by barber and/or date range.
 */
export function useBarberBlocks(businessId: string, barberId?: string, from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.barberBlocks.list(businessId, barberId, from, to),
    queryFn: async (): Promise<BarberBlock[]> => {
      const supabase = createClient()

      let query = (supabase as any)
        .from('barber_blocks')
        .select(BLOCK_SELECT)
        .eq('business_id', businessId)

      if (barberId) {
        query = query.eq('barber_id', barberId)
      }

      if (from) {
        query = query.gte('start_time', from)
      }

      if (to) {
        query = query.lte('start_time', to)
      }

      query = query.order('start_time', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      return (data as BarberBlock[]) || []
    },
    enabled: !!businessId,
  })
}

/**
 * Create a new barber block.
 * Validates that start_time is not more than 5 minutes in the past.
 */
export function useCreateBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateBlockInput): Promise<BarberBlock> => {
      const startMs = new Date(input.start_time).getTime()
      const nowMs = Date.now()

      if (startMs < nowMs - PAST_TOLERANCE_MS) {
        throw new Error('El bloqueo no puede comenzar en el pasado.')
      }

      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('barber_blocks')
        .insert(input)
        .select(BLOCK_SELECT)
        .single()

      if (error) throw error
      return data as BarberBlock
    },
    onSuccess: () => invalidateQueries.afterBlockChange(queryClient),
  })
}

/**
 * Update an existing barber block by id.
 */
export function useUpdateBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: UpdateBlockInput
    }): Promise<BarberBlock> => {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('barber_blocks')
        .update(updates)
        .eq('id', id)
        .select(BLOCK_SELECT)
        .single()

      if (error) throw error
      return data as BarberBlock
    },
    onSuccess: () => invalidateQueries.afterBlockChange(queryClient),
  })
}

/**
 * Delete a barber block by id.
 */
export function useDeleteBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const supabase = createClient()
      const { error } = await (supabase as any).from('barber_blocks').delete().eq('id', id)

      if (error) throw error
    },
    onSuccess: () => invalidateQueries.afterBlockChange(queryClient),
  })
}
