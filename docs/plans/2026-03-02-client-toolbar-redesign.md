# Client Toolbar Redesign — Linear/Notion-style

**Date:** 2026-03-02
**Component:** `src/components/clients/client-search-toolbar.tsx`

## Problem

Current toolbar is flat, cluttered, and generic. Search bar feels disconnected from controls. Quick filters (Todos/VIP/En riesgo) don't stand out. Too many elements competing in one bordered container.

## Design

### Desktop (lg+): Single-row unified bar

```
🔍 Buscar...  |  Todos  ⭐ VIP  ⚠ En riesgo  |  ▦ ≡ 📅  |  ⊞ Filtros
```

- **Search**: compact `w-60`, expands to `w-80` on focus
- **Pill filters**: colored icons + segment colors when active
- **View switcher**: icon-only, no labels
- **Advanced filters**: `SlidersHorizontal` icon + badge

No outer container border. Zones separated by subtle vertical dividers.

### Mobile: Stacked

```
🔍 Buscar por nombre, teléfono...     (full width)
[Todos] [⭐ VIP] [⚠ Riesgo] [⊞ +2]   (horizontal scroll)
```

### Active States

| Filter    | Icon          | Active bg           | Active text |
| --------- | ------------- | ------------------- | ----------- |
| Todos     | none          | brand-primary solid | white       |
| VIP       | Crown         | amber-500/15        | amber-600   |
| En riesgo | AlertTriangle | red-500/15          | red-600     |

### Changes from current

- Remove outer bordered container
- Compact inline search (desktop)
- Icon + color pill filters
- Icon-only view switcher
- Subtle advanced filters button with badge
