'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Scissors, ArrowRight, Mail, MessageCircle } from 'lucide-react'

/** Final CTA section before footer */
export function FinalCTA() {
  return (
    <section className="border-t border-zinc-200/60 bg-gradient-to-b from-white to-zinc-50 py-20 dark:border-zinc-800/60 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Empieza hoy. Es gratis por 7 dias.
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Sin tarjeta de credito. Configura en 5 minutos. Cancela cuando quieras.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/20 transition-shadow hover:shadow-2xl hover:shadow-blue-500/35 sm:w-auto"
            >
              Registrar mi barberia
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-8 py-4 text-base font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 sm:w-auto"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/** Minimal footer */
export function Footer() {
  return (
    <footer className="border-t border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <Scissors className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-white">BarberApp</span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {[
              { label: 'Funciones', href: '#features' },
              { label: 'Precios', href: '#precios' },
              { label: 'Contacto', href: 'https://wa.me/50687175866', external: true },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact + Auth */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:soporte@barberapp.com"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/50687175866"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:text-zinc-300"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500 sm:flex-row">
          <p>&copy; 2026 BarberApp. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="font-medium transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/register"
              className="font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400"
            >
              Registrar barberia
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
