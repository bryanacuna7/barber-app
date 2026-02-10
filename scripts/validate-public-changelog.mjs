#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import path from 'node:path'

const CHANGELOG_PATH = path.join(process.cwd(), 'CHANGELOG.md')

const forbiddenPatterns = [
  {
    label: 'Supabase',
    regex: /\bsupabase\b/i,
    recommendation: 'Usa beneficio para cliente (ej: "mejor estabilidad" o "mejor rendimiento").',
  },
  {
    label: 'Apple HIG',
    regex: /\bapple\s*hig\b/i,
    recommendation: 'Describe el beneficio UX sin mencionar guías internas.',
  },
  {
    label: 'Rutas/API routes',
    regex: /\brutas?\s+api\b|\bapi\s+routes?\b/i,
    recommendation: 'Habla de la función visible para el usuario, no de la arquitectura.',
  },
  {
    label: 'Egress',
    regex: /\begress\b/i,
    recommendation: 'Usa lenguaje de resultado (ej: "menos interrupciones", "carga más estable").',
  },
  {
    label: 'RBAC/IDOR',
    regex: /\brbac\b|\bidor\b/i,
    recommendation: 'Resume como mejora de seguridad en lenguaje no técnico.',
  },
  {
    label: 'N+1',
    regex: /\bn\s*\+\s*1\b/i,
    recommendation: 'Expresa el impacto (ej: "pantallas más rápidas al cargar").',
  },
  {
    label: 'Herramientas internas',
    regex: /\bpino\b|\bsentry\b|\bredis\b/i,
    recommendation: 'No menciones tooling interno en notas para clientes.',
  },
  {
    label: 'Migración técnica',
    regex: /\bmigraci[oó]n(?:es)?\b/i,
    recommendation: 'Cambia a beneficio final (estabilidad, velocidad, seguridad).',
  },
  {
    label: 'PWA',
    regex: /\bpwa\b/i,
    recommendation: 'Evita siglas tecnicas. Di "la app" y explica el beneficio.',
  },
  {
    label: 'Pull-to-refresh',
    regex: /\bpull[\s-]?to[\s-]?refresh\b/i,
    recommendation: 'Describe el resultado para usuario (ej: "navegacion mas fluida").',
  },
  {
    label: 'Padding',
    regex: /\bpadding\b/i,
    recommendation: 'No describas CSS. Explica el efecto visual para el cliente.',
  },
  {
    label: 'Mobile-first',
    regex: /\bmobile[\s-]?first\b/i,
    recommendation: 'Usa lenguaje natural (ej: "mas comodo desde el celular").',
  },
]

function isBulletLine(line) {
  return /^\s*-\s+/.test(line)
}

async function main() {
  const markdown = await readFile(CHANGELOG_PATH, 'utf8')
  const lines = markdown.split(/\r?\n/)
  const violations = []

  lines.forEach((line, index) => {
    if (!isBulletLine(line)) {
      return
    }

    for (const pattern of forbiddenPatterns) {
      if (pattern.regex.test(line)) {
        violations.push({
          line: index + 1,
          text: line.trim(),
          label: pattern.label,
          recommendation: pattern.recommendation,
        })
      }
    }
  })

  if (violations.length === 0) {
    console.log('✅ Changelog público validado: sin lenguaje técnico interno.')
    return
  }

  console.error('❌ CHANGELOG.md tiene términos internos/técnicos en notas visibles para clientes:\n')

  for (const violation of violations) {
    console.error(`- Línea ${violation.line} [${violation.label}]`)
    console.error(`  ${violation.text}`)
    console.error(`  Sugerencia: ${violation.recommendation}\n`)
  }

  console.error('Bloqueado para proteger el tono cliente de "Novedades".')
  process.exit(1)
}

main().catch((error) => {
  console.error('❌ Error validando CHANGELOG.md:', error)
  process.exit(1)
})
