import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'nexocr.pro'
const RESERVED_SUBDOMAINS = new Set(['barberapp', 'www', 'api', 'admin', 'mail', 'smtp', 'ftp'])

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Extract subdomain: "mi-barberia.nexocr.pro" → "mi-barberia"
  // Skip localhost and Vercel preview URLs
  const isCustomDomain = hostname.endsWith(`.${ROOT_DOMAIN}`)
  if (isCustomDomain) {
    const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '')

    // Reserved subdomains (barberapp.nexocr.pro) → serve app normally
    if (RESERVED_SUBDOMAINS.has(subdomain)) {
      return updateSession(request)
    }

    // Client subdomain → rewrite to public booking page
    // mi-barberia.nexocr.pro → /reservar/mi-barberia
    const url = request.nextUrl.clone()
    url.pathname = `/reservar/${subdomain}${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}`
    return NextResponse.rewrite(url)
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/public|api/webhooks).*)',
  ],
}
