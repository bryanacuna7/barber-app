/**
 * Tour Definitions
 * Defines the interactive tours for different pages
 */

import { TourDefinition } from './types'

export const TOUR_IDS = {
  DASHBOARD: 'dashboard',
  CITAS: 'citas',
  CLIENTES: 'clientes',
} as const

export const tours: Record<string, TourDefinition> = {
  [TOUR_IDS.DASHBOARD]: {
    id: TOUR_IDS.DASHBOARD,
    name: 'Dashboard Tour',
    description: 'Aprende a usar tu dashboard principal',
    autoStart: true,
    steps: [
      {
        id: 'dashboard-stats',
        target: '[data-tour="dashboard-stats"]',
        title: '📊 Estadísticas en Tiempo Real',
        content:
          'Aquí puedes ver tus métricas principales: citas de hoy, ingresos del mes, clientes activos y más.',
        placement: 'bottom',
        spotlight: true,
      },
      {
        id: 'dashboard-appointments',
        target: '[data-tour="dashboard-appointments"]',
        title: '📅 Citas de Hoy',
        content:
          'Revisa y gestiona las citas programadas para hoy. Puedes cambiar su estado directamente desde aquí.',
        placement: 'bottom',
        spotlight: true,
      },
      {
        id: 'dashboard-quick-actions',
        target: '[data-tour="dashboard-quick-actions"]',
        title: '⚡ Acciones Rápidas',
        content:
          'Accesos directos a las acciones más comunes: crear cita, agregar cliente, reportar pago.',
        placement: 'top',
        spotlight: true,
      },
      {
        id: 'dashboard-sidebar',
        target: '[data-tour="sidebar"]',
        title: '🧭 Menú de Navegación',
        content:
          'Usa el menú lateral para navegar entre Citas, Clientes, Servicios, Barberos, Analíticas y Configuración.',
        placement: 'right',
        spotlight: true,
        isLastStep: true,
      },
    ],
  },

  [TOUR_IDS.CITAS]: {
    id: TOUR_IDS.CITAS,
    name: 'Citas Tour',
    description: 'Descubre cómo gestionar tus citas',
    autoStart: true,
    steps: [
      {
        id: 'citas-calendar',
        target: '[data-tour="appointments-calendar"]',
        title: '📅 Vista de Calendario',
        content: 'Cambia entre vista de día, semana o mes para ver tus citas de diferentes formas.',
        placement: 'bottom',
        spotlight: true,
      },
      {
        id: 'citas-filters',
        target: '[data-tour="appointments-filters"]',
        title: '🔍 Filtros y Búsqueda',
        content: 'Filtra citas por estado (pendiente, confirmada, completada) o busca por cliente.',
        placement: 'bottom',
        spotlight: true,
      },
      {
        id: 'citas-new',
        target: '[data-tour="appointments-new-button"]',
        title: '➕ Nueva Cita',
        content:
          'Haz clic aquí para crear una nueva cita. Selecciona cliente, servicio, barbero, fecha y hora.',
        placement: 'left',
        spotlight: true,
        isLastStep: true,
      },
    ],
  },

  [TOUR_IDS.CLIENTES]: {
    id: TOUR_IDS.CLIENTES,
    name: 'Clientes Tour',
    description: 'Aprende a gestionar tu base de clientes',
    autoStart: true,
    steps: [
      {
        id: 'clientes-list',
        target: '[data-tour="clients-list"]',
        title: '👥 Lista de Clientes',
        content:
          'Aquí puedes ver todos tus clientes con su información de contacto, visitas y último servicio.',
        placement: 'bottom',
        spotlight: true,
      },
      {
        id: 'clientes-add',
        target: '[data-tour="clients-add-button"]',
        title: '➕ Agregar Cliente',
        content:
          'Crea nuevos clientes con su nombre, teléfono y email. Luego podrás asignarles citas.',
        placement: 'left',
        spotlight: true,
        isLastStep: true,
      },
    ],
  },
}

/**
 * Get tour definition by ID
 */
export function getTourById(tourId: string): TourDefinition | undefined {
  return tours[tourId]
}

/**
 * Get all available tours
 */
export function getAllTours(): TourDefinition[] {
  return Object.values(tours)
}
