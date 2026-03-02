# Dashboard UX Evolution v3 — Implementation Plan

## Context

After completing v2 (Command Layer, Page Header, Empty States), we adopt 8 patterns from Vercel/Supabase/Linear adapted for barbershop operations. The user's review identified that Fase 2 needed splitting to avoid overload, a shared action registry is required to prevent logic duplication, and each phase needs explicit exit criteria.

**Constraints:** Frontend-only (no DB migrations), localStorage persistence, must work with existing React Query hooks.

---

## Phase Structure

```
Fase 1   "Velocity"             → tab title, shortcuts, saved filters
Fase 2A  "Registry"             → shared action registry with centralized permissions
Fase 2C  "Undo Foundation"      → undo toast extension (needed by 2B and 3A)
Fase 2B  "Bulk"                 → selection + bulk toolbar (uses undo toast)
Fase 2.5 "Interaction Channels" → context menu (reuses registry)
Fase 3   "Responsiveness"       → optimistic updates + split panel
```

Dependency chain: `1 (parallel) → 2A → 2C → 2B → 2.5 → 3A → 3B`

---

## Cross-Cutting Decisions (resolves review blockers)

### 1. Action ID Namespacing

All action IDs use `{entityType}.{verb}` format to prevent collisions:

- `appointment.confirm`, `appointment.cancel`, `appointment.whatsapp`
- `client.create`, `client.delete`, `client.whatsapp`
- `nav.dashboard`, `nav.citas`, `settings.general`

**Migration from v2 favorites/recents:** On first load, if stored IDs don't match any registered action, purge them silently. This handles the transition from old flat IDs (`whatsapp-client`) to namespaced IDs (`client.whatsapp`).

### 2. Server Component Safety (Fase 1A)

Dashboard pages in App Router may be Server Components. Instead of adding hooks directly to `page.tsx`, create a thin `<ClientEffects>` wrapper component (`'use client'`) that handles `useDocumentTitle` + `useFaviconBadge`. Pages import and render `<ClientEffects title="Citas" />` — no need to convert the page itself to client.

### 3. Centralized Permission Filtering in Registry

The registry exposes a single entry point for filtered actions:

```ts
getVisibleActions(context: {
  scope: 'global' | 'entity'
  entityType?: string
  isOwner: boolean
  isBarber: boolean
  staffPermissions?: StaffPermissions
}): ActionDefinition[]
```

Command palette, context menu, bulk toolbar, and shortcuts ALL call this method. No consumer filters independently.

### 4. Undo/Optimistic Execution Policy

Each action declares exactly ONE execution model (not both):

| Model                  | When to use                               | Example                                      |
| ---------------------- | ----------------------------------------- | -------------------------------------------- |
| `delayed-commit`       | Low-urgency, fully reversible client-side | Cancel appointment, delete client            |
| `immediate-compensate` | Needs server-side effects immediately     | Complete appointment (triggers stats update) |

Field on `ActionDefinition`: `executionModel: 'delayed-commit' | 'immediate-compensate' | 'immediate'`

**`delayed-commit` (Fase 2C)** — 3 phases: preview → commit → cancel

1. `onPreview(args)`: Snapshot current React Query cache for affected keys, then apply UI change (remove from list, change badge) via `queryClient.setQueryData`
2. Show undo toast (5s)
3. If timer expires → `onCommit(args)`: Execute server mutation + invalidate queries
4. If user clicks Deshacer → `onCancel(args)`: Restore cache from snapshot via `queryClient.setQueryData(key, snapshot)` — preserves original order, filters, pagination state. No manual reinsertion needed.

**`immediate-compensate` (Fase 3A)** — Standard optimistic: execute immediately, rollback on error via React Query `onMutate`/`onError`/`onSettled`.

**`immediate`** — Default: execute, show result toast, no undo.

### 5. Idempotent Registration

`actionRegistry.register()` uses `Map<string, ActionDefinition>`. Re-registering same ID overwrites silently (safe for HMR/rerender). Registration happens in a module-level `registerAllActions()` call, not in a useEffect.

### 6. Safe localStorage Parsing

All `useSavedFilters` and `usePreference` reads wrap `JSON.parse` in try/catch. On parse failure: delete the corrupted key, return `defaultValue`, log warning to console. Schema version in key suffix (`_v1`) enables future migrations without breaking existing users.

### 7. Context Menu Mobile Guard

`EntityContextMenu` checks `window.matchMedia('(pointer: coarse)')`. On touch devices, renders children without the Radix ContextMenu wrapper — no long-press trigger.

### 8. Fuse.js Reuse

Fuse.js is already installed and used in `command-palette.tsx`. The action registry's `search()` method creates a Fuse instance over registered actions — no new dependency needed.

---

## Fase 1A: Dynamic Tab Title + Favicon Badge

### Why

Owner with 15 browser tabs can't see appointment count without switching. Vercel shows deploy status in tab icon.

### New files

- `src/hooks/useDocumentTitle.ts` — Client-side `document.title` setter
- `src/hooks/useFaviconBadge.ts` — Canvas-based favicon with numeric badge
- `src/components/dashboard/client-effects.tsx` — `'use client'` wrapper for page-level effects

### useDocumentTitle

```ts
function useDocumentTitle(title: string): void
// Sets document.title to `${title} | BarberApp`
// Restores original on unmount
```

### useFaviconBadge

```ts
function useFaviconBadge(count: number): void
// count=0: restore original /favicon.ico
// count>0: draw badge circle with number on canvas, set as <link rel="icon">
// count>9: show "9+"
// Debounce updates by 500ms to avoid flicker
```

### ClientEffects wrapper (resolves Server Component safety)

```tsx
// src/components/dashboard/client-effects.tsx
'use client'
export function ClientEffects({ title, badgeCount }: { title: string; badgeCount?: number }) {
  useDocumentTitle(title)
  useFaviconBadge(badgeCount ?? 0)
  return null
}
```

Pages render `<ClientEffects title="Citas" />` without needing `'use client'` themselves.

### Files to modify

- `src/app/(dashboard)/dashboard/page.tsx` — add `<ClientEffects title="Dashboard" badgeCount={pendingCount} />`
- `src/app/(dashboard)/citas/page.tsx` — add `<ClientEffects title="Citas" />`
- `src/app/(dashboard)/clientes/page.tsx` — add `<ClientEffects title="Clientes" />`
- `src/app/(dashboard)/servicios/page.tsx` — add `<ClientEffects title="Servicios" />`
- `src/app/(dashboard)/analiticas/page.tsx` — add `<ClientEffects title="Analíticas" />`

---

## Fase 1B: Global Keyboard Shortcuts

### Why

Only `Cmd+K` exists globally. Linear has `C` for create, `1-5` for nav. Barbershop owner on desktop should navigate/act without mouse.

### New files

- `src/lib/keyboard/shortcut-registry.ts` — Singleton registry (not React, plain TS)
- `src/lib/keyboard/shortcut-provider.tsx` — React provider with global keydown listener
- `src/lib/keyboard/types.ts` — Shared types

### ShortcutDefinition type

```ts
interface ShortcutDefinition {
  id: string
  keys: string // Display format: '⌘K', 'N', '1'
  key: string // KeyboardEvent.key match: 'k', 'n', '1'
  modifiers?: { meta?: boolean; ctrl?: boolean; shift?: boolean; alt?: boolean }
  description: string // Spanish: 'Abrir Command Palette'
  category: 'navigation' | 'action' | 'palette'
  action: () => void
  enabled?: () => boolean // Runtime check (e.g., role-based)
}
```

### Registry API

```ts
const shortcutRegistry = {
  register(def: ShortcutDefinition): () => void  // returns unregister fn
  getAll(): ShortcutDefinition[]
  getByCategory(cat: string): ShortcutDefinition[]
}
```

### Provider behavior

- Single `document.addEventListener('keydown', handler)` in provider
- Guard: skip if `event.target` is input/textarea/contenteditable or if any modal/sheet is open
- Match against registry entries
- `event.preventDefault()` on match

### Default shortcuts (registered in provider, linked to action registry IDs)

| Key        | Linked Action ID          | Category   |
| ---------- | ------------------------- | ---------- |
| `⌘/Ctrl+K` | (built-in palette toggle) | palette    |
| `N`        | `appointment.create`      | action     |
| `1`        | `nav.dashboard`           | navigation |
| `2`        | `nav.citas`               | navigation |
| `3`        | `nav.clientes`            | navigation |
| `4`        | `nav.servicios`           | navigation |
| `5`        | `nav.equipo`              | navigation |
| `?`        | (built-in shortcuts help) | palette    |

Shortcuts that point to an `action.id` delegate execution to `actionRegistry.getById(id).execute(ctx)`. This prevents drift between shortcut behavior and registry action behavior.

### Files to modify

- `src/app/(dashboard)/layout.tsx` — wrap children with `<ShortcutProvider>`
- `src/components/dashboard/command-palette.tsx` — move Cmd+K registration to use shortcut registry instead of its own useEffect
- `src/components/dashboard/command-shortcuts-help.tsx` — consume `shortcutRegistry.getAll()` instead of hardcoded `SHORTCUTS` array

---

## Fase 1C: Saved Filters

### Why

Every day the barber enters and filters the same thing. Should be one tap.

### New files

- `src/hooks/useSavedFilters.ts` — Filter state + presets persistence
- `src/components/ui/saved-filter-bar.tsx` — Chip bar UI

### useSavedFilters hook

```ts
interface SavedFilter<T> {
  id: string
  label: string
  filter: T
  isDefault?: boolean
}

function useSavedFilters<T>(config: {
  pageKey: string // e.g. 'clientes', 'citas'
  defaultFilter: T
  builtInPresets: SavedFilter<T>[] // System presets (not deletable)
}): {
  activeFilter: T
  setActiveFilter: (filter: T) => void
  presets: SavedFilter<T>[]
  savePreset: (label: string, filter: T) => void
  deletePreset: (id: string) => void
  activePresetId: string | null
  applyPreset: (id: string) => void
}
```

### localStorage keys (versioned, safe parsing per Cross-Cutting Decision #6)

- `bsp_pref_filters_{pageKey}_active_v1` — current active filter state
- `bsp_pref_filters_{pageKey}_presets_v1` — user-created presets array

All reads wrap `JSON.parse` in try/catch. On failure: delete corrupted key, return `defaultFilter`/`builtInPresets`, log `console.warn`.

### Built-in presets for Clientes

- "Todos" (default, no filters)
- "VIP" (segment: 'vip')
- "En riesgo" (segment: 'inactive')

### Built-in presets for Citas

- "Pendientes hoy" (status: 'pending', date: today)
- "Sin confirmar" (status: 'pending')

### SavedFilterBar UI

Horizontal scrollable chip bar. Active chip is highlighted. Last chip is "+" to save current filter as preset. Long-press/right-click on user preset to delete.

### Files to modify

- `src/app/(dashboard)/clientes/page.tsx` — replace `useState` for search/segment/sort with `useSavedFilters`
- `src/app/(dashboard)/citas/page.tsx` — add filter bar above calendar views

---

## Fase 1 Exit Criteria

- [ ] Tab title updates on navigation (verify 5 pages)
- [ ] Favicon shows badge count on dashboard page
- [ ] `N` key opens create appointment modal (desktop, no input focused)
- [ ] `1-5` keys navigate to correct pages
- [ ] `?` opens shortcuts help with dynamically registered shortcuts
- [ ] Shortcuts help modal shows ALL registered shortcuts (not hardcoded)
- [ ] Saved filter presets persist after refresh
- [ ] Barber role: shortcuts respect permissions (barber can't navigate to owner-only pages)
- [ ] Mobile: no regressions (shortcuts only fire on desktop)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] Dark/light mode visual check on filter bar

---

## Fase 2A: Shared Action Registry

### Why

Actions are duplicated in 3 places (command-palette COMMANDS array, sidebar nav, bottom-nav quickActions). Context menu and bulk toolbar need the same actions. A shared registry prevents duplication.

### New files

- `src/lib/actions/types.ts` — Action interfaces
- `src/lib/actions/registry.ts` — Singleton registry (Map-based, idempotent)
- `src/lib/actions/definitions/navigation.ts` — 10 nav + 6 settings actions
- `src/lib/actions/definitions/appointment-actions.ts` — Appointment entity actions
- `src/lib/actions/definitions/client-actions.ts` — Client entity actions
- `src/lib/actions/definitions/service-actions.ts` — Service entity actions
- `src/lib/actions/index.ts` — Barrel + `registerAllActions()` call

### ActionDefinition interface

```ts
interface ActionDefinition {
  id: string // Namespaced: 'appointment.confirm', 'client.whatsapp', 'nav.dashboard'
  label: string // 'Confirmar cita'
  icon: React.ElementType // Lucide icon
  category: 'navigate' | 'create' | 'entity' | 'settings'
  keywords: string[] // For fuzzy search in palette (reuses Fuse.js already installed)

  // Context
  entityType?: 'appointment' | 'client' | 'service' | 'barber'
  scope: 'global' | 'entity' // global = always available, entity = needs target

  // Execution model (see Cross-Cutting Decision #4)
  executionModel: 'delayed-commit' | 'immediate-compensate' | 'immediate'
  execute: (ctx: ActionContext) => void | Promise<void>

  // Permissions (centralized — see Cross-Cutting Decision #3)
  path?: string // For canBarberAccessPath filtering
  requiredPermission?: keyof StaffPermissions

  // UI hints
  destructive?: boolean // Red styling in menus
  bulkable?: boolean // Can be applied to multiple entities
  pinEligible?: boolean // Can be pinned in command palette (default true)
}

interface ActionContext {
  navigate: (path: string) => void // Decoupled from useRouter — easier to test, less fragile
  entityId?: string
  entityIds?: string[] // For bulk actions
  businessId: string
  toast: ToastContextValue
  queryClient: QueryClient
}
```

### Registry API (singleton, Map-based, idempotent)

```ts
const actionRegistry = {
  register(def: ActionDefinition): void          // Map.set(id, def) — safe for HMR/rerender
  getById(id: string): ActionDefinition | undefined
  search(query: string): ActionDefinition[]      // Fuse.js over registered actions

  // CENTRALIZED permission-filtered queries — ALL consumers use these
  getVisibleActions(ctx: VisibilityContext): ActionDefinition[]
  getVisibleForEntity(ctx: VisibilityContext & { entityType: string }): ActionDefinition[]
  getVisibleBulkable(ctx: VisibilityContext & { entityType: string }): ActionDefinition[]
}

interface VisibilityContext {
  scope: 'global' | 'entity'
  isOwner: boolean
  isBarber: boolean
  staffPermissions?: StaffPermissions
}
```

### Action ID table (namespaced, no collisions)

| ID                       | Scope  | Entity      | Execution Model      |
| ------------------------ | ------ | ----------- | -------------------- |
| `nav.dashboard`          | global | —           | immediate            |
| `nav.citas`              | global | —           | immediate            |
| `nav.clientes`           | global | —           | immediate            |
| `nav.servicios`          | global | —           | immediate            |
| `nav.equipo`             | global | —           | immediate            |
| `nav.analiticas`         | global | —           | immediate            |
| `nav.referencias`        | global | —           | immediate            |
| `nav.changelog`          | global | —           | immediate            |
| `nav.configuracion`      | global | —           | immediate            |
| `nav.guia`               | global | —           | immediate            |
| `settings.general`       | global | —           | immediate            |
| `settings.horario`       | global | —           | immediate            |
| `settings.branding`      | global | —           | immediate            |
| `settings.equipo`        | global | —           | immediate            |
| `settings.pagos`         | global | —           | immediate            |
| `settings.avanzado`      | global | —           | immediate            |
| `appointment.create`     | global | appointment | immediate            |
| `appointment.confirm`    | entity | appointment | delayed-commit       |
| `appointment.complete`   | entity | appointment | immediate-compensate |
| `appointment.cancel`     | entity | appointment | delayed-commit       |
| `appointment.reschedule` | entity | appointment | immediate            |
| `appointment.whatsapp`   | entity | appointment | immediate            |
| `client.create`          | global | client      | immediate            |
| `client.edit`            | entity | client      | immediate            |
| `client.delete`          | entity | client      | delayed-commit       |
| `client.whatsapp`        | entity | client      | immediate            |
| `client.view`            | entity | client      | immediate            |
| `service.create`         | global | service     | immediate            |
| `service.toggle-active`  | entity | service     | immediate-compensate |

### v2 favorites/recents migration

On first render, map old flat IDs to namespaced IDs using a legacy map:

```ts
const LEGACY_ID_MAP: Record<string, string> = {
  'whatsapp-client': 'client.whatsapp',
  'create-appointment': 'appointment.create',
  'create-client': 'client.create',
  'create-service': 'service.create',
  'nav-dashboard': 'nav.dashboard',
  'nav-citas': 'nav.citas',
  // ... all old IDs
}
```

Apply map to stored `pinned_ids` and `recent_ids`. IDs that aren't in the map AND don't match any registered action get purged. This preserves user favorites instead of losing them.

Migration runs once, gated by `bsp_pref_cmd_ids_migrated_v3` flag in localStorage. After migration, set flag to `true`. Subsequent loads skip entirely.

### Registration strategy (idempotent, module-level)

```ts
// src/lib/actions/index.ts
import { registerNavigationActions } from './definitions/navigation'
import { registerAppointmentActions } from './definitions/appointment-actions'
// ...

let registered = false
export function registerAllActions() {
  if (registered) return // Idempotent guard
  registered = true
  registerNavigationActions()
  registerAppointmentActions()
  registerClientActions()
  registerServiceActions()
}
```

Called once in `ShortcutProvider` mount (Fase 1B already adds this provider to layout).

### Integration: Refactor command-palette.tsx

Replace the hardcoded 51-item `COMMANDS` array with:

```ts
const visibleActions = actionRegistry.getVisibleActions({
  scope: 'global',
  isOwner,
  isBarber,
  staffPermissions,
})
```

Favorites/recents still work because they reference stable namespaced IDs.

### Files to modify

- `src/components/dashboard/command-palette.tsx` — consume registry instead of COMMANDS array

---

## Fase 2C: Undo Toast (BEFORE 2B — bulk toolbar depends on undo)

### Why

"Are you sure?" dialogs add friction. Gmail/Linear execute immediately + show undo for 5 seconds.

### Modify: `src/components/ui/toast.tsx`

Extend `Toast` interface (backward compatible):

```ts
interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: {
    // NEW
    label: string
    onClick: () => void
  }
}
```

Add to `ToastContextValue`:

```ts
undoable: (message: string, onUndo: () => void, duration?: number) => void
```

`undoable()` implementation:

- Creates toast with type='info', duration=5000
- `action: { label: 'Deshacer', onClick: onUndo }`
- Pause timer on hover (clear timeout, track elapsed, resume on leave)

### ToastItem changes

- Render `action` button next to message (before X button)
- Add `onMouseEnter`/`onMouseLeave` to pause/resume auto-dismiss timer
- Replace raw `setTimeout` with a ref-based timer that supports pause/resume

### New file

- `src/hooks/useUndoableAction.ts` — Delayed-commit pattern with preview/commit/cancel

```ts
function useUndoableAction<T>(config: {
  onPreview: (args: T) => void // Apply UI change immediately (no server call)
  onCommit: (args: T) => Promise<void> // Execute server mutation after delay
  onCancel: (args: T) => void // Restore UI to pre-preview state
  successMessage: string
  delay?: number // Default 5000ms
}): {
  trigger: (args: T) => void
}
```

Flow: `trigger(args)` → `onPreview(args)` (instant UI change) → show undo toast (5s) → if timer expires → `onCommit(args)` (server call) → if user clicks Deshacer → `onCancel(args)` (restore UI, no server call needed).

### Files to modify

- `src/components/ui/toast.tsx` — extend interface + add undoable method + pause-on-hover

---

## Fase 2B: Bulk Actions Toolbar (after 2C — uses undo toast for bulk destructive actions)

### Why

Confirming 15 appointments one by one is tedious. Select all → Confirm is 2 seconds.

### New files

- `src/hooks/useSelection.ts` — Multi-select state with range support
- `src/components/ui/bulk-actions-toolbar.tsx` — Floating toolbar

### useSelection hook (with shift-click range)

```ts
function useSelection<T extends { id: string }>(
  items: T[]
): {
  selected: Set<string>
  toggle: (id: string, event?: { shiftKey: boolean }) => void // shift+click = range
  toggleAll: () => void
  clear: () => void
  isSelected: (id: string) => boolean
  isAllSelected: boolean
  count: number
}
```

Internal state includes `anchorIndex: number | null`. On `toggle(id, { shiftKey: true })`:

1. Find index of `id` in `items`
2. Select all items between `anchorIndex` and current index
3. Update `anchorIndex`

On `toggle(id)` without shift: standard toggle + set `anchorIndex = indexOf(id)`.

### BulkActionsToolbar

```ts
interface BulkActionsToolbarProps {
  count: number
  entityType: 'appointment' | 'client' | 'service'
  onAction: (actionId: string, ids: string[]) => void
  onClear: () => void
}
```

- Renders as fixed bottom bar (above mobile bottom nav safe area)
- Shows: `"N seleccionados"` + action buttons from `actionRegistry.getVisibleBulkable(entityType, ctx)`
- Destructive bulk actions use undo toast from Fase 2C
- Animate in/out with `animations.spring.snappy`
- Escape key clears selection

### Files to modify

- `src/app/(dashboard)/clientes/page.tsx` — add `useSelection`, pass to card/table views
- `src/components/clients/client-cards-view.tsx` — add checkbox on each card
- `src/components/clients/client-table-view.tsx` — add checkbox column, pass `event` to `toggle` for shift-click
- `src/app/(dashboard)/citas/page.tsx` — add `useSelection` for day view appointment list

---

## Fase 2 Exit Criteria

- [ ] Command palette renders from action registry (no hardcoded COMMANDS)
- [ ] Favorites/recents from v2 still work with registry-based commands
- [ ] Multi-select works in client cards view (checkbox appears, count updates)
- [ ] Shift-click selects range in client table view
- [ ] Bulk toolbar appears when 1+ items selected, disappears on clear
- [ ] Bulk "Confirmar" on 3 appointments calls API for each and shows success
- [ ] Undo toast shows action button, clicking it reverts the action
- [ ] Undo toast pauses on hover, resumes on leave
- [ ] Existing `toast.success/error/warning/info` calls unchanged (backward compat)
- [ ] Escape clears selection
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] Mobile: bulk toolbar doesn't overlap bottom nav

---

## Fase 2.5: Context Menu

### Why

Linear-style right-click on any item → instant actions. Eliminates: click → open modal → find button → act.

### New dependency

`@radix-ui/react-context-menu` (~4KB gzipped, 6 Radix packages already installed)

### New files

- `src/components/ui/context-menu.tsx` — Styled Radix wrapper (matches existing dropdown.tsx styling)
- `src/components/ui/entity-context-menu.tsx` — Registry-driven context menu

### EntityContextMenu

```ts
interface EntityContextMenuProps {
  entityType: 'appointment' | 'client' | 'service'
  entityId: string
  children: React.ReactNode
}
```

Internally calls `actionRegistry.getVisibleForEntity({ entityType, isOwner, isBarber, staffPermissions })` — same centralized filter as palette and bulk toolbar.

### Mobile guard (Cross-Cutting Decision #7)

`EntityContextMenu` checks `window.matchMedia('(pointer: coarse)')` on mount. On touch devices, renders `{children}` directly without Radix wrapper — no long-press trigger on mobile.

### Files to modify

- `package.json` — add `@radix-ui/react-context-menu`
- `src/components/clients/client-cards-view.tsx` — wrap each card with `<EntityContextMenu>`
- `src/components/clients/client-table-view.tsx` — wrap each row
- Calendar day/week views — wrap appointment blocks (identify exact component files during implementation)

### Fase 2.5 Exit Criteria

- [ ] Right-click on client card shows context menu with: Ver perfil, WhatsApp, Eliminar
- [ ] Right-click on appointment shows: Confirmar, Completar, Cancelar, WhatsApp
- [ ] Destructive actions (Cancelar, Eliminar) show in red
- [ ] Context menu uses `getVisibleForEntity` — same permissions as palette
- [ ] Keyboard: menu items navigable with arrow keys
- [ ] Mobile (`pointer: coarse`): context menu wrapper is NOT rendered, no long-press trigger
- [ ] `npx tsc --noEmit` passes

---

## Fase 3A: Optimistic Updates

### Why

Changing appointment status waits for server response. On slow internet, feels sluggish. Linear updates UI before server confirms.

### Existing infrastructure to reuse

- `src/lib/react-query/config.ts` has unused `optimisticUpdates` object with `appointmentStatus` and `serviceStatus` helpers
- `queryKeys` factory provides all cache keys
- `invalidateQueries` helpers handle post-mutation cache refresh

### New file: `src/hooks/useOptimisticMutation.ts`

```ts
interface OptimisticMutationConfig<TData, TVars> {
  mutationFn: (vars: TVars) => Promise<TData>
  affectedQueryKeys: unknown[][]
  optimisticUpdater: (oldData: unknown, vars: TVars) => unknown
  invalidate: (qc: QueryClient) => void
  successMessage?: string
}
```

Note: No `undoable` field — optimistic mutations use `immediate-compensate` model (rollback on error), not `delayed-commit` (undo toast). These are separate execution models per Cross-Cutting Decision #4.

Uses standard React Query `onMutate`/`onError`/`onSettled`:

1. `onMutate`: cancel queries → snapshot cache → apply optimistic update
2. `onError`: rollback to snapshot → show error toast
3. `onSettled`: invalidate to reconcile with server

### Rollback policy by HTTP status

| Status  | Behavior                | Toast message                          |
| ------- | ----------------------- | -------------------------------------- |
| 409     | Rollback + invalidate   | "Alguien más modificó este registro"   |
| 403     | Rollback                | "No tienes permisos para esta acción"  |
| 404     | Rollback + invalidate   | "Este registro ya no existe"           |
| 500     | Rollback + retry button | "Error del servidor. Intenta de nuevo" |
| Network | Rollback + retry        | "Sin conexión. Verifica tu internet"   |

### Execution model mapping (from Cross-Cutting Decision #4)

Actions with `executionModel: 'immediate-compensate'` use this hook:

- `appointment.complete` → optimistic status badge change, rollback on error
- `service.toggle-active` → optimistic toggle, rollback on error

Actions with `executionModel: 'delayed-commit'` use `useUndoableAction` (Fase 2C):

- `appointment.cancel` → show undo toast, execute after 5s delay
- `client.delete` → show undo toast, execute after 5s delay

These two patterns are **mutually exclusive per action** — never both on the same action.

### New wrapper hooks (opt-in, don't modify originals)

- `src/hooks/queries/useOptimisticAppointments.ts` — wraps `useUpdateAppointmentStatus` for `immediate-compensate` statuses
- `src/hooks/queries/useOptimisticClients.ts` — wraps `useDeleteClient` with undo (uses `useUndoableAction` from 2C)

Pages swap imports to opt-in: `useUpdateAppointmentStatus` → `useOptimisticAppointmentStatus`

### Files to modify

- `src/app/(dashboard)/citas/page.tsx` — swap to optimistic hooks
- `src/app/(dashboard)/clientes/page.tsx` — swap delete to optimistic + undo

---

## Fase 3B: Split Panel / Detail Drawer

### Why

Clicking a client opens a modal, losing list context. Linear/Apple Mail show master-detail side by side.

### Design decision

- **Desktop (lg+):** Inline split panel — list shrinks, detail panel appears on right
- **Mobile (<lg):** Reuse existing `Sheet` component with `side="right"` (overlay, not inline)
- **No changes to `dashboard-shell.tsx`** — split panel lives inside each page's content area

### New files

- `src/components/ui/split-panel.tsx` — Layout wrapper

```ts
interface SplitPanelProps {
  isOpen: boolean
  onClose: () => void
  panelWidth?: number // Default 420px
  children: ReactNode // Main content (list)
  panel: ReactNode // Detail content
}
```

Desktop rendering:

```
<div className="flex">
  <div className="flex-1 min-w-0">{children}</div>
  <AnimatePresence>
    {isOpen && (
      <motion.aside style={{ width: panelWidth }}>
        {panel}
      </motion.aside>
    )}
  </AnimatePresence>
</div>
```

Mobile rendering: `<Sheet side="right">{panel}</Sheet>`

- `src/components/clients/client-detail-panel.tsx` — Client detail for split panel (extracted from ClientDetailModal inner content)
- `src/components/calendar/appointment-detail-panel.tsx` — Appointment detail for split panel

### Panel features

- Sticky `top-12` (below TopBar 48px), `h-[calc(100vh-48px)]`, `overflow-y-auto`
- Border-left separator
- Close button + Escape key closes
- Arrow up/down in list updates panel content (keyboard nav)
- Animation: `animations.spring.layout`

### Files to modify

- `src/app/(dashboard)/clientes/page.tsx` — replace `ClientDetailModal` with `SplitPanel`
- `src/app/(dashboard)/citas/page.tsx` — replace `AppointmentDetailModal` with `SplitPanel` on desktop

---

## Fase 3 Exit Criteria

- [ ] Changing appointment status updates badge instantly (before server response)
- [ ] If server returns error, UI reverts and shows appropriate toast per status code
- [ ] Deleting client removes from list instantly; undo toast appears; clicking Deshacer restores it
- [ ] Desktop: clicking client in list opens detail panel on right (list + detail side by side)
- [ ] Desktop: list content area shrinks smoothly when panel opens
- [ ] Mobile: clicking client opens Sheet as right-side overlay
- [ ] Split panel is sticky (stays visible while scrolling list)
- [ ] Escape closes split panel
- [ ] Arrow up/down updates panel content
- [ ] Panel animates in/out with design-system spring tokens
- [ ] No stale data after optimistic settle (queries invalidated correctly)
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] Dark/light mode visual check on split panel

---

## File Inventory

### New files (33)

| #   | File                                                    | Phase | Notes                                     |
| --- | ------------------------------------------------------- | ----- | ----------------------------------------- |
| 1   | `src/hooks/useDocumentTitle.ts`                         | 1A    |                                           |
| 2   | `src/hooks/useFaviconBadge.ts`                          | 1A    |                                           |
| 3   | `src/components/dashboard/client-effects.tsx`           | 1A    | Server Component safety wrapper           |
| 4   | `src/lib/keyboard/types.ts`                             | 1B    |                                           |
| 5   | `src/lib/keyboard/shortcut-registry.ts`                 | 1B    |                                           |
| 6   | `src/lib/keyboard/shortcut-provider.tsx`                | 1B    |                                           |
| 7   | `src/components/dashboard/command-shortcuts-help.tsx`   | 1B    | `?` key help modal                        |
| 8   | `src/hooks/useSavedFilters.ts`                          | 1C    |                                           |
| 9   | `src/components/ui/saved-filter-bar.tsx`                | 1C    |                                           |
| 10  | `src/lib/actions/types.ts`                              | 2A    |                                           |
| 11  | `src/lib/actions/registry.ts`                           | 2A    |                                           |
| 12  | `src/lib/actions/definitions/navigation.ts`             | 2A    |                                           |
| 13  | `src/lib/actions/definitions/appointment-actions.ts`    | 2A    |                                           |
| 14  | `src/lib/actions/definitions/client-actions.ts`         | 2A    |                                           |
| 15  | `src/lib/actions/definitions/service-actions.ts`        | 2A    |                                           |
| 16  | `src/lib/actions/index.ts`                              | 2A    |                                           |
| 17  | `src/hooks/useUndoableAction.ts`                        | 2C    |                                           |
| 18  | `src/hooks/useSelection.ts`                             | 2B    |                                           |
| 19  | `src/components/ui/bulk-actions-toolbar.tsx`            | 2B    |                                           |
| 20  | `src/components/ui/context-menu.tsx`                    | 2.5   |                                           |
| 21  | `src/components/ui/entity-context-menu.tsx`             | 2.5   |                                           |
| 22  | `src/hooks/useIsTouchDevice.ts`                         | 2.5   | Mobile guard for context menu             |
| 23  | `src/hooks/useOptimisticMutation.ts`                    | 3A    |                                           |
| 24  | `src/hooks/queries/useOptimisticAppointments.ts`        | 3A    |                                           |
| 25  | `src/hooks/queries/useOptimisticClients.ts`             | 3A    |                                           |
| 26  | `src/components/ui/split-panel.tsx`                     | 3B    |                                           |
| 27  | `src/components/clients/client-detail-panel.tsx`        | 3B    |                                           |
| 28  | `src/components/calendar/appointment-detail-panel.tsx`  | 3B    |                                           |
| 29  | `src/lib/navigation/route-meta.ts`                      | 1A    | Page metadata for tab titles              |
| 30  | `src/lib/utils/client-filters.ts`                       | 1C    | Extracted filter logic from clientes page |
| 31  | `src/components/dashboard/page-header.tsx`              | —     | Shared page header component              |
| 32  | `src/components/dashboard/dashboard-content-area.tsx`   | —     | Content area layout wrapper               |
| 33  | `supabase/migrations/051_dashboard_stats_range_rpc.sql` | —     | Range RPC for dashboard KPI cards         |

### Modified files (by phase)

**Fase 1:** 5 page.tsx files (ClientEffects), layout.tsx (ShortcutProvider), command-palette.tsx (Cmd+K → registry), command-shortcuts-help.tsx (dynamic), clientes + citas page.tsx (saved filters)

**Fase 2A:** command-palette.tsx (COMMANDS → registry, major refactor)
**Fase 2C:** toast.tsx (action + undoable + pause-on-hover; merged toast-refactored.tsx into toast.tsx, deleted toast-refactored.tsx)
**Fase 2B:** clientes/page.tsx (useSelection + bulk), client-cards-view.tsx + client-table-view.tsx (checkboxes + shift-click)

**Fase 2.5:** package.json (radix context-menu), client-cards/table-view.tsx (EntityContextMenu wrap), calendar views (EntityContextMenu wrap)

**Fase 3:** citas + clientes page.tsx (optimistic hooks + split panel replacing modals)

**Infrastructure (non-phase):** dashboard layout.tsx (major refactoring), subscription.ts + useSubscriptionData.ts (refactored), loading.tsx (updated), globals.css (new styles), empty-state.tsx + sheet.tsx (updated), notification-bell.tsx (updated), trial-banner.tsx (updated), preferences.ts (updated), api/dashboard/stats/route.ts (uses new RPC), api/public/[slug]/book/route.ts (updated)

### New dependency

`@radix-ui/react-context-menu` (Fase 2.5 only, ~4KB gzipped)

### localStorage keys (all follow `bsp_pref_` + `_v1`)

- `bsp_pref_filters_clientes_active_v1`
- `bsp_pref_filters_clientes_presets_v1`
- `bsp_pref_filters_citas_active_v1`
- `bsp_pref_filters_citas_presets_v1`

---

## Verification Strategy

### Per-phase automated checks

1. `npx tsc --noEmit` — zero errors
2. `npm run lint` — zero errors

### Per-phase visual checks (Chrome DevTools MCP)

3. Desktop screenshot (light + dark)
4. Mobile viewport 375x812 screenshot — no regressions
5. Manual keyboard test — all registered shortcuts work

### Automated tests (new, per phase)

**Fase 1:**

- `src/lib/keyboard/__tests__/shortcut-registry.test.ts` — register, unregister, getAll, idempotent re-register
- `src/hooks/__tests__/useSavedFilters.test.ts` — save/load/delete presets, corrupted localStorage fallback

**Fase 2:**

- `src/lib/actions/__tests__/registry.test.ts` — register, getVisibleActions with owner/barber roles, namespaced ID lookup, search via Fuse, legacyIdMap migration (maps old → new, purges unmappable, runs only once)
- `src/hooks/__tests__/useSelection.test.ts` — toggle, toggleAll, range select with shift, clear
- `src/hooks/__tests__/useUndoableAction.test.ts` — full preview→cancel flow (snapshot restored), full preview→commit flow (server called after delay), backward compat of toast action button
- `src/components/ui/__tests__/toast-undoable.test.ts` — action button renders, undo callback fires, pause-on-hover, backward compat

**Fase 3:**

- `src/hooks/__tests__/useOptimisticMutation.test.ts` — optimistic update applies, rollback on error by status code, invalidation on settle

### Integration check (after all phases)

1. Full flow: open palette → search → execute action → undo → verify revert
2. Full flow: right-click appointment → confirm → see optimistic update → split panel opens
3. Full flow: multi-select clients → bulk action → undo toast → deshacer
4. Barber role: verify all permission filters work across registry/palette/context menu/shortcuts
5. Refresh: verify all localStorage persisted state survives
