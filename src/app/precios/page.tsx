import Link from 'next/link'
import {
  Check,
  X,
  Scissors,
  Users,
  Palette,
  Calendar,
  Crown,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'

export const metadata = {
  title: 'Precios - BarberApp',
  description: 'Elige el plan perfecto para tu barbería. 7 días de prueba gratis.',
}

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
      { label: 'Equipo ilimitado', included: false },
      { label: 'Servicios ilimitados', included: false },
    ],
    cta: 'Empieza gratis',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'Para barberías en crecimiento',
    features: [
      { label: 'Equipo ilimitado', included: true },
      { label: 'Servicios ilimitados', included: true },
      { label: 'Clientes ilimitados', included: true },
      { label: 'Reservas en línea', included: true },
      { label: 'Dashboard de citas', included: true },
      { label: 'Personalización de marca', included: true },
      { label: 'Logo personalizado', included: true },
      { label: 'Soporte prioritario', included: true },
    ],
    cta: 'Empieza gratis',
    popular: true,
  },
]

const faqs = [
  {
    question: '¿Cómo funciona la prueba gratuita?',
    answer:
      'Al registrarte, obtienes 7 días de acceso completo a todas las funciones Pro. No necesitas tarjeta de crédito. Después de los 7 días, puedes elegir un plan o continuar con el plan Básico.',
  },
  {
    question: '¿Cómo puedo pagar?',
    answer:
      'Aceptamos pagos por SINPE Móvil. Una vez que eliges tu plan, puedes reportar tu pago subiendo el comprobante en la app o enviándolo por WhatsApp a nuestro soporte.',
  },
  {
    question: '¿Puedo cambiar de plan después?',
    answer:
      'Sí, puedes actualizar a Pro en cualquier momento. Si ya tienes más miembros del equipo, servicios o clientes de los permitidos en Básico, simplemente no podrás agregar más hasta que actualices.',
  },
  {
    question: '¿Qué pasa si cancelo?',
    answer:
      'No pierdes tus datos. Tu cuenta se convierte a plan Básico y puedes seguir usando el sistema con las limitaciones del plan. Tus datos siempre están seguros.',
  },
]

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
              <Scissors className="h-4 w-4 text-white dark:text-zinc-900" />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-white">BarberApp</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <Crown className="h-4 w-4" />7 días de prueba gratis
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Planes simples,
            <br />
            precios honestos
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Elige el plan que mejor se adapte a tu barbería.
            <br />
            Sin contratos, sin sorpresas.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
                  : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                    Recomendado
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-zinc-500">/mes</span>
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 flex-shrink-0 text-zinc-300 dark:text-zinc-600" />
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
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                }`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-zinc-200 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-zinc-900 dark:text-white">
            Todo lo que necesitas para gestionar tu barbería
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={Calendar}
              title="Reservas Online"
              description="Tus clientes pueden agendar citas 24/7 desde cualquier dispositivo."
            />
            <FeatureCard
              icon={Users}
              title="Gestión de Clientes"
              description="Historial completo, visitas, gastos y segmentación automática."
            />
            <FeatureCard
              icon={Scissors}
              title="Multi-Staff"
              description="Cada miembro del equipo con su propio horario y disponibilidad."
            />
            <FeatureCard
              icon={Palette}
              title="Tu Marca"
              description="Personaliza colores y logo para que tu página refleje tu estilo."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-white">
            Preguntas frecuentes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-white">{faq.question}</h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-200 bg-zinc-900 py-16 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Empieza tu prueba gratuita hoy</h2>
          <p className="mt-4 text-zinc-400">7 días de acceso completo. Sin tarjeta de crédito.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/50688888888"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              <MessageCircle className="h-4 w-4" />
              Hablar con soporte
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-zinc-500">
          <p>&copy; 2026 BarberApp. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  )
}
