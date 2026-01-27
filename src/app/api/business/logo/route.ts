import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
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

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no permitido. Usa PNG, JPG, WebP o SVG.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'El archivo es muy grande. Máximo 2MB.' },
      { status: 400 },
    )
  }

  const ext = file.name.split('.').pop() || 'png'
  const filePath = `${business.id}/logo.${ext}`

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Logo upload error:', uploadError)
    return NextResponse.json({ error: 'Error al subir el logo' }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('logos')
    .getPublicUrl(filePath)

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
    // Extract path from URL
    const url = new URL(business.logo_url)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/logos\/(.+)/)
    if (pathMatch) {
      await supabase.storage.from('logos').remove([pathMatch[1]])
    }
  }

  // Clear logo_url
  await supabase
    .from('businesses')
    .update({ logo_url: null, updated_at: new Date().toISOString() })
    .eq('id', business.id)

  return NextResponse.json({ success: true })
}
