import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BarberShop Pro',
    short_name: 'BarberShop',
    description: 'Sistema de gestión de citas para barberías. Agenda fácil, clientes felices.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#007AFF',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
