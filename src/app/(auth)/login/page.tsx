'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
      setIsLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa a tu cuenta de BarberShop Pro
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <label className="flex items-center gap-2 text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            Mostrar contraseña
          </label>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Iniciar Sesión
          </Button>

          <p className="text-center text-sm text-zinc-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-zinc-900 underline dark:text-white">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function LoginFormSkeleton() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="h-8 w-40 mx-auto skeleton rounded" />
        <div className="h-4 w-56 mx-auto mt-2 skeleton rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-32 skeleton rounded" />
          <div className="h-10 w-full skeleton rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-10 w-full skeleton rounded-lg" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="h-10 w-full skeleton rounded-lg" />
        <div className="h-4 w-48 mx-auto skeleton rounded" />
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
