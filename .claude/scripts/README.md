# Claude Code Scripts

Scripts útiles para mantener el proyecto limpio y optimizado.

---

## 🧹 `clean-other-agents.sh`

**Propósito:** Eliminar carpetas de otros AI coding assistants que `npx skills` crea automáticamente.

**Cuándo usar:**
- Después de instalar skills con `npx skills add`
- Si ves carpetas como `.cursor`, `.gemini`, `.windsurf` en tu proyecto
- Para mantener el proyecto limpio (solo Claude Code)

**Uso:**
```bash
# Desde la raíz del proyecto
./.claude/scripts/clean-other-agents.sh
```

**Qué elimina:**
```
.codex/
.continue/
.cursor/
.gemini/
.goose/
.roo/
.trae/
.windsurf/
... y otros 15+ agentes
```

**Qué mantiene:**
```
.claude/      ✓ (Claude Code - necesario)
.agents/      ✓ (Skills source - necesario)
.git/         ✓ (Control de versiones)
.github/      ✓ (GitHub workflows)
.next/        ✓ (Next.js build)
.husky/       ✓ (Git hooks)
```

---

## 💡 **Alternativa: Instalación Manual**

Para evitar que se creen esas carpetas, instala skills manualmente:

```bash
# En lugar de: npx skills add vercel-labs/agent-skills --skill foo

# Hacer:
git clone https://github.com/vercel-labs/agent-skills.git .agents/skills/temp
cp -r .agents/skills/temp/foo .agents/skills/
ln -s ../../.agents/skills/foo .claude/skills/foo
rm -rf .agents/skills/temp
```

---

**Mantenido por:** Claude Code Starter Kit
**Versión:** 1.0.0
