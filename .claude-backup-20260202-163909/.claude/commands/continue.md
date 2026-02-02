---
description: Continuar donde quedaste en la última sesión
---

# Continue Session

Retoma el trabajo exactamente donde lo dejaste. Lee el progreso guardado y continúa.

---

## Instrucciones

### Paso 1: Leer PROGRESS.md

**Ejecuta Read** en `PROGRESS.md`.

Si no existe, informa al usuario:
> No encontré `PROGRESS.md`. Parece que es tu primera sesión o no se guardó el progreso anterior.
>
> ¿Quieres que analice el proyecto y cree un PROGRESS.md inicial?

### Paso 2: Leer Archivos Clave

Basado en los "Key Files" listados en PROGRESS.md, **lee silenciosamente** los más importantes (máximo 3-5 archivos).

También lee:
- `CLAUDE.md` - Contexto del proyecto
- `package.json` - Dependencias actuales

### Paso 3: Verificar Estado

**Ejecuta silenciosamente:**

```bash
# Verificar que el proyecto corre
ls node_modules 2>/dev/null || echo "Need npm install"

# Git status
git status --short 2>/dev/null

# Verificar servidor de desarrollo
lsof -i :3000 2>/dev/null | head -2
```

### Paso 4: Resumir y Proponer

Muestra al usuario:

```
## Session Resumed ✅

### Last Session Summary
[Resumen de 2-3 líneas de lo que se hizo]

### Current State
- **Working:** [Lo que funciona]
- **Issues:** [Problemas pendientes, si hay]

### Ready to Continue

Basado en tu PROGRESS.md, lo siguiente es:

1. **[Tarea principal]** - [descripción breve]
2. **[Tarea secundaria]** - [si aplica]

¿Empezamos con [tarea principal]?
```

### Paso 5: Esperar Confirmación

- Si el usuario dice "sí", "dale", "ok", "continúa" → empieza a trabajar
- Si el usuario quiere algo diferente → ajusta el plan

---

## Auto-Start del Servidor

Si el proyecto necesita servidor de desarrollo y no está corriendo:

```bash
# Verificar si el puerto está libre
lsof -i :3000 2>/dev/null

# Si está libre, preguntar si quiere iniciarlo
```

**Pregunta:**
> El servidor de desarrollo no está corriendo. ¿Lo inicio? (`npm run dev`)

---

## Notas para Claude

### Contexto Rápido

El objetivo es que en menos de 30 segundos el usuario esté trabajando de nuevo.

1. Lee PROGRESS.md (5 segundos)
2. Muestra resumen (5 segundos)
3. Propone acción (5 segundos)
4. Usuario confirma → trabajando

### No Repetir Información

- No leas todo el código base
- Solo los archivos clave para la tarea actual
- Confía en lo documentado en PROGRESS.md

### Ser Proactivo

- Si hay errores obvios, menciónalos
- Si falta npm install, ofrece hacerlo
- Si el servidor no corre, ofrece iniciarlo

### Tono

- Directo y eficiente
- "Listo para continuar" no "Bienvenido de vuelta a tu proyecto..."
- Menos texto, más acción
