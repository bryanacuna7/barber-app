'use client'

import { Scissors, MapPin, Phone, MessageCircle, Share2 } from 'lucide-react'
import type { Business } from '@/types'

function ShareButton({ business }: { business: Business }) {
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `¡Reserva tu cita en ${business.name}! 💈`

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text, url })
        return
      } catch {
        // User cancelled or not supported, fall through to WhatsApp
      }
    }

    // Fallback to WhatsApp share
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n👉 ${url}`)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-[13px] font-semibold text-blue-700 ios-press dark:bg-blue-900/30 dark:text-blue-400"
      aria-label="Compartir link de reservas"
    >
      <Share2 className="h-3.5 w-3.5" />
      <span>Compartir</span>
    </button>
  )
}

interface BookingHeaderProps {
  business: Business
}

export function BookingHeader({ business }: BookingHeaderProps) {
  return (
    <div
      data-testid="booking-header"
      className="ios-glass sticky top-0 z-50 border-b border-black/5 dark:border-white/5"
    >
      <div className="mx-auto max-w-2xl px-4 py-4 sm:py-5">
        <div className="flex items-center gap-4">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-14 w-14 rounded-[18px] object-cover shadow-lg"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-[18px] shadow-lg"
              style={{
                background: business.brand_primary_color
                  ? `linear-gradient(135deg, ${business.brand_primary_color}, ${business.brand_primary_color}dd)`
                  : 'linear-gradient(135deg, #18181b, #27272a)',
              }}
            >
              <Scissors className="h-7 w-7 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1
              data-testid="business-name"
              className="text-[22px] font-bold tracking-tight text-zinc-900 dark:text-white truncate"
            >
              {business.name}
            </h1>
            <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Reserva tu cita</p>
          </div>
        </div>

        {/* Business Info Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {business.address && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200/60 px-3 py-1.5 text-[13px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[160px] sm:max-w-none">{business.address}</span>
            </div>
          )}
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200/60 px-3 py-1.5 text-[13px] font-medium text-zinc-600 ios-press dark:bg-zinc-800 dark:text-zinc-400"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{business.phone}</span>
            </a>
          )}
          {business.whatsapp && (
            <a
              href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[13px] font-semibold text-emerald-700 ios-press dark:bg-emerald-900/30 dark:text-emerald-400"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
          <ShareButton business={business} />
        </div>
      </div>
    </div>
  )
}
