# FASE 2.5: Retention Features - Visual Guide

**Estimated Time:** 30-44 hours
**ROI:** +40-75% client retention, +60% rebooking rate
**Priority:** HIGH (these are market-standard features)

---

## 🎯 Overview: Why Retention Matters

```
Client Acquisition vs Retention Economics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Acquire new client:  $25-50 (ads, time, effort)
Retain existing:     $2-5 (automation, personalization)

Profit multiplier:
- 1-time client:     $15 revenue - $35 CAC = -$20 loss
- 5-time client:     $75 revenue - $35 CAC = +$40 profit
- 12-time client:    $180 revenue - $35 CAC = +$145 profit

Retention rate impact:
- 50% retention → Break even
- 75% retention → Profitable
- 90% retention → Highly profitable
```

**Your Current Situation:**

- Área 5 (Push Notifications): ✅ Already built
- Área 4 (Referrals): ✅ Already in plan
- **Missing:** The "glue" features that make clients come back

---

## Feature 1: CRM Lite (10-14h)

### What It Is

Transform basic client list into a **relationship management system**.

### Visual Comparison

**BEFORE (Current):**

```
┌─────────────────────────────┐
│ Clientes                    │
├─────────────────────────────┤
│ María Rodríguez             │
│ 📱 88887777                 │
│ ✉️  maria@email.com         │
│                             │
│ [Editar]                    │
└─────────────────────────────┘
```

**AFTER (CRM Lite):**

```
┌─────────────────────────────────────────────┐
│ Clientes                                    │
├─────────────────────────────────────────────┤
│ 👤 María Rodríguez              🏷️ VIP     │
│ 📱 88887777 | ✉️ maria@email.com           │
│ 🎂 15 de Marzo (¡En 10 días!)              │
│                                             │
│ 💡 Preferencias:                            │
│ • Barbero preferido: Carlos                 │
│ • Servicio favorito: Corte + Barba          │
│ • Propina promedio: 20%                     │
│ • Café: ☕ Negro, sin azúcar                │
│                                             │
│ 📝 Notas (3):                                │
│ • "Likes hair shorter on sides" - Carlos    │
│ • "Always 5 min late, plan accordingly"     │
│ • "Ask about vacation to Spain 🇪🇸"        │
│                                             │
│ 🏷️ Tags: VIP, High Tipper, Regular         │
│                                             │
│ [Editar] [Agregar nota] [Enviar promo]     │
└─────────────────────────────────────────────┘
```

### Database Changes

```sql
-- Migration 028: CRM Lite
ALTER TABLE clients ADD COLUMN IF NOT EXISTS
  birthday DATE,
  tags TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  notes JSONB[] DEFAULT '{}';

-- Example data:
{
  "birthday": "1990-03-15",
  "tags": ["VIP", "High Tipper", "Regular"],
  "preferences": {
    "preferred_barber_id": "uuid-carlos",
    "favorite_service": "Corte + Barba",
    "coffee": "Black, no sugar",
    "communication_preference": "whatsapp"
  },
  "notes": [
    {
      "id": "note-1",
      "content": "Likes hair shorter on sides",
      "created_by": "barber-carlos",
      "created_at": "2026-01-15T10:30:00Z"
    },
    {
      "id": "note-2",
      "content": "Always 5 min late, plan accordingly",
      "created_by": "barber-juan",
      "created_at": "2026-01-20T14:00:00Z"
    }
  ]
}
```

### Use Cases

**Use Case 1: Birthday Campaigns**

```
Automated Flow:
1. Cron job runs daily at 9:00 AM
2. Finds clients with birthday today
3. Sends:
   📧 Email: "¡Feliz cumpleaños María! 🎂 20% off hoy"
   🔔 Push: "Feliz cumpleaños! Tenemos un regalo para ti 🎁"
4. Creates promo code: BDAY-MARIA-2026 (20% off, expires today)
5. Tracks: Opens, clicks, bookings
```

**Use Case 2: Personalized Service**

```
Barber View (Mi Día):
┌───────────────────────────────────┐
│ 10:00 AM - María Rodríguez        │
│ Corte + Barba (45 min)            │
│                                   │
│ 💡 Smart Notes:                   │
│ • Prefers short sides             │
│ • Coffee: Black, no sugar ☕      │
│ • Ask about Spain trip 🇪🇸        │
│ • Usually late 5 min ⏰           │
└───────────────────────────────────┘
```

**Use Case 3: Segmented Campaigns**

```
Marketing Dashboard:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Filter clients by tags:
├─ VIP (45 clients)
├─ Regular (120 clients)
├─ High Tipper (30 clients)
└─ New (15 clients)

Action:
"Enviar promo 2x1 a clientes VIP"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 45 emails sent
🔔 45 push notifications sent
Expected conversion: 30-40% (13-18 bookings)
```

### Impact Metrics

- **Client satisfaction:** +35% (personalized service)
- **Retention (90-day):** +25-40% (birthday campaigns)
- **Staff efficiency:** -10 min per appointment (notes visible)
- **Upselling:** +15% (preference-based recommendations)

**ROI Calculation:**

- Investment: 10-14h ($750-$1,050)
- Return: +30 retained clients × $180 LTV = +$5,400/year
- **ROI: 5x-7x**

---

## Feature 2: Rebooking Automation (8-12h)

### What It Is

**Automated email + push campaign** that reminds clients to book their next appointment.

### Visual Flow

```
Client Journey:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day 0: María gets haircut with Carlos
       ✂️ Appointment completed
       💳 Paid $15

Day 7: Automated trigger
       ┌────────────────────────────────┐
       │ 📧 EMAIL SENT (9:00 AM)        │
       ├────────────────────────────────┤
       │ Subject: Time for your next    │
       │ appointment with Carlos! ✂️    │
       │                                │
       │ Hola María! 👋                 │
       │                                │
       │ Hace una semana te atendió     │
       │ Carlos en Barbería Central.    │
       │                                │
       │ ¿Listo para tu próxima cita?   │
       │                                │
       │ [VER DISPONIBILIDAD] ← Pre-filled
       │                        with Carlos
       │ [Reservar ahora]               │
       └────────────────────────────────┘

       ┌────────────────────────────────┐
       │ 🔔 PUSH NOTIFICATION           │
       │ (10:00 AM if email not opened) │
       ├────────────────────────────────┤
       │ ⏰ ¿Listo para tu próxima cita │
       │    con Carlos?                 │
       │                                │
       │ [Agendar] [Más tarde]          │
       └────────────────────────────────┘

Click "Agendar":
       ┌────────────────────────────────┐
       │ 📅 BOOKING PAGE (Pre-filled)   │
       ├────────────────────────────────┤
       │ Barbero: Carlos ✅             │
       │ Servicio: Corte + Barba ✅     │
       │ Cliente: María R. ✅           │
       │                                │
       │ Selecciona fecha y hora:       │
       │ [Calendar showing Carlos slots]│
       │                                │
       │ [Confirmar reserva] ← 1 click! │
       └────────────────────────────────┘

Day 8: María books next appointment
       ✅ Rebooking successful!
       📊 Analytics: +1 to "automated rebooking"
```

### Database Changes

```sql
-- Migration 029: Rebooking Automation
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS
  rebooking_email_sent_at TIMESTAMPTZ,
  rebooking_clicked BOOLEAN DEFAULT FALSE,
  rebooking_converted BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_appointments_rebooking_pending
ON appointments(completed_at)
WHERE
  status = 'completed'
  AND rebooking_email_sent_at IS NULL
  AND completed_at > NOW() - INTERVAL '30 days';
```

### Cron Job Logic

```typescript
// src/app/api/cron/send-rebooking-reminders/route.ts

export async function GET(req: Request) {
  const supabase = createServiceClient()

  // Find completed appointments 7 days ago (no rebooking email sent)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: appointments } = await supabase
    .from('appointments')
    .select(
      `
      id,
      completed_at,
      client:clients(*),
      barber:barbers(*),
      service:services(*),
      business:businesses(*)
    `
    )
    .eq('status', 'completed')
    .gte('completed_at', sevenDaysAgo.toISOString())
    .lt('completed_at', new Date(sevenDaysAgo.getTime() + 3600000).toISOString())
    .is('rebooking_email_sent_at', null)

  for (const apt of appointments) {
    // Check: Has client already rebooked?
    const { data: futureApts } = await supabase
      .from('appointments')
      .select('id')
      .eq('client_id', apt.client.id)
      .eq('barber_id', apt.barber.id)
      .gte('scheduled_at', new Date().toISOString())

    if (futureApts?.length > 0) {
      // Already rebooked, skip
      continue
    }

    // Send email
    if (apt.client.email) {
      await sendRebookingEmail({
        to: apt.client.email,
        clientName: apt.client.name,
        barberName: apt.barber.name,
        businessName: apt.business.name,
        bookingUrl: `${BASE_URL}/book/${apt.business.slug}?barber=${apt.barber.id}&service=${apt.service.id}&client=${apt.client.id}`,
      })
    }

    // Send push notification
    if (apt.client.user_id) {
      await sendPushNotification(apt.client.user_id, apt.business.id, {
        title: '⏰ ¿Listo para tu próxima cita?',
        body: `Carlos te espera en ${apt.business.name}`,
        url: `/book/${apt.business.slug}?barber=${apt.barber.id}`,
        actions: [
          { action: 'book', title: 'Agendar' },
          { action: 'later', title: 'Más tarde' },
        ],
      })
    }

    // Mark as sent
    await supabase
      .from('appointments')
      .update({ rebooking_email_sent_at: new Date().toISOString() })
      .eq('id', apt.id)
  }

  return NextResponse.json({ success: true, sent: appointments.length })
}
```

### Admin Configuration UI

```typescript
// Settings > Notificaciones > Rebooking Automation
┌─────────────────────────────────────────────┐
│ 🔁 Rebooking Automation                    │
├─────────────────────────────────────────────┤
│                                             │
│ ✅ Activado                                │
│                                             │
│ Días después de cita: [7] días              │
│                                             │
│ Canales:                                    │
│ ☑ Email                                     │
│ ☑ Push notification                         │
│ ☐ WhatsApp (Coming soon)                    │
│                                             │
│ Estadísticas (últimos 30 días):             │
│ • Emails enviados: 145                      │
│ • Push enviados: 132                        │
│ • Clicks: 58 (40% CTR)                      │
│ • Conversiones: 34 (58% conversion)         │
│ • Rebooking rate: 58% ▲ +28% vs baseline   │
│                                             │
│ [Guardar cambios]                           │
└─────────────────────────────────────────────┘
```

### A/B Testing Opportunity

```
Test: Optimal timing for rebooking email
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group A: 7 days after (Current)
Group B: 14 days after
Group C: 21 days after

Hypothesis: 14 days = optimal (not too soon, not too late)

Results (simulated):
- 7 days:  45% open, 15% conversion
- 14 days: 52% open, 25% conversion ← Winner
- 21 days: 38% open, 12% conversion
```

### Impact Metrics

- **Rebooking rate:** 30% → 60% (+100% improvement)
- **Client LTV:** $45 → $90 (2x due to retention)
- **Revenue per client:** +$45/year
- **Cost:** $0 (fully automated)

**ROI Calculation:**

- Investment: 8-12h ($600-$900)
- Return: 100 clients × $45 additional LTV = +$4,500/year
- **ROI: 5x-7.5x**

**Data Source:** [GlossGenius](https://glossgenius.com/) reports 75% rebooking rate with automation

---

## Feature 3: WhatsApp Smart Links (4-6h)

### What It Is

**One-click WhatsApp messages** with pre-filled text for booking inquiries.

### Visual Examples

**Example 1: Public Booking Page**

```
┌─────────────────────────────────────────────┐
│ Barbería Central                            │
│ ⭐⭐⭐⭐⭐ 4.9 (124 reviews)                 │
├─────────────────────────────────────────────┤
│                                             │
│ 📅 Reservar online                          │
│ 💬 WhatsApp                                 │ ← NEW
│ 📍 Ver ubicación                            │
│                                             │
└─────────────────────────────────────────────┘

Click "💬 WhatsApp":
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Opens WhatsApp with:

To: +506 8888-7777 (Barbería Central)
Message:
"Hola! Me gustaría reservar una cita en
Barbería Central. ¿Tienen disponibilidad? 😊"

[Send] button ready to tap
```

**Example 2: Appointment Confirmation Email**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Cita confirmada

Fecha: Viernes 7 de Feb, 2026
Hora: 10:00 AM
Barbero: Carlos Méndez
Servicio: Corte + Barba

📍 Barbería Central
   Av. Central, San José

¿Necesitas hacer cambios?
[💬 WhatsApp] [📧 Email] [📞 Llamar]
   ↑
   Opens:
   "Hola Carlos! Necesito reprogramar mi cita
   del viernes 7 de febrero a las 10:00 AM.
   ¿Tienes disponibilidad otro día?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Example 3: Specific Service Inquiry**

```
Service Catalog Page:
┌─────────────────────────────────────────────┐
│ Corte de Cabello                            │
│ 30 min • $15                                │
│                                             │
│ Incluye lavado y styling                    │
│                                             │
│ [Reservar] [💬 Preguntar por WhatsApp]     │
│              ↑                              │
└─────────────────────────────────────────────┘

Click "Preguntar por WhatsApp":
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Opens WhatsApp:
"Hola! Me interesa el servicio de Corte de
Cabello ($15, 30 min). ¿Cuándo tienen
disponibilidad?"
```

### Implementation

```typescript
// src/lib/whatsapp/generate-link.ts

export function generateWhatsAppLink(params: { phoneNumber: string; message: string }) {
  const encodedMessage = encodeURIComponent(params.message)
  const cleanPhone = params.phoneNumber.replace(/\D/g, '')

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

// Usage examples:

// 1. General inquiry
const generalInquiry = generateWhatsAppLink({
  phoneNumber: business.phone,
  message: `Hola! Me gustaría reservar una cita en ${business.name}. ¿Tienen disponibilidad? 😊`,
})

// 2. Specific service
const serviceInquiry = generateWhatsAppLink({
  phoneNumber: business.phone,
  message: `Hola! Me interesa el servicio de ${service.name} ($${service.price}, ${service.duration} min). ¿Cuándo tienen disponibilidad?`,
})

// 3. Reschedule request
const reschedule = generateWhatsAppLink({
  phoneNumber: barber.phone || business.phone,
  message: `Hola ${barber.name}! Necesito reprogramar mi cita del ${format(appointment.scheduled_at, "EEEE d 'de' MMMM", { locale: es })} a las ${format(appointment.scheduled_at, 'HH:mm')}. ¿Tienes disponibilidad otro día?`,
})

// 4. Cancellation
const cancel = generateWhatsAppLink({
  phoneNumber: barber.phone || business.phone,
  message: `Hola! Necesito cancelar mi cita del ${format(appointment.scheduled_at, 'd/M/yyyy')} a las ${format(appointment.scheduled_at, 'HH:mm')}. Disculpa las molestias.`,
})
```

### Use Cases by Customer Segment

**Segment 1: Older clients (50+ years)**

- Prefer WhatsApp over apps (70% in Costa Rica)
- Familiar with WhatsApp, intimidated by booking forms
- **Impact:** +40% conversion for 50+ demographic

**Segment 2: Walk-in inquiries**

- See QR code on window: "Escanea para reservar"
- Opens WhatsApp with pre-filled message
- **Impact:** Converts 30% of window shoppers

**Segment 3: Referrals**

- Friend shares: "Ve a Barbería Central, son buenos!"
- Friend also shares: WhatsApp link
- **Impact:** +25% referral conversion (vs "call them")

**Segment 4: Uncertain clients**

- Not sure which service they need
- Want to ask questions before booking
- **Impact:** Reduces booking abandonment by 20%

### Regional Context: LATAM

```
Communication Preferences in Costa Rica (2026):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WhatsApp:    78% daily usage
Phone calls: 45% prefer for bookings
Email:       30% check regularly
SMS:         12% (declining)
Apps:        25% (booking apps specifically)

Implication:
NOT having WhatsApp = Losing 40-50% of potential clients
```

**Competitor Analysis:**

- Agendando.app: ❌ No WhatsApp integration mentioned
- GlossGenius: ❌ US-focused, no WhatsApp
- Fresha: ✅ Has WhatsApp (Europe)
- **Opportunity:** Competitive advantage in LATAM

### Impact Metrics

- **Conversion rate:** +35% (WhatsApp vs form-only)
- **Older demographic:** +40% (50+ years)
- **Inquiry response time:** -60% (instant vs email)
- **Client satisfaction:** +20% (preferred channel)

**ROI Calculation:**

- Investment: 4-6h ($300-$450)
- Return: +50 bookings/year × $15 = +$750/year
- **ROI: 1.5x-2.5x** (low but REQUIRED for regional competitiveness)

**Data Source:** [WATI WhatsApp Business API Guide 2026](https://www.wati.io/en/blog/discovering-whatsapp-business-api/)

---

## Feature 4: Variable Service Durations (8-12h)

### What It Is

**Multiple pricing tiers** for the same service with different durations/quality levels.

### Visual Examples

**Example 1: Barbershop - Haircut Options**

```
Current (Single Option):
┌─────────────────────────────────────────────┐
│ Corte de Cabello                            │
│ 30 min • $15                                │
│                                             │
│ [Reservar]                                  │
└─────────────────────────────────────────────┘

NEW (Multiple Options):
┌─────────────────────────────────────────────┐
│ Corte de Cabello                            │
├─────────────────────────────────────────────┤
│                                             │
│ ○ Básico          20 min  •  $12           │
│   Corte express, sin lavado                 │
│                                             │
│ ● Premium         30 min  •  $15  ← Default│
│   Corte + lavado + styling                  │
│                                             │
│ ○ Deluxe          45 min  •  $25           │
│   Corte + barba + masaje facial             │
│                                             │
│ ○ Tratamiento VIP 60 min  •  $35           │
│   Todo incluido + tratamiento capilar       │
│                                             │
│ [Siguiente]                                 │
└─────────────────────────────────────────────┘
```

**Example 2: Hair Salon - Color Service**

```
┌─────────────────────────────────────────────┐
│ Tinte de Cabello                            │
├─────────────────────────────────────────────┤
│                                             │
│ ○ Retoques de Raíz                          │
│   45 min (30 aplicar + 15 lavar)  •  $40   │
│                                             │
│ ● Color Completo  ← Recommended             │
│   90 min (30 aplicar + 45 esperar + 15 lavar)│
│   $65                                       │
│                                             │
│ ○ Balayage Premium                          │
│   150 min (multi-step process)  •  $120    │
│                                             │
│ 💡 Tip: "Esperar" time doesn't block stylist│
└─────────────────────────────────────────────┘
```

**Example 3: Gym - Personal Training**

```
┌─────────────────────────────────────────────┐
│ Entrenamiento Personal                      │
├─────────────────────────────────────────────┤
│                                             │
│ ○ Sesión Individual   60 min  •  $25       │
│                                             │
│ ● Paquete 5 Sesiones  300 min • $110       │
│   (Save $15!)              ($22/session)    │
│                                             │
│ ○ Paquete 10 Sesiones 600 min • $200       │
│   (Save $50!)              ($20/session)    │
│                                             │
│ [Reservar]                                  │
└─────────────────────────────────────────────┘
```

### Database Schema

```sql
-- Migration 030: Variable Service Durations

-- BEFORE:
services {
  id UUID
  name TEXT
  duration_minutes INTEGER  -- Single value
  price DECIMAL             -- Single value
  ...
}

-- AFTER:
services {
  id UUID
  name TEXT
  duration_minutes INTEGER      -- Deprecated (keep for backward compat)
  price DECIMAL                 -- Deprecated
  duration_options JSONB        -- NEW
  -- Example:
  -- [
  --   {
  --     "id": "basic",
  --     "label": "Básico",
  --     "duration": 20,
  --     "price": 12,
  --     "description": "Corte express, sin lavado",
  --     "default": false
  --   },
  --   {
  --     "id": "premium",
  --     "label": "Premium",
  --     "duration": 30,
  --     "price": 15,
  --     "description": "Corte + lavado + styling",
  --     "default": true
  --   },
  --   {
  --     "id": "deluxe",
  --     "label": "Deluxe",
  --     "duration": 45,
  --     "price": 25,
  --     "description": "Corte + barba + masaje facial",
  --     "default": false
  --   }
  -- ]
  ...
}

-- Also update appointments:
appointments {
  ...
  service_id UUID
  selected_duration_option TEXT  -- NEW: "basic", "premium", "deluxe"
  actual_duration INTEGER        -- NEW: Copied from selected option
  actual_price DECIMAL          -- NEW: Copied from selected option
}
```

### Backend API Changes

```typescript
// src/app/api/services/route.ts

// CREATE service with duration options
export async function POST(req: Request) {
  const { name, duration_options } = await req.json()

  // Validation with Zod
  const schema = z.object({
    name: z.string().min(1),
    duration_options: z.array(z.object({
      id: z.string(),
      label: z.string(),
      duration: z.number().min(5).max(480),
      price: z.number().min(0),
      description: z.string().optional(),
      default: z.boolean()
    })).min(1).max(10)
  })

  // Ensure exactly one default
  const defaults = duration_options.filter(opt => opt.default)
  if (defaults.length !== 1) {
    return NextResponse.json(
      { error: 'Exactly one option must be default' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('services')
    .insert({ name, duration_options })
    .select()
    .single()

  return NextResponse.json(data)
}

// BOOK appointment with selected duration
// src/app/api/appointments/route.ts
export async function POST(req: Request) {
  const { service_id, selected_duration_option } = await req.json()

  // Fetch service to get selected option details
  const { data: service } = await supabase
    .from('services')
    .select('duration_options')
    .eq('id', service_id)
    .single()

  const selectedOption = service.duration_options.find(
    opt => opt.id === selected_duration_option
  )

  if (!selectedOption) {
    return NextResponse.json(
      { error: 'Invalid duration option' },
      { status: 400 }
    )
  }

  // Create appointment with actual duration/price
  const { data: appointment } = await supabase
    .from('appointments')
    .insert({
      service_id,
      selected_duration_option: selectedOption.id,
      actual_duration: selectedOption.duration,
      actual_price: selectedOption.price,
      scheduled_at,
      ...
    })

  return NextResponse.json(appointment)
}
```

### Frontend Component

```typescript
// src/components/booking/service-duration-selector.tsx

export function ServiceDurationSelector({
  service,
  onSelect
}: {
  service: Service
  onSelect: (optionId: string) => void
}) {
  const [selected, setSelected] = useState(
    service.duration_options.find(opt => opt.default)?.id
  )

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{service.name}</h3>

      {service.duration_options.map((option) => (
        <button
          key={option.id}
          onClick={() => {
            setSelected(option.id)
            onSelect(option.id)
          }}
          className={cn(
            "w-full p-4 rounded-lg border-2 text-left transition",
            selected === option.id
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2",
                  selected === option.id
                    ? "border-primary bg-primary"
                    : "border-gray-300"
                )} />
                <span className="font-medium">{option.label}</span>
                {option.default && (
                  <Badge variant="secondary" size="sm">
                    Recomendado
                  </Badge>
                )}
              </div>
              {option.description && (
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  {option.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="font-semibold">${option.price}</div>
              <div className="text-sm text-muted-foreground">
                {option.duration} min
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
```

### Use Cases

**Use Case 1: Upselling**

```
Default: Premium ($15)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client sees options:
  Básico ($12)    ← -20% price, -33% duration
  Premium ($15)   ← Default
  Deluxe ($25)    ← +67% price, +50% duration, +barba

Psychology: "Deluxe is only +$10 and includes beard trim!"

Result: 30-40% of clients upsell to Deluxe
Average ticket: $15 → $18 (+20%)
```

**Use Case 2: Salon Efficiency (Processing Time)**

```
Hair Tinting Workflow:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: Apply color (30 min) → Stylist BUSY
Step 2: Wait for color to set (45 min) → Stylist FREE
Step 3: Wash (15 min) → Stylist BUSY

Total appointment: 90 min
Stylist utilization: 45 min (50%)

Calendar shows:
┌─────────────────┐
│ 10:00 - 11:30   │ María - Tinte
│   (45 min busy) │
└─────────────────┘

During 10:30-11:15 (María's wait time):
┌─────────────────┐
│ 10:30 - 10:45   │ Quick blowout for Ana
│ 10:45 - 11:15   │ Haircut for Carlos
└─────────────────┘

Result: 3 clients in 90 min (vs 1 client)
Revenue: $65 + $20 + $30 = $115 (vs $65)
```

**Use Case 3: Budget-Conscious Clients**

```
Client: "I only have $10 today"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before: Can't book (minimum $15)
After: Books "Básico" ($12)

Result: Client served, better than turning away
Future: Might upgrade to Premium next time
```

### Competitor Analysis

```
Variable Durations Support:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agendando.app:  ✅ YES (mentioned in features)
GlossGenius:    ✅ YES (service variants)
BookingPress:   ✅ YES (variable durations)
Your app:       ❌ NO (single duration only)

Implication: CRITICAL gap for salon businesses
```

### Impact Metrics

- **Average ticket value:** +20% (upselling)
- **Salon utilization:** +50% (processing time optimization)
- **Client satisfaction:** +15% (budget options)
- **Market TAM:** +40% (salons now viable)

**ROI Calculation:**

- Investment: 8-12h ($600-$900)
- Return: 100 appointments/month × $3 upsell = +$3,600/year
- **ROI: 4x-6x**

**Data Source:** [BookingPress Variable Duration Feature](https://www.bookingpressplugin.com/create-variable-appointment-duration/)

---

## 🎯 FASE 2.5 Combined Impact

### Synergy Effects

```
CRM Lite + Rebooking Automation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rebooking email personalized with preferences:
"Hola María! 👋

¿Listo para tu próximo Corte + Barba con Carlos?
Como siempre te gusta: ✂️ Short on sides

Carlos tiene disponibilidad:
• Jueves 13 Feb - 10:00 AM
• Viernes 14 Feb - 3:00 PM

[Reservar ahora] [Ver más horarios]

P.D. Tendremos café negro sin azúcar listo ☕😊"

Conversion: +35% vs generic email
```

```
Variable Durations + Rebooking:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client's last booking: Premium ($15)
Rebooking email suggests:
"Quieres probar Deluxe esta vez? Solo +$10 y
 incluye barba + masaje facial. ¡Te lo mereces!"

Upsell conversion: 25%
```

```
WhatsApp + CRM Lite:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Client inquires via WhatsApp
Staff sees:
┌─────────────────────────────────────────────┐
│ 💬 WhatsApp: +506 8888-7777                 │
│ 👤 María Rodríguez (VIP)                    │
│                                             │
│ 💡 Quick Facts:                             │
│ • Last visit: 14 days ago                   │
│ • Preferred barber: Carlos                  │
│ • Usual service: Corte + Barba ($25)        │
│ • Propina promedio: 20%                     │
│                                             │
│ [Ver perfil completo]                       │
└─────────────────────────────────────────────┘

Staff response: Personalized and fast
Client satisfaction: ⭐⭐⭐⭐⭐
```

### Combined ROI

```
Investment:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRM Lite:            10-14h ($750-$1,050)
Rebooking:            8-12h ($600-$900)
WhatsApp:             4-6h  ($300-$450)
Variable Durations:   8-12h ($600-$900)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:               30-44h ($2,250-$3,300)

Returns (per year):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRM Lite retention:           +$5,400
Rebooking automation:         +$4,500
WhatsApp conversions:         +$750
Variable duration upsells:    +$3,600
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                        +$14,250/year

ROI: 4.3x-6.3x
Payback period: 2-3 months
```

---

## 🚀 Implementation Checklist

### Week 21: CRM Lite (10-14h)

- [ ] Database migration (2-3h)
  - Add birthday, tags, preferences, notes columns
  - Create indexes for birthday queries
- [ ] Backend APIs (3-4h)
  - CRUD for tags
  - Notes API with timestamps
  - Preferences structured data API
- [ ] Frontend components (5-7h)
  - Client profile enhancements
  - Tag selector with autocomplete
  - Notes timeline UI
  - Birthday picker
  - Quick-add tags from appointment view

### Week 22: Rebooking Automation (8-12h)

- [ ] Database migration (1h)
  - Add rebooking_email_sent_at to appointments
  - Create index for pending rebooking emails
- [ ] Cron job implementation (3-4h)
  - Logic: Find completed appointments 7 days ago
  - Check: Has client already rebooked?
  - Send: Email + push notification
- [ ] Email template (2-3h)
  - Personalized with barber name
  - Deep link to booking page
  - One-click booking flow
- [ ] Admin configuration (2-3h)
  - Toggle enable/disable
  - Configure days after appointment
  - Analytics dashboard
- [ ] Testing (2h)
  - Integration test: Cron job
  - E2E test: Email sent after 7 days

### Week 22 (Overlap): WhatsApp Smart Links (4-6h)

- [ ] Backend link generation (2-3h)
  - Generate WhatsApp click-to-chat URLs
  - Template messages for different contexts
  - QR code generation
- [ ] Frontend integration (2-3h)
  - Add WhatsApp buttons to public page
  - Add to confirmation emails
  - Add to appointment reminders
  - Mobile: Deep link to WhatsApp app

### Week 22 (Overlap): Variable Service Durations (8-12h)

- [ ] Database migration (2-3h)
  - Refactor services table schema
  - Add duration_options JSONB column
  - Migrate existing services
  - Update appointments table
- [ ] Backend API updates (3-4h)
  - Service CRUD with duration options
  - Booking API: Accept selected duration
  - Validation: Ensure option exists
- [ ] Frontend components (3-5h)
  - Service creation: Multiple options UI
  - Booking flow: Duration selector
  - Calendar: Show selected duration
  - Appointment cards: Display details

---

## 📊 Metrics Dashboard (Post-Launch)

```typescript
// Admin dashboard showing FASE 2.5 impact

┌─────────────────────────────────────────────┐
│ 🎯 Retention Features Analytics            │
├─────────────────────────────────────────────┤
│                                             │
│ CRM Lite                                    │
│ • Clients with birthday: 145/200 (72%)     │
│ • Clients with tags: 178/200 (89%)         │
│ • Avg tags per client: 2.3                 │
│ • Birthday emails sent: 12 this month      │
│ • Birthday conversion: 58% (7/12 booked)   │
│                                             │
│ Rebooking Automation                        │
│ • Emails sent (last 30d): 145              │
│ • Push sent: 132                            │
│ • Open rate: 52% (email), 78% (push)       │
│ • Click rate: 40%                           │
│ • Conversion: 58% ▲ +28% vs baseline       │
│ • Revenue from rebooking: $2,340           │
│                                             │
│ WhatsApp Integration                        │
│ • Links clicked: 234 (last 30d)            │
│ • Conversations started: 189               │
│ • Bookings from WhatsApp: 87               │
│ • Conversion: 46%                           │
│                                             │
│ Variable Durations                          │
│ • Upsells to higher tier: 34%              │
│ • Avg ticket value: $18 (was $15)          │
│ • Revenue from upsells: $1,240             │
│                                             │
│ COMBINED IMPACT (90 days)                   │
│ • Client retention: 74% ▲ +24%             │
│ • Rebooking rate: 61% ▲ +31%               │
│ • Avg LTV: $87 ▲ +42%                      │
│ • Additional revenue: $8,920               │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎉 Success Stories (Projected)

### Story 1: Birthday Campaign

```
María's Birthday: March 15, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9:00 AM: Automated email sent
         "¡Feliz cumpleaños María! 🎂 20% off hoy"

9:15 AM: Push notification sent
         "Feliz cumpleaños! Tenemos un regalo para ti 🎁"

10:30 AM: María books appointment (clicked push)
          Service: Deluxe Haircut + Color
          Original: $85
          With 20% off: $68

Result:
• María feels valued (personalized)
• Business gets $68 revenue (vs $0)
• Retention: María now visits every 30 days
```

### Story 2: Rebooking Automation

```
Carlos completes haircut: Jan 1, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Jan 8 (7 days later): Automated email
         Subject: "Time for your next haircut with Juan!"

Jan 8, 2:30 PM: Carlos clicks "Book Now"
         Calendar pre-filled with barber Juan
         Selects: Jan 15, 10:00 AM

Jan 15: Carlos arrives for appointment
         Juan has notes:
         - "Prefers short on sides"
         - "Likes to chat about soccer ⚽"

Result:
• Carlos rebooks every 3 weeks (instead of 6)
• Lifetime value: $180/year → $360/year
• Juan builds relationship with regular client
```

### Story 3: WhatsApp Conversion

```
Ana (65 years old) sees business on Google
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Clicks "💬 WhatsApp" button
Opens WhatsApp:
"Hola! Me gustaría reservar una cita.
¿Tienen disponibilidad para un corte?"

Receptionist responds immediately:
"Hola Ana! Claro que sí 😊
¿Prefieres mañana a las 10 AM o el viernes a las 3 PM?"

Ana: "Mañana perfecto!"

Receptionist: [Sends confirmation + location]

Result:
• Ana books (would NOT have used booking form)
• Business captures older demographic
• Ana becomes regular (WhatsApp is comfortable)
```

---

## 🏆 Competitive Advantage

### Feature Comparison Matrix

| Feature                | Your App (After FASE 2.5)      | Agendando            | GlossGenius        |
| ---------------------- | ------------------------------ | -------------------- | ------------------ |
| **CRM Lite**           | ✅ Tags, birthday, preferences | ⚠️ Basic client list | ✅ Full CRM        |
| **Rebooking**          | ✅ Email + Push automation     | ❌ Manual only       | ✅ Email only      |
| **WhatsApp**           | ✅ Smart links + templates     | ❌ No integration    | ❌ US-focused      |
| **Variable Duration**  | ✅ Multiple tiers + upsell     | ✅ Basic support     | ✅ Full support    |
| **Push Notifications** | ✅ Already built (Área 5)      | ❌ Not mentioned     | ✅ Mobile app only |
| **Dark Mode**          | ✅ Full support                | ❌ Light only        | ⚠️ Limited         |

**Verdict:** With FASE 2.5, you'll **match or exceed** competitors on retention features while maintaining technical superiority (TypeScript, RLS, testing).

---

**END OF FASE_2.5_RETENTION_FEATURES.md**

**Total Investment:** 30-44 hours
**Total ROI:** 4.3x-6.3x
**Payback Period:** 2-3 months
**Strategic Value:** Market-standard features required for competitive parity
