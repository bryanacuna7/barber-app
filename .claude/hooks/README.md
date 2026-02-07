# Claude Code Hooks

Los hooks en Claude Code funcionan de manera diferente a los hooks de Git tradicionales. En lugar de scripts ejecutables, Claude detecta **eventos y patrones en la conversación**.

## Sistema de Auto-Save Actual

### ✅ Lo que YA funciona (sin hooks de bash):

Claude detecta automáticamente estos eventos en la conversación y guarda a Memory MCP:

1. **Post-Commit Detection**
   - Cuando ejecuto `/commit` o `git commit`
   - Leo el mensaje de commit
   - Si contiene keywords como "fix", "security", "bug" → auto-save a memoria

2. **User Correction Detection**
   - Cuando corriges mi código
   - Patrón: "No, usa X en lugar de Y"
   - Auto-save a `code_style_preferences`

3. **File Change Detection**
   - Cuando edito archivos críticos
   - DATABASE_SCHEMA.md, DECISIONS.md, package.json
   - Auto-save cambios relevantes

4. **Feature Completion Detection**
   - Después de `/create` o `/enhance`
   - Decisiones arquitectónicas → auto-save

### ⚠️ Lo que NO está disponible:

Claude Code **no soporta** hooks de bash tradicionales como:
- `post-commit` scripts ejecutables
- File watchers externos
- Timers/cron jobs
- Background processes

### Cómo Funciona en Realidad

```
Usuario hace algo → Claude detecta patrón → Auto-save a Memory MCP
                           ↓
                    (Sin scripts bash)
```

**Ejemplo real:**

```
Usuario: git commit -m "fix: race condition in bookings"

Claude (internamente):
1. Detecta comando commit ✓
2. Lee mensaje "fix: race condition" ✓
3. Clasifica: lessons_learned ✓
4. Guarda a memoria MCP ✓
5. Silenciosamente (no muestra confirmación) ✓
```

## Configuración Actual

El auto-save está **ACTIVO** según `CLAUDE.md`:

```markdown
## Memory Auto-Save

Triggers automáticos:
- ✅ Post-commit (si mensaje tiene keywords)
- ✅ Post-feature (/create, /enhance)
- ✅ User corrections (detecta patrones)
- ✅ File changes críticos
- ✅ Deploy success
```

## Comandos Disponibles

### Ver memoria actual:
```
mcp__memory__read_graph
```

### Buscar en memoria:
```
mcp__memory__search_nodes({ query: "security" })
```

### Guardar manualmente:
```
/remember "información importante"
```

### Ver entidad específica:
```
mcp__memory__open_nodes({ names: ["lessons_learned"] })
```

## Future: Git Hooks Integrados

Si quisieras hooks de Git tradicionales (ejecutan al hacer commit), podrías crear:

`.git/hooks/post-commit`:
```bash
#!/bin/bash
# Este hook se ejecuta DESPUÉS de cada commit

# Obtener mensaje del commit
COMMIT_MSG=$(git log -1 --pretty=%B)

# Si contiene "memory:", agregar nota
if echo "$COMMIT_MSG" | grep -q "memory:"; then
  echo "💾 Nota: Este commit tiene etiqueta memory: - considera usar /remember"
fi
```

Pero esto es **separado** del sistema de auto-save de Claude, que funciona dentro de la conversación.

## Resumen

| Feature | Status | Implementación |
|---------|--------|----------------|
| Auto-save post-commit | ✅ Activo | Detección de patrones en conversación |
| Auto-save user corrections | ✅ Activo | Detección de patrones en conversación |
| Auto-save file changes | ✅ Activo | Detección cuando Claude edita archivos |
| `/remember` command | ✅ Disponible | Skill en `.claude/skills/remember.md` |
| Git hooks (bash) | ⚠️ Opcional | Requiere setup manual en `.git/hooks/` |
| File watchers externos | ❌ No soportado | Claude no ejecuta procesos background |

**Conclusión:** El sistema de auto-save YA está funcionando - usa detección inteligente en la conversación, no scripts bash externos.
