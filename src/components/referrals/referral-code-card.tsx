'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Share2, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface ReferralCodeCardProps {
  referralCode: string
  signupUrl: string
  qrCodeUrl?: string
}

export function ReferralCodeCard({ referralCode, signupUrl, qrCodeUrl }: ReferralCodeCardProps) {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied('code')
    toast.success('¡Código copiado al portapapeles!')
    setTimeout(() => setCopied(null), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(signupUrl)
    setCopied('link')
    toast.success('¡Link de registro copiado!')
    setTimeout(() => setCopied(null), 2000)
  }

  const shareViaWhatsApp = () => {
    const message = `🚀 ¡Prueba BarberApp GRATIS por 7 días!\n\nRegistra tu barbería con mi código de referido y ambos obtenemos beneficios:\n\n${signupUrl}\n\n✂️ Sistema completo de gestión para barberías`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="relative overflow-hidden h-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/[0.04] p-5 lg:p-6 shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-6 top-0 hidden h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent lg:block" />
        <div className="lg:text-left text-center mb-4">
          <h3 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-zinc-100">
            Tu Código de Referido
          </h3>
          <p className="text-sm text-muted">Comparte este código o link</p>
        </div>

        {/* Desktop: 2-column / Mobile: stacked */}
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Left: QR + Code + Link */}
          <div className="space-y-3">
            {/* QR Code — only if available, hide placeholder on desktop */}
            {qrCodeUrl ? (
              <div className="flex justify-center lg:justify-start">
                <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-900/80 p-3 shadow-sm">
                  <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44 lg:w-36 lg:h-36" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center lg:hidden">
                <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-900/80 p-3 shadow-sm">
                  <div className="w-44 h-44 rounded-lg border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-zinc-800/60 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">📱</div>
                      <p className="text-xs text-muted">QR Code</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Code */}
            <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/65 dark:bg-white/[0.04] p-3 text-center lg:text-left backdrop-blur-xl">
              <p className="text-xs text-muted mb-1">Código:</p>
              <p className="text-base lg:text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100 break-all">
                {referralCode}
              </p>
            </div>

            {/* Link de Registro */}
            <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/65 dark:bg-white/[0.04] p-3 backdrop-blur-xl">
              <p className="text-xs text-muted mb-1 font-medium">Link de registro:</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate flex-1 font-mono">
                  {signupUrl}
                </p>
                <ExternalLink className="h-3 w-3 text-muted flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="space-y-2 lg:flex lg:flex-col lg:justify-center">
            <Button
              onClick={copyCode}
              variant="outline"
              disabled={copied === 'code'}
              className="w-full border-zinc-200/80 dark:border-zinc-800/80 bg-white/75 dark:bg-white/[0.04] hover:bg-zinc-100/80 dark:hover:bg-white/10"
            >
              {copied === 'code' ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Código Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Código
                </>
              )}
            </Button>
            <Button
              onClick={copyLink}
              variant="outline"
              disabled={copied === 'link'}
              className="w-full border-zinc-200/80 dark:border-zinc-800/80 bg-white/75 dark:bg-white/[0.04] hover:bg-zinc-100/80 dark:hover:bg-white/10"
            >
              {copied === 'link' ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Link Copiado
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copiar Link de Registro
                </>
              )}
            </Button>
            <Button onClick={shareViaWhatsApp} variant="success" className="w-full">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Compartir por WhatsApp
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
