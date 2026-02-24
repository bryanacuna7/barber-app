/**
 * Gesture configuration per module/page.
 *
 * Priority order (never violated):
 * 1. System back gesture (iOS edge swipe, Android back)
 * 2. Vertical scroll
 * 3. SwipeableRow horizontal swipe
 * 4. Pull-to-refresh
 *
 * Edge exclusion: 24px from viewport edges is always reserved
 * for system gestures (handled by SwipeableRow).
 */

export interface GestureConfig {
  swipeRows: boolean
  pullToRefresh: boolean
  rationale: string
}

export const gestureConfigs: Record<string, GestureConfig> = {
  clientes: {
    swipeRows: true,
    pullToRefresh: true,
    rationale:
      'Single scrollable list with swipeable rows. PTR at top is unambiguous since rows swipe horizontally.',
  },
  servicios: {
    swipeRows: true,
    pullToRefresh: true,
    rationale: 'Same pattern as clientes — single scrollable list.',
  },
  citas: {
    swipeRows: true,
    pullToRefresh: false,
    rationale:
      'Calendar has date navigation and vertical time-block scroll. PTR would conflict with scrolling back to top of day view.',
  },
  'mi-dia': {
    swipeRows: false,
    pullToRefresh: false,
    rationale:
      'BarberAppointmentCard uses button actions, not swipe. Timeline auto-refreshes via React Query.',
  },
  configuracion: {
    swipeRows: false,
    pullToRefresh: false,
    rationale: 'Deep config routes must prioritize back navigation. No swipeable content.',
  },
  miembros del equipo: {
    swipeRows: false,
    pullToRefresh: false,
    rationale: 'Cards with button actions, no swipe gestures.',
  },
  analiticas: {
    swipeRows: false,
    pullToRefresh: false,
    rationale: 'Charts and stats — horizontal gestures would conflict with chart interactions.',
  },
} as const
