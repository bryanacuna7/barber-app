export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          business_id: string
          created_at: string
          event_name: string
          id: string
          metadata: Json | null
        }
        Insert: {
          business_id: string
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          business_id?: string
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'analytics_events_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      appointments: {
        Row: {
          actual_duration_minutes: number | null
          advance_payment_proof_url: string | null
          advance_payment_status: string | null
          barber_id: string | null
          base_price_snapshot: number | null
          business_id: string
          cancelled_at: string | null
          cancelled_by: string | null
          client_id: string | null
          client_notes: string | null
          confirmation_sent_at: string | null
          created_at: string | null
          discount_amount_snapshot: number | null
          discount_pct_snapshot: number | null
          duration_minutes: number
          final_price_snapshot: number | null
          id: string
          internal_notes: string | null
          payment_method: string | null
          price: number
          proof_channel: string | null
          proof_submitted_at: string | null
          reminder_sent_at: string | null
          reschedule_count: number | null
          rescheduled_from: string | null
          scheduled_at: string
          service_id: string | null
          source: string | null
          started_at: string | null
          status: string | null
          tracking_expires_at: string | null
          tracking_token: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by_user_id: string | null
        }
        Insert: {
          actual_duration_minutes?: number | null
          advance_payment_proof_url?: string | null
          advance_payment_status?: string | null
          barber_id?: string | null
          base_price_snapshot?: number | null
          business_id: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string | null
          client_notes?: string | null
          confirmation_sent_at?: string | null
          created_at?: string | null
          discount_amount_snapshot?: number | null
          discount_pct_snapshot?: number | null
          duration_minutes: number
          final_price_snapshot?: number | null
          id?: string
          internal_notes?: string | null
          payment_method?: string | null
          price: number
          proof_channel?: string | null
          proof_submitted_at?: string | null
          reminder_sent_at?: string | null
          reschedule_count?: number | null
          rescheduled_from?: string | null
          scheduled_at: string
          service_id?: string | null
          source?: string | null
          started_at?: string | null
          status?: string | null
          tracking_expires_at?: string | null
          tracking_token?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Update: {
          actual_duration_minutes?: number | null
          advance_payment_proof_url?: string | null
          advance_payment_status?: string | null
          barber_id?: string | null
          base_price_snapshot?: number | null
          business_id?: string
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_id?: string | null
          client_notes?: string | null
          confirmation_sent_at?: string | null
          created_at?: string | null
          discount_amount_snapshot?: number | null
          discount_pct_snapshot?: number | null
          duration_minutes?: number
          final_price_snapshot?: number | null
          id?: string
          internal_notes?: string | null
          payment_method?: string | null
          price?: number
          proof_channel?: string | null
          proof_submitted_at?: string | null
          reminder_sent_at?: string | null
          reschedule_count?: number | null
          rescheduled_from?: string | null
          scheduled_at?: string
          service_id?: string | null
          source?: string | null
          started_at?: string | null
          status?: string | null
          tracking_expires_at?: string | null
          tracking_token?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_barber_id_fkey'
            columns: ['barber_id']
            isOneToOne: false
            referencedRelation: 'barbers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_rescheduled_from_fkey'
            columns: ['rescheduled_from']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      barber_achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          key: string
          name: string
          tier: string | null
          unlock_conditions: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          name: string
          tier?: string | null
          unlock_conditions: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          name?: string
          tier?: string | null
          unlock_conditions?: Json
        }
        Relationships: []
      }
      barber_blocks: {
        Row: {
          all_day: boolean
          barber_id: string
          block_type: string
          business_id: string
          created_at: string
          end_time: string
          id: string
          recurrence_rule: string | null
          start_time: string
          title: string | null
        }
        Insert: {
          all_day?: boolean
          barber_id: string
          block_type: string
          business_id: string
          created_at?: string
          end_time: string
          id?: string
          recurrence_rule?: string | null
          start_time: string
          title?: string | null
        }
        Update: {
          all_day?: boolean
          barber_id?: string
          block_type?: string
          business_id?: string
          created_at?: string
          end_time?: string
          id?: string
          recurrence_rule?: string | null
          start_time?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'barber_blocks_barber_id_fkey'
            columns: ['barber_id']
            isOneToOne: false
            referencedRelation: 'barbers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'barber_blocks_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      barber_challenge_participants: {
        Row: {
          barber_id: string
          challenge_id: string
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          id: string
          rank: number | null
          target_value: number
          updated_at: string | null
        }
        Insert: {
          barber_id: string
          challenge_id: string
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          rank?: number | null
          target_value: number
          updated_at?: string | null
        }
        Update: {
          barber_id?: string
          challenge_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          rank?: number | null
          target_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'barber_challenge_participants_barber_id_fkey'
            columns: ['barber_id']
            isOneToOne: false
            referencedRelation: 'barbers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'barber_challenge_participants_challenge_id_fkey'
            columns: ['challenge_id']
            isOneToOne: false
            referencedRelation: 'barber_challenges'
            referencedColumns: ['id']
          },
        ]
      }
      barber_challenges: {
        Row: {
          business_id: string
          challenge_type: string
          created_at: string | null
          description: string | null
          ends_at: string
          id: string
          is_active: boolean | null
          name: string
          reward_amount: number | null
          reward_description: string | null
          starts_at: string
          target_metric: string
          target_value: number
          updated_at: string | null
        }
        Insert: {
          business_id: string
          challenge_type: string
          created_at?: string | null
          description?: string | null
          ends_at: string
          id?: string
          is_active?: boolean | null
          name: string
          reward_amount?: number | null
          reward_description?: string | null
          starts_at: string
          target_metric: string
          target_value: number
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          challenge_type?: string
          created_at?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          reward_amount?: number | null
          reward_description?: string | null
          starts_at?: string
          target_metric?: string
          target_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'barber_challenges_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      barber_earned_achievements: {
        Row: {
          achievement_id: string
          barber_id: string
          earned_at: string | null
          id: string
          progress: Json | null
        }
        Insert: {
          achievement_id: string
          barber_id: string
          earned_at?: string | null
          id?: string
          progress?: Json | null
        }
        Update: {
          achievement_id?: string
          barber_id?: string
          earned_at?: string | null
          id?: string
          progress?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: 'barber_earned_achievements_achievement_id_fkey'
            columns: ['achievement_id']
            isOneToOne: false
            referencedRelation: 'barber_achievements'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'barber_earned_achievements_barber_id_fkey'
            columns: ['barber_id']
            isOneToOne: false
            referencedRelation: 'barbers'
            referencedColumns: ['id']
          },
        ]
      }
      barber_invitations: {
        Row: {
          business_id: string
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          token?: string
          used_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'barber_invitations_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      barber_stats: {
        Row: {
          appointments_rank: number | null
          avg_rating: number | null
          barber_id: string
          best_streak_days: number | null
          business_id: string
          clients_rank: number | null
          created_at: string | null
          current_streak_days: number | null
          id: string
          last_appointment_date: string | null
          revenue_rank: number | null
          total_appointments: number | null
          total_clients: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          appointments_rank?: number | null
          avg_rating?: number | null
          barber_id: string
          best_streak_days?: number | null
          business_id: string
          clients_rank?: number | null
          created_at?: string | null
          current_streak_days?: number | null
          id?: string
          last_appointment_date?: string | null
          revenue_rank?: number | null
          total_appointments?: number | null
          total_clients?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          appointments_rank?: number | null
          avg_rating?: number | null
          barber_id?: string
          best_streak_days?: number | null
          business_id?: string
          clients_rank?: number | null
          created_at?: string | null
          current_streak_days?: number | null
          id?: string
          last_appointment_date?: string | null
          revenue_rank?: number | null
          total_appointments?: number | null
          total_clients?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'barber_stats_barber_id_fkey'
            columns: ['barber_id']
            isOneToOne: true
            referencedRelation: 'barbers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'barber_stats_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      barbers: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_id: string
          created_at: string | null
          custom_permissions: Json | null
          display_order: number | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          photo_url: string | null
          role: string | null
          role_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_id: string
          created_at?: string | null
          custom_permissions?: Json | null
          display_order?: number | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_id?: string
          created_at?: string | null
          custom_permissions?: Json | null
          display_order?: number | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'barbers_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'barbers_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
        ]
      }
      business_onboarding: {
        Row: {
          business_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_step: number
          defaults_applied: boolean
          skipped: boolean
          updated_at: string
        }
        Insert: {
          business_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_step?: number
          defaults_applied?: boolean
          skipped?: boolean
          updated_at?: string
        }
        Update: {
          business_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_step?: number
          defaults_applied?: boolean
          skipped?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'business_onboarding_business_id_fkey'
            columns: ['business_id']
            isOneToOne: true
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      business_referrals: {
        Row: {
          business_id: string
          created_at: string | null
          current_milestone: number | null
          id: string
          points_balance: number | null
          qr_code_url: string | null
          referral_code: string
          successful_referrals: number | null
          total_referrals: number | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          current_milestone?: number | null
          id?: string
          points_balance?: number | null
          qr_code_url?: string | null
          referral_code: string
          successful_referrals?: number | null
          total_referrals?: number | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          current_milestone?: number | null
          id?: string
          points_balance?: number | null
          qr_code_url?: string | null
          referral_code?: string
          successful_referrals?: number | null
          total_referrals?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'business_referrals_business_id_fkey'
            columns: ['business_id']
            isOneToOne: true
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      business_subscriptions: {
        Row: {
          business_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'business_subscriptions_business_id_fkey'
            columns: ['business_id']
            isOneToOne: true
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'business_subscriptions_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'subscription_plans'
            referencedColumns: ['id']
          },
        ]
      }
      businesses: {
        Row: {
          accepted_payment_methods: Json | null
          address: string | null
          advance_booking_days: number | null
          advance_payment_deadline_hours: number | null
          advance_payment_discount: number | null
          advance_payment_enabled: boolean | null
          booking_buffer_minutes: number | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          cancellation_policy: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          notification_settings: Json | null
          operating_hours: Json | null
          owner_id: string
          phone: string | null
          promotional_slots: Json | null
          sinpe_holder_name: string | null
          sinpe_phone: string | null
          slot_interval_minutes: number | null
          slug: string
          smart_duration_enabled: boolean | null
          smart_notifications_enabled: boolean
          staff_permissions: Json | null
          timezone: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          accepted_payment_methods?: Json | null
          address?: string | null
          advance_booking_days?: number | null
          advance_payment_deadline_hours?: number | null
          advance_payment_discount?: number | null
          advance_payment_enabled?: boolean | null
          booking_buffer_minutes?: number | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          cancellation_policy?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          notification_settings?: Json | null
          operating_hours?: Json | null
          owner_id: string
          phone?: string | null
          promotional_slots?: Json | null
          sinpe_holder_name?: string | null
          sinpe_phone?: string | null
          slot_interval_minutes?: number | null
          slug: string
          smart_duration_enabled?: boolean | null
          smart_notifications_enabled?: boolean
          staff_permissions?: Json | null
          timezone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          accepted_payment_methods?: Json | null
          address?: string | null
          advance_booking_days?: number | null
          advance_payment_deadline_hours?: number | null
          advance_payment_discount?: number | null
          advance_payment_enabled?: boolean | null
          booking_buffer_minutes?: number | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          cancellation_policy?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          notification_settings?: Json | null
          operating_hours?: Json | null
          owner_id?: string
          phone?: string | null
          promotional_slots?: Json | null
          sinpe_holder_name?: string | null
          sinpe_phone?: string | null
          slot_interval_minutes?: number | null
          slug?: string
          smart_duration_enabled?: boolean | null
          smart_notifications_enabled?: boolean
          staff_permissions?: Json | null
          timezone?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      client_loyalty_status: {
        Row: {
          business_id: string
          client_id: string
          created_at: string | null
          current_tier: string | null
          id: string
          last_points_earned_at: string | null
          last_reward_redeemed_at: string | null
          lifetime_points: number | null
          points_balance: number | null
          referral_code: string | null
          referred_by_client_id: string | null
          updated_at: string | null
          user_id: string
          visit_count: number | null
        }
        Insert: {
          business_id: string
          client_id: string
          created_at?: string | null
          current_tier?: string | null
          id?: string
          last_points_earned_at?: string | null
          last_reward_redeemed_at?: string | null
          lifetime_points?: number | null
          points_balance?: number | null
          referral_code?: string | null
          referred_by_client_id?: string | null
          updated_at?: string | null
          user_id: string
          visit_count?: number | null
        }
        Update: {
          business_id?: string
          client_id?: string
          created_at?: string | null
          current_tier?: string | null
          id?: string
          last_points_earned_at?: string | null
          last_reward_redeemed_at?: string | null
          lifetime_points?: number | null
          points_balance?: number | null
          referral_code?: string | null
          referred_by_client_id?: string | null
          updated_at?: string | null
          user_id?: string
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'client_loyalty_status_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'client_loyalty_status_client_id_fkey'
            columns: ['client_id']
            isOneToOne: true
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'client_loyalty_status_referred_by_client_id_fkey'
            columns: ['referred_by_client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      client_notification_preferences: {
        Row: {
          business_id: string
          client_id: string
          created_at: string
          id: string
          smart_promos_enabled: boolean
          smart_promos_paused_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          client_id: string
          created_at?: string
          id?: string
          smart_promos_enabled?: boolean
          smart_promos_paused_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          client_id?: string
          created_at?: string
          id?: string
          smart_promos_enabled?: boolean
          smart_promos_paused_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'client_notification_preferences_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'client_notification_preferences_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      client_referrals: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_client_id: string | null
          referred_reward_claimed_at: string | null
          referrer_client_id: string
          referrer_reward_claimed_at: string | null
          status: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_client_id?: string | null
          referred_reward_claimed_at?: string | null
          referrer_client_id: string
          referrer_reward_claimed_at?: string | null
          status?: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_client_id?: string | null
          referred_reward_claimed_at?: string | null
          referrer_client_id?: string
          referrer_reward_claimed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'client_referrals_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'client_referrals_referred_client_id_fkey'
            columns: ['referred_client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'client_referrals_referrer_client_id_fkey'
            columns: ['referrer_client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      clients: {
        Row: {
          business_id: string
          claim_token: string | null
          claim_token_expires_at: string | null
          created_at: string | null
          email: string | null
          id: string
          last_visit_at: string | null
          name: string
          notes: string | null
          phone: string
          total_spent: number | null
          total_visits: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_id: string
          claim_token?: string | null
          claim_token_expires_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit_at?: string | null
          name: string
          notes?: string | null
          phone: string
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string
          claim_token?: string | null
          claim_token_expires_at?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_visit_at?: string | null
          name?: string
          notes?: string | null
          phone?: string
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clients_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      loyalty_programs: {
        Row: {
          business_id: string
          created_at: string | null
          discount_after_visits: number | null
          discount_percentage: number | null
          enabled: boolean | null
          free_service_after_visits: number | null
          id: string
          points_expiry_days: number | null
          points_per_currency_unit: number | null
          program_type: string
          referee_reward_amount: number | null
          referral_reward_amount: number | null
          referral_reward_type: string | null
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          discount_after_visits?: number | null
          discount_percentage?: number | null
          enabled?: boolean | null
          free_service_after_visits?: number | null
          id?: string
          points_expiry_days?: number | null
          points_per_currency_unit?: number | null
          program_type?: string
          referee_reward_amount?: number | null
          referral_reward_amount?: number | null
          referral_reward_type?: string | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          discount_after_visits?: number | null
          discount_percentage?: number | null
          enabled?: boolean | null
          free_service_after_visits?: number | null
          id?: string
          points_expiry_days?: number | null
          points_per_currency_unit?: number | null
          program_type?: string
          referee_reward_amount?: number | null
          referral_reward_amount?: number | null
          referral_reward_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'loyalty_programs_business_id_fkey'
            columns: ['business_id']
            isOneToOne: true
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      loyalty_transactions: {
        Row: {
          amount_delta: number | null
          business_id: string
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          points_delta: number
          related_appointment_id: string | null
          related_referral_id: string | null
          transaction_type: string
        }
        Insert: {
          amount_delta?: number | null
          business_id: string
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          points_delta: number
          related_appointment_id?: string | null
          related_referral_id?: string | null
          transaction_type: string
        }
        Update: {
          amount_delta?: number | null
          business_id?: string
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          points_delta?: number
          related_appointment_id?: string | null
          related_referral_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'loyalty_transactions_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'loyalty_transactions_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'loyalty_transactions_related_appointment_id_fkey'
            columns: ['related_appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
        ]
      }
      notification_log: {
        Row: {
          appointment_id: string | null
          business_id: string
          channel: string
          created_at: string
          error_code: string | null
          error_message: string | null
          event_type: string
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          business_id: string
          channel: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          status: string
          user_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          business_id?: string
          channel?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notification_log_appointment_id_fkey'
            columns: ['appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notification_log_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      notification_preferences: {
        Row: {
          business_id: string
          channel: string | null
          created_at: string | null
          email_address: string | null
          email_appointment_reminder: boolean | null
          email_new_appointment: boolean | null
          email_new_business: boolean | null
          email_payment_pending: boolean | null
          email_payment_status: boolean | null
          email_subscription_expiring: boolean | null
          email_trial_expiring: boolean | null
          id: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          channel?: string | null
          created_at?: string | null
          email_address?: string | null
          email_appointment_reminder?: boolean | null
          email_new_appointment?: boolean | null
          email_new_business?: boolean | null
          email_payment_pending?: boolean | null
          email_payment_status?: boolean | null
          email_subscription_expiring?: boolean | null
          email_trial_expiring?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          channel?: string | null
          created_at?: string | null
          email_address?: string | null
          email_appointment_reminder?: boolean | null
          email_new_appointment?: boolean | null
          email_new_business?: boolean | null
          email_payment_pending?: boolean | null
          email_payment_status?: boolean | null
          email_subscription_expiring?: boolean | null
          email_trial_expiring?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_business_id_fkey'
            columns: ['business_id']
            isOneToOne: true
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      payment_reports: {
        Row: {
          admin_notes: string | null
          amount_usd: number
          business_id: string
          created_at: string
          delete_after: string | null
          id: string
          notes: string | null
          plan_id: string
          proof_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          amount_usd: number
          business_id: string
          created_at?: string
          delete_after?: string | null
          id?: string
          notes?: string | null
          plan_id: string
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          amount_usd?: number
          business_id?: string
          created_at?: string
          delete_after?: string | null
          id?: string
          notes?: string | null
          plan_id?: string
          proof_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payment_reports_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payment_reports_plan_id_fkey'
            columns: ['plan_id']
            isOneToOne: false
            referencedRelation: 'subscription_plans'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payment_reports_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'admin_users'
            referencedColumns: ['id']
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          resource: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          resource: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          resource?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          failed_count: number
          id: string
          is_active: boolean
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          failed_count?: number
          id?: string
          is_active?: boolean
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          failed_count?: number
          id?: string
          is_active?: boolean
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_conversions: {
        Row: {
          converted_at: string | null
          created_at: string | null
          id: string
          referral_code: string
          referred_business_id: string | null
          referrer_business_id: string
          reward_claimed_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_business_id?: string | null
          referrer_business_id: string
          reward_claimed_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_business_id?: string | null
          referrer_business_id?: string
          reward_claimed_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'referral_conversions_referred_business_id_fkey'
            columns: ['referred_business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'referral_conversions_referrer_business_id_fkey'
            columns: ['referrer_business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      referral_milestones: {
        Row: {
          badge_icon: string | null
          badge_name: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          milestone_number: number
          referrals_required: number
          reward_description: string
          reward_type: string
          reward_value: number
          tier: string
        }
        Insert: {
          badge_icon?: string | null
          badge_name: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          milestone_number: number
          referrals_required: number
          reward_description: string
          reward_type: string
          reward_value: number
          tier: string
        }
        Update: {
          badge_icon?: string | null
          badge_name?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          milestone_number?: number
          referrals_required?: number
          reward_description?: string
          reward_type?: string
          reward_value?: number
          tier?: string
        }
        Relationships: []
      }
      referral_rewards_claimed: {
        Row: {
          applied_at: string | null
          business_id: string
          claimed_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          milestone_id: string
        }
        Insert: {
          applied_at?: string | null
          business_id: string
          claimed_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_id: string
        }
        Update: {
          applied_at?: string | null
          business_id?: string
          claimed_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          milestone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'referral_rewards_claimed_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'referral_rewards_claimed_milestone_id_fkey'
            columns: ['milestone_id']
            isOneToOne: false
            referencedRelation: 'referral_milestones'
            referencedColumns: ['id']
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'role_permissions_permission_id_fkey'
            columns: ['permission_id']
            isOneToOne: false
            referencedRelation: 'permissions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'role_permissions_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_duration_stats: {
        Row: {
          avg_duration_minutes: number
          barber_id: string | null
          business_id: string
          created_at: string
          id: string
          last_updated_at: string
          max_duration_minutes: number
          min_duration_minutes: number
          sample_count: number
          service_id: string
        }
        Insert: {
          avg_duration_minutes: number
          barber_id?: string | null
          business_id: string
          created_at?: string
          id?: string
          last_updated_at?: string
          max_duration_minutes: number
          min_duration_minutes: number
          sample_count?: number
          service_id: string
        }
        Update: {
          avg_duration_minutes?: number
          barber_id?: string | null
          business_id?: string
          created_at?: string
          id?: string
          last_updated_at?: string
          max_duration_minutes?: number
          min_duration_minutes?: number
          sample_count?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'service_duration_stats_barber_id_fkey'
            columns: ['barber_id']
            isOneToOne: false
            referencedRelation: 'barbers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_duration_stats_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'service_duration_stats_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          duration_minutes: number
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          business_id: string
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          duration_minutes?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'services_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      smart_notification_attribution: {
        Row: {
          business_id: string
          client_id: string
          consumed_appointment_id: string | null
          consumed_at: string | null
          created_at: string
          expires_at: string
          habit_bucket_dow: number
          habit_bucket_hour: number
          id: string
          notification_id: string | null
          promo_rule_id: string | null
          sent_at: string | null
          token: string
          user_id: string
        }
        Insert: {
          business_id: string
          client_id: string
          consumed_appointment_id?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          habit_bucket_dow: number
          habit_bucket_hour: number
          id?: string
          notification_id?: string | null
          promo_rule_id?: string | null
          sent_at?: string | null
          token: string
          user_id: string
        }
        Update: {
          business_id?: string
          client_id?: string
          consumed_appointment_id?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          habit_bucket_dow?: number
          habit_bucket_hour?: number
          id?: string
          notification_id?: string | null
          promo_rule_id?: string | null
          sent_at?: string | null
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'smart_notification_attribution_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'smart_notification_attribution_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'smart_notification_attribution_consumed_appointment_id_fkey'
            columns: ['consumed_appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'smart_notification_attribution_notification_id_fkey'
            columns: ['notification_id']
            isOneToOne: false
            referencedRelation: 'notifications'
            referencedColumns: ['id']
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          display_name: string
          has_branding: boolean
          id: string
          is_active: boolean
          max_barbers: number | null
          max_clients: number | null
          max_services: number | null
          name: string
          price_usd: number
        }
        Insert: {
          created_at?: string
          display_name: string
          has_branding?: boolean
          id?: string
          is_active?: boolean
          max_barbers?: number | null
          max_clients?: number | null
          max_services?: number | null
          name: string
          price_usd: number
        }
        Update: {
          created_at?: string
          display_name?: string
          has_branding?: boolean
          id?: string
          is_active?: boolean
          max_barbers?: number | null
          max_clients?: number | null
          max_services?: number | null
          name?: string
          price_usd?: number
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'system_settings_updated_by_fkey'
            columns: ['updated_by']
            isOneToOne: false
            referencedRelation: 'admin_users'
            referencedColumns: ['id']
          },
        ]
      }
      tour_progress: {
        Row: {
          business_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          tour_id: string
          updated_at: string
        }
        Insert: {
          business_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          tour_id: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          tour_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tour_progress_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_expire_trials: { Args: never; Returns: undefined }
      check_barber_achievements: {
        Args: { p_barber_id: string }
        Returns: {
          awarded_achievement_id: string
          awarded_achievement_name: string
          newly_earned: boolean
        }[]
      }
      check_referral_milestones: {
        Args: { p_business_id: string }
        Returns: {
          milestone_achieved: number
          newly_unlocked: boolean
          reward_description: string
        }[]
      }
      create_notification: {
        Args: {
          p_business_id?: string
          p_message?: string
          p_metadata?: Json
          p_reference_id?: string
          p_reference_type?: string
          p_title?: string
          p_type?: string
          p_user_id?: string
        }
        Returns: string
      }
      generate_business_referral_code: {
        Args: { p_business_slug: string }
        Returns: string
      }
      generate_referral_code: {
        Args: { business_slug: string; client_name: string }
        Returns: string
      }
      get_appointment_overview: {
        Args: { p_business_id: string; p_start_date: string }
        Returns: Json
      }
      get_barber_analytics: {
        Args: { p_business_id: string; p_start_date: string }
        Returns: Json
      }
      get_business_stats_batch: {
        Args: { p_business_ids: string[] }
        Returns: {
          appointment_count: number
          barber_count: number
          business_id: string
          service_count: number
        }[]
      }
      get_demand_heatmap: {
        Args: {
          p_business_id: string
          p_start_date: string
          p_timezone?: string
        }
        Returns: Json
      }
      get_revenue_series: {
        Args: {
          p_business_id: string
          p_group_by?: string
          p_start_date: string
        }
        Returns: Json
      }
      get_service_analytics: {
        Args: { p_business_id: string; p_start_date: string }
        Returns: Json
      }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: {
          permission_description: string
          permission_name: string
          resource: string
        }[]
      }
      get_user_role: { Args: { p_user_id: string }; Returns: string }
      increment_client_stats: {
        Args: {
          p_client_id: string
          p_last_visit_timestamp?: string
          p_spent_increment?: number
          p_visits_increment?: number
        }
        Returns: undefined
      }
      increment_loyalty_points: {
        Args: { p_client_id: string; p_points: number }
        Returns: undefined
      }
      increment_referral_count: {
        Args: { p_amount?: number; p_business_id: string; p_column: string }
        Returns: undefined
      }
      update_client_profile: {
        Args: { p_client_id: string; p_email?: string; p_name: string }
        Returns: undefined
      }
      update_duration_stats: {
        Args: {
          p_actual_duration: number
          p_barber_id: string
          p_business_id: string
          p_service_id: string
        }
        Returns: undefined
      }
      user_has_permission: {
        Args: { p_permission_name: string; p_user_id: string }
        Returns: boolean
      }
      validate_custom_permissions: { Args: { perms: Json }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// =============================================================================
// Re-export custom types for backward compatibility
// =============================================================================

export type {
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
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionStatusResponse,
  ExchangeRateValue,
  ExchangeRateResponse,
  UsdBankAccountValue,
  SupportWhatsAppValue,
  SinpeDetailsValue,
  NotificationChannel,
  NotificationPreferences,
  DayHours,
  OperatingHours,
  AppointmentStatus,
  AppointmentWithDetails,
  AchievementTier,
  AchievementCategory,
  ChallengeType,
  BadgeVariant,
  ProgramType,
  ReferralRewardType,
  ReferralConversion,
  AdminReferralConversion,
  AchievementWithProgress,
} from './custom'
