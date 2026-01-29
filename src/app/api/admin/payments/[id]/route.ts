// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/admin'
import { activateSubscription } from '@/lib/subscription'

interface PaymentReport {
  id: string
  business_id: string
  plan_id: string
  status: string
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Use regular client for auth check (has user session)
  const authClient = await createClient()
  const admin = await verifyAdmin(authClient)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Use service client for data queries (bypasses RLS)
  const supabase = await createServiceClient()

  const body = await request.json()
  const { action, admin_notes } = body as {
    action: 'approve' | 'reject'
    admin_notes?: string
  }

  if (!action || !['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Get payment report
  const { data, error: fetchError } = await supabase
    .from('payment_reports')
    .select('*, plan:subscription_plans(id, name)')
    .eq('id', id)
    .single()

  if (fetchError || !data) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  const payment = data as unknown as PaymentReport

  if (payment.status !== 'pending') {
    return NextResponse.json({ error: 'Payment already processed' }, { status: 400 })
  }

  const now = new Date().toISOString()

  // Update payment status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('payment_reports')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_by: admin.id,
      reviewed_at: now,
      admin_notes: admin_notes || null,
    })
    .eq('id', id)

  if (updateError) {
    console.error('Error updating payment:', updateError)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }

  // If approved, activate subscription
  if (action === 'approve') {
    try {
      await activateSubscription(
        supabase,
        payment.business_id,
        payment.plan_id,
        30 // 30 days subscription
      )
    } catch (err) {
      console.error('Error activating subscription:', err)
      // Don't fail the whole request, payment was approved
    }
  }

  return NextResponse.json({ success: true })
}
