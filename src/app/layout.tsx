import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { QueryProvider } from '@/providers/query-provider'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import { SkipToContent } from '@/components/accessibility/skip-to-content'
import { PremiumBackground } from '@/components/ui/premium-background'
import './globals.css'

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
    default: 'BarberShop Pro',
    template: '%s | BarberShop Pro',
  },
  description: 'Sistema de gestión de citas para barberías. Agenda fácil, clientes felices.',
  keywords: ['barbería', 'citas', 'agenda', 'gestión', 'peluquería'],
  authors: [{ name: 'BarberShop Pro' }],
  creator: 'BarberShop Pro',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BarberShop Pro',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CR',
    siteName: 'BarberShop Pro',
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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
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
        <link rel="apple-touch-icon" href="/api/pwa/icon?size=180" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
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
      </body>
    </html>
  )
}
