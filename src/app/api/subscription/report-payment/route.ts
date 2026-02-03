// @ts-nocheck
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateImageFile } from '@/lib/file-validation'
import { sanitizeFilename } from '@/lib/path-security'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // Parse form data
  const formData = await request.formData()
  const planId = formData.get('plan_id') as string
  const amount = formData.get('amount') as string
  const notes = formData.get('notes') as string | null
  const proof = formData.get('proof') as File | null

  if (!planId || !amount) {
    return NextResponse.json({ error: 'Plan ID and amount are required' }, { status: 400 })
  }

  // Verify plan exists
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id, price_usd')
    .eq('id', planId)
    .single()

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  let proofUrl: string | null = null

  // Upload proof image if provided
  if (proof && proof.size > 0) {
    // Validate file using magic bytes (secure validation)
    const validation = await validateImageFile(proof, MAX_FILE_SIZE)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Archivo de pago inválido' },
        { status: 400 }
      )
    }

    // Use detected file type for extension and sanitize filename
    const fileExt = validation.detectedType === 'jpeg' ? 'jpg' : validation.detectedType
    const sanitizedName = sanitizeFilename(`payment_${Date.now()}.${fileExt}`)
    const fileName = `${business.id}/${sanitizedName}`

    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, proof, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      // Continue without proof URL - not critical
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from('payment-proofs').getPublicUrl(fileName)
      proofUrl = publicUrl
    }
  }

  // Create payment report
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payment, error } = await (supabase as any)
    .from('payment_reports')
    .insert({
      business_id: business.id,
      plan_id: planId,
      amount_usd: parseFloat(amount),
      proof_url: proofUrl,
      notes: notes || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating payment report:', error)
    return NextResponse.json({ error: 'Failed to create payment report' }, { status: 500 })
  }

  return NextResponse.json(payment, { status: 201 })
}
