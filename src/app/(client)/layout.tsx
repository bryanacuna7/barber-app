import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientProvider } from '@/contexts/client-context'
import { ClientBottomNav } from '@/components/client/client-bottom-nav'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { ClientInfo, ClientBusiness } from '@/contexts/client-context'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch client records for this user (specific columns for egress)
  const { data: clientRows } = await supabase
    .from('clients')
    .select('id, business_id, name, email, phone')
    .eq('user_id', user.id)

  if (!clientRows || clientRows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <AlertTriangle className="h-8 w-8 text-muted" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Sin Cuenta de Cliente
          </h1>
          <p className="mt-2 text-muted">
            No tenés un perfil de cliente vinculado. Reservá una cita para crear tu cuenta.
          </p>
          <div className="mt-6 flex flex-col gap-3 items-center">
            <Link
              href="/"
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Fetch business info for all businesses the client belongs to
  const businessIds = [...new Set(clientRows.map((c) => c.business_id))]
  const { data: businessRows } = await supabase
    .from('businesses')
    .select('id, name, slug, brand_primary_color, logo_url')
    .in('id', businessIds)

  const clients: ClientInfo[] = clientRows.map((c) => ({
    id: c.id,
    businessId: c.business_id,
    name: c.name ?? '',
    email: c.email ?? null,
    phone: c.phone ?? null,
  }))

  const businesses: ClientBusiness[] = (businessRows ?? []).map((b) => ({
    id: b.id,
    name: b.name ?? '',
    slug: b.slug ?? '',
    brandColor: b.brand_primary_color ?? null,
    logoUrl: b.logo_url ?? null,
  }))

  // Guard: business may have been deleted/deactivated
  if (businesses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <AlertTriangle className="h-8 w-8 text-muted" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
            Negocio No Disponible
          </h1>
          <p className="mt-2 text-muted">
            El negocio asociado a tu cuenta no está disponible en este momento.
          </p>
          <div className="mt-6 flex flex-col gap-3 items-center">
            <Link
              href="/"
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ClientProvider
      userId={user.id}
      userAuthEmail={user.email ?? null}
      clients={clients}
      businesses={businesses}
    >
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-24">{children}</div>
      <ClientBottomNav />
    </ClientProvider>
  )
}
