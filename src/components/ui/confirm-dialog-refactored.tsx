'use client'

import { Modal } from './modal-refactored'
import { Button } from './button-refactored'
import { AlertTriangle, Trash2, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { type ReactNode } from 'react'

// ============================================================================
// COMPOSITION PATTERNS APPLIED:
// 1. Explicit Variants - ConfirmDialog.Danger, .Warning, .Info instead of variant prop
// 2. No Boolean Props - Removed isLoading (compose loading state manually)
// 3. Integration with refactored Modal
// ============================================================================

// ============================================================================
// WEB INTERFACE GUIDELINES APPLIED:
// 1. Semantic button usage
// 2. Proper ARIA (inherited from Modal)
// 3. aria-hidden on decorative icons
// ============================================================================

interface BaseConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string | ReactNode
  confirmText?: string
  cancelText?: string
  children?: ReactNode
}

interface VariantConfig {
  icon: typeof Trash2
  iconBg: string
  iconColor: string
  confirmVariant: 'primary' | 'danger' | 'success'
}

const variantConfigs: Record<string, VariantConfig> = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    confirmVariant: 'danger',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    confirmVariant: 'primary',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    confirmVariant: 'primary',
  },
  error: {
    icon: AlertCircle,
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    confirmVariant: 'danger',
  },
}

// Base ConfirmDialog Component (internal)
interface InternalConfirmDialogProps extends BaseConfirmDialogProps {
  variantKey: keyof typeof variantConfigs
}

function BaseConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variantKey,
  children,
}: InternalConfirmDialogProps) {
  const config = variantConfigs[variantKey]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
    // Note: caller is responsible for closing if needed
    // This allows async operations to control when to close
  }

  return (
    <Modal.Root isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay>
        <Modal.Content size="sm">
          <Modal.Body>
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
                  config.iconBg
                )}
              >
                <Icon className={cn('w-8 h-8', config.iconColor)} aria-hidden="true" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {title}
              </h3>

              {/* Description */}
              {description && (
                typeof description === 'string' ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    {description}
                  </p>
                ) : (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    {description}
                  </div>
                )
              )}

              {/* Custom children (if provided) */}
              {children && <div className="mb-6 w-full">{children}</div>}

              {/* Actions */}
              <div className="flex items-center gap-3 w-full">
                <Button.Outline className="flex-1" onClick={onClose}>
                  {cancelText}
                </Button.Outline>

                {/* Use explicit Button variant based on config */}
                {config.confirmVariant === 'danger' ? (
                  <Button.Danger className="flex-1" onClick={handleConfirm}>
                    {confirmText}
                  </Button.Danger>
                ) : config.confirmVariant === 'success' ? (
                  <Button.Success className="flex-1" onClick={handleConfirm}>
                    {confirmText}
                  </Button.Success>
                ) : (
                  <Button.Primary className="flex-1" onClick={handleConfirm}>
                    {confirmText}
                  </Button.Primary>
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Overlay>
    </Modal.Root>
  )
}

// Explicit Variant Components
const ConfirmDialog = Object.assign(
  // Default (danger variant)
  function ConfirmDialog(props: BaseConfirmDialogProps) {
    return <BaseConfirmDialog {...props} variantKey="danger" />
  },
  {
    // Explicit variants
    Danger: function ConfirmDialogDanger(props: BaseConfirmDialogProps) {
      return <BaseConfirmDialog {...props} variantKey="danger" />
    },

    Warning: function ConfirmDialogWarning(props: BaseConfirmDialogProps) {
      return <BaseConfirmDialog {...props} variantKey="warning" />
    },

    Info: function ConfirmDialogInfo(props: BaseConfirmDialogProps) {
      return <BaseConfirmDialog {...props} variantKey="info" />
    },

    Error: function ConfirmDialogError(props: BaseConfirmDialogProps) {
      return <BaseConfirmDialog {...props} variantKey="error" />
    },
  }
)

export { ConfirmDialog }

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Before (old API):
<ConfirmDialog
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Delete Item?"
  description="This action cannot be undone"
  variant="danger"
  isLoading={isDeleting}
  confirmText="Delete"
  cancelText="Cancel"
/>

// After (new API) - Option 1: Explicit variant with manual loading
<ConfirmDialog.Danger
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={async () => {
    setIsDeleting(true)
    await deleteItem()
    setIsDeleting(false)
    onClose()
  }}
  title="Delete Item?"
  description="This action cannot be undone"
  confirmText={isDeleting ? 'Deleting…' : 'Delete'}
  cancelText="Cancel"
/>

// After (new API) - Option 2: Custom children for loading state
<ConfirmDialog.Danger
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Delete Item?"
  description="This action cannot be undone"
>
  {isDeleting && (
    <div className="flex items-center gap-2 text-sm text-zinc-500">
      <Button.Spinner />
      <span>Deleting item…</span>
    </div>
  )}
</ConfirmDialog.Danger>

// Benefits:
// ✅ No variant string prop (explicit components)
// ✅ No isLoading boolean (compose manually)
// ✅ Full control over loading UI
// ✅ Uses refactored Modal (full ARIA)
// ✅ Uses refactored Button (explicit variants)
// ✅ Supports custom children for advanced layouts

// All variants:
<ConfirmDialog.Danger />   // Red, for destructive actions
<ConfirmDialog.Warning />  // Amber, for risky actions
<ConfirmDialog.Info />     // Blue, for informational confirms
<ConfirmDialog.Error />    // Red, for error acknowledgements

*/
