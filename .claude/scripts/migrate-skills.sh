#!/bin/bash

# migrate-skills.sh
# Migra la estructura de skills de flat a bundled/managed/custom

set -e  # Exit on error

SKILLS_DIR=".claude/skills"
BACKUP_DIR=".claude/skills-backup-$(date +%Y%m%d-%H%M%S)"

echo "🔄 Migrando estructura de skills..."
echo ""

# 1. Backup de la estructura actual
echo "📦 Creando backup en: $BACKUP_DIR"
cp -R "$SKILLS_DIR" "$BACKUP_DIR"
echo "✅ Backup creado"
echo ""

# 2. Crear nuevas carpetas
echo "📁 Creando estructura bundled/managed/custom..."
mkdir -p "$SKILLS_DIR/bundled"
mkdir -p "$SKILLS_DIR/managed"
mkdir -p "$SKILLS_DIR/custom"
echo "✅ Estructura creada"
echo ""

# 3. Identificar y mover bundled skills (directorios)
echo "📚 Moviendo bundled skills..."
BUNDLED_SKILLS=(
  "api-patterns"
  "bash-linux"
  "clean-code"
  "database-design"
  "docker-devops"
  "game-development"
  "i18n-localization"
  "intelligent-routing"
  "mcp-builder"
  "mobile-development"
  "nextjs-best-practices"
  "nodejs-best-practices"
  "python-patterns"
  "react-patterns"
  "security-hardening"
  "seo-fundamentals"
  "tailwind-patterns"
  "testing-patterns"
  "typescript-expert"
  "webapp-testing"
)

for skill in "${BUNDLED_SKILLS[@]}"; do
  if [ -d "$SKILLS_DIR/$skill" ]; then
    echo "  → $skill"
    mv "$SKILLS_DIR/$skill" "$SKILLS_DIR/bundled/"
  fi
done
echo "✅ Bundled skills migrados: ${#BUNDLED_SKILLS[@]}"
echo ""

# 4. Recrear managed skills (symlinks)
echo "🔗 Recreando managed skills..."
MANAGED_SKILLS=(
  "error-handling-patterns:../../../.agents/skills/antigravity-awesome-skills/skills/error-handling-patterns"
  "nextjs-app-router-patterns:../../../.agents/skills/antigravity-awesome-skills/skills/nextjs-app-router-patterns"
  "production-code-audit:../../../.agents/skills/antigravity-awesome-skills/skills/production-code-audit"
  "secrets-management:../../../.agents/skills/antigravity-awesome-skills/skills/secrets-management"
  "security-scanning-security-sast:../../../.agents/skills/antigravity-awesome-skills/skills/security-scanning-security-sast"
  "wcag-audit-patterns:../../../.agents/skills/antigravity-awesome-skills/skills/wcag-audit-patterns"
  "vercel-composition-patterns:../../../.agents/skills/vercel-composition-patterns"
  "vercel-react-best-practices:../../../.agents/skills/vercel-react-best-practices"
  "vercel-react-native-skills:../../../.agents/skills/vercel-react-native-skills"
  "web-design-guidelines:../../../.agents/skills/web-design-guidelines"
)

# Remover symlinks viejos
for skill_entry in "${MANAGED_SKILLS[@]}"; do
  skill_name="${skill_entry%%:*}"
  if [ -L "$SKILLS_DIR/$skill_name" ]; then
    echo "  🗑️  Removiendo symlink viejo: $skill_name"
    rm "$SKILLS_DIR/$skill_name"
  fi
done

# Crear nuevos symlinks en managed/
for skill_entry in "${MANAGED_SKILLS[@]}"; do
  skill_name="${skill_entry%%:*}"
  skill_target="${skill_entry#*:}"
  echo "  → $skill_name"
  ln -s "$skill_target" "$SKILLS_DIR/managed/$skill_name"
done
echo "✅ Managed skills recreados: ${#MANAGED_SKILLS[@]}"
echo ""

# 5. Crear README en custom/
echo "📄 Creando README en custom/"
cat > "$SKILLS_DIR/custom/README.md" << 'EOF'
# Custom Skills

Esta carpeta es para skills personalizados creados por ti o tu organización.

## Características

- **Gitignored**: Esta carpeta está en `.gitignore` para mantener privados tus skills personalizados
- **Formato**: Sigue el mismo formato que los bundled skills
- **Seguridad**: Ideal para patrones específicos de tu empresa o proyectos privados

## Crear un nuevo skill

```bash
mkdir -p .claude/skills/custom/my-skill
cd .claude/skills/custom/my-skill
touch skill.md
```

Ejemplo de estructura:

```markdown
# my-skill

## Descripción
[Tu descripción]

## Triggers
- keyword1
- keyword2

## Patrones
[Tus patrones y best practices]
```

## Ejemplos de uso

- Company-specific coding standards
- Private API patterns
- Internal security policies
- Proprietary frameworks
EOF
echo "✅ README creado"
echo ""

# 6. Verificar migración
echo "🔍 Verificando migración..."
BUNDLED_COUNT=$(find "$SKILLS_DIR/bundled" -maxdepth 1 -type d ! -path "$SKILLS_DIR/bundled" | wc -l | tr -d ' ')
MANAGED_COUNT=$(find "$SKILLS_DIR/managed" -maxdepth 1 -type l | wc -l | tr -d ' ')
echo "  → Bundled: $BUNDLED_COUNT skills"
echo "  → Managed: $MANAGED_COUNT skills"
echo "  → Custom: 0 skills (vacío por ahora)"
echo ""

# 7. Limpiar archivos sueltos en skills/ root
echo "🧹 Limpiando archivos sueltos en skills root..."
# Solo debe quedar bundled/, managed/, custom/
for item in "$SKILLS_DIR"/*; do
  basename_item=$(basename "$item")
  if [[ "$basename_item" != "bundled" && "$basename_item" != "managed" && "$basename_item" != "custom" ]]; then
    echo "  ⚠️  Archivo/directorio inesperado: $basename_item"
    echo "     (Puedes eliminarlo manualmente si es seguro)"
  fi
done
echo ""

echo "✅ Migración completada exitosamente!"
echo ""
echo "📋 Resumen:"
echo "  - Backup: $BACKUP_DIR"
echo "  - Bundled: $BUNDLED_COUNT skills"
echo "  - Managed: $MANAGED_COUNT skills"
echo "  - Custom: Listo para usar"
echo ""
echo "🔄 Próximos pasos:"
echo "  1. Verifica que todo funciona: ls -la .claude/skills/{bundled,managed,custom}"
echo "  2. Si hay problemas, restaura desde: $BACKUP_DIR"
echo "  3. Actualiza .gitignore: .claude/skills/custom/"
echo ""
