#!/usr/bin/env node
/**
 * Normalizes exported icon SVGs to the committed convention:
 *
 *   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="...">
 *     <path ... stroke="currentColor"/>
 *   </svg>
 *
 * Handles the deltas of Figma MCP asset exports vs the REST export:
 * - root `preserveAspectRatio` / `overflow` / `style` / percentage sizes
 * - a decorative `<g id="...">` wrapper around the icon content
 * - paints like `stroke="var(--stroke-0, black)"`, plain `black`, `#000`
 * - unreferenced `id` attributes
 *
 * Usage:
 *   node scripts/figma/normalize-icons.mjs <set...|all>
 *
 * Idempotent. Exits 1 on unparseable SVGs (no root tag / no viewBox);
 * everything else (leftover colors, orphans) is report-only.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { SETS, iconDir, nodeMapPath, resolveSets } from './icon-sets.mjs'

let selectedSets
try {
  selectedSets = resolveSets(process.argv.slice(2))
}
catch (error) {
  console.error(error.message)
  process.exit(1)
}
if (!selectedSets) {
  console.error(
    `Usage: node scripts/figma/normalize-icons.mjs <set...|all>\nValid sets: ${Object.keys(SETS).join(', ')}`,
  )
  process.exit(1)
}

const BLACK = /^(?:black|#000|#000000)$/i
const ROOT_DROP_ATTRS = new Set(['preserveaspectratio', 'overflow', 'style', 'width', 'height'])

/** Rewrites the opening <svg> tag to the fixed-size committed shape. */
function normalizeRoot(svg, fileLabel, problems) {
  const match = svg.match(/^([\s\S]*?)<svg\b([^>]*)>/)
  if (!match) {
    problems.push(`${fileLabel}: no <svg> root tag`)
    return null
  }
  const attrs = [...match[2].matchAll(/([a-z_:][\w:.-]*)\s*=\s*"([^"]*)"/gi)]
    .map(([, name, value]) => ({ name, value }))
  const viewBox = attrs.find(a => a.name.toLowerCase() === 'viewbox')?.value
  const viewBoxParts = viewBox?.trim().split(/[\s,]+/).map(Number)
  if (!viewBoxParts || viewBoxParts.length !== 4 || viewBoxParts.some(Number.isNaN)) {
    problems.push(`${fileLabel}: missing or invalid viewBox`)
    return null
  }
  const kept = attrs.filter(a => !ROOT_DROP_ATTRS.has(a.name.toLowerCase()))
  const rebuilt = [
    `width="${viewBoxParts[2]}"`,
    `height="${viewBoxParts[3]}"`,
    ...kept.map(a => `${a.name}="${a.value}"`),
  ].join(' ')
  return svg.replace(match[0], `${match[1]}<svg ${rebuilt}>`)
}

/** Unwraps decorative `<g id="...">` wrappers (sole attribute = id) around the whole content. */
function unwrapGroups(svg) {
  const wrapper = /^([\s\S]*?<svg\b[^>]*>)\s*<g id="[^"]*">([\s\S]*)<\/g>\s*(<\/svg>\s*)$/
  let result = svg
  for (let match = result.match(wrapper); match; match = result.match(wrapper)) {
    result = `${match[1]}\n${match[2].trim()}\n${match[3]}`
  }
  return result
}

/** black-ish paints (plain or `var(--x, black)` fallbacks) → currentColor. */
function normalizePaints(svg) {
  return svg
    .replace(/(stroke|fill)=(["'])var\(--[\w-]+\s*,([^)"']+)\)\2/gi, (full, attr, quote, fallback) =>
      BLACK.test(fallback.trim()) ? `${attr}=${quote}currentColor${quote}` : full)
    .replace(/(stroke|fill)=(["'])(black|#000|#000000)\2/gi, '$1=$2currentColor$2')
}

/** Strips `id` attributes whose value is never referenced via `#id` in the file. */
function stripUnreferencedIds(svg) {
  const referenced = new Set(
    [...svg.matchAll(/(?:url\(#|href="#|href='#)([\w:.-]+)/g)].map(([, id]) => id),
  )
  return svg.replace(/\s+id="([^"]*)"/g, (full, id) => (referenced.has(id) ? full : ''))
}

/** Collects remaining suspicious paints for the report. */
function auditPaints(svg) {
  const findings = new Set()
  for (const [, attr, value] of svg.matchAll(/(stroke|fill)="([^"]*)"/g)) {
    if (value !== 'currentColor' && value !== 'none') findings.add(`${attr}="${value}"`)
  }
  if (/<[^>]*\bstyle="/.test(svg)) findings.add('style="..."')
  return [...findings]
}

const problems = []
const leftovers = []

for (const set of selectedSets) {
  const dir = iconDir(set)
  let files
  try {
    files = (await fs.readdir(dir)).filter(file => file.endsWith('.svg')).sort()
  }
  catch {
    console.warn(`[${set}] icon dir missing, skipped: ${dir}`)
    continue
  }

  let changed = 0
  for (const file of files) {
    const filePath = path.join(dir, file)
    const original = await fs.readFile(filePath, 'utf8')

    const rooted = normalizeRoot(original, `${set}/${file}`, problems)
    if (rooted === null) continue
    let svg = normalizePaints(unwrapGroups(rooted))
    svg = stripUnreferencedIds(svg)
    if (!svg.endsWith('\n')) svg += '\n'

    if (svg !== original) {
      await fs.writeFile(filePath, svg, 'utf8')
      changed += 1
    }
    for (const finding of auditPaints(svg)) leftovers.push(`${set}/${file}: ${finding}`)
  }

  let orphanNote = ''
  try {
    /** @type {Record<string, string>} */
    const nodeMap = JSON.parse(await fs.readFile(nodeMapPath(set), 'utf8'))
    const mappedNames = new Set(Object.values(nodeMap))
    const orphans = files.filter(file => !mappedNames.has(file.replace(/\.svg$/, '')))
    if (orphans.length) orphanNote = `; orphans not in node map: ${orphans.join(', ')}`
  }
  catch {
    orphanNote = '; node map missing, orphan check skipped'
  }

  console.log(`[${set}] ${files.length} SVGs, ${changed} normalized${orphanNote}`)
}

if (leftovers.length) {
  console.warn(`\nLeftover non-currentColor paints (review manually):`)
  for (const line of leftovers) console.warn(`- ${line}`)
}
if (problems.length) {
  console.error(`\nUnparseable SVGs:`)
  for (const line of problems) console.error(`- ${line}`)
  process.exit(1)
}
