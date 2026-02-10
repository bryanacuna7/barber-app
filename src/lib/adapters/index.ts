/**
 * Data Adapters - Central Export
 *
 * All adapters transform Supabase database format to UI-friendly format
 * for the 7 UI/UX redesign modules.
 *
 * Created: Session 110 (Pre-Implementation Requirements)
 */

// Appointments adapter (Mi Día)
export * from './appointments'

// Services adapter (Servicios)
export * from './services'

// Clients adapter (Clientes)
export * from './clients'

// Barbers adapter (Barberos)
export * from './barbers'

// Analytics adapter (Reportes)
export * from './analytics'

// Calendar adapter (Citas) — explicit exports to avoid calculateDayStats collision with appointments
export {
  adaptToCalendarEvent,
  groupIntoTimeBlocks,
  findGaps,
  getCalendarQuery,
  generateWeekView,
  filterByBarber,
  type UICalendarEvent,
  type UITimeBlock,
  type UIGap,
} from './calendar'
// Note: calendar.calculateDayStats excluded — use appointments.calculateDayStats instead

// Settings adapter (Configuración)
export * from './settings'
