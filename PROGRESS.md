# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** BarberShop Pro
- **Stack:** Next.js 16, React 19, Supabase, Tailwind CSS 4, Framer Motion
- **Last Updated:** 2026-01-24

---

## What's Built

### Completed Features
- [x] Autenticación completa (login, register, logout)
- [x] Dashboard con stats animados y gradientes
- [x] Página de Citas (`/citas`) - calendario, filtros, 3 vistas
- [x] Página de Servicios (`/servicios`) - sin stats inútiles, animaciones
- [x] Página de Clientes (`/clientes`) - lista, búsqueda, agregar
- [x] Página de Barberos (`/barberos`) - CRUD simplificado
- [x] Página de Configuración (`/configuracion`) - iOS time picker wheel
- [x] Página Pública de Reservas (`/reservar/[slug]`) - flujo de 3-4 pasos
- [x] **Apple Design System** con framer-motion
- [x] **iOS Time Picker Wheel** component
- [x] **iOS Toggle Switch** component
- [x] **Motion Components** reutilizables

### In Progress
- [ ] Mejorar diseño de login/register con animaciones
- [ ] Más micro-interacciones para nivel Awwwards

### Key Files (Nuevos)
| File | Purpose |
|------|---------|
| `src/lib/design-system.ts` | Sistema de diseño Apple-style |
| `src/components/ui/ios-time-picker.tsx` | Time picker wheel estilo iOS |
| `src/components/ui/ios-toggle.tsx` | Toggle switch estilo iOS |
| `src/components/ui/motion.tsx` | FadeInUp, StaggeredList, ScaleOnHover, etc. |
| `src/components/dashboard/dashboard-stats.tsx` | Wrapper client para stats del dashboard |

---

## Current State

### Working
- ✅ Build compila sin errores
- ✅ Server/Client component boundary correcta
- ✅ Servicios rediseñados sin stats inútiles
- ✅ Configuración con iOS time picker wheel
- ✅ Dashboard con StatsCard animados (variant: primary, success)
- ✅ Bottom nav con layoutId animations
- ✅ Touch targets 44px mínimo (Apple HIG)
- ✅ Citas mobile: iOS-style stat pills, filtros compactos
- ✅ Clientes mobile: iOS-style stat pills, dark mode fix
- ✅ Montos de currency en formato completo (₡150,000)

### Score UX/UI
- **Antes:** 4.1/10
- **Ahora:** ~7.8/10 (mobile mejorado)
- **Meta:** 8.5+ (nivel Awwwards)

---

## Next Session

### Continue With
1. Rediseñar páginas de auth (login/register) con animaciones
2. Agregar animaciones de transición de página
3. Implementar swipe-to-delete en móvil
4. Commit de todos los cambios de esta sesión

### Commands to Run
```bash
npm run dev
```

### Context Notes
- **IMPORTANTE:** Dashboard es Server Component, StatsCard es Client → usar DashboardStats wrapper
- No pasar funciones (iconos Lucide) de Server a Client components
- Para verificar UI: usar scripts de Playwright en `/scripts/`

---

## Session History

### 2026-01-24 - Session 8 (Mobile UX Improvements)
- Rediseño completo de stat cards en Citas y Clientes
- iOS-style horizontal scroll pills para métricas
- Fix de iconos sobreponiéndose al texto (absolute → flex layout)
- Mejora de contraste en dark mode (Card component)
- Filtros de citas más compactos con color dots
- View toggle como botones de íconos
- `formatCurrency` muestra montos completos (₡150,000) como solicitado
- Verificación visual con Playwright screenshots

### 2026-01-24 - Session 7 (Auditoría UX/UI Apple Design)
- Auditoría brutal cuestionando TODA la UI
- Creado sistema de diseño Apple-style (`design-system.ts`)
- Nuevo: iOS Time Picker Wheel, iOS Toggle, Motion components
- Rediseño: Servicios (sin stats), Configuración (iOS picker), Dashboard (gradients)
- Fix crítico: Server/Client boundary con iconos Lucide → DashboardStats wrapper
- Score UX mejoró de 4.1 a ~7.3

### 2026-01-24 - Session 6 (UI Polish + Demo User)
- Fixed: Inputs de tiempo → formato 24h
- Creado usuario demo

### 2026-01-24 - Session 5 (UI Bug Fixes)
- Calendario 30 días, horario compacto, stats cards dark

### 2026-01-24 - Session 4 (iOS 26 Design)
- iOS design system en globals.css
