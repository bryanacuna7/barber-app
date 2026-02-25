# NO-MIGRATE Contract

> Components in `src/components/ui/` that must NEVER be replaced by shadcn/ui equivalents.
> This contract is binding. Violations require explicit approval from project owner.

## Protected Components (36 total)

### Explicitly Protected (Binding Rule 3)

| Component          | File                            | Why                                                                                         |
| ------------------ | ------------------------------- | ------------------------------------------------------------------------------------------- |
| **Button**         | `button.tsx`                    | Ripple effect, 7 variants, haptic feedback, `motion.button` springs, brand-gradient         |
| **Input**          | `input.tsx`                     | `motion.input` with focus scale, 3 variants, AnimatePresence error states, brand focus ring |
| **Sheet**          | `sheet.tsx`                     | Drag-to-dismiss with `useMotionValue`, haptics, swipe springs, velocity-based dismiss       |
| **Modal**          | `modal.tsx`                     | Custom focus trap, overlay click behavior, size variants, backdrop blur                     |
| **Card**           | `card.tsx`                      | 5 variants (glass, gradient, elevated), Framer Motion hover/tap, brand shadows              |
| **SwipeableRow**   | `swipeable-row.tsx`             | Left/right swipe actions, 24px edge exclusion, haptic feedback, velocity snapping           |
| **PullToRefresh**  | `pull-to-refresh.tsx`           | iOS-style pull gesture, haptic feedback                                                     |
| **IOSDatePicker**  | `ios-date-picker.tsx`           | iOS spinning wheel UX, Spanish localization, touch-optimized                                |
| **IOSTimePicker**  | `ios-time-picker.tsx`           | iOS spinning wheel UX, minute intervals, dark mode                                          |
| **CommandPalette** | `dashboard/command-palette.tsx` | Mature implementation with categories, permissions, settings subroutes                      |

### All Other Protected Components

| Component          | File                      | Reason                                                       |
| ------------------ | ------------------------- | ------------------------------------------------------------ |
| Badge              | `badge.tsx`               | 10 variants, pulsing dot, StatusBadge                        |
| Avatar             | `avatar.tsx`              | Gradient fallback, 4 sizes                                   |
| Dialog             | `dialog.tsx`              | Custom Radix wrapper with data-driven animations             |
| Select             | `select.tsx`              | Custom Radix wrapper with backdrop blur                      |
| Label              | `label.tsx`               | Radix wrapper                                                |
| Switch             | `switch.tsx`              | Emerald checked state, custom shadow                         |
| Tabs               | `tabs.tsx`                | Context-based, icon support                                  |
| Dropdown           | `dropdown.tsx`            | Custom menu + SelectDropdown variant                         |
| RadioGroup         | `radio-group.tsx`         | Context Provider, grid layout, ring glow                     |
| Drawer             | `drawer.tsx`              | Drag handle, velocity detection, safe area padding           |
| ConfirmDialog      | `confirm-dialog.tsx`      | 3 variants (danger/warning/info), icon with color background |
| CollapsibleSection | `collapsible-section.tsx` | Mobile-only by default, badge count                          |
| EmptyState         | `empty-state.tsx`         | Animated floating icon, decorative pulse circles             |
| Spinner            | `spinner.tsx`             | 4 variants (dots/pulse/bars), PageLoader, ProgressBar        |
| Skeleton           | `skeleton.tsx`            | Preset skeletons (Card, List, Stats)                         |
| Progress           | `progress.tsx`            | Gradient fill (blue to purple)                               |
| FAB                | `fab.tsx`                 | Mobile-only fixed positioning, icon + label                  |
| Toast              | `toast.tsx`               | 4 types, progress bar, drag-to-dismiss                       |
| ColorPicker        | `color-picker.tsx`        | 9 preset premium colors + custom hex                         |
| IOSToggle          | `ios-toggle.tsx`          | iOS-style toggle                                             |
| PremiumBackground  | `premium-background.tsx`  | Gradient/mesh background effects                             |
| Motion             | `motion.tsx`              | Reusable animation utilities                                 |
| PageTransition     | `page-transition.tsx`     | Route animation wrapper                                      |
| PasswordStrength   | `password-strength.tsx`   | Strength meter with labels                                   |
| QueryError         | `query-error.tsx`         | TanStack Query error display with retry                      |
| CardRefactored     | `card-refactored.tsx`     | Experimental card variant                                    |
| ToastRefactored    | `toast-refactored.tsx`    | Experimental toast variant                                   |

## What CAN Be Added via `ui-shadcn/`

New components that don't exist in `ui/`:

- DataTable (TanStack Table wrapper)
- Form (React Hook Form wrapper)
- Calendar (date picker for desktop)
- Combobox (search + select)
- Tooltip (hover info)

## Enforcement

Verified via grep in CI/code review:

```bash
# ui-shadcn must not import non-allowlisted ui/ components
grep -r "from '@/components/ui" src/components/ui-shadcn/ | grep -v -E "/(input|button|badge)"
```
