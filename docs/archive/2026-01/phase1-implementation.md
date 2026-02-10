# Phase 1 Implementation Guide

## ✅ Completado - Foundation & Quick Wins

Todas las tareas de Phase 1 han sido implementadas. Sigue estos pasos para desplegar los cambios.

---

## 📋 Resumen de Cambios

### 1.1 ✅ Email Notifications + Preferencias

- **Migración:** `009_notification_preferences.sql`
- **Features:**
  - Sistema dual de notificaciones (email + in-app)
  - Preferencias configurables por usuario
  - Templates premium con React Email
  - Integración con Resend (3,000 emails/mes gratis)

### 1.2 ✅ Storage Retention Strategy

- **Migración:** `010_storage_retention.sql`
- **Features:**
  - Auto-delete de comprobantes aprobados después de 30 días
  - Auto-delete de comprobantes rechazados inmediatamente
  - Cron job diario para cleanup (3:00 AM UTC)
  - Mantiene storage bajo 1GB → $0/año

### 1.3 ✅ Analytics Dashboard

- **Migración:** Ninguna (usa tablas existentes)
- **Features:**
  - Dashboard completo con KPIs
  - Charts con Recharts (revenue, servicios, barberos)
  - Filtros por período (semana/mes/año)
  - Leaderboard de barberos
  - Top servicios por ingresos

### 1.4 ✅ Performance Optimizations

- **Migración:** `011_performance_indexes.sql`
- **Features:**
  - 15+ indexes para queries críticos
  - Image optimization (AVIF, WebP)
  - Bundle analyzer configurado
  - Optimización de queries de dashboard y analytics

---

## 🚀 Pasos de Implementación

### Paso 1: Ejecutar Migraciones en Supabase

Ve a Supabase Dashboard → SQL Editor y ejecuta en orden:

```sql
-- 1. Notification Preferences
-- Archivo: supabase/migrations/009_notification_preferences.sql
-- Copia y pega el contenido completo

-- 2. Storage Retention
-- Archivo: supabase/migrations/010_storage_retention.sql
-- Copia y pega el contenido completo

-- 3. Performance Indexes
-- Archivo: supabase/migrations/011_performance_indexes.sql
-- Copia y pega el contenido completo
```

**Verificar:** Las tablas `notification_preferences` debe existir después de la migración.

---

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` (si no existe) con estas variables:

```bash
# Supabase (ya existentes)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ===== NUEVAS VARIABLES =====

# 1. Resend (Email Service)
# Regístrate gratis en: https://resend.com/signup
# Obtén tu API key en: https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=BarberApp <noreply@yourdomain.com>

# 2. Notification API Secret
# Genera uno: openssl rand -base64 32
NOTIFICATION_API_SECRET=your_random_secret_here

# 3. Cron Secret (para Vercel Cron Jobs)
# Genera uno: openssl rand -base64 32
CRON_SECRET=your_cron_secret_here

# 4. App URL (opcional)
NEXT_PUBLIC_APP_URL=https://app.barberapp.com
```

**Generar secrets:**

```bash
# En terminal:
openssl rand -base64 32
# Copia el output y úsalo para NOTIFICATION_API_SECRET y CRON_SECRET
```

---

### Paso 3: Configurar Resend (Email)

1. **Regístrate en Resend:**
   - Ve a: https://resend.com/signup
   - Regístrate con tu email
   - Free tier: 3,000 emails/mes (suficiente para 300 negocios)

2. **Obtén API Key:**
   - Dashboard → API Keys → Create API Key
   - Copia el key y agrégalo a `.env.local`

3. **Configura dominio (opcional pero recomendado):**
   - Dashboard → Domains → Add Domain
   - Agrega tu dominio (ej: `barberapp.com`)
   - Configura DNS records (SPF, DKIM)
   - Esto mejora deliverability

4. **Actualiza EMAIL_FROM:**
   ```
   EMAIL_FROM=BarberApp <noreply@tudominio.com>
   ```

---

### Paso 4: Deploy a Vercel

1. **Commit cambios:**

   ```bash
   git add .
   git commit -m "feat: Phase 1 - Email notifications, storage retention, analytics dashboard, performance optimizations

   - Email notifications with Resend integration
   - User notification preferences UI
   - Storage retention with auto-delete cron job
   - Analytics dashboard with charts (Recharts)
   - Performance indexes for critical queries
   - Image optimization (AVIF, WebP)
   - Bundle analyzer setup

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

2. **Push a GitHub:**

   ```bash
   git push origin feature/phase1-foundation
   ```

3. **En Vercel Dashboard:**
   - Ve a tu proyecto → Settings → Environment Variables
   - Agrega TODAS las variables nuevas:
     - `RESEND_API_KEY`
     - `EMAIL_FROM`
     - `NOTIFICATION_API_SECRET`
     - `CRON_SECRET`
   - Redeploy automático se activará

4. **Configurar Cron Jobs:**
   - Vercel detectará automáticamente `vercel.json`
   - Cron job se activará después del deploy
   - Verifica en: Dashboard → Cron Jobs

---

### Paso 5: Verificación Post-Deploy

#### ✅ Email Notifications

1. Ve a `/configuracion` en tu app
2. Deberías ver nueva sección "Notificaciones"
3. Prueba cambiar canal (Email / App / Ambos)
4. Verifica que se guarde correctamente

#### ✅ Analytics Dashboard

1. Ve a `/analiticas` (nuevo ítem en sidebar)
2. Deberías ver:
   - KPI cards (Ingresos, Citas, Promedio, Tasa)
   - Revenue chart (área)
   - Top servicios (barras horizontales)
   - Ranking de barberos (leaderboard)
3. Prueba cambiar período (Semana/Mes/Año)

#### ✅ Storage Retention

1. El cron job se ejecuta diariamente a las 3:00 AM UTC
2. Para probar manualmente:
   ```bash
   curl -X GET https://tu-app.vercel.app/api/admin/cleanup-storage \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
3. Debería retornar: `{ "success": true, "deleted": X }`

#### ✅ Performance

1. Verifica queries más rápidos en dashboard
2. Para analizar bundle:
   ```bash
   ANALYZE=true npm run build
   ```
3. Se abrirá un navegador con el análisis visual

---

## 📊 Resultados Esperados

### Email Notifications

- ✅ 0% emails perdidos (configuración por usuario)
- ✅ Templates branded con logo de negocio
- ✅ $0/mes en costos (free tier 3,000 emails)

### Storage Retention

- ✅ Storage se mantiene bajo 1GB (free tier)
- ✅ $0/año en costos de storage
- ✅ Cleanup automático sin intervención manual

### Analytics Dashboard

- ✅ Visualización clara de métricas
- ✅ Insights de servicios y barberos
- ✅ Datos históricos por período

### Performance

- ✅ Queries 50-70% más rápidos (indexes)
- ✅ Imágenes optimizadas (AVIF/WebP)
- ✅ Bundle size visible y analizable

---

## 🐛 Troubleshooting

### Emails no se envían

- **Verificar:** `RESEND_API_KEY` está configurada correctamente
- **Verificar:** `EMAIL_FROM` tiene formato válido
- **Logs:** Vercel → Functions → Ver logs de `/api/notifications/send`

### Cron job no ejecuta

- **Verificar:** `CRON_SECRET` coincide en Vercel
- **Verificar:** `vercel.json` existe en root
- **Dashboard:** Vercel → Cron Jobs → Ver ejecuciones

### Analytics vacío

- **Verificar:** Hay citas completadas en el negocio
- **Verificar:** Migración 011 se ejecutó correctamente
- **Logs:** Browser console → Ver errores de API

### Performance no mejora

- **Verificar:** Migración 011 (indexes) se ejecutó
- **Verificar:** `next.config.ts` tiene configuración de images
- **Análisis:** Ejecutar `ANALYZE=true npm run build`

---

## 🎯 Métricas de Éxito

Después de 1 semana de uso:

| Métrica              | Objetivo      | Verificación                      |
| -------------------- | ------------- | --------------------------------- |
| Email deliverability | >95%          | Resend Dashboard → Deliverability |
| Storage usage        | <1GB          | Supabase Dashboard → Storage      |
| Dashboard load time  | <2s           | Chrome DevTools → Network         |
| Analytics usage      | >50% usuarios | Verificar visitas a `/analiticas` |

---

## 📚 Archivos Creados/Modificados

### Nuevos Archivos

```
supabase/migrations/
  ├── 009_notification_preferences.sql
  ├── 010_storage_retention.sql
  └── 011_performance_indexes.sql

src/lib/email/
  ├── sender.ts
  └── templates/
      ├── trial-expiring.tsx
      ├── payment-approved.tsx
      └── new-appointment.tsx

src/app/api/
  ├── notifications/
  │   ├── send/route.ts
  │   └── preferences/route.ts
  ├── analytics/
  │   ├── overview/route.ts
  │   ├── revenue-series/route.ts
  │   ├── services/route.ts
  │   └── barbers/route.ts
  └── admin/
      └── cleanup-storage/route.ts

src/app/(dashboard)/
  └── analiticas/page.tsx

src/components/
  ├── analytics/
  │   ├── revenue-chart.tsx
  │   ├── services-chart.tsx
  │   └── barbers-leaderboard.tsx
  └── settings/
      └── notification-preferences-section.tsx

vercel.json
.env.example
```

### Archivos Modificados

```
src/types/database.ts (agregado NotificationPreferences)
src/components/dashboard/sidebar.tsx (agregado Analíticas)
src/app/(dashboard)/configuracion/page.tsx (agregado NotificationPreferencesSection)
next.config.ts (image optimization + bundle analyzer)
package.json (dependencias agregadas)
```

---

## 🎉 ¡Phase 1 Completada!

Todos los features de Foundation & Quick Wins están implementados y listos para producción.

**Siguiente:** Phase 2 - Core Features & UX (Onboarding, Tour, Landing Premium)

---

## 📞 Support

Si tienes problemas con la implementación:

1. Revisa los logs en Vercel Dashboard
2. Verifica que todas las migraciones se ejecutaron
3. Confirma que todas las variables de entorno están configuradas
4. Revisa la consola del navegador para errores del cliente

---

**Creado:** 2026-01-28
**Phase:** 1 de 4
**Status:** ✅ Ready for Production
