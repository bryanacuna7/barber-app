# 🚀 PLAN: Sistema de Referencias para Business Owners

**Fecha:** 2026-02-01
**Versión:** 1.0
**Opción seleccionada:** Option B - Recompensas Escalonadas + Gamificación

---

## 🎯 Objetivo

Implementar sistema de referencias para dueños de barberías con recompensas escalonadas, gamificación, y dashboard de tracking para impulsar el crecimiento viral del SaaS.

---

## 📊 Sistema de Milestones (Recompensas Escalonadas)

| Milestone | Referidos                  | Recompensa                   | Valor Real   | Badge              |
| --------- | -------------------------- | ---------------------------- | ------------ | ------------------ |
| 1         | 1                          | 20% descuento próximo mes    | Ahorras ~$6  | 🥉 First Partner   |
| 2         | 3                          | 1 mes gratis del Plan Pro    | Ahorras $29  | 🥈 Growth Partner  |
| 3         | 5                          | 2 meses gratis del Plan Pro  | Ahorras $58  | 🥇 Network Builder |
| 4         | 10                         | 4 meses gratis del Plan Pro  | Ahorras $116 | 💎 Super Connector |
| 5         | 20 que permanezcan 3 meses | 12 meses gratis del Plan Pro | Ahorras $348 | ⭐ Network King    |

---

## 📋 FASE 1: Database Schema (1-2 días)

### 1.1 Crear nueva migration: `019_business_referral_system.sql`

**Tablas a crear:**

```sql
-- business_referrals: Programa de referencias por negocio
CREATE TABLE business_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL, -- ej: "BARBER_SHOP_XYZ_2026"
  qr_code_url TEXT, -- URL del QR generado
  total_referrals INT DEFAULT 0,
  successful_referrals INT DEFAULT 0, -- referidos que pagaron 1+ mes
  current_milestone INT DEFAULT 0, -- 0-5 según tabla de milestones
  points_balance INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_referrals_business ON business_referrals(business_id);
CREATE INDEX idx_business_referrals_code ON business_referrals(referral_code);

-- referral_conversions: Tracking de cada referido
CREATE TABLE referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  referred_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'trial', 'active', 'churned')) DEFAULT 'pending',
  converted_at TIMESTAMPTZ, -- cuando se convirtió en paying customer
  reward_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_conversions_referrer ON referral_conversions(referrer_business_id);
CREATE INDEX idx_referral_conversions_referred ON referral_conversions(referred_business_id);
CREATE INDEX idx_referral_conversions_status ON referral_conversions(status);

-- referral_milestones: Definición de milestones
CREATE TABLE referral_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_number INT UNIQUE NOT NULL, -- 1-6
  referrals_required INT NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('discount', 'free_months', 'feature_unlock')) NOT NULL,
  reward_value INT NOT NULL, -- % o cantidad de meses
  reward_description TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'legendary')) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_milestones_number ON referral_milestones(milestone_number);

-- referral_rewards_claimed: Histórico de rewards
CREATE TABLE referral_rewards_claimed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  milestone_id UUID REFERENCES referral_milestones(id) ON DELETE CASCADE NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ, -- cuando se aplicó el descuento/beneficio
  expires_at TIMESTAMPTZ,
  metadata JSONB,

  UNIQUE(business_id, milestone_id)
);

CREATE INDEX idx_rewards_claimed_business ON referral_rewards_claimed(business_id);
CREATE INDEX idx_rewards_claimed_milestone ON referral_rewards_claimed(milestone_id);
```

**Seed data para milestones:**

```sql
INSERT INTO referral_milestones (
  milestone_number,
  referrals_required,
  reward_type,
  reward_value,
  reward_description,
  badge_name,
  badge_icon,
  tier,
  display_order
) VALUES
  (1, 1, 'discount', 20, '20% descuento próximo mes (Ahorras ~$6)', 'First Partner', '🥉', 'bronze', 1),
  (2, 3, 'free_months', 1, '1 mes gratis del Plan Pro (Ahorras $29)', 'Growth Partner', '🥈', 'silver', 2),
  (3, 5, 'free_months', 2, '2 meses gratis del Plan Pro (Ahorras $58)', 'Network Builder', '🥇', 'gold', 3),
  (4, 10, 'free_months', 4, '4 meses gratis del Plan Pro (Ahorras $116)', 'Super Connector', '💎', 'platinum', 4),
  (5, 20, 'free_months', 12, '1 año gratis del Plan Pro (Ahorras $348)', 'Network King', '⭐', 'legendary', 5)
ON CONFLICT (milestone_number) DO NOTHING;
```

**RLS Policies:**

```sql
-- Enable RLS
ALTER TABLE business_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards_claimed ENABLE ROW LEVEL SECURITY;

-- Business Referrals: Owner can view own
CREATE POLICY "Business owners manage own referrals"
  ON business_referrals FOR ALL
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Referral Conversions: Owner can view own conversions
CREATE POLICY "Business owners view own conversions"
  ON referral_conversions FOR SELECT
  USING (
    referrer_business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR referred_business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Milestones: Everyone can read
CREATE POLICY "Anyone can view active milestones"
  ON referral_milestones FOR SELECT
  USING (is_active = true);

-- Rewards Claimed: Owner can view own
CREATE POLICY "Business owners view own rewards"
  ON referral_rewards_claimed FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
```

**Triggers:**

```sql
-- Auto-update updated_at
CREATE TRIGGER update_business_referrals_updated_at
  BEFORE UPDATE ON business_referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_referral_conversions_updated_at
  BEFORE UPDATE ON referral_conversions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

**Helper Functions:**

```sql
-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_business_referral_code(p_business_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_attempts INT := 0;
BEGIN
  LOOP
    -- Format: BUSINESSSLUG_YEAR_RANDOM (max 20 chars)
    v_code := UPPER(
      SUBSTRING(REGEXP_REPLACE(p_business_slug, '[^a-zA-Z0-9]', '', 'g'), 1, 10) || '_' ||
      EXTRACT(YEAR FROM NOW())::TEXT || '_' ||
      SUBSTRING(MD5(RANDOM()::TEXT), 1, 4)
    );

    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM business_referrals WHERE referral_code = v_code) THEN
      RETURN v_code;
    END IF;

    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN
      RAISE EXCEPTION 'Failed to generate unique referral code after 10 attempts';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Check and update milestones
CREATE OR REPLACE FUNCTION check_referral_milestones(p_business_id UUID)
RETURNS TABLE (
  milestone_achieved INT,
  reward_description TEXT,
  newly_unlocked BOOLEAN
) AS $$
DECLARE
  v_referral_record RECORD;
  v_milestone RECORD;
  v_already_claimed BOOLEAN;
BEGIN
  -- Get business referral stats
  SELECT * INTO v_referral_record
  FROM business_referrals
  WHERE business_id = p_business_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check each milestone
  FOR v_milestone IN
    SELECT * FROM referral_milestones WHERE is_active = true ORDER BY milestone_number
  LOOP
    -- Check if already claimed
    SELECT EXISTS (
      SELECT 1 FROM referral_rewards_claimed
      WHERE business_id = p_business_id AND milestone_id = v_milestone.id
    ) INTO v_already_claimed;

    -- Skip if already claimed
    IF v_already_claimed THEN
      CONTINUE;
    END IF;

    -- Check if milestone reached
    IF v_referral_record.successful_referrals >= v_milestone.referrals_required THEN
      -- Update current milestone
      UPDATE business_referrals
      SET current_milestone = GREATEST(current_milestone, v_milestone.milestone_number)
      WHERE business_id = p_business_id;

      RETURN QUERY SELECT
        v_milestone.milestone_number,
        v_milestone.reward_description,
        true;
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;
```

---

## 📋 FASE 2: Backend API Routes (2-3 días)

### 2.1 `src/app/api/referrals/generate-code/route.ts`

**POST** - Generar código de referido único + QR code

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { businessId } = await request.json()

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('slug')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    // Generate code using DB function
    const { data: codeResult } = await supabase.rpc('generate_business_referral_code', {
      p_business_slug: business.slug,
    })

    const referralCode = codeResult

    // Generate QR code
    const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralCode}`
    const qrCodeDataUrl = await QRCode.toDataURL(signupUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })

    // Save to business_referrals
    const { data: referral } = await supabase
      .from('business_referrals')
      .upsert(
        {
          business_id: businessId,
          referral_code: referralCode,
          qr_code_url: qrCodeDataUrl,
        },
        { onConflict: 'business_id' }
      )
      .select()
      .single()

    return NextResponse.json({
      referralCode,
      qrCodeUrl: qrCodeDataUrl,
      signupUrl,
    })
  } catch (error) {
    console.error('Error generating referral code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 2.2 `src/app/api/referrals/stats/route.ts`

**GET** - Obtener stats de referencias

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'businessId required' }, { status: 400 })
    }

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get referral stats
    const { data: referralStats } = await supabase
      .from('business_referrals')
      .select('*')
      .eq('business_id', businessId)
      .single()

    // Get all milestones
    const { data: milestones } = await supabase
      .from('referral_milestones')
      .select('*')
      .eq('is_active', true)
      .order('milestone_number', { ascending: true })

    // Get earned badges
    const { data: claimedRewards } = await supabase
      .from('referral_rewards_claimed')
      .select('*, milestone:referral_milestones(*)')
      .eq('business_id', businessId)

    // Get conversions
    const { data: conversions } = await supabase
      .from('referral_conversions')
      .select('*, referred_business:businesses(name, slug)')
      .eq('referrer_business_id', businessId)
      .order('created_at', { ascending: false })

    // Calculate next milestone
    const currentSuccessful = referralStats?.successful_referrals || 0
    const nextMilestone = milestones?.find((m) => m.referrals_required > currentSuccessful)

    return NextResponse.json({
      totalReferrals: referralStats?.total_referrals || 0,
      successfulReferrals: currentSuccessful,
      currentMilestone: referralStats?.current_milestone || 0,
      nextMilestone: nextMilestone
        ? {
            number: nextMilestone.milestone_number,
            remaining: nextMilestone.referrals_required - currentSuccessful,
            reward: nextMilestone.reward_description,
          }
        : null,
      pointsBalance: referralStats?.points_balance || 0,
      earnedBadges: claimedRewards || [],
      conversionRate:
        referralStats?.total_referrals > 0
          ? ((currentSuccessful / referralStats.total_referrals) * 100).toFixed(1)
          : 0,
      conversions: conversions || [],
      milestones: milestones || [],
    })
  } catch (error) {
    console.error('Error fetching referral stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 2.3 `src/app/api/referrals/track-conversion/route.ts`

**POST** - Track cuando un referido se convierte

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { referralCode, referredBusinessId, status } = await request.json()

    // Find referrer business
    const { data: referrer } = await supabase
      .from('business_referrals')
      .select('business_id')
      .eq('referral_code', referralCode)
      .single()

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
    }

    // Create or update conversion
    const { data: conversion } = await supabase
      .from('referral_conversions')
      .upsert(
        {
          referrer_business_id: referrer.business_id,
          referred_business_id: referredBusinessId,
          referral_code: referralCode,
          status: status || 'pending',
          converted_at: status === 'active' ? new Date().toISOString() : null,
        },
        {
          onConflict: 'referrer_business_id,referred_business_id',
        }
      )
      .select()
      .single()

    // Update referral stats
    if (status === 'active') {
      await supabase.rpc('increment', {
        table_name: 'business_referrals',
        column_name: 'successful_referrals',
        row_id: referrer.business_id,
      })

      // Check milestones
      await supabase.rpc('check_referral_milestones', {
        p_business_id: referrer.business_id,
      })
    }

    return NextResponse.json({ success: true, conversion })
  } catch (error) {
    console.error('Error tracking conversion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 2.4 `src/app/api/referrals/claim-reward/route.ts`

**POST** - Reclamar recompensa de milestone

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { businessId, milestoneId } = await request.json()

    // Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get milestone details
    const { data: milestone } = await supabase
      .from('referral_milestones')
      .select('*')
      .eq('id', milestoneId)
      .single()

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    // Verify business has reached milestone
    const { data: referralStats } = await supabase
      .from('business_referrals')
      .select('successful_referrals')
      .eq('business_id', businessId)
      .single()

    if (referralStats.successful_referrals < milestone.referrals_required) {
      return NextResponse.json({ error: 'Milestone not reached' }, { status: 400 })
    }

    // Check if already claimed
    const { data: existing } = await supabase
      .from('referral_rewards_claimed')
      .select('id')
      .eq('business_id', businessId)
      .eq('milestone_id', milestoneId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    // Claim reward
    const expiresAt =
      milestone.reward_type === 'free_months'
        ? new Date(Date.now() + milestone.reward_value * 30 * 24 * 60 * 60 * 1000)
        : null

    const { data: reward } = await supabase
      .from('referral_rewards_claimed')
      .insert({
        business_id: businessId,
        milestone_id: milestoneId,
        applied_at: new Date().toISOString(),
        expires_at: expiresAt?.toISOString(),
        metadata: {
          reward_type: milestone.reward_type,
          reward_value: milestone.reward_value,
        },
      })
      .select()
      .single()

    // TODO: Apply actual discount/credit to subscription

    return NextResponse.json({
      success: true,
      reward,
      message: `¡Recompensa reclamada! ${milestone.reward_description}`,
    })
  } catch (error) {
    console.error('Error claiming reward:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 📋 FASE 3: Frontend - Dashboard de Referencias (3-4 días)

### 3.1 Nueva página: `src/app/(dashboard)/referencias/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReferralCodeCard } from '@/components/referrals/referral-code-card'
import { MilestoneProgress } from '@/components/referrals/milestone-progress'
import { BadgesShowcase } from '@/components/referrals/badges-showcase'
import { ConversionsTable } from '@/components/referrals/conversions-table'
import { StatsCards } from '@/components/referrals/stats-cards'

export default async function ReferenciasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!business) redirect('/dashboard')

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          🚀 Sistema de Referencias
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Refiere otros negocios y gana recompensas increíbles
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards businessId={business.id} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Code Card */}
        <div className="lg:col-span-1">
          <ReferralCodeCard businessId={business.id} />
        </div>

        {/* Milestone Progress */}
        <div className="lg:col-span-2">
          <MilestoneProgress businessId={business.id} />
        </div>
      </div>

      {/* Badges */}
      <BadgesShowcase businessId={business.id} />

      {/* Conversions Table */}
      <ConversionsTable businessId={business.id} />
    </div>
  )
}
```

### 3.2 Componentes a crear:

#### **`src/components/referrals/referral-code-card.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export function ReferralCodeCard({ businessId }: { businessId: string }) {
  const [referralData, setReferralData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferralCode()
  }, [businessId])

  const fetchReferralCode = async () => {
    // If no code exists, generate one
    const res = await fetch('/api/referrals/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId })
    })
    const data = await res.json()
    setReferralData(data)
    setLoading(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(referralData.referralCode)
    toast.success('¡Código copiado al portapapeles!')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralData.signupUrl)
    toast.success('¡Link copiado al portapapeles!')
  }

  const downloadQR = () => {
    const link = document.createElement('a')
    link.href = referralData.qrCodeUrl
    link.download = `qr-code-${referralData.referralCode}.png`
    link.click()
    toast.success('¡QR code descargado!')
  }

  if (loading) return <Card className="p-6">Cargando...</Card>

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-1">Tu Código de Referido</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Comparte este código o QR
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-lg border-2 border-zinc-200">
          <Image
            src={referralData.qrCodeUrl}
            alt="QR Code"
            width={200}
            height={200}
          />
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 text-center">
        <p className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
          {referralData.referralCode}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button onClick={copyCode} className="w-full" variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Copiar Código
        </Button>
        <Button onClick={copyLink} className="w-full" variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Copiar Link de Registro
        </Button>
        <Button onClick={downloadQR} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Descargar QR Code
        </Button>
      </div>
    </Card>
  )
}
```

#### **`src/components/referrals/milestone-progress.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Lock, Check } from 'lucide-react'
import confetti from 'canvas-confetti'

export function MilestoneProgress({ businessId }: { businessId: string }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [businessId])

  const fetchStats = async () => {
    const res = await fetch(`/api/referrals/stats?businessId=${businessId}`)
    const data = await res.json()
    setStats(data)
  }

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'bg-amber-100 border-amber-300 text-amber-800',
      silver: 'bg-gray-100 border-gray-300 text-gray-800',
      gold: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      platinum: 'bg-purple-100 border-purple-300 text-purple-800',
      legendary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
    }
    return colors[tier as keyof typeof colors] || colors.bronze
  }

  if (!stats) return <Card className="p-6">Cargando...</Card>

  const currentReferrals = stats.successfulReferrals

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Progreso de Milestones</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {currentReferrals} referidos exitosos • Milestone {stats.currentMilestone}/5
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progreso al siguiente milestone</span>
          {stats.nextMilestone && (
            <span className="font-medium">
              {stats.nextMilestone.remaining} más para desbloquear
            </span>
          )}
        </div>
        <Progress
          value={stats.nextMilestone
            ? ((currentReferrals / stats.nextMilestone.referrals_required) * 100)
            : 100
          }
          className="h-3"
        />
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.milestones.map((milestone: any) => {
          const isUnlocked = currentReferrals >= milestone.referrals_required
          const isCurrent = !isUnlocked && currentReferrals < milestone.referrals_required

          return (
            <Card
              key={milestone.id}
              className={`p-4 text-center transition-all ${
                isUnlocked
                  ? getTierColor(milestone.tier)
                  : 'bg-zinc-50 dark:bg-zinc-800 opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">
                {isUnlocked ? <Check className="h-8 w-8 mx-auto" /> : <Lock className="h-8 w-8 mx-auto text-zinc-400" />}
              </div>
              <div className="text-sm font-semibold mb-1">
                {milestone.badge_icon} {milestone.badge_name}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">
                {milestone.referrals_required} referidos
              </div>
              <div className="text-xs font-medium">
                {milestone.reward_description}
              </div>
              {isCurrent && (
                <Badge className="mt-2" variant="secondary">
                  Próximo
                </Badge>
              )}
            </Card>
          )
        })}
      </div>
    </Card>
  )
}
```

#### **`src/components/referrals/stats-cards.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Users, UserCheck, Trophy, TrendingUp } from 'lucide-react'

export function StatsCards({ businessId }: { businessId: string }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [businessId])

  const fetchStats = async () => {
    const res = await fetch(`/api/referrals/stats?businessId=${businessId}`)
    const data = await res.json()
    setStats(data)
  }

  if (!stats) return null

  const cards = [
    {
      title: 'Total Referidos',
      value: stats.totalReferrals,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Referidos Activos',
      value: stats.successfulReferrals,
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Milestone Actual',
      value: `${stats.currentMilestone}/5`,
      icon: Trophy,
      color: 'text-yellow-600'
    },
    {
      title: 'Tasa de Conversión',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {card.value}
                </p>
              </div>
              <Icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
```

#### **`src/components/referrals/badges-showcase.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

export function BadgesShowcase({ businessId }: { businessId: string }) {
  const [badges, setBadges] = useState<any[]>([])

  useEffect(() => {
    fetchBadges()
  }, [businessId])

  const fetchBadges = async () => {
    const res = await fetch(`/api/referrals/stats?businessId=${businessId}`)
    const data = await res.json()
    setBadges(data.earnedBadges)
  }

  if (badges.length === 0) return null

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">🏆 Badges Desbloqueados</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge: any, index: number) => (
          <motion.div
            key={badge.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-800 dark:to-yellow-900 rounded-lg p-6 mb-2 shadow-lg">
              <div className="text-5xl mb-2">
                {badge.milestone.badge_icon}
              </div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {badge.milestone.badge_name}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {new Date(badge.claimed_at).toLocaleDateString()}
            </Badge>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
```

#### **`src/components/referrals/conversions-table.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ConversionsTable({ businessId }: { businessId: string }) {
  const [conversions, setConversions] = useState<any[]>([])

  useEffect(() => {
    fetchConversions()
  }, [businessId])

  const fetchConversions = async () => {
    const res = await fetch(`/api/referrals/stats?businessId=${businessId}`)
    const data = await res.json()
    setConversions(data.conversions)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary', label: 'Pendiente' },
      trial: { variant: 'outline', label: 'Prueba' },
      active: { variant: 'default', label: 'Activo' },
      churned: { variant: 'destructive', label: 'Cancelado' }
    }
    const config = variants[status as keyof typeof variants]
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  if (conversions.length === 0) {
    return (
      <Card className="p-6 text-center text-zinc-600 dark:text-zinc-400">
        Aún no tienes referidos. ¡Comparte tu código y empieza a ganar recompensas!
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Historial de Conversiones</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Negocio Referido</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha de Registro</TableHead>
            <TableHead>Fecha de Conversión</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conversions.map((conversion: any) => (
            <TableRow key={conversion.id}>
              <TableCell className="font-medium">
                {conversion.referred_business?.name || 'Pendiente de confirmación'}
              </TableCell>
              <TableCell>
                {getStatusBadge(conversion.status)}
              </TableCell>
              <TableCell>
                {new Date(conversion.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {conversion.converted_at
                  ? new Date(conversion.converted_at).toLocaleDateString()
                  : '-'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
```

---

## 📋 FASE 4: Integración con Signup Flow (1-2 días)

### 4.1 Modificar `src/app/(auth)/signup/page.tsx`

Agregar detección de referral code:

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignupPage() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')
  const [referrerInfo, setReferrerInfo] = useState<any>(null)

  useEffect(() => {
    if (refCode) {
      // Store in localStorage
      localStorage.setItem('referralCode', refCode)

      // Fetch referrer info for display
      fetchReferrerInfo(refCode)
    }
  }, [refCode])

  const fetchReferrerInfo = async (code: string) => {
    const res = await fetch(`/api/referrals/info?code=${code}`)
    if (res.ok) {
      const data = await res.json()
      setReferrerInfo(data)
    }
  }

  return (
    <div>
      {referrerInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            🎉 Referido por: <strong>{referrerInfo.businessName}</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Ambos recibirán beneficios al completar el registro
          </p>
        </div>
      )}

      {/* Rest of signup form */}
    </div>
  )
}
```

### 4.2 Hook post-signup para crear conversión

En el handler de signup exitoso:

```typescript
// After successful signup and business creation
const referralCode = localStorage.getItem('referralCode')

if (referralCode) {
  await fetch('/api/referrals/track-conversion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      referralCode,
      referredBusinessId: newBusinessId,
      status: 'pending',
    }),
  })

  localStorage.removeItem('referralCode')
}
```

### 4.3 Hook cuando el referido paga su primer mes

```typescript
// In payment success webhook or subscription activation
await fetch('/api/referrals/track-conversion', {
  method: 'POST',
  body: JSON.stringify({
    referralCode,
    referredBusinessId,
    status: 'active',
  }),
})

// This will trigger milestone check automatically
```

---

## 📋 FASE 5: Notificaciones (1 día)

### 5.1 Crear notificaciones en la tabla `notifications`

Triggers de notificación:

```typescript
// En track-conversion cuando status = 'active'
await supabase.from('notifications').insert({
  user_id: referrerUserId,
  type: 'referral_conversion',
  title: '🎉 ¡Referido Convertido!',
  message: `Tu referido ${businessName} acaba de activar su suscripción`,
  metadata: {
    referral_code: referralCode,
    referred_business_id: referredBusinessId,
  },
})
```

```typescript
// Cuando se alcanza nuevo milestone
await supabase.from('notifications').insert({
  user_id: businessOwnerId,
  type: 'milestone_achieved',
  title: '🏆 ¡Milestone Alcanzado!',
  message: `Has desbloqueado: ${milestone.reward_description}`,
  metadata: {
    milestone_number: milestoneNumber,
    reward_description: milestone.reward_description,
  },
})
```

---

## 📋 FASE 6: Super Admin Dashboard (2-3 días)

### 6.1 Vista Global del Programa (`src/app/(dashboard)/admin/referencias/page.tsx`)

**Propósito:** Monitorear el programa de referencias a nivel sistema para el dueño del SaaS.

**Componentes clave:**

#### **Dashboard Global Stats**

```typescript
// Stats globales a mostrar:
- Total de negocios en el programa
- Total de referencias generadas en el sistema
- Tasa de conversión global
- ROI del programa (revenue generado vs costo de recompensas)
- Negocios activos este mes
```

#### **Top Referrers Leaderboard**

```typescript
// Mostrar top 10-20 negocios que más refieren
- Ranking con medallas (🥇🥈🥉)
- Nombre del negocio + owner
- Total referidos vs convertidos
- Milestone actual
- Total en recompensas ganadas
- Badge alcanzado
```

#### **Program Health Metrics**

```typescript
const healthMetrics = {
  averageReferralsPerBusiness: number,
  topPerformerReferrals: number,
  medianConversionTime: number, // días
  churnRateOfReferrals: number, // %
}

// Con colores de status:
- Excellent: verde
- Good: azul
- Warning: amarillo
- Danger: rojo
```

#### **Milestone Distribution**

```typescript
// Visualización de cuántos negocios están en cada milestone
- Milestone 1: X negocios
- Milestone 2: Y negocios
- etc.
// Con progress bars para ver distribución visual
```

#### **Recent Conversions Table**

```typescript
// Tabla de conversiones recientes del sistema
- Quién refirió
- Negocio referido
- Fecha de registro
- Estado actual
- Valor mensual
```

#### **Insights Automáticos**

```typescript
// Sistema de insights que analiza:
1. ROI analysis: "Por cada $1 en recompensas, generas $X en revenue"
2. Power users: "Top 5 referidores representan el X% de conversiones"
3. Oportunidades: "X negocios están a 1-2 referidos del siguiente milestone"
4. Alertas: "Churn rate subió X% este mes"
```

### 6.2 API Routes para Super Admin

#### **`src/app/api/admin/referrals/global-stats/route.ts`**

```typescript
export async function GET(request: Request) {
  // Solo accesible por super admin
  // Return:
  {
    totalBusinessesInProgram: number,
    totalReferrals: number,
    successfulConversions: number,
    conversionRate: number,
    totalRewardsCost: number,
    totalRevenue: number,
    roi: number,
    activeThisMonth: number
  }
}
```

#### **`src/app/api/admin/referrals/leaderboard/route.ts`**

```typescript
export async function GET(request: Request) {
  // Return top referrers con stats completos
  // Soporta paginación y filtros
}
```

#### **`src/app/api/admin/referrals/health/route.ts`**

```typescript
export async function GET(request: Request) {
  // Return program health metrics
  // Análisis de performance del programa
}
```

### 6.3 Componentes UI para Admin

**Ver preview en:** `http://localhost:3000/admin-referencias-preview`

#### Estructura de componentes:

```
src/components/admin/referrals/
├── global-stats-cards.tsx
├── top-referrers-leaderboard.tsx
├── program-health-metrics.tsx
├── milestone-distribution.tsx
├── recent-conversions-table.tsx
└── insights-panel.tsx
```

### 6.4 Permisos y Seguridad

```typescript
// Verificar que solo super admin puede acceder
const isAdmin = user.role === 'admin' || user.email === process.env.ADMIN_EMAIL

if (!isAdmin) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

### 6.5 Analytics y Reporting

```typescript
// Funciones helper para calcular métricas:

calculateROI(totalRevenue, totalRewardsCost)
calculateConversionRate(successful, total)
identifyPowerUsers(referrers)
detectOpportunities(businesses, milestones)
analyzeChurnTrend(conversions, timeframe)
```

### 6.6 Configuración de Milestones (Admin Panel)

**Permitir al admin:**

- ✅ Editar valores de recompensas
- ✅ Activar/desactivar milestones
- ✅ Crear nuevos milestones
- ✅ Ver histórico de cambios

**Componente:** `MilestoneConfigPanel`

```typescript
// CRUD operations para milestones
- GET /api/admin/milestones
- PUT /api/admin/milestones/:id
- POST /api/admin/milestones
- DELETE /api/admin/milestones/:id (soft delete)
```

---

## 📋 FASE 7: Testing (1-2 días)

### Test Cases:

**Unit Tests:**

- ✅ Generación de códigos únicos
- ✅ Cálculo de milestones correctos
- ✅ Validación de rewards

**Integration Tests:**

- ✅ Flujo completo: signup con ref code → conversión → milestone
- ✅ Claim de rewards
- ✅ Actualización de stats

**E2E Tests (Playwright):**

```typescript
test('Referral flow completo', async ({ page }) => {
  // 1. Business A genera código
  // 2. Business B se registra con código
  // 3. Business A ve el referido pendiente
  // 4. Business B activa suscripción
  // 5. Business A recibe notificación
  // 6. Business A ve milestone desbloqueado
})
```

---

## 🎨 Diseño Visual

### Color Palette:

```css
/* Milestone Tiers */
.tier-bronze {
  @apply bg-amber-50 border-amber-200 text-amber-800;
}
.tier-silver {
  @apply bg-gray-50 border-gray-300 text-gray-800;
}
.tier-gold {
  @apply bg-yellow-50 border-yellow-300 text-yellow-800;
}
.tier-platinum {
  @apply bg-purple-50 border-purple-300 text-purple-800;
}
.tier-legendary {
  @apply bg-gradient-to-r from-purple-500 to-pink-500 text-white;
}
```

### Animaciones:

```typescript
// Confetti cuando se alcanza milestone
import confetti from 'canvas-confetti'

confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
})
```

---

## 📦 Dependencias

```bash
npm install qrcode react-qr-code
npm install framer-motion
npm install canvas-confetti
npm install @types/qrcode --save-dev
npm install @types/canvas-confetti --save-dev
```

---

## 🚀 Orden de Implementación

### Semana 1:

1. ✅ **Día 1-2:** FASE 1 - Database schema + seed
2. ✅ **Día 3-4:** FASE 2 - Backend API routes
3. ✅ **Día 5:** FASE 3.1 - Página básica

### Semana 2:

4. ✅ **Día 1-3:** FASE 3.2 - Componentes UI completos
5. ✅ **Día 4:** FASE 4 - Integración signup
6. ✅ **Día 5:** FASE 5 - Notificaciones

### Semana 3:

7. ✅ **Día 1-2:** FASE 6 - Super Admin Dashboard
8. ✅ **Día 3-4:** FASE 7 - Testing
9. ✅ **Día 5:** Polish & bug fixes

### Semana 4:

10. ✅ **Día 1-2:** QA final + docs
11. 🎉 **LAUNCH**

---

## 💡 Próximos Pasos

En la próxima sesión, ejecutar:

```bash
# Planificar implementación técnica detallada
/plan

# Empezar implementación
/create
```

---

## 📝 Notas Adicionales

### Consideraciones de Seguridad:

- ✅ RLS policies en todas las tablas
- ✅ Validación de ownership en APIs
- ✅ Rate limiting en generación de códigos
- ✅ Prevención de fraude (múltiples cuentas con mismo email)

### Escalabilidad:

- Índices en columnas frecuentemente consultadas
- Caching de milestones (raramente cambian)
- Paginación en tabla de conversiones

### Métricas a Trackear:

- Conversion rate por referrer
- Time to conversion
- Churn rate de referidos
- ROI del programa

---

## 🎨 Previews Creados

Para visualización y presentación, se han creado **2 vistas de preview** con datos de ejemplo:

### 1. Vista Cliente - Business Owner Dashboard

**Ruta:** `/referencias-preview`
**URL:** `http://localhost:3000/referencias-preview`

**Incluye:**

- ✅ Stats cards (Total, Activos, Milestone, Conversión)
- ✅ Código de referido + QR code
- ✅ Botones funcionales (Copiar código, Copiar link, Compartir WhatsApp)
- ✅ Progreso de milestones con barra animada
- ✅ 5 milestone cards (2 desbloqueados, 3 bloqueados)
- ✅ Badges showcase con animaciones
- ✅ Tabla de conversiones (5 referidos de ejemplo)
- ✅ Dark mode support
- ✅ Responsive design

### 2. Vista Super Admin - Dashboard Global

**Ruta:** `/admin-referencias-preview`
**URL:** `http://localhost:3000/admin-referencias-preview`

**Incluye:**

- ✅ Global stats (47 negocios, 156 referencias, ROI 348%)
- ✅ Top 5 referrers leaderboard
- ✅ Program health metrics (avg referidos, conversion time, churn)
- ✅ Milestone distribution (cuántos en cada nivel)
- ✅ Recent conversions table
- ✅ Insights automáticos (ROI analysis, power users, oportunidades)
- ✅ Dark mode support
- ✅ Responsive design

**Propósito de los previews:**

- Mostrar a stakeholders/socios
- Validar diseño antes de implementar
- Guía visual para desarrollo
- Demo para pitch/presentaciones

---

## 📊 Fases del Proyecto

| Fase | Nombre                       | Duración | Status       |
| ---- | ---------------------------- | -------- | ------------ |
| 1    | Database Schema              | 1-2 días | ⏳ Pendiente |
| 2    | Backend API Routes           | 2-3 días | ⏳ Pendiente |
| 3    | Frontend Dashboard (Cliente) | 3-4 días | ⏳ Pendiente |
| 4    | Integración Signup Flow      | 1-2 días | ⏳ Pendiente |
| 5    | Notificaciones               | 1 día    | ⏳ Pendiente |
| 6    | Super Admin Dashboard        | 2-3 días | ⏳ Pendiente |
| 7    | Testing & QA                 | 1-2 días | ⏳ Pendiente |

**Total estimado:** 3-4 semanas

---

**Estado:** ✅ Plan Completo + Previews Listos
**Última actualización:** 2026-02-01 7:05 PM
**Próxima acción:** `/plan` para implementación técnica → `/create` para empezar FASE 1
