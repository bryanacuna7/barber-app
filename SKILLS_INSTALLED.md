# 🎯 Skills de skills.sh Instalados

Instalación completada el 2026-01-28

---

## ✅ Skills Instalados (3 skills)

### 1. **web-design-guidelines** (47.4K installs)

**Ubicación:**
- `claude-starter-kit/.agents/skills/web-design-guidelines/`
- `barber-app/.agents/skills/web-design-guidelines/`

**Qué hace:**
Auditoría automática de UI con 100+ reglas cubriendo:
- ✅ Accesibilidad (WCAG)
- ⚡ Performance
- 🎨 UX best practices

**Cómo se activa:**
El skill se activa automáticamente cuando el usuario dice:
- "review my UI"
- "check accessibility"
- "audit design"
- "review UX"
- "check my site against best practices"

**Funcionamiento:**
1. Fetcha las guidelines más recientes desde:
   ```
   https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
   ```
2. Lee los archivos especificados
3. Aplica todas las reglas
4. Reporta hallazgos en formato `file:line`

**Ejemplo de uso:**
```
Usuario: "Revisa la accesibilidad de mi header"
Claude: [Activa web-design-guidelines automáticamente]

        Findings:
        src/components/Header.tsx:12 - Missing alt text on logo image
        src/components/Header.tsx:24 - Button missing aria-label
        src/components/Header.tsx:45 - Low contrast ratio (3.2:1, needs 4.5:1)
```

---

### 2. **vercel-composition-patterns**

**Ubicación:**
- `claude-starter-kit/.agents/skills/vercel-composition-patterns/`
- `barber-app/.agents/skills/vercel-composition-patterns/`

**Qué hace:**
Patrones arquitectónicos de React para componentes escalables:
- 🏗️ Compound Components
- 🔄 State Management patterns
- 🎯 Composition over boolean props
- ⚛️ React 19 API updates

**Cómo se activa:**
El skill se activa cuando el usuario menciona:
- "refactor component"
- "too many props"
- "compound component"
- "context provider"
- "component architecture"

**Categorías de Reglas:**

| Prioridad | Categoría | Reglas |
|-----------|-----------|--------|
| HIGH | Component Architecture | Evitar boolean props, usar compound components |
| MEDIUM | State Management | Desacoplar implementación, context interface |
| MEDIUM | Implementation Patterns | Explicit variants, children over render props |
| MEDIUM | React 19 APIs | No forwardRef, usar use() en vez de useContext() |

**Ejemplo de uso:**
```
Usuario: "Este componente tiene demasiados props boolean"

Claude: [Activa vercel-composition-patterns]

❌ Antes (boolean prop hell):
<Modal
  isOpen={true}
  hasCloseButton={true}
  isFullScreen={false}
  hasOverlay={true}
  isDismissable={true}
/>

✅ Después (compound components):
<Modal.Root open>
  <Modal.Overlay />
  <Modal.Content>
    <Modal.CloseButton />
    {children}
  </Modal.Content>
</Modal.Root>
```

---

### 3. **vercel-react-native-skills**

**Ubicación:**
- `claude-starter-kit/.agents/skills/vercel-react-native-skills/`
- `barber-app/.agents/skills/vercel-react-native-skills/`

**Qué hace:**
Best practices para React Native y Expo:
- 📱 Mobile performance optimization
- 🎬 Animaciones fluidas
- ⚡ List rendering optimization
- 🔌 Native modules integration
- 🎯 Platform-specific APIs (iOS/Android)

**Cómo se activa:**
El skill se activa cuando el usuario menciona:
- "React Native component"
- "optimize list performance"
- "mobile animations"
- "Expo app"
- "native module"
- "iOS/Android specific"

**Categorías de Best Practices:**

| Prioridad | Área | Ejemplos |
|-----------|------|----------|
| HIGH | List Performance | FlatList optimization, virtualization |
| HIGH | Animations | Reanimated 2/3, gesture handlers |
| MEDIUM | Navigation | React Navigation best practices |
| MEDIUM | State Management | Redux, Zustand, Context patterns |
| MEDIUM | Native Modules | Expo modules, bridging |

**Ejemplo de uso:**
```
Usuario: "Esta FlatList se siente lenta al hacer scroll"

Claude: [Activa vercel-react-native-skills]

❌ Antes (problemas de performance):
<FlatList
  data={largeDataset}
  renderItem={({ item }) => <ComplexComponent item={item} />}
/>

✅ Después (optimizado):
<FlatList
  data={largeDataset}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  windowSize={10}
  maxToRenderPerBatch={10}
  initialNumToRender={10}
  removeClippedSubviews={true}
  getItemLayout={getItemLayout}
/>

const renderItem = useCallback(({ item }) => (
  <MemoizedComplexComponent item={item} />
), []);
```

---

## 📂 Estructura de Archivos

```
.agents/
└── skills/
    ├── vercel-composition-patterns/
    │   ├── SKILL.md              # Metadata y descripción
    │   ├── AGENTS.md             # Guía completa compilada
    │   └── rules/                # Reglas individuales
    │       ├── architecture-avoid-boolean-props.md
    │       ├── state-context-interface.md
    │       └── ...
    ├── vercel-react-native-skills/
    │   ├── SKILL.md              # Metadata y triggers
    │   ├── AGENTS.md             # Guía completa
    │   └── rules/                # Best practices mobile
    │       ├── list-performance.md
    │       ├── animations.md
    │       └── ...
    └── web-design-guidelines/
        └── SKILL.md              # Metadata y trigger
```

**Nota:** Los nuevos skills usan `.agents/skills/` en lugar de `.claude/skills/` (formato skills.sh)

---

## 🎯 Diferencia con Skills Existentes

### Skills Existentes (`.claude/skills/`)
- Creados manualmente para el starter kit
- Formato markdown simple
- Siempre activos

### Skills de skills.sh (`.agents/skills/`)
- Instalados desde repositorios externos
- Formato con metadata YAML
- Se activan bajo condiciones específicas (triggers)
- Auto-actualizables

**Complementan tus skills existentes:**

| Tu Skill | Nuevo Skill | Relación |
|----------|-------------|----------|
| `react-patterns` | `vercel-composition-patterns` | ✅ Complementario - Composition vs Patterns |
| `ui-ux-designer` | `web-design-guidelines` | ✅ Complementario - Design vs Audit |
| `mobile-development` | `vercel-react-native-skills` | ✅ Complementario - General vs Vercel Best Practices |

---

## 🚀 Cómo Usar

### Activación Automática

Los skills se activan automáticamente cuando detectan keywords relevantes:

```
Usuario: "Necesito refactorizar este Modal, tiene muchos props"
Claude: 🤖 Using @frontend-specialist...
        📦 Loading vercel-composition-patterns...

        Detecté que tienes boolean prop proliferation.
        Te sugiero usar compound components...
```

### Activación Manual

Puedes también mencionarlos explícitamente:

```
Usuario: "Usa web-design-guidelines para revisar mi componente"
Claude: 📦 Loading web-design-guidelines...
```

---

## 🔄 Actualización de Skills

Para actualizar a las últimas versiones:

```bash
# Claude-starter-kit
cd /Users/bryanacuna/Documents/claude-starter-kit
npx skills add vercel-labs/agent-skills --skill web-design-guidelines --update

# Barber-app
cd /Users/bryanacuna/Desktop/barber-app
npx skills add vercel-labs/agent-skills --skill web-design-guidelines --update
```

---

## 📊 Resumen de Instalación

```
✅ Instalados en: 2 proyectos
✅ Total de skills: 3 skills nuevos
   - web-design-guidelines (UI/UX audit)
   - vercel-composition-patterns (React architecture)
   - vercel-react-native-skills (Mobile development)
✅ Complementan: 20 skills existentes
✅ Auto-activación: Configurada
✅ Status: Listos para usar

Proyectos:
- /Users/bryanacuna/Documents/claude-starter-kit
- /Users/bryanacuna/Desktop/barber-app
```

---

## 🆕 Próximos Skills Recomendados

Si en el futuro necesitas más capabilities:

### Media Prioridad
- **remotion-best-practices** (44.9K installs) - Video creation
- **agent-browser** (11.7K installs) - Web scraping

### Baja Prioridad (según necesidad)
- **pdf/pptx/xlsx/docx** - Document generation
- **vercel-react-native-skills** - Mobile development

---

## 🔗 Referencias

- [Skills.sh Platform](https://skills.sh)
- [Vercel Agent Skills Repo](https://github.com/vercel-labs/agent-skills)
- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
- [Skills CLI Documentation](https://github.com/vercel-labs/skills)

---

**Último update:** 2026-01-28
**Instalado por:** Claude Code con antigravity-kit features
