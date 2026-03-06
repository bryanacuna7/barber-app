---
description: Analyze a Mobbin screenshot and generate actionable design feedback
---

# /design-ref — Analyze Design Reference

**Input:** $ARGUMENTS (path to screenshot, optionally followed by target component path)

## Instructions

You are analyzing a Mobbin UI reference screenshot to extract actionable design improvements for BarberApp.

### Step 1: Read the Screenshot
Use the Read tool to view the image at the provided path.

### Step 2: Identify Category
Determine which category this reference belongs to:
booking, calendars, cards, lists-tables, forms, navigation, empty-states, modals-sheets, settings, profiles, onboarding, charts-analytics, animations

### Step 3: 7-Layer Analysis

Analyze the screenshot systematically:

**1. Layout & Composition**
- Grid system (columns, gutters, margins)
- Visual hierarchy (what draws the eye 1st, 2nd, 3rd)
- Content density (spacious vs compact)
- Above-the-fold allocation

**2. Typography**
- Map font sizes to our design-system.ts scale (largeTitle through caption2)
- Font weights and variation
- Line heights, letter spacing
- Text truncation handling

**3. Spacing & Rhythm**
- Vertical rhythm (consistent increments)
- Map to our 8pt grid (xs=8, sm=12, md=16, lg=24, xl=32)
- Padding patterns (card internal, section gaps)
- Whitespace as design element

**4. Color & Contrast**
- Primary/accent color usage ratios
- Background layering (primary > secondary > tertiary)
- Status color semantics
- Dark mode adaptation potential
- Contrast ratios

**5. Components & Patterns**
- Map each element to existing BarberApp components (Button, Card, Sheet, Badge, Input, etc.)
- Identify components in reference that DON'T exist in our app (gap analysis)
- Note variant differences (e.g., ghost vs solid buttons)

**6. Interaction & Motion**
- Tap/hover states visible
- Animation patterns
- Gesture affordances (swipe indicators, drag handles)
- Map to our animations.spring.* tokens

**7. Micro-Details**
- Border radius consistency
- Shadow depth and diffusion
- Separator treatment
- Icon style and size consistency
- Empty state design
- Loading skeleton patterns

### Step 4: Context Filter

For each pattern found, evaluate fit:
- Barbershop context (professional + approachable, NOT corporate or playful)
- Barber users have wet/product-covered hands (larger touch targets, simpler interactions)
- Must work within TailwindCSS v4 + existing design tokens
- Must align with Apple HIG foundation
- Must not hurt PWA performance

Mark patterns as: ADOPT / ADAPT / SKIP with reasoning.

### Step 5: Comparison Matrix

If a target component was specified, produce:

| Aspect | Reference | Current App | Gap | Action |
|--------|-----------|-------------|-----|--------|

### Step 6: Generate Metadata

Auto-generate a `.meta.md` sidecar file next to the screenshot with:
- Inferred source app and platform
- Category and tags
- Key patterns extracted
- Relevance to BarberApp
- Priority rating

### Step 7: Rename & Catalog

1. Rename the file to `{category}-{###}-{description}.png` convention
2. Update `design-references/README.md` catalog with the new entry
3. If high-priority gaps found, add to `design-references/DESIGN_DEBT.md`

### Step 8: Actionable Output

End with a prioritized list:

```
## Actionable Changes (Priority Order)
1. [HIGH] [specific change] — [which file/component]
2. [MED] [specific change] — [which file/component]
3. [LOW] [specific change] — [which file/component]
```

### Reference Files
- Design tokens: `src/lib/design-system.ts`
- Design standards: `.claude/DESIGN_STANDARDS.md`
- Design audit baseline: `docs/reference/DESIGN_AUDIT_SUMMARY.md`
- Existing components: `src/components/ui/`
