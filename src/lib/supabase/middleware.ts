import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes (require authentication)
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/citas') ||
    request.nextUrl.pathname.startsWith('/servicios') ||
    request.nextUrl.pathname.startsWith('/clientes') ||
    request.nextUrl.pathname.startsWith('/barberos') ||
    request.nextUrl.pathname.startsWith('/configuracion') ||
    request.nextUrl.pathname.startsWith('/mi-dia') ||
    request.nextUrl.pathname.startsWith('/analiticas') ||
    request.nextUrl.pathname.startsWith('/lealtad') ||
    request.nextUrl.pathname.startsWith('/suscripcion') ||
    request.nextUrl.pathname.startsWith('/changelog') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/mi-cuenta')

  // Auth routes (login, register)
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    // Respect explicit redirect param (e.g., ?redirect=/mi-cuenta for client users)
    const redirectTo = request.nextUrl.searchParams.get('redirect')
    url.pathname = redirectTo || '/dashboard'
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from landing page to dashboard (PWA fix)
  if (request.nextUrl.pathname === '/' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
