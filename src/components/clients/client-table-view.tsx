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

import type { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getClientSegment } from '@/lib/utils/client-segments'
import { segmentConfig } from '@/components/clients/segment-config'
import { animations } from '@/lib/design-system'
import { buildWhatsAppLink } from '@/lib/whatsapp/deep-link'
import { EntityContextMenu } from '@/components/ui/entity-context-menu'

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
  // Bulk selection (optional — backwards compatible)
  isSelected?: (id: string) => boolean
  onToggleSelect?: (id: string, event?: { shiftKey: boolean }) => void
  onToggleAll?: () => void
  isAllSelected?: boolean
  selectionCount?: number
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
  isSelected,
  onToggleSelect,
  onToggleAll,
  isAllSelected,
  selectionCount = 0,
}: ClientTableViewProps) {
  const hasBulkSelection = selectionCount > 0
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
              {/* Checkbox header */}
              {onToggleSelect && (
                <th className="w-10 px-3 py-3">
                  <button
                    type="button"
                    onClick={onToggleAll}
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                      isAllSelected
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : hasBulkSelection
                          ? 'border-blue-300 bg-blue-100 dark:border-blue-500 dark:bg-blue-900/40'
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400'
                    }`}
                    aria-label="Seleccionar todos"
                    role="checkbox"
                    aria-checked={isAllSelected ? true : hasBulkSelection ? 'mixed' : false}
                  >
                    {isAllSelected ? (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : hasBulkSelection ? (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      </svg>
                    ) : null}
                  </button>
                </th>
              )}
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

              return (
                <EntityContextMenu key={client.id} entityType="client" entityId={client.id}>
                  <tr
                    className={`group transition-colors cursor-pointer ${
                      isSelected?.(client.id)
                        ? 'bg-blue-50 dark:bg-blue-950/30'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                    onClick={() => onSelectClient(client)}
                  >
                    {/* Checkbox cell */}
                    {onToggleSelect && (
                      <td className="w-10 px-3 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleSelect(client.id, { shiftKey: e.shiftKey })
                          }}
                          aria-label={`Seleccionar ${client.name}`}
                          role="checkbox"
                          aria-checked={isSelected?.(client.id) ?? false}
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                            isSelected?.(client.id)
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-400'
                          }`}
                        >
                          {isSelected?.(client.id) && (
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                    )}
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
                </EntityContextMenu>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
