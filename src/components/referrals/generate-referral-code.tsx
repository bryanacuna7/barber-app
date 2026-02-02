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

      const data = await response.json()

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
      <Card className="p-8 text-center max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Genera tu Código de Referido
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Empieza a compartir y ganar recompensas increíbles por cada negocio que refieras
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2 font-medium">
              🎁 Recompensas por Milestones
            </p>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>• 1 referido → 20% descuento</li>
              <li>• 3 referidos → 1 mes gratis</li>
              <li>• 5 referidos → 2 meses gratis</li>
              <li>• 10 referidos → 4 meses gratis</li>
              <li>• 20 referidos → 1 año gratis</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={generateCode}
          disabled={isGenerating}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
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

        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-4">
          Al generar tu código, aceptas los términos del programa de referencias
        </p>
      </Card>
    </motion.div>
  )
}
