# Performance Quick Wins - Implementación Inmediata

**Resultado del análisis automatizado:**

- 📊 **153 componentes** analizados
- ❌ **0% memoización** (0 de 153)
- 🔴 **15 componentes críticos** (400+ líneas sin memo)
- 📦 **34 importaciones de framer-motion** con uso mínimo

---

## 🚨 CRÍTICO - Implementar HOY

### 1. Memoizar CitasPage (702 líneas)

**Archivo:** `src/app/(dashboard)/citas/page.tsx`

**Problema actual:**

```typescript
// ❌ 10 .map() + 7 .filter() sin useMemo
// ❌ Stats se recalculan incluso cuando solo cambia el search
// ❌ 9 importaciones de date-fns (~18kb)
```

**Solución (5 minutos):**

```typescript
// 1. Extraer stats a useMemo optimizado
const stats = useMemo(() => {
  const today = appointments.filter((a) => isSameDay(new Date(a.scheduled_at), selectedDate))

  // Single-pass reduce
  return today.reduce(
    (acc, apt) => {
      acc.total++
      acc[apt.status] = (acc[apt.status] || 0) + 1

      const price = Number(apt.price)
      if (apt.status === 'completed') acc.revenue += price
      if (apt.status === 'pending' || apt.status === 'confirmed') {
        acc.expectedRevenue += price
      }

      acc.clientIds.add(apt.client_id)
      return acc
    },
    {
      total: 0,
      completed: 0,
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      revenue: 0,
      expectedRevenue: 0,
      clientIds: new Set(),
    }
  )
}, [appointments, selectedDate])

// 2. Hoist toLowerCase en filteredAppointments
const filteredAppointments = useMemo(() => {
  const searchLower = search.toLowerCase() // ✅ Una sola vez

  return appointments.filter((apt) => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false

    if (searchLower) {
      const name = apt.client?.name?.toLowerCase() || ''
      const phone = apt.client?.phone || ''
      if (!name.includes(searchLower) && !phone.includes(searchLower)) return false
    }

    return true
  })
}, [appointments, statusFilter, search])
```

**Impacto:** 350 operaciones → 50 operaciones por render (86% reducción)

---

### 2. Memoizar AppointmentCard

**Archivo:** `src/components/appointments/appointment-card.tsx`

**Solución (2 minutos):**

```typescript
import { memo, useMemo } from 'react'

// Constante fuera del componente
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: 'border-l-violet-500',
  confirmed: 'border-l-blue-500',
  completed: 'border-l-emerald-500',
  cancelled: 'border-l-red-500',
  no_show: 'border-l-amber-500',
}

export const AppointmentCard = memo(function AppointmentCard({
  appointment,
  onStatusChange,
  onEdit,
  onDelete,
  onWhatsApp,
  variant = 'default',
  className,
}: AppointmentCardProps) {
  // Memoizar cálculos de tiempo
  const times = useMemo(
    () => ({
      scheduled: new Date(appointment.scheduled_at),
      end: new Date(
        new Date(appointment.scheduled_at).getTime() + appointment.duration_minutes * 60000
      ),
    }),
    [appointment.scheduled_at, appointment.duration_minutes]
  )

  // Usar STATUS_COLORS en lugar de recrear el objeto
  const borderColor = STATUS_COLORS[appointment.status]

  // ... resto del componente
})
```

**Impacto:** 20 cards × re-renders reducidos en 80%

---

### 3. Eliminar Framer Motion de 34 Componentes

**Problema:** Framer Motion añade 25kb × 34 componentes = potencialmente 850kb de overhead

**Archivos críticos:**

- `src/app/(dashboard)/onboarding/page.tsx` (0 usos de `<motion.`)
- `src/components/ui/card-refactored.tsx` (0 usos)
- `src/components/ui/card.tsx` (0 usos)

**Solución (10 minutos):**

```bash
# Buscar archivos que importan framer-motion pero usan <2 veces
grep -rl "from 'framer-motion'" src/ | while read file; do
  usage=$(grep -o "<motion\." "$file" | wc -l)
  if [ $usage -lt 2 ]; then
    echo "$file (usage: $usage)"
  fi
done
```

**Reemplazo:**

```typescript
// ❌ ANTES (25kb)
import { motion } from 'framer-motion'
<motion.div whileHover={{ scale: 1.02 }}>

// ✅ DESPUÉS (0kb)
<div className="hover:scale-[1.02] transition-transform duration-200">
```

**Impacto:** -150kb bundle (estimado conservador)

---

## 🟡 ALTO IMPACTO - Esta Semana

### 4. Memoizar ClientesPage (793 líneas)

**Archivo:** `src/app/(dashboard)/clientes/page.tsx`

- 2 .map() + 8 .filter()
- Necesita useMemo para client filtering

### 5. Memoizar ConfiguracionPage (826 líneas)

**Archivo:** `src/app/(dashboard)/configuracion/page.tsx`

- Componente más grande del proyecto
- Probablemente múltiples re-renders

### 6. Code-Split Modals Pesados

```typescript
// ios-time-picker.tsx (469 líneas)
// modal-refactored.tsx (427 líneas)
// client-account-modal.tsx (415 líneas)

const IOSTimePicker = lazy(() => import('./ios-time-picker'))
const ClientAccountModal = lazy(() => import('./client-account-modal'))
```

---

## 📊 Medición de Resultados

### Antes de Optimizar:

```bash
# 1. Capturar baseline
npm run build
# Anotar bundle size de .next/static

# 2. React DevTools Profiler
# - Abrir citas page
# - Iniciar recording
# - Cambiar search filter
# - Detener recording
# - Anotar: render time, commits count
```

### Después de Optimizar:

```bash
# Repetir mismo proceso y comparar
node scripts/analyze-performance.js
```

**Métricas esperadas:**

| Métrica               | Antes  | Después | Mejora |
| --------------------- | ------ | ------- | ------ |
| Memoization rate      | 0%     | 30%+    | ∞      |
| Bundle size           | 4.1MB  | ~3.3MB  | -20%   |
| CitasPage render time | ~120ms | ~35ms   | -71%   |
| Re-renders on search  | ~150   | ~30     | -80%   |

---

## 🛠️ Scripts Útiles

### Analizar Performance

```bash
# Análisis completo
node scripts/analyze-performance.js

# Analizar bundle
npm run build
npx @next/bundle-analyzer

# Lighthouse
npx lighthouse http://localhost:3000/citas --only-categories=performance
```

### Encontrar Componentes Sin Memo

```bash
# Componentes grandes sin memoization
find src -name "*.tsx" -exec sh -c '
  lines=$(wc -l < "$1")
  if [ $lines -gt 200 ]; then
    if ! grep -q "React.memo\|= memo(" "$1"; then
      echo "$1 ($lines lines) - NO MEMO"
    fi
  fi
' _ {} \;
```

### Encontrar Importaciones Pesadas

```bash
# Framer Motion con poco uso
grep -l "framer-motion" src/**/*.tsx | while read f; do
  usage=$(grep -c "<motion\." "$f")
  if [ $usage -lt 3 ]; then
    echo "$f - $usage usos"
  fi
done
```

---

## 📝 Checklist de Implementación

### Día 1 (2 horas)

- [ ] Optimizar CitasPage stats calculation
- [ ] Hoist toLowerCase en filteredAppointments
- [ ] Memoizar AppointmentCard
- [ ] Ejecutar análisis antes/después

### Día 2 (2 horas)

- [ ] Eliminar Framer Motion de 10 componentes con 0-1 usos
- [ ] Reemplazar con CSS animations
- [ ] Medir bundle size

### Día 3 (3 horas)

- [ ] Memoizar ClientesPage
- [ ] Memoizar ConfiguracionPage
- [ ] Code-split modals pesados

### Día 4 (1 hora)

- [ ] Ejecutar lighthouse
- [ ] Documentar mejoras
- [ ] Commit changes

---

## 🎯 Siguiente Nivel (Opcional)

Una vez completados los Quick Wins:

1. **Reemplazar date-fns** con utils livianos (-20kb)
2. **Virtualización** para listas largas (react-window)
3. **Service Worker** para caché agresivo
4. **Image optimization** con next/image
5. **Preload critical resources**

---

## 📚 Referencias

- React DevTools Profiler: https://react.dev/reference/react/Profiler
- Web Vitals: https://web.dev/vitals/
- Next.js Performance: https://nextjs.org/docs/app/building-your-application/optimizing
- Bundle Analyzer: https://www.npmjs.com/package/@next/bundle-analyzer

---

**Última actualización:** 2026-02-03
**Próxima revisión:** Después de implementar Quick Wins (Día 4)
