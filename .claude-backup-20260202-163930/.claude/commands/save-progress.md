---
description: Guardar estado del proyecto para continuar en otra sesión
---

# Save Progress

Guarda el estado actual del proyecto para que la próxima sesión de Claude pueda continuar exactamente donde quedaste.

---

## Cuándo Usar

- Al final de una sesión de trabajo
- Antes de cerrar VSCode
- Cuando cambies de contexto a otro proyecto
- Después de completar una feature importante

---

## Instrucciones

### Paso 1: Analizar Estado Actual

**Ejecuta silenciosamente** para entender el proyecto:

```bash
# Estructura del proyecto
ls -la src/ 2>/dev/null || ls -la

# Package.json para tech stack
cat package.json 2>/dev/null | head -50

# Git status
git status --short 2>/dev/null

# Últimos commits
git log --oneline -5 2>/dev/null
```

### Paso 2: Preguntar al Usuario

**Usa AskUserQuestion:**

"¿Qué lograste en esta sesión?"

Opciones sugeridas basadas en los cambios detectados + "Otro"

### Paso 3: Crear/Actualizar PROGRESS.md

**Ejecuta Write** para crear `PROGRESS.md` con esta estructura:

```markdown
# Project Progress

> Este archivo se actualiza automáticamente con `/save-progress`.
> Claude lo lee al inicio de cada sesión para mantener contexto.

## Project Info

- **Name:** [nombre del proyecto]
- **Stack:** [tech stack detectado]
- **Last Updated:** [fecha y hora]

---

## What's Built

### Completed Features
- [x] Feature 1 - breve descripción
- [x] Feature 2 - breve descripción

### In Progress
- [ ] Feature actual - qué falta

### Key Files
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Página principal |
| `src/lib/db.ts` | Conexión a base de datos |

---

## Current State

### Working
- ✅ Lo que funciona actualmente

### Issues/Blockers
- ⚠️ Problemas conocidos (si hay)

---

## Next Session

### Continue With
1. Siguiente tarea específica
2. Segunda prioridad

### Commands to Run
```bash
npm run dev
```

### Context Notes
Notas importantes que la próxima sesión debe saber.

---

## Session History

### [Fecha] - Session X
- Qué se hizo
- Qué se aprendió
- Decisiones tomadas
```

### Paso 4: Actualizar CLAUDE.md

Agrega al inicio de CLAUDE.md (si no existe):

```markdown
## Session Start

Al iniciar una nueva sesión, **LEE PRIMERO** `PROGRESS.md` para entender:
- Qué está construido
- Estado actual del proyecto
- Qué sigue

Después de leer, confirma: "He leído PROGRESS.md. [Resumen de 1 línea]. ¿Continuamos con [siguiente tarea]?"
```

### Paso 5: Confirmar

Muestra al usuario:

```
## Progress Saved ✅

Tu progreso ha sido guardado en `PROGRESS.md`.

### Resumen:
- **Completado:** [lista breve]
- **Siguiente:** [próxima tarea]

### Para continuar en otra sesión:

1. Abre el proyecto en VSCode
2. Inicia Claude Code
3. Claude leerá automáticamente PROGRESS.md y continuará donde quedaste

O simplemente di: "Continúa donde quedamos"
```

---

## Notas para Claude

### Auto-detección

Detecta automáticamente:
- Tech stack desde package.json
- Features desde estructura de carpetas
- Estado desde git status/log
- Base de datos desde schema files

### Formato Conciso

- Máximo 100 líneas en PROGRESS.md
- Solo información útil para continuar
- No repetir lo que está en CLAUDE.md

### Session History

- Mantén máximo 5 sesiones en el historial
- Elimina las más antiguas automáticamente
- Cada entrada debe ser máximo 3 líneas

### Ejecución Automática

- **SIEMPRE crea/actualiza PROGRESS.md**
- **SIEMPRE actualiza CLAUDE.md** con la instrucción de leer PROGRESS.md
- No pidas confirmación para escribir archivos
