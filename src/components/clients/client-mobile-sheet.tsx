'use client'

import { useState } from 'react'
import {
  Phone,
  Mail,
  Scissors,
  Wallet,
  Calendar,
  MessageCircle,
  Crown,
  Copy,
  Check,
  NotepadText,
} from 'lucide-react'
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'
import { formatCurrencyCompact } from '@/lib/utils'
import { getClientSegment } from '@/lib/utils/client-segments'
import { segmentConfig } from '@/components/clients/segment-config'
import { buildWhatsAppLink } from '@/lib/whatsapp/deep-link'
import type { Client } from '@/types'

interface ClientMobileSheetProps {
  client: Client | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function formatLastVisit(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Sin visitas'
  const days = Math.floor(
    (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days}d`
  if (days < 30) return `${Math.floor(days / 7)} sem`
  return `${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? 'es' : ''}`
}

export function ClientMobileSheet({ client, isOpen, onOpenChange }: ClientMobileSheetProps) {
  const [copied, setCopied] = useState(false)

  if (!client) return null

  const segment = getClientSegment(client)
  const segConfig = segmentConfig[segment]
  const whatsappUrl = client.phone ? buildWhatsAppLink(client.phone) : null

  const handleCopyPhone = async () => {
    if (!client.phone || copied) return
    try {
      await navigator.clipboard.writeText(client.phone)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // No-op: clipboard may be blocked in some webviews.
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="lg:hidden rounded-t-3xl max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 pb-safe"
      >
        <SheetClose onClose={() => onOpenChange(false)} />

        {/* ── Centered Profile Header (Apple Contacts style) ── */}
        <div className="flex flex-col items-center pt-1 pb-4">
          <div className="relative mb-2.5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 text-2xl font-bold text-white">
              {client.name.charAt(0).toUpperCase()}
            </div>
            {segment === 'vip' && (
              <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-500 p-[3px] ring-2 ring-white dark:ring-zinc-900">
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <p className="font-bold text-lg text-foreground text-center truncate max-w-[85%]">
            {client.name}
          </p>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border mt-1 ${segConfig.color}`}
          >
            {segConfig.label}
          </span>
        </div>

        {/* ── Quick Action Buttons (Apple Contacts style) ── */}
        <div className="flex items-center justify-center gap-3 pb-4">
          {client.phone && (
            <a href={`tel:${client.phone}`} className="flex flex-col items-center gap-1 w-16">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors active:bg-blue-500/20">
                <Phone className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">
                Llamar
              </span>
            </a>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 w-16"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors active:bg-emerald-500/20">
                <MessageCircle className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                WhatsApp
              </span>
            </a>
          )}
          {client.phone && (
            <button
              type="button"
              onClick={handleCopyPhone}
              className="flex flex-col items-center gap-1 w-16"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors active:bg-zinc-500/20 ${
                  copied
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-zinc-500/10 text-muted'
                }`}
              >
                {copied ? (
                  <Check className="h-[18px] w-[18px]" />
                ) : (
                  <Copy className="h-[18px] w-[18px]" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${copied ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </span>
            </button>
          )}
          {client.email && (
            <a href={`mailto:${client.email}`} className="flex flex-col items-center gap-1 w-16">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-colors active:bg-violet-500/20">
                <Mail className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">
                Email
              </span>
            </a>
          )}
        </div>

        {/* ── Stats Grid (2x2 compact tiles) ── */}
        <div className="grid grid-cols-2 gap-2 pb-3">
          <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Scissors className="h-3 w-3 text-muted" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                Visitas
              </span>
            </div>
            <p className="text-base font-bold text-foreground">{client.total_visits || 0}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Wallet className="h-3 w-3 text-muted" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                Gastado
              </span>
            </div>
            <p className="text-base font-bold text-foreground">
              {formatCurrencyCompact(Number(client.total_spent || 0))}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Calendar className="h-3 w-3 text-muted" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                Última visita
              </span>
            </div>
            <p className="text-base font-bold text-foreground">
              {formatLastVisit(client.last_visit_at)}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Phone className="h-3 w-3 text-muted" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
                Teléfono
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {client.phone || '—'}
            </p>
          </div>
        </div>

        {/* ── Notes (if present) ── */}
        {client.notes && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <NotepadText className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Notas
              </span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {client.notes}
            </p>
          </div>
        )}

        {/* Bottom safe area spacing */}
        <div className="h-2" />
      </SheetContent>
    </Sheet>
  )
}
