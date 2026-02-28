import { describe, expect, it } from 'vitest'
import { filterPublicChangelogReleases, parseChangelogMarkdown } from '@/lib/changelog'

describe('changelog parsing', () => {
  it('parses releases and sections from markdown', () => {
    const markdown = `
## [0.9.23] - 2026-02-27

### Nuevo
- Mejora visible para clientes
`

    const releases = parseChangelogMarkdown(markdown)

    expect(releases).toHaveLength(1)
    expect(releases[0]?.version).toBe('0.9.23')
    expect(releases[0]?.sections[0]?.title).toBe('Nuevo')
    expect(releases[0]?.sections[0]?.items).toEqual(['Mejora visible para clientes'])
  })

  it('filters internal/admin bullets from public releases', () => {
    const releases = parseChangelogMarkdown(`
## [0.9.23] - 2026-02-27

### Nuevo
- Panel de admin renombrado a "Admin" para mayor claridad
- El dashboard muestra citas e ingresos del dia en una tarjeta destacada
`)
    const filtered = filterPublicChangelogReleases(releases)

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.sections).toHaveLength(1)
    expect(filtered[0]?.sections[0]?.items).toEqual([
      'El dashboard muestra citas e ingresos del dia en una tarjeta destacada',
    ])
  })

  it('drops releases that only contain internal/admin notes', () => {
    const releases = parseChangelogMarkdown(`
## [0.9.23] - 2026-02-27

### Nuevo
- Los administradores pueden eliminar un negocio inactivo de forma permanente
`)
    const filtered = filterPublicChangelogReleases(releases)
    expect(filtered).toEqual([])
  })
})
