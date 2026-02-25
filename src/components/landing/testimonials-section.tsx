'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Carlos Rodriguez',
    role: 'Dueno · Barber Studio CR',
    location: 'San Jose',
    avatar: 'CR',
    quote:
      'Antes perdia 2-3 horas diarias confirmando citas por WhatsApp. Ahora todo es automatico y mis clientes aman reservar en linea. En 3 meses recupere la inversion.',
  },
  {
    name: 'Ana Mendez',
    role: 'Manager · The Barber House',
    location: 'Heredia',
    avatar: 'AM',
    quote:
      'Los no-shows bajaron un 80% con los recordatorios automaticos. Mi equipo se enfoca en cortar pelo, no en manejar agendas. Facil de configurar en 10 minutos.',
  },
]

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="border-t border-zinc-200/60 bg-zinc-50 py-20 dark:border-zinc-800/60 dark:bg-zinc-900/50"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Barberias que ya{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              transformaron su negocio
            </span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {testimonial.role} · {testimonial.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
