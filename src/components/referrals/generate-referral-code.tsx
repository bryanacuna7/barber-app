'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface GenerateReferralCodeProps {
  businessId: string
}

export function GenerateReferralCode({ businessId }: GenerateReferralCodeProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const generateCode = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/referrals/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      await response.json()

      toast.success('¡Código de referido generado exitosamente!')

      // Refresh the page to show the new referral code
      router.refresh()
    } catch (error) {
      console.error('Error generating referral code:', error)
      toast.error('Error al generar el código de referido')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="h-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-white/[0.04] p-6 lg:p-8 text-center shadow-[0_1px_2px_rgba(16,24,40,0.05),0_1px_3px_rgba(16,24,40,0.04)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-zinc-200/70 dark:border-zinc-800/80 bg-white/75 dark:bg-white/[0.06] mb-4">
              <Sparkles className="h-8 w-8 text-[var(--brand-primary)]" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Genera tu Código de Referido
            </h3>
            <p className="text-muted">
              Empieza a compartir y ganar recompensas increíbles por cada negocio que refieras
            </p>
          </div>

          <div className="space-y-4 mb-6 lg:hidden">
            <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white/70 dark:bg-white/[0.04] p-4 text-left">
              <p className="text-sm text-zinc-900 dark:text-white mb-2 font-medium">
                🎁 Recompensas por Milestones
              </p>
              <ul className="text-sm text-muted space-y-1">
                <li>• 1 referido → 20% descuento</li>
                <li>• 3 referidos → 1 mes gratis</li>
                <li>• 5 referidos → 2 meses gratis</li>
                <li>• 10 referidos → 4 meses gratis</li>
                <li>• 20 referidos → 1 año gratis</li>
              </ul>
            </div>
          </div>

          <p className="hidden lg:block text-xs text-muted mb-6">
            Recompensas por nivel visibles en el panel derecho.
          </p>

          <Button onClick={generateCode} disabled={isGenerating} size="lg" variant="gradient">
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generar Código de Referido
              </>
            )}
          </Button>

          <p className="text-xs text-muted mt-4">
            Al generar tu código, aceptas los términos del programa de referencias
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
