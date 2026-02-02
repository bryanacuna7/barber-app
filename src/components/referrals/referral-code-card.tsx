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
    const message = `🚀 ¡Prueba BarberShop Pro GRATIS por 7 días!\n\nRegistra tu barbería con mi código de referido y ambos obtenemos beneficios:\n\n${signupUrl}\n\n✂️ Sistema completo de gestión para barberías`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 space-y-4 h-full">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-1 text-zinc-900 dark:text-zinc-100">
            Tu Código de Referido
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Comparte este código o link</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 shadow-lg">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📱</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">QR Code</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 rounded-lg p-4 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Código:</p>
          <p className="text-lg md:text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100 break-all">
            {referralCode}
          </p>
        </div>

        {/* Link de Registro */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-300 mb-1 font-medium">
            Link de registro:
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-blue-600 dark:text-blue-400 truncate flex-1 font-mono">
              {signupUrl}
            </p>
            <ExternalLink className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={copyCode}
            className="w-full"
            variant="outline"
            disabled={copied === 'code'}
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
            className="w-full"
            variant="outline"
            disabled={copied === 'link'}
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
          <Button onClick={shareViaWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Compartir por WhatsApp
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
