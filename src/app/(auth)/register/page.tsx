'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    // 1. Create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      setError(authError.message === 'User already registered'
        ? 'Este correo ya está registrado'
        : 'Error al crear la cuenta. Intenta de nuevo.')
      setIsLoading(false)
      return
    }

    if (!authData.user) {
      setError('Error al crear la cuenta')
      setIsLoading(false)
      return
    }

    // 2. Create business
    const slug = generateSlug(formData.businessName)

    const { error: businessError } = await supabase
      .from('businesses')
      .insert({
        owner_id: authData.user.id,
        name: formData.businessName,
        slug: slug,
      })

    if (businessError) {
      setError('Error al crear el negocio. El nombre puede estar en uso.')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>
          Registra tu barbería en BarberShop Pro
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Nombre de tu barbería"
            type="text"
            name="businessName"
            placeholder="Barbería El Patrón"
            value={formData.businessName}
            onChange={handleChange}
            required
          />

          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type={showPasswords ? 'text' : 'password'}
            name="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
            Debe tener al menos 6 caracteres.
          </p>

          <Input
            label="Confirmar contraseña"
            type={showPasswords ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          <label className="flex items-center gap-2 text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            Mostrar contraseñas
          </label>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Crear Cuenta
          </Button>

          <p className="text-center text-sm text-zinc-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-zinc-900 underline dark:text-white">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
