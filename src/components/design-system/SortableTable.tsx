import { useState, useMemo, ReactNode } from 'react'
import { ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react'

/**
 * SortableTable Component
 *
 * Professional sortable table extracted from winning demos.
 *
 * Features:
 * - Type-safe generic columns
 * - Built-in sort logic with visual indicators
 * - Custom cell rendering
 * - Hover states with subtle animations
 * - Responsive design
 * - Dark mode support
 *
 * Sources:
 * - Analytics Demo Fusion: Professional table with sort buttons
 * - Clientes Demo Fusion: Master-detail table with complex sorting
 * - Servicios Demo D: Simplified hybrid with sidebar insights
 */

// ============================================================================
// Types
// ============================================================================

export interface Column<T> {
  /** Unique key from data object */
  key: keyof T
  /** Column header label */
  label: string
  /** Enable sorting for this column (default: true) */
  sortable?: boolean
  /** Text alignment (default: 'left') */
  align?: 'left' | 'right' | 'center'
  /** Custom render function for cell content */
  render?: (value: T[keyof T], row: T, index: number) => ReactNode
  /** Custom sort comparator */
  sortFn?: (a: T, b: T) => number
}

export interface SortableTableProps<T> {
  /** Array of data to display */
  data: T[]
  /** Column definitions */
  columns: Column<T>[]
  /** Enable row click handler */
  onRowClick?: (row: T, index: number) => void
  /** Custom empty state message */
  emptyMessage?: string
  /** Custom empty state icon */
  emptyIcon?: ReactNode
  /** Default sort field */
  defaultSortField?: keyof T
  /** Default sort direction */
  defaultSortDirection?: 'asc' | 'desc'
  /** Custom row className */
  rowClassName?: (row: T, index: number) => string
  /** Hover effect on rows (default: true) */
  hoverEffect?: boolean
}

type SortDirection = 'asc' | 'desc'

// ============================================================================
// Main Component
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No se encontraron resultados',
  emptyIcon,
  defaultSortField,
  defaultSortDirection = 'desc',
  rowClassName,
  hoverEffect = true,
}: SortableTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(defaultSortField || null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection)

  // Handle sort
  const handleSort = (column: Column<T>) => {
    if (!column.sortable && column.sortable !== undefined) return

    if (sortField === column.key) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to desc
      setSortField(column.key)
      setSortDirection('desc')
    }
  }

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return data

    const column = columns.find((col) => col.key === sortField)

    return [...data].sort((a, b) => {
      // Use custom sort function if provided
      if (column?.sortFn) {
        const result = column.sortFn(a, b)
        return sortDirection === 'asc' ? result : -result
      }

      // Default sort logic
      const aValue = a[sortField]
      const bValue = b[sortField]

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1

      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase())
        return sortDirection === 'asc' ? comparison : -comparison
      }

      // Numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Default: convert to string
      const comparison = String(aValue).localeCompare(String(bValue))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortField, sortDirection, columns])

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              {columns.map((column) => {
                const isSortable = column.sortable !== false
                const isActive = sortField === column.key
                const align = column.align || 'left'

                return (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-3 ${
                      align === 'right'
                        ? 'text-right'
                        : align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {isSortable ? (
                      <button
                        onClick={() => handleSort(column)}
                        className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                          align === 'right' ? 'ml-auto' : align === 'center' ? 'mx-auto' : ''
                        } ${
                          isActive
                            ? 'text-violet-600 dark:text-violet-400'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {column.label}
                        <SortIndicator active={isActive} direction={sortDirection} />
                      </button>
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                        {column.label}
                      </span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    {emptyIcon || (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <span className="text-2xl text-zinc-400">📋</span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-muted">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => {
                const customClassName = rowClassName ? rowClassName(row, rowIndex) : ''
                const isClickable = !!onRowClick

                return (
                  <tr
                    key={rowIndex}
                    onClick={isClickable ? () => onRowClick(row, rowIndex) : undefined}
                    className={`transition-colors ${
                      hoverEffect ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50' : ''
                    } ${isClickable ? 'cursor-pointer' : ''} ${customClassName}`}
                  >
                    {columns.map((column) => {
                      const value = row[column.key]
                      const align = column.align || 'left'

                      return (
                        <td
                          key={String(column.key)}
                          className={`px-4 py-3 ${
                            align === 'right'
                              ? 'text-right'
                              : align === 'center'
                                ? 'text-center'
                                : 'text-left'
                          }`}
                        >
                          {column.render ? column.render(value, row, rowIndex) : String(value)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// Sort Indicator Component
// ============================================================================

function SortIndicator({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />
  }

  return direction === 'asc' ? (
    <ArrowUp className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
  )
}

// ============================================================================
// Pre-configured Variants (Optional Convenience Exports)
// ============================================================================

/**
 * CompactTable - Smaller padding, good for dense data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CompactTable<T extends Record<string, any>>(props: SortableTableProps<T>) {
  return (
    <div className="[&_td]:py-2 [&_th]:py-2">
      <SortableTable {...props} />
    </div>
  )
}

/**
 * StripedTable - Alternating row colors for easier scanning
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StripedTable<T extends Record<string, any>>(props: SortableTableProps<T>) {
  return (
    <SortableTable
      {...props}
      rowClassName={(_, index) =>
        index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/50 dark:bg-zinc-800/30'
      }
    />
  )
}

/**
 * BorderedTable - Visible borders for all cells
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BorderedTable<T extends Record<string, any>>(props: SortableTableProps<T>) {
  return (
    <div className="[&_td]:border-r [&_td]:border-zinc-200 [&_td]:dark:border-zinc-800 [&_td]:last:border-r-0 [&_th]:border-r [&_th]:border-zinc-200 [&_th]:dark:border-zinc-800 [&_th]:last:border-r-0">
      <SortableTable {...props} />
    </div>
  )
}
