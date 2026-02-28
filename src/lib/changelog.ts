import { readFile } from 'node:fs/promises'
import path from 'node:path'

export interface ChangelogSection {
  title: string
  items: string[]
}

export interface ChangelogRelease {
  version: string
  date: string | null
  sections: ChangelogSection[]
}

type ChangelogAudience = 'public' | 'internal'

interface SectionBoundary {
  title: string
  start: number
  contentStart: number
}

interface ReleaseBoundary {
  version: string
  date: string | null
  start: number
  contentStart: number
}

const CHANGELOG_FILE_PATH = path.join(process.cwd(), 'CHANGELOG.md')
const PACKAGE_FILE_PATH = path.join(process.cwd(), 'package.json')
const INTERNAL_AUDIENCE_TAG_REGEX =
  /\[(?:admin|internal|interno|solo-admin|staff-only|owner-only)\]/i
const INTERNAL_AUDIENCE_ITEM_PATTERNS = [
  /\bpanel\s+admin\b/i,
  /\badmin\b/i,
  /\badministradores?\b/i,
  /\bbackoffice\b/i,
  /\bsolo\s+admin\b/i,
]

function parseBulletItems(block: string): string[] {
  const lines = block.split('\n')
  const items: string[] = []
  let currentItem: string[] = []

  for (const line of lines) {
    const rightTrimmed = line.trimEnd()

    if (rightTrimmed.startsWith('- ')) {
      if (currentItem.length > 0) {
        items.push(currentItem.join('\n').trim())
      }
      currentItem = [rightTrimmed.replace(/^- /, '').trim()]
      continue
    }

    if (currentItem.length > 0 && rightTrimmed.trim()) {
      currentItem.push(rightTrimmed.trim())
    }
  }

  if (currentItem.length > 0) {
    items.push(currentItem.join('\n').trim())
  }

  return items
}

function parseReleaseSections(content: string): ChangelogSection[] {
  const normalizedContent = content.replace(/\r\n/g, '\n')
  const sectionHeaderRegex = /^###\s+(.+)$/gm
  const boundaries: SectionBoundary[] = []

  for (
    let match = sectionHeaderRegex.exec(normalizedContent);
    match;
    match = sectionHeaderRegex.exec(normalizedContent)
  ) {
    boundaries.push({
      title: match[1].trim(),
      start: match.index,
      contentStart: sectionHeaderRegex.lastIndex,
    })
  }

  if (boundaries.length === 0) {
    const fallbackItems = parseBulletItems(normalizedContent)
    if (fallbackItems.length === 0) {
      return []
    }
    return [{ title: 'Cambios', items: fallbackItems }]
  }

  return boundaries
    .map((boundary, index) => {
      const end =
        index < boundaries.length - 1 ? boundaries[index + 1].start : normalizedContent.length
      const sectionBody = normalizedContent.slice(boundary.contentStart, end)
      const items = parseBulletItems(sectionBody)
      return {
        title: boundary.title,
        items,
      }
    })
    .filter((section) => section.items.length > 0)
}

function isPublicFacingItem(item: string): boolean {
  if (INTERNAL_AUDIENCE_TAG_REGEX.test(item)) {
    return false
  }

  return !INTERNAL_AUDIENCE_ITEM_PATTERNS.some((pattern) => pattern.test(item))
}

export function filterPublicChangelogReleases(releases: ChangelogRelease[]): ChangelogRelease[] {
  return releases
    .map((release) => ({
      ...release,
      sections: release.sections
        .map((section) => ({
          ...section,
          items: section.items.filter(isPublicFacingItem),
        }))
        .filter((section) => section.items.length > 0),
    }))
    .filter((release) => release.sections.length > 0)
}

function filterReleasesByAudience(
  releases: ChangelogRelease[],
  audience: ChangelogAudience
): ChangelogRelease[] {
  if (audience === 'internal') {
    return releases
  }

  return filterPublicChangelogReleases(releases)
}

export function parseChangelogMarkdown(markdown: string): ChangelogRelease[] {
  const normalized = markdown.replace(/\r\n/g, '\n')
  const releaseHeaderRegex = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?$/gm
  const boundaries: ReleaseBoundary[] = []

  for (
    let match = releaseHeaderRegex.exec(normalized);
    match;
    match = releaseHeaderRegex.exec(normalized)
  ) {
    boundaries.push({
      version: match[1].trim(),
      date: match[2] ?? null,
      start: match.index,
      contentStart: releaseHeaderRegex.lastIndex,
    })
  }

  return boundaries.map((boundary, index) => {
    const end = index < boundaries.length - 1 ? boundaries[index + 1].start : normalized.length
    const releaseBody = normalized.slice(boundary.contentStart, end).trim()
    const sections = parseReleaseSections(releaseBody)

    return {
      version: boundary.version,
      date: boundary.date,
      sections,
    }
  })
}

export async function getChangelogReleases(limit = 10): Promise<ChangelogRelease[]> {
  const audience: ChangelogAudience = 'public'

  try {
    const markdown = await readFile(CHANGELOG_FILE_PATH, 'utf8')
    const releases = filterReleasesByAudience(parseChangelogMarkdown(markdown), audience)
    return releases.slice(0, limit)
  } catch {
    return []
  }
}

export async function getAppVersion(): Promise<string> {
  try {
    const packageJson = await readFile(PACKAGE_FILE_PATH, 'utf8')
    const parsed = JSON.parse(packageJson) as { version?: string }
    return parsed.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}
