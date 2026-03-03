import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ToastProvider } from '@/components/ui/toast'
import { QueryProvider } from '@/providers/query-provider'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import { SkipToContent } from '@/components/accessibility/skip-to-content'
import { PremiumBackground } from '@/components/ui/premium-background'
import './globals.css'

const manifestVersion =
  process.env.NEXT_PUBLIC_MANIFEST_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? '1'

const themeInitScript = `
(() => {
  try {
    const key = 'bsp_pref_theme_mode';
    const root = document.documentElement;
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : 'system';
    const mode = parsed === 'light' || parsed === 'dark' || parsed === 'system' ? parsed : 'system';
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const shouldUseDark = mode === 'dark' || (mode === 'system' && media.matches);
    root.classList.toggle('dark', shouldUseDark);
    root.classList.toggle('light', !shouldUseDark);
    root.style.colorScheme = shouldUseDark ? 'dark' : 'light';
  } catch {
    // noop
  }
})();
`

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'BarberApp',
    template: '%s | BarberApp',
  },
  description: 'Sistema de gestión de citas para barberías. Agenda fácil, clientes felices.',
  keywords: ['barbería', 'citas', 'agenda', 'gestión', 'peluquería'],
  authors: [{ name: 'BarberApp' }],
  creator: 'BarberApp',
  manifest: `/api/pwa/manifest?v=${manifestVersion}`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BarberApp',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CR',
    siteName: 'BarberApp',
  },
  icons: {
    icon: [
      { url: '/api/pwa/icon?size=64', sizes: '64x64', type: 'image/png' },
      { url: '/api/pwa/icon?size=192', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/api/pwa/icon?size=180', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/api/pwa/icon?size=64'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f9' },
    { media: '(prefers-color-scheme: dark)', color: '#10141b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="pt-safe">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <link rel="apple-touch-icon" href={`/api/pwa/icon?size=180&v=${manifestVersion}`} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[#0a0a0a]`}
      >
        <PremiumBackground />
        <SkipToContent />
        <ServiceWorkerRegister />
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
