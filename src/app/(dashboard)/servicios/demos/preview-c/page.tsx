'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronRight,
  Pencil,
  Trash2,
  Copy,
  MoreHorizontal,
  Command,
  Check,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  mockServices,
  getCategoryLabel,
  getCategoryColor,
  getStatusBadge,
  calculateGrowth,
  type MockService,
  type ServiceCategory,
} from '../mock-data'

type SortField = 'name' | 'category' | 'bookings' | 'revenue' | 'rating' | 'price' | 'duration'
type SortDirection = 'asc' | 'desc'

export default function PreviewCCommandCenter() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('bookings')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filter services
  let filteredServices =
    selectedCategory === 'all'
      ? mockServices
      : mockServices.filter((s) => s.category === selectedCategory)

  if (searchQuery) {
    filteredServices = filteredServices.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Sort services
  const sortedServices = useMemo(() => {
    return [...filteredServices].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'bookings':
          comparison = a.bookings_this_month - b.bookings_this_month
          break
        case 'revenue':
          comparison = a.revenue_this_month - b.revenue_this_month
          break
        case 'rating':
          comparison = a.avg_rating - b.avg_rating
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'duration':
          comparison = a.duration_minutes - b.duration_minutes
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredServices, sortField, sortDirection])

  const categories: (ServiceCategory | 'all')[] = ['all', 'corte', 'barba', 'combo', 'facial']

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-zinc-400" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    )
  }

  // Toggle row selection
  const toggleRow = (id: string) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedRows(newSelection)
  }

  // Toggle all rows
  const toggleAll = () => {
    if (selectedRows.size === sortedServices.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(sortedServices.map((s) => s.id)))
    }
  }

  const allSelected = selectedRows.size === sortedServices.length && sortedServices.length > 0

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-zinc-900 dark:text-white">
                Demo C: Operational Command Center
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Linear-style: Table View + Sortable Columns + Bulk Actions
              </p>
            </div>
            <Button variant="outline" className="h-9 text-sm">
              <ChevronRight className="mr-2 h-4 w-4" />
              Ver Todas las Demos
            </Button>
          </div>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Left: Search + Category Filter */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-[220px] rounded-lg border border-zinc-200 bg-white pl-8 pr-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              <option value="all">Todas las categorías</option>
              {categories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat as ServiceCategory)}
                </option>
              ))}
            </select>

            {/* Keyboard Hint */}
            <div className="hidden items-center gap-1.5 rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-600 lg:flex dark:bg-zinc-800 dark:text-zinc-400">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </div>

          {/* Right: Bulk Actions */}
          {selectedRows.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {selectedRows.size} seleccionados
              </span>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Pencil className="mr-1 h-3 w-3" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Eliminar
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Results Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-3 text-xs text-zinc-500"
        >
          {sortedServices.length} servicios
        </motion.p>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  {/* Checkbox */}
                  <th className="w-12 px-4 py-3">
                    <button
                      onClick={toggleAll}
                      className="flex h-4 w-4 items-center justify-center rounded border border-zinc-300 transition-colors hover:border-blue-500 dark:border-zinc-700 dark:hover:border-blue-500"
                    >
                      {allSelected && <Check className="h-3 w-3 text-blue-600" />}
                    </button>
                  </th>

                  {/* Service Name */}
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      Servicio
                      {getSortIcon('name')}
                    </button>
                  </th>

                  {/* Category */}
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      Categoría
                      {getSortIcon('category')}
                    </button>
                  </th>

                  {/* Bookings */}
                  <th className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleSort('bookings')}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      Reservas
                      {getSortIcon('bookings')}
                    </button>
                  </th>

                  {/* Revenue */}
                  <th className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleSort('revenue')}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      Revenue
                      {getSortIcon('revenue')}
                    </button>
                  </th>

                  {/* Rating */}
                  <th className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleSort('rating')}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      Rating
                      {getSortIcon('rating')}
                    </button>
                  </th>

                  {/* Duration */}
                  <th className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleSort('duration')}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      Duración
                      {getSortIcon('duration')}
                    </button>
                  </th>

                  {/* Price */}
                  <th className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleSort('price')}
                      className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                      Precio
                      {getSortIcon('price')}
                    </button>
                  </th>

                  {/* Staff */}
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                      Barberos
                    </span>
                  </th>

                  {/* Status */}
                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                      Estado
                    </span>
                  </th>

                  {/* Actions */}
                  <th className="w-16 px-4 py-3"></th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {sortedServices.map((service) => {
                  const isSelected = selectedRows.has(service.id)
                  const categoryColor = getCategoryColor(service.category)
                  const statusBadge = getStatusBadge(service.status)
                  const growth = calculateGrowth(
                    service.bookings_this_month,
                    service.bookings_last_month
                  )

                  return (
                    <tr
                      key={service.id}
                      className={`group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRow(service.id)}
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-zinc-300 hover:border-blue-500 dark:border-zinc-700 dark:hover:border-blue-500'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </button>
                      </td>

                      {/* Service Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{service.icon}</span>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">
                              {service.name}
                            </p>
                            <p className="text-xs text-zinc-500 line-clamp-1">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${categoryColor.bg} ${categoryColor.text}`}
                        >
                          {getCategoryLabel(service.category)}
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
                              className={`flex items-center text-xs ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {growth > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(service.revenue_this_month)}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {service.avg_rating}
                          </span>
                          <span className="text-xs text-zinc-500">({service.total_reviews})</span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {service.duration_minutes} min
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {formatCurrency(service.price)}
                        </span>
                      </td>

                      {/* Staff */}
                      <td className="px-4 py-3">
                        <div className="flex -space-x-1">
                          {service.barber_names.slice(0, 2).map((name, idx) => (
                            <div
                              key={idx}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gradient-to-br from-zinc-100 to-zinc-200 text-xs dark:border-zinc-900 dark:from-zinc-700 dark:to-zinc-800"
                              title={name}
                            >
                              {name[0]}
                            </div>
                          ))}
                          {service.barber_names.length > 2 && (
                            <div
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:border-zinc-900 dark:bg-zinc-700 dark:text-zinc-400"
                              title={service.barber_names.slice(2).join(', ')}
                            >
                              +{service.barber_names.length - 2}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-all hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {sortedServices.length === 0 && (
            <div className="py-12 text-center">
              <Search className="mx-auto h-10 w-10 text-zinc-400" />
              <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">
                No se encontraron servicios
              </p>
              <p className="mt-1 text-xs text-zinc-500">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </motion.div>

        {/* Keyboard Shortcuts Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-500"
        >
          <div className="flex items-center gap-1.5">
            <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-zinc-800">⌘K</kbd>
            <span>Búsqueda rápida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-zinc-800">⇧A</kbd>
            <span>Seleccionar todo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-zinc-800">E</kbd>
            <span>Editar</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
