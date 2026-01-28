-- Migration: 006_notifications.sql
-- Sistema de notificaciones para barberías y admin

-- Tabla de notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient (either business owner or admin)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

  -- Notification content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Optional reference to related entity
  reference_type TEXT,  -- 'appointment', 'payment', 'subscription', etc.
  reference_id UUID,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),

  -- At least one recipient must be specified
  CONSTRAINT notification_has_recipient CHECK (user_id IS NOT NULL OR business_id IS NOT NULL)
);

-- Notification types enum (documentation)
COMMENT ON COLUMN notifications.type IS '
Types for business owners:
- trial_expiring: Trial about to expire
- trial_expired: Trial has expired
- subscription_expiring: Paid subscription about to expire
- subscription_expired: Paid subscription expired
- payment_approved: Payment was approved
- payment_rejected: Payment was rejected
- new_appointment: New appointment booked
- appointment_reminder: Reminder for tomorrow appointments
- appointment_cancelled: Client cancelled appointment

Types for admins:
- new_business: New business registered
- payment_pending: New payment awaiting review
- trials_expiring_bulk: Multiple trials expiring soon
- system_alert: System error or anomaly
';

-- Indexes for efficient queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_notifications_business_id ON notifications(business_id) WHERE business_id IS NOT NULL;
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Business owners can read their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Business owners can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id = auth.uid() OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Only system/triggers can insert notifications (service role)
-- No direct insert policy for regular users

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID DEFAULT NULL,
  p_business_id UUID DEFAULT NULL,
  p_type TEXT DEFAULT NULL,
  p_title TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    business_id,
    type,
    title,
    message,
    reference_type,
    reference_id,
    metadata
  ) VALUES (
    p_user_id,
    p_business_id,
    p_type,
    p_title,
    p_message,
    p_reference_type,
    p_reference_id,
    p_metadata
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;

-- Trigger: Notify on new appointment
CREATE OR REPLACE FUNCTION notify_new_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_business_owner_id UUID;
  v_client_name TEXT;
  v_service_name TEXT;
BEGIN
  -- Get business owner
  SELECT owner_id INTO v_business_owner_id
  FROM businesses
  WHERE id = NEW.business_id;

  -- Get client name
  SELECT name INTO v_client_name
  FROM clients
  WHERE id = NEW.client_id;

  -- Get service name
  SELECT name INTO v_service_name
  FROM services
  WHERE id = NEW.service_id;

  -- Create notification for business owner
  PERFORM create_notification(
    p_user_id := v_business_owner_id,
    p_business_id := NEW.business_id,
    p_type := 'new_appointment',
    p_title := 'Nueva cita agendada',
    p_message := format('%s agendó %s para %s',
      COALESCE(v_client_name, 'Un cliente'),
      COALESCE(v_service_name, 'un servicio'),
      to_char(NEW.date_time AT TIME ZONE 'America/Costa_Rica', 'DD/MM a las HH:MI')
    ),
    p_reference_type := 'appointment',
    p_reference_id := NEW.id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_appointment
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_appointment();

-- Trigger: Notify on payment status change
CREATE OR REPLACE FUNCTION notify_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_business_owner_id UUID;
  v_plan_name TEXT;
BEGIN
  -- Only notify when status changes to approved or rejected
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    -- Get business owner
    SELECT owner_id INTO v_business_owner_id
    FROM businesses
    WHERE id = NEW.business_id;

    -- Get plan name
    SELECT display_name INTO v_plan_name
    FROM subscription_plans
    WHERE id = NEW.plan_id;

    IF NEW.status = 'approved' THEN
      PERFORM create_notification(
        p_user_id := v_business_owner_id,
        p_business_id := NEW.business_id,
        p_type := 'payment_approved',
        p_title := 'Pago aprobado',
        p_message := format('Tu pago para el plan %s ha sido aprobado. Tu suscripción está activa.', v_plan_name),
        p_reference_type := 'payment',
        p_reference_id := NEW.id
      );
    ELSE
      PERFORM create_notification(
        p_user_id := v_business_owner_id,
        p_business_id := NEW.business_id,
        p_type := 'payment_rejected',
        p_title := 'Pago rechazado',
        p_message := format('Tu pago para el plan %s fue rechazado. %s',
          v_plan_name,
          COALESCE('Motivo: ' || NEW.admin_notes, 'Contacta soporte para más información.')
        ),
        p_reference_type := 'payment',
        p_reference_id := NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_payment_status
  AFTER UPDATE ON payment_reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_status_change();

-- Trigger: Notify admin on new payment
CREATE OR REPLACE FUNCTION notify_admin_new_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin RECORD;
  v_business_name TEXT;
  v_plan_name TEXT;
BEGIN
  -- Get business name
  SELECT name INTO v_business_name
  FROM businesses
  WHERE id = NEW.business_id;

  -- Get plan name
  SELECT display_name INTO v_plan_name
  FROM subscription_plans
  WHERE id = NEW.plan_id;

  -- Notify all admins
  FOR v_admin IN SELECT user_id FROM admin_users LOOP
    PERFORM create_notification(
      p_user_id := v_admin.user_id,
      p_type := 'payment_pending',
      p_title := 'Nuevo pago pendiente',
      p_message := format('%s reportó un pago de $%.2f para plan %s',
        COALESCE(v_business_name, 'Un negocio'),
        NEW.amount_usd,
        v_plan_name
      ),
      p_reference_type := 'payment',
      p_reference_id := NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_new_payment
  AFTER INSERT ON payment_reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_payment();

-- Trigger: Notify admin on new business
CREATE OR REPLACE FUNCTION notify_admin_new_business()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin RECORD;
BEGIN
  -- Notify all admins
  FOR v_admin IN SELECT user_id FROM admin_users LOOP
    PERFORM create_notification(
      p_user_id := v_admin.user_id,
      p_type := 'new_business',
      p_title := 'Nuevo negocio registrado',
      p_message := format('%s se registró en la plataforma', NEW.name),
      p_reference_type := 'business',
      p_reference_id := NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admin_new_business
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_business();
