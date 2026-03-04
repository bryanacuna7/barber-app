import { motion } from 'framer-motion'
import { X, ArrowUpCircle, ArrowDownCircle, Loader2, CreditCard } from 'lucide-react'
import type { SubscriptionPlan } from '@/types/database'

export function ChangePlanModal({
  currentPlan,
  newPlan,
  onClose,
  onConfirm,
  onUpgrade,
  isChanging,
}: {
  currentPlan: SubscriptionPlan
  newPlan: SubscriptionPlan
  onClose: () => void
  onConfirm: () => void
  onUpgrade: () => void
  isChanging: boolean
}) {
  const isUpgrade = newPlan.price_usd > currentPlan.price_usd

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-[28px] border border-zinc-200/70 bg-white/95 backdrop-blur-xl shadow-[0_24px_70px_rgba(9,9,11,0.35)] dark:border-zinc-800/80 dark:bg-zinc-950/95 dark:shadow-[0_30px_90px_rgba(0,0,0,0.62)]"
      >
        <div className="mb-4 flex items-center justify-between border-b border-zinc-200/70 bg-gradient-to-b from-zinc-50/80 to-transparent px-6 pb-4 pt-5 dark:border-zinc-800/70 dark:from-zinc-900/55">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            {isUpgrade ? 'Mejorar Plan' : 'Cambiar Plan'}
          </h2>
          <button
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200/70 bg-white/80 text-zinc-400 backdrop-blur transition-colors hover:bg-zinc-100/80 hover:text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Plan comparison */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-sm text-zinc-500">Actual</div>
              <div className="font-semibold text-zinc-900 dark:text-white">
                {currentPlan.display_name}
              </div>
              <div className="text-lg font-bold text-zinc-600 dark:text-zinc-400">
                ${currentPlan.price_usd}/mes
              </div>
            </div>

            <div className="text-2xl text-zinc-400">→</div>

            <div className="text-center">
              <div className="text-sm text-zinc-500">Nuevo</div>
              <div
                className={`font-semibold ${isUpgrade ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
              >
                {newPlan.display_name}
              </div>
              <div
                className={`text-lg font-bold ${isUpgrade ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
              >
                ${newPlan.price_usd}/mes
              </div>
            </div>
          </div>

          {/* Info message */}
          <div
            className={`mb-6 rounded-lg p-4 ${
              isUpgrade ? 'bg-green-50 dark:bg-green-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
            }`}
          >
            {isUpgrade ? (
              <div className="flex items-start gap-3">
                <ArrowUpCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Upgrade a {newPlan.display_name}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Obtendrás miembros del equipo, servicios y clientes ilimitados, más
                    personalización de marca. El cambio se aplicará después de confirmar tu pago.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <ArrowDownCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">
                    Downgrade a {newPlan.display_name}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Tendrás límites de {newPlan.max_barbers} miembros del equipo,{' '}
                    {newPlan.max_services} servicios y {newPlan.max_clients} clientes. El cambio se
                    aplicará inmediatamente.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              onClick={isUpgrade ? onUpgrade : onConfirm}
              disabled={isChanging}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                isUpgrade ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isChanging ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isUpgrade ? (
                <>
                  <CreditCard className="h-4 w-4" />
                  Continuar con pago
                </>
              ) : (
                'Confirmar cambio'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
