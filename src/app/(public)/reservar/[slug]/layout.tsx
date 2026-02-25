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

  return {
    applicationName: business.name,
    manifest: `/api/public/${encodeURIComponent(business.slug)}/manifest?v=${manifestVersion}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: business.name,
    },
  }
}

export default function BookingSlugLayout({ children }: BookingSlugLayoutProps) {
  return children
}
