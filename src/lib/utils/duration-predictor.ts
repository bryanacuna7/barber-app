/**
 * Smart Duration Predictor
 *
 * Predicts appointment duration using historical data with cascade fallback:
 * 1. Barber+Service specific (≥5 samples) → most accurate
 * 2. Service-wide average (≥3 samples) → good fallback
 * 3. Default service duration → always safe
 *
 * Created: Session 177 (P1 Dynamic Duration Scheduling)
 */

import { createServiceClient } from '@/lib/supabase/service-client'
import { logger } from '@/lib/logger'

const MIN_BARBER_SAMPLES = 5
const MIN_SERVICE_SAMPLES = 3

type CascadeLevel = 'barber' | 'service' | 'default'

interface PredictionResult {
  duration: number
  cascadeLevel: CascadeLevel
  sampleCount: number
}

/**
 * Get predicted duration for a service, with cascade fallback.
 * Always returns a valid number — gracefully degrades on any error.
 */
export async function getPredictedDuration(
  businessId: string,
  serviceId: string,
  barberId: string | undefined,
  defaultDuration: number
): Promise<number> {
  try {
    const result = await getPredictionWithMeta(businessId, serviceId, barberId, defaultDuration)

    logger.info(
      {
        businessId,
        serviceId,
        barberId: barberId ?? null,
        cascadeLevel: result.cascadeLevel,
        predictedDuration: result.duration,
        defaultDuration,
        sampleCount: result.sampleCount,
      },
      'Duration prediction resolved'
    )

    return result.duration
  } catch (error) {
    logger.error({ error, businessId, serviceId }, 'Duration predictor failed, using default')
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
  defaultDuration: number
): Promise<PredictionResult> {
  const supabase = createServiceClient()

  // Level 1: Barber+Service specific
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

  // Level 2: Service-wide average (barber_id IS NULL)
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

  // Level 3: Default (service.duration_minutes)
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
