'use client'

import { useState, useRef, useCallback } from 'react'
import { Copy, Check, Share2, MessageCircle, QrCode, Download, ExternalLink } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { bookingAbsoluteUrl } from '@/lib/utils/booking-url'
import { animations } from '@/lib/design-system'

interface ShareBookingLinkProps {
  /** Relative booking path, e.g. /reservar/mi-barberia */
  bookingPath: string
  /** Slug used to build the absolute URL on copy/share */
  slug: string
  businessName: string
  variant?: 'full' | 'compact'
}

export function ShareBookingLink({
  bookingPath,
  slug,
  businessName,
  variant = 'full',
}: ShareBookingLinkProps) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const qrRef = useRef<HTMLCanvasElement | null>(null)

  const getAbsoluteUrl = useCallback(() => bookingAbsoluteUrl(slug), [slug])

  const handleCopy = useCallback(() => {
    const url = getAbsoluteUrl()
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true)
        toast.info('Enlace copiado al portapapeles')
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {
        toast.error('No se pudo copiar el enlace')
      })
  }, [getAbsoluteUrl, toast])

  const handleShare = useCallback(() => {
    const url = getAbsoluteUrl()
    const text = `Reserva tu cita en ${businessName}`

    if (navigator.share) {
      navigator.share({ title: businessName, text, url }).catch(() => {
        // User cancelled or fallback
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n👉 ${url}`)}`, '_blank')
      })
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n👉 ${url}`)}`, '_blank')
    }
  }, [getAbsoluteUrl, businessName])

  const handleWhatsApp = useCallback(() => {
    const url = getAbsoluteUrl()
    const message = `Reserva tu cita en ${businessName} 💈\n👉 ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }, [getAbsoluteUrl, businessName])

  const handleDownloadQR = useCallback(() => {
    const canvas = qrRef.current
    if (!canvas) return

    try {
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `qr-${businessName.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // iOS Safari fallback: open image in new tab
      const canvas2 = qrRef.current
      if (canvas2) {
        const dataUrl = canvas2.toDataURL('image/png')
        window.open(dataUrl, '_blank')
      }
    }
  }, [businessName])

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[14px] font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 truncate">
          {bookingPath}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-shrink-0"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex-shrink-0"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* URL display with inline copy */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 text-[15px] font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 truncate">
          {bookingPath}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          aria-label="Copiar enlace"
        >
          {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
        </button>
        <a
          href={bookingPath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          aria-label="Abrir página de reservas"
        >
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          disabled={copied}
          className="h-11"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          <span className="hidden sm:inline ml-1.5 text-[13px]">
            {copied ? 'Copiado' : 'Copiar'}
          </span>
        </Button>
        <Button type="button" variant="outline" onClick={handleShare} className="h-11">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5 text-[13px]">Compartir</span>
        </Button>
        <Button type="button" variant="success" onClick={handleWhatsApp} className="h-11">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5 text-[13px]">WhatsApp</span>
        </Button>
      </div>

      {/* QR Code toggle */}
      <button
        type="button"
        onClick={() => setShowQR((prev) => !prev)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 px-4 py-3 text-[14px] font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-100/50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
      >
        <QrCode className="h-4 w-4" />
        {showQR ? 'Ocultar Código QR' : 'Mostrar Código QR'}
      </button>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={animations.spring.gentle}
            className="overflow-hidden"
          >
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800/50 sm:flex-row sm:items-start">
              <div className="rounded-xl border border-zinc-100 bg-white p-3 dark:border-zinc-700 dark:bg-white">
                <QRCodeCanvas
                  ref={(el: HTMLCanvasElement | null) => {
                    qrRef.current = el
                  }}
                  value={bookingPath}
                  size={180}
                  level="M"
                  marginSize={1}
                />
              </div>
              <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
                <div>
                  <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                    Código QR de tu negocio
                  </p>
                  <p className="mt-1 text-[13px] text-muted">
                    Imprimilo y ponelo en tu local para que tus clientes reserven al instante
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadQR}
                  className="h-10"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Descargar QR
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
