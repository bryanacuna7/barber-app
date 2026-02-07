# Claude Kit CLI - Guía de Uso

## 🚀 3 Formas de Ejecutar Comandos

### 1️⃣ Con npm scripts (Recomendado)

```bash
# Health check
npm run doctor

# Skills management
npm run skills:add vercel/web-guidelines
npm run skills:list

# Session & Patterns
npm run session:summary
npm run patterns:detect
```

**Ventajas**:
- ✅ Funciona desde cualquier directorio del proyecto
- ✅ No requiere rutas relativas
- ✅ Autocomplete en package.json
- ✅ Funciona en scripts de CI/CD

---

### 2️⃣ Directamente con ruta relativa

```bash
# Desde la raíz del proyecto
./bin/claude-kit doctor
./bin/claude-kit skills add vercel/web-guidelines
./bin/claude-kit --help
```

**Ventajas**:
- ✅ Acceso directo al CLI
- ✅ Más rápido (no pasa por npm)
- ✅ Útil para debugging

---

### 3️⃣ Globalmente (después de npm install)

```bash
# Instalar globalmente
npm install -g .

# Luego usar en cualquier lugar
claude-kit doctor
claude-kit skills add vercel/web-guidelines
claude-kit --help
```

**Ventajas**:
- ✅ Disponible globalmente en tu sistema
- ✅ No requiere rutas ni npm run
- ✅ Ideal si usas el CLI frecuentemente

---

## 📋 Comandos Disponibles

### Health Check

```bash
npm run doctor
# o
./bin/claude-kit doctor
```

Ejecuta 7 categorías de checks:
- Git Repository
- Node.js Environment
- Development Server
- Claude Code Configuration
- Skills
- Model Context Protocols
- Security

### Skills Management

```bash
# Agregar skill de Vercel
npm run skills:add vercel/web-guidelines

# Agregar skill de Antigravity
npm run skills:add antigravity/error-handling-patterns

# Listar skills (próximamente)
npm run skills:list
```

### Session & Patterns (Nivel 2)

```bash
# Ver resumen de sesión actual
npm run session:summary

# Detectar patrones y generar recomendaciones
npm run patterns:detect
```

---

## 🛠️ Configuración en package.json

```json
{
  "scripts": {
    "doctor": "./bin/claude-kit doctor",
    "skills:add": "./bin/claude-kit skills add",
    "skills:list": "./bin/claude-kit skills list",
    "session:summary": "node .claude/scripts/pattern-recognition.js summary",
    "patterns:detect": "node .claude/scripts/pattern-recognition.js detect"
  },
  "bin": {
    "claude-kit": "./bin/claude-kit"
  }
}
```

---

## 🔧 Para Desarrolladores

### Agregar nuevo comando al CLI

1. Crear script en `.claude/scripts/cli/mi-comando.sh`
2. Agregar case en `bin/claude-kit`:
   ```bash
   case "$command" in
     mi-comando)
       bash "$CLI_SCRIPTS_DIR/mi-comando.sh" "$@"
       ;;
   esac
   ```
3. Agregar script npm en `package.json`:
   ```json
   {
     "scripts": {
       "mi-comando": "./bin/claude-kit mi-comando"
     }
   }
   ```

### Debugging

```bash
# Ver output detallado
bash -x ./bin/claude-kit doctor

# Verificar permisos
ls -la bin/claude-kit
# Debe tener: -rwxr-xr-x (ejecutable)

# Hacer ejecutable si es necesario
chmod +x bin/claude-kit
```

---

## 📚 Ejemplos Completos

### Workflow típico

```bash
# 1. Health check al inicio del día
npm run doctor

# 2. Ver resumen de sesión anterior
npm run session:summary

# 3. Trabajar en features...

# 4. Detectar patrones después de trabajar
npm run patterns:detect

# 5. Health check antes de commit
npm run doctor
```

### CI/CD Integration

```yaml
# .github/workflows/validate.yml
name: Validate
on: [push]

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm run doctor
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run doctor
if [ $? -ne 0 ]; then
  echo "❌ Health check failed. Fix issues before committing."
  exit 1
fi
```

---

## 🆘 Troubleshooting

### Error: "command not found"

```bash
# Verificar que el archivo existe
ls -la bin/claude-kit

# Hacer ejecutable
chmod +x bin/claude-kit

# Probar con ruta completa
./bin/claude-kit --help
```

### Error: "Permission denied"

```bash
# Dar permisos de ejecución
chmod +x bin/claude-kit
chmod +x .claude/scripts/cli/*.sh
```

### Error: "No such file or directory"

```bash
# Asegurarte de estar en la raíz del proyecto
cd /path/to/claude-starter-kit

# Verificar estructura
ls -la bin/
ls -la .claude/scripts/cli/
```

---

## 🔗 Relacionado

- [SKILLS_INSTALLED.md](../SKILLS_INSTALLED.md) - Skills instalados
- [config.json](./.claude/config.json) - Configuración centralizada
- [session-summary.md](./.claude/commands/session-summary.md) - Comando de sesión
