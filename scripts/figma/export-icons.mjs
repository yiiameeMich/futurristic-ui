#!/usr/bin/env node
/**
 * Exports icon sets from Figma as SVGs via the Figma REST API.
 *
 * Usage:
 *   FIGMA_TOKEN=xxxx node scripts/figma/export-icons.mjs <set...|all> [--prune]
 *   FIGMA_TOKEN=xxxx node scripts/figma/export-icons.mjs arrows weather
 *   FIGMA_TOKEN=xxxx node scripts/figma/export-icons.mjs all
 *
 * Notes:
 * - Set names and node maps come from scripts/figma/icon-sets.mjs
 * - Writes into `src/runtime/assets/icons/<set>/`
 * - Preserves icon names from the node map (Figma component names)
 * - Normalizes `stroke="black"` → `stroke="currentColor"` (and same for `fill="black"`)
 * - Reports orphan SVGs (on disk but not in the node map); deletes them only with --prune
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import {
  FILE_KEY,
  SETS,
  fetchWithRetry,
  iconDir,
  nodeMapPath,
  resolveSets,
} from './icon-sets.mjs'

const args = process.argv.slice(2)
const prune = args.includes('--prune')
const setArgs = args.filter(arg => arg !== '--prune')

let selectedSets
try {
  selectedSets = resolveSets(setArgs)
}
catch (error) {
  console.error(error.message)
  process.exit(1)
}
if (!selectedSets) {
  console.error(
    `Usage: FIGMA_TOKEN=xxxx node scripts/figma/export-icons.mjs <set...|all> [--prune]\nValid sets: ${Object.keys(SETS).join(', ')}`,
  )
  process.exit(1)
}

const token = process.env.FIGMA_TOKEN
if (!token) {
  console.error('Missing FIGMA_TOKEN env var.')
  process.exit(1)
}

function normalizeSvg(svg) {
  return svg
    .replaceAll('stroke="black"', 'stroke="currentColor"')
    .replaceAll('stroke=\'black\'', 'stroke=\'currentColor\'')
    .replaceAll('fill="black"', 'fill="currentColor"')
    .replaceAll('fill=\'black\'', 'fill=\'currentColor\'')
}

async function figmaImages(idsChunk) {
  const url = new URL(`https://api.figma.com/v1/images/${FILE_KEY}`)
  url.searchParams.set('ids', idsChunk.join(','))
  url.searchParams.set('format', 'svg')

  const res = await fetchWithRetry(url, {
    headers: {
      'X-Figma-Token': token,
    },
  })
  /** @type {{ err?: string | null, images?: Record<string, string | null> }} */
  const json = await res.json()
  if (json.err) throw new Error(`Figma images API error: ${json.err}`)
  if (!json.images) throw new Error('Figma images API: missing images field')
  return json.images
}

async function downloadSvg(url) {
  const res = await fetchWithRetry(url)
  return await res.text()
}

const chunkSize = 50 // Figma API supports multiple ids per request; keep conservative
let failedSets = 0

for (const selectedSet of selectedSets) {
  const dir = iconDir(selectedSet)
  /** @type {Record<string, string>} */
  const nodeMap = JSON.parse(await fs.readFile(nodeMapPath(selectedSet), 'utf8'))
  const ids = Object.keys(nodeMap)

  await fs.mkdir(dir, { recursive: true })

  let written = 0
  const missing = []

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize)
    const images = await figmaImages(chunk)

    for (const id of chunk) {
      const name = nodeMap[id]
      const assetUrl = images[id]
      if (!assetUrl) {
        missing.push({ id, name })
        continue
      }

      const rawSvg = await downloadSvg(assetUrl)
      const svg = normalizeSvg(rawSvg)
      const outPath = path.join(dir, `${name}.svg`)
      await fs.writeFile(outPath, svg, 'utf8')
      written += 1
    }
  }

  const mappedNames = new Set(Object.values(nodeMap))
  const orphans = (await fs.readdir(dir))
    .filter(file => file.endsWith('.svg') && !mappedNames.has(file.replace(/\.svg$/, '')))

  if (missing.length) {
    console.warn(`[${selectedSet}] Missing ${missing.length} icons from Figma export:`)
    for (const m of missing) console.warn(`- ${m.name} (${m.id})`)
    failedSets += 1
  }
  if (orphans.length) {
    console.warn(`[${selectedSet}] Orphan SVGs not in node map: ${orphans.join(', ')}`)
    if (prune) {
      for (const orphan of orphans) await fs.rm(path.join(dir, orphan))
      console.warn(`[${selectedSet}] Pruned ${orphans.length} orphan(s).`)
    }
  }

  console.log(`[${selectedSet}] Wrote ${written}/${ids.length} SVG icons to ${dir}`)
}

if (failedSets) process.exit(1)
