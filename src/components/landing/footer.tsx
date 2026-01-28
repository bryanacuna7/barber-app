import Link from 'next/link'
import { Scissors, Mail, MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react'

const navigation = {
  product: [
    { name: 'Características', href: '#features' },
    { name: 'Demo', href: '#demo' },
    { name: 'Precios', href: '/precios' },
    { name: 'Testimonios', href: '#testimonials' },
  ],
  company: [
    { name: 'Acerca de', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contacto', href: '/contact' },
    { name: 'Ayuda', href: '/help' },
  ],
  legal: [
    { name: 'Privacidad', href: '/privacy' },
    { name: 'Términos', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
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
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                BarberShop Pro
              </span>
            </Link>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              La plataforma más completa para gestionar tu barbería. Agenda, clientes y pagos en un
              solo lugar.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              <a
                href="mailto:soporte@barbershop.pro"
                className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <Mail className="h-4 w-4" />
                soporte@barbershop.pro
              </a>
              <a
                href="https://wa.me/50688888888"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                +506 8888-8888
              </a>
            </div>

            {/* Social */}
            <div className="mt-6 flex gap-3">
              {navigation.social.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 transition-all hover:border-zinc-300 hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{item.name}</span>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-3">
            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Producto</h3>
              <ul className="mt-4 space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Empresa</h3>
              <ul className="mt-4 space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Legal</h3>
              <ul className="mt-4 space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              &copy; 2026 BarberShop Pro. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
