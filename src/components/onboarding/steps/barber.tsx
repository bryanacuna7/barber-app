'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BarberProps {
  onNext: (barber: BarberData) => void
  onBack: () => void
  initialBarber?: BarberData
}

export interface BarberData {
  name: string
  phone: string
  email: string
}

export function Barber({ onNext, onBack, initialBarber }: BarberProps) {
  const [barber, setBarber] = useState<BarberData>(
    initialBarber || {
      name: '',
      phone: '',
      email: '',
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!barber.name.trim()) {
      newErrors.name = 'El nombre del barbero es requerido'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onNext(barber)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <User className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Tu Primer Barbero</h2>
        <p className="text-zinc-600 dark:text-zinc-400">Registra el primer miembro de tu equipo</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nombre Completo *
          </label>
          <Input
            type="text"
            value={barber.name}
            onChange={(e) => {
              setBarber({ ...barber, name: e.target.value })
              setErrors({ ...errors, name: '' })
            }}
            placeholder="Ej: Carlos Rodríguez"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Phone (optional) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Teléfono <span className="text-zinc-400">(opcional)</span>
          </label>
          <Input
            type="tel"
            value={barber.phone}
            onChange={(e) => setBarber({ ...barber, phone: e.target.value })}
            placeholder="Ej: 8888-8888"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Útil para notificaciones de citas
          </p>
        </div>

        {/* Email (optional) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email <span className="text-zinc-400">(opcional)</span>
          </label>
          <Input
            type="email"
            value={barber.email}
            onChange={(e) => setBarber({ ...barber, email: e.target.value })}
            placeholder="Ej: carlos@ejemplo.com"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Para enviar confirmaciones de citas
          </p>
        </div>

        {/* Preview */}
        {barber.name && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-6 border border-green-200 dark:border-green-800"
          >
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Vista previa:
            </p>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-white text-xl font-bold">
                {barber.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                  {barber.name}
                </h3>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-0.5">
                  {barber.phone && <p>📱 {barber.phone}</p>}
                  {barber.email && <p>✉️ {barber.email}</p>}
                  {!barber.phone && !barber.email && <p className="text-zinc-400">Sin contacto</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Info box */}
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Tip:</strong> Puedes agregar más barberos después desde la sección
            &ldquo;Barberos&rdquo; en el menú.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Atrás
          </Button>
          <Button type="submit" className="group bg-green-600 hover:bg-green-700 text-white">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
