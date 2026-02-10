# Design Standards - BarberApp

> **OBLIGATORIO**: Estos patrones DEBEN usarse en TODOS los componentes nuevos o modificados.

## 🎨 Card Design Pattern (ESTÁNDAR)

### ✅ Correcto (Usar SIEMPRE)
```tsx
<Card className="border border-zinc-200 dark:border-zinc-800 bg-card/80 backdrop-blur-sm p-4 sm:p-6">
```

### ❌ Incorrecto (NUNCA usar)
```tsx
// ❌ No usar border-border/50 (indefinido en dark mode)
<Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 sm:p-6">

// ❌ No usar colores específicos
<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
```

**Razón:**
- `border-zinc-200 dark:border-zinc-800` funciona en light y dark mode
- Es consistente con StatsCard y todo el dashboard
- Glassmorphism sutil sin colores llamativos

---

## 📱 Mobile-First Responsive Pattern

### Spacing
```tsx
// Padding
p-4 sm:p-6           // Cards
p-2.5 sm:p-3         // Inner sections
mt-4 sm:mt-6         // Top margins
gap-2 sm:gap-3       // Gaps

// Space-y
space-y-2.5 sm:space-y-3
space-y-4 sm:space-y-6
```

### Typography
```tsx
// Headers
text-sm sm:text-base         // H3
text-xs sm:text-sm          // H4

// Body text
text-xs sm:text-sm          // Regular
text-[11px] sm:text-xs      // Small

// Labels
text-[11px] text-muted-foreground sm:text-xs
```

### Icons
```tsx
h-4 w-4 sm:h-5 sm:w-5       // Headers
h-3.5 w-3.5 sm:h-4 sm:w-4   // Section icons
h-3 w-3 sm:h-3.5 sm:w-3.5   // Small icons
```

### Progress Bars
```tsx
h-2 sm:h-2.5                 // Height
mt-2                         // Spacing
```

---

## 🎯 Flex Patterns

### Prevent Overflow
```tsx
<div className="flex items-start justify-between gap-3">
  <div className="min-w-0 flex-1">
    {/* Content that can shrink */}
    <p className="truncate">Long text...</p>
  </div>
  <div className="flex-shrink-0">
    {/* Fixed width items */}
  </div>
</div>
```

### Badges with Responsive Text
```tsx
<Badge className="flex-shrink-0">
  <span className="mr-1">🥉</span>
  <span className="hidden sm:inline">Bronze</span>
</Badge>
```

---

## 🎨 Color Patterns

### Borders
```tsx
border-border/50           // Standard border
border-border/40           // Subtle border
border-dashed border-border // Dashed sections
```

### Backgrounds
```tsx
bg-card/80 backdrop-blur-sm       // Main cards
bg-card/60 backdrop-blur-sm       // Nested cards
bg-background/50                  // Inner sections
bg-background/30                  // Dashed boxes
```

### States
```tsx
// Buttons
hover:bg-primary/20
active:bg-primary/30

// Interactive elements
transition-colors
```

---

## 📋 Component Checklist

Antes de crear/modificar un componente, verificar:

- [ ] Usa `border-border/50` y `bg-card/80 backdrop-blur-sm`
- [ ] Tiene padding responsive: `p-4 sm:p-6`
- [ ] Typography tiene tamaños mobile/desktop
- [ ] Iconos tienen tamaños responsive
- [ ] Usa `min-w-0` y `flex-shrink-0` para prevenir overflow
- [ ] Progress bars son `h-2 sm:h-2.5`
- [ ] Textos largos tienen `truncate`
- [ ] Spacing usa patrón `mt-4 sm:mt-6`

---

## 🚫 Anti-Patterns (NO USAR)

### ❌ Gradientes de color en cards
```tsx
bg-gradient-to-br from-primary/5 to-primary/10  // NO
```

### ❌ Bordes de color
```tsx
border-primary/20  // NO
```

### ❌ Padding fijo sin responsive
```tsx
p-6  // NO - usar p-4 sm:p-6
```

### ❌ Typography sin tamaños mobile
```tsx
text-sm  // NO - usar text-xs sm:text-sm
```

---

## 📚 Referencias

### Componentes que siguen el estándar:
- ✅ [src/components/loyalty/client-status-card.tsx](../src/components/loyalty/client-status-card.tsx)
- ✅ [src/components/loyalty/loyalty-preview.tsx](../src/components/loyalty/loyalty-preview.tsx)
- ✅ [src/app/(dashboard)/lealtad/configuracion/page.tsx](../src/app/(dashboard)/lealtad/configuracion/page.tsx)
- ✅ [src/components/dashboard/stats-card.tsx](../src/components/dashboard/stats-card.tsx)

---

**Última actualización:** 2026-01-30
**Autor:** Sistema de Design Standards

> 💡 **Nota:** Si algún componente no sigue este estándar, debe ser actualizado para mantener consistencia visual en toda la app.
