/**
 * API Route: Cleanup Storage
 * Daily cron job to delete expired payment proofs
 * Keeps storage costs at $0/year by removing old files
 *
 * Triggered by Vercel Cron: Daily at 3:00 AM UTC
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'
import { extractSafePathFromUrl } from '@/lib/path-security'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!authHeader || authHeader !== expectedAuth) {
      console.error('Unauthorized cleanup-storage request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const BATCH_SIZE = 100
    const MAX_PER_RUN = 500
    const now = new Date().toISOString()
    let totalProcessed = 0
    let deletedCount = 0
    const errors: Array<{ id: string; error: string }> = []

    // Process expired proofs in paginated batches (cursor-based for stable ordering)
    let cursorId: string | null = null
    while (totalProcessed < MAX_PER_RUN) {
      let query = supabase
        .from('payment_reports')
        .select('id, proof_url, status, created_at')
        .lte('delete_after', now)
        .not('proof_url', 'is', null)
        .order('id', { ascending: true })
        .limit(BATCH_SIZE)

      if (cursorId) {
        query = query.gt('id', cursorId)
      }

      const { data: batch, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching expired payments:', fetchError)
        break
      }

      if (!batch?.length) break

      for (const payment of batch) {
        const paymentData = payment as any
        const proofUrl = paymentData.proof_url

        try {
          const path = extractSafePathFromUrl(proofUrl, 'payment-proofs')

          if (!path) {
            console.warn(`Could not extract safe path from URL: ${proofUrl}`)
            errors.push({ id: paymentData.id, error: 'Invalid or unsafe URL format' })
            continue
          }

          const { error: deleteError } = await supabase.storage
            .from('payment-proofs')
            .remove([path])

          if (deleteError) {
            console.error(`Error deleting file ${path}:`, deleteError)
            errors.push({ id: paymentData.id, error: deleteError.message })
            continue
          }

          const { error: updateError } = await supabase
            .from('payment_reports')
            .update({ proof_url: null, delete_after: null })
            .eq('id', paymentData.id)

          if (updateError) {
            console.error(`Error updating payment ${paymentData.id}:`, updateError)
            errors.push({ id: paymentData.id, error: updateError.message })
            continue
          }

          deletedCount++
        } catch (error) {
          console.error(`Error processing payment ${paymentData.id}:`, error)
          errors.push({ id: paymentData.id, error: String(error) })
        }
      }

      cursorId = batch[batch.length - 1].id
      totalProcessed += batch.length
    }

    // Also process stale pending payments (> 90 days old) — mark for deletion
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    let staleCursorId: string | null = null
    const staleIds: string[] = []
    while (true) {
      let staleQuery = supabase
        .from('payment_reports')
        .select('id')
        .eq('status', 'pending')
        .lt('created_at', ninetyDaysAgo.toISOString())
        .is('delete_after', null)
        .order('id', { ascending: true })
        .limit(BATCH_SIZE)

      if (staleCursorId) {
        staleQuery = staleQuery.gt('id', staleCursorId)
      }

      const { data: staleBatch, error: staleError } = await staleQuery
      if (staleError || !staleBatch?.length) break

      staleIds.push(...staleBatch.map((p) => p.id))
      staleCursorId = staleBatch[staleBatch.length - 1].id
      if (staleBatch.length < BATCH_SIZE) break
    }

    if (staleIds.length > 0) {
      await supabase.from('payment_reports').update({ delete_after: now }).in('id', staleIds)
    }

    if (totalProcessed === 0 && staleIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No files to delete',
        deleted: 0,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} payment proofs`,
      deleted: deletedCount,
      total: totalProcessed,
      staleMarked: staleIds.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error in cleanup-storage cron:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: String(error),
      },
      { status: 500 }
    )
  }
}

// Note: extractPathFromUrl replaced with extractSafePathFromUrl from path-security.ts
