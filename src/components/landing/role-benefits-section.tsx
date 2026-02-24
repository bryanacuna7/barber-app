'use client'

import { motion } from 'framer-motion'
import { Building2, CheckCircle2, Scissors, UserRound } from 'lucide-react'

import {
  featureCatalog,
  getLandingFeaturesForRole,
  type FeatureRole,
  type FeatureRoleId,
} from '@/content/feature-catalog'

const roleIcon: Record<FeatureRoleId, typeof Building2> = {
  owner: Building2,
  barber: Scissors,
  client: UserRound,
}

const roleAccentStyles: Record<FeatureRoleId, string> = {
  owner: 'from-blue-600 to-cyan-600',
  barber: 'from-emerald-600 to-teal-600',
  client: 'from-violet-600 to-purple-600',
}

const cardBorderStyles: Record<FeatureRoleId, string> = {
  owner: 'border-blue-200/70 dark:border-blue-900/60',
  barber: 'border-emerald-200/70 dark:border-emerald-900/60',
  client: 'border-violet-200/70 dark:border-violet-900/60',
}

function RoleCard({ role, index }: { role: FeatureRole; index: number }) {
  const Icon = roleIcon[role.id]
  const features = getLandingFeaturesForRole(role.id)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className={`rounded-3xl border bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:bg-zinc-900/70 ${cardBorderStyles[role.id]}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg ${roleAccentStyles[role.id]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{role.label}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{role.summary}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {role.keyBenefits.map((benefit) => (
          <div key={benefit} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{benefit}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="rounded-2xl border border-zinc-200/80 bg-zinc-50/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/60"
          >
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{feature.title}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {feature.roleBenefits[role.id] || feature.description}
            </p>
          </div>
        ))}
      </div>
    </motion.article>
  )
}

export function RoleBenefitsSection() {
  return (
    <section
      id="beneficios-por-rol"
      className="border-t border-zinc-200 bg-gradient-to-b from-zinc-50 via-white to-white py-20 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Beneficios claros para cada perfil
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Lo que gana el dueño, lo que facilita al equipo y lo que mejora para el cliente final, en
            un mismo sistema.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {featureCatalog.roles.map((role, index) => (
            <RoleCard key={role.id} role={role} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
