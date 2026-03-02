'use client'

import { motion } from 'framer-motion'
import { Search, Star, Pencil, Trash2, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { animations } from '@/lib/design-system'
import {
  type MockService,
  type SortField,
  type SortDirection,
  ServiceIcon,
  getCategoryColor,
  CATEGORY_LABELS,
  calculateGrowth,
} from './service-types'

// ============================================================================
// Types
// ============================================================================

interface ServiceDesktopTableProps {
  services: MockService[]
  sourceServicesCount: number
  sortField: SortField
  sortDirection: SortDirection
  listTransitionControls: any // AnimationControls
  onSort: (field: SortField) => void
  onEdit: (service: MockService) => void
  onDelete: (service: MockService) => void
}

// ============================================================================
// Component
// ============================================================================

export function ServiceDesktopTable({
  services,
  sourceServicesCount,
  sortField,
  sortDirection,
  listTransitionControls,
  onSort,
  onEdit,
  onDelete,
}: ServiceDesktopTableProps) {
  // Sort icon helper
  function getSortIcon(field: SortField) {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-400" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-violet-600" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-violet-600" />
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-shadow">
        <div className="relative">
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-zinc-900 z-10 sm:hidden" />
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              {/* Header */}
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
                <tr>
                  {/* Service Name */}
                  <th className="px-4 py-3 text-left">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('name')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide h-auto p-0 text-muted hover:text-zinc-900 dark:hover:text-white"
                    >
                      Servicio
                      {getSortIcon('name')}
                    </Button>
                  </th>

                  {/* Category */}
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Categoría
                    </span>
                  </th>

                  {/* Bookings */}
                  <th className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('bookings')}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide h-auto p-0 text-muted hover:text-zinc-900 dark:hover:text-white"
                    >
                      Reservas
                      {getSortIcon('bookings')}
                    </Button>
                  </th>

                  {/* Duration */}
                  <th className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('duration')}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide h-auto p-0 text-muted hover:text-zinc-900 dark:hover:text-white"
                    >
                      Duración
                      {getSortIcon('duration')}
                    </Button>
                  </th>

                  {/* Price */}
                  <th className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => onSort('price')}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide h-auto p-0 text-muted hover:text-zinc-900 dark:hover:text-white"
                    >
                      Precio
                      {getSortIcon('price')}
                    </Button>
                  </th>

                  {/* Rating */}
                  <th className="px-4 py-3 text-right">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Rating
                    </span>
                  </th>

                  {/* Actions */}
                  <th className="w-24 px-4 py-3 text-right">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <motion.tbody
                initial={false}
                animate={listTransitionControls}
                className="divide-y divide-zinc-200 dark:divide-zinc-800"
              >
                {services.map((service) => {
                  const growth = calculateGrowth(
                    service.bookings_this_month,
                    service.bookings_last_month
                  )

                  return (
                    <tr
                      key={service.id}
                      className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                    >
                      {/* Service Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800/60 shrink-0">
                            <ServiceIcon
                              iconName={service.iconName}
                              className="h-4 w-4 text-zinc-700 dark:text-zinc-200"
                            />
                          </span>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {service.name}
                            </p>
                            <p className="text-xs text-muted line-clamp-1">
                              {service.barber_names.length} miembros del equipo
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryColor(service.category).bg} ${getCategoryColor(service.category).text}`}
                        >
                          {CATEGORY_LABELS[service.category]}
                        </span>
                      </td>

                      {/* Bookings */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {service.bookings_this_month}
                          </span>
                          {growth !== 0 && (
                            <span
                              className={`text-xs ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              ({growth > 0 ? '+' : ''}
                              {growth}%)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-muted">{service.duration_minutes} min</span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {formatCurrency(service.price)}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-sm font-medium text-zinc-900 dark:text-white">
                            {service.avg_rating}
                          </span>
                        </div>
                      </td>

                      {/* Actions — visible on row hover */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            className="flex h-8 w-8 !p-0 !min-h-0 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                            title="Editar"
                            onClick={() => onEdit(service)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="flex h-8 w-8 !p-0 !min-h-0 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            title="Eliminar"
                            onClick={() => onDelete(service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </motion.tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto h-10 w-10 text-zinc-400" />
            <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">
              No se encontraron servicios
            </p>
          </div>
        )}
      </div>

      {/* Results count */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...animations.spring.default, delay: 0.3 }}
        className="mt-3 text-xs text-muted text-center"
      >
        Mostrando {services.length} de {sourceServicesCount} servicios
      </motion.p>
    </>
  )
}
