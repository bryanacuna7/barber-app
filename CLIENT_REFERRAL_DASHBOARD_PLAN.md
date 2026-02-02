# 📋 Plan: Dashboard de Referidos para Clientes

**Fecha:** 2026-02-02
**Objetivo:** Crear dashboard para que clientes vean sus referidos y ganen rewards

---

## 🎯 Objetivo

Permitir que **clientes de una barbería** refieran a otros clientes y tracken sus referidos/rewards desde un dashboard visible.

**Problema actual:** El sistema de referidos cliente-a-cliente existe en el backend (tabla `client_referrals` + `client_loyalty_status.referral_code`), pero NO hay UI para que el cliente:

- Vea su código de referido
- Trackee cuántos amigos ha referido
- Vea qué rewards ha ganado

---

## 📊 Schema Actual (Ya existe)

### `client_loyalty_status`

```sql
CREATE TABLE client_loyalty_status (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  client_id UUID REFERENCES clients(id),
  user_id UUID REFERENCES auth.users(id),

  referral_code TEXT UNIQUE,  -- Código único del cliente
  points_balance INT DEFAULT 0,
  tier TEXT DEFAULT 'bronze',

  ...
)
```

### `client_referrals`

```sql
CREATE TABLE client_referrals (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  referrer_client_id UUID REFERENCES clients(id),  -- Quién refiere
  referred_client_id UUID REFERENCES clients(id),  -- Quién fue referido

  referral_code TEXT NOT NULL,
  status TEXT ('pending', 'completed', 'expired'),

  referrer_reward_claimed_at TIMESTAMPTZ,
  referred_reward_claimed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
```

### `loyalty_programs` (Config)

```sql
referralRewardType?: 'discount' | 'points' | 'free_service'
referralRewardAmount?: number  -- ej. 25 (25% o 25 puntos)
refereeRewardAmount?: number   -- Lo que recibe el referido
```

---

## 🚀 Implementación

### FASE 1: Backend APIs (3 endpoints)

#### 1.1 `GET /api/client-referrals/my-code`

**Propósito:** Obtener el código de referido del cliente autenticado

**Response:**

```typescript
{
  referralCode: string,        // ej. "BARBERSHOP_JUAN_A3F5"
  shareUrl: string,            // ej. "https://app.com/reservar/barbershop?ref=CODE"
  rewardInfo: {
    type: 'discount' | 'points' | 'free_service',
    amount: number,
    description: string        // ej. "Tú y tu amigo reciben 25% descuento"
  }
}
```

**Logic:**

```typescript
// 1. Auth check (get user)
// 2. Get client_id from clients table (user_id = auth.uid())
// 3. Get referral_code from client_loyalty_status
// 4. Get loyalty_programs config for reward info
// 5. Build shareUrl
```

---

#### 1.2 `GET /api/client-referrals/stats`

**Propósito:** Obtener stats de referidos del cliente

**Response:**

```typescript
{
  totalReferrals: number,      // Total de amigos referidos
  completedReferrals: number,  // Cuántos completaron su primera cita
  pendingReferrals: number,    // Registrados pero sin cita aún
  totalRewardsEarned: number,  // Total en rewards (puntos o descuentos)
  rewardsClaimed: number,      // Cuántas rewards ya usó
}
```

**Logic:**

```typescript
// 1. Get client_id from auth user
// 2. Count client_referrals WHERE referrer_client_id = client_id
// 3. Group by status (completed, pending)
// 4. Calculate rewards based on loyalty_programs config
```

---

#### 1.3 `GET /api/client-referrals/list`

**Propósito:** Lista de amigos referidos

**Response:**

```typescript
{
  referrals: [
    {
      id: string,
      referredName: string, // Nombre del amigo (opcional por privacidad)
      status: 'pending' | 'completed' | 'expired',
      createdAt: string,
      completedAt: string | null,
      rewardClaimed: boolean,
    },
  ]
}
```

**Logic:**

```typescript
// 1. Get client_id from auth user
// 2. SELECT from client_referrals WHERE referrer_client_id = client_id
// 3. JOIN with clients to get referred name (opcional)
// 4. ORDER BY created_at DESC
```

---

### FASE 2: Frontend Components (4 componentes)

#### 2.1 `ClientReferralCodeCard.tsx`

**Ubicación:** `src/components/client-referrals/client-referral-code-card.tsx`

**Features:**

- Muestra código de referido del cliente
- Botón "Copiar Código"
- Botón "Compartir por WhatsApp" (con mensaje pre-armado)
- Info de qué reward ganan ambos

**Diseño:**

```
┌─────────────────────────────────┐
│  🎁 Refiere y Gana              │
│                                 │
│  Tu Código:                     │
│  ┌─────────────────────────┐   │
│  │  BARBERSHOP_JUAN_A3F5   │   │
│  └─────────────────────────┘   │
│                                 │
│  [📋 Copiar] [💬 WhatsApp]     │
│                                 │
│  💡 Tú y tu amigo reciben       │
│     25% de descuento            │
└─────────────────────────────────┘
```

---

#### 2.2 `ClientReferralStats.tsx`

**Ubicación:** `src/components/client-referrals/client-referral-stats.tsx`

**Features:**

- 3-4 stat cards animadas
- Total referidos, Completados, Rewards ganadas

**Diseño:**

```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Total   │ │ Activos │ │ Rewards │
│   5     │ │   3     │ │  75 pts │
└─────────┘ └─────────┘ └─────────┘
```

---

#### 2.3 `ClientReferralsTable.tsx`

**Ubicación:** `src/components/client-referrals/client-referrals-table.tsx`

**Features:**

- Tabla de referidos (nombre opcional, status, fecha)
- Badge de status (pending/completed)
- Empty state si no tiene referidos

**Diseño:**

```
┌────────────────────────────────────────┐
│ Amigo       Status      Fecha         │
├────────────────────────────────────────┤
│ Juan P.     ✅ Activo   Hace 2 días   │
│ María G.    ⏳ Pendiente Hace 5 días   │
└────────────────────────────────────────┘
```

---

#### 2.4 `RewardsInfoBanner.tsx`

**Ubicación:** `src/components/client-referrals/rewards-info-banner.tsx`

**Features:**

- Banner con info de cómo funciona el programa
- Qué rewards pueden ganar
- Cómo funciona el proceso

**Diseño:**

```
┌─────────────────────────────────────────┐
│ 📱 ¿Cómo funciona?                      │
│                                         │
│ 1. Comparte tu código                   │
│ 2. Tu amigo agenda su primera cita      │
│ 3. ¡Ambos ganan 25% descuento!          │
└─────────────────────────────────────────┘
```

---

### FASE 3: Ruta y Página Principal

#### 3.1 Nueva ruta: `/referidos` (dentro del dashboard de cliente)

**Ubicación:** `src/app/(client-dashboard)/referidos/page.tsx`

**Estructura:**

```typescript
export default async function ClientReferralsPage() {
  // 1. Auth check (cliente debe tener cuenta)
  // 2. Verificar que existe client record con user_id
  // 3. Fetch data (código, stats, lista)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1>🎁 Refiere y Gana</h1>
        <p>Invita a tus amigos y gana recompensas</p>
      </div>

      {/* Rewards Info Banner */}
      <RewardsInfoBanner />

      {/* Stats Cards */}
      <ClientReferralStats />

      {/* Grid: Code + Table */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ClientReferralCodeCard />
        </div>
        <div className="lg:col-span-2">
          <ClientReferralsTable />
        </div>
      </div>
    </div>
  )
}
```

---

## 🔗 Integración con Navegación

### Sidebar del Cliente

Agregar link "Referidos" en el sidebar si el cliente está logueado.

**Condición:** Solo mostrar si:

- Cliente tiene cuenta (user_id no null)
- Loyalty program tiene `referral` o `hybrid` program type

---

## 🧪 Testing

### Test Cases:

1. ✅ Cliente sin código de referido → genera automáticamente
2. ✅ Cliente copia código → clipboard funciona
3. ✅ Cliente comparte por WhatsApp → mensaje correcto
4. ✅ Cliente ve stats correctas (total, completed, pending)
5. ✅ Cliente ve tabla de referidos con nombres/status
6. ✅ Empty state si no tiene referidos
7. ✅ Rewards info muestra config correcta del loyalty program

---

## 📦 Archivos a Crear

### Backend (3 archivos)

- `src/app/api/client-referrals/my-code/route.ts` (~80 líneas)
- `src/app/api/client-referrals/stats/route.ts` (~100 líneas)
- `src/app/api/client-referrals/list/route.ts` (~80 líneas)

### Frontend (5 archivos)

- `src/app/(client-dashboard)/referidos/page.tsx` (~150 líneas)
- `src/components/client-referrals/client-referral-code-card.tsx` (~100 líneas)
- `src/components/client-referrals/client-referral-stats.tsx` (~80 líneas)
- `src/components/client-referrals/client-referrals-table.tsx` (~120 líneas)
- `src/components/client-referrals/rewards-info-banner.tsx` (~60 líneas)

**Total:** ~770 líneas de código

---

## ⚠️ Consideraciones Importantes

### 1. Privacidad

- NO mostrar información sensible de los referidos (teléfono, email)
- Solo mostrar nombre de pila o iniciales

### 2. Permisos

- Solo clientes con cuenta (user_id) pueden ver su dashboard
- RLS policies ya existen en `client_referrals` table

### 3. Rewards

- Los rewards se aplican automáticamente según `loyalty_programs` config
- No requiere "claim" manual, se otorgan al completar cita

### 4. UX

- Mensajes claros sobre cómo funciona
- Empty states bien diseñados
- Animaciones sutiles para engagement

---

## 🚀 Orden de Implementación

### Sprint 1 (2-3 horas):

1. ✅ Crear 3 API routes
2. ✅ Testing de APIs (Postman o curl)

### Sprint 2 (2-3 horas):

3. ✅ Crear 4 componentes frontend
4. ✅ Crear página `/referidos`

### Sprint 3 (1 hora):

5. ✅ Integrar link en sidebar
6. ✅ Testing end-to-end
7. ✅ Visual verification con Playwright

---

## 📝 Notas Adicionales

### Mejoras Futuras (Opcional):

- QR code para compartir (similar a business referrals)
- Leaderboard de "Top Referrers" dentro del negocio
- Notificaciones push cuando un referido completa su cita
- Historial de rewards claimed
- Integración con Instagram/Facebook sharing

---

**Estado:** 📋 Plan Completo - Listo para implementar
**Próxima acción:** `/create` para empezar Sprint 1 (APIs)
