'use client'

/**
 * ClientTableView
 *
 * Extracted table view for the Clientes dashboard page.
 * Renders a sortable, interactive table of clients with segment badges,
 * spending totals, visit counts, and hover action buttons.
 *
 * Extracted from: src/app/(dashboard)/clientes/page.tsx (lines 1361–1501)
 */

import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, ChevronsUpDown, MessageCircle, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getClientSegment } from '@/lib/utils/client-segments'
import { segmentConfig } from '@/components/clients/segment-config'
import { animations } from '@/lib/design-system'
import { buildWhatsAppLink } from '@/lib/whatsapp/deep-link'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortColumn = 'name' | 'segment' | 'spent' | 'visits' | null

interface ClientTableViewProps {
  clients: Client[]
  sortColumn: SortColumn
  sortDirection: 'asc' | 'desc'
  onSort: (column: SortColumn) => void
  onSelectClient: (client: Client) => void
}

// ---------------------------------------------------------------------------
// Sub-component: SortIndicator
// ---------------------------------------------------------------------------

function SortIndicator({
  column,
  sortColumn,
  sortDirection,
}: {
  column: string
  sortColumn: string | null
  sortDirection: 'asc' | 'desc'
}) {
  if (sortColumn !== column)
    return <ChevronsUpDown className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
  return sortDirection === 'asc' ? (
    <ArrowUp className="h-4 w-4 text-blue-500" />
  ) : (
    <ArrowDown className="h-4 w-4 text-blue-500" />
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ClientTableView({
  clients,
  sortColumn,
  sortDirection,
  onSort,
  onSelectClient,
}: ClientTableViewProps) {
  function handleWhatsApp(phone: string) {
    const link = buildWhatsAppLink(phone)
    if (link) window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      key="table"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={animations.spring.gentle}
      className="rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <tr>
              {/* Cliente */}
              <th className="px-4 py-3 text-left">
                <Button
                  variant="ghost"
                  onClick={() => onSort('name')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-zinc-900 dark:hover:text-white h-auto p-0"
                >
                  Cliente
                  <SortIndicator
                    column="name"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </Button>
              </th>

              {/* Segmento */}
              <th className="px-4 py-3 text-left">
                <Button
                  variant="ghost"
                  onClick={() => onSort('segment')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted hover:text-zinc-900 dark:hover:text-white h-auto p-0"
                >
                  Segmento
                  <SortIndicator
                    column="segment"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </Button>
              </th>

              {/* Gastado */}
              <th className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  onClick={() => onSort('spent')}
                  className="flex items-center justify-end gap-2 text-xs font-semibold text-muted hover:text-zinc-900 dark:hover:text-white ml-auto h-auto p-0"
                >
                  Gastado
                  <SortIndicator
                    column="spent"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </Button>
              </th>

              {/* Visitas */}
              <th className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  onClick={() => onSort('visits')}
                  className="flex items-center justify-end gap-2 text-xs font-semibold text-muted hover:text-zinc-900 dark:hover:text-white ml-auto h-auto p-0"
                >
                  Visitas
                  <SortIndicator
                    column="visits"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                  />
                </Button>
              </th>

              {/* Acciones (screen-reader only label) */}
              <th className="px-4 py-3 text-center text-xs font-semibold text-muted">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {clients.map((client) => {
              const segment = getClientSegment(client)
              const config = segmentConfig[segment]
              const SegmentIcon = config.icon

              const lastVisitLabel = client.last_visit_at
                ? format(new Date(client.last_visit_at + 'T12:00:00'), 'd MMM yyyy', { locale: es })
                : '—'

              return (
                <tr
                  key={client.id}
                  className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  onClick={() => onSelectClient(client)}
                >
                  {/* Avatar + Name + Phone */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{client.name}</p>
                        <p className="text-xs text-muted">{client.phone}</p>
                      </div>
                    </div>
                  </td>

                  {/* Segment badge */}
                  <td className="px-4 py-3">
                    <div
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${config.color}`}
                    >
                      <SegmentIcon className="h-3 w-3" />
                      {config.label}
                    </div>
                  </td>

                  {/* Total spent */}
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(Number(client.total_spent || 0))}
                    </p>
                  </td>

                  {/* Total visits */}
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-semibold text-foreground">{client.total_visits}</p>
                  </td>

                  {/* Hover actions */}
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWhatsApp(client.phone)}
                        aria-label={`WhatsApp ${client.name}`}
                        className="p-1.5 h-auto min-h-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => onSelectClient(client)}
                        aria-label={`Ver perfil de ${client.name}`}
                        className="rounded-lg p-1.5 text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 h-auto"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
