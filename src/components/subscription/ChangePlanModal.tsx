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
  const isDowngrade = newPlan.price_usd < currentPlan.price_usd

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-zinc-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {isUpgrade ? 'Mejorar Plan' : 'Cambiar Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
                  Obtendrás miembros del equipo, servicios y clientes ilimitados, más personalización de marca.
                  El cambio se aplicará después de confirmar tu pago.
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
                  Tendrás límites de {newPlan.max_barbers} miembros del equipo, {newPlan.max_services}{' '}
                  servicios y {newPlan.max_clients} clientes. El cambio se aplicará inmediatamente.
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
      </motion.div>
    </div>
  )
}
