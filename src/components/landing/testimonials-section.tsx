'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Carlos Rodríguez',
    role: 'Dueño',
    business: 'Barber Studio CR',
    location: 'San José',
    avatar: 'CR',
    rating: 5,
    quote:
      'Antes perdía 2-3 horas diarias confirmando citas por WhatsApp. Ahora todo es automático y mis clientes aman la experiencia de reservar online.',
  },
  {
    name: 'Ana Méndez',
    role: 'Manager',
    business: 'The Barber House',
    location: 'Heredia',
    avatar: 'AM',
    rating: 5,
    quote:
      'Los no-shows bajaron un 80%. El sistema de recordatorios automáticos es increíble. Mi equipo se enfoca en cortar pelo, no en manejar agendas.',
  },
  {
    name: 'Diego Castro',
    role: 'Dueño',
    business: 'Castro Barbershop',
    location: 'Alajuela',
    avatar: 'DC',
    rating: 5,
    quote:
      'En 3 meses recuperé la inversión. Mis ingresos subieron porque ahora puedo tener más citas al día sin caos. El mejor cambio que hice este año.',
  },
  {
    name: 'Luis Morales',
    role: 'Barbero',
    business: 'Kings Barbershop',
    location: 'Cartago',
    avatar: 'LM',
    rating: 5,
    quote:
      'Super fácil de usar. En 10 minutos ya tenía mi agenda configurada. Los clientes me dicen que es la mejor experiencia de reserva que han tenido.',
  },
  {
    name: 'María González',
    role: 'Dueña',
    business: 'Glamour Barber',
    location: 'Escazú',
    avatar: 'MG',
    rating: 5,
    quote:
      'El branding personalizado hace que mi página de reservas se vea súper profesional. Mis clientes piensan que tengo un equipo de TI.',
  },
  {
    name: 'Roberto Sánchez',
    role: 'Manager',
    business: 'Elite Cuts',
    location: 'Santa Ana',
    avatar: 'RS',
    rating: 5,
    quote:
      'La analítica me ayuda a entender qué servicios vender más y en qué horarios. Aumenté mis ingresos 40% en 4 meses gracias a los insights.',
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-br from-zinc-50 to-zinc-100 py-20 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Historias de{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              éxito real
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Miles de barberías confían en BarberShop Pro para transformar su negocio
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Quote Icon */}
              <div className="absolute right-6 top-6 opacity-10 transition-opacity group-hover:opacity-20">
                <Quote className="h-16 w-16 text-zinc-900 dark:text-white" />
              </div>

              {/* Rating */}
              <div className="relative flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="relative mt-4 text-zinc-700 dark:text-zinc-300">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="relative mt-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {testimonial.role} · {testimonial.business}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-zinc-600 dark:text-zinc-400">¿Listo para unirte a ellos?</p>
          <a
            href="/register"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/40"
          >
            Comenzar gratis
          </a>
        </motion.div>
      </div>
    </section>
  )
}
