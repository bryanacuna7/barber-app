---
description: Batch analyze design references or score a page against quality rubric
---

# /design-audit — Design Quality Assessment

**Input:** $ARGUMENTS

## Modes

Parse the first word of arguments to determine mode:

### Mode 1: `batch {category}`
Example: `/design-audit batch booking`

1. List all files in `design-references/mobbin/{category}/`
2. Find screenshots that don't have a `.meta.md` sidecar yet
3. Analyze each un-analyzed screenshot using the /design-ref 7-layer protocol
4. Generate meta files and update README catalog
5. Summary: "Analyzed X new references in {category}. Y design debt items added."

### Mode 2: `page {route}`
Example: `/design-audit page /citas`

1. Take a screenshot of the page using Chrome DevTools MCP (mobile + desktop)
2. Find all references in relevant categories for that page
3. Compare current page against each reference
4. Produce a gap analysis highlighting biggest improvement opportunities
5. Add findings to DESIGN_DEBT.md

### Mode 3: `score {page}`
Example: `/design-audit score /citas`

1. Take a screenshot of the page (mobile viewport via Chrome DevTools MCP)
2. Score on 10 dimensions (0-10 each, weighted):

| Dimension | Weight | What to Evaluate |
|-----------|--------|-----------------|
| Visual Hierarchy | 15% | Most important info most prominent? |
| Component Quality | 15% | Polished buttons, cards, inputs? |
| Typography | 10% | Consistent scale, appropriate weights? |
| Spacing & Rhythm | 10% | Consistent 8px grid, comfortable density? |
| Color Harmony | 10% | Limited palette, meaningful color use? |
| Interaction Design | 10% | Appropriate feedback, state changes? |
| Empty/Error States | 10% | Graceful edge case handling? |
| Micro-Details | 10% | Shadows, radii, separators consistent? |
| Mobile Polish | 5% | Touch targets, safe areas, gestures? |
| Dark Mode | 5% | Proper contrast, not just inverted? |

3. Compare against Mobbin references if available for this page category
4. Save scorecard to `design-references/scorecards/{page-name}.md`
5. Output the scorecard with top 3 improvements

**Score interpretation:**
- 9-10: Mobbin-worthy / Awwwards level
- 7-8: Professional SaaS quality
- 5-6: Functional but unpolished
- Below 5: Needs redesign

### Mode 4: `progress`
Example: `/design-audit progress`

1. Read all scorecards in `design-references/scorecards/`
2. Show progress table:

| Page | Previous | Current | Target | Delta |
|------|----------|---------|--------|-------|

3. Highlight pages that improved and pages that need attention
4. Show design debt stats (total, completed, remaining)

## Reference Files
- Design tokens: `src/lib/design-system.ts`
- Design standards: `.claude/DESIGN_STANDARDS.md`
- Reference library: `design-references/README.md`
- Design debt: `design-references/DESIGN_DEBT.md`
- Scorecards: `design-references/scorecards/`
