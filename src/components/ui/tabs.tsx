'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

// Context
interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

// Tabs Root
interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ defaultValue = '', value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue)

  const activeTab = value ?? internalValue
  const setActiveTab = (newValue: string) => {
    if (!value) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

// Tabs List
interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 p-1',
        'bg-zinc-100 dark:bg-zinc-800/50 rounded-xl',
        className
      )}
    >
      {children}
    </div>
  )
}

// Tab Trigger
interface TabsTriggerProps {
  value: string
  children: ReactNode
  disabled?: boolean
  className?: string
  icon?: ReactNode
}

export function TabsTrigger({
  value,
  children,
  disabled = false,
  className,
  icon,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative px-4 py-2 text-sm font-medium rounded-lg',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center gap-2',
        isActive
          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800',
        className
      )}
    >
      {icon}
      {children}
    </button>
  )
}

// Tab Content
interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
  forceMount?: boolean
}

export function TabsContent({ value, children, className, forceMount = false }: TabsContentProps) {
  const { activeTab } = useTabsContext()
  const isActive = activeTab === value

  if (!isActive && !forceMount) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={!isActive}
      className={cn(
        'mt-4',
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        !isActive && forceMount && 'hidden',
        className
      )}
    >
      {children}
    </div>
  )
}
