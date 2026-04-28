wimport { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Package name — used for Vite alias and generated `declare module` specifiers. */
export const FUTURRISTIC_UI_PACKAGE = '@yiiameemich/futurristic-ui'

const PKG = FUTURRISTIC_UI_PACKAGE

function isSafePathSegment(segment: string): boolean {
  const v = segment.trim()
  return (
    v.length > 0 && !v.includes('..') && !v.includes('/') && !v.includes('\\')
  )
}

/**
 * Scans `{iconsRoot}/{type}/*.svg` and returns icon basenames grouped by folder (type).
 */
export function scanFuIconAssets(iconsRoot: string): Record<string, string[]> {
  if (!existsSync(iconsRoot) || !statSync(iconsRoot).isDirectory()) {
    return {}
  }

  const result: Record<string, string[]> = {}

  for (const typeName of readdirSync(iconsRoot)) {
    if (!isSafePathSegment(typeName)) {
      continue
    }

    const dir = join(iconsRoot, typeName)
    if (!statSync(dir).isDirectory()) {
      continue
    }

    const names: string[] = []
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.svg')) {
        continue
      }
      const base = file.slice(0, -'.svg'.length)
      if (!isSafePathSegment(base)) {
        continue
      }
      names.push(base)
    }

    if (names.length) {
      result[typeName] = [...names].sort((a, b) => a.localeCompare(b))
    }
  }

  return result
}

function escapeSvgNameForLiteral(name: string): string {
  return name.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
}

/**
 * Renders a `.d.ts` that augments `FuIconRegistry` and `IIconProps` on the package icon types module.
 * Emitted by the Nuxt module via `addTypeTemplate` on `nuxt prepare` / dev.
 */
export function renderFuIconTypesDeclaration(
  registry: Record<string, string[]>,
  packageName: string = PKG,
): string {
  const registryLines: string[] = []
  const typeKeys = Object.keys(registry).sort((a, b) => a.localeCompare(b))
  const nameSet = new Set<string>()
  for (const names of Object.values(registry)) {
    for (const n of names) {
      nameSet.add(n)
    }
  }
  const sortedNames = [...nameSet].sort((a, b) => a.localeCompare(b))

  for (const typeName of typeKeys) {
    const names = registry[typeName]!
    const literals
      = names.length > 0
        ? names.map(n => `'${escapeSvgNameForLiteral(n)}'`).join(' | ')
        : 'never'
    registryLines.push(`    ${JSON.stringify(typeName)}: ${literals};`)
  }

  const typesUnion
    = typeKeys.length > 0
      ? typeKeys.map(t => `'${escapeSvgNameForLiteral(t)}'`).join(' | ')
      : null
  const namesUnion
    = sortedNames.length > 0
      ? sortedNames.map(n => `'${escapeSvgNameForLiteral(n)}'`).join(' | ')
      : null

  const iconPropsLines: string[] = []
  if (typesUnion && namesUnion) {
    iconPropsLines.push(`    iconType?: ${typesUnion};`)
    iconPropsLines.push(`    iconName?: ${namesUnion};`)
  }

  return [
    `import type {} from '${packageName}/runtime/types/icon';`,
    '',
    `declare module '${packageName}/runtime/types/icon' {`,
    '  export interface FuIconRegistry {',
    ...registryLines,
    '  }',
    ...(iconPropsLines.length
      ? ['  export interface IIconProps {', ...iconPropsLines, '  }']
      : []),
    '}',
    '',
  ].join('\n')
}
