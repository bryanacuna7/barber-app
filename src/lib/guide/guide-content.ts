/**
 * Guide Content — Structured data for the in-app guide.
 *
 * All sections, steps, and pro-tips live here as static typed data.
 * The guide page renders these sections with color-coded cards.
 */

import {
  Rocket,
  Calendar,
  Scissors,
  Users,
  UserRound,
  Globe,
  Settings,
  BarChart3,
  Banknote,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'

// =====================================================
// TYPES
// =====================================================

export interface GuideStep {
  text: string
  detail?: string
}

export interface GuideSection {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  color: string
  steps: GuideStep[]
  proTips?: string[]
  searchKeywords: string[]
}

// =====================================================
// COLOR CLASSES
// =====================================================

export const GUIDE_COLORS: Record<
  string,
  {
    iconBg: string
    iconText: string
    stepBg: string
    stepText: string
  }
> = {
  blue: {
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconText: 'text-blue-600 dark:text-blue-400',
    stepBg: 'bg-blue-500/10',
    stepText: 'text-blue-600 dark:text-blue-400',
  },
  indigo: {
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    stepBg: 'bg-indigo-500/10',
    stepText: 'text-indigo-600 dark:text-indigo-400',
  },
  violet: {
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    iconText: 'text-violet-600 dark:text-violet-400',
    stepBg: 'bg-violet-500/10',
    stepText: 'text-violet-600 dark:text-violet-400',
  },
  teal: {
    iconBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    iconText: 'text-teal-600 dark:text-teal-400',
    stepBg: 'bg-teal-500/10',
    stepText: 'text-teal-600 dark:text-teal-400',
  },
  rose: {
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    iconText: 'text-rose-600 dark:text-rose-400',
    stepBg: 'bg-rose-500/10',
    stepText: 'text-rose-600 dark:text-rose-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    stepBg: 'bg-emerald-500/10',
    stepText: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    iconText: 'text-amber-600 dark:text-amber-400',
    stepBg: 'bg-amber-500/10',
    stepText: 'text-amber-600 dark:text-amber-400',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    stepBg: 'bg-cyan-500/10',
    stepText: 'text-cyan-600 dark:text-cyan-400',
  },
  green: {
    iconBg: 'bg-green-500/10 dark:bg-green-500/20',
    iconText: 'text-green-600 dark:text-green-400',
    stepBg: 'bg-green-500/10',
    stepText: 'text-green-600 dark:text-green-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
    iconText: 'text-purple-600 dark:text-purple-400',
    stepBg: 'bg-purple-500/10',
    stepText: 'text-purple-600 dark:text-purple-400',
  },
}

// =====================================================
// SECTIONS
// =====================================================

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'primeros-pasos',
    title: 'Primeros Pasos',
    subtitle: 'Configurá tu barbería y empezá a recibir reservas',
    icon: Rocket,
    color: 'blue',
    steps: [
      {
        text: 'Completá tu perfil de negocio',
        detail:
          'Andá a Configuración > Información General y completá el nombre de tu barbería, teléfono, dirección y horario de atención.',
      },
      {
        text: 'Configurá tu horario',
        detail:
          'En Configuración > Horario, definí los días y horas que atendés. Los clientes solo van a poder reservar dentro de este horario.',
      },
      {
        text: 'Agregá tus servicios',
        detail:
          'Creá al menos un servicio con nombre, precio y duración estimada. La duración determina los slots disponibles para reservas.',
      },
      {
        text: 'Personalizá tu marca',
        detail:
          'Subí tu logo y elegí los colores de tu barbería en Configuración > Marca y Estilo. Se aplican a tu página de reservas.',
      },
      {
        text: 'Compartí tu enlace de reservas',
        detail:
          'En Configuración > General encontrás tu enlace único. Copialo y compartilo por WhatsApp, Instagram, o tus redes sociales.',
      },
    ],
    proTips: [
      'Tu enlace de reservas funciona 24/7 — los clientes pueden reservar mientras dormís.',
      'Probá reservar vos mismo para ver cómo se ve la experiencia del cliente.',
    ],
    searchKeywords: [
      'inicio',
      'empezar',
      'configurar',
      'setup',
      'perfil',
      'enlace',
      'link',
      'compartir',
      'horario',
      'marca',
    ],
  },
  {
    id: 'citas',
    title: 'Gestionar Citas',
    subtitle: 'Creá, controlá y completá citas fácilmente',
    icon: Calendar,
    color: 'indigo',
    steps: [
      {
        text: 'Crear una cita manualmente',
        detail:
          'Tocá el botón + en la barra inferior y seleccioná "Nueva Cita". Elegí el servicio, barbero, cliente y horario.',
      },
      {
        text: 'Ver tu calendario',
        detail:
          'La página de Citas muestra todas las citas del día, semana o mes. Podés filtrar por barbero y estado.',
      },
      {
        text: 'Iniciar el temporizador',
        detail:
          'Cuando el cliente llega, tocá "Iniciar" en la cita. El temporizador te ayuda a controlar la duración real del servicio.',
      },
      {
        text: 'Completar una cita',
        detail:
          'Al terminar, tocá "Completar". Seleccioná el método de pago (efectivo, SINPE, tarjeta) y confirmá. La cita se marca como completada.',
      },
      {
        text: 'Cancelar o reprogramar',
        detail:
          'Podés cancelar o mover una cita desde los detalles. Si el cliente cancela, se notifica automáticamente.',
      },
    ],
    proTips: [
      'El sistema aprende la duración promedio de cada servicio y ajusta los slots automáticamente.',
      'Las citas creadas por reserva online llegan con los datos del cliente ya cargados.',
    ],
    searchKeywords: [
      'cita',
      'appointment',
      'calendario',
      'temporizador',
      'timer',
      'completar',
      'cancelar',
      'reprogramar',
      'horario',
    ],
  },
  {
    id: 'servicios',
    title: 'Tus Servicios',
    subtitle: 'Definí qué ofrecés y a qué precio',
    icon: Scissors,
    color: 'violet',
    steps: [
      {
        text: 'Agregar un servicio',
        detail:
          'Tocá "Nuevo Servicio" e ingresá el nombre (ej: "Corte Clásico"), precio y duración estimada en minutos.',
      },
      {
        text: 'Configurar duración',
        detail:
          'La duración determina cuánto espacio ocupa cada cita en el calendario. Ponela lo más precisa posible para evitar huecos.',
      },
      {
        text: 'Activar o desactivar',
        detail:
          'Si dejás de ofrecer un servicio temporalmente, podés desactivarlo sin borrarlo. No aparecerá en las reservas online.',
      },
      {
        text: 'Ordenar servicios',
        detail:
          'El orden en que aparecen los servicios es el mismo que ven tus clientes al reservar. Poné los más populares primero.',
      },
    ],
    proTips: [
      'Mantené los nombres simples — "Corte" es mejor que "Corte de pelo estilo clásico con tijera".',
      'Si la duración varía mucho por cliente, la app aprende y ajusta automáticamente con el tiempo.',
    ],
    searchKeywords: [
      'servicio',
      'service',
      'precio',
      'price',
      'duración',
      'duration',
      'corte',
      'barba',
      'agregar',
    ],
  },
  {
    id: 'equipo',
    title: 'Tu Equipo',
    subtitle: 'Invitá barberos y gestioná permisos',
    icon: Users,
    color: 'teal',
    steps: [
      {
        text: 'Invitar un barbero',
        detail:
          'Andá a Equipo y tocá "Invitar Barbero". Ingresá su nombre y correo — va a recibir un email con sus credenciales para ingresar.',
      },
      {
        text: 'Configurar permisos',
        detail:
          'En Configuración > Equipo y Accesos definí qué puede ver cada barbero: sus citas, todos los clientes, analíticas, etc.',
      },
      {
        text: 'Permisos individuales',
        detail:
          'Podés ajustar permisos por barbero individualmente. Tocá el barbero y activá/desactivá los accesos específicos.',
      },
      {
        text: 'Ver rendimiento',
        detail:
          'Cada barbero tiene logros y estadísticas. Podés ver quién atiende más, su velocidad promedio y satisfacción.',
      },
    ],
    proTips: [
      'Los barberos solo ven sus propias citas por defecto — activá "Ver todas las citas" si querés que vean la agenda completa.',
      'Usá los desafíos para motivar al equipo con competencias amigables.',
    ],
    searchKeywords: [
      'equipo',
      'team',
      'barbero',
      'barber',
      'invitar',
      'invite',
      'permisos',
      'permissions',
      'logros',
      'desafíos',
    ],
  },
  {
    id: 'clientes',
    title: 'Clientes',
    subtitle: 'Conocé a tus clientes y premiá su lealtad',
    icon: UserRound,
    color: 'rose',
    steps: [
      {
        text: 'Lista de clientes',
        detail:
          'Todos los clientes que reservan se agregan automáticamente. También podés agregar clientes manualmente con el botón +.',
      },
      {
        text: 'Historial de visitas',
        detail:
          'Tocá cualquier cliente para ver su historial completo: citas pasadas, servicios favoritos, última visita y gasto total.',
      },
      {
        text: 'Programa de lealtad',
        detail:
          'Activá el programa en Lealtad > Configuración. Los clientes acumulan puntos por cada visita y los canjean por recompensas.',
      },
      {
        text: 'Exportar datos',
        detail:
          'Descargá la lista de clientes en formato CSV desde el menú de opciones. Útil para campañas de marketing o reportes.',
      },
    ],
    proTips: [
      'Los clientes que reservan online ya llegan con nombre, teléfono y correo cargados.',
      'El programa de lealtad incentiva las visitas recurrentes — los clientes ven sus puntos al reservar.',
    ],
    searchKeywords: [
      'cliente',
      'client',
      'lealtad',
      'loyalty',
      'puntos',
      'points',
      'historial',
      'exportar',
      'CSV',
      'recompensa',
    ],
  },
  {
    id: 'reservas-online',
    title: 'Reservas Online',
    subtitle: 'Tus clientes reservan 24/7 desde su celular',
    icon: Globe,
    color: 'emerald',
    steps: [
      {
        text: 'Tu enlace de reservas',
        detail:
          'Cada barbería tiene un enlace único (ej: barberapp.com/reservar/tu-barberia). Lo encontrás en Configuración > General.',
      },
      {
        text: 'Compartir el enlace',
        detail:
          'Copiá el enlace y ponelo en tu bio de Instagram, estado de WhatsApp, Google Maps, o donde tus clientes lo vean.',
      },
      {
        text: 'Cómo reservan los clientes',
        detail:
          'El cliente elige servicio → barbero (opcional) → fecha y hora → ingresa sus datos. Recibe confirmación por correo automáticamente.',
      },
      {
        text: 'Recordatorios automáticos',
        detail:
          'La app envía recordatorios 24h y 1h antes de cada cita. Esto reduce las inasistencias hasta un 80%.',
      },
      {
        text: 'Seguimiento en tiempo real',
        detail:
          'Cada reserva genera un enlace de seguimiento tipo Uber. El cliente ve el estado de su cita: pendiente, confirmada, en progreso, completada.',
      },
    ],
    proTips: [
      'Ponele un botón de "Reservar" en tu Instagram con tu enlace de reservas.',
      'Los clientes NO necesitan descargar ninguna app — todo funciona desde el navegador.',
    ],
    searchKeywords: [
      'reserva',
      'booking',
      'online',
      'enlace',
      'link',
      'compartir',
      'share',
      'Instagram',
      'WhatsApp',
      'recordatorio',
      'reminder',
    ],
  },
  {
    id: 'configuracion',
    title: 'Configuración',
    subtitle: 'Ajustá cada detalle de tu negocio',
    icon: Settings,
    color: 'amber',
    steps: [
      {
        text: 'Información General',
        detail:
          'Nombre del negocio, teléfono de contacto, dirección y tu enlace de reservas personalizado.',
      },
      {
        text: 'Horario de Atención',
        detail:
          'Configurá qué días y horas atendés. También podés ajustar el buffer entre citas (tiempo de descanso entre clientes).',
      },
      {
        text: 'Marca y Estilo',
        detail:
          'Subí tu logo y elegí los colores principales de tu marca. Se aplican a la página de reservas y al dashboard.',
      },
      {
        text: 'Métodos de Pago',
        detail:
          'Elegí qué métodos de pago aceptás (efectivo, SINPE, tarjeta). Se usan para registrar cómo pagó cada cliente.',
      },
      {
        text: 'Equipo y Accesos',
        detail: 'Definí qué secciones de la app pueden ver los miembros de tu equipo.',
      },
      {
        text: 'Configuración Avanzada',
        detail: 'Opciones de notificaciones, política de cancelación, pagos por adelantado y más.',
      },
    ],
    proTips: [
      'Revisá tu horario regularmente — si cambiás de horario por temporada, actualizalo acá.',
      'Los colores de marca hacen que la página de reservas se vea profesional y única.',
    ],
    searchKeywords: [
      'configuración',
      'settings',
      'horario',
      'schedule',
      'marca',
      'branding',
      'logo',
      'colores',
      'pago',
      'payment',
    ],
  },
  {
    id: 'analiticas',
    title: 'Analíticas',
    subtitle: 'Datos y reportes para tomar mejores decisiones',
    icon: BarChart3,
    color: 'cyan',
    steps: [
      {
        text: 'Panel de métricas',
        detail:
          'Vé de un vistazo: citas del día/semana/mes, ingresos totales, tasa de ocupación y barbero más productivo.',
      },
      {
        text: 'Servicios más populares',
        detail:
          'El gráfico de servicios te muestra cuáles se reservan más. Usalo para decidir qué promocionar o ajustar precios.',
      },
      {
        text: 'Mapa de demanda',
        detail:
          'El heatmap muestra en qué horas y días tenés más demanda. Identificá los horarios pico y los vacíos para ofrecer promociones.',
      },
      {
        text: 'Filtrar por período',
        detail:
          'Usá los filtros de fecha para ver datos de hoy, esta semana, este mes, o un rango personalizado.',
      },
    ],
    proTips: [
      'Revisá las analíticas al menos una vez por semana para detectar tendencias.',
      'Si ves horarios vacíos en el heatmap, considerá activar Slots Promocionales para llenarlos.',
    ],
    searchKeywords: [
      'analítica',
      'analytics',
      'reporte',
      'report',
      'estadísticas',
      'stats',
      'ingreso',
      'revenue',
      'heatmap',
      'demanda',
    ],
  },
  {
    id: 'pagos',
    title: 'Pagos',
    subtitle: 'Registrá pagos y aceptá adelantos por SINPE',
    icon: Banknote,
    color: 'green',
    steps: [
      {
        text: 'Métodos de pago',
        detail:
          'En Configuración > Pagos activá los métodos que aceptás. Estos se usan al completar citas para registrar cómo pagó el cliente.',
      },
      {
        text: 'Pago por adelantado (SINPE)',
        detail:
          'Activá esta opción para que los clientes puedan hacer un depósito antes de la cita. Podés ofrecer un descuento como incentivo.',
      },
      {
        text: 'Verificar comprobante',
        detail:
          'Cuando un cliente envía comprobante de SINPE, te aparece una notificación. Revisá el comprobante y aprobalo o rechazalo.',
      },
      {
        text: 'Política de cancelación',
        detail:
          'Configurá cuántas horas antes de la cita un cliente puede cancelar. Esto protege tu agenda de cancelaciones de último momento.',
      },
    ],
    proTips: [
      'El registro de pagos es para tu contabilidad — el cobro real se hace en persona o por SINPE.',
      'Un descuento del 5-10% por adelanto incentiva a los clientes a pagar por SINPE y reduce inasistencias.',
    ],
    searchKeywords: [
      'pago',
      'payment',
      'SINPE',
      'efectivo',
      'cash',
      'tarjeta',
      'card',
      'comprobante',
      'adelanto',
      'advance',
      'cancelación',
    ],
  },
  {
    id: 'app-movil',
    title: 'App Móvil',
    subtitle: 'Instalá la app en tu celular para acceso rápido',
    icon: Smartphone,
    color: 'purple',
    steps: [
      {
        text: 'Instalar en iPhone',
        detail:
          'Abrí la app en Safari → tocá el ícono de compartir (cuadrado con flecha) → "Agregar a pantalla de inicio". Se instala como una app nativa.',
      },
      {
        text: 'Instalar en Android',
        detail:
          'Abrí la app en Chrome → tocá los tres puntos → "Instalar app" o "Agregar a pantalla de inicio". Listo.',
      },
      {
        text: 'Activar notificaciones',
        detail:
          'Al instalar, la app te pide permiso para enviar notificaciones. Aceptá para recibir alertas de nuevas reservas y recordatorios.',
      },
      {
        text: 'Modo offline',
        detail:
          'La app funciona parcialmente sin internet. Podés ver tus citas del día y datos ya cargados. Los cambios se sincronizan al reconectarte.',
      },
    ],
    proTips: [
      'La app es una PWA (Progressive Web App) — funciona como una app nativa sin pasar por App Store.',
      'Asegurate de aceptar las notificaciones push para no perderte ninguna reserva nueva.',
    ],
    searchKeywords: [
      'app',
      'móvil',
      'mobile',
      'instalar',
      'install',
      'iPhone',
      'Android',
      'notificaciones',
      'push',
      'PWA',
      'offline',
    ],
  },
]
