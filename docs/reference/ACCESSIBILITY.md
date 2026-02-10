# Accessibility Guidelines

This document outlines the accessibility (a11y) standards and best practices for the BarberApp application.

---

## ✅ Current Accessibility Features

### 1. Keyboard Navigation

- All interactive elements are keyboard accessible (Tab, Enter, Space, Arrow keys)
- Focus indicators visible on all interactive elements
- Logical tab order throughout the application
- Skip-to-content link for keyboard users

### 2. Screen Reader Support

- Semantic HTML elements used throughout
- ARIA labels on icon-only buttons
- ARIA live regions for dynamic content
- Proper heading hierarchy (h1 → h2 → h3)

### 3. Visual Accessibility

- Color contrast ratios meet WCAG AA standards (4.5:1 for normal text)
- Text resizable up to 200% without loss of functionality
- No reliance on color alone to convey information
- Focus indicators visible and clear

### 4. Form Accessibility

- All inputs have associated labels
- Error messages linked to form fields via aria-describedby
- Success/error states announced to screen readers
- Autocomplete attributes for autofill support

### 5. Mobile & Touch Accessibility

- Touch targets minimum 44x44px
- Swipe gestures optional (alternative navigation available)
- Pinch-to-zoom enabled
- Safe area insets for iOS devices

---

## 📋 Accessibility Checklist

### Every New Component Must Have:

- [ ] Proper semantic HTML (not just divs)
- [ ] Keyboard navigation support
- [ ] Focus indicators on interactive elements
- [ ] ARIA labels for icon-only buttons
- [ ] Screen reader announcements for dynamic content
- [ ] Color contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Touch targets ≥ 44x44px

---

## 🛠️ Tools & Components

### Skip to Content

```tsx
import { SkipToContent } from '@/components/accessibility/skip-to-content'

// In root layout
<SkipToContent />
<main id="main-content">
  {/* Content */}
</main>
```

### Visually Hidden

```tsx
import { VisuallyHidden } from '@/components/accessibility/visually-hidden'

// Hide text visually but keep for screen readers
;<button>
  <IconTrash />
  <VisuallyHidden>Eliminar cliente</VisuallyHidden>
</button>
```

### ARIA Patterns

#### Icon-Only Buttons

```tsx
<button aria-label="Cerrar modal">
  <IconX />
</button>
```

#### Loading States

```tsx
<div role="status" aria-live="polite">
  {isLoading ? 'Cargando...' : 'Contenido cargado'}
</div>
```

#### Form Errors

```tsx
;<input aria-invalid={hasError} aria-describedby={hasError ? 'error-message' : undefined} />
{
  hasError && (
    <span id="error-message" role="alert">
      {errorMessage}
    </span>
  )
}
```

#### Modal Dialogs

```tsx
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Título del Modal</h2>
</div>
```

---

## 🎨 Color Contrast Guidelines

### Text Contrast Ratios

| Text Size       | Contrast Ratio (WCAG AA) | Contrast Ratio (WCAG AAA) |
| --------------- | ------------------------ | ------------------------- |
| Normal (< 24px) | 4.5:1                    | 7:1                       |
| Large (≥ 24px)  | 3:1                      | 4.5:1                     |
| UI Components   | 3:1                      | -                         |

### Testing Contrast

Use the browser DevTools or online tools:

- Chrome DevTools: Inspect → Accessibility → Contrast
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## ⌨️ Keyboard Shortcuts

### Global

- `Tab` - Navigate forward
- `Shift + Tab` - Navigate backward
- `Enter` - Activate button/link
- `Space` - Toggle checkbox/button
- `Escape` - Close modal/dropdown

### Forms

- `Up/Down Arrow` - Navigate select options
- `Space` - Toggle checkbox
- `Enter` - Submit form

### Modals

- `Escape` - Close modal
- `Tab` - Trap focus within modal

---

## 🧪 Testing Accessibility

### Manual Testing

1. **Keyboard Only**: Navigate entire app without mouse
2. **Screen Reader**: Test with VoiceOver (Mac) or NVDA (Windows)
3. **Zoom**: Increase text size to 200%
4. **Color Blindness**: Use browser extensions to simulate

### Automated Testing

```bash
# Run accessibility tests (future)
npm run test:a11y
```

### Browser Extensions

- [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility-testing/lhdoppojpmngadmnindnejefpokejbdd)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (Built into Chrome)

---

## 🚫 Common Pitfalls to Avoid

### ❌ Don't Do This

```tsx
// No accessible name
<button><IconTrash /></button>

// Color only indicator
<span className="text-red-500">Error</span>

// Div as button
<div onClick={handleClick}>Click me</div>

// Missing label
<input placeholder="Email" />
```

### ✅ Do This Instead

```tsx
// Accessible button
<button aria-label="Eliminar">
  <IconTrash />
</button>

// Icon + text indicator
<span className="text-red-500">
  <IconAlert /> Error: Invalid email
</span>

// Proper button
<button onClick={handleClick}>Click me</button>

// Labeled input
<label htmlFor="email">Email</label>
<input id="email" placeholder="tu@email.com" />
```

---

## 📱 Mobile Accessibility

### Touch Targets

- Minimum size: 44x44px (Apple HIG)
- Minimum spacing: 8px between targets
- Use `touch-target` utility class

### Gestures

- Provide alternative to swipe gestures
- Don't require complex gestures
- Support single-finger interactions

### iOS Safe Areas

```tsx
// Use safe area utilities
<footer className="pb-safe">{/* Content */}</footer>
```

---

## 🎯 WCAG 2.1 Level AA Compliance

Our target is **WCAG 2.1 Level AA** compliance.

### Key Principles

1. **Perceivable**: Information presented in ways users can perceive
2. **Operable**: UI components operable by all users
3. **Understandable**: Information and UI operation must be understandable
4. **Robust**: Content must be robust enough to work with assistive technologies

### Success Criteria Checklist

- [x] 1.4.3 Contrast (Minimum)
- [x] 2.1.1 Keyboard
- [x] 2.1.2 No Keyboard Trap
- [x] 2.4.1 Bypass Blocks (Skip to Content)
- [x] 2.4.3 Focus Order
- [x] 2.4.7 Focus Visible
- [x] 3.2.1 On Focus (no context change)
- [x] 3.2.2 On Input (no unexpected context change)
- [x] 3.3.1 Error Identification
- [x] 3.3.2 Labels or Instructions
- [x] 4.1.2 Name, Role, Value (ARIA)

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project](https://www.a11yproject.com/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Apple Human Interface Guidelines - Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

---

## 🔄 Regular Audits

Run accessibility audits:

1. **Monthly**: Full keyboard navigation test
2. **Before each release**: Automated accessibility scan
3. **Quarterly**: Screen reader testing
4. **New features**: Manual accessibility review

---

Last updated: Session 26 - Phase 4
