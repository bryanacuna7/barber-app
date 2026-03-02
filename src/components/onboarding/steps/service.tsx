'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scissors, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ServiceProps {
  onNext: (service: ServiceData) => void
  onBack: () => void
  initialService?: ServiceData
}

export interface ServiceData {
  name: string
  price: number
  duration_minutes: number
}

export function Service({ onNext, onBack, initialService }: ServiceProps) {
  const [service, setService] = useState<ServiceData>(
    initialService || {
      name: '',
      price: 5000,
      duration_minutes: 30,
    }
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!service.name.trim()) {
      newErrors.name = 'El nombre del servicio es requerido'
    }
    if (service.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0'
    }
    if (service.duration_minutes <= 0) {
      newErrors.duration = 'La duración debe ser mayor a 0'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onNext(service)
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
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
          <Scissors className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Tu Primer Servicio
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Empieza agregando un servicio básico. Puedes agregar más después.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Suggested services */}
        <div className="rounded-2xl bg-white dark:bg-zinc-800 p-6 border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Sugerencias populares:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Corte Regular', price: 5000, duration_minutes: 30 },
              { name: 'Corte + Barba', price: 8000, duration_minutes: 45 },
              { name: 'Afeitado Clásico', price: 6000, duration_minutes: 40 },
              { name: 'Corte Niño', price: 4000, duration_minutes: 25 },
            ].map((suggestion) => (
              <button
                key={suggestion.name}
                type="button"
                onClick={() => setService(suggestion)}
                className="rounded-full bg-zinc-100 dark:bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
              >
                {suggestion.name}
              </button>
            ))}
          </div>
        </div>

        {/* Service name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nombre del Servicio *
          </label>
          <Input
            type="text"
            value={service.name}
            onChange={(e) => {
              setService({ ...service, name: e.target.value })
              setErrors({ ...errors, name: '' })
            }}
            placeholder="Ej: Corte Regular"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Price and duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Precio (₡) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">₡</span>
              <Input
                type="number"
                value={service.price}
                onChange={(e) => {
                  setService({ ...service, price: Number(e.target.value) })
                  setErrors({ ...errors, price: '' })
                }}
                placeholder="5000"
                className={`pl-8 ${errors.price ? 'border-red-500' : ''}`}
                min="0"
                step="500"
              />
            </div>
            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Duración (minutos) *
            </label>
            <div className="relative">
              <Input
                type="number"
                value={service.duration_minutes}
                onChange={(e) => {
                  setService({ ...service, duration_minutes: Number(e.target.value) })
                  setErrors({ ...errors, duration: '' })
                }}
                placeholder="30"
                className={errors.duration ? 'border-red-500' : ''}
                min="5"
                step="5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                min
              </span>
            </div>
            {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
          </div>
        </div>

        {/* Preview */}
        {service.name && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 border border-purple-200 dark:border-purple-800"
          >
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Vista previa:
            </p>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                  {service.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {service.duration_minutes} minutos
                </p>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ₡{service.price.toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Atrás
          </Button>
          <Button type="submit" className="group bg-purple-600 hover:bg-purple-700 text-white">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
