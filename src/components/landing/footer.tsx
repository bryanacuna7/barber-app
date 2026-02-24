'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Scissors, Mail, MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react'

const navigation = {
  product: [
    { name: 'Características', href: '#features' },
    { name: 'Beneficios', href: '#beneficios-por-rol' },
    { name: 'Precios', href: '/precios' },
    { name: 'Testimonios', href: '#testimonials' },
  ],
  social: [
    {
      name: 'Instagram',
      href: '#',
      icon: Instagram,
    },
    {
      name: 'Facebook',
      href: '#',
      icon: Facebook,
    },
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600"
              >
                <Scissors className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">BarberApp</span>
            </Link>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              La plataforma más completa para gestionar tu barbería. Agenda, clientes y pagos en un
              solo lugar.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              {[
                {
                  href: 'mailto:soporte@barberapp.com',
                  icon: Mail,
                  text: 'soporte@barberapp.com',
                },
                { href: 'https://wa.me/50688888888', icon: MessageCircle, text: '+506 8888-8888' },
              ].map((contact, i) => {
                const Icon = contact.icon
                return (
                  <motion.a
                    key={contact.text}
                    href={contact.href}
                    target={contact.href.startsWith('http') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    {contact.text}
                  </motion.a>
                )
              })}
            </div>

            {/* Social */}
            <div className="mt-6 flex gap-3">
              {navigation.social.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 transition-all hover:border-zinc-300 hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{item.name}</span>
                  </motion.a>
                )
              })}
            </div>
          </motion.div>

          {/* Links */}
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-3">
            {[
              { title: 'Producto', items: navigation.product },
            ].map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + sectionIndex * 0.1, duration: 0.6 }}
              >
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + sectionIndex * 0.1 + itemIndex * 0.05 }}
                    >
                      <motion.div whileHover={{ x: 3 }}>
                        <Link
                          href={item.href}
                          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted">
              &copy; 2026 BarberApp. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <motion.div whileHover={{ x: -2 }}>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Iniciar sesión
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/register"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Registrarse
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
