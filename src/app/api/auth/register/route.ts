import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessName } = await request.json()

    if (!email || !password || !businessName) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Generate slug
    const slug = businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if slug already exists
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingBusiness) {
      return NextResponse.json(
        { error: 'El nombre de barbería ya está en uso. Prueba con otro nombre.' },
        { status: 409 }
      )
    }

    // 1. Create auth user (auto-confirm email, service role)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { business_name: businessName },
    })

    if (authError) {
      if (
        authError.message?.includes('already been registered') ||
        authError.message?.includes('already exists')
      ) {
        // Check if this is an orphaned user (auth exists but no business)
        const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
        const existingUser = listData?.users?.find((u: { email?: string }) => u.email === email)

        if (existingUser) {
          const { data: userBusiness } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', existingUser.id)
            .maybeSingle()

          if (!userBusiness) {
            // Orphaned user — create business for them and confirm email
            const { error: bizError } = await supabase.from('businesses').insert({
              owner_id: existingUser.id,
              name: businessName,
              slug,
            })

            if (bizError) {
              return NextResponse.json(
                { error: 'Error al crear el negocio. Intenta con otro nombre.' },
                { status: 500 }
              )
            }

            // Confirm their email if not confirmed
            await supabase.auth.admin.updateUserById(existingUser.id, {
              email_confirm: true,
            })

            return NextResponse.json({
              success: true,
              message: 'Cuenta lista. Inicia sesión con tu correo y contraseña.',
              canSignIn: true,
            })
          }
        }

        return NextResponse.json(
          { error: 'Este correo ya está registrado. Intenta iniciar sesión.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Error al crear la cuenta. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
    }

    // 2. Create business (service role bypasses RLS)
    const { error: businessError } = await supabase.from('businesses').insert({
      owner_id: authData.user.id,
      name: businessName,
      slug,
    })

    if (businessError) {
      // Cleanup: delete the orphaned auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Error al crear el negocio. Intenta con otro nombre.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      canSignIn: true,
    })
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
