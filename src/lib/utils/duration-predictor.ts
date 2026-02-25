/**
 * Smart Duration Predictor
 *
 * Predicts appointment duration using historical data with cascade fallback:
 * 1. Client+Barber+Service (≥2 completed) → median from appointments
 * 2. Client+Service         (≥2 completed) → median from appointments
 * 3. Barber+Service specific (≥5 samples)  → service_duration_stats
 * 4. Service-wide average    (≥3 samples)  → service_duration_stats
 * 5. Default service duration              → services.duration_minutes
 *
 * Created: Session 177 (P1 Dynamic Duration Scheduling)
 * Updated: Per-client cascade levels with median calculation
 */

import { createServiceClient } from '@/lib/supabase/service-client'
import { logger } from '@/lib/logger'

const MIN_CLIENT_SAMPLES = 2
const MIN_BARBER_SAMPLES = 5
const MIN_SERVICE_SAMPLES = 3

type CascadeLevel = 'client_barber' | 'client' | 'barber' | 'service' | 'default'

interface PredictionResult {
  duration: number
  cascadeLevel: CascadeLevel
  sampleCount: number
}

/**
 * Compute median from an array of numbers.
 * Robust with small sample sizes — returns middle value (odd) or average of two middle (even).
 */
function computeMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2)
  }
  return sorted[mid]
}

/**
 * Get predicted duration for a service, with cascade fallback.
 * Always returns a valid number — gracefully degrades on any error.
 *
 * @param clientId - Optional client ID for per-client prediction (levels 1-2)
 */
export async function getPredictedDuration(
  businessId: string,
  serviceId: string,
  barberId: string | undefined,
  defaultDuration: number,
  clientId?: string
): Promise<number> {
  try {
    const result = await getPredictionWithMeta(
      businessId,
      serviceId,
      barberId,
      defaultDuration,
      clientId
    )

    logger.info(
      {
        businessId,
        serviceId,
        barberId: barberId ?? null,
        clientId: clientId ?? null,
        cascadeLevel: result.cascadeLevel,
        predictedDuration: result.duration,
        defaultDuration,
        sampleCount: result.sampleCount,
      },
      'Duration prediction resolved'
    )

    return result.duration
  } catch (error) {
    logger.error(
      { error, businessId, serviceId, clientId },
      'Duration predictor failed, using default'
    )
    return defaultDuration
  }
}

/**
 * Internal: Get prediction with metadata (for logging/testing).
 */
async function getPredictionWithMeta(
  businessId: string,
  serviceId: string,
  barberId: string | undefined,
  defaultDuration: number,
  clientId?: string
): Promise<PredictionResult> {
  const supabase = createServiceClient()

  // Level 1: Client+Barber+Service (per-client, per-barber)
  if (clientId && barberId) {
    const { data: clientBarberData } = (await supabase
      .from('appointments' as any)
      .select('actual_duration_minutes')
      .eq('business_id', businessId)
      .eq('client_id', clientId)
      .eq('service_id', serviceId)
      .eq('barber_id', barberId)
      .eq('status', 'completed')
      .gt('actual_duration_minutes', 0)
      .order('scheduled_at', { ascending: false })
      .limit(20)) as any

    const durations: number[] = (clientBarberData || [])
      .map((r: any) => Number(r.actual_duration_minutes))
      .filter((n: number) => n > 0)

    if (durations.length >= MIN_CLIENT_SAMPLES) {
      return {
        duration: computeMedian(durations),
        cascadeLevel: 'client_barber',
        sampleCount: durations.length,
      }
    }
  }

  // Level 2: Client+Service (per-client, any barber)
  if (clientId) {
    const { data: clientData } = (await supabase
      .from('appointments' as any)
      .select('actual_duration_minutes')
      .eq('business_id', businessId)
      .eq('client_id', clientId)
      .eq('service_id', serviceId)
      .eq('status', 'completed')
      .gt('actual_duration_minutes', 0)
      .order('scheduled_at', { ascending: false })
      .limit(20)) as any

    const durations: number[] = (clientData || [])
      .map((r: any) => Number(r.actual_duration_minutes))
      .filter((n: number) => n > 0)

    if (durations.length >= MIN_CLIENT_SAMPLES) {
      return {
        duration: computeMedian(durations),
        cascadeLevel: 'client',
        sampleCount: durations.length,
      }
    }
  }

  // Level 3: Barber+Service specific (from stats table)
  // Note: service_duration_stats table added in migration 032, using `as any` until types regenerated
  if (barberId) {
    const { data: barberStats } = (await supabase
      .from('service_duration_stats' as any)
      .select('avg_duration_minutes, sample_count')
      .eq('business_id', businessId)
      .eq('service_id', serviceId)
      .eq('barber_id', barberId)
      .single()) as any

    if (barberStats && barberStats.sample_count >= MIN_BARBER_SAMPLES) {
      return {
        duration: Math.round(Number(barberStats.avg_duration_minutes)),
        cascadeLevel: 'barber',
        sampleCount: barberStats.sample_count,
      }
    }
  }

  // Level 4: Service-wide average (barber_id IS NULL)
  const { data: serviceStats } = (await supabase
    .from('service_duration_stats' as any)
    .select('avg_duration_minutes, sample_count')
    .eq('business_id', businessId)
    .eq('service_id', serviceId)
    .is('barber_id', null)
    .single()) as any

  if (serviceStats && serviceStats.sample_count >= MIN_SERVICE_SAMPLES) {
    return {
      duration: Math.round(Number(serviceStats.avg_duration_minutes)),
      cascadeLevel: 'service',
      sampleCount: serviceStats.sample_count,
    }
  }

  // Level 5: Default (service.duration_minutes)
  return {
    duration: defaultDuration,
    cascadeLevel: 'default',
    sampleCount: 0,
  }
}

/**
 * Check if smart duration is enabled for a business.
 */
export async function isSmartDurationEnabled(businessId: string): Promise<boolean> {
  try {
    const supabase = createServiceClient()
    const { data } = (await supabase
      .from('businesses')
      .select('smart_duration_enabled')
      .eq('id', businessId)
      .single()) as any

    return (data as any)?.smart_duration_enabled === true
  } catch {
    return false
  }
}
