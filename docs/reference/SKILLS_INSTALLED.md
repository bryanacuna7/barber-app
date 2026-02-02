# 🎯 Skills Instalados - Claude Starter Kit

Última actualización: **2026-02-02**

---

## 📊 Resumen

```
✅ Total de skills: 10 skills
   📦 Vercel Labs (skills.sh): 4 skills
   🚀 Antigravity Awesome Skills: 6 skills
✅ Complementan: 20 skills custom existentes
✅ Auto-activación: Configurada
✅ Status: Listos para usar
```

---

## 🔷 Skills de Vercel Labs (4 skills)

### 1. **web-design-guidelines** (64K installs) ✅

**Ubicación:** `.agents/skills/web-design-guidelines/`

**Qué hace:**
Auditoría automática de UI con 100+ reglas cubriendo:

- ✅ Accesibilidad (WCAG)
- ⚡ Performance
- 🎨 UX best practices

**Triggers:**

- "review my UI"
- "check accessibility"
- "audit design"
- "review UX"
- "check my site against best practices"

**Ejemplo:**

```
Usuario: "Revisa la accesibilidad de mi header"
Claude: 🤖 Loading web-design-guidelines...

Findings:
src/components/Header.tsx:12 - Missing alt text on logo image
src/components/Header.tsx:24 - Button missing aria-label
src/components/Header.tsx:45 - Low contrast ratio (3.2:1, needs 4.5:1)
```

---

### 2. **vercel-composition-patterns** (17.1K installs) ✅

**Ubicación:** `.agents/skills/vercel-composition-patterns/`

**Qué hace:**
Patrones arquitectónicos de React para componentes escalables:

- 🏗️ Compound Components
- 🔄 State Management patterns
- 🎯 Composition over boolean props
- ⚛️ React 19 API updates

**Triggers:**

- "refactor component"
- "too many props"
- "compound component"
- "context provider"
- "component architecture"

**Ejemplo:**

```
Usuario: "Este componente tiene demasiados props boolean"
Claude: 🤖 Loading vercel-composition-patterns...

❌ Antes (boolean prop hell):
<Modal isOpen={true} hasCloseButton={true} isFullScreen={false} />

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

### 3. **vercel-react-native-skills** (12.8K installs) ✅

**Ubicación:** `.agents/skills/vercel-react-native-skills/`

**Qué hace:**
Best practices para React Native y Expo:

- 📱 Mobile performance optimization
- 🎬 Animaciones fluidas
- ⚡ List rendering optimization
- 🔌 Native modules integration

**Triggers:**

- "React Native component"
- "optimize list performance"
- "mobile animations"
- "Expo app"
- "native module"

---

### 4. **vercel-react-best-practices** (84.5K installs) 🆕 ⭐

**Ubicación:** `.agents/skills/vercel-react-best-practices/`

**Qué hace:**
React y Next.js performance optimization desde Vercel Engineering:

- ⚡ +40 reglas en 8 categorías (ordenadas por impacto)
- 🎯 Ejemplos concretos de código
- 📦 Bundle size optimization
- 🔄 Data fetching patterns
- 🚀 Server Components best practices

**Triggers:**

- "optimize React performance"
- "improve Next.js speed"
- "reduce bundle size"
- "Server Components"
- "data fetching patterns"

**Por qué es importante:**

- Skill **más popular** de Vercel Labs (84.5K installs)
- Complementa `react-patterns` con optimizaciones específicas
- Incluye conocimiento de 10 años de React/Next.js

---

## 🚀 Skills de Antigravity Awesome Skills (6 skills)

**Repositorio completo:** `.agents/skills/antigravity-awesome-skills/` (626 skills disponibles)

### 5. **nextjs-app-router-patterns** 🆕

**Ubicación:** `.claude/skills/nextjs-app-router-patterns` → `antigravity-awesome-skills/skills/`

**Qué hace:**
Next.js 14+ App Router avanzado:

- 🏗️ Server Components architecture
- 🔄 Streaming patterns
- 🎯 Parallel routes
- ⚡ Suspense boundaries
- 📦 Route handlers
- 🔐 Middleware patterns

**Triggers:**

- "Next.js App Router"
- "Server Components"
- "streaming"
- "parallel routes"
- "Next.js 14/15"

**Complementa:** Tu skill `nextjs-best-practices` (básico) con patrones avanzados

---

### 6. **production-code-audit** 🆕

**Ubicación:** `.claude/skills/production-code-audit` → `antigravity-awesome-skills/skills/`

**Qué hace:**
Scan autónomo del codebase para estándares production-grade:

- 🔍 Code quality analysis
- 🏗️ Architecture patterns
- 📊 Performance bottlenecks
- 🐛 Anti-patterns detection
- 📚 Documentation coverage

**Triggers:**

- "audit codebase"
- "production ready check"
- "code quality review"
- "pre-deployment audit"

**Complementa:** Tu comando `/code-review` con análisis más profundo

---

### 7. **wcag-audit-patterns** 🆕

**Ubicación:** `.claude/skills/wcag-audit-patterns` → `antigravity-awesome-skills/skills/`

**Qué hace:**
WCAG 2.2 accessibility audits automatizados:

- ♿ ARIA labels validation
- 🎨 Color contrast checking (WCAG AA/AAA)
- ⌨️ Keyboard navigation
- 📱 Screen reader compatibility
- 🏷️ Semantic HTML validation

**Triggers:**

- "WCAG audit"
- "accessibility check"
- "a11y compliance"
- "screen reader test"

**Complementa:** `web-design-guidelines` con validación WCAG específica

---

### 8. **error-handling-patterns** 🆕

**Ubicación:** `.claude/skills/error-handling-patterns` → `antigravity-awesome-skills/skills/`

**Qué hace:**
Error propagation resiliente multi-lenguaje:

- 🛡️ Try-catch patterns
- 🔄 Retry logic
- 📊 Error tracking (Sentry, etc.)
- 🚨 Graceful degradation
- 📝 Error logging best practices

**Triggers:**

- "error handling"
- "exception management"
- "retry logic"
- "error boundaries"

**Lenguajes:** TypeScript, Python, Go, Rust, Java

---

### 9. **secrets-management** 🆕

**Ubicación:** `.claude/skills/secrets-management` → `antigravity-awesome-skills/skills/`

**Qué hace:**
Gestión segura de secrets y credentials:

- 🔐 .env file patterns
- 🚫 Hardcoded secrets detection
- 🔑 Vault integration patterns
- ☁️ Cloud secrets managers (AWS, GCP, Azure)
- 🛡️ Rotation strategies

**Triggers:**

- "secrets management"
- "API keys security"
- "environment variables"
- "vault integration"

**Crítico para:** Auth, payment, API integrations

---

### 10. **security-scanning-security-sast** 🆕

**Ubicación:** `.claude/skills/security-scanning-security-sast` → `antigravity-awesome-skills/skills/`

**Qué hace:**
Static Application Security Testing automatizado:

- 🔍 SQL injection detection
- 🛡️ XSS vulnerability scanning
- 🔐 Authentication flaws
- 📦 Dependency vulnerabilities
- 🚨 OWASP Top 10 checks

**Triggers:**

- "security scan"
- "SAST analysis"
- "vulnerability check"
- "SQL injection test"

**Complementa:** Tu agent `security-auditor` con scanning automatizado

---

## 📂 Estructura de Archivos

```
claude-starter-kit/
├── .claude/
│   └── skills/                     # Symlinks a skills (31 skills)
│       ├── react-patterns/         # Custom (20 skills)
│       ├── api-patterns/
│       ├── ...
│       ├── vercel-react-best-practices@    # Vercel Labs (4 skills)
│       ├── web-design-guidelines@
│       ├── vercel-composition-patterns@
│       ├── vercel-react-native-skills@
│       ├── nextjs-app-router-patterns@     # Antigravity (6 skills)
│       ├── production-code-audit@
│       ├── wcag-audit-patterns@
│       ├── error-handling-patterns@
│       ├── secrets-management@
│       └── security-scanning-security-sast@
│
└── .agents/
    └── skills/                     # Source de skills externos
        ├── vercel-react-best-practices/
        ├── web-design-guidelines/
        ├── vercel-composition-patterns/
        ├── vercel-react-native-skills/
        └── antigravity-awesome-skills/    # 626 skills disponibles
            ├── skills/
            │   ├── nextjs-app-router-patterns/
            │   ├── production-code-audit/
            │   ├── wcag-audit-patterns/
            │   ├── error-handling-patterns/
            │   ├── secrets-management/
            │   ├── security-scanning-security-sast/
            │   └── ... (otros 620 skills)
            └── docs/
                ├── BUNDLES.md
                └── CATALOG.md
```

---

## 🎯 Complementariedad con Skills Existentes

| Tu Skill Custom         | Nuevo Skill                       | Relación                              |
| ----------------------- | --------------------------------- | ------------------------------------- |
| `react-patterns`        | `vercel-react-best-practices`     | ✅ Patterns vs Performance            |
| `react-patterns`        | `vercel-composition-patterns`     | ✅ General vs Advanced Composition    |
| `nextjs-best-practices` | `nextjs-app-router-patterns`      | ✅ Básico vs App Router Avanzado      |
| `ui-ux-designer`        | `web-design-guidelines`           | ✅ Design vs Audit                    |
| `ui-ux-designer`        | `wcag-audit-patterns`             | ✅ Design vs WCAG Compliance          |
| `security-hardening`    | `secrets-management`              | ✅ General vs Secrets Específico      |
| `security-hardening`    | `security-scanning-security-sast` | ✅ Manual vs Automated SAST           |
| `/code-review`          | `production-code-audit`           | ✅ General Review vs Production Audit |
| `mobile-development`    | `vercel-react-native-skills`      | ✅ General vs Vercel Best Practices   |

**Resultado:** Los skills se complementan sin duplicarse. Cada uno aporta expertise específico.

---

## 🚀 Cómo Usar

### Activación Automática

Los skills se activan cuando Claude detecta keywords relevantes:

```
Usuario: "Optimiza el performance de este componente React"
Claude: 🤖 Using @performance-profiler...
        📦 Loading vercel-react-best-practices...

        Detecté 3 optimizaciones prioritarias:
        1. Componente re-renderiza innecesariamente
        2. Data fetching no usa Server Components
        3. Bundle incluye librerías no usadas
```

### Activación Manual

Menciona el skill explícitamente:

```
Usuario: "@nextjs-app-router-patterns ayúdame con streaming"
Claude: 📦 Loading nextjs-app-router-patterns...
```

### Bundles Recomendados (Antigravity)

Si necesitas más skills, usa los bundles curados:

```bash
# Explorar bundles
cat .agents/skills/antigravity-awesome-skills/docs/BUNDLES.md

# Agregar skill individual (crear symlink manualmente)
cd .claude/skills
ln -s ../../.agents/skills/antigravity-awesome-skills/skills/[nombre-skill] [nombre-skill]
```

**Bundles útiles:**

- 🚀 **Essentials Starter Pack**: concise-planning, lint-and-validate, systematic-debugging
- 🌐 **Web Wizard Pack**: frontend-design, form-cro, seo-audit
- 🛡️ **Security Engineer Pack**: ethical-hacking-methodology, burp-suite-testing, vulnerability-scanner
- ⚡ **Full-Stack Developer Pack**: senior-fullstack, stripe-integration, database-design

---

## 🔄 Actualización de Skills

### Vercel Labs (npx skills)

```bash
# Actualizar skill específico
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices --update

# Ver skills disponibles
npx skills list vercel-labs/agent-skills
```

### Antigravity Awesome Skills (git pull)

```bash
cd .agents/skills/antigravity-awesome-skills
git pull origin main
```

---

## 📈 Stats del Proyecto

```
🎯 Skills Totales: 31 skills activos
   📦 Custom (tuyos): 20 skills
   🔷 Vercel Labs: 4 skills (178.4K installs combinados)
   🚀 Antigravity: 6 skills activos (de 626 disponibles)

🤖 Agentes: 15 agentes especializados
⚙️ Commands: 20 workflows automatizados
🔌 MCPs: 3 (Memory, Playwright, GitHub)

💾 Espacio: ~150MB (.agents/skills/antigravity-awesome-skills)
```

---

## 🆕 Próximos Skills Recomendados

Si necesitas expandir en el futuro:

### Alta Prioridad (según uso)

- **stripe-integration** - Payments y subscriptions (si usas Stripe)
- **seo-audit** - SEO automatizado (si necesitas tráfico orgánico)
- **systematic-debugging** - Metodología de debugging avanzada

### Media Prioridad

- **form-cro** - Optimización de forms para conversión
- **frontend-design** - UI guidelines y aesthetics
- **api-security-best-practices** - Patrones de API segura

### Explorar por dominio

```bash
# Ver todos los skills por categoría
cat .agents/skills/antigravity-awesome-skills/docs/BUNDLES.md

# Buscar skills por keyword
ls .agents/skills/antigravity-awesome-skills/skills/ | grep [keyword]
```

---

## 🔗 Referencias

- [Vercel Agent Skills Repo](https://github.com/vercel-labs/agent-skills)
- [Skills.sh Platform](https://skills.sh/vercel-labs/agent-skills)
- [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills)
- [Skills CLI Documentation](https://github.com/vercel-labs/skills)
- [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
- [Vercel Changelog: Introducing Skills](https://vercel.com/changelog/introducing-skills-the-open-agent-skills-ecosystem)

---

**Instalado por:** Claude Code
**Última actualización:** 2026-02-02
**Versión:** v2.0.0 (expanded edition)
