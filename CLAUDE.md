# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## 🚨 REGLAS CRÍTICAS (LEER PRIMERO)

Estas reglas son **OBLIGATORIAS**, no sugerencias:

### 1. SIEMPRE verificar cambios UI visualmente
```
Después de modificar CSS/componentes → Playwright screenshot OBLIGATORIO
NUNCA decir "debería verse bien" sin verificar
```

### 2. SIEMPRE mostrar qué agente se usa
```
Antes de trabajar → "🤖 Using @[agente]..."
Leer .claude/agents/[agente].md para instrucciones específicas
```

### 3. SIEMPRE verificar el dev server antes de preview
```
lsof -i :3000 | grep LISTEN
Si no corre → iniciar automáticamente
```

### 4. NUNCA asumir que el código funciona
```
Cambio de UI → screenshot
Cambio de lógica → test o verificación
Fix de bug → confirmar que está resuelto
```

---

## Session Continuity (Automático)

### Al Inicio de Sesión - SIEMPRE ejecuta esto primero:

```bash
ls PROGRESS.md 2>/dev/null
```

**Si PROGRESS.md existe:**
1. Léelo silenciosamente
2. Muestra resumen breve:
   ```
   📋 Sesión anterior: [resumen 1 línea]
   ➡️  Siguiente: [próxima tarea]

   ¿Continuamos o prefieres algo diferente?
   ```

**Si no existe:** Continúa normalmente.

### Auto-Save - Después de completar trabajo importante:

Automáticamente actualiza `PROGRESS.md` cuando:
- ✅ Se completa una feature (`/create`, `/enhance`)
- ✅ Se hace deploy (`/deploy`)
- ✅ Se hace commit (`/commit`)
- ✅ El usuario dice "listo", "terminé", "por hoy"

**No preguntes permiso** - simplemente actualiza PROGRESS.md silenciosamente y confirma:
```
💾 Progreso guardado automáticamente.
```

### Comandos Manuales (opcionales):
- `/continue` - Forzar lectura de PROGRESS.md
- `/save-progress` - Forzar guardado manual

---

## Automatic Behaviors (Zero-Config)

Estos comportamientos se ejecutan **automáticamente** sin que el usuario lo pida.

### 🚀 Auto Dev Server

**IMPORTANTE:** Verificar servidor en MÚLTIPLES momentos, no solo al inicio.

**Cuándo verificar:**
1. Al inicio de sesión
2. Después de crear/modificar componentes UI
3. Cuando el usuario pide "ver", "probar", "revisar" algo visual
4. Cuando hay error de conexión o fetch failed
5. Después de `/create`, `/enhance` que afecten UI

**Verificación:**
```bash
lsof -i :3000 2>/dev/null | grep LISTEN
```

| Estado | Acción |
|--------|--------|
| No está corriendo | **Iniciar automáticamente** en background: `npm run dev &` |
| Ya está corriendo | Silencioso (no mostrar nada) |
| Puerto ocupado por otro | Liberar y reiniciar: `kill $(lsof -t -i:3000) && npm run dev &` |

**Comportamiento:**
- **NO preguntar** - iniciar directamente
- Mostrar brevemente: "🟢 Server started at http://localhost:3000"
- Si el usuario menciona "ver", "probar", "preview" → verificar servidor PRIMERO

**Auto-restart:** Si el servidor crashea, reiniciar inmediatamente sin preguntar.

### 🔧 Auto-Fix Errors

**Cuando ocurre un error**, arreglarlo automáticamente:

| Error | Auto-Fix | Mensaje |
|-------|----------|---------|
| ESLint errors | `npm run lint -- --fix` | "🔧 Fixed X lint errors" |
| Prettier format | `npx prettier --write [file]` | "🔧 Formatted" |
| TypeScript (simple) | Aplicar fix sugerido | "🔧 Fixed type error" |
| Missing semicolon | Auto-add | (silencioso) |
| Unused imports | Auto-remove | "🧹 Removed unused imports" |

**No preguntar** - arreglar y confirmar brevemente.

### 🛠️ Error Recovery

**Detectar y resolver errores comunes automáticamente:**

| Error | Detección | Auto-Recovery |
|-------|-----------|---------------|
| `EADDRINUSE :3000` | Puerto ocupado | `kill -9 $(lsof -t -i:3000)` + restart |
| `node_modules not found` | npm error | `npm install` automático |
| `Cannot find module 'X'` | Import error | `npm install X` automático |
| `ENOENT .env` | Archivo faltante | Crear desde `.env.example` |
| `lock file conflict` | npm/yarn conflict | Delete lock + reinstall |
| `CORS error` | API error | Sugerir configuración específica |
| `Build failed` | Next.js/Vite error | Mostrar error + sugerir fix |

**Flujo:**
1. Detectar error
2. Intentar auto-fix
3. Si funciona → "🔧 Resuelto: [problema]"
4. Si no funciona → Explicar y pedir input

### 👁️ Auto-Preview (UI Changes) - OBLIGATORIO

> ⚠️ **REGLA CRÍTICA:** NUNCA describir cambios UI sin verificar visualmente.
> Si modificas un componente, DEBES usar Playwright para ver el resultado.
> NO es opcional. NO es "cuando sea posible". ES OBLIGATORIO.

**Archivos que REQUIEREN preview visual:**
- `src/app/**/*.tsx`
- `src/components/**/*.tsx`
- `src/pages/**/*.tsx`
- `*.css`, `*.scss`, `tailwind.config.*`

**Flujo OBLIGATORIO después de cambio UI:**

```
1. Editar archivo ────────────────────────────────────────────────┐
2. Verificar server: lsof -i :3000 | grep LISTEN                  │
3. Si no corre → npm run dev (esperar ready)                      │
4. Usar Playwright MCP:                                           │
   - playwright_navigate a localhost:3000/[ruta]                  │
   - playwright_screenshot                                        │
5. Mostrar screenshot al usuario                                  │
6. Verificar: ¿Se ve correcto? ¿Hay errores?                      │
7. Si hay problema visual → arreglar ANTES de continuar           │
└─────────────────────────────────────────────────────────────────┘
```

**Comandos Playwright a usar:**
```
mcp__playwright__playwright_navigate → ir a la URL
mcp__playwright__playwright_screenshot → capturar pantalla
mcp__playwright__playwright_click → interactuar si necesario
```

**Output esperado:**
```
🟢 Server running
🖼️ Verificando cambios visualmente...
[screenshot inline]
✅ UI se ve correcta / ❌ Detectado problema: [descripción]
```

**PROHIBIDO:**
- ❌ Decir "el cambio debería verse bien" sin verificar
- ❌ Asumir que el CSS funciona sin screenshot
- ❌ Confiar en que el código está correcto sin preview
- ❌ Esperar a que el usuario reporte problemas visuales

**Si usuario dice "se ve mal", "revisa", "verifica":** Playwright INMEDIATAMENTE.

### 📦 Smart Dependencies

**TRIGGER:** Cuando escribo/edito código con imports

**Acción:** Verificar si el paquete está instalado
```bash
grep "package-name" package.json
```

**Si no está instalado:**
1. Instalar automáticamente: `npm install package-name`
2. Confirmar: "📦 Installed: package-name"

---

## Comportamientos Semi-Automáticos (Trigger → Acción)

> Estos comportamientos se activan con triggers específicos.
> Claude DEBE ejecutarlos cuando ocurre el trigger.

### Después de modificar archivos de AUTH/PAYMENT → Security Check

**Trigger:** Editar archivos en:
- `**/auth/**`, `**/login/**`, `**/payment/**`, `**/api/admin/**`

**Acción OBLIGATORIA:**
1. Escanear el código modificado por:
   - Hardcoded secrets (API keys, passwords)
   - SQL injection (`${}` en queries)
   - XSS vulnerabilities (innerHTML sin sanitizar)
2. Reportar:
   ```
   🔒 Security check: ✅ Passed / ⚠️ [issue found]
   ```

---

### Después de modificar archivos en src/lib o src/utils → Run Tests

**Trigger:** Editar archivos en:
- `src/lib/**`, `src/utils/**`, `src/api/**`

**Acción OBLIGATORIA:**
1. Buscar tests relacionados: `ls **/__tests__/*[filename]*`
2. Si existen tests → ejecutarlos: `npm test -- [test-file]`
3. Reportar: `✅ Tests OK` o `❌ Test failed: [error]`

---

### Después de crear API route → Update .env.example

**Trigger:** Crear archivo en `src/app/api/**` o `pages/api/**`

**Acción OBLIGATORIA:**
1. Verificar si usa variables de entorno (`process.env.X`)
2. Si usa nuevas variables → agregarlas a `.env.example`
3. Confirmar: `📚 Added X_API_KEY to .env.example`

---

### Después de /create o /enhance → Sugerir siguiente paso

**Trigger:** Completar comando `/create` o `/enhance`

**Acción OBLIGATORIA:**
1. Guardar progreso en PROGRESS.md
2. Sugerir siguiente paso:
   ```
   ✅ Feature created/enhanced
   💡 Next: `/test` to verify, `/commit` when ready
   ```

---

### Después de /commit → Verificar si hay más cambios

**Trigger:** Completar comando `/commit`

**Acción:**
1. Ejecutar `git status`
2. Si hay cambios pendientes → avisar
3. Si no hay cambios → `✅ Working tree clean`

---

### Cuando el build falla → Analizar y sugerir fix

**Trigger:** Error en `npm run build` o `npm run dev`

**Acción OBLIGATORIA:**
1. Leer el error completo
2. Identificar causa raíz
3. Proponer fix específico
4. Si es simple (typo, import faltante) → arreglar automáticamente

---

### Cuando usuario dice "funciona" o "listo" → Guardar progreso

**Trigger:** Usuario indica que terminó algo:
- "listo", "funciona", "done", "terminé", "ya quedó"

**Acción:**
1. Actualizar PROGRESS.md con lo completado
2. Confirmar: `💾 Progress saved`

---

### Cuando escribo código con console.log → Advertir antes de commit

**Trigger:** Ejecutar `/commit` con archivos que tienen `console.log`

**Acción:**
1. Detectar console.logs en archivos staged
2. Advertir: `⚠️ Found X console.log statements. Remove before production?`
3. Ofrecer removerlos automáticamente

---

### Cuando creo componente UI con <img> → Verificar a11y

**Trigger:** Crear/editar componente con `<img>` tags

**Acción:**
1. Verificar que tiene `alt` attribute
2. Si falta → advertir y sugerir fix
3. También verificar: `<input>` sin label, `<div onClick>` sin role

---

## Memory MCP - Memoria Persistente

> Con Memory MCP configurado, Claude SÍ puede recordar entre sesiones.

**Configuración actual** (`.mcp.json`):
```json
"memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory", "--file", ".claude/memory.json"]
}
```

### Qué guardar en Memory MCP

**TRIGGER:** Al detectar preferencia del usuario

**Guardar con `mcp__memory__create_entities`:**
```
- Preferencias de código (Tailwind vs CSS, arrow vs function)
- Patrones usados frecuentemente
- Errores que el usuario corrige manualmente
- Stack tecnológico del proyecto
```

**Ejemplo:**
```
Usuario corrige: "usa arrow functions, no function declarations"
→ Guardar: { entity: "user_preferences", observation: "prefers arrow functions" }
```

### Qué NO funciona (sin timers)

| Feature | Por qué no |
|---------|-----------|
| Auto-backup cada 15 min | No hay timers |
| Reportes semanales | No hay concepto de tiempo |

**Alternativa:** Usar `/status` cuando quieras ver health del proyecto.

---

## Intelligent Routing - IMPLEMENTACIÓN REAL

> ⚠️ **REGLA CRÍTICA:** Los agentes NO son solo documentación.
> DEBES leer el archivo del agente y seguir sus instrucciones específicas.

### Flujo OBLIGATORIO para cada tarea:

```
1. Usuario hace request ─────────────────────────────────────────┐
2. Analizar keywords para detectar tipo de tarea                 │
3. Seleccionar agente apropiado (ver matriz abajo)               │
4. LEER el archivo del agente: .claude/agents/[nombre].md        │
5. Mostrar: "🤖 Using @[agente]..."                              │
6. Seguir las instrucciones específicas del agente               │
7. Aplicar el expertise del agente al trabajo                    │
└────────────────────────────────────────────────────────────────┘
```

### Agent Selection Matrix

| Keywords en request | Agente | Archivo a leer |
|---------------------|--------|----------------|
| component, react, css, UI, layout, button, form | `fullstack-developer` | `.claude/agents/fullstack-developer.md` |
| api, endpoint, server, database, backend | `fullstack-developer` | `.claude/agents/fullstack-developer.md` |
| error, bug, crash, not working, falla, no funciona | `debugger` | `.claude/agents/debugger.md` |
| test, coverage, unit, e2e, jest, vitest | `test-engineer` | `.claude/agents/test-engineer.md` |
| slow, optimize, memory, performance, lento | `performance-profiler` | `.claude/agents/performance-profiler.md` |
| auth, jwt, password, security, xss, sql injection | `security-auditor` | `.claude/agents/security-auditor.md` |
| refactor, migrate, modernize, arquitectura | `architecture-modernizer` | `.claude/agents/architecture-modernizer.md` |
| docs, readme, comments, documentar | `documentation-expert` | `.claude/agents/documentation-expert.md` |
| design, UI/UX, colores, estilos, diseño | `ui-ux-designer` | `.claude/agents/ui-ux-designer.md` |

### Ejemplo de uso correcto:

```
Usuario: "El botón de búsqueda se ve mal, el ícono se sobrepone"

Claude debe:
1. Detectar: keywords "botón", "se ve mal" → UI issue + bug
2. Seleccionar: @fullstack-developer (UI) + @debugger (fix)
3. Leer: .claude/agents/fullstack-developer.md
4. Mostrar: "🤖 Using @fullstack-developer to fix UI issue..."
5. Arreglar el código
6. OBLIGATORIO: Usar Playwright para verificar el fix visualmente
7. Mostrar screenshot confirmando que se ve bien
```

### PROHIBIDO:
- ❌ Ignorar la matriz de agentes
- ❌ No mostrar qué agente se está usando
- ❌ No leer el archivo del agente
- ❌ Trabajar sin el expertise específico del agente

### Override manual:
Si el usuario menciona `@agent-name` explícitamente, usar ese agente.

## Project Overview

**[Project Name]**

[Brief description of your project]

## Tech Stack

- [Framework/Language]
- [Database]
- [Other tools]

## Development Commands

```bash
# Start development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Architecture

### Key Directories
- `src/` - Source code
- `tests/` - Test files
- `docs/` - Documentation

### Key Files
- [Important file] - [Purpose]

## Critical Rules

| Rule | Description |
|------|-------------|
| TypeScript | All code must be typed |
| Tests | PRs require test coverage |
| Formatting | Use Prettier/ESLint |

## High-Risk Areas

Changes to these require extra review:

| Area | Risk |
|------|------|
| Authentication | Security critical |
| Payment | Financial data |
| Database migrations | Data integrity |

## File Location Rules

| Type | Location |
|------|----------|
| Governance docs | Root (UPPERCASE.md) |
| Technical docs | docs/reference/ |
| Specs | docs/specs/ |
| Archive | docs/archive/ |

## Commit Format

```
<type>(<scope>): <title>

- What: Observable change
- Why: Reason for change
- Verify: How to confirm
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Required Reading Before Changes

1. **GUARDRAILS.md** - Non-negotiable behavior
2. **DECISIONS.md** - Design rationale

## Available Commands

| Command | Description |
|---------|-------------|
| `/setup` | Configure project |
| `/continue` | Resume where you left off |
| `/save-progress` | Save state for next session |
| `/commit` | Smart git commit |
| `/create` | Create feature/app |
| `/brainstorm` | Explore options |
| `/plan` | Implementation plan |
| `/deploy` | Production deploy |
| `/test` | Run tests |
| `/debug` | Debug issues |
| `/enhance` | Improve code |
| `/preview` | Preview changes |
| `/status` | Project status |
| `/orchestrate` | Multi-agent tasks |
| `/code-review` | Quality review |
| `/generate-tests` | Generate tests |

## Proactive Behavior

Claude should proactively:

| When you see... | Suggest... |
|-----------------|------------|
| UI testing needed | "Use Playwright to verify?" |
| Auth/payment code | "Run security review?" |
| Performance issues | "Profile with performance-profiler?" |
| Complex refactor | "Create plan first?" |
| New feature | "Brainstorm options?" |

## Development Flow Suggestions

**IMPORTANT:** Guide users through the development flow automatically.

### Entry Point - New Requests

When a user arrives with a new feature request (not a bug fix or specific task), suggest starting the flow:

| User says... | Suggest... |
|--------------|------------|
| "Quiero agregar X" | "Let's explore options first! Use `/brainstorm [feature]`" |
| "Necesito implementar Y" | "Want to explore approaches? Start with `/brainstorm`" |
| "Hay que hacer Z" | "Let's plan this out. Use `/brainstorm` to explore options" |
| Vague request without clear path | "Let's start with `/brainstorm` to explore the best approach" |

**Exception:** If the user has a very specific, small task (like "add a button that does X"), skip brainstorm and suggest `/create` directly.

### After Commands - Next Steps + Auto-Save

| After completing... | Action | Suggest next... |
|---------------------|--------|-----------------|
| `/brainstorm` | - | "Ready to plan? Use `/plan`" |
| `/plan` | - | "Plan ready! Use `/create` to start building" |
| `/create` | **Auto-save** | "Feature created! `/enhance` or `/refactor-code`" |
| `/enhance` | **Auto-save** | "Enhanced! `/refactor-code` to clean up" |
| `/refactor-code` | - | "Code cleaned! `/test` or `/generate-tests`" |
| `/test` (pass) | - | "Tests pass! `/commit`" |
| `/test` (fail) | - | "Tests failing. `/debug` to investigate" |
| `/debug` | - | "Bug fixed! `/test` to verify" |
| `/commit` | **Auto-save** | "Committed! `/create-pr` or `/deploy preview`" |
| `/create-pr` | **Auto-save** | "PR created! Monitor and merge" |
| `/deploy` | **Auto-save** | "Deployed! 🎉" |

**Auto-save** = Actualiza PROGRESS.md automáticamente (sin preguntar)

### How to Suggest

After each command, add a brief suggestion:

```
✅ [Command completed successfully]

💡 Next step: [suggestion based on table above]
```

Example:
```
✅ Feature created: Authentication system with JWT

💡 Next step: Want to add more features? Use `/enhance`
   Or clean up the code? Use `/refactor-code`
```
