/**
 * Apple-inspired Design System
 * Based on Apple Human Interface Guidelines
 */

// Typography Scale (Apple SF Pro inspired)
export const typography = {
  // Large Titles
  largeTitle: 'text-[34px] font-bold tracking-tight leading-[41px]',

  // Titles
  title1: 'text-[28px] font-bold tracking-tight leading-[34px]',
  title2: 'text-[22px] font-bold tracking-tight leading-[28px]',
  title3: 'text-[20px] font-semibold leading-[25px]',

  // Headlines & Body
  headline: 'text-[17px] font-semibold leading-[22px]',
  body: 'text-[17px] font-normal leading-[22px]',
  callout: 'text-[16px] font-normal leading-[21px]',
  subheadline: 'text-[15px] font-normal leading-[20px]',

  // Smaller
  footnote: 'text-[13px] font-normal leading-[18px]',
  caption1: 'text-[12px] font-normal leading-[16px]',
  caption2: 'text-[11px] font-normal leading-[13px]',

  // Labels (for buttons, tabs)
  labelLarge: 'text-[17px] font-semibold',
  labelMedium: 'text-[15px] font-medium',
  labelSmall: 'text-[13px] font-medium uppercase tracking-wide',
} as const

// Spacing Scale (8pt grid)
export const spacing = {
  xs: '8px', // 0.5rem
  sm: '12px', // 0.75rem
  md: '16px', // 1rem
  lg: '24px', // 1.5rem
  xl: '32px', // 2rem
  '2xl': '40px', // 2.5rem
  '3xl': '48px', // 3rem
  '4xl': '64px', // 4rem
} as const

// Touch targets (Apple minimum 44x44pt)
export const touchTargets = {
  minimum: 'min-h-[44px] min-w-[44px]',
  comfortable: 'min-h-[48px] min-w-[48px]',
  large: 'min-h-[56px] min-w-[56px]',
} as const

// Border radius (Apple style)
export const radius = {
  sm: 'rounded-lg', // 8px
  md: 'rounded-xl', // 12px
  lg: 'rounded-2xl', // 16px
  xl: 'rounded-[20px]', // 20px
  full: 'rounded-full',
  card: 'rounded-[18px]',
  button: 'rounded-[14px]',
} as const

// iOS System Colors
export const colors = {
  // Backgrounds
  background: {
    primary: 'bg-[#F2F2F7] dark:bg-[#000000]',
    secondary: 'bg-[#FFFFFF] dark:bg-[#1C1C1E]',
    tertiary: 'bg-[#F2F2F7] dark:bg-[#2C2C2E]',
    grouped: 'bg-[#F2F2F7] dark:bg-[#1C1C1E]',
    elevated: 'bg-white dark:bg-[#2C2C2E]',
  },

  // Text
  text: {
    primary: 'text-zinc-900 dark:text-white',
    secondary: 'text-zinc-500 dark:text-zinc-400',
    tertiary: 'text-zinc-400 dark:text-zinc-500',
    quaternary: 'text-zinc-300 dark:text-zinc-600',
  },

  // System colors
  system: {
    blue: 'text-[#007AFF] dark:text-[#0A84FF]',
    green: 'text-[#34C759] dark:text-[#30D158]',
    indigo: 'text-[#5856D6] dark:text-[#5E5CE6]',
    orange: 'text-[#FF9500] dark:text-[#FF9F0A]',
    pink: 'text-[#FF2D55] dark:text-[#FF375F]',
    purple: 'text-[#AF52DE] dark:text-[#BF5AF2]',
    red: 'text-[#FF3B30] dark:text-[#FF453A]',
    teal: 'text-[#5AC8FA] dark:text-[#64D2FF]',
    yellow: 'text-[#FFCC00] dark:text-[#FFD60A]',
  },

  // Fills
  fill: {
    primary: 'bg-[#787880]/18 dark:bg-[#787880]/36',
    secondary: 'bg-[#787880]/12 dark:bg-[#787880]/32',
    tertiary: 'bg-[#767680]/8 dark:bg-[#767680]/24',
    quaternary: 'bg-[#747480]/4 dark:bg-[#747480]/18',
  },

  // Separators
  separator: 'border-[#3C3C43]/12 dark:border-[#545458]/60',
} as const

// Animation presets
export const animations = {
  /**
   * Spring configs for framer-motion (Interaction OS v1)
   *
   * gentle  → Subtle UI feedback, disclosure animations
   * default → General-purpose transitions (cards, lists, panels)
   * snappy  → Quick interactions (tap feedback, chips, segmented controls)
   * sheet   → Bottom sheets and overlays (open/close)
   * bouncy  → Playful animations (use sparingly)
   */
  spring: {
    gentle: { type: 'spring', stiffness: 120, damping: 14 },
    default: { type: 'spring', stiffness: 300, damping: 25 },
    snappy: { type: 'spring', stiffness: 400, damping: 30 },
    sheet: { type: 'spring', stiffness: 300, damping: 30 },
    bouncy: { type: 'spring', stiffness: 300, damping: 10 },
  },

  // Durations
  duration: {
    fast: 0.15,
    normal: 0.25,
    slow: 0.35,
  },

  // Easing
  easing: {
    easeOut: [0.33, 1, 0.68, 1],
    easeInOut: [0.65, 0, 0.35, 1],
    bounce: [0.68, -0.6, 0.32, 1.6],
  },
} as const

// Shadows (Apple style)
export const shadows = {
  sm: 'shadow-sm shadow-black/5 dark:shadow-black/20',
  md: 'shadow-md shadow-black/5 dark:shadow-black/30',
  lg: 'shadow-lg shadow-black/8 dark:shadow-black/40',
  xl: 'shadow-xl shadow-black/10 dark:shadow-black/50',
  card: 'shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
  elevated: 'shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
} as const

// Glass effects
export const glass = {
  light: 'bg-white/70 backdrop-blur-xl',
  dark: 'bg-black/70 backdrop-blur-xl',
  subtle: 'bg-white/50 backdrop-blur-md dark:bg-zinc-900/50',
  prominent: 'bg-white/80 backdrop-blur-2xl dark:bg-zinc-900/80',
} as const
