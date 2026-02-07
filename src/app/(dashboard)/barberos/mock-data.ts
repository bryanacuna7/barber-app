/**
 * Mock Data for Barberos Module Demos
 *
 * Includes business intelligence, performance metrics, gamification,
 * and activity data for realistic team management demos.
 */

export interface MockBarber {
  id: string
  name: string
  email: string
  phone: string
  bio: string
  photo_url: string | null
  role: 'owner' | 'senior' | 'junior' | 'trainee'
  is_active: boolean
  joined_date: string

  // Business Metrics
  stats: {
    appointments_today: number
    appointments_this_week: number
    appointments_this_month: number
    revenue_this_week: number
    revenue_this_month: number
    revenue_last_month: number
    client_rating: number // 0-5
    total_reviews: number
    repeat_client_rate: number // 0-100
    avg_service_time: number // minutes
    capacity_utilization: number // 0-100
  }

  // Performance Trends
  trends: {
    appointments_change: number // % vs last period
    revenue_change: number // % vs last period
    rating_change: number // % vs last period
    trend_direction: 'up' | 'down' | 'stable'
  }

  // Gamification
  gamification: {
    level: number
    xp: number
    xp_to_next_level: number
    badges: Array<{
      id: string
      name: string
      icon: string
      earned_date: string
    }>
    achievements_unlocked: number
    total_achievements: number
    current_streak: number // days
    rank_this_month: number
  }

  // Schedule & Availability
  schedule: {
    appointments_today: Array<{
      time: string
      client_name: string
      service: string
      status: 'pending' | 'confirmed' | 'completed'
    }>
    hours_worked_this_week: number
    next_available_slot: string
    occupancy_today: number // 0-100
  }

  // Recent Activity
  recent_activity: Array<{
    type: 'appointment' | 'achievement' | 'review'
    description: string
    timestamp: string
  }>
}

export const mockBarbers: MockBarber[] = [
  {
    id: '1',
    name: 'Carlos Méndez',
    email: 'carlos@barbershop.com',
    phone: '+506 8888-1234',
    bio: 'Especialista en degradados clásicos y barba. 15 años de experiencia.',
    photo_url: null,
    role: 'owner',
    is_active: true,
    joined_date: '2020-01-15',
    stats: {
      appointments_today: 8,
      appointments_this_week: 42,
      appointments_this_month: 156,
      revenue_this_week: 168000, // CRC
      revenue_this_month: 624000,
      revenue_last_month: 580000,
      client_rating: 4.9,
      total_reviews: 247,
      repeat_client_rate: 85,
      avg_service_time: 45,
      capacity_utilization: 92,
    },
    trends: {
      appointments_change: 12,
      revenue_change: 15,
      rating_change: 2,
      trend_direction: 'up',
    },
    gamification: {
      level: 28,
      xp: 8450,
      xp_to_next_level: 1550,
      badges: [
        { id: 'master', name: 'Maestro Barbero', icon: 'Crown', earned_date: '2024-12-01' },
        { id: 'streak', name: 'Racha de 100 días', icon: 'Flame', earned_date: '2024-11-15' },
        { id: 'revenue', name: 'Súper Ventas', icon: 'TrendingUp', earned_date: '2024-10-20' },
      ],
      achievements_unlocked: 42,
      total_achievements: 50,
      current_streak: 127,
      rank_this_month: 1,
    },
    schedule: {
      appointments_today: [
        { time: '09:00', client_name: 'Juan Pérez', service: 'Corte + Barba', status: 'completed' },
        { time: '10:00', client_name: 'Luis Mora', service: 'Degradado', status: 'completed' },
        {
          time: '11:30',
          client_name: 'Marco Silva',
          service: 'Corte Clásico',
          status: 'confirmed',
        },
        {
          time: '14:00',
          client_name: 'Pedro Rojas',
          service: 'Corte + Barba',
          status: 'confirmed',
        },
      ],
      hours_worked_this_week: 38,
      next_available_slot: 'Hoy 16:00',
      occupancy_today: 85,
    },
    recent_activity: [
      {
        type: 'achievement',
        description: 'Desbloqueó "100 Clientes Felices"',
        timestamp: '2h ago',
      },
      { type: 'review', description: 'Recibió reseña 5★ de Juan Pérez', timestamp: '3h ago' },
      { type: 'appointment', description: 'Completó cita con Luis Mora', timestamp: '4h ago' },
    ],
  },
  {
    id: '2',
    name: 'Diego Ramírez',
    email: 'diego@barbershop.com',
    phone: '+506 8888-5678',
    bio: 'Experto en estilos modernos y diseños creativos. Apasionado por las tendencias.',
    photo_url: null,
    role: 'senior',
    is_active: true,
    joined_date: '2021-03-10',
    stats: {
      appointments_today: 7,
      appointments_this_week: 38,
      appointments_this_month: 142,
      revenue_this_week: 152000,
      revenue_this_month: 568000,
      revenue_last_month: 510000,
      client_rating: 4.8,
      total_reviews: 189,
      repeat_client_rate: 78,
      avg_service_time: 50,
      capacity_utilization: 88,
    },
    trends: {
      appointments_change: 8,
      revenue_change: 11,
      rating_change: 5,
      trend_direction: 'up',
    },
    gamification: {
      level: 24,
      xp: 6720,
      xp_to_next_level: 1280,
      badges: [
        { id: 'creative', name: 'Diseñador Creativo', icon: 'Sparkles', earned_date: '2024-11-10' },
        { id: 'popular', name: 'Cliente Favorito', icon: 'Heart', earned_date: '2024-10-05' },
      ],
      achievements_unlocked: 34,
      total_achievements: 50,
      current_streak: 89,
      rank_this_month: 2,
    },
    schedule: {
      appointments_today: [
        {
          time: '09:30',
          client_name: 'Roberto Díaz',
          service: 'Fade Moderno',
          status: 'completed',
        },
        {
          time: '11:00',
          client_name: 'Carlos Vega',
          service: 'Diseño + Corte',
          status: 'completed',
        },
        { time: '13:00', client_name: 'Andrés López', service: 'Corte Moderno', status: 'pending' },
      ],
      hours_worked_this_week: 36,
      next_available_slot: 'Hoy 15:00',
      occupancy_today: 78,
    },
    recent_activity: [
      { type: 'review', description: 'Recibió reseña 5★ de Roberto Díaz', timestamp: '1h ago' },
      { type: 'appointment', description: 'Completó cita con Carlos Vega', timestamp: '2h ago' },
    ],
  },
  {
    id: '3',
    name: 'Javier Solís',
    email: 'javier@barbershop.com',
    phone: '+506 8888-9012',
    bio: 'Especialista en cortes clásicos y afeitado tradicional con navaja.',
    photo_url: null,
    role: 'senior',
    is_active: true,
    joined_date: '2021-07-20',
    stats: {
      appointments_today: 6,
      appointments_this_week: 34,
      appointments_this_month: 128,
      revenue_this_week: 136000,
      revenue_this_month: 512000,
      revenue_last_month: 495000,
      client_rating: 4.7,
      total_reviews: 156,
      repeat_client_rate: 82,
      avg_service_time: 55,
      capacity_utilization: 80,
    },
    trends: {
      appointments_change: 5,
      revenue_change: 3,
      rating_change: 0,
      trend_direction: 'stable',
    },
    gamification: {
      level: 21,
      xp: 5340,
      xp_to_next_level: 1660,
      badges: [
        {
          id: 'traditional',
          name: 'Maestro Tradicional',
          icon: 'Scissors',
          earned_date: '2024-09-15',
        },
        { id: 'consistent', name: 'Consistencia', icon: 'Target', earned_date: '2024-08-10' },
      ],
      achievements_unlocked: 28,
      total_achievements: 50,
      current_streak: 64,
      rank_this_month: 3,
    },
    schedule: {
      appointments_today: [
        {
          time: '10:00',
          client_name: 'Miguel Torres',
          service: 'Afeitado Clásico',
          status: 'completed',
        },
        {
          time: '11:30',
          client_name: 'Fernando Cruz',
          service: 'Corte + Afeitado',
          status: 'confirmed',
        },
        {
          time: '14:30',
          client_name: 'Ricardo Salas',
          service: 'Corte Clásico',
          status: 'pending',
        },
      ],
      hours_worked_this_week: 34,
      next_available_slot: 'Mañana 09:00',
      occupancy_today: 75,
    },
    recent_activity: [
      { type: 'appointment', description: 'Completó cita con Miguel Torres', timestamp: '2h ago' },
      { type: 'review', description: 'Recibió reseña 4★ de Fernando Cruz', timestamp: '1d ago' },
    ],
  },
  {
    id: '4',
    name: 'Andrés Vargas',
    email: 'andres@barbershop.com',
    phone: '+506 8888-3456',
    bio: 'Barbero versátil, especializado en estilos para jóvenes.',
    photo_url: null,
    role: 'junior',
    is_active: true,
    joined_date: '2023-02-01',
    stats: {
      appointments_today: 5,
      appointments_this_week: 28,
      appointments_this_month: 98,
      revenue_this_week: 112000,
      revenue_this_month: 392000,
      revenue_last_month: 380000,
      client_rating: 4.6,
      total_reviews: 87,
      repeat_client_rate: 68,
      avg_service_time: 42,
      capacity_utilization: 72,
    },
    trends: {
      appointments_change: 3,
      revenue_change: 3,
      rating_change: 2,
      trend_direction: 'stable',
    },
    gamification: {
      level: 15,
      xp: 3180,
      xp_to_next_level: 1820,
      badges: [
        { id: 'rising', name: 'Estrella en Ascenso', icon: 'Star', earned_date: '2024-11-01' },
      ],
      achievements_unlocked: 18,
      total_achievements: 50,
      current_streak: 42,
      rank_this_month: 4,
    },
    schedule: {
      appointments_today: [
        {
          time: '10:30',
          client_name: 'David Morales',
          service: 'Corte Moderno',
          status: 'completed',
        },
        { time: '13:00', client_name: 'Esteban Ríos', service: 'Fade', status: 'confirmed' },
        { time: '15:30', client_name: 'Pablo Núñez', service: 'Corte Casual', status: 'pending' },
      ],
      hours_worked_this_week: 30,
      next_available_slot: 'Hoy 17:00',
      occupancy_today: 65,
    },
    recent_activity: [
      { type: 'appointment', description: 'Completó cita con David Morales', timestamp: '1h ago' },
    ],
  },
  {
    id: '5',
    name: 'Marco Jiménez',
    email: 'marco@barbershop.com',
    phone: '+506 8888-7890',
    bio: 'En entrenamiento, aprendiendo técnicas clásicas y modernas.',
    photo_url: null,
    role: 'trainee',
    is_active: true,
    joined_date: '2024-09-15',
    stats: {
      appointments_today: 3,
      appointments_this_week: 18,
      appointments_this_month: 52,
      revenue_this_week: 72000,
      revenue_this_month: 208000,
      revenue_last_month: 180000,
      client_rating: 4.4,
      total_reviews: 31,
      repeat_client_rate: 52,
      avg_service_time: 60,
      capacity_utilization: 58,
    },
    trends: {
      appointments_change: 15,
      revenue_change: 16,
      rating_change: 8,
      trend_direction: 'up',
    },
    gamification: {
      level: 8,
      xp: 1240,
      xp_to_next_level: 760,
      badges: [
        { id: 'beginner', name: 'Primer Paso', icon: 'CircleDot', earned_date: '2024-09-20' },
      ],
      achievements_unlocked: 7,
      total_achievements: 50,
      current_streak: 28,
      rank_this_month: 5,
    },
    schedule: {
      appointments_today: [
        { time: '11:00', client_name: 'José Campos', service: 'Corte Básico', status: 'completed' },
        { time: '14:00', client_name: 'Tomás Aguilar', service: 'Corte Simple', status: 'pending' },
      ],
      hours_worked_this_week: 24,
      next_available_slot: 'Hoy 16:30',
      occupancy_today: 45,
    },
    recent_activity: [
      {
        type: 'achievement',
        description: 'Desbloqueó "10 Clientes Atendidos"',
        timestamp: '4h ago',
      },
      { type: 'appointment', description: 'Completó cita con José Campos', timestamp: '5h ago' },
    ],
  },
  {
    id: '6',
    name: 'Luis Herrera',
    email: 'luis@barbershop.com',
    phone: '+506 8888-2345',
    bio: 'Experto en cortes rápidos y eficientes. Gran manejo del tiempo.',
    photo_url: null,
    role: 'senior',
    is_active: true,
    joined_date: '2021-11-05',
    stats: {
      appointments_today: 9,
      appointments_this_week: 45,
      appointments_this_month: 168,
      revenue_this_week: 180000,
      revenue_this_month: 672000,
      revenue_last_month: 640000,
      client_rating: 4.7,
      total_reviews: 203,
      repeat_client_rate: 75,
      avg_service_time: 35,
      capacity_utilization: 95,
    },
    trends: {
      appointments_change: 10,
      revenue_change: 5,
      rating_change: 0,
      trend_direction: 'up',
    },
    gamification: {
      level: 26,
      xp: 7580,
      xp_to_next_level: 1420,
      badges: [
        { id: 'speed', name: 'Rayo Veloz', icon: 'Zap', earned_date: '2024-10-12' },
        { id: 'efficiency', name: 'Eficiencia Máxima', icon: 'Clock', earned_date: '2024-09-08' },
      ],
      achievements_unlocked: 38,
      total_achievements: 50,
      current_streak: 95,
      rank_this_month: 2,
    },
    schedule: {
      appointments_today: [
        {
          time: '09:00',
          client_name: 'Alberto Ruiz',
          service: 'Corte Express',
          status: 'completed',
        },
        { time: '09:45', client_name: 'Raúl Castro', service: 'Corte Rápido', status: 'completed' },
        {
          time: '10:30',
          client_name: 'Gustavo Ortiz',
          service: 'Corte Simple',
          status: 'completed',
        },
        { time: '11:15', client_name: 'Oscar Mendoza', service: 'Degradado', status: 'confirmed' },
        {
          time: '12:00',
          client_name: 'Sergio Campos',
          service: 'Corte Express',
          status: 'pending',
        },
      ],
      hours_worked_this_week: 40,
      next_available_slot: 'Mañana 09:00',
      occupancy_today: 95,
    },
    recent_activity: [
      { type: 'appointment', description: 'Completó 3 citas consecutivas', timestamp: '1h ago' },
      { type: 'review', description: 'Recibió reseña 5★ de Alberto Ruiz', timestamp: '2h ago' },
    ],
  },
  {
    id: '7',
    name: 'Fernando Castro',
    email: 'fernando@barbershop.com',
    phone: '+506 8888-6789',
    bio: 'Especialista en cortes infantiles y ambiente familiar.',
    photo_url: null,
    role: 'junior',
    is_active: true,
    joined_date: '2022-08-12',
    stats: {
      appointments_today: 4,
      appointments_this_week: 24,
      appointments_this_month: 86,
      revenue_this_week: 96000,
      revenue_this_month: 344000,
      revenue_last_month: 330000,
      client_rating: 4.8,
      total_reviews: 112,
      repeat_client_rate: 88,
      avg_service_time: 40,
      capacity_utilization: 68,
    },
    trends: {
      appointments_change: 2,
      revenue_change: 4,
      rating_change: 3,
      trend_direction: 'stable',
    },
    gamification: {
      level: 17,
      xp: 4120,
      xp_to_next_level: 1880,
      badges: [
        { id: 'kids', name: 'Amigo de Niños', icon: 'Baby', earned_date: '2024-08-22' },
        { id: 'patience', name: 'Paciencia Infinita', icon: 'Heart', earned_date: '2024-07-10' },
      ],
      achievements_unlocked: 22,
      total_achievements: 50,
      current_streak: 56,
      rank_this_month: 6,
    },
    schedule: {
      appointments_today: [
        {
          time: '10:00',
          client_name: 'Mateo (7 años)',
          service: 'Corte Infantil',
          status: 'completed',
        },
        {
          time: '11:00',
          client_name: 'Lucas (5 años)',
          service: 'Primer Corte',
          status: 'confirmed',
        },
        {
          time: '15:00',
          client_name: 'Sebastián (9 años)',
          service: 'Corte Escolar',
          status: 'pending',
        },
      ],
      hours_worked_this_week: 28,
      next_available_slot: 'Hoy 16:00',
      occupancy_today: 60,
    },
    recent_activity: [
      { type: 'review', description: 'Recibió reseña 5★ de Padre de Mateo', timestamp: '2h ago' },
      { type: 'appointment', description: 'Completó corte infantil', timestamp: '3h ago' },
    ],
  },
  {
    id: '8',
    name: 'Ricardo Mora',
    email: 'ricardo@barbershop.com',
    phone: '+506 8888-4567',
    bio: 'Barbero experimentado en técnicas de coloración y tratamientos.',
    photo_url: null,
    role: 'senior',
    is_active: false,
    joined_date: '2020-06-18',
    stats: {
      appointments_today: 0,
      appointments_this_week: 0,
      appointments_this_month: 0,
      revenue_this_week: 0,
      revenue_this_month: 0,
      revenue_last_month: 420000,
      client_rating: 4.6,
      total_reviews: 178,
      repeat_client_rate: 72,
      avg_service_time: 65,
      capacity_utilization: 0,
    },
    trends: {
      appointments_change: 0,
      revenue_change: -100,
      rating_change: 0,
      trend_direction: 'down',
    },
    gamification: {
      level: 22,
      xp: 5680,
      xp_to_next_level: 1320,
      badges: [
        { id: 'colorist', name: 'Experto en Color', icon: 'Palette', earned_date: '2024-06-15' },
      ],
      achievements_unlocked: 31,
      total_achievements: 50,
      current_streak: 0,
      rank_this_month: 8,
    },
    schedule: {
      appointments_today: [],
      hours_worked_this_week: 0,
      next_available_slot: 'No disponible',
      occupancy_today: 0,
    },
    recent_activity: [
      { type: 'appointment', description: 'Marcado como inactivo', timestamp: '15d ago' },
    ],
  },
]

// Team-level aggregated stats
export const teamStats = {
  total_barbers: mockBarbers.length,
  active_barbers: mockBarbers.filter((b) => b.is_active).length,
  total_appointments_today: mockBarbers.reduce((sum, b) => sum + b.stats.appointments_today, 0),
  total_appointments_this_week: mockBarbers.reduce(
    (sum, b) => sum + b.stats.appointments_this_week,
    0
  ),
  total_appointments_this_month: mockBarbers.reduce(
    (sum, b) => sum + b.stats.appointments_this_month,
    0
  ),
  total_revenue_this_week: mockBarbers.reduce((sum, b) => sum + b.stats.revenue_this_week, 0),
  total_revenue_this_month: mockBarbers.reduce((sum, b) => sum + b.stats.revenue_this_month, 0),
  average_client_rating:
    mockBarbers.reduce((sum, b) => sum + b.stats.client_rating, 0) / mockBarbers.length,
  average_capacity_utilization:
    mockBarbers
      .filter((b) => b.is_active)
      .reduce((sum, b) => sum + b.stats.capacity_utilization, 0) /
    mockBarbers.filter((b) => b.is_active).length,
  top_performer: mockBarbers
    .filter((b) => b.is_active)
    .sort((a, b) => b.stats.revenue_this_month - a.stats.revenue_this_month)[0],
}

// Helper: Format currency (Costa Rican Colones)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper: Get trend icon
export function getTrendIcon(direction: 'up' | 'down' | 'stable'): string {
  return direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→'
}

// Helper: Get role badge color
export function getRoleBadgeColor(role: MockBarber['role']): string {
  const colors = {
    owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    senior: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    junior: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    trainee: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }
  return colors[role]
}

// Helper: Get role label
export function getRoleLabel(role: MockBarber['role']): string {
  const labels = {
    owner: 'Dueño',
    senior: 'Senior',
    junior: 'Junior',
    trainee: 'Aprendiz',
  }
  return labels[role]
}
