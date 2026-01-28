/**
 * Animation Constants - Sistema centralizado de animaciones
 *
 * Define timings, spring configs y easings consistentes para toda la UI.
 * Basado en Apple HIG y Material Motion guidelines.
 */

export const TRANSITIONS = {
  // Tiempos (en milisegundos)
  fast: 150,      // Hover states, feedback inmediato
  default: 200,   // Transiciones estándar
  slow: 300,      // Animaciones complejas

  // Spring configurations (Framer Motion)
  spring: {
    // Quick: Para feedback táctil inmediato (buttons, toggles)
    quick: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 30,
    },

    // Smooth: Para transiciones fluidas (cards, modals)
    smooth: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },

    // Bouncy: Para animaciones con personalidad (empty states, success)
    bouncy: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 20,
    },

    // Gentle: Para floating animations (icons, badges)
    gentle: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 17,
    },
  },

  // Easing functions (para cuando no se usa spring)
  easing: {
    // Salida suave (standard para la mayoría de animaciones)
    easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],

    // Entrada y salida suave (para transiciones complejas)
    easeInOut: [0.43, 0.13, 0.23, 0.96] as [number, number, number, number],

    // Énfasis (para llamadas a la acción)
    emphasized: [0.05, 0.7, 0.1, 1] as [number, number, number, number],
  },
} as const

/**
 * Scale Animations
 * Valores estándar para scale animations
 */
export const SCALE = {
  // Hover states
  hover: 1.02,
  hoverLarge: 1.05,

  // Tap/Press states
  tap: 0.97,
  tapSmall: 0.98,

  // Icon animations
  iconHover: 1.1,
  iconTap: 0.9,
} as const

/**
 * Translate Animations
 * Valores estándar para movimientos
 */
export const TRANSLATE = {
  // Hover lift
  hover: -2,
  hoverLarge: -4,
  hoverSmall: -1,

  // Slide animations
  slideSmall: 4,
  slideMedium: 8,
  slideLarge: 20,
} as const

/**
 * Rotation Animations
 * Valores para rotaciones
 */
export const ROTATE = {
  slight: 2,
  small: 5,
  medium: 15,
  full: 360,
} as const

/**
 * Opacity Animations
 * Valores estándar para fade effects
 */
export const OPACITY = {
  visible: 1,
  semiVisible: 0.7,
  subtle: 0.5,
  verySubtle: 0.3,
  invisible: 0,
} as const

/**
 * Durations para animaciones complejas
 * Usar con animate={{}} en Framer Motion
 */
export const DURATION = {
  floating: 3,        // Floating animations (idle states)
  pulse: 2,          // Pulse effects (loading, attention)
  shimmer: 1.5,      // Shimmer effects (skeletons)
  ripple: 0.6,       // Ripple effects (touch feedback)
  toast: 0.3,        // Toast enter/exit
  modal: 0.25,       // Modal open/close
  drawer: 0.3,       // Drawer slide
} as const

/**
 * Animation Variants - Presets comunes
 * Usar con variants={{}} en Framer Motion
 */
export const ANIMATION_VARIANTS = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Slide from bottom
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Slide from right
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  // Scale + Fade
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  // Stagger children
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  // Stagger item
  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  },
} as const

/**
 * Hover Variants - Presets para hover states
 */
export const HOVER_VARIANTS = {
  // Card hover (lift + scale)
  card: {
    scale: SCALE.hover,
    y: TRANSLATE.hover,
    transition: TRANSITIONS.spring.quick,
  },

  // Button hover (scale only)
  button: {
    scale: SCALE.hover,
    transition: TRANSITIONS.spring.quick,
  },

  // Icon hover (scale + optional rotate)
  icon: {
    scale: SCALE.iconHover,
    transition: TRANSITIONS.spring.bouncy,
  },

  // Link hover (translate)
  link: {
    x: TRANSLATE.slideSmall,
    transition: TRANSITIONS.spring.quick,
  },
} as const

/**
 * Tap Variants - Presets para tap/press states
 */
export const TAP_VARIANTS = {
  // Button tap
  button: {
    scale: SCALE.tap,
    transition: TRANSITIONS.spring.quick,
  },

  // Icon tap
  icon: {
    scale: SCALE.iconTap,
    transition: TRANSITIONS.spring.quick,
  },

  // Card tap
  card: {
    scale: SCALE.tapSmall,
    transition: TRANSITIONS.spring.quick,
  },
} as const
