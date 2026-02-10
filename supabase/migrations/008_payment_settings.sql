-- WhatsApp support number setting
INSERT INTO system_settings (key, value)
VALUES (
  'support_whatsapp',
  '{
    "number": "50688888888",
    "display_number": "8888-8888",
    "message_template": "Hola! Quiero reportar mi pago para el plan {plan_name} ({price}). Adjunto mi comprobante."
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- SINPE Móvil payment details
INSERT INTO system_settings (key, value)
VALUES (
  'sinpe_details',
  '{
    "phone_number": "8888-8888",
    "account_name": "BarberApp",
    "notes": "Realiza el SINPE Móvil al número indicado y sube el comprobante"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;
