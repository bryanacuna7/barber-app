/**
 * GET /api/public/cancel-policy/[slug]
 *
 * Public endpoint — returns the cancellation policy for a business by slug.
 * No auth required. Used by the client-facing cancel/reschedule flow.
 *
 * Security:
 * - Rate limited (moderate: 30 req/min)
 * - Uses service client to bypass RLS (read-only)
 * - Returns only policy fields, never internal business data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type { CancellationPolicy } from '@/types'

const DEFAULT_POLICY: CancellationPolicy = {
  enabled: false,
  deadline_hours: 24,
  allow_reschedule: false,
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    // Rate limit: 30 requests/min per IP
    const rl = await rateLimit(request, RateLimitPresets.moderate)
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes' },
        { status: 429, headers: rl.headers }
      )
    }

    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug requerido' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    const { data: business, error } = (await (serviceClient as any)
      .from('businesses')
      .select('id, cancellation_policy')
      .eq('slug', slug)
      .single()) as {
      data: { id: string; cancellation_policy: CancellationPolicy | null } | null
      error: unknown
    }

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const policy = (business.cancellation_policy as CancellationPolicy | null) ?? DEFAULT_POLICY

    return NextResponse.json({
      enabled: policy.enabled ?? DEFAULT_POLICY.enabled,
      deadline_hours: policy.deadline_hours ?? DEFAULT_POLICY.deadline_hours,
      allow_reschedule: policy.allow_reschedule ?? DEFAULT_POLICY.allow_reschedule,
    })
  } catch (error) {
    logger.error({ err: error }, 'Public cancel-policy API error')
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
