-- System settings table for exchange rate and other configurations
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial exchange rate (USD to CRC)
-- Current approximate rate: 1 USD = 510 CRC
INSERT INTO system_settings (key, value)
VALUES (
  'exchange_rate',
  '{
    "usd_to_crc": 510,
    "last_updated": "2025-01-27",
    "notes": "Tipo de cambio manual - actualizar según mercado"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- USD bank account placeholder setting
INSERT INTO system_settings (key, value)
VALUES (
  'usd_bank_account',
  '{
    "enabled": false,
    "bank_name": "Banco Nacional",
    "account_number": "IBAN CR00 0000 0000 0000 0000 00",
    "account_holder": "BarberShop Pro S.A.",
    "notes": "Cuenta en dólares - próximamente"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- RLS policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for exchange rate display)
CREATE POLICY "Settings are viewable by everyone" ON system_settings
  FOR SELECT USING (true);

-- Only admins can update settings (via API)
CREATE POLICY "Only admins can update settings" ON system_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Only admins can insert settings" ON system_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Create index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
