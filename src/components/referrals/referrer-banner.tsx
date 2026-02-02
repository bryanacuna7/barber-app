'use client'

import { motion } from 'framer-motion'
import { Gift, Sparkles } from 'lucide-react'

interface ReferrerBannerProps {
  businessName: string
  businessSlug?: string
}

/**
 * Banner que se muestra en el signup cuando un usuario llega con código de referido
 * Muestra quién lo refirió y los beneficios que obtendrá
 */
export function ReferrerBanner({ businessName, businessSlug }: ReferrerBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 overflow-hidden rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/30 dark:to-pink-950/30"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
            <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                Referido por {businessName}
              </h3>
              <Sparkles className="h-4 w-4 text-purple-500" />
            </div>

            <p className="text-xs text-purple-700 dark:text-purple-300">
              ¡Bienvenido! Al registrarte con este código de referido, obtendrás:
            </p>

            {/* Benefits */}
            <ul className="mt-2 space-y-1 text-xs text-purple-600 dark:text-purple-400">
              <li className="flex items-center gap-1.5">
                <span className="text-purple-400">✓</span>
                <span>Soporte prioritario durante tu primer mes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-purple-400">✓</span>
                <span>Acceso a recursos exclusivos de onboarding</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-purple-400">✓</span>
                <span>Asesoría personalizada para configurar tu barbería</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400" />
    </motion.div>
  )
}
