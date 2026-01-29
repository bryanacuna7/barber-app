// @ts-nocheck
// @ts-nocheck
/**
 * API Route: Cleanup Storage
 * Daily cron job to delete expired payment proofs
 * Keeps storage costs at $0/year by removing old files
 *
 * Triggered by Vercel Cron: Daily at 3:00 AM UTC
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service-client'

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

    // 1. Find expired payment proofs
    const { data: expiredPayments, error: fetchError } = await supabase
      .from('payment_reports')
      .select('id, proof_url, status, created_at')
      .lte('delete_after', new Date().toISOString())
      .not('proof_url', 'is', null)

    if (fetchError) {
      console.error('Error fetching expired payments:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch expired payments', details: fetchError.message },
        { status: 500 }
      )
    }

    // 2. Also find stale pending payments (> 90 days old)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: stalePayments, error: staleError } = await supabase
      .from('payment_reports')
      .select('id, proof_url, status, created_at')
      .eq('status', 'pending')
      .lt('created_at', ninetyDaysAgo.toISOString())
      .not('proof_url', 'is', null)

    if (staleError) {
      console.error('Error fetching stale payments:', staleError)
      // Don't fail the entire job if stale fetch fails
    }

    const allPaymentsToClean = [...(expiredPayments || []), ...(stalePayments || [])]

    if (allPaymentsToClean.length === 0) {
      console.log('No payment proofs to clean up')
      return NextResponse.json({
        success: true,
        message: 'No files to delete',
        deleted: 0,
      })
    }

    // 3. Delete files from Storage
    let deletedCount = 0
    const errors: Array<{ id: string; error: string }> = []

    for (const payment of allPaymentsToClean) {
      try {
        // Extract file path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/payment-proofs/path/to/file.jpg
        const paymentData = payment as any
        const proofUrl = paymentData.proof_url
        const path = extractPathFromUrl(proofUrl)

        if (!path) {
          console.warn(`Could not extract path from URL: ${proofUrl}`)
          errors.push({ id: paymentData.id, error: 'Invalid URL format' })
          continue
        }

        // Delete from Storage
        const { error: deleteError } = await supabase.storage.from('payment-proofs').remove([path])

        if (deleteError) {
          console.error(`Error deleting file ${path}:`, deleteError)
          errors.push({ id: paymentData.id, error: deleteError.message })
          continue
        }

        // Clear proof_url in database
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
        console.log(`Deleted proof for payment ${paymentData.id} (status: ${paymentData.status})`)
      } catch (error) {
        console.error(`Error processing payment ${paymentData.id}:`, error)
        errors.push({ id: paymentData.id, error: String(error) })
      }
    }

    // 4. Mark stale pending payments for deletion (set delete_after)
    if (stalePayments && stalePayments.length > 0) {
      const staleIds = stalePayments.map((p) => p.id)
      await supabase
        .from('payment_reports')
        .update({ delete_after: new Date().toISOString() })
        .in('id', staleIds)
        .is('delete_after', null) // Only if not already marked

      console.log(`Marked ${stalePayments.length} stale payments for deletion`)
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} payment proofs`,
      deleted: deletedCount,
      total: allPaymentsToClean.length,
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

/**
 * Extract file path from Supabase Storage URL
 * @param url - Full storage URL
 * @returns File path or null
 */
function extractPathFromUrl(url: string | null): string | null {
  if (!url) return null

  try {
    // Pattern: /storage/v1/object/public/payment-proofs/[path]
    const match = url.match(/\/storage\/v1\/object\/public\/payment-proofs\/(.+)$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
