import type { Metadata } from 'next'
import { HeroSection } from '@/components/landing/hero-section'
import { StatsSection } from '@/components/landing/stats-section'
import { FeaturesSection } from '@/components/landing/features-section'
// import { DemoSection } from '@/components/landing/demo-section' // Removed - product shown in Hero
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { Footer } from '@/components/landing/footer'

export const metadata: Metadata = {
  title: 'BarberApp - Sistema de Gestión para Barberías | Agenda, Clientes y Pagos',
  description:
    'Gestiona tu barbería con el sistema más completo: agenda inteligente, clientes, reservas online, analíticas y más. 7 días de prueba gratis. Sin tarjeta de crédito.',
  keywords: [
    'barbería',
    'agenda barbería',
    'sistema de reservas',
    'gestión de clientes',
    'barbershop software',
    'agenda online',
    'Costa Rica',
    'barbería profesional',
    'reservas online',
    'software para barberías',
  ],
  authors: [{ name: 'BarberApp' }],
  creator: 'BarberApp',
  publisher: 'BarberApp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://barberapp.com'),
  openGraph: {
    title: 'BarberApp - Sistema de Gestión para Barberías',
    description:
      'Gestiona tu barbería profesionalmente: agenda inteligente, clientes, reservas online y analíticas. Prueba gratis por 7 días.',
    url: 'https://barberapp.com',
    siteName: 'BarberApp',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BarberApp - Sistema de Gestión para Barberías',
      },
    ],
    locale: 'es_CR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BarberApp - Sistema de Gestión para Barberías',
    description:
      'Gestiona tu barbería profesionalmente. Agenda, clientes, reservas online. Prueba gratis 7 días.',
    images: ['/og-image.png'],
    creator: '@barberapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://barberapp.com',
  },
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </>
  )
}
