import { trackEvent } from '@/lib/analytics/track'

export type MobileUxEventName =
  | 'mobile_citas_create_open'
  | 'mobile_citas_create_submit'
  | 'mobile_citas_create_success'
  | 'mobile_citas_create_error'
  | 'mobile_citas_status_update'
  | 'mobile_citas_status_update_error'
  | 'mobile_clientes_create_open'
  | 'mobile_clientes_create_success'
  | 'mobile_clientes_create_error'
  | 'mobile_servicios_create_open'
  | 'mobile_servicios_save_success'
  | 'mobile_servicios_save_error'
  | 'mobile_servicios_delete_success'
  | 'mobile_servicios_delete_error'
  | 'mobile_equipo_invite_open'
  | 'mobile_equipo_invite_success'
  | 'mobile_equipo_invite_error'
  | 'mobile_analytics_period_change'
  | 'mobile_analytics_section_change'

/**
 * Typed mobile analytics wrapper.
 * Keeps `trackEvent` public signature unchanged (`string`).
 */
export function trackMobileEvent(
  name: MobileUxEventName,
  metadata?: Record<string, unknown>
): void {
  trackEvent(name, metadata)
}
