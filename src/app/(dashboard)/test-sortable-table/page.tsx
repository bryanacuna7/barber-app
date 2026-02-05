'use client'

import {
  SortableTable,
  CompactTable,
  StripedTable,
  BorderedTable,
  type Column,
} from '@/components/design-system/SortableTable'
import { User, TrendingUp, TrendingDown, Star, Crown, Award } from 'lucide-react'

/**
 * Test Page: SortableTable Component
 *
 * Demonstrates all features of the SortableTable component:
 * - Default sortable table
 * - Compact variant
 * - Striped variant
 * - Bordered variant
 * - Custom cell rendering
 * - Row click handlers
 * - Different data types (string, number, custom)
 */

// ============================================================================
// Mock Data
// ============================================================================

interface Client {
  id: string
  name: string
  email: string
  visits: number
  spent: number
  lastVisit: string
  rating: number
  status: 'active' | 'vip' | 'inactive'
}

interface Service {
  id: string
  name: string
  category: string
  price: number
  duration: number
  bookings: number
  revenue: number
  rating: number
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@email.com',
    visits: 24,
    spent: 180000,
    lastVisit: '2025-02-01',
    rating: 4.8,
    status: 'vip',
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria@email.com',
    visits: 12,
    spent: 85000,
    lastVisit: '2025-01-28',
    rating: 4.5,
    status: 'active',
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos@email.com',
    visits: 8,
    spent: 65000,
    lastVisit: '2024-12-15',
    rating: 4.2,
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana@email.com',
    visits: 18,
    spent: 125000,
    lastVisit: '2025-02-03',
    rating: 4.9,
    status: 'vip',
  },
  {
    id: '5',
    name: 'Pedro López',
    email: 'pedro@email.com',
    visits: 6,
    spent: 45000,
    lastVisit: '2025-01-20',
    rating: 4.0,
    status: 'active',
  },
  {
    id: '6',
    name: 'Laura Sánchez',
    email: 'laura@email.com',
    visits: 15,
    spent: 95000,
    lastVisit: '2025-02-02',
    rating: 4.7,
    status: 'active',
  },
]

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Corte Clásico',
    category: 'Corte',
    price: 7500,
    duration: 30,
    bookings: 145,
    revenue: 1087500,
    rating: 4.6,
  },
  {
    id: '2',
    name: 'Corte + Barba',
    category: 'Combo',
    price: 12000,
    duration: 45,
    bookings: 98,
    revenue: 1176000,
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Afeitado Navaja',
    category: 'Barba',
    price: 6000,
    duration: 20,
    bookings: 67,
    revenue: 402000,
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Tratamiento Facial',
    category: 'Facial',
    price: 15000,
    duration: 60,
    bookings: 34,
    revenue: 510000,
    rating: 4.7,
  },
  {
    id: '5',
    name: 'Corte Premium',
    category: 'Corte',
    price: 10000,
    duration: 40,
    bookings: 89,
    revenue: 890000,
    rating: 4.5,
  },
]

// ============================================================================
// Main Component
// ============================================================================

export default function TestSortableTablePage() {
  // Column definitions for clients table
  const clientColumns: Column<Client>[] = [
    {
      key: 'name',
      label: 'Cliente',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 text-sm font-semibold text-violet-600 dark:text-violet-400">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-zinc-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => {
        const statusConfig = {
          vip: {
            label: 'VIP',
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            icon: Crown,
          },
          active: {
            label: 'Activo',
            className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            icon: User,
          },
          inactive: {
            label: 'Inactivo',
            className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
            icon: User,
          },
        }
        const config = statusConfig[value as keyof typeof statusConfig]
        const Icon = config.icon
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        )
      },
    },
    {
      key: 'visits',
      label: 'Visitas',
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-zinc-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'spent',
      label: 'Gastado',
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-zinc-900 dark:text-white">
          ${(value as number).toLocaleString('es-CL')}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      align: 'right',
      render: (value) => (
        <div className="flex items-center justify-end gap-1">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          <span className="text-sm font-medium text-zinc-900 dark:text-white">{value}</span>
        </div>
      ),
    },
    {
      key: 'lastVisit',
      label: 'Última Visita',
      align: 'right',
      render: (value) => (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {new Date(value as string).toLocaleDateString('es-CL')}
        </span>
      ),
    },
  ]

  // Column definitions for services table
  const serviceColumns: Column<Service>[] = [
    {
      key: 'name',
      label: 'Servicio',
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (value) => {
        const colors: Record<string, string> = {
          Corte: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          Barba: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
          Combo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          Facial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        }
        return (
          <span
            className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${colors[value as string]}`}
          >
            {value}
          </span>
        )
      },
    },
    {
      key: 'price',
      label: 'Precio',
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-zinc-900 dark:text-white">
          ${(value as number).toLocaleString('es-CL')}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duración',
      align: 'right',
      render: (value) => (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{value} min</span>
      ),
    },
    {
      key: 'bookings',
      label: 'Reservas',
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-zinc-900 dark:text-white">{value}</span>
      ),
    },
    {
      key: 'revenue',
      label: 'Ingresos',
      align: 'right',
      render: (value, row) => {
        const growth = row.bookings > 80 // Simple growth indicator
        return (
          <div className="flex items-center justify-end gap-1">
            {growth ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className="font-semibold text-zinc-900 dark:text-white">
              ${(value as number).toLocaleString('es-CL')}
            </span>
          </div>
        )
      },
    },
    {
      key: 'rating',
      label: 'Rating',
      align: 'right',
      render: (value) => (
        <div className="flex items-center justify-end gap-1">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          <span className="text-sm font-medium text-zinc-900 dark:text-white">{value}</span>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-6 relative overflow-hidden">
      {/* Background mesh gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-15">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-violet-400 to-blue-400 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            SortableTable Component Test
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Professional sortable tables extracted from winning demos
          </p>
        </div>

        {/* Features List */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              Type-safe generic columns
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              Built-in sort logic with visual indicators
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              Custom cell rendering
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              Hover states with subtle animations
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              Dark mode support
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-600" />
              Pre-configured variants (Compact, Striped, Bordered)
            </li>
          </ul>
        </div>

        {/* Example 1: Default Table - Clients */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Default Table - Clients
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Sortable client table with custom cell rendering
            </p>
          </div>
          <SortableTable
            data={mockClients}
            columns={clientColumns}
            defaultSortField="spent"
            onRowClick={(client) => {
              alert(`Clicked: ${client.name}`)
            }}
          />
        </div>

        {/* Example 2: Compact Table - Services */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Compact Table - Services
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Smaller padding for dense data
            </p>
          </div>
          <CompactTable data={mockServices} columns={serviceColumns} defaultSortField="revenue" />
        </div>

        {/* Example 3: Striped Table */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Striped Table - Services
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Alternating row colors for easier scanning
            </p>
          </div>
          <StripedTable data={mockServices} columns={serviceColumns} defaultSortField="bookings" />
        </div>

        {/* Example 4: Bordered Table */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Bordered Table - Clients
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Visible borders for all cells
            </p>
          </div>
          <BorderedTable data={mockClients} columns={clientColumns} defaultSortField="rating" />
        </div>

        {/* Empty State Example */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Empty State</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Table with no data shows empty message
            </p>
          </div>
          <SortableTable
            data={[]}
            columns={clientColumns}
            emptyMessage="No se encontraron clientes"
          />
        </div>

        {/* Component Info */}
        <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-6">
          <div className="flex items-start gap-3">
            <Award className="h-6 w-6 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                ✅ Component Complete
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                SortableTable component extracted from 3 winning demos:
              </p>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>• Analytics Demo Fusion - Professional table with sort buttons</li>
                <li>• Clientes Demo Fusion - Master-detail with complex sorting</li>
                <li>• Servicios Demo D - Simplified hybrid with sidebar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
