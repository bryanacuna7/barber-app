# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## 🔄 Session Start

Al iniciar una nueva sesión, **EJECUTA AUTOMÁTICAMENTE** el comando `/continue`:

1. Lee `PROGRESS.md` para entender:
   - Qué está construido
   - Estado actual del proyecto
   - Qué sigue

2. Muestra resumen breve:

   ```
   📋 Sesión anterior: [resumen 1 línea]
   ➡️  Siguiente: [próxima tarea]

   ¿Continuamos o prefieres algo diferente?
   ```

3. Espera confirmación del usuario antes de continuar

**Nota:** Si el usuario dice algo diferente a "continuar", ajusta según su request.

---

## 🚨 REGLAS CRÍTICAS (LEER PRIMERO)

Estas reglas son **OBLIGATORIAS**, no sugerencias:

### 1. NUNCA asumir columnas de base de datos sin verificar

```
⚠️ ANTES de crear migrations, queries, o indexes:
1. Leer DATABASE_SCHEMA.md (única fuente de verdad)
2. Verificar que columnas/tablas EXISTEN
3. NUNCA asumir features futuras están implementadas

PROHIBIDO:
❌ Crear migration sin leer DATABASE_SCHEMA.md primero
❌ Asumir columnas como deposit_paid, last_activity_at sin verificar
❌ Usar tablas que no están documentadas en DATABASE_SCHEMA.md
```

### 2. SIEMPRE verificar cambios UI visualmente

```
Después de modificar CSS/componentes → Playwright screenshot OBLIGATORIO
NUNCA decir "debería verse bien" sin verificar
```

### 3. SIEMPRE mostrar qué agente se usa

```
Antes de trabajar → "🤖 Using @[agente]..."
Leer .claude/agents/[agente].md para instrucciones específicas
```

### 4. SIEMPRE verificar el dev server antes de preview

```
lsof -i :3000 | grep LISTEN
Si no corre → iniciar automáticamente
```

### 5. NUNCA asumir que el código funciona

```
Cambio de UI → screenshot
Cambio de lógica → test o verificación
Fix de bug → confirmar que está resuelto
Cambio de DB → verificar contra DATABASE_SCHEMA.md
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
- `/remember [info]` - Guardar información específica en Memory MCP

---

## 🧠 Memory Auto-Save (Memoria Persistente)

Claude puede recordar información importante entre sesiones usando Memory MCP.

### Qué se guarda automáticamente:

**Triggers de auto-save** (sin intervención del usuario):

1. **Después de /commit:**
   - Si el mensaje menciona "fix bug", "security", "breaking change"
   - Guardar patrón en `lessons_learned` entity
   - Ejemplo: "Session 73: Race condition fixed with atomic DB function"

2. **Después de /create o /enhance:**
   - Decisiones arquitectónicas tomadas
   - Nuevos patrones implementados
   - Dependencias agregadas a `tech_stack`

3. **Cuando usuario corrige mi código:**
   - Detectar patrón: "No, usa X en lugar de Y"
   - Guardar en `code_style_preferences` o entity relevante
   - Ejemplo: "User prefers const over let for immutable values"

4. **Después de /deploy:**
   - Actualizar `current_implementation_status`
   - Features deployadas

5. **Cuando se modifican archivos críticos:**
   - `DATABASE_SCHEMA.md` → actualizar `database_architecture`
   - `DECISIONS.md` → nuevas decisiones arquitectónicas
   - `package.json` → actualizar `tech_stack`

### Detección de Información Valiosa:

Claude detecta y guarda automáticamente cuando el usuario dice:

| Patrón detectado        | Ejemplo                             | Entity actualizada       |
| ----------------------- | ----------------------------------- | ------------------------ |
| Preferencia de código   | "prefiero usar X", "siempre usa Y"  | `code_style_preferences` |
| Decisión arquitectónica | "vamos a usar X para Y porque..."   | `architecture_pattern`   |
| Bug pattern             | "esto causó un bug antes"           | `lessons_learned`        |
| Seguridad               | "NUNCA hagas X porque..."           | `security_pattern`       |
| Workflow                | "cuando hagas X, siempre Y primero" | `workflow`               |

### Comando Manual /remember:

Para guardar explícitamente:

```
/remember "prefiero Playwright para UI testing"
/remember decision: usar WebSocket en lugar de polling
/remember bug: last_activity_at debe ser last_visit_at
/remember security: validar business_id en TODAS las queries
```

### Confirmación:

Cuando se guarda algo en memoria, mostrar brevemente:

```
💾 Saved to memory: [entity_name]
```

**No mostrar confirmación** si es parte de auto-save silencioso (post-commit, post-feature).

### Entidades en Memoria:

El proyecto barber-app tiene **32 entidades principales** en memoria:

- `barber_app_project` - Identidad del proyecto
- `tech_stack` - Stack tecnológico
- `database_architecture` - Arquitectura de BD
- `auth_middleware_pattern` - Patrones de auth
- `code_style_preferences` - Estilos de código
- `lessons_learned` - Lecciones de bugs
- `automation_preferences` - Preferencias de automatización
- `immediate_priorities` - Prioridades actuales
- ... (ver grafo completo con `mcp__memory__read_graph`)

### Beneficios:

- ✅ Claude recuerda preferencias entre sesiones
- ✅ No repite errores pasados (lessons_learned)
- ✅ Aplica convenciones del proyecto automáticamente
- ✅ Conoce el estado actual sin preguntar
- ✅ Sigue patrones de seguridad críticos

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

| Estado                  | Acción                                                          |
| ----------------------- | --------------------------------------------------------------- |
| No está corriendo       | **Iniciar automáticamente** en background: `npm run dev &`      |
| Ya está corriendo       | Silencioso (no mostrar nada)                                    |
| Puerto ocupado por otro | Liberar y reiniciar: `kill $(lsof -t -i:3000) && npm run dev &` |

**Comportamiento:**

- **NO preguntar** - iniciar directamente
- Mostrar brevemente: "🟢 Server started at http://localhost:3000"
- Si el usuario menciona "ver", "probar", "preview" → verificar servidor PRIMERO

**Auto-restart:** Si el servidor crashea, reiniciar inmediatamente sin preguntar.

### 🔧 Auto-Fix Errors

**Cuando ocurre un error**, arreglarlo automáticamente:

| Error               | Auto-Fix                      | Mensaje                     |
| ------------------- | ----------------------------- | --------------------------- |
| ESLint errors       | `npm run lint -- --fix`       | "🔧 Fixed X lint errors"    |
| Prettier format     | `npx prettier --write [file]` | "🔧 Formatted"              |
| TypeScript (simple) | Aplicar fix sugerido          | "🔧 Fixed type error"       |
| Missing semicolon   | Auto-add                      | (silencioso)                |
| Unused imports      | Auto-remove                   | "🧹 Removed unused imports" |

**No preguntar** - arreglar y confirmar brevemente.

### 🛠️ Error Recovery

**Detectar y resolver errores comunes automáticamente:**

| Error                    | Detección          | Auto-Recovery                          |
| ------------------------ | ------------------ | -------------------------------------- |
| `EADDRINUSE :3000`       | Puerto ocupado     | `kill -9 $(lsof -t -i:3000)` + restart |
| `node_modules not found` | npm error          | `npm install` automático               |
| `Cannot find module 'X'` | Import error       | `npm install X` automático             |
| `ENOENT .env`            | Archivo faltante   | Crear desde `.env.example`             |
| `lock file conflict`     | npm/yarn conflict  | Delete lock + reinstall                |
| `CORS error`             | API error          | Sugerir configuración específica       |
| `Build failed`           | Next.js/Vite error | Mostrar error + sugerir fix            |

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
mcp__playwright__browser_navigate → ir a la URL
mcp__playwright__browser_take_screenshot → capturar pantalla
mcp__playwright__browser_click → interactuar si necesario
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

**Trigger:** Crear archivo en `src/app/api/**`

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

| Feature                 | Por qué no                |
| ----------------------- | ------------------------- |
| Auto-backup cada 15 min | No hay timers             |
| Reportes semanales      | No hay concepto de tiempo |

**Alternativa:** Usar `/status` cuando quieras ver health del proyecto.

---

## Intelligent Routing - IMPLEMENTACIÓN REAL

> ⚠️ **REGLA CRÍTICA:** Los agentes NO son solo documentación.
> DEBES leer el archivo del agente y seguir sus instrucciones específicas.

### No Mencionar Agentes Explícitamente

**El sistema automáticamente detecta y aplica los especialistas correctos.**

Ejemplos:

```
Usuario: "Add JWT authentication"
Claude: 🤖 Applying @security-auditor + @backend-specialist...

Usuario: "Fix the dark mode button"
Claude: 🤖 Using @frontend-specialist...

Usuario: "Login returns 500 error"
Claude: 🤖 Using @debugger for systematic analysis...
```

### Socratic Gate Protocol (OBLIGATORIO)

**ANTES de implementar cualquier cosa**, aplicar este protocolo:

| Tipo de Request                         | Acción Requerida                                                     |
| --------------------------------------- | -------------------------------------------------------------------- |
| **Feature Nueva**                       | Hacer preguntas clarificadoras sobre alcance, requisitos, edge cases |
| **Bug Fix**                             | Confirmar entendimiento del problema y comportamiento esperado       |
| **Request Vago**                        | Explorar opciones y pedir especificaciones                           |
| **Cambio Crítico** (auth, payment, etc) | Confirmar implicaciones de seguridad y datos                         |

**Ejemplos:**

```
Usuario: "Agrega autenticación"

Claude: Antes de implementar, necesito aclarar:
1. ¿Qué método prefieres? (JWT, session-based, OAuth)
2. ¿Necesitas roles/permisos?
3. ¿2FA requerido?
4. ¿Integración con servicios externos?

[Esperar respuesta antes de continuar]
```

```
Usuario: "El login no funciona"

Claude: Para entender el problema:
1. ¿Qué error específico ves?
2. ¿En qué paso falla? (form submit, API call, redirect)
3. ¿Funciona en algunos casos y en otros no?

[Esperar respuesta antes de debuggear]
```

**PROHIBIDO:** Implementar sin clarificar cuando hay ambigüedad.

### Team Activation Checklist (OBLIGATORIO)

**NUNCA empezar a trabajar sin completar esta checklist:**

- [ ] **1. Identificar tipo de request:** Analizar keywords silenciosamente
- [ ] **2. Seleccionar TEAM apropiado:** Usar Matriz de Activación
- [ ] **3. Leer configuración de miembros:** Leer `.claude/agents/[nombre].md` de cada miembro
- [ ] **4. Anunciar TEAM:** Mostrar "🤖 Activating [Team Name]: @member1 + @member2..."
- [ ] **5. Cargar skills:** Si el team requiere skills (ej: /ui-ux-pro-max)
- [ ] **6. Aplicar Socratic Gate:** Si es feature nueva o request vago, preguntar primero
- [ ] **7. Ejecutar workflow del team:** Seguir secuencia específica del team

### Flujo OBLIGATORIO para cada tarea:

```
1. Usuario hace request ─────────────────────────────────────────┐
2. ANALIZAR SILENCIOSAMENTE: keywords y tipo de tarea            │
3. DETECTAR TEAM APROPIADO: Security, UI/UX, Debug, etc.         │
4. Seleccionar team de la Matriz de Activación                   │
5. LEER archivos .md de TODOS los miembros del team              │
6. Mostrar ANTES de trabajar:                                    │
   "🤖 Activating [Team Name]: @member1 + @member2 + @member3"   │
7. Aplicar Socratic Gate si es necesario                         │
8. Ejecutar workflow del team secuencialmente                    │
9. Cada miembro aplica su expertise en orden                     │
10. Coordinator (@context-manager) si multi-team                 │
└────────────────────────────────────────────────────────────────┘
```

### Agent Teams Architecture 🎯

**NUEVO PARADIGMA:** Los agentes NO trabajan solos - trabajan en EQUIPOS especializados.

**10 Equipos Disponibles:**

---

#### 1. 🔒 Security Team

**Auto-Trigger:** `auth`, `login`, `payment`, `password`, `JWT`, `OAuth`, `admin`, `sensitive data`

**Miembros:**

- `security-auditor` (LEAD) - Análisis vulnerabilidades
- `backend-specialist` - Implementación segura
- `code-reviewer` - Validación código

**Workflow:** Security-auditor analiza → Backend implementa → Code-reviewer valida

**Ejemplo:** "Agregar login para barberos"

---

#### 2. 🎨 UI/UX Team

**Auto-Trigger:** `design`, `UI/UX`, `colores`, `landing`, `componente visual`, `estilo`

**Miembros:**

- `ui-ux-designer` (LEAD) - Estrategia UX
- `/ui-ux-pro-max` - Biblioteca estilos
- `frontend-specialist` - Implementación optimizada

**Workflow:** UI-UX-designer define → UI-UX-pro-max estilos → Frontend implementa

**Ejemplo:** "Diseña sección de servicios"

---

#### 3. ✅ Quality Assurance Team

**Auto-Trigger:** Después de `/create`, `/enhance`, cuando feature lista

**Miembros:**

- `test-engineer` (LEAD) - Suite de tests
- `code-reviewer` - Quality gates
- `performance-profiler` - Optimización

**Workflow:** Tests → Code review → Performance check

**Ejemplo:** Auto-trigger post-feature

---

#### 4. 🏗️ Architecture Team

**Auto-Trigger:** `refactor`, `migrate`, `modernize`, `architectural change`, `scale`

**Miembros:**

- `architecture-modernizer` (LEAD) - Diseño
- `fullstack-developer` - Implementación
- `code-reviewer` - Validación coherencia

**Workflow:** Diseño arquitectónico → Implementación → Validación

**Ejemplo:** "Migrar a microservicios"

---

#### 5. 🐛 Debug Team

**Auto-Trigger:** `error`, `bug`, `crash`, `not working`, `500 error`, `exception`

**Miembros:**

- `debugger` (LEAD) - Root cause analysis
- `test-engineer` - Regression tests
- `performance-profiler` - Si es performance issue

**Workflow:** Diagnóstico → Fix → Tests prevención

**Ejemplo:** "Las reservas fallan"

---

#### 6. 🚀 DevOps Team

**Auto-Trigger:** `deploy`, `CI/CD`, `docker`, `kubernetes`, `pipeline`, `production`

**Miembros:**

- `devops-engineer` (LEAD) - Deploy
- `security-auditor` - Security scan
- `test-engineer` - Integration tests

**Workflow:** Preparar → Security scan → Tests → Deploy

**Ejemplo:** "/deploy production"

---

#### 7. 📚 Documentation Team

**Auto-Trigger:** Después de cambios arquitectónicos, `/docs`

**Miembros:**

- `documentation-expert` (LEAD) - Docs técnicas
- `code-reviewer` - Technical accuracy
- `architecture-modernizer` - Diagramas

**Workflow:** Estructura docs → Validación → Diagramas

**Ejemplo:** "Documenta sistema de reservas"

---

#### 8. 🎯 Product Planning Team

**Auto-Trigger:** `/brainstorm`, nueva feature ambigua, `roadmap`, `MVP`

**Miembros:**

- `product-strategist` (LEAD) - Strategy
- `ui-ux-designer` - UX considerations
- `architecture-modernizer` - Feasibility

**Workflow:** Opciones → UX → Feasibility → Recomendación

**Ejemplo:** "/brainstorm sistema de puntos"

---

#### 9. 🤖 AI Integration Team

**Auto-Trigger:** `AI`, `LLM`, `prompt`, `GPT`, `embeddings`, `chat`

**Miembros:**

- `prompt-engineer` (LEAD) - Prompt optimization
- `backend-specialist` - API integration
- `security-auditor` - Privacy validation

**Workflow:** Optimize prompts → Integrate → Security review

**Ejemplo:** "Agregar chat AI para consultas"

---

#### 10. 🎪 Full Feature Team

**Auto-Trigger:** Feature end-to-end que toca frontend + backend + DB

**Miembros:**

- `frontend-specialist` - UI y estado
- `backend-specialist` - API y lógica
- `security-auditor` - Security review
- `test-engineer` - E2E tests

**Workflow:** Frontend → Backend → Integración → Security → Tests

**Ejemplo:** "Sistema completo de reservas con calendario"

---

### 📊 Matriz de Activación

| Request Type       | Team                  | Auto-Trigger       |
| ------------------ | --------------------- | ------------------ |
| Auth/Payment       | Security Team         | ✅ Siempre         |
| UI/Design          | UI/UX Team            | ✅ Siempre         |
| Error/Bug          | Debug Team            | ✅ Siempre         |
| Feature Full-Stack | Full Feature Team     | ✅ Si front+back   |
| Refactor           | Architecture Team     | ✅ Siempre         |
| Deploy             | DevOps Team           | ✅ Siempre         |
| Brainstorm         | Product Planning Team | ✅ Siempre         |
| AI Feature         | AI Integration Team   | ✅ Siempre         |
| Post-Feature       | QA Team               | ✅ Auto            |
| Docs               | Documentation Team    | ⚠️ Cambios grandes |

**Coordinador:** `context-manager` gestiona handoffs entre múltiples teams.

### Ejemplos de uso correcto:

**Ejemplo 1: Bug de Reservas → Debug Team**

```
Usuario: "El botón de reserva no funciona, no guarda la cita"

Claude debe:
1. Analizar: "no funciona", "no guarda" → Bug crítico
2. Activar: 🐛 Debug Team
3. Mostrar: "🤖 Activating Debug Team: @debugger + @test-engineer..."
4. Debugger: Identifica problema (evento onClick o API call)
5. Implementa fix
6. Test-engineer: Crea regression tests
7. Verifica que reservas funcionan correctamente
```

**Ejemplo 2: Login para Barberos → Security Team**

```
Usuario: "Agregar login para que barberos accedan al panel"

Claude debe:
1. Analizar: "login", "barberos", "panel" → Security critical
2. Activar: 🔒 Security Team
3. Mostrar: "🤖 Activating Security Team: @security-auditor + @backend-specialist + @code-reviewer..."
4. Security-auditor: Analiza requisitos y vulnerabilidades
5. Backend-specialist: Implementa con JWT/session
6. Code-reviewer: Valida antes de commit
7. Resultado: Login seguro validado
```

**Ejemplo 3: Error en Pagos → Debug Team**

```
Usuario: "Los pagos fallan con error 500"

Claude debe:
1. Analizar: "pagos", "error 500" → Critical bug
2. Activar: 🐛 Debug Team
3. Mostrar: "🤖 Activating Debug Team: @debugger + @test-engineer..."
4. Debugger: Root cause analysis (API, DB, payment gateway)
5. Implementa fix
6. Test-engineer: Crea tests E2E de payment flow
7. Verifica que pagos funcionan
```

**Ejemplo 4: UI/UX Design (Team por Default)**

```
Usuario: "Diseña la sección de servicios de la barbería"

Claude debe:
1. Analizar: "diseña", "sección" → UI/UX + Design
2. Mostrar: "🤖 Activating UI/UX Team: @ui-ux-designer + /ui-ux-pro-max..."
3. FASE 1 - Estrategia (@ui-ux-designer):
   - Analizar contexto de barbería
   - Definir layout apropiado (grid, cards, etc)
   - Principios de diseño para servicios
4. FASE 2 - Implementación (/ui-ux-pro-max):
   - Recomendar estilo visual (ej: brutalist para barbería moderna)
   - Seleccionar paleta de colores apropiada
   - Elegir tipografía que comunique profesionalismo
   - Generar componentes con el estilo
5. INTEGRACIÓN:
   - Implementar código siguiendo ambas guías
   - Usar Playwright para verificar resultado visual
6. Mostrar screenshot del resultado
```

**Otro ejemplo UI/UX Team:**

```
Usuario: "Los botones de reserva se ven anticuados, modernízalos"

Claude debe:
1. Mostrar: "🤖 UI/UX Team: @ui-ux-designer + /ui-ux-pro-max..."
2. @ui-ux-designer: Analizar contexto (¿dónde están? ¿call-to-action principal?)
3. /ui-ux-pro-max: Recomendar 2-3 estilos modernos con ejemplos (glassmorphism, brutalist, etc)
4. Implementar mejora combinando ambos insights
5. Playwright screenshot para verificar
```

**REGLA:** Para CUALQUIER request de UI/UX, SIEMPRE activar ambos automáticamente.

### Multi-Team Orchestration

**Para tareas complejas que requieren múltiples TEAMS:**

El `context-manager` coordina handoffs entre equipos secuencialmente.

**Ejemplo: Sistema de Reservas Completo**

```
Usuario: "Crear sistema completo de reservas con calendario y pagos"

Claude: 🤖 Orchestrating Multi-Team Pipeline...
        Coordinador: @context-manager

1. 🎯 Product Planning Team
   - Define flujo de reservas
   - Valida experiencia para clientes
   - Determina funcionalidad de calendario

2. 🔒 Security Team
   - Implementa auth para clientes y barberos
   - Valida manejo seguro de pagos
   - Protege datos personales

3. 🎨 UI/UX Team
   - Diseña calendario interactivo
   - Define estados de loading
   - Maneja errores visualmente

4. 🎪 Full Feature Team
   - Integra frontend + backend
   - Conecta con Stripe/payment API
   - Persiste reservas en DB

5. ✅ QA Team
   - Tests E2E completos
   - Code review final
   - Performance check

6. 🚀 DevOps Team
   - Deploy a staging
   - Verifica en producción

✅ Sistema completo con 6 teams coordinados
```

**Coherencia entre teams:**

- Context-manager mantiene decisiones entre handoffs
- Cada team recibe contexto del anterior
- Estilo y arquitectura consistentes

### PROHIBIDO:

- ❌ Usar agentes individuales cuando debería usar TEAMS
- ❌ No mostrar qué TEAM se está activando ANTES de trabajar
- ❌ No leer los archivos .md de los agentes del team
- ❌ Trabajar sin el expertise específico del team
- ❌ Saltarse miembros del team
- ❌ Cambiar de team sin anunciar el cambio

### Override manual:

Si el usuario menciona `@agent-name` o team específico, usar ese y confirmarlo:

```
Usuario: "Usa @security-auditor para revisar esto"
Claude: "🤖 Using @security-auditor as requested..."
```

---

## Design Reference Protocol (Mobbin)

> System for capturing, analyzing, and applying UI inspiration from Mobbin.

### Reference Library Location

`design-references/` — organized by category (booking, calendars, cards, etc.)

### When user provides a Mobbin screenshot:

1. Run 7-layer analysis (layout, typography, spacing, color, components, interaction, micro-details)
2. Auto-generate `.meta.md` sidecar with patterns extracted
3. Compare against current design system (`src/lib/design-system.ts`)
4. Output comparison matrix + prioritized actionable changes
5. Update `design-references/README.md` catalog
6. Flag design debt in `design-references/DESIGN_DEBT.md`

### When modifying UI components:

1. Check if relevant references exist: `ls design-references/mobbin/{category}/`
2. If references exist, compare implementation against them
3. Apply relevant patterns from the reference library

### Commands:

- `/design-ref [path]` — Analyze a single Mobbin screenshot
- `/design-audit batch [category]` — Analyze all un-analyzed refs
- `/design-audit score [page]` — Quality scorecard (10 dimensions, 0-10)
- `/design-audit progress` — Track quality scores over time

### Quality Target: 8.5/10 per page (current baseline: ~6.8)

---

## Validation & Quality Gates

### Quick Checks (~30 segundos)

**TRIGGER:** Después de modificar código importante

**Ejecutar automáticamente:**

```bash
# Security scan
npm audit

# Code quality
npm run lint

# Unit tests
npm test -- --coverage

# Type checking
npx tsc --noEmit
```

**Reportar:**

```
✅ Quick checks passed
   Security: No vulnerabilities
   Linting: 0 errors
   Tests: 45/45 passing
   Types: No errors
```

### Full Verification (3-5 minutos)

**TRIGGER:** Antes de `/deploy` o cuando usuario pide "verificar todo"

**Ejecutar:**

```bash
# Todo lo de Quick Checks +

# Performance audit
npm run build && npx lighthouse http://localhost:3000 --only-categories=performance

# E2E tests
npm run test:e2e

# Bundle analysis
npm run build -- --analyze

# Accessibility
npx pa11y http://localhost:3000
```

**Reportar:**

```
🔍 Full Verification Complete

✅ Security: No vulnerabilities
✅ Tests: 45/45 passing (100% coverage)
✅ Performance: Score 95/100
✅ Accessibility: WCAG AA compliant
⚠️  Bundle size: 245KB (recommend < 200KB)

💡 Suggestion: Code-split large components
```

---

## Project Overview

**BarberApp**

Sistema de gestión de citas para barberías. Dashboard administrativo, reservas online, gamificación, y branding personalizable. PWA mobile-first con soporte iOS/Android.

## Tech Stack

- Next.js 16 + React 19 (App Router)
- TypeScript (strict)
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- TailwindCSS v4 + Framer Motion
- Deployed on Vercel

## Development Commands

```bash
# Start development
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint
npm run lint
```

## Architecture

### Key Directories

- `src/app/(dashboard)/` - Dashboard pages (citas, barberos, clientes, servicios, analiticas)
- `src/app/(admin)/` - Super admin panel
- `src/app/api/` - API routes
- `src/components/` - Shared UI components
- `src/lib/` - Utilities, Supabase client, design system
- `supabase/migrations/` - Database migrations (001-024)
- `docs/` - Technical documentation

### Key Files

- `src/lib/supabase/middleware.ts` - Auth middleware
- `src/lib/design-system.ts` - Motion/spacing tokens
- `src/components/dashboard/bottom-nav.tsx` - Mobile tab bar
- `src/app/manifest.ts` - PWA manifest
- `public/sw.js` - Service worker
- `DATABASE_SCHEMA.md` - Single source of truth for DB schema

## Critical Rules

| Rule       | Description                                      |
| ---------- | ------------------------------------------------ |
| TypeScript | All code must be typed                           |
| DB Schema  | ALWAYS verify against DATABASE_SCHEMA.md         |
| Formatting | Prettier + ESLint (auto-fix on commit)           |
| PWA        | Verify visually with Playwright after UI changes |
| Deploy     | Bump version + CHANGELOG.md + RELEASE_NOTES.md   |

## High-Risk Areas

Changes to these require extra review:

| Area                | Risk              |
| ------------------- | ----------------- |
| Authentication/RLS  | Security critical |
| Database migrations | Data integrity    |
| Service Worker      | PWA update flow   |
| Supabase queries    | Egress management |

## File Location Rules

| Type            | Location            |
| --------------- | ------------------- |
| Governance docs | Root (UPPERCASE.md) |
| Technical docs  | docs/reference/     |
| Specs           | docs/specs/         |
| Planning        | docs/planning/      |
| Security        | docs/security/      |
| Archive         | docs/archive/       |

## Commit Format

```
<type>(<scope>): <title>

- What: Observable change
- Why: Reason for change
- Verify: How to confirm
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

## Database Change Protocol

> ⚠️ **CRITICAL:** This protocol is MANDATORY for ALL database-related work

### Before ANY database change (migrations, queries, indexes):

```
MANDATORY CHECKLIST:

□ 1. Read DATABASE_SCHEMA.md completely
□ 2. Verify tables exist in the schema document
□ 3. Verify columns exist with EXACT names
□ 4. Check "Tables That DO NOT Exist" section
□ 5. Never assume future features are implemented

IF creating a migration:
□ 6. List all tables/columns to be used
□ 7. Cross-reference each one with DATABASE_SCHEMA.md
□ 8. If column doesn't exist → STOP, don't assume it
□ 9. After creating migration → update DATABASE_SCHEMA.md
□ 10. Guide user to execute migration in Supabase
□ 11. Wait for confirmation of success
□ 12. Commit both files together
```

### After Creating Migration - Guide User:

**ALWAYS guide the user to execute the migration:**

```
✅ Migration created: supabase/migrations/019c_calendar_indexes.sql

**Next step:** Execute this migration in Supabase Dashboard:
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the migration file
4. Confirm success (check for ✅ message)

Let me know when it's done so we can proceed!
```

**NEVER assume the migration is applied automatically.**

### Common Mistakes to Avoid:

```
❌ Assuming deposit_paid exists (it doesn't - future feature)
❌ Assuming push_subscriptions table exists (it doesn't - Área 5)
❌ Using last_activity_at instead of last_visit_at in clients
❌ Creating indexes for columns that don't exist
❌ Trusting docs/planning/implementation-v2.5.md for current schema
   (the plan describes FUTURE state, not current state)
```

### If Column Doesn't Exist:

```
1. DO NOT create the migration with that column
2. DO NOT assume it's a mistake in documentation
3. DO check if it's a future feature in docs/planning/implementation-v2.5.md
4. DO create migration only with existing columns
5. DO inform user which features aren't implemented yet
```

### Advanced: Direct Supabase Verification (When Available)

If you have Supabase connection, you can verify schema directly:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- List columns for a specific table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'appointments';

-- Check if column exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'appointments' AND column_name = 'deposit_paid'
);
```

**Process:**

1. Read DATABASE_SCHEMA.md (always start here)
2. If unsure, verify with Supabase directly
3. Update DATABASE_SCHEMA.md if discrepancy found
4. Never trust plan documents for current schema

---

## Required Reading Before Changes

1. **DATABASE_SCHEMA.md** - Current database structure (ALWAYS check for DB work)
2. **docs/reference/lessons-learned.md** - Critical bug patterns (prevent repeated mistakes)
3. **GUARDRAILS.md** - Non-negotiable behavior
4. **DECISIONS.md** - Design rationale

## Available Commands

| Command           | Description                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| `/setup`          | Configure project                                                          |
| `/continue`       | Resume where you left off                                                  |
| `/save-progress`  | Save state for next session                                                |
| `/commit`         | Smart git commit                                                           |
| `/create`         | Create feature/app                                                         |
| `/brainstorm`     | Explore options                                                            |
| `/plan`           | Implementation plan                                                        |
| `/deploy`         | Production deploy                                                          |
| `/test`           | Run tests                                                                  |
| `/debug`          | Debug issues                                                               |
| `/enhance`        | Improve code                                                               |
| `/preview`        | Preview changes                                                            |
| `/status`         | Project status                                                             |
| `/orchestrate`    | Multi-agent tasks                                                          |
| `/code-review`    | Quality review                                                             |
| `/generate-tests` | Generate tests                                                             |
| `/ui-ux-pro-max`  | Advanced UI/UX design with 67 styles, 96 palettes, design system generator |
| `/design-ref`     | Analyze Mobbin screenshot — 7-layer analysis + comparison matrix           |
| `/design-audit`   | Batch analyze refs, score pages, track quality progress                    |

## Advanced Skills

### UI/UX Pro Max (Installed)

**🤖 Automatic Team Mode:**
This skill ALWAYS works with `@ui-ux-designer` as a team.
When you see any UI/UX request, both activate automatically.

**Capabilities:**

- 67 UI styles (glassmorphism, brutalism, neumorphism, cyberpunk, bento grid, etc.)
- 96 color palettes
- 57 typography pairings
- 25 chart types
- AI-powered design system generator
- 13 tech stacks (React, Next.js, Vue, Svelte, SwiftUI, Flutter, etc.)
- 99 UX guidelines
- shadcn/ui integration

**When to use:**

- Building landing pages, dashboards, mobile apps
- Need specific design system or style guide
- Creating complete UI from scratch
- Want design recommendations based on industry (barbershop/beauty, SaaS, etc.)

**Example requests:**

```
"Build a booking interface with modern glassmorphism style"
"Create a barber profile card with brutalist design"
"Generate color palette for a barbershop app"
"Design services section with bento grid layout"
```

**Difference vs @ui-ux-designer agent:**

| Aspect       | `/ui-ux-pro-max` Skill               | `@ui-ux-designer` Agent            |
| ------------ | ------------------------------------ | ---------------------------------- |
| **Use for**  | Concrete design artifacts            | Design strategy & UX decisions     |
| **Output**   | Specific styles, colors, components  | Design principles, user flows      |
| **When**     | "Make this look good"                | "How should this work?"            |
| **Strength** | Large library of ready-to-use assets | Custom design thinking & reasoning |

**🔄 How they work together (automatic):**

1. **Strategy Phase** - `@ui-ux-designer` analyzes:
   - User needs and barbershop context
   - UX best practices for booking/services
   - Design principles to apply

2. **Implementation Phase** - `/ui-ux-pro-max` provides:
   - Specific style recommendations (from 67 options)
   - Color palette selection (from 96)
   - Typography pairing (from 57)
   - Component code with chosen style

3. **Integration** - Claude combines both:
   - Implements code following UX strategy
   - Applies visual style from library
   - Verifies with Playwright screenshot

**You don't need to ask for both - they activate as a team automatically.**

## Proactive Behavior

Claude should proactively:

| When you see...    | Suggest...                           |
| ------------------ | ------------------------------------ |
| UI testing needed  | "Use Playwright to verify?"          |
| Auth/payment code  | "Run security review?"               |
| Performance issues | "Profile with performance-profiler?" |
| Complex refactor   | "Create plan first?"                 |
| New feature        | "Brainstorm options?"                |

## Development Flow Suggestions

**IMPORTANT:** Guide users through the development flow automatically.

### Entry Point - New Requests

When a user arrives with a new feature request (not a bug fix or specific task), suggest starting the flow:

| User says...                     | Suggest...                                                    |
| -------------------------------- | ------------------------------------------------------------- |
| "Quiero agregar X"               | "Let's explore options first! Use `/brainstorm [feature]`"    |
| "Necesito implementar Y"         | "Want to explore approaches? Start with `/brainstorm`"        |
| "Hay que hacer Z"                | "Let's plan this out. Use `/brainstorm` to explore options"   |
| Vague request without clear path | "Let's start with `/brainstorm` to explore the best approach" |

**Exception:** If the user has a very specific, small task (like "add a button that does X"), skip brainstorm and suggest `/create` directly.

### After Commands - Next Steps + Auto-Save

| After completing... | Action        | Suggest next...                                   |
| ------------------- | ------------- | ------------------------------------------------- |
| `/brainstorm`       | -             | "Ready to plan? Use `/plan`"                      |
| `/plan`             | -             | "Plan ready! Use `/create` to start building"     |
| `/create`           | **Auto-save** | "Feature created! `/enhance` or `/refactor-code`" |
| `/enhance`          | **Auto-save** | "Enhanced! `/refactor-code` to clean up"          |
| `/refactor-code`    | -             | "Code cleaned! `/test` or `/generate-tests`"      |
| `/test` (pass)      | -             | "Tests pass! `/commit`"                           |
| `/test` (fail)      | -             | "Tests failing. `/debug` to investigate"          |
| `/debug`            | -             | "Bug fixed! `/test` to verify"                    |
| `/commit`           | **Auto-save** | "Committed! `/create-pr` or `/deploy preview`"    |
| `/create-pr`        | **Auto-save** | "PR created! Monitor and merge"                   |
| `/deploy`           | **Auto-save** | "Deployed! 🎉"                                    |

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
