import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ToastProvider } from '@/components/ui/toast'
import { QueryProvider } from '@/providers/query-provider'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import { SkipToContent } from '@/components/accessibility/skip-to-content'
import { PremiumBackground } from '@/components/ui/premium-background'
import { SplashScreen } from '@/components/splash-screen'
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

// Inline script that hides static splash if already shown this session
const splashGateScript = `
(() => {
  try {
    if (sessionStorage.getItem('bsp_splash_shown')) {
      var el = document.getElementById('splash-static');
      if (el) el.style.display = 'none';
    }
  } catch {}
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
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-[#09090b]`}
      >
        {/* Static splash — server-rendered, shows instantly before JS loads */}
        <div
          id="splash-static"
          suppressHydrationWarning
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 56,
              height: 120,
              overflow: 'hidden',
              borderRadius: 9999,
              marginBottom: 32,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: '-95%',
                  width: '320%',
                  top: i * 26 - 30,
                  height: 10,
                  borderRadius: 5,
                  background: '#fff',
                  transform: 'rotate(-30deg)',
                }}
              />
            ))}
          </div>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#fff',
              margin: 0,
            }}
          >
            BarberApp
          </p>
          <p
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: '#71717a',
              margin: '6px 0 0',
            }}
          >
            Agenda fácil, clientes felices
          </p>
        </div>
        <Script id="splash-gate" strategy="beforeInteractive">
          {splashGateScript}
        </Script>
        <SplashScreen />
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
