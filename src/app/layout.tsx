import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { QueryProvider } from '@/providers/query-provider'
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
  openGraph: {
    type: 'website',
    locale: 'es_CR',
    siteName: 'BarberShop Pro',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
