'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, X, ArrowRight, Crown } from 'lucide-react'

const plans = [
  {
    name: 'Básico',
    price: 12,
    description: 'Perfecto para barberías pequeñas',
    features: [
      { label: 'Hasta 2 miembros del equipo', included: true },
      { label: 'Hasta 3 servicios', included: true },
      { label: 'Hasta 25 clientes', included: true },
      { label: 'Reservas en línea', included: true },
      { label: 'Dashboard de citas', included: true },
      { label: 'Personalización de marca', included: false },
      { label: 'Equipo ilimitados', included: false },
      { label: 'Soporte prioritario', included: false },
    ],
    cta: 'Registrar mi barberia',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'Para barberías en crecimiento',
    features: [
      { label: 'Equipo ilimitados', included: true },
      { label: 'Servicios ilimitados', included: true },
      { label: 'Clientes ilimitados', included: true },
      { label: 'Reservas en línea', included: true },
      { label: 'Dashboard de citas', included: true },
      { label: 'Personalización de marca', included: true },
      { label: 'Logo personalizado', included: true },
      { label: 'Soporte prioritario', included: true },
    ],
    cta: 'Registrar mi barberia',
    popular: true,
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number],
    },
  },
}

export function PricingSection() {
  return (
    <section
      id="precios"
      className="border-t border-zinc-200/60 bg-white py-20 dark:border-zinc-800/60 dark:bg-zinc-950"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Crown className="h-4 w-4" />7 días de prueba gratis · Sin tarjeta de crédito
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Planes simples,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              precios honestos
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Elige el plan que mejor se adapte a tu barbería. Sin contratos, sin sorpresas.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-8 lg:grid-cols-2"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={item}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 },
              }}
              className={`relative overflow-hidden rounded-3xl border p-8 shadow-xl transition-colors ${
                plan.popular
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-sm dark:border-blue-500 dark:from-blue-950/20 dark:to-purple-950/20'
                  : 'border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80'
              }`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0, y: -10 }}
                  whileInView={{ scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                    <Crown className="h-4 w-4" />
                    Recomendado
                  </span>
                </motion.div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-zinc-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-lg text-zinc-600 dark:text-zinc-400">/mes</span>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    {feature.included ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.05, type: 'spring', stiffness: 200 }}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
                      >
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </motion.div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <X className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
                      </div>
                    )}
                    <span
                      className={
                        feature.included
                          ? 'text-zinc-700 dark:text-zinc-300'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }
                    >
                      {feature.label}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/register"
                  className={`group flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold transition-[background-color,box-shadow] ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-zinc-600 dark:text-zinc-400">
            ¿Tienes preguntas?{' '}
            <motion.span whileHover={{ x: 3 }} className="inline-block">
              <Link
                href="/precios"
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Ver preguntas frecuentes →
              </Link>
            </motion.span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
