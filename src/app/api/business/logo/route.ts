import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateImageFile, getMimeType } from '@/lib/file-validation'
import { sanitizeFilename, extractSafePathFromUrl } from '@/lib/path-security'

const MAX_SIZE = 2 * 1024 * 1024 // 2MB

// POST - Upload logo
export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get('logo') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
  }

  // Validate file using magic bytes (secure, cannot be spoofed)
  const validation = await validateImageFile(file, MAX_SIZE)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error || 'Archivo inválido' }, { status: 400 })
  }

  // Use detected file type (from magic bytes) for extension
  const ext = validation.detectedType === 'jpeg' ? 'jpg' : validation.detectedType

  // Sanitize filename to prevent path traversal
  const sanitizedFilename = sanitizeFilename(`logo.${ext}`)
  const filePath = `${business.id}/${sanitizedFilename}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  })

  if (uploadError) {
    console.error('Logo upload error:', uploadError)
    return NextResponse.json({ error: 'Error al subir el logo' }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath)

  const logoUrl = urlData.publicUrl

  // Update business record
  const { error: updateError } = await supabase
    .from('businesses')
    .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
    .eq('id', business.id)

  if (updateError) {
    console.error('Logo URL update error:', updateError)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }

  return NextResponse.json({ logo_url: logoUrl })
}

// DELETE - Remove logo
export async function DELETE() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, logo_url')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  if (business.logo_url) {
    // Extract path from URL with security validation
    const safePath = extractSafePathFromUrl(business.logo_url, 'logos')
    if (safePath) {
      await supabase.storage.from('logos').remove([safePath])
    } else {
      console.warn('Could not extract safe path from logo URL:', business.logo_url)
    }
  }

  // Clear logo_url
  await supabase
    .from('businesses')
    .update({ logo_url: null, updated_at: new Date().toISOString() })
    .eq('id', business.id)

  return NextResponse.json({ success: true })
}
