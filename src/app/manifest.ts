import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/?source=pwa',
    name: 'BarberApp',
    short_name: 'BarberApp',
    description: 'Sistema de gestión de citas para barberías. Agenda fácil, clientes felices.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#f6f7f9',
    theme_color: '#10141b',
    orientation: 'portrait',
    categories: ['business', 'lifestyle'],
    icons: [
      {
        src: '/api/pwa/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/api/pwa/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/api/pwa/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Nueva Cita',
        short_name: 'Cita',
        url: '/citas?intent=create',
        icons: [{ src: '/api/pwa/icon?size=96', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Clientes',
        short_name: 'Clientes',
        url: '/clientes',
        icons: [{ src: '/api/pwa/icon?size=96', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Servicios',
        short_name: 'Servicios',
        url: '/servicios',
        icons: [{ src: '/api/pwa/icon?size=96', sizes: '96x96', type: 'image/png' }],
      },
    ],
  }
}
