// Re-export Database type from Supabase
export type { Database } from './database'

// Re-export all custom types
export type {
  // Database table types
  Business,
  Barber,
  BarberInvitation,
  Client,
  Appointment,
  Service,
  AdminUser,
  PaymentReport,
  BarberAchievement,
  BarberChallenge,
  BarberChallengeParticipant,
  // Subscription types
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionStatusResponse,
  // System settings types
  ExchangeRateValue,
  ExchangeRateResponse,
  UsdBankAccountValue,
  SupportWhatsAppValue,
  SinpeDetailsValue,
  // Notification types
  NotificationChannel,
  NotificationPreferences,
  // Operating hours types
  DayHours,
  OperatingHours,
  // Appointment types
  AppointmentStatus,
  AppointmentWithDetails,
  // Gamification types
  AchievementTier,
  AchievementCategory,
  ChallengeType,
  // UI types
  BadgeVariant,
  // Loyalty types
  ProgramType,
  ReferralRewardType,
  // Referral conversion types
  ReferralConversion,
  AdminReferralConversion,
  // Gamification extended types
  AchievementWithProgress,
} from './custom'

export type {
  TimeSlot,
  SlotDiscount,
  EnrichedTimeSlot,
  BookingRequest,
  BookingResponse,
  BookingPricing,
  DashboardStats,
  ApiError,
  PaginatedResponse,
  CancellationPolicy,
  CancelRequest,
  CancelResponse,
  RescheduleRequest,
  RescheduleResponse,
} from './api'

export type { PromoRule, PromoEvaluation } from './promo'
