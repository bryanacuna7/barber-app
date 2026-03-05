'use client'

import { useState } from 'react'
import { CheckCircle2, Copy, Check, MessageCircle, Link2 } from 'lucide-react'
import { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { haptics, isMobileDevice } from '@/lib/utils/mobile'
import { trackMobileEvent } from '@/lib/analytics/mobile'
import { useAddBarber, useInviteBarber } from '@/hooks/queries/useBarbers'

// ─── Invite Form Content ────────────────────────────────────

function InviteContent({ onClose }: { onClose: () => void }) {
  const toast = useToast()
  const addBarber = useAddBarber()
  const inviteBarber = useInviteBarber()
  const [mode, setMode] = useState<'add' | 'invite'>('add')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [setupResult, setSetupResult] = useState<{
    barberName: string
    setupUrl: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    const isMobile = isMobileDevice()
    const safeMode = mode
    const safeEmail = email.trim()

    try {
      const result =
        mode === 'add'
          ? await addBarber.mutateAsync({ name: name.trim(), email: email.trim() })
          : await inviteBarber.mutateAsync({ name: name.trim(), email: email.trim() })

      if (result.setup_url) {
        setSetupResult({ barberName: name.trim(), setupUrl: result.setup_url })
        if (isMobile) {
          haptics.success()
          trackMobileEvent('mobile_equipo_invite_success', {
            mode: safeMode,
            via: 'setup_url',
            emailDomain: safeEmail.split('@')[1] ?? 'unknown',
          })
        }
      } else {
        toast.success('Miembro del equipo agregado')
        if (isMobile) {
          haptics.success()
          trackMobileEvent('mobile_equipo_invite_success', {
            mode: safeMode,
            via: 'direct',
            emailDomain: safeEmail.split('@')[1] ?? 'unknown',
          })
        }
        resetAndClose()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al invitar miembro del equipo'
      toast.error(msg)
      if (isMobile) {
        haptics.error()
        trackMobileEvent('mobile_equipo_invite_error', {
          mode: safeMode,
          message: msg,
          emailDomain: safeEmail.split('@')[1] ?? 'unknown',
        })
      }
    }
  }

  const handleCopy = async () => {
    if (!setupResult) return
    try {
      await navigator.clipboard.writeText(setupResult.setupUrl)
      setCopied(true)
      toast.success('Link copiado')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  const handleWhatsApp = () => {
    if (!setupResult) return
    const text = `¡Hola ${setupResult.barberName}! Te agregué al equipo. Usa este enlace para crear tu contraseña:\n${setupResult.setupUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const resetAndClose = () => {
    setName('')
    setEmail('')
    setMode('add')
    setSetupResult(null)
    setCopied(false)
    onClose()
  }

  // Success state
  if (setupResult) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-800 dark:text-emerald-300">
            <span className="font-medium">{setupResult.barberName}</span> ya tiene cuenta. Solo
            falta que establezca su contraseña.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted">Enlace de acceso</label>
          <div className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 p-2.5">
            <Link2 className="size-4 shrink-0 text-subtle" />
            <span className="flex-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
              {setupResult.setupUrl}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 p-1.5 h-auto min-h-0"
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleWhatsApp} className="h-11 gap-2">
            <MessageCircle className="size-4" />
            WhatsApp
          </Button>
          <Button type="button" onClick={handleCopy} className="h-11 gap-2">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copiado' : 'Copiar link'}
          </Button>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="ghost" onClick={resetAndClose} className="h-11">
            Listo
          </Button>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1">
        <button
          type="button"
          onClick={() => setMode('add')}
          className={`h-10 rounded-lg text-sm font-medium transition-colors ${
            mode === 'add'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Agregar
        </button>
        <button
          type="button"
          onClick={() => setMode('invite')}
          className={`h-10 rounded-lg text-sm font-medium transition-colors ${
            mode === 'invite'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Invitar
        </button>
      </div>

      <Input
        label="Nombre"
        type="text"
        placeholder="Ej: Juan Pérez"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <Input
        label="Email"
        type="email"
        placeholder="juan@ejemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={resetAndClose}
          className="h-11 w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={addBarber.isPending || inviteBarber.isPending}
          disabled={!name.trim() || !email.trim()}
          className="h-11 w-full sm:w-auto"
        >
          {mode === 'add' ? 'Agregar Miembro' : 'Enviar Invitación'}
        </Button>
      </div>
    </form>
  )
}

// ─── Viewport-gated wrapper ─────────────────────────────────

interface TeamInviteSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeamInviteSheet({ open, onOpenChange }: TeamInviteSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const handleClose = () => onOpenChange(false)

  if (isDesktop) {
    return (
      <Modal
        isOpen={open}
        onClose={handleClose}
        title="Agregar Miembro del equipo"
        description="Crea su cuenta y envíale un enlace para establecer su contraseña."
      >
        <InviteContent onClose={handleClose} />
      </Modal>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetClose onClose={handleClose} />
        <SheetHeader>
          <SheetTitle>Agregar Miembro</SheetTitle>
        </SheetHeader>
        <div className="max-h-[70vh] overflow-y-auto -mx-6 px-6 pb-[env(safe-area-inset-bottom,0px)]">
          <InviteContent onClose={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
