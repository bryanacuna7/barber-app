import { NextResponse } from 'next/server'
import { withAuthAndRateLimit } from '@/lib/api/middleware'

type AppointmentRow = {
  scheduled_at: string | null
  status: string | null
  price: number | null
  payment_method: string | null
  source: string | null
  client: { name: string } | null
  service: { name: string } | null
  barber: { name: string } | null
}

const STATUS_MAP: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No Asistió',
}

const SOURCE_MAP: Record<string, string> = {
  web_booking: 'Web',
  walk_in: 'Presencial',
  owner_created: 'Dueño',
  barber_created: 'Miembro del equipo',
}

const PAYMENT_METHOD_MAP: Record<string, string> = {
  cash: 'Efectivo',
  sinpe: 'SINPE',
  card: 'Tarjeta',
}

export const GET = withAuthAndRateLimit(
  async (_request, _params, { business, supabase }) => {
    const { data, error } = await (supabase as any)
      .from('appointments')
      .select(
        `
        scheduled_at, status, price, payment_method, source,
        client:clients(name),
        service:services(name),
        barber:barbers(name)
      `
      )
      .eq('business_id', business.id)
      .order('scheduled_at', { ascending: false })
      .limit(5000)

    if (error) {
      return NextResponse.json({ error: 'Error al exportar citas' }, { status: 500 })
    }

    const csvHeaders = [
      'Fecha',
      'Cliente',
      'Servicio',
      'Miembro del equipo',
      'Estado',
      'Precio',
      'Método Pago',
      'Origen',
    ]

    const rows = ((data as AppointmentRow[]) || []).map((a) => [
      a.scheduled_at
        ? new Date(a.scheduled_at).toLocaleDateString('es-CR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '',
      escapeCsv(a.client?.name || ''),
      escapeCsv(a.service?.name || ''),
      escapeCsv(a.barber?.name || ''),
      a.status ? (STATUS_MAP[a.status] ?? a.status) : '',
      String(a.price ?? ''),
      a.payment_method ? (PAYMENT_METHOD_MAP[a.payment_method] ?? a.payment_method) : '',
      a.source ? (SOURCE_MAP[a.source] ?? a.source) : '',
    ])

    const bom = '\uFEFF'
    const csv = bom + [csvHeaders.join(','), ...rows.map((r) => r.join(','))].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="citas_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  },
  { interval: 3_600_000, maxRequests: 5 }
)

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
