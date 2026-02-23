'use client'

import { useRef, useState } from 'react'
import { Copy, Smartphone, Upload } from 'lucide-react'
import type { AdvancePaymentInfo } from '@/types'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface AdvancePaymentSubmitProps {
  advancePaymentInfo: AdvancePaymentInfo
  trackingToken: string
  businessWhatsapp: string | null
  clientName: string
  appointmentDate: string
  appointmentTime: string
  onSuccess: () => void
  onCancel: () => void
}

type UIState = 'info' | 'whatsapp-sent' | 'submitting' | 'success'

export function AdvancePaymentSubmit({
  advancePaymentInfo,
  trackingToken,
  businessWhatsapp,
  clientName,
  appointmentDate,
  appointmentTime,
  onSuccess,
  onCancel,
}: AdvancePaymentSubmitProps) {
  const [uiState, setUIState] = useState<UIState>('info')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const { sinpe_phone, sinpe_holder_name, final_price, service_price, discount } =
    advancePaymentInfo

  function handleCopyPhone() {
    navigator.clipboard.writeText(sinpe_phone).then(() => {
      toast.success('Número copiado')
    })
  }

  function handleWhatsApp() {
    if (!businessWhatsapp) {
      toast.error('Este negocio no tiene WhatsApp configurado')
      return
    }

    const lines = [
      'Hola, adjunto comprobante SINPE por mi cita:',
      `- Fecha: ${appointmentDate}`,
      `- Hora: ${appointmentTime}`,
      `- Monto: ₡${final_price.toLocaleString()}`,
    ]
    if (clientName) {
      lines.push(`- Nombre: ${clientName}`)
    }
    const message = lines.join('\n')
    const phone = businessWhatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    setUIState('whatsapp-sent')
  }

  async function handleWhatsAppConfirm() {
    setUIState('submitting')
    try {
      const res = await fetch('/api/public/advance-payment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: trackingToken, channel: 'whatsapp' }),
      })
      if (res.ok) {
        setUIState('success')
        onSuccess()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al registrar el comprobante')
        setUIState('whatsapp-sent')
      }
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
      setUIState('whatsapp-sent')
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no puede superar 5MB')
      e.target.value = ''
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      e.target.value = ''
      return
    }

    setUIState('submitting')
    try {
      const formData = new FormData()
      formData.append('token', trackingToken)
      formData.append('channel', 'upload')
      formData.append('file', file)

      const res = await fetch('/api/public/advance-payment/submit', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setUIState('success')
        onSuccess()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Error al subir el comprobante')
        setUIState('info')
      }
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.')
      setUIState('info')
    } finally {
      e.target.value = ''
    }
  }

  if (uiState === 'success') {
    return null
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 space-y-4 dark:border-blue-800 dark:bg-blue-950/30">
      <div>
        <p className="text-[16px] font-semibold text-blue-900 dark:text-blue-100">
          Pago Anticipado SINPE
        </p>
        <p className="mt-0.5 text-[13px] text-blue-700 dark:text-blue-300">
          Transferí antes de tu cita y obtené {discount}% de descuento
        </p>
      </div>

      {/* SINPE phone copy row */}
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1.5">
          Número SINPE
        </p>
        <div className="flex items-center justify-between rounded-xl bg-white/70 px-4 py-3 dark:bg-blue-900/40">
          <span className="text-[17px] font-bold tracking-wide text-blue-900 dark:text-blue-100">
            {sinpe_phone}
          </span>
          <button
            onClick={handleCopyPhone}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800/60 transition-colors"
            aria-label="Copiar número SINPE"
          >
            <Copy className="h-3.5 w-3.5" />
            Copiar
          </button>
        </div>
        {sinpe_holder_name && (
          <p className="mt-1.5 text-[13px] text-blue-700 dark:text-blue-300">
            A nombre de: <span className="font-semibold">{sinpe_holder_name}</span>
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="rounded-xl bg-white/70 px-4 py-3 dark:bg-blue-900/40">
        <p className="text-[13px] text-blue-700 dark:text-blue-300">Monto a transferir:</p>
        <p className="mt-0.5 text-[20px] font-bold text-blue-900 dark:text-blue-100">
          ₡{final_price.toLocaleString()}
        </p>
        <p className="text-[12px] text-blue-500 dark:text-blue-400">
          Precio original ₡{service_price.toLocaleString()} — {discount}% de descuento
        </p>
      </div>

      {/* Action buttons */}
      {uiState === 'info' && (
        <div className="space-y-2.5">
          {businessWhatsapp && (
            <Button onClick={handleWhatsApp} className="w-full h-11" variant="primary">
              <Smartphone className="h-4 w-4 mr-2" />
              Enviar por WhatsApp
            </Button>
          )}
          <Button onClick={handleUploadClick} className="w-full h-11" variant="secondary">
            <Upload className="h-4 w-4 mr-2" />
            Subir comprobante
          </Button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 text-[14px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {uiState === 'whatsapp-sent' && (
        <div className="space-y-2.5">
          <p className="text-[13px] text-blue-700 dark:text-blue-300 text-center">
            Ya envié el comprobante por WhatsApp
          </p>
          <Button onClick={handleWhatsAppConfirm} className="w-full h-11" variant="success">
            Ya envié mi comprobante
          </Button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 text-[14px] font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {uiState === 'submitting' && (
        <Button isLoading disabled className="w-full h-11" variant="primary">
          Enviando...
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Subir comprobante de pago"
      />
    </div>
  )
}
