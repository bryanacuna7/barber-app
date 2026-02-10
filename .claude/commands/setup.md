---
description: Configurar el starter kit para tu proyecto
---

# Setup del Proyecto

Configura este starter kit para tu proyecto. **Ejecuta todos los comandos automáticamente** - el usuario solo responde preguntas.

---

## Principio Fundamental

> **El usuario NO debe ejecutar comandos manualmente.**
> Claude ejecuta TODO: inicialización del framework, instalación de dependencias, configuración.
> El usuario solo responde preguntas con opciones predefinidas.

---

## Paso 0: Validar Entorno

**Ejecuta silenciosamente:**
```bash
basename $(pwd)
```

**Valida que sea npm-compatible:**
- Regex válido: `^[a-z0-9-]+$`
- Solo minúsculas, números y guiones
- Sin espacios ni mayúsculas

**Si el nombre es inválido**, muestra:

> ⚠️ **El nombre de carpeta "[nombre-actual]" no es compatible con npm.**
>
> **Solución:** Renombra la carpeta y vuelve a ejecutar `/setup`:
>
> ```bash
> cd .. && mv "[nombre-actual]" "[nombre-sugerido]" && cd "[nombre-sugerido]" && claude
> ```

**DETENTE aquí si es inválido.** No continúes hasta que el usuario renombre la carpeta.

---

## Paso 1: Detectar Estado del Proyecto

**Ejecuta silenciosamente:**
```bash
ls package.json 2>/dev/null
ls next.config.* 2>/dev/null
ls vite.config.* 2>/dev/null
```

**Resultado:**
- Si `package.json` existe → Proyecto existente → Salta al **Paso 3**
- Si NO existe → Proyecto nuevo → Continúa al **Paso 2**

---

## Paso 2: Inicializar Framework (Solo proyectos nuevos)

### 2.1 Preguntar Tech Stack

**Usa AskUserQuestion** con estas opciones:

| Opción | Descripción |
|--------|-------------|
| React Native + Node.js | Mobile app with Express/Node backend |
| Next.js Full Stack | React framework with API routes |
| React + Firebase | React frontend with Firebase backend |
| Flutter + Supabase | Cross-platform with Postgres backend |

### 2.2 Ejecutar Inicialización Automáticamente

**IMPORTANTE:** Ejecuta los comandos TÚ, no le digas al usuario que los ejecute.

#### Para Next.js Full Stack:

**Ejecuta:**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --turbopack --no-import-alias
```

> Nota: Los flags `--src-dir`, `--turbopack`, `--no-import-alias` evitan preguntas interactivas.

Si el comando requiere respuestas interactivas, responde:
- Use src/ directory? → **Yes**
- Use App Router? → **Yes**
- Use Turbopack? → **Yes**
- Customize import alias? → **No**
- Use React Compiler? → **No**

#### Para React + Vite:

**Ejecuta:**
```bash
npm create vite@latest . -- --template react-ts && npm install
```

#### Para React Native + Node.js:

**Ejecuta:**
```bash
npx create-expo-app@latest . --template blank-typescript
```

#### Para Flutter + Supabase:

**Ejecuta:**
```bash
flutter create . --org com.example
```

### 2.3 Verificar Instalación

**Ejecuta:**
```bash
ls package.json && echo "Framework initialized successfully"
```

Si falla, muestra el error y guía al usuario para solucionarlo.

---

## Paso 3: Configurar Starter Kit

**Usa AskUserQuestion** para cada pregunta:

### 3.1 Nombre del Proyecto

Si existe `package.json`, lee el nombre y sugiere una versión display:
- `barber-app` → sugiere "BarberApp" o "BarberApp"

Opciones:
- Nombre sugerido basado en la carpeta
- Nombre personalizado (Other)

### 3.2 Descripción del Proyecto

Detecta el tipo de proyecto y ofrece opciones relevantes:

**Para apps de reservas/citas:**
- Appointment booking app
- Full management system
- Client & stylist portal

**Para e-commerce:**
- Online store
- Marketplace platform
- Inventory management

**Para SaaS/Dashboard:**
- Analytics dashboard
- Admin panel
- Customer portal

### 3.3 Reglas del Proyecto

Opciones:
- TypeScript strict + Tests required - All code typed, PRs need test coverage
- TypeScript + Prettier/ESLint - Type safety with consistent formatting
- Spanish comments + TypeScript - Code documentation in Spanish

---

## Paso 4: Actualizar CLAUDE.md

**Ejecuta Edit** para actualizar `CLAUDE.md` con la información recopilada.

Estructura a actualizar:

```markdown
## Project Overview

**[NOMBRE]**

[DESCRIPCIÓN]

## Tech Stack

- [FRAMEWORK] (detectado automáticamente)
- TypeScript
- [OTROS según selección]

## Development Commands

```bash
npm run dev    # Start development
npm test       # Run tests
npm run build  # Build for production
```

## Critical Rules

| Rule | Description |
|------|-------------|
| [REGLA] | [DESCRIPCIÓN] |
```

---

## Paso 5: Configurar MCPs

### 5.1 Preguntar sobre GitHub MCP

**Usa AskUserQuestion:**

| Opción | Descripción |
|--------|-------------|
| Yes, I have a token | I'll paste my GitHub token |
| Yes, configure later | Skip for now, add token manually in .mcp.json |
| No GitHub needed | Only Memory and Playwright MCPs |

### 5.2 Si necesita token

Si selecciona "configure later", muestra:

> Para crear un GitHub Personal Access Token:
> 1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
> 2. Generate new token (classic)
> 3. Permisos: `repo` y `workflow`
> 4. Copia el token y agrégalo en `.mcp.json`

Si selecciona "I have a token", usa AskUserQuestion para pedirlo.

### 5.3 Crear .mcp.json

**Ejecuta Write** para crear `.mcp.json`:

**Sin GitHub:**
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-playwright"]
    }
  }
}
```

**Con GitHub:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "[TOKEN]"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-playwright"]
    }
  }
}
```

---

## Paso 6: Finalizar Setup

### 6.1 Actualizar .gitignore

**Ejecuta** verificación y creación/actualización de `.gitignore`:

```bash
# Verificar si existe
ls .gitignore 2>/dev/null
```

Si no existe o falta `.mcp.json`, **ejecuta Write** para crear/actualizar con:

```gitignore
# Dependencies
node_modules/

# Build
.next/
out/
build/
dist/

# Environment & Secrets
.env
.env.local
.env*.local
.mcp.json

# Debug
npm-debug.log*
yarn-debug.log*

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Misc
*.tsbuildinfo
next-env.d.ts
```

### 6.2 Limpiar archivos template

**Ejecuta:**
```bash
rm -f .mcp.json.template setup.sh 2>/dev/null
```

### 6.3 Instalar dependencias (si no están instaladas)

**Ejecuta:**
```bash
# Verificar si node_modules existe
ls node_modules 2>/dev/null || npm install
```

### 6.4 Inicializar Git (si no existe)

**Ejecuta:**
```bash
# Verificar si .git existe
ls .git 2>/dev/null || git init
```

### 6.5 Mostrar Resumen Final

```
## Setup Complete

**[NOMBRE]** has been configured successfully.

### What was configured:

| File | Status |
|------|--------|
| Framework | [Next.js/Vite/etc.] initialized |
| CLAUDE.md | Updated with project info |
| .mcp.json | Created with [MCPs] |
| .gitignore | Updated to protect secrets |
| Dependencies | Installed |

### Your Configuration:

- **Project:** [NOMBRE]
- **Stack:** [TECH STACK]
- **Rules:** [REGLAS]
- **MCPs:** [LISTA]

### Next Steps:

1. **Restart Claude Code** to activate the MCP servers
2. Use `/brainstorm` to explore features
3. Or `/create` to start building

### Quick Start:

After restarting, just tell me what you want to build!
```

---

## Notas para Claude

### Ejecución Automática

- **SIEMPRE ejecuta los comandos tú mismo** - nunca le digas al usuario "ejecuta esto"
- Usa `Bash` tool para todos los comandos
- Usa `Write` tool para crear archivos
- Usa `Edit` tool para modificar archivos existentes
- Usa `AskUserQuestion` para TODAS las preguntas con opciones

### Manejo de Errores

- Si un comando falla, muestra el error claramente
- Ofrece solución específica
- No continúes hasta resolver el problema

### UX

- Mantén un flujo conversacional amigable
- Muestra progreso: "Initializing Next.js..." "Installing dependencies..."
- Celebra el éxito al final
- El usuario debe sentir que todo fue fácil
