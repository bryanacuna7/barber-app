import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'BarberApp - Sistema de Gestión para Barberías'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Accent glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Scissors icon */}
      <div
        style={{
          fontSize: 72,
          marginBottom: 24,
          display: 'flex',
        }}
      >
        ✂️
      </div>

      {/* App name */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-2px',
          marginBottom: 16,
          display: 'flex',
        }}
      >
        BarberApp
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          color: '#a1a1aa',
          textAlign: 'center',
          maxWidth: '700px',
          lineHeight: 1.4,
          display: 'flex',
        }}
      >
        Sistema de Gestión para Barberías
      </div>

      {/* Feature pills */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: 40,
        }}
      >
        {['Agenda Inteligente', 'Reservas Online', 'Analíticas'].map((feature) => (
          <div
            key={feature}
            style={{
              padding: '10px 24px',
              borderRadius: '100px',
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#60a5fa',
              fontSize: 18,
              fontWeight: 600,
              display: 'flex',
            }}
          >
            {feature}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#71717a',
          fontSize: 16,
        }}
      >
        barberapp.com — Prueba gratis 7 días
      </div>
    </div>,
    { ...size }
  )
}
