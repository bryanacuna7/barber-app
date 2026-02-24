#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import prettier from 'prettier'

const ROOT = process.cwd()
const CATALOG_PATH = path.join(ROOT, 'src/content/feature-catalog.json')
const OUTPUT_PATH = path.join(ROOT, 'docs/FEATURES_PLAYBOOK.md')

function sanitizeCell(value) {
  return String(value || '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .trim()
}

function buildRoleSection(role, featureById) {
  const lines = []

  lines.push(`### ${role.label}`)
  lines.push('')
  lines.push(role.summary)
  lines.push('')
  lines.push('#### Beneficios clave')
  lines.push('')

  for (const benefit of role.keyBenefits) {
    lines.push(`- ${benefit}`)
  }

  lines.push('')
  lines.push('#### Funciones destacadas para venta')
  lines.push('')
  lines.push('| Funcion | Valor comercial |')
  lines.push('| --- | --- |')

  for (const featureId of role.landingFeatureIds) {
    const feature = featureById.get(featureId)
    if (!feature) {
      continue
    }

    lines.push(
      `| ${sanitizeCell(feature.title)} | ${sanitizeCell(feature.roleBenefits?.[role.id] || feature.benefit)} |`
    )
  }

  lines.push('')
  return lines
}

function generateMarkdown(catalog) {
  const roleById = new Map(catalog.roles.map((role) => [role.id, role]))
  const featureById = new Map(catalog.features.map((feature) => [feature.id, feature]))

  const lines = []

  lines.push('# Catalogo Comercial de Funcionalidades')
  lines.push('')
  lines.push('Documento vivo para ventas, onboarding comercial y alineacion de roadmap.')
  lines.push('')
  lines.push(`- Version de catalogo: ${catalog.version}`)
  lines.push(`- Ultima actualizacion funcional: ${catalog.lastUpdated}`)
  lines.push(`- Fuente unica: \`src/content/feature-catalog.json\``)
  lines.push('')
  lines.push('## Protocolo obligatorio de actualizacion')
  lines.push('')
  lines.push('1. Cada cambio funcional nuevo debe actualizar `src/content/feature-catalog.json`.')
  lines.push('2. Ejecutar `npm run docs:features` para regenerar este documento.')
  lines.push('3. Verificar sincronizacion con `npm run docs:features:check`.')
  lines.push('4. No cerrar PR de funcionalidad si este documento no refleja el cambio.')
  lines.push(
    '5. Si hay cambio comercial relevante, reflejarlo tambien en el landing section por perfil.'
  )
  lines.push('')
  lines.push('## Resumen por perfil')
  lines.push('')

  for (const role of catalog.roles) {
    lines.push(...buildRoleSection(role, featureById))
  }

  lines.push('## Matriz completa de funcionalidades')
  lines.push('')
  lines.push('| Funcionalidad | Perfiles | Beneficio principal | Ventaja competitiva | Modulos |')
  lines.push('| --- | --- | --- | --- | --- |')

  for (const feature of catalog.features) {
    const roles = feature.roles.map((roleId) => roleById.get(roleId)?.label || roleId).join(', ')

    lines.push(
      `| ${sanitizeCell(feature.title)} | ${sanitizeCell(roles)} | ${sanitizeCell(feature.benefit)} | ${sanitizeCell(feature.advantage)} | ${sanitizeCell(feature.modules.join(', '))} |`
    )
  }

  lines.push('')
  lines.push('## Guion rapido para demo comercial')
  lines.push('')
  lines.push(
    '1. Abrir con valor para dueno: control de agenda, ingresos y equipo desde un solo panel.'
  )
  lines.push('2. Mostrar operacion de barbero: Mi Dia, bloqueos, notificaciones y flujo diario.')
  lines.push(
    '3. Cerrar con experiencia cliente: reserva online, tracking en vivo y autogestion de cita.'
  )
  lines.push('4. Conectar con resultados: menos no-shows, mas ocupacion, mejor retencion.')
  lines.push('')
  lines.push('## Checklist antes de presentar a clientes')
  lines.push('')
  lines.push('- Confirmar que las funciones demostradas existen en produccion.')
  lines.push(
    '- Validar que politicas (cancelacion, pagos, promociones) esten configuradas en la cuenta demo.'
  )
  lines.push('- Preparar ejemplos por perfil: dueno, barbero y cliente final.')
  lines.push('- Revisar esta version del catalogo y el changelog publico vigente.')
  lines.push('')

  return `${lines.join('\n')}\n`
}

async function main() {
  const checkMode = process.argv.includes('--check')

  const catalogRaw = await readFile(CATALOG_PATH, 'utf8')
  const catalog = JSON.parse(catalogRaw)
  const markdown = generateMarkdown(catalog)
  const prettierConfig = (await prettier.resolveConfig(OUTPUT_PATH)) || {}
  const formattedMarkdown = await prettier.format(markdown, {
    ...prettierConfig,
    parser: 'markdown',
    filepath: OUTPUT_PATH,
  })

  if (checkMode) {
    const current = await readFile(OUTPUT_PATH, 'utf8').catch(() => '')

    if (current !== formattedMarkdown) {
      console.error('❌ docs/FEATURES_PLAYBOOK.md esta desactualizado.')
      console.error('   Ejecuta: npm run docs:features')
      process.exit(1)
    }

    console.log('✅ FEATURES_PLAYBOOK sincronizado con el catalogo.')
    return
  }

  await writeFile(OUTPUT_PATH, formattedMarkdown, 'utf8')
  console.log('✅ Documento generado:', OUTPUT_PATH)
}

main().catch((error) => {
  console.error('❌ Error generando documentacion de funcionalidades:', error)
  process.exit(1)
})
