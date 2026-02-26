import { NextResponse } from 'next/server'
import { withAuthAndRateLimit } from '@/lib/api/middleware'

export const GET = withAuthAndRateLimit(
  async (_request, _params, { business, supabase }) => {
    const EXPORT_LIMIT = 10000
    const { data: clients, error } = await supabase
      .from('clients')
      .select('name, phone, email, total_visits, total_spent, last_visit_at')
      .eq('business_id', business.id)
      .order('name', { ascending: true })
      .limit(EXPORT_LIMIT + 1)

    if (error) {
      return NextResponse.json({ error: 'Error al exportar clientes' }, { status: 500 })
    }

    const truncated = (clients?.length ?? 0) > EXPORT_LIMIT
    const exportData = truncated ? clients!.slice(0, EXPORT_LIMIT) : (clients ?? [])

    const headers = ['Nombre', 'Teléfono', 'Email', 'Visitas', 'Total Gastado', 'Última Visita']
    const rows = exportData.map((c) => [
      escapeCsv(c.name || ''),
      escapeCsv(c.phone || ''),
      escapeCsv(c.email || ''),
      String(c.total_visits ?? 0),
      String(c.total_spent ?? 0),
      c.last_visit_at ? new Date(c.last_visit_at).toLocaleDateString('es-CR') : '',
    ])

    const bom = '\uFEFF'
    const csv = bom + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="clientes_${new Date().toISOString().split('T')[0]}.csv"`,
        ...(truncated ? { 'X-Export-Truncated': 'true' } : {}),
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
