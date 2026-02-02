---
name: tailwind-patterns
description: Tailwind CSS v4 utilities, responsive design, and component patterns.
version: 1.0.0
---

# Tailwind CSS Patterns

Modern Tailwind CSS patterns and utilities.

## Layout Patterns

### Flexbox

```html
<!-- Centered content -->
<div class="flex items-center justify-center min-h-screen">
  <div>Centered</div>
</div>

<!-- Space between -->
<div class="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

<!-- Wrap on small screens -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Column 1</div>
  <div class="flex-1">Column 2</div>
</div>
```

### Grid

```html
<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>

<!-- Auto-fit columns -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <div>Auto-sized</div>
</div>
```

### Container

```html
<!-- Centered container -->
<div class="container mx-auto px-4">
  Content
</div>

<!-- Max-width container -->
<div class="max-w-4xl mx-auto px-4">
  Content
</div>
```

## Component Patterns

### Button

```html
<!-- Primary button -->
<button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Click me
</button>

<!-- Outline button -->
<button class="border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
  Secondary
</button>

<!-- Disabled -->
<button class="bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed" disabled>
  Disabled
</button>
```

### Card

```html
<div class="bg-white rounded-xl shadow-md overflow-hidden">
  <img src="..." alt="..." class="w-full h-48 object-cover" />
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-900">Title</h3>
    <p class="mt-2 text-gray-600">Description text</p>
  </div>
</div>
```

### Input

```html
<input
  type="text"
  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
  placeholder="Enter text..."
/>

<!-- With label -->
<label class="block">
  <span class="text-sm font-medium text-gray-700">Email</span>
  <input
    type="email"
    class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
</label>
```

### Badge

```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Active
</span>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
  Error
</span>
```

## Responsive Design

### Breakpoints

```
sm: 640px   - Small tablets
md: 768px   - Tablets
lg: 1024px  - Laptops
xl: 1280px  - Desktops
2xl: 1536px - Large screens
```

```html
<!-- Mobile-first -->
<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<!-- Hide on mobile -->
<div class="hidden md:block">
  Desktop only
</div>

<!-- Show only on mobile -->
<div class="block md:hidden">
  Mobile only
</div>
```

## Dark Mode

```html
<!-- Auto dark mode -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>

<!-- Card with dark mode -->
<div class="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700/30 rounded-xl p-6">
  <h3 class="text-gray-900 dark:text-white">Title</h3>
  <p class="text-gray-600 dark:text-gray-300">Description</p>
</div>
```

## Animations

```html
<!-- Fade in -->
<div class="animate-fade-in">Content</div>

<!-- Spin -->
<svg class="animate-spin h-5 w-5 text-blue-500">...</svg>

<!-- Pulse -->
<div class="animate-pulse bg-gray-200 h-4 rounded">Loading...</div>

<!-- Transition -->
<button class="transition-all duration-300 hover:scale-105">
  Hover me
</button>
```

## Utilities

### Spacing

```html
<!-- Margin -->
<div class="m-4">    <!-- All sides -->
<div class="mx-4">   <!-- Horizontal -->
<div class="my-4">   <!-- Vertical -->
<div class="mt-4">   <!-- Top only -->

<!-- Padding -->
<div class="p-4">    <!-- All sides -->
<div class="px-4">   <!-- Horizontal -->
<div class="py-4">   <!-- Vertical -->
```

### Typography

```html
<h1 class="text-4xl font-bold tracking-tight text-gray-900">
  Heading
</h1>

<p class="text-base text-gray-600 leading-relaxed">
  Paragraph text
</p>

<span class="text-sm text-gray-500">
  Small text
</span>
```

### Shadows

```html
<div class="shadow-sm">Subtle</div>
<div class="shadow-md">Medium</div>
<div class="shadow-lg">Large</div>
<div class="shadow-xl">Extra large</div>
```

## Best Practices

1. **Use design tokens** - Stick to the scale (don't use arbitrary values)
2. **Mobile-first** - Start with mobile styles, add responsive modifiers
3. **Extract components** - Use @apply in CSS for repeated patterns
4. **Dark mode** - Always consider dark mode from the start
5. **Accessibility** - Use focus states, proper contrast ratios
