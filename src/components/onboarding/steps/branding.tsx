'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Palette, ArrowRight, ArrowLeft, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ColorPicker } from '@/components/ui/color-picker'

interface BrandingProps {
  onNext: (branding: BrandingData) => void
  onBack: () => void
  onSkip: () => void
  initialBranding?: BrandingData
}

export interface BrandingData {
  primaryColor: string
  secondaryColor: string | null
  logo: File | null
  logoPreview: string | null
}

export function Branding({ onNext, onBack, onSkip, initialBranding }: BrandingProps) {
  const [branding, setBranding] = useState<BrandingData>(
    initialBranding || {
      primaryColor: '#27272A', // Default monochrome
      secondaryColor: null,
      logo: null,
      logoPreview: null,
    }
  )

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('El logo debe ser menor a 2MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setBranding({
          ...branding,
          logo: file,
          logoPreview: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setBranding({
      ...branding,
      logo: null,
      logoPreview: null,
    })
  }

  const handleSubmit = () => {
    onNext(branding)
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
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
          <Palette className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Personaliza tu Marca
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-2">
          Dale un toque único a tu barbería (opcional)
        </p>
        <button
          onClick={onSkip}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Saltar este paso →
        </button>
      </div>

      <div className="space-y-8">
        {/* Color picker */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Color Principal
          </label>
          <ColorPicker
            value={branding.primaryColor}
            onChange={(color) => setBranding({ ...branding, primaryColor: color })}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Este color aparecerá en detalles de tu dashboard y página de reservas
          </p>
        </div>

        {/* Logo upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Logo de tu Barbería
          </label>

          {!branding.logoPreview ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl cursor-pointer bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-zinc-400 mb-3" />
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold">Click para subir</span> o arrastra aquí
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  PNG, JPG, SVG (máx. 2MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </label>
          ) : (
            <div className="relative rounded-2xl bg-white dark:bg-zinc-800 p-6 border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={handleRemoveLogo}
                className="absolute top-3 right-3 p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-4">
                <img
                  src={branding.logoPreview}
                  alt="Logo preview"
                  className="h-20 w-20 object-contain rounded-lg bg-zinc-100 dark:bg-zinc-700 p-2"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    Logo subido
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {branding.logo?.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Vista previa:
          </p>
          <div className="rounded-xl bg-white dark:bg-zinc-800 p-6">
            {branding.logoPreview && (
              <img
                src={branding.logoPreview}
                alt="Logo"
                className="h-12 mb-4 object-contain"
              />
            )}
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-full"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  Tu color de marca:
                </p>
                <p className="font-mono text-lg font-semibold text-zinc-900 dark:text-white">
                  {branding.primaryColor}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Tip:</strong> Puedes cambiar estos ajustes en cualquier momento desde Configuración.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Atrás
          </Button>
          <Button
            onClick={handleSubmit}
            className="group bg-amber-600 hover:bg-amber-700 text-white"
          >
            Continuar
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
