# Design Tokens & Patterns

**Última actualización:** 28 de enero de 2026
**Sistema de Diseño:** Apple-style Premium UI

---

## 🎨 Sistema de Sombras

### Escala de Elevación

| Token | CSS Variable | Uso |
|-------|--------------|-----|
| **shadow-xs** | `var(--shadow-xs)` | Cards base, inputs, elementos sutiles |
| **shadow-sm** | `var(--shadow-sm)` | Cards default, botones secundarios |
| **shadow-md** | `var(--shadow-md)` | Cards elevados, hover states |
| **shadow-lg** | `var(--shadow-lg)` | Modals, dropdowns, stat cards |
| **shadow-xl** | `var(--shadow-xl)` | Overlays críticos, popovers |
| **shadow-2xl** | `var(--shadow-2xl)` | Hero sections, splash screens |

### Sombras Coloreadas

Para elementos con gradientes (stats cards, badges):

```css
/* Blue */
--shadow-blue: 0 10px 15px -3px rgb(59 130 246 / 0.2);
--shadow-blue-hover: 0 10px 15px -3px rgb(59 130 246 / 0.3);

/* Emerald */
--shadow-emerald: 0 10px 15px -3px rgb(16 185 129 / 0.2);
--shadow-emerald-hover: 0 10px 15px -3px rgb(16 185 129 / 0.3);

/* Purple */
--shadow-purple: 0 10px 15px -3px rgb(168 85 247 / 0.2);
--shadow-purple-hover: 0 10px 15px -3px rgb(168 85 247 / 0.3);

/* Amber */
--shadow-amber: 0 10px 15px -3px rgb(245 158 11 / 0.2);
--shadow-amber-hover: 0 10px 15px -3px rgb(245 158 11 / 0.3);

/* Red */
--shadow-red: 0 10px 15px -3px rgb(239 68 68 / 0.2);
--shadow-red-hover: 0 10px 15px -3px rgb(239 68 68 / 0.3);
```

**Ejemplo:**
```tsx
<div className="shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30">
```

---

## ⚡ Constantes de Animación

Importar desde: `@/lib/constants/animations`

### Tiempos

```ts
TRANSITIONS.fast      // 150ms - Hover states, feedback inmediato
TRANSITIONS.default   // 200ms - Transiciones estándar
TRANSITIONS.slow      // 300ms - Animaciones complejas
```

### Spring Configs (Framer Motion)

```ts
TRANSITIONS.spring.quick    // Feedback táctil (buttons, toggles)
TRANSITIONS.spring.smooth   // Transiciones fluidas (cards, modals)
TRANSITIONS.spring.bouncy   // Animaciones con personalidad
TRANSITIONS.spring.gentle   // Floating animations
```

**Ejemplo:**
```tsx
<motion.button
  whileHover={{ scale: SCALE.hover }}
  whileTap={{ scale: SCALE.tap }}
  transition={TRANSITIONS.spring.quick}
>
```

### Scale Variants

```ts
SCALE.hover         // 1.02 - Hover normal
SCALE.hoverLarge    // 1.05 - Hover prominente
SCALE.tap           // 0.97 - Press feedback
SCALE.iconHover     // 1.1 - Iconos
```

### Translate Variants

```ts
TRANSLATE.hover       // -2px - Lift sutil
TRANSLATE.hoverLarge  // -4px - Lift prominente
TRANSLATE.slideSmall  // 4px - Slide mínimo
```

---

## 🎯 Focus States

### Clase Utility

```css
.focus-ring {
  @apply focus-visible:outline-none
         focus-visible:ring-2
         focus-visible:ring-blue-500/50
         focus-visible:ring-offset-2
         focus-visible:ring-offset-white
         dark:focus-visible:ring-blue-400/50
         dark:focus-visible:ring-offset-zinc-900;
}
```

**Uso:**
```tsx
<Link href="/" className="focus-ring rounded-md">
  Link with premium focus
</Link>
```

---

## 📐 Espaciado y Ritmo

### Escala Base (múltiplos de 4px)

```ts
xs: 4px    // 0.25rem
sm: 8px    // 0.5rem
md: 12px   // 0.75rem
lg: 16px   // 1rem
xl: 24px   // 1.5rem
2xl: 32px  // 2rem
3xl: 48px  // 3rem
4xl: 64px  // 4rem
```

### Principio de Ritmo Visual

- Elementos relacionados: 8px o 12px de separación
- Secciones: 24px o 32px de separación
- Bloques principales: 48px o 64px de separación

---

## 🔤 Tipografía

### Escala Semántica

```ts
display: 'text-[32px] font-bold tracking-tight'
h1: 'text-[28px] font-bold tracking-tight'
h2: 'text-[22px] font-semibold tracking-tight'
h3: 'text-[17px] font-semibold'
body: 'text-[15px] font-normal'
small: 'text-[13px] font-normal'
caption: 'text-[11px] font-medium uppercase tracking-wide'
```

### Letter Spacing

- **Display/Headers:** `-0.02em` (tracking-tight)
- **Body:** `0` (normal)
- **Captions:** `0.05em` (tracking-wide)

### Font Weights

- **Bold:** 700 - Headlines, números destacados
- **Semibold:** 600 - Subheaders, labels importantes
- **Medium:** 500 - Buttons, badges
- **Normal:** 400 - Body text, descriptions

---

## 🎭 Patrones de Animación

### 1. Hover Card (Lift + Scale)

```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  transition={TRANSITIONS.spring.quick}
  className="transition-shadow duration-200 hover:shadow-lg"
>
```

### 2. Interactive Button

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={TRANSITIONS.spring.quick}
  className="focus-ring"
>
```

### 3. Shine Effect (Stats Cards)

```tsx
<div className="relative overflow-hidden">
  {/* Contenido */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0"
    whileHover={{ opacity: [0, 1, 0], x: ['-100%', '100%'] }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
  />
</div>
```

### 4. Gradient Overlay (Hover)

```tsx
<div className="group relative overflow-hidden">
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

  {/* Contenido */}
  <div className="relative">...</div>
</div>
```

### 5. Floating Animation (Empty States)

```tsx
<div className="animate-float">
  {/* Icono flotante */}
</div>

// En globals.css ya definido:
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### 6. Pulse Ring (Attention)

```tsx
<div className="relative">
  {/* Elemento principal */}
  <div className="absolute inset-0 border-2 border-zinc-300/50 animate-[pulse-ring_2s_ease-in-out_infinite]" />
</div>

// En globals.css ya definido:
@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}
```

---

## 🌈 Gradientes Premium

### Gradientes de Texto

```tsx
// Títulos principales
<h1 className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
  {title}
</h1>
```

### Gradientes de Fondo (Stats Cards)

```tsx
// Blue
bg-gradient-to-br from-blue-500 to-cyan-600

// Emerald
bg-gradient-to-br from-emerald-500 to-teal-600

// Amber
bg-gradient-to-br from-amber-500 to-orange-600

// Purple
bg-gradient-to-br from-purple-500 to-pink-600
```

### Overlays Sutiles

```tsx
// Profundidad sobre gradientes
<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

// Hover overlay
<div className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0" />
```

---

## 🎨 Sistema de Iconos

### Tamaños Consistentes

```tsx
// Icons en buttons
<Icon className="h-4 w-4" />      // sm button
<Icon className="h-5 w-5" />      // md button
<Icon className="h-6 w-6" />      // lg button

// Icons en cards
<Icon className="h-5 w-5" />      // Card header
<Icon className="h-8 w-8" />      // Empty state
<Icon className="h-12 w-12" />    // Hero icon
```

### Contenedores de Iconos

```tsx
// Con background coloreado
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
</div>

// Con ring (premium)
<div className="... ring-4 ring-white/10">
  <Icon />
</div>
```

---

## 🔍 Rings y Bordes

### Rings Decorativos

```tsx
// Ring sutil para profundidad
ring-2 ring-white/50 dark:ring-zinc-900/50

// Ring coloreado para iconos
ring-4 ring-blue-100/50 dark:ring-blue-900/20

// Ring en focus (interactive)
ring-2 ring-blue-500/50 ring-offset-2
```

### Bordes Condicionales

```tsx
// Hover border
border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700

// Active border
border-2 border-blue-500

// Dividers
border-b border-zinc-100 dark:border-zinc-800
```

---

## ⚠️ Mejores Prácticas

### 1. Sutileza sobre Exageración

✅ **Hacer:**
- Animaciones < 300ms para feedback
- Gradientes con 10-20% opacity variation
- Sombras suaves, no harsh
- Scale factors between 0.95-1.05

❌ **Evitar:**
- Animaciones > 500ms sin propósito
- Gradientes agresivos (50%+ variation)
- Múltiples animaciones simultáneas
- Scale > 1.1 (demasiado agresivo)

### 2. Consistencia sobre Creatividad

✅ **Hacer:**
- Usar las constantes de TRANSITIONS
- Mantener spacing en múltiplos de 4px
- Usar la paleta de sombras definida
- Aplicar focus-ring a todos los interactivos

❌ **Evitar:**
- Timings custom sin razón
- Spacing arbitrario (13px, 17px, etc)
- Sombras custom sin documentar
- Elementos sin focus visible

### 3. Función sobre Forma

✅ **Hacer:**
- Cada animación debe comunicar algo
- Hover = interactuable
- Scale up = clickeable
- Pulso = atención necesaria

❌ **Evitar:**
- Animaciones "porque se ven cool"
- Efectos que distraen del contenido
- Movimiento excesivo sin propósito

### 4. Accesibilidad como Fundamento

✅ **Hacer:**
- Respetar `prefers-reduced-motion`
- Mantener ratios WCAG AA (≥4.5:1)
- Focus visible siempre
- Keyboard navigation completa

❌ **Evitar:**
- Depender solo de color para info
- Elementos sin focus state
- Animaciones que no se pueden desactivar

---

## 📚 Referencias

**Design Systems:**
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Vercel Design System](https://vercel.com/design)
- [Linear App](https://linear.app/)

**Motion Design:**
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Laws of UX](https://lawsofux.com/)
- [Material Motion](https://material.io/design/motion/)

**Tools:**
- [Realtime Colors](https://realtimecolors.com/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Easing Functions](https://easings.net/)

---

**Creado por:** Claude Sonnet 4.5
**Sistema:** BarberShop Pro Premium UI
**Versión:** 1.0.0
