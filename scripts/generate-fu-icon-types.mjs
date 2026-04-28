#!/usr/bin/env node
/**
 * Writes src/runtime/types/icon-types.generated.ts when developing,
 * or dist/runtime/types/icon-types.generated.ts when only dist is present (e.g. npm postinstall).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanFuIconAssets, generateRuntimeIconTypesSource } from './lib/scan-fu-icon-assets.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgRoot = join(__dirname, '..')

const iconsFromSrc = join(pkgRoot, 'src/runtime/assets/icons')
const iconsFromDist = join(pkgRoot, 'dist/runtime/assets/icons')
const iconsRoot = existsSync(iconsFromSrc) ? iconsFromSrc : iconsFromDist

const outFromSrc = join(pkgRoot, 'src/runtime/types/icon-types.generated.ts')
const outFromDist = join(pkgRoot, 'dist/runtime/types/icon-types.generated.ts')
const outFile = existsSync(iconsFromSrc) ? outFromSrc : outFromDist

const registry = scanFuIconAssets(iconsRoot)
const source = generateRuntimeIconTypesSource(registry)

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, source, 'utf8')

console.log(`[futurristic-ui] Icon types written: ${outFile}`)
