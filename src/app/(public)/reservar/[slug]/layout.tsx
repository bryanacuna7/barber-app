import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

const manifestVersion =
  process.env.NEXT_PUBLIC_MANIFEST_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? '1'

type BookingSlugLayoutProps = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BookingSlugLayoutProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServiceClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!business?.name || !business.slug) {
    return {}
  }

  const businessName = business.name.trim()
  if (!businessName) {
    return {}
  }
  const bookingDescription = `Reserva tu cita en ${businessName}`

  return {
    title: {
      absolute: businessName,
    },
    description: bookingDescription,
    applicationName: businessName,
    manifest: `/api/public/${encodeURIComponent(business.slug)}/manifest?v=${manifestVersion}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: businessName,
    },
    openGraph: {
      title: businessName,
      description: bookingDescription,
      type: 'website',
      locale: 'es_CR',
      url: `/reservar/${business.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: businessName,
      description: bookingDescription,
    },
  }
}

export default function BookingSlugLayout({ children }: BookingSlugLayoutProps) {
  return children
}
